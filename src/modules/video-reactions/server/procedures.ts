import { db } from "@/db"
import { reactionTypeVideoIdSchema, videoReactions } from "@/db/schema"

import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const videoReactionsRouter = createTRPCRouter({
    like: protectedProcedure
        .input(reactionTypeVideoIdSchema)
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
            const [existingVideoReactionLike] = await db.select().from(videoReactions)
                .where(and(
                    eq(videoReactions.videoId, videoId),
                    eq(videoReactions.userId, userId),
                    eq(videoReactions.type, `like`)
                ))
            // Check if the 
            if (existingVideoReactionLike) {
                const [delectedViewerReaction] = await db.delete(videoReactions)
                    .where(and(
                        eq(videoReactions.videoId, videoId),
                        eq(videoReactions.userId, userId),
                    ))
                    .returning()

                return delectedViewerReaction
            }
            // 
            const [createdVideoReaction] = await db.insert(videoReactions)
                .values({ userId, videoId, type: `like` })
                .onConflictDoUpdate({
                    target: [videoReactions.userId, videoReactions.videoId],
                    set: {
                        type: `like`
                    }
                })
                .returning()
            return createdVideoReaction
        }),
    dislike: protectedProcedure
        .input(reactionTypeVideoIdSchema)
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
            const [existingVideoReactionDislike] = await db.select().from(videoReactions)
                .where(and(
                    eq(videoReactions.videoId, videoId),
                    eq(videoReactions.userId, userId),
                    eq(videoReactions.type, `dislike`)
                ))
            // Check if the 
            if (existingVideoReactionDislike) {
                const [delectedViewerReaction] = await db.delete(videoReactions)
                    .where(and(
                        eq(videoReactions.videoId, videoId),
                        eq(videoReactions.userId, userId),
                    ))
                    .returning()

                return delectedViewerReaction
            }
            // 
            const [createdVideoReaction] = await db.insert(videoReactions)
                .values({ userId, videoId, type: `dislike` })
                .onConflictDoUpdate({
                    target: [videoReactions.userId, videoReactions.videoId],
                    set: {
                        type: `dislike`
                    }
                })
                .returning()
            return createdVideoReaction
        }),

});