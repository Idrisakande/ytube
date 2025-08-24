import { db } from "@/db"
import { comments, users, videoReactions, videos, videoViews } from "@/db/schema"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server"
import { eq, and, or, lt, desc, getTableColumns } from "drizzle-orm"
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
        const rows = await db
            .select({
                ...getTableColumns(videos),
                user: users,
                viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
                likeCount: db.$count(videoReactions, and(
                    eq(videoReactions.videoId, videos.id),
                    eq(videoReactions.type, 'like'),
                )),
                commentCount: db.$count(comments, eq(comments.videoId, videos.id)),
            })
            .from(videos)
            .innerJoin(users, eq(users.id, videos.userId))
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
            // add limit + 1 to query further down if there is more data
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
    // This procedure is used to get a single video by id
    getOne: protectedProcedure.input(z.object({
        id: z.string().uuid()
    })).query(async ({ ctx, input }) => {
        const { id: userId } = ctx.user
        const [video] = await db.select().from(videos)
            .where(and(
                eq(videos.id, input.id),
                eq(videos.userId, userId)
            ))
        // .limit(1)
        // .then(res => res[0])
        if (!video) {
            throw new TRPCError({
                code: "NOT_FOUND",
                message: "Video not found"
            })
        }
        return video
    })
})


// import Mux from '@mux/mux-node';
// import MuxUploader from '@mux/mux-uploader-react';

// const client = new Mux({
//   tokenId: process.env['MUX_TOKEN_ID'],
//   tokenSecret: process.env['MUX_TOKEN_SECRET'],
// });

// export default async function Page() {
//   const directUpload = await client.video.uploads.create({
//     cors_origin: '*',
//     new_asset_settings: {
//       playback_policy: ['public'],
//     },
//   });

//   return <MuxUploader endpoint={directUpload.url} />;
// }