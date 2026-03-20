import { Router } from "express";
import { authController } from "../controllers/auth.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

// POST /api/auth/register
router.post("/register", authController.register);

// POST /api/auth/login
router.post("/login", authController.login);

// GET /api/auth/me – requires auth
router.get("/me", authenticate, authController.me);

// PATCH /api/auth/me - requires auth
router.patch("/me", authenticate, authController.updateProfile);

export default router;
