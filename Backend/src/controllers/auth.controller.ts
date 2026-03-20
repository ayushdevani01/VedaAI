import { Request, Response } from "express";
import { asyncHandler } from "../middleware/error.middleware";
import { authService } from "../services/auth.service";
import { z } from "zod";

const RegisterSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  school: z.string().optional(),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

const UpdateProfileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  school: z.string().optional(),
});

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    const parsed = RegisterSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "Validation failed", details: parsed.error.flatten() });
      return;
    }
    const { name, email, password, school } = parsed.data;
    const result = await authService.register(name, email, password, school);
    res.status(201).json({ success: true, data: result });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    const parsed = LoginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "Validation failed" });
      return;
    }
    const { email, password } = parsed.data;
    const result = await authService.login(email, password);
    res.json({ success: true, data: result });
  }),

  me: asyncHandler(async (req: Request & { user?: { userId: string; name: string; email: string; role: string; school?: string } }, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }
    res.json({ success: true, data: req.user });
  }),

  updateProfile: asyncHandler(async (req: Request & { user?: { userId: string } }, res: Response) => {
    if (!req.user) {
      res.status(401).json({ success: false, error: "Not authenticated" });
      return;
    }
    const parsed = UpdateProfileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ success: false, error: "Validation failed" });
      return;
    }
    const { name, school } = parsed.data;
    const result = await authService.updateProfile(req.user.userId, name, school);
    res.json({ success: true, data: result });
  }),
};
