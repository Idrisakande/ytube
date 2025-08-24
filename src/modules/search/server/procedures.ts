import { db } from "@/db";
import { searchShema, users, videoReactions, videos, videoViews } from "@/db/schema";
import { baseProcedure, createTRPCRouter } from "@/trpc/init";
import { and, or, eq, lt, desc, ilike, getTableColumns } from "drizzle-orm";

export const searchRouter = createTRPCRouter({
    getMany: baseProcedure
        .input(searchShema)
        .query(async ({ input }) => {
            const { limit, cursor, query, categoryId } = input;

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
                .where(
                    and(
                        eq(videos.visibility, `public`),
                        // only filter by title when query is provided
                        query ? ilike(videos.title, `%${query}%`) : undefined,
                        categoryId ? eq(videos.categoryId, categoryId) : undefined,
                        cursor
                            ? or(
                                lt(videos.updatedAt, cursor.updatedAt),
                                and(eq(videos.updatedAt, cursor.updatedAt), lt(videos.id, cursor.id))
                            )
                            : undefined
                    )
                )
                .orderBy(desc(videos.updatedAt), desc(videos.id))
                .limit(limit + 1);
            // check if there is more data
            const hasMore = rows.length > limit;
            // take out the last item if there is more data
            const data = hasMore ? rows.slice(0, -1) : rows
            // set next cursor to the last item if there is more data
            const lastItem = data[data.length - 1]
            const nextCursor = hasMore ? { id: lastItem.id, updatedAt: lastItem.updatedAt } : null

            return { data, nextCursor }
        }),
});
