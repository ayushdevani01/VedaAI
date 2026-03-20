import http from "http";
import { createApp } from "./app";
import { env } from "./config/env";
import { connectDb } from "./config/db";
import { getRedisClient } from "./config/redis";
import { initSocket } from "./socket/socket";
import { startGenerationWorker } from "./workers/generation.worker";

async function bootstrap() {
  await connectDb();

  getRedisClient();

  const app = createApp();
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  startGenerationWorker();

  httpServer.listen(env.port, "0.0.0.0", () => {
    console.log(`[Server] VedaAI backend running on http://0.0.0.0:${env.port}`);
    console.log(`[Server] Socket.IO ready`);
    console.log(`[Server] BullMQ worker started`);
  });
}

bootstrap().catch((err) => {
  console.error("[Server] Fatal startup error:", err);
  process.exit(1);
});
