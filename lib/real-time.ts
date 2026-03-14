import { Realtime, InferRealtimeEvents } from "@upstash/realtime"

import z from "zod/v4"

import { Redis } from "@upstash/redis"
import { UIMessage, UIMessageChunk } from "ai"

export const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
})


const schema = {
 workflow : {
    chunk: z.any() as z.ZodType<UIMessageChunk>,
 },
  }


export const realtime = new Realtime({ schema, redis })
export type RealtimeEvents = InferRealtimeEvents<typeof realtime>