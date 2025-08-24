import { db } from "@/db"
import { suggestionsSchema, users, videoReactions, videos, videoViews } from "@/db/schema"
import { baseProcedure, createTRPCRouter } from "@/trpc/init"
import { TRPCError } from "@trpc/server"
import { eq, and, or, lt, desc, getTableColumns, not } from "drizzle-orm"

export const suggestionsRouter = createTRPCRouter({
    getMany: baseProcedure
        .input(suggestionsSchema)
        .query(async ({ input }) => {
            const { videoId, limit, cursor } = input

            const [existingVideo] = await db.select().from(videos)
                .where(eq(videos.id, videoId))

            if (!existingVideo) {
                throw new TRPCError({ code: `NOT_FOUND` })
            }

            if (!existingVideo) {
                return {
                    data: [],
                    nextCursor: null,
                };
            }
            const rows = await db
                .select({
                    ...getTableColumns(videos),
                    user: users,
                    viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
                    likeCount: db.$count(videoReactions, and(
                        eq(videoReactions.videoId, videos.id),
                        eq(videoReactions.type, 'like'),
                    )),
                    dislikeCount: db.$count(videoReactions, and(
                        eq(videoReactions.videoId, videos.id),
                        eq(videoReactions.type, 'dislike'),
                    ))
                })
                .from(videos)
                .innerJoin(users, eq(users.id, videos.userId))
                .where(and(
                    not(eq(videos.id, existingVideo.id)),
                    eq(videos.visibility, `public`),
                    existingVideo.categoryId ?
                        eq(videos.categoryId, existingVideo.categoryId) :
                        undefined,
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
            // check if there is more data
            const hasMore = rows.length > limit;
            // take out the last item if there is more data
            const data = hasMore ? rows.slice(0, -1) : rows
            // set next cursor to the last item if there is more data
            const lastItem = data[data.length - 1]
            const nextCursor = hasMore ? { id: lastItem.id, updatedAt: lastItem.updatedAt } : null

            return { data, nextCursor }
        }),
})