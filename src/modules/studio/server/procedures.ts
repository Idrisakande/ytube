import { db } from "@/db"
import { videos } from "@/db/schema"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { eq, and, or, lt, desc } from "drizzle-orm"
import { z } from "zod"

export const studioRouter = createTRPCRouter({
    getMany: protectedProcedure.input(z.object({
        cursor: z.object({
            id: z.string().uuid(),
            updatedAt: z.date()
        }).nullish(),
        limit: z.number().min(1).max(100)
    })).query(async ({ ctx, input }) => {
        const { limit, cursor } = input
        const { id: userId } = ctx.user
        const data = await db.select().from(videos)
            .where(and(
                eq(videos.userId, userId),
                cursor
                    ? or(
                        lt(videos.updatedAt, cursor.updatedAt),
                        and(
                            eq(videos.updatedAt, cursor.updatedAt),
                            lt(videos.id, cursor.id)
                        )
                    )
                    : undefined
            ))
            .orderBy(
                desc(videos.updatedAt),
                desc(videos.id))
            // add a limit to the query further down
            .limit(limit + 1)

        const hasMore = data.length > limit
        // // if there are more than the limit, we slice the data
        if (hasMore) {
            data.pop() // remove the last item to keep the limit
        }
        // if there is no data, return an empty array
        if (data.length === 0) {
            return {
                data: [],
                nextCursor: null
            }
        }

        // get the last item to use as the next cursor
        const nextCursor = {
            id: data[data.length - 1].id,
            updatedAt: data[data.length - 1].updatedAt
        }
        // return the data and the next cursor
        return {
            data,
            nextCursor: hasMore ? nextCursor : null
        }
    })
})