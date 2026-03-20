import { Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { paperService } from "../services/paper.service";
import { generationQueue } from "../queues/generation.queue";
import { assignmentRepository } from "../repositories/assignment.repository";

export const paperController = {
  getPaper: asyncHandler(async (req: Request, res: Response) => {
    const assignmentId = req.params.assignmentId as string;
    const paper = await paperService.getPaper(assignmentId);
    if (!paper) {
      res.status(404).json({ success: false, error: "Paper not found or not yet generated" });
      return;
    }
    res.json({
      success: true,
      data: {
        assignmentId: paper.assignmentId.toString(),
        sections: paper.sections,
        totalMarks: paper.totalMarks,
        generatedAt: paper.generatedAt,
      },
    });
  }),

  refine: asyncHandler(async (req: Request, res: Response) => {
    const assignmentId = req.params.assignmentId as string;
    const { instruction } = req.body as { instruction: string };

    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      res.status(404).json({ success: false, error: "Assignment not found" });
      return;
    }

    await assignmentRepository.updateStatus(assignmentId, "processing");
    const job = await generationQueue.add("refine", {
      assignmentId,
      type: "refine",
      refinementInstruction: instruction,
    });

    res.json({ success: true, data: { jobId: job.id, status: "processing" } });
  }),

  regenerate: asyncHandler(async (req: Request, res: Response) => {
    const assignmentId = req.params.assignmentId as string;

    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      res.status(404).json({ success: false, error: "Assignment not found" });
      return;
    }

    await assignmentRepository.updateStatus(assignmentId, "processing");
    await paperService.invalidateCache(assignmentId);

    const job = await generationQueue.add("regenerate", {
      assignmentId,
      type: "regenerate",
    });

    res.json({ success: true, data: { jobId: job.id, status: "processing" } });
  }),

  regenerateSection: asyncHandler(async (req: Request, res: Response) => {
    const assignmentId = req.params.assignmentId as string;
    const { sectionIndex } = req.body as { sectionIndex: number };

    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      res.status(404).json({ success: false, error: "Assignment not found" });
      return;
    }

    const job = await generationQueue.add("regenerate-section", {
      assignmentId,
      type: "regenerate-section",
      sectionIndex,
    });

    res.json({ success: true, data: { jobId: job.id, status: "processing" } });
  }),

  regenerateQuestion: asyncHandler(async (req: Request, res: Response) => {
    const assignmentId = req.params.assignmentId as string;
    const { sectionIndex, questionIndex, instruction } = req.body as { sectionIndex: number, questionIndex: number, instruction?: string };

    const assignment = await assignmentRepository.findById(assignmentId);
    if (!assignment) {
      res.status(404).json({ success: false, error: "Assignment not found" });
      return;
    }

    const job = await generationQueue.add("regenerate-question", {
      assignmentId,
      type: "regenerate-question",
      sectionIndex,
      questionIndex,
      refinementInstruction: instruction,
    });

    res.json({ success: true, data: { jobId: job.id, status: "processing" } });
  }),
};
