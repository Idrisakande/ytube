import { db } from "@/db"
import { commentReactions, commentUpdateSchema } from "@/db/schema"

import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server";
import { and, eq } from "drizzle-orm";

export const commentReactionsRouter = createTRPCRouter({
    like: protectedProcedure
        .input(commentUpdateSchema.pick({ id: true }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId, } = ctx.user
            const { id: commentId } = input
            // Ensure user Id is available in the context
            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID not found, sign in.",
                });
            }
            // Ensure comment Id is available in the context
            if (!commentId) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Missing comment id.",
                });
            }
            // find existing comment reaction like
            const [existingCommentReactionLike] = await db.select().from(commentReactions)
                .where(and(
                    eq(commentReactions.commentId, commentId),
                    eq(commentReactions.userId, userId),
                    eq(commentReactions.type, `like`)
                ))
            // Check if the there is an existing like comment and delete it
            if (existingCommentReactionLike) {
                const [delectedViewerReaction] = await db.delete(commentReactions)
                    .where(and(
                        eq(commentReactions.commentId, commentId),
                        eq(commentReactions.userId, userId),
                    ))
                    .returning()

                return delectedViewerReaction
            }
            // create a like comment raection
            const [createdCommentReaction] = await db.insert(commentReactions)
                .values({ userId, commentId, type: `like` })
                .onConflictDoUpdate({
                    target: [commentReactions.userId, commentReactions.commentId],
                    set: {
                        type: `like`
                    }
                })
                .returning()
            return createdCommentReaction
        }),
    dislike: protectedProcedure
        .input(commentUpdateSchema.pick({ id: true }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId, } = ctx.user
            const { id: commentId } = input
            // Ensure user Id is available in the context
            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID not found, sign in.",
                });
            }
            // Ensure comment Id is available in the context
            if (!commentId) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Missing comment id.",
                });
            }
            // find existing dislike comment reaction 
            const [existingDislikeCommentReaction] = await db.select().from(commentReactions)
                .where(and(
                    eq(commentReactions.commentId, commentId),
                    eq(commentReactions.userId, userId),
                    eq(commentReactions.type, `dislike`)
                ))
            // Check if the there is an existing dislike comment and delete it
            if (existingDislikeCommentReaction) {
                const [delectedViewerReaction] = await db.delete(commentReactions)
                    .where(and(
                        eq(commentReactions.commentId, commentId),
                        eq(commentReactions.userId, userId),
                    ))
                    .returning()

                return delectedViewerReaction
            }
            // create a dislike comment raection
            const [createdDislikeCommentReaction] = await db.insert(commentReactions)
                .values({ userId, commentId, type: `dislike` })
                .onConflictDoUpdate({
                    target: [commentReactions.userId, commentReactions.commentId],
                    set: {
                        type: `dislike`
                    }
                })
                .returning()
            return createdDislikeCommentReaction
        }),

});