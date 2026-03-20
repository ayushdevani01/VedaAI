import { Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { assignmentService } from "../services/assignment.service";
import { generationQueue } from "../queues/generation.queue";
import { questionPaperRepository } from "../repositories/question-paper.repository";
import { parseVoiceTranscript } from "../services/llm.service";

export const assignmentController = {
  create: asyncHandler(async (req: Request, res: Response) => {
    const fileUrl = req.file?.path;
    const result = await assignmentService.createAssignment(req.body, fileUrl);
    res.status(201).json({ success: true, data: result });
  }),

  list: asyncHandler(async (_req: Request, res: Response) => {
    const assignments = await assignmentService.listAssignments();
    const mapped = assignments.map((a) => ({
      id: (a._id as object).toString(),
      title: a.title,
      subject: a.subject,
      dueDate: a.dueDate,
      status: a.status,
      createdAt: a.createdAt,
      updatedAt: a.updatedAt,
      totalQuestions: a.questionTypeConfigs.reduce((sum, c) => sum + c.numQuestions, 0),
      totalMarks: a.questionTypeConfigs.reduce((sum, c) => sum + c.numQuestions * c.marksPerQuestion, 0),
    }));
    res.json({ success: true, data: mapped });
  }),

  getOne: asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const assignment = await assignmentService.getAssignment(id);
    if (!assignment) {
      res.status(404).json({ success: false, error: "Assignment not found" });
      return;
    }
    res.json({ success: true, data: { ...assignment, id: (assignment._id as object).toString() } });
  }),

  delete: asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const deleted = await assignmentService.deleteAssignment(id);
    await questionPaperRepository.deleteByAssignmentId(id);
    if (!deleted) {
      res.status(404).json({ success: false, error: "Assignment not found" });
      return;
    }
    res.json({ success: true, message: "Assignment deleted" });
  }),

  parseVoice: asyncHandler(async (req: Request, res: Response) => {
    const { transcript } = req.body as { transcript: string };
    if (!transcript?.trim()) {
      res.status(400).json({ success: false, error: "Transcript is required" });
      return;
    }
    const parsed = await parseVoiceTranscript(transcript);
    res.json({ success: true, data: parsed });
  }),

  enqueueRefine: asyncHandler(async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const { instruction } = req.body as { instruction: string };
    const job = await generationQueue.add("refine", {
      assignmentId: id,
      type: "refine",
      refinementInstruction: instruction,
    });
    res.json({ success: true, data: { jobId: job.id } });
  }),
};
