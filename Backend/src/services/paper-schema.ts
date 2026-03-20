import { z } from "zod";

const DifficultySchema = z.preprocess(
  (val) => typeof val === "string" ? val.toLowerCase() : val,
  z.enum(["easy", "medium", "hard"])
);
const QuestionTypeSchema = z.enum(["MCQ", "ShortAnswer", "LongAnswer", "TrueFalse", "FillInBlanks"]);

export const QuestionSchema = z.object({
  text: z.string().min(1),
  type: QuestionTypeSchema,
  difficulty: DifficultySchema,
  marks: z.number().nonnegative(),
  options: z.array(z.string()).optional(),
  answer: z.string().optional(),
  rubric: z.preprocess((val) => typeof val === "string" ? [val] : val, z.array(z.string()).optional()),
});

const SectionSchema = z.object({
  title: z.string().min(1),
  instruction: z.string().min(1),
  questions: z.array(QuestionSchema).min(1),
});

export const GeneratedPaperSchema = z.object({
  sections: z.array(SectionSchema).min(1),
  totalMarks: z.number().nonnegative(),
});

export const GeneratedSectionSchema = SectionSchema;

export type GeneratedPaper = z.infer<typeof GeneratedPaperSchema>;
export type GeneratedSection = z.infer<typeof GeneratedSectionSchema>;
export type Question = z.infer<typeof QuestionSchema>;
