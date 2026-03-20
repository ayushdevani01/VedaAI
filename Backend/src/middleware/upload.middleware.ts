import multer from "multer";
import path from "path";
import fs from "fs";
import { env } from "../config/env";

const ALLOWED_MIMES = ["application/pdf", "text/plain"];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

// Ensure upload directory exists
if (!fs.existsSync(env.uploadDir)) {
  fs.mkdirSync(env.uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, env.uploadDir);
  },
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

export const uploadMiddleware = multer({
  storage,
  limits: { fileSize: MAX_SIZE },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIMES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type not allowed. Accepted: PDF, text`));
    }
  },
});
