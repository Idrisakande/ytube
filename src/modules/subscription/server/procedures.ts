import { db } from "@/db"
import { manySubscriptionsSchema, subscriptions, userIdSchema, users } from "@/db/schema"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or } from "drizzle-orm";

export const subscriptionsRouter = createTRPCRouter({
    subscribe: protectedProcedure
        .input(userIdSchema)
        .mutation(async ({ ctx, input }) => {
            const { id: creatorId } = input
            const { id: viewerId } = ctx.user
            // Ensure user Id is available in the context
            if (!creatorId) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    // message: "Creator ID not found",
                });
            }
            // Ensure user Id is sign in
            if (!viewerId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User not fond, sign in.",
                });
            }
            // Ensure user is not trying to subscribe to him/her self
            if (creatorId === ctx.user.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You can not subscribe to your self.",
                });
            }
            // create a subscriptions
            const [createdSubscription] = await db.insert(subscriptions)
                .values({
                    viewerId: ctx.user.id,
                    creatorId: creatorId
                })
                .returning()
            return createdSubscription
        }),
    unSubscribe: protectedProcedure
        .input(userIdSchema)
        .mutation(async ({ ctx, input }) => {
            const { id: creatorId } = input
            const { id: userToUnsubscribeId } = ctx.user
            // Ensure user Id is available in the context
            if (!creatorId) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    // message: "Creator ID not found",
                });
            }
            // Ensure user is sign in
            if (!userToUnsubscribeId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User not fond, sign in.",
                });
            }
            // Ensure user is not trying to unsubscribe from him/her self
            if (creatorId === ctx.user.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "You can not unsubscribe from your self.",
                });
            }
            // unSubscribe from the channel
            const [deletedSubscription] = await db.delete(subscriptions)
                .where(and(
                    eq(subscriptions.viewerId, userToUnsubscribeId),
                    eq(subscriptions.creatorId, creatorId),
                ))
                .returning()
            return deletedSubscription
        }),
    getManySubscriptions: protectedProcedure
        .input(manySubscriptionsSchema)
        .query(async ({ input, ctx }) => {
            const { limit, cursor } = input;
            const { id: userId } = ctx.user

            const rows = await db
                .select({
                    ...getTableColumns(subscriptions),
                    user: {
                        ...getTableColumns(users),
                        subsriberCount: db.$count(subscriptions, eq(subscriptions.creatorId, users.id)),

                    },

                })
                .from(subscriptions)
                .innerJoin(users, eq(users.id, subscriptions.creatorId))
                .where(
                    and(
                        eq(subscriptions.viewerId, userId),
                        cursor
                            ? or(
                                lt(subscriptions.updatedAt, cursor.updatedAt),
                                and(eq(subscriptions.updatedAt, cursor.updatedAt), lt(subscriptions.creatorId, cursor.creatorId))
                            )
                            : undefined
                    )
                )
                .orderBy(desc(subscriptions.updatedAt), desc(subscriptions.creatorId))
                .limit(limit + 1);
            // check if there is more data
            const hasMore = rows.length > limit;
            // take out the last item if there is more data
            const data = hasMore ? rows.slice(0, -1) : rows
            // set next cursor to the last item if there is more data
            const lastItem = data[data.length - 1]
            const nextCursor = hasMore ? { creatorId: lastItem.creatorId, updatedAt: lastItem.updatedAt } : null

            return { data, nextCursor }
        }),
});