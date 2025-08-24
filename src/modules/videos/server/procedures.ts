import { db } from "@/db"
import { homeVideosShema, subscribedVideosShema, subscriptions, trendingVideosShema, users, videoIdSchema, videoReactions, videos, videosGenerateThumbnailBackendSchema, videosUpdateSchema, videoViews } from "@/db/schema"
import { mux } from "@/lib/mux"
import { workflow } from "@/lib/workflow";
import { baseProcedure, createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, inArray, isNotNull, lt, or } from "drizzle-orm";
import { UTApi } from "uploadthing/server";

export const videosRouter = createTRPCRouter({
    create: protectedProcedure
        .mutation(async ({ ctx }) => {
            // const { clerkUserId: userId, } = ctx
            const { id: userId, } = ctx.user
            // Ensure userId is available in the context
            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID not found, sign in.",
                });
            }
            const uploadUrl = await mux.video.uploads.create({
                new_asset_settings: {
                    passthrough: userId, // Pass userId as passthrough data
                    playback_policy: ["public"],
                    inputs: [
                        {
                            generated_subtitles: [
                                {
                                    language_code: "en",
                                    name: "English",
                                    // type: "webvtt",
                                },
                            ],
                        },

                    ]

                },
                cors_origin: "*", // TODO: In production set to your url
                // cors_origin: process.env.NEXT_PUBLIC_APP_URL,
            })
            // Check if the upload URL was created successfully
            if (!uploadUrl.url) {
                throw new Error("Failed to create upload URL.");
            }
            const [video] = await db.insert(videos)
                .values({
                    userId,
                    title: "Untitled",
                    muxUploadId: uploadUrl.id,
                })
                .returning()
            return { video, url: uploadUrl.url }
        }),
    update: protectedProcedure
        .input(videosUpdateSchema)
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;
            // Ensure userId is available in the context
            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID not found, sign in.",
                });
            }
            // Ensure input has the required fields
            if (!input.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Video ID is required for update.",
                });
            }
            // Update the video in the database
            const [updatedVideo] = await db.update(videos)
                .set({
                    title: input.title,
                    description: input.description,
                    visibility: input.visibility,
                    categoryId: input.categoryId,
                    updatedAt: new Date(),
                })
                .where(and(
                    eq(videos.id, input.id),
                    eq(videos.userId, userId)
                ))
                .returning();
            // Check if the video was updated successfully
            if (!updatedVideo) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Video not found or you do not have permission to edit it.",
                });
            }
            return { video: updatedVideo };
        }),
    remove: protectedProcedure
        .input(videosUpdateSchema.pick({ id: true }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;
            // Ensure userId is available in the context
            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID not found, sign in.",
                });
            }
            // Ensure input has the required fields
            if (!input.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Video ID is required for deletion.",
                });
            }
            // Delete the video from the database
            const [removedVideo] = await db.delete(videos)
                .where(and(
                    eq(videos.id, input.id),
                    eq(videos.userId, userId)
                ))
                .returning();
            // Check if the video was deleted successfully
            if (!removedVideo) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Video not found or you do not have permission to delete it.",
                });
            }
            return { video: removedVideo };
        }),
    restoreThumbnail: protectedProcedure
        .input(videosUpdateSchema.pick({ id: true }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;
            // Ensure userId is available in the context
            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID not found, sign in.",
                });
            }
            // Ensure input has the required fields
            if (!input.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Video ID is required.",
                });
            }
            // find existing video in database
            const [existingVideo] = await db.select().from(videos)
                .where(and(
                    eq(videos.id, input.id),
                    eq(videos.userId, userId)
                ))
            // check for existing video
            if (!existingVideo) {
                throw new TRPCError({
                    code: `NOT_FOUND`,
                    message: "Video not found"
                })
            }

            // check if there is video with the thumbnail key
            if (existingVideo.thumbnailKey) {
                const utapi = new UTApi()
                await utapi.deleteFiles(existingVideo.thumbnailKey)
                await db.update(videos)
                    .set({ thumbnailKey: null, thumbnailUrl: null })
                    .where(and(
                        eq(videos.id, input.id),
                        eq(videos.userId, userId)
                    ))
            }
            // check if there is video muxPlaybackId
            if (!existingVideo.muxPlaybackId) {
                throw new TRPCError({ code: `BAD_REQUEST` })
            }
            const utapi = new UTApi()
            // create new thumbanil
            // const thumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.png`;
            const tempThumbnailUrl = `https://image.mux.com/${existingVideo.muxPlaybackId}/thumbnail.jpg`;
            const uploadedThumbnail = await utapi.uploadFilesFromUrl(tempThumbnailUrl)
            if (!uploadedThumbnail.data) {
                throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" })
            }
            const { key: thumbnailKey, ufsUrl: thumbnailUrl } = uploadedThumbnail.data
            // update the video with new thumbnail
            const [updatedVideo] = await db.update(videos)
                .set({
                    thumbnailUrl,
                    thumbnailKey
                })
                .where(and(
                    eq(videos.id, input.id),
                    eq(videos.userId, userId)
                )).returning()
            return updatedVideo

        }),
    generateVideoTitle: protectedProcedure
        .input(videosUpdateSchema.pick({ id: true }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user
            // Ensure userId is available in the context
            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID not found, sign in.",
                });
            }
            // Ensure input has the required fields
            if (!input.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Video ID is required.",
                });
            }
            const { workflowRunId } = await workflow.trigger({
                url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/title`,
                body: { userId, videoId: input.id }
            })
            return workflowRunId
        }),
    generateVideoDescription: protectedProcedure
        .input(videosUpdateSchema.pick({ id: true }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user
            // Ensure userId is available in the context
            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID not found, sign in.",
                });
            }
            // Ensure input has the required fields
            if (!input.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Video ID is required.",
                });
            }
            const { workflowRunId } = await workflow.trigger({
                url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/description`,
                body: { userId, videoId: input.id }
            })
            return workflowRunId
        }),
    generateVideoThumbnail: protectedProcedure
        .input(videosGenerateThumbnailBackendSchema)
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user
            // Ensure userId is available in the context
            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID not found, sign in.",
                });
            }
            // Ensure input has the required fields
            if (!input.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Video ID is required.",
                });
            }
            const { workflowRunId } = await workflow.trigger({
                url: `${process.env.UPSTASH_WORKFLOW_URL}/api/videos/workflows/thumbnail`,
                body: { userId, videoId: input.id, prompt: input.prompt }
            })
            return workflowRunId
        }),
    getOne: baseProcedure.input(videoIdSchema)
        .query(async ({ input, ctx }) => {
            const { clerkUserId } = ctx

            let userId

            const [user] = await db.select().from(users)
                .where(inArray(users.clerkId, clerkUserId ? [clerkUserId] : []))
            if (user) {
                userId = user.id
            }
            const viewerReactions = db.$with(`viewer-reactions`).as(
                db.select({
                    videoId: videoReactions.videoId,
                    type: videoReactions.type,
                })
                    .from(videoReactions)
                    .where(inArray(videoReactions.userId, userId ? [userId] : []))
            )
            const viewerSubscriptions = db.$with(`viewer_subscriptions`).as(
                db.select()
                    .from(subscriptions)
                    .where(inArray(subscriptions.viewerId, userId ? [userId] : []))
            )
            const [existingVideo] = await db
                .with(viewerReactions, viewerSubscriptions)
                .select({
                    ...getTableColumns(videos),
                    user: {
                        ...getTableColumns(users),
                        subscriberCount: db.$count(subscriptions, eq(subscriptions.creatorId, users.id)),
                        viewerSubscribed: isNotNull(viewerSubscriptions.viewerId).mapWith(Boolean)
                    },
                    viewCount: db.$count(videoViews, eq(videoViews.videoId, videos.id)),
                    likeCount: db.$count(videoReactions, and(
                        eq(videoReactions.videoId, videos.id),
                        eq(videoReactions.type, `like`)
                    )),
                    dislikeCount: db.$count(videoReactions, and(
                        eq(videoReactions.videoId, videos.id),
                        eq(videoReactions.type, `dislike`)
                    )),
                    viewerReaction: viewerReactions.type,
                })
                .from(videos)
                .innerJoin(users, eq(videos.userId, users.id))
                .leftJoin(viewerReactions, eq(viewerReactions.videoId, videos.id))
                .leftJoin(viewerSubscriptions, eq(viewerSubscriptions.creatorId, users.id))
                .where(eq(videos.id, input.id))
            // .groupBy(videos.id, users.id, viewerReactions.type)
            if (!existingVideo) {
                throw new TRPCError({ code: `NOT_FOUND`, message: `Video not found` })
            }
            return existingVideo
        }),
    revaliadte: protectedProcedure
        .input(videosUpdateSchema.pick({ id: true }))
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user;
            // Ensure userId is available in the context
            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID not found, sign in.",
                });
            }
            // Ensure input has the required fields
            if (!input.id) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Video ID is required.",
                });
            }
            // find existing video in database
            const [existingVideo] = await db.select().from(videos)
                .where(and(
                    eq(videos.id, input.id),
                    eq(videos.userId, userId)
                ))
            // check for existing video
            if (!existingVideo) {
                throw new TRPCError({
                    code: `NOT_FOUND`,
                    message: "Video not found"
                })
            }
            // check if we have mux upload id
            if (!existingVideo.muxUploadId) {
                throw new TRPCError({ code: `BAD_REQUEST` })
            }
            // retrieve the upload video
            const upload = await mux.video.uploads.retrieve(existingVideo.muxUploadId)
            // check if there is upload and asset id
            if (!upload || !upload.asset_id) {
                throw new TRPCError({ code: `BAD_REQUEST` })
            }
            // retrieve the upload video
            const asset = await mux.video.assets.retrieve(upload.asset_id)
            if (!asset) {
                throw new TRPCError({ code: `BAD_REQUEST` })
            }
            const playbackId = asset.playback_ids?.[0].id
            const duration = asset.duration ? Math.round(asset.duration * 1000) : 0;  // Default to 0 if duration is not available

            // TODO: I will later find a way to revalidate track id and status as well

            // update the video
            const [updatedVideo] = await db.update(videos)
                .set({
                    muxStatus: asset.status,
                    muxPlaybackId: playbackId,
                    muxAssetId: asset.id,
                    duration: duration

                })
                .where(and(
                    eq(videos.id, input.id),
                    eq(videos.userId, userId)
                )).returning()
            return updatedVideo
        }),
    getMany: baseProcedure
        .input(homeVideosShema)
        .query(async ({ input }) => {
            const { limit, cursor, categoryId, userId } = input;

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
                        // only filter by category id when categoryId is provided
                        categoryId ? eq(videos.categoryId, categoryId) : undefined,
                        userId ? eq(videos.userId, userId) : undefined,
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
    getManyTrending: baseProcedure
        .input(trendingVideosShema)
        .query(async ({ input }) => {
            const { limit, cursor } = input;
            const viewCountSubquery = db.$count(
                videoViews,
                eq(videoViews.videoId, videos.id)
            )

            const rows = await db
                .select({
                    ...getTableColumns(videos),
                    user: users,
                    viewCount: viewCountSubquery,
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
                        cursor
                            ? or(
                                lt(viewCountSubquery, cursor.viewCount),
                                and(eq(viewCountSubquery, cursor.viewCount), lt(videos.id, cursor.id))
                            )
                            : undefined
                    )
                )
                .orderBy(desc(viewCountSubquery), desc(videos.id))
                .limit(limit + 1);
            // check if there is more data
            const hasMore = rows.length > limit;
            // take out the last item if there is more data
            const data = hasMore ? rows.slice(0, -1) : rows
            // set next cursor to the last item if there is more data
            const lastItem = data[data.length - 1]
            const nextCursor = hasMore ? { id: lastItem.id, viewCount: lastItem.viewCount } : null

            return { data, nextCursor }
        }),
    getManySubscribed: protectedProcedure
        .input(subscribedVideosShema)
        .query(async ({ input, ctx }) => {
            const { limit, cursor } = input;
            const { id: userId } = ctx.user

            const viewerSubscriptions = db.$with("viewer_subscriptions").as(
                db
                    .select({
                        userId: subscriptions.creatorId
                    })
                    .from(subscriptions)
                    .where(eq(subscriptions.viewerId, userId))
            )

            const rows = await db
                .with(viewerSubscriptions)
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
                .innerJoin(viewerSubscriptions, eq(viewerSubscriptions.userId, users.id))
                .where(
                    and(
                        eq(videos.visibility, `public`),
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