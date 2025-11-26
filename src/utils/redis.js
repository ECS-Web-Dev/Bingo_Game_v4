// src/utils/redis.js
import { createClient } from "redis";

const redis = createClient({
  url: process.env.UPSTASH_REDIS_URL,
});

redis.on("error", (err) => {
  console.error("Redis Client Error", err);
});

if (!redis.isOpen) {
  redis.connect().catch((err) => {
    console.error("Redis connection error:", err);
  });
}

export default redis;
