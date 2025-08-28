import { db } from "@/db"
import { commentReactions, comments, commentSchema, commentSchemaWithCursorLimit, commentUpdateSchema, users } from "@/db/schema"
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server";
import { and, count, desc, eq, getTableColumns, inArray, isNotNull, isNull, lt, or } from "drizzle-orm";

export const commentsRouter = createTRPCRouter({
    create: protectedProcedure
        .input(commentSchema)
        // .input(commentInsertSchema.extend({}).pick({ videoId: true, value: true, parentId: true || null }))
        .mutation(async ({ ctx, input }) => {
            const { videoId, value, parentId } = input
            const { id: userId, } = ctx.user
            // Ensure userId is available in the context
            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID not found, sign in.",
                });
            }
            // Ensure video id is passed
            if (!videoId) {
                throw new TRPCError({
                    code: `BAD_REQUEST`,
                    message: `Video ID or comments is not passed`
                })
            }
            // Ensure message is passed
            if (!value) {
                throw new TRPCError({
                    code: `BAD_REQUEST`,
                    message: `Type comment or reply a comment`
                })
            }
            const [existingComment] = await db.select().from(comments)
                .where(inArray(comments.id, parentId ? [parentId] : []))

            if (!existingComment && parentId) {
                throw new TRPCError({ code: `NOT_FOUND` })
            }
            if (existingComment?.parentId && parentId) {
                throw new TRPCError({ code: `BAD_REQUEST` })
            }
            // create the comment
            const [createdComment] = await db.insert(comments)
                .values({ userId, videoId, value, parentId })
                .returning()
            return createdComment
        }),
    getMany: baseProcedure
        .input(commentSchemaWithCursorLimit)
        .query(async ({ input, ctx }) => {
            const { videoId, limit, cursor, parentId } = input
            const { clerkUserId } = ctx
            // Ensure video id and message are passed
            if (!videoId) {
                throw new TRPCError({
                    code: `BAD_REQUEST`,
                    message: `Video ID is no passed`
                })
            }
            let userId

            const [user] = await db.select().from(users)
                .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []))
            if (user) {
                userId = user.id
            }
            const viewerReactions = db.$with(`viewer-reactions`).as(
                db.select({
                    commenId: commentReactions.commentId,
                    type: commentReactions.type,
                })
                    .from(commentReactions)
                    .where(inArray(commentReactions.userId, userId ? [userId] : []))
            )
            const replies = db.$with("replies").as(
                db.select({
                    parentId: comments.parentId,
                    count: count(comments.id).as("count"),
                })
                    .from(comments)
                    .where(isNotNull(comments.parentId))
                    .groupBy(comments.parentId)

            )
            // fetch the comments with the video id and the total number of comments
            const [rows, totalData] = await Promise.all([
                db
                    .with(viewerReactions, replies)
                    .select({
                        ...getTableColumns(comments),
                        user: users,
                        viewerReactions: viewerReactions.type,
                        likeCount: db.$count(commentReactions, and(
                            eq(commentReactions.type, `like`),
                            eq(commentReactions.commentId, comments.id)
                        )),
                        dislikeCount: db.$count(commentReactions, and(
                            eq(commentReactions.type, `dislike`),
                            eq(commentReactions.commentId, comments.id)
                        )),
                        replyCount: replies.count,
                    }).from(comments)
                    .where(
                        and(
                            eq(comments.videoId, videoId),
                            parentId ?
                                eq(comments.parentId, parentId) :
                                isNull(comments.parentId),
                            cursor
                                ? or(
                                    lt(comments.updatedAt, cursor.updatedAt),
                                    and(
                                        eq(comments.updatedAt, cursor.updatedAt),
                                        lt(comments.id, cursor.id)
                                    )
                                )
                                : undefined))
                    .innerJoin(users, eq(comments.userId, users.id))
                    .leftJoin(viewerReactions, eq(comments.id, viewerReactions.commenId))
                    .leftJoin(replies, eq(comments.id, replies.parentId))
                    .orderBy(desc(comments.updatedAt), desc(comments.id))
                    .limit(limit + 1),
                db.select({ count: count() }).from(comments).where(and(
                    eq(comments.videoId, videoId),
                    isNull(comments.parentId)
                ))
            ])
            // check if there is more data
            const hasMore = rows.length > limit;
            // take out the last item if there is more data
            const data = hasMore ? rows.slice(0, -1) : rows
            // set next cursor to the last item if there is more data
            const lastItem = data[data.length - 1]
            const nextCursor = hasMore ? { id: lastItem.id, updatedAt: lastItem.updatedAt } : null

            return { totalCount: totalData[0].count, data, nextCursor }
        }),
    deleteComments: protectedProcedure
        .input(commentUpdateSchema.pick({ id: true }))
        .mutation(async ({ ctx, input }) => {
            const { id } = input
            const { id: userId, } = ctx.user
            // Ensure userId is available in the context
            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID not found, sign in.",
                });
            }
            // Ensure video id and message are passed
            if (!id) {
                throw new TRPCError({
                    code: `BAD_REQUEST`,
                    message: `Comments ID is not passed`
                })
            }
            // delete the comment
            const [deletedComment] = await db.delete(comments)
                .where(and(
                    eq(comments.id, id),
                    eq(comments.userId, userId),
                ))
                .returning()
            if (!deletedComment) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                });
            }
            return deletedComment
        }),
});