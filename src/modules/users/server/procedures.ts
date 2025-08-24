import { db } from "@/db"
import { subscriptions, userIdSelectSchema, users, videos } from "@/db/schema"

import { baseProcedure, createTRPCRouter } from "@/trpc/init"
import { TRPCError } from "@trpc/server";
import { eq, getTableColumns, inArray, isNotNull } from "drizzle-orm";

export const usersRouter = createTRPCRouter({
    getOneUser: baseProcedure
        .input(userIdSelectSchema)
        .query(async ({ input, ctx }) => {
            const { clerkUserId } = ctx
            const { id } = input;
            // Ensure userId is available in the context
            if (!clerkUserId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID not found, sign in.",
                });
            }
            // Ensure playlist Id is available in the context
            if (!id) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: " id is not found.",
                });
            }
            let userId

            const [user] = await db
                .select()
                .from(users)
                .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []))
            if (user) {
                userId = user.id
            }
            const viewerSubscriptions = db.$with(`viewer_subscriptions`).as(
                db.select()
                    .from(subscriptions)
                    .where(inArray(subscriptions.viewerId, userId ? [userId] : []))
            )
            const [existingUser] = await db
                .with(viewerSubscriptions)
                .select({
                    ...getTableColumns(users),
                    viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(Boolean),
                    videoCount: db.$count(videos, eq(videos.userId, users.id)),
                    subscriberCount: db.$count(subscriptions, eq(subscriptions.creatorId, users.id)),
                })
                .from(users)
                .leftJoin(viewerSubscriptions, eq(viewerSubscriptions.creatorId, users.id))
                .where(eq(users.id, id))
            // .groupBy(videos.id, users.id, viewerReactions.type)
            if (!existingUser) {
                throw new TRPCError({ code: `NOT_FOUND`, message: `User not found` })
            }
            return existingUser

        }),
});