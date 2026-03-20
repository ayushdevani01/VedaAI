import { assignmentRepository, CreateAssignmentData } from "../repositories/assignment.repository";
import { generationQueue } from "../queues/generation.queue";
import { IAssignment } from "../models/assignment.model";

export const assignmentService = {
  async createAssignment(
    data: CreateAssignmentData,
    fileUrl?: string
  ): Promise<{ assignmentId: string; jobId: string; status: string }> {
    const assignment = await assignmentRepository.create({
      ...data,
      fileUrl,
      status: "pending",
    } as CreateAssignmentData & { status?: string });

    const assignmentId = (assignment._id as object).toString();

    const job = await generationQueue.add("generate", {
      assignmentId,
      type: "generate",
    });

    await assignmentRepository.updateJobId(assignmentId, job.id as string);

    return { assignmentId, jobId: job.id as string, status: "processing" };
  },

  async listAssignments(): Promise<IAssignment[]> {
    return assignmentRepository.findAll();
  },

  async getAssignment(id: string): Promise<IAssignment | null> {
    return assignmentRepository.findById(id);
  },

  async deleteAssignment(id: string): Promise<boolean> {
    return assignmentRepository.delete(id);
  },
};
