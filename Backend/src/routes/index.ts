import { Router, Request, Response } from "express";
import authRoutes from "./auth.routes";
import assignmentRoutes from "./assignment.routes";
import paperRoutes from "./paper.routes";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// Public
router.use("/auth", authRoutes);

// Protected – require JWT
router.use("/assignments", authenticate, assignmentRoutes);
router.use("/papers", authenticate, paperRoutes);

router.get("/health", (_req: Request, res: Response) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

export default router;
