import Redis from "ioredis";
import { env } from "./env";

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    redisClient = new Redis({
      host: env.redis.host,
      port: env.redis.port,
      maxRetriesPerRequest: null, // required by BullMQ
    });
    redisClient.on("connect", () => console.log("[Redis] Connected"));
    redisClient.on("error", (err) => console.error("[Redis] Error:", err));
  }
  return redisClient;
}

export const redisConnection = {
  host: env.redis.host,
  port: env.redis.port,
};
