import mongoose, { Document, Schema } from "mongoose";

export type AssignmentStatus = "pending" | "processing" | "ready" | "failed";

export type QuestionType =
  | "MCQ"
  | "ShortAnswer"
  | "LongAnswer"
  | "TrueFalse"
  | "FillInBlanks";

export interface IQuestionTypeConfig {
  type: QuestionType;
  numQuestions: number;
  marksPerQuestion: number;
}

export interface IAssignment extends Document {
  title: string;
  subject: string;
  dueDate: string;
  questionTypeConfigs: IQuestionTypeConfig[];
  additionalInstructions?: string;
  grade?: string;
  topic?: string;
  chapter?: string;
  durationMinutes?: number;
  bloomLevel?: string;
  includeAnswerKey?: boolean;
  includeRubric?: boolean;
  fileUrl?: string;
  status: AssignmentStatus;
  jobId?: string;
  createdAt: Date;
  updatedAt: Date;
}

const QuestionTypeConfigSchema = new Schema<IQuestionTypeConfig>(
  {
    type: {
      type: String,
      enum: ["MCQ", "ShortAnswer", "LongAnswer", "TrueFalse", "FillInBlanks"],
      required: true,
    },
    numQuestions: { type: Number, required: true, min: 1 },
    marksPerQuestion: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const AssignmentSchema = new Schema<IAssignment>(
  {
    title: { type: String, required: true, trim: true },
    subject: { type: String, required: true, trim: true },
    dueDate: { type: String, required: true },
    questionTypeConfigs: { type: [QuestionTypeConfigSchema], required: true },
    additionalInstructions: { type: String },
    grade: { type: String },
    topic: { type: String },
    chapter: { type: String },
    durationMinutes: { type: Number },
    bloomLevel: { type: String },
    includeAnswerKey: { type: Boolean, default: false },
    includeRubric: { type: Boolean, default: false },
    fileUrl: { type: String },
    status: {
      type: String,
      enum: ["pending", "processing", "ready", "failed"],
      default: "pending",
    },
    jobId: { type: String },
  },
  { timestamps: true }
);

export const Assignment = mongoose.model<IAssignment>(
  "Assignment",
  AssignmentSchema
);
