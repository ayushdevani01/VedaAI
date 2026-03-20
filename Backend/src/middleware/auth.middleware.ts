import { Request, Response, NextFunction } from "express";
import { authService } from "../services/auth.service";
import { AuthTokenPayload } from "../services/auth.service";

export interface AuthRequest extends Request {
  user?: AuthTokenPayload;
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ success: false, error: "Missing or invalid token" });
    return;
  }
  const token = header.slice(7);
  try {
    req.user = authService.verifyToken(token);
    next();
  } catch {
    res.status(401).json({ success: false, error: "Token expired or invalid" });
  }
}
