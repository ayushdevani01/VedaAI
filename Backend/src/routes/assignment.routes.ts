import { Router } from "express";
import { assignmentController } from "../controllers/assignment.controller";
import { uploadMiddleware } from "../middleware/upload.middleware";
import { validateBody, CreateAssignmentBodySchema } from "../middleware/validate.middleware";

const router = Router();

// POST /api/assignments/parse-voice – MUST be before /:id param routes
router.post("/parse-voice", assignmentController.parseVoice);

// POST /api/assignments – create + enqueue with optional file upload
router.post(
  "/",
  uploadMiddleware.single("file"),
  validateBody(CreateAssignmentBodySchema),
  assignmentController.create
);

// GET /api/assignments – list all
router.get("/", assignmentController.list);

// GET /api/assignments/:id – single assignment
router.get("/:id", assignmentController.getOne);

// DELETE /api/assignments/:id – delete assignment + paper
router.delete("/:id", assignmentController.delete);

export default router;
