import { getRedisClient } from "../config/redis";
import { questionPaperRepository } from "../repositories/question-paper.repository";
import { IQuestionPaper } from "../models/question-paper.model";

const CACHE_TTL = 3600; // 1 hour 

function cacheKey(assignmentId: string): string {
  return `paper:${assignmentId}`;
}

export const paperService = {
  async getPaper(assignmentId: string): Promise<IQuestionPaper | null> {
    const redis = getRedisClient();
    const cached = await redis.get(cacheKey(assignmentId));
    if (cached) {
      return JSON.parse(cached) as IQuestionPaper;
    }
    const paper = await questionPaperRepository.findByAssignmentId(assignmentId);
    if (paper) {
      await redis.setex(cacheKey(assignmentId), CACHE_TTL, JSON.stringify(paper));
    }
    return paper;
  },

  async invalidateCache(assignmentId: string): Promise<void> {
    const redis = getRedisClient();
    await redis.del(cacheKey(assignmentId));
  },

  async setCached(assignmentId: string, paper: IQuestionPaper): Promise<void> {
    const redis = getRedisClient();
    await redis.setex(cacheKey(assignmentId), CACHE_TTL, JSON.stringify(paper));
  },
};
