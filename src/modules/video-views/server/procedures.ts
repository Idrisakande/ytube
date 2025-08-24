import { db } from "@/db"
import { videoViews, viewsVideoIdSchema } from "@/db/schema"

import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const videoViewsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(viewsVideoIdSchema)
        .mutation(async ({ ctx, input }) => {
            // const { clerkUserId: userId, } = ctx
            const { id: userId, } = ctx.user
            const { videoId } = input
            // Ensure user Id is available in the context
            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID not found, sign in.",
                });
            }
            // Ensure video Id is available in the context
            if (!videoId) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Missing video id.",
                });
            }
            // find existing video views
            const [existingVideoView] = await db.select().from(videoViews)
                .where(and(
                    eq(videoViews.videoId, videoId),
                    eq(videoViews.userId, userId)
                ))
            // Check if the 
            if (existingVideoView) {
                return existingVideoView
            }

            const [createdVideoView] = await db.insert(videoViews)
                .values({ userId, videoId })
                .returning()
            return createdVideoView
        }),

});