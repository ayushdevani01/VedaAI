import mongoose from "mongoose";
import { QuestionPaper, IQuestionPaper, ISection } from "../models/question-paper.model";

export interface CreatePaperData {
  assignmentId: string;
  sections: ISection[];
  totalMarks: number;
}

export const questionPaperRepository = {
  async create(data: CreatePaperData): Promise<IQuestionPaper> {
    const paper = new QuestionPaper({
      ...data,
      assignmentId: new mongoose.Types.ObjectId(data.assignmentId),
      generatedAt: new Date(),
    });
    return paper.save();
  },

  async findByAssignmentId(assignmentId: string): Promise<IQuestionPaper | null> {
    if (!mongoose.isValidObjectId(assignmentId)) return null;
    return QuestionPaper.findOne({ assignmentId }).lean<IQuestionPaper>();
  },

  async upsert(assignmentId: string, sections: ISection[], totalMarks: number): Promise<IQuestionPaper> {
    const existing = await QuestionPaper.findOne({ assignmentId });
    if (existing) {
      existing.sections = sections;
      existing.totalMarks = totalMarks;
      existing.generatedAt = new Date();
      return existing.save();
    }
    return this.create({ assignmentId, sections, totalMarks });
  },

  async deleteByAssignmentId(assignmentId: string): Promise<void> {
    await QuestionPaper.deleteOne({ assignmentId });
  },
};
