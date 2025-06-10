import { Ratelimit } from "@upstash/ratelimit";
import { redis } from "@/lib/redis";

export const rateLimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(10, "10 s"), // 10 requests every 10 seconds
}) 