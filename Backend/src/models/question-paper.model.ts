import mongoose, { Document, Schema } from "mongoose";

export type Difficulty = "easy" | "medium" | "hard";
export type QuestionType =
  | "MCQ"
  | "ShortAnswer"
  | "LongAnswer"
  | "TrueFalse"
  | "FillInBlanks";

export interface IQuestion {
  text: string;
  type: QuestionType;
  difficulty: Difficulty;
  marks: number;
  options?: string[];
  answer?: string;
  rubric?: string[];
}

export interface ISection {
  title: string;
  instruction: string;
  questions: IQuestion[];
}

export interface IQuestionPaper extends Document {
  assignmentId: mongoose.Types.ObjectId;
  sections: ISection[];
  totalMarks: number;
  generatedAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    text: { type: String, required: true },
    type: {
      type: String,
      enum: ["MCQ", "ShortAnswer", "LongAnswer", "TrueFalse", "FillInBlanks"],
      required: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      required: true,
    },
    marks: { type: Number, required: true, min: 0 },
    options: [{ type: String }],
    answer: { type: String },
    rubric: [{ type: String }],
  },
  { _id: false }
);

const SectionSchema = new Schema<ISection>(
  {
    title: { type: String, required: true },
    instruction: { type: String, required: true },
    questions: { type: [QuestionSchema], required: true },
  },
  { _id: false }
);

const QuestionPaperSchema = new Schema<IQuestionPaper>({
  assignmentId: {
    type: Schema.Types.ObjectId,
    ref: "Assignment",
    required: true,
    unique: true,
    index: true,
  },
  sections: { type: [SectionSchema], required: true },
  totalMarks: { type: Number, required: true },
  generatedAt: { type: Date, default: Date.now },
});

export const QuestionPaper = mongoose.model<IQuestionPaper>(
  "QuestionPaper",
  QuestionPaperSchema
);
