import { IAssignment } from "../models/assignment.model";

export function buildGenerationPrompt(assignment: IAssignment, fileContext?: string): string {
  const questionDetails = assignment.questionTypeConfigs
    .map(
      (cfg) =>
        `- ${cfg.numQuestions} × ${cfg.type} questions, ${cfg.marksPerQuestion} mark(s) each`
    )
    .join("\n");

  const contextBlock = fileContext
    ? `\nReference material provided by the teacher:\n"""\n${fileContext}\n"""\n`
    : "";

  const extras: string[] = [];
  if (assignment.grade) extras.push(`Grade: ${assignment.grade}`);
  if (assignment.topic) extras.push(`Topic: ${assignment.topic}`);
  if (assignment.chapter) extras.push(`Chapter: ${assignment.chapter}`);
  if (assignment.durationMinutes) extras.push(`Duration: ${assignment.durationMinutes} minutes`);
  if (assignment.bloomLevel) extras.push(`Bloom's Taxonomy Level: ${assignment.bloomLevel}`);
  if (assignment.includeAnswerKey) extras.push("Include answer for every question.");
  if (assignment.includeRubric) extras.push("Include rubric (array of marking criteria) for Long Answer and Case Study questions.");

  return `You are an expert exam paper creator for school teachers.

Generate a complete structured question paper as a single valid JSON object. Return ONLY the JSON — no markdown, no code fences, no commentary.

The JSON must follow this exact schema:
{
  "sections": [
    {
      "title": "string (e.g. Section A – Multiple Choice)",
      "instruction": "string (instructions for students)",
      "questions": [
        {
          "text": "string",
          "type": "MCQ" | "ShortAnswer" | "LongAnswer" | "TrueFalse" | "FillInBlanks",
          "difficulty": "easy" | "medium" | "hard",
          "marks": number,
          "options": ["A", "B", "C", "D"] (only for MCQ/TrueFalse),
          "answer": "string (model answer)" (include if applicable),
          "rubric": ["criterion 1", "criterion 2"] (only for long-form questions when rubric requested)
        }
      ]
    }
  ],
  "totalMarks": number
}

Assignment details:
- Title: ${assignment.title}
- Subject: ${assignment.subject}
- Due date: ${assignment.dueDate}
${extras.join("\n")}

Question composition (generate one section per question type):
${questionDetails}

Additional instructions from teacher:
${assignment.additionalInstructions || "None."}
${contextBlock}
Rules:
- Vary difficulty across questions (mix easy, medium, hard appropriately)
- Ensure question text is clear, concise, and age-appropriate
- MCQ/TrueFalse questions MUST include an "options" array
- totalMarks must equal the sum of all question marks
- Group each question type into its own section
- DO NOT use any markdown syntax (like **bold** or *italics*) in the generated strings. Provide pure plaintext only.
- Return ONLY the JSON object, nothing else`;
}

export function buildRefinePrompt(
  currentPaperJson: string,
  refinementInstruction: string
): string {
  return `You are an expert exam paper editor.

You have been given an existing question paper as JSON and an instruction to improve it.
Apply the instruction and return the updated question paper as a single valid JSON object.
Return ONLY the JSON — no markdown, no code fences, no commentary.

Keep the same JSON schema:
{ "sections": [...], "totalMarks": number }

Refinement instruction: "${refinementInstruction}"

CRITICAL RULE:
DO NOT use any markdown syntax (like **bold** or *italics*) in the generated strings. Provide pure plaintext only.

Current paper:
${currentPaperJson}`;
}

export function buildSectionRegeneratePrompt(
  sectionTitle: string,
  sectionInstruction: string,
  questionCount: number,
  marksEach: number,
  questionType: string,
  subject: string,
  includeAnswerKey: boolean,
  includeRubric: boolean
): string {
  const extras: string[] = [];
  if (includeAnswerKey) extras.push("- Include an 'answer' property for every question containing the model solution.");
  if (includeRubric) extras.push("- Include a 'rubric' array property containing concise marking criteria for every question.");

  return `You are an expert exam paper creator.

Regenerate a single section of a question paper as a JSON object.
Return ONLY the JSON — no markdown, no code fences.

Schema:
{
  "title": "string",
  "instruction": "string",
  "questions": [{ "text": "...", "type": "...", "difficulty": "...", "marks": number, "options": [], "answer": "...", "rubric": [] }]
}

Section to regenerate:
- Title: ${sectionTitle}
- Instruction: ${sectionInstruction}
- Question type: ${questionType}
- Number of questions: ${questionCount}
- Marks per question: ${marksEach}
- Subject: ${subject}

Requirements:
${extras.join("\n")}

CRITICAL RULE:
DO NOT use any markdown syntax (like **bold** or *italics*) in the generated strings. Provide pure plaintext only.

Generate fresh questions (different from typical examples). Return ONLY the JSON section object.`;
}

export function buildQuestionRegeneratePrompt(
  sectionTitle: string,
  questionType: string,
  subject: string,
  currentQuestionJson: string,
  instruction?: string,
  includeAnswerKey?: boolean,
  includeRubric?: boolean
): string {
  const extras: string[] = [];
  if (includeAnswerKey) extras.push("- Include an 'answer' property containing the model solution.");
  if (includeRubric) extras.push("- Include a 'rubric' array property containing concise marking criteria.");

  const instructionBlock = instruction ? `Teacher's specific instruction for regeneration: "${instruction}"` : "Generate a fresh, improved version of this question.";

  return `You are an expert exam paper creator.

Regenerate a SINGLE question as a JSON object.
Return ONLY the JSON — no markdown, no code fences.

Schema:
{
  "text": "string",
  "type": "${questionType}",
  "difficulty": "easy|medium|hard",
  "marks": number,
  "options": [] (if MCQ/TrueFalse),
  "answer": "string" (if requested),
  "rubric": [] (if requested)
}

Context:
- Subject: ${subject}
- Section: ${sectionTitle}

${instructionBlock}

Current question to replace:
${currentQuestionJson}

Requirements:
${extras.join("\n")}

CRITICAL RULE:
DO NOT use any markdown syntax (like **bold** or *italics*) in the generated strings. Provide pure plaintext only.
Return ONLY the JSON object representing the newly generated question.`;
}
