import { Queue } from "bullmq";
import { redisConnection } from "../config/redis";

export interface GenerationJobData {
  assignmentId: string;
  type: "generate" | "refine" | "regenerate" | "regenerate-section" | "regenerate-question";
  refinementInstruction?: string;
  sectionIndex?: number;
  questionIndex?: number;
}

export const generationQueue = new Queue<GenerationJobData>("generation", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 2,
    backoff: { type: "exponential", delay: 3000 },
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
});
