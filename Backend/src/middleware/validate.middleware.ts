import { Request, Response, NextFunction } from "express";
import { z, ZodTypeAny } from "zod";

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: result.error.flatten(),
      });
      return;
    }
    req.body = result.data;
    next();
  };
}

// Common validation schemas
export const QuestionTypeEnum = z.enum(["MCQ", "ShortAnswer", "LongAnswer", "TrueFalse", "FillInBlanks"]);

export const QuestionTypeConfigSchema = z.object({
  type: QuestionTypeEnum,
  numQuestions: z.number().int().min(1, "Must have at least 1 question"),
  marksPerQuestion: z.number().min(0.5, "Marks must be positive"),
});

export const CreateAssignmentBodySchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  dueDate: z.string().min(1, "Due date is required"),
  questionTypeConfigs: z
    .string()
    .transform((val) => {
      try { return JSON.parse(val) as unknown; }
      catch { throw new Error("questionTypeConfigs must be valid JSON"); }
    })
    .pipe(z.array(QuestionTypeConfigSchema).min(1, "At least one question type required")),
  additionalInstructions: z.string().optional(),
  grade: z.string().optional(),
  topic: z.string().optional(),
  chapter: z.string().optional(),
  durationMinutes: z
    .string()
    .optional()
    .transform((v) => (v ? parseInt(v, 10) : undefined)),
  bloomLevel: z.string().optional(),
  includeAnswerKey: z
    .string()
    .optional()
    .transform((v) => v === "true"),
  includeRubric: z
    .string()
    .optional()
    .transform((v) => v === "true"),
});

export const RefineBodySchema = z.object({
  instruction: z.string().min(1, "Refinement instruction is required"),
});

export const RegenerateSectionBodySchema = z.object({
  sectionIndex: z.number().int().nonnegative(),
});

export const RegenerateQuestionBodySchema = z.object({
  sectionIndex: z.number().int().nonnegative(),
  questionIndex: z.number().int().nonnegative(),
  instruction: z.string().optional(),
});
