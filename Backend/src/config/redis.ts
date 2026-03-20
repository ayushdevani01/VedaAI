import Redis from "ioredis";
import { env } from "./env";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis(env.redisUrl, { maxRetriesPerRequest: null });
    redisClient.on("connect", () => console.log("[Redis] Connected"));
    redisClient.on("error", (err) => console.error("[Redis] Error:", err));
  }
  return redisClient;
}

export const redisConnection = (() => {
  const parsed = new URL(env.redisUrl);
  return {
    host: parsed.hostname,
    port: parseInt(parsed.port || "6379", 10),
    password: parsed.password || undefined,
    tls: parsed.protocol === "rediss:" ? {} : undefined,
    maxRetriesPerRequest: null,
  };
})();

