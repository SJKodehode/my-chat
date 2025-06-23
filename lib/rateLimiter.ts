import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

const redis = new Redis({
    url: process.env.KV_REST_API_URL!,
    token: process.env.KV_REST_API_TOKEN!,
})

export const globalLimiter = new Ratelimit({
    redis,

    limiter: Ratelimit.slidingWindow(3, '5s'),
})