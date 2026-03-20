import { Router } from "express";
import { paperController } from "../controllers/paper.controller";
import { validateBody, RefineBodySchema, RegenerateSectionBodySchema, RegenerateQuestionBodySchema } from "../middleware/validate.middleware";

const router = Router();

// GET /api/papers/:assignmentId – fetch paper (Redis cache → MongoDB)
router.get("/:assignmentId", paperController.getPaper);

// POST /api/papers/:assignmentId/refine – refine with instruction
router.post("/:assignmentId/refine", validateBody(RefineBodySchema), paperController.refine);

// POST /api/papers/:assignmentId/regenerate – regenerate entire paper
router.post("/:assignmentId/regenerate", paperController.regenerate);

// POST /api/papers/:assignmentId/regenerate-section – regenerate single section
router.post(
  "/:assignmentId/regenerate-section",
  validateBody(RegenerateSectionBodySchema),
  paperController.regenerateSection
);

// POST /api/papers/:assignmentId/regenerate-question
router.post(
  "/:assignmentId/regenerate-question",
  validateBody(RegenerateQuestionBodySchema),
  paperController.regenerateQuestion
);

export default router;
