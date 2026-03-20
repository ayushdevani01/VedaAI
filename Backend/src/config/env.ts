import dotenv from "dotenv";
dotenv.config();

function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env var: ${key}`);
  return val;
}

export const env = {
  port: parseInt(process.env.PORT || "4000", 10),
  mongoUri: requireEnv("MONGO_URI"),
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: parseInt(process.env.REDIS_PORT || "6379", 10),
  },
  geminiApiKey: requireEnv("GEMINI_API_KEY"),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  uploadDir: process.env.UPLOAD_DIR || "uploads",
  jwtSecret: process.env.JWT_SECRET || "vedaai-secret-change-in-production",
};

