import { Redis } from "@upstash/redis";

if (
  !process.env.UPSTASH_REDIS_REST_URL ||
  !process.env.UPSTASH_REDIS_REST_TOKEN
) {
  throw new Error("Upstash Redis env vars not set");
}

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});

// old
// import { createClient } from "redis";

// const redis = createClient({
//   url: process.env.UPSTASH_REDIS_URL,
// });

// redis.on("error", (err) => {
//   console.error("Redis Client Error", err);
// });

// if (!redis.isOpen) {
//   redis.connect().catch((err) => {
//     console.error("Redis connection error:", err);
//   });
// }

// export default redis;
