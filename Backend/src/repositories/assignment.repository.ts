import { Assignment, AssignmentStatus, IAssignment, IQuestionTypeConfig } from "../models/assignment.model";
import mongoose from "mongoose";

export interface CreateAssignmentData {
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
}

export const assignmentRepository = {
  async create(data: CreateAssignmentData): Promise<IAssignment> {
    const assignment = new Assignment(data);
    return assignment.save();
  },

  async findAll(): Promise<IAssignment[]> {
    return Assignment.find().sort({ createdAt: -1 }).lean<IAssignment[]>();
  },

  async findById(id: string): Promise<IAssignment | null> {
    if (!mongoose.isValidObjectId(id)) return null;
    return Assignment.findById(id).lean<IAssignment>();
  },

  async updateStatus(id: string, status: AssignmentStatus): Promise<void> {
    await Assignment.findByIdAndUpdate(id, { status });
  },

  async updateJobId(id: string, jobId: string): Promise<void> {
    await Assignment.findByIdAndUpdate(id, { jobId, status: "processing" });
  },

  async delete(id: string): Promise<boolean> {
    if (!mongoose.isValidObjectId(id)) return false;
    const result = await Assignment.findByIdAndDelete(id);
    return result !== null;
  },
};
