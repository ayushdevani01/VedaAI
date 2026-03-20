import { Worker, Job } from "bullmq";
import { redisConnection } from "../config/redis";
import { GenerationJobData } from "../queues/generation.queue";
import { assignmentRepository } from "../repositories/assignment.repository";
import { questionPaperRepository } from "../repositories/question-paper.repository";
import { paperService } from "../services/paper.service";
import { generatePaper, generateSection, generateQuestion } from "../services/llm.service";
import {
  buildGenerationPrompt,
  buildRefinePrompt,
  buildSectionRegeneratePrompt,
  buildQuestionRegeneratePrompt
} from "../services/prompt-builder.service";
import { emitToAssignment } from "../socket/socket";
import fs from "fs";
import path from "path";

async function readFileContext(fileUrl?: string): Promise<string | undefined> {
  if (!fileUrl) return undefined;
  try {
    const filePath = path.resolve(fileUrl);
    const ext = path.extname(filePath).toLowerCase();
    if (ext === ".txt") {
      return fs.readFileSync(filePath, "utf-8").slice(0, 3000);
    }
    if (ext === ".pdf") {
      const pdfParse = await import("pdf-parse");
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse.default(buffer);
      return data.text.slice(0, 3000);
    }
  } catch {
    console.warn("[Worker] Could not read file context:", fileUrl);
  }
  return undefined;
}

async function handleGenerate(assignmentId: string): Promise<void> {
  const assignment = await assignmentRepository.findById(assignmentId);
  if (!assignment) throw new Error(`Assignment ${assignmentId} not found`);

  emitToAssignment(assignmentId, "job:processing", {
    assignmentId,
    message: "Building your question paper with AI...",
  });

  const fileContext = await readFileContext(assignment.fileUrl);
  const prompt = buildGenerationPrompt(assignment, fileContext);
  const generatedPaper = await generatePaper(prompt);

  const paper = await questionPaperRepository.upsert(
    assignmentId,
    generatedPaper.sections,
    generatedPaper.totalMarks
  );

  await assignmentRepository.updateStatus(assignmentId, "ready");
  await paperService.setCached(assignmentId, paper);

  emitToAssignment(assignmentId, "paper:ready", {
    assignmentId,
    totalMarks: generatedPaper.totalMarks,
    sectionCount: generatedPaper.sections.length,
  });
}

async function handleRefine(
  assignmentId: string,
  refinementInstruction: string
): Promise<void> {
  const existing = await questionPaperRepository.findByAssignmentId(assignmentId);
  if (!existing) throw new Error(`No paper found for assignment ${assignmentId}`);

  emitToAssignment(assignmentId, "job:processing", {
    assignmentId,
    message: "Applying your refinement...",
  });

  const currentJson = JSON.stringify({ sections: existing.sections, totalMarks: existing.totalMarks });
  const prompt = buildRefinePrompt(currentJson, refinementInstruction);
  const refined = await generatePaper(prompt);

  const paper = await questionPaperRepository.upsert(assignmentId, refined.sections, refined.totalMarks);
  await assignmentRepository.updateStatus(assignmentId, "ready");
  await paperService.invalidateCache(assignmentId);
  await paperService.setCached(assignmentId, paper);

  emitToAssignment(assignmentId, "paper:updated", { assignmentId });
}

async function handleRegenerateFull(assignmentId: string): Promise<void> {
  await handleGenerate(assignmentId);
}

async function handleRegenerateSection(
  assignmentId: string,
  sectionIndex: number
): Promise<void> {
  const assignment = await assignmentRepository.findById(assignmentId);
  const existing = await questionPaperRepository.findByAssignmentId(assignmentId);
  if (!assignment || !existing) throw new Error("Assignment or paper not found");

  const section = existing.sections[sectionIndex];
  if (!section) throw new Error(`Section index ${sectionIndex} not found`);

  emitToAssignment(assignmentId, "job:processing", {
    assignmentId,
    message: `Regenerating ${section.title}...`,
  });

  const config = assignment.questionTypeConfigs[sectionIndex] || assignment.questionTypeConfigs[0];
  const prompt = buildSectionRegeneratePrompt(
    section.title,
    section.instruction,
    config.numQuestions,
    config.marksPerQuestion,
    config.type,
    assignment.subject,
    assignment.includeAnswerKey ?? false,
    assignment.includeRubric ?? false
  );

  const newSection = await generateSection(prompt);
  const updatedSections = [...existing.sections];
  updatedSections[sectionIndex] = newSection;

  const totalMarks = updatedSections.reduce(
    (sum, s) => sum + s.questions.reduce((q, qu) => q + qu.marks, 0),
    0
  );

  const paper = await questionPaperRepository.upsert(assignmentId, updatedSections, totalMarks);
  await paperService.invalidateCache(assignmentId);
  await paperService.setCached(assignmentId, paper);

  emitToAssignment(assignmentId, "paper:updated", {
    assignmentId,
    sectionIndex,
    sectionTitle: newSection.title,
  });
}

async function handleRegenerateQuestion(
  assignmentId: string,
  sectionIndex: number,
  questionIndex: number,
  instruction?: string
): Promise<void> {
  const assignment = await assignmentRepository.findById(assignmentId);
  const existing = await questionPaperRepository.findByAssignmentId(assignmentId);
  
  if (!assignment || !existing) throw new Error("Assignment or paper not found");

  const section = existing.sections[sectionIndex];
  if (!section) throw new Error(`Section index ${sectionIndex} not found`);

  const question = section.questions[questionIndex];
  if (!question) throw new Error(`Question index ${questionIndex} not found`);

  emitToAssignment(assignmentId, "job:processing", {
    assignmentId,
    message: `Regenerating question...`,
  });

  const prompt = buildQuestionRegeneratePrompt(
    section.title,
    question.type,
    assignment.subject,
    JSON.stringify(question, null, 2),
    instruction,
    assignment.includeAnswerKey ?? false,
    assignment.includeRubric ?? false
  );

  const newQuestion = await generateQuestion(prompt);

  // Directly transplant the newly generated question at the specific array index
  const updatedSections = [...existing.sections];
  updatedSections[sectionIndex].questions[questionIndex] = newQuestion;

  const totalMarks = updatedSections.reduce(
    (sum, s) => sum + s.questions.reduce((q, qu) => q + qu.marks, 0),
    0
  );

  const paper = await questionPaperRepository.upsert(assignmentId, updatedSections, totalMarks);
  await paperService.invalidateCache(assignmentId);
  await paperService.setCached(assignmentId, paper);

  emitToAssignment(assignmentId, "paper:updated", { assignmentId });
}

export function startGenerationWorker(): Worker {
  const worker = new Worker<GenerationJobData>(
    "generation",
    async (job: Job<GenerationJobData>) => {
      const { assignmentId, type, refinementInstruction, sectionIndex, questionIndex } = job.data;
      console.log(`[Worker] Processing job ${job.id} type=${type} assignmentId=${assignmentId}`);

      try {
        switch (type) {
          case "generate":
            await handleGenerate(assignmentId);
            break;
          case "refine":
            await handleRefine(assignmentId, refinementInstruction || "improve the paper");
            break;
          case "regenerate":
            await handleRegenerateFull(assignmentId);
            break;
          case "regenerate-section":
            await handleRegenerateSection(assignmentId, sectionIndex ?? 0);
            break;
          case "regenerate-question":
            if (sectionIndex === undefined || questionIndex === undefined) {
               throw new Error("Missing indices for question regeneration");
            }
            await handleRegenerateQuestion(assignmentId, sectionIndex, questionIndex, refinementInstruction);
            break;
          default:
            throw new Error(`Unknown job type: ${type}`);
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(`[Worker] Job ${job.id} failed:`, message);
        await assignmentRepository.updateStatus(assignmentId, "failed");
        emitToAssignment(assignmentId, "job:failed", { assignmentId, error: message });
        throw err; // re-throw so BullMQ marks the job as failed
      }
    },
    {
      connection: redisConnection,
      concurrency: 3,
    }
  );

  worker.on("completed", (job) => console.log(`[Worker] Job ${job.id} completed`));
  worker.on("failed", (job, err) => console.error(`[Worker] Job ${job?.id} failed:`, err.message));

  return worker;
}
