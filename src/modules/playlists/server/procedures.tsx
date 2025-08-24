import { db } from "@/db"
import { likedVideosShema, historyVideosShema, users, videoReactions, videos, videoViews, createPlaylistschema, playlists, getPlaylistSchema, playlistVideos, getPlaylistForVideoSchema, addVideoToPlaylistSchema, removeVideoFromPlaylistSchema, videosFromPlaylistSchema, PlaylistIdSchema } from "@/db/schema"
import { createTRPCRouter, protectedProcedure } from "@/trpc/init"
import { TRPCError } from "@trpc/server";
import { and, desc, eq, getTableColumns, lt, or, sql } from "drizzle-orm";

export const playlistsRouter = createTRPCRouter({
    getHistory: protectedProcedure
        .input(historyVideosShema)
        .query(async ({ input, ctx }) => {
            const { id: userId } = ctx.user
            const { limit, cursor } = input;

            const viewerVideoViews = db.$with("viewer_video_views").as(
                db
                    .select({
                        videoId: videoViews.videoId,
                        viewedAt: videoViews.updatedAt
                    })
                    .from(videoViews)
                    .where(eq(videoViews.userId, userId))
            )

            const rows = await db
                .with(viewerVideoViews)
                .select({
                    ...getTableColumns(videos),
                    user: users,
                    viewedAt: viewerVideoViews.viewedAt,
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
                .innerJoin(viewerVideoViews, eq(videos.id, viewerVideoViews.videoId))
                .where(
                    and(
                        eq(videos.visibility, `public`),
                        cursor
                            ? or(
                                lt(viewerVideoViews.viewedAt, cursor.viewedAt),
                                and(eq(viewerVideoViews.viewedAt, cursor.viewedAt), lt(videos.id, cursor.id))
                            )
                            : undefined
                    )
                )
                .orderBy(desc(viewerVideoViews.viewedAt), desc(videos.id))
                .limit(limit + 1);
            // check if there is more data
            const hasMore = rows.length > limit;
            // take out the last item if there is more data
            const data = hasMore ? rows.slice(0, -1) : rows
            // set next cursor to the last item if there is more data
            const lastItem = data[data.length - 1]
            const nextCursor = hasMore ? { id: lastItem.id, viewedAt: lastItem.viewedAt } : null

            return { data, nextCursor }
        }),
    getLiked: protectedProcedure
        .input(likedVideosShema)
        .query(async ({ input, ctx }) => {
            const { id: userId } = ctx.user
            const { limit, cursor } = input;

            const viewerVideoReactions = db.$with("viewer_video_reactions").as(
                db
                    .select({
                        videoId: videoReactions.videoId,
                        likedAt: videoReactions.updatedAt
                    })
                    .from(videoReactions)
                    .where(and(
                        eq(videoReactions.userId, userId),
                        eq(videoReactions.type, `like`)
                    ))
            )

            const rows = await db
                .with(viewerVideoReactions)
                .select({
                    ...getTableColumns(videos),
                    user: users,
                    likedAt: viewerVideoReactions.likedAt,
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
                .innerJoin(viewerVideoReactions, eq(videos.id, viewerVideoReactions.videoId))
                .where(
                    and(
                        eq(videos.visibility, `public`),
                        cursor
                            ? or(
                                lt(viewerVideoReactions.likedAt, cursor.likedAt),
                                and(eq(viewerVideoReactions.likedAt, cursor.likedAt), lt(videos.id, cursor.id))
                            )
                            : undefined
                    )
                )
                .orderBy(desc(viewerVideoReactions.likedAt), desc(videos.id))
                .limit(limit + 1);
            // check if there is more data
            const hasMore = rows.length > limit;
            // take out the last item if there is more data
            const data = hasMore ? rows.slice(0, -1) : rows
            // set next cursor to the last item if there is more data
            const lastItem = data[data.length - 1]
            const nextCursor = hasMore ? { id: lastItem.id, likedAt: lastItem.likedAt } : null

            return { data, nextCursor }
        }),
    createPlaylist: protectedProcedure
        .input(createPlaylistschema)
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user
            const { name } = input
            // Ensure userId is available in the context
            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID not found, sign in.",
                });
            }
            // Ensure name is available in the context
            if (!name) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Please enter the name of the playlist.",
                });
            }
            const [createdPlaylist] = await db
                .insert(playlists)
                .values({
                    name,
                    userId,
                })
                .returning()
            // check if there is 
            if (!createdPlaylist) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                });
            }
            return createdPlaylist

        }),
    getManyPlaylists: protectedProcedure
        .input(getPlaylistSchema)
        .query(async ({ input, ctx }) => {
            const { id: userId } = ctx.user
            const { limit, cursor } = input;

            const rows = await db
                .select({
                    ...getTableColumns(playlists),
                    videoCount: db.$count(playlistVideos, eq(playlistVideos.playlistId, playlists.id)),
                    user: users,
                    thumbnailUrl: sql<string | null> `(
                        SELECT v.thumbnail_url
                        FROM ${playlistVideos} pv
                        JOIN ${videos} v ON pv.video_id = v.id
                        WHERE pv.playlist_id = ${playlists.id}
                        ORDER BY pv.updated_at DESC
                        LIMIT 1
                    )`
                })
                .from(playlists)
                .innerJoin(users, eq(users.id, playlists.userId))
                .where(
                    and(
                        eq(playlists.userId, userId),
                        cursor
                            ? or(
                                lt(playlists.updatedAt, cursor.updatedAt),
                                and(eq(playlists.updatedAt, cursor.updatedAt), lt(playlists.id, cursor.id))
                            )
                            : undefined
                    )
                )
                .orderBy(desc(playlists.updatedAt), desc(playlists.id))
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
    getManyPlaylistsForVideo: protectedProcedure
        .input(getPlaylistForVideoSchema)
        .query(async ({ input, ctx }) => {
            const { id: userId } = ctx.user
            const { limit, cursor, videoId } = input;

            const rows = await db
                .select({
                    ...getTableColumns(playlists),
                    videoCount: db.$count(playlistVideos, eq(playlistVideos.playlistId, playlists.id)),
                    user: users,
                    containsVideos: videoId ?
                        sql<boolean> `(
                            SELECT EXISTS (
                                SELECT 1
                                FROM ${playlistVideos} pv
                                WHERE pv.playlist_id = ${playlists.id} AND pv.video_id = ${videoId}
                            )
                        )` :
                        sql<boolean> `false`,
                })
                .from(playlists)
                .innerJoin(users, eq(users.id, playlists.userId))
                .where(
                    and(
                        eq(playlists.userId, userId),
                        cursor
                            ? or(
                                lt(playlists.updatedAt, cursor.updatedAt),
                                and(eq(playlists.updatedAt, cursor.updatedAt), lt(playlists.id, cursor.id))
                            )
                            : undefined
                    )
                )
                .orderBy(desc(playlists.updatedAt), desc(playlists.id))
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
    addVideoToPlaylist: protectedProcedure
        .input(addVideoToPlaylistSchema)
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user
            const { playlistId, videoId } = input
            // Ensure userId is available in the context
            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID not found, sign in.",
                });
            }
            // Ensure playlist Id is available in the context
            if (!playlistId) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Playlist ID not found.",
                });
            }
            // Ensure video ID is available in the context
            if (!videoId) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Video ID not found.",
                });
            }
            // find the playlist
            const [existingPlaylist] = await db
                .select()
                .from(playlists)
                .where(eq(playlists.id, playlistId))
            // check if it is fpound
            if (!existingPlaylist) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Playlist not found"
                });
            }
            // check if the user created this playlist
            if (existingPlaylist.userId !== userId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You don't own the playlist"
                });
            }
            // find the video to add to playlist
            const [existingVideo] = await db
                .select()
                .from(videos)
                .where(eq(videos.id, videoId))
            // check if it is exist
            if (!existingVideo) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Video to add not found"
                });
            }
            // Find if the video in the playlist
            const [existingPlaylistVideo] = await db
                .select()
                .from(playlistVideos)
                .where(and(
                    eq(playlistVideos.playlistId, playlistId),
                    eq(playlistVideos.videoId, videoId)
                ))
            // if it exist, then conflict has happen
            if (existingPlaylistVideo) {
                throw new TRPCError({
                    code: "CONFLICT",
                    message: "This video already exist in this playlist"
                });
            }
            // create the playlist video
            const [createdPlaylistVideo] = await db
                .insert(playlistVideos)
                .values({
                    playlistId,
                    videoId
                })
                .returning()
            return createdPlaylistVideo

        }),
    removeVideoFromPlaylist: protectedProcedure
        .input(removeVideoFromPlaylistSchema)
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user
            const { playlistId, videoId } = input
            // Ensure userId is available in the context
            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID not found, sign in.",
                });
            }
            // Ensure playlist Id is available in the context
            if (!playlistId) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Playlist ID not found.",
                });
            }
            // Ensure video ID is available in the context
            if (!videoId) {
                throw new TRPCError({
                    code: "BAD_REQUEST",
                    message: "Video ID not found.",
                });
            }
            // find the playlist
            const [existingPlaylist] = await db
                .select()
                .from(playlists)
                .where(eq(playlists.id, playlistId))
            // check if it is fpound
            if (!existingPlaylist) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Playlist not found"
                });
            }
            // check if the user created this playlist
            if (existingPlaylist.userId !== userId) {
                throw new TRPCError({
                    code: "FORBIDDEN",
                    message: "You don't own the playlist"
                });
            }
            // find the video to add to playlist
            const [existingVideo] = await db
                .select()
                .from(videos)
                .where(eq(videos.id, videoId))
            // check if it is exist
            if (!existingVideo) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Video to add not found"
                });
            }
            // Find if the video in the playlist
            const [existingPlaylistVideo] = await db
                .select()
                .from(playlistVideos)
                .where(and(
                    eq(playlistVideos.playlistId, playlistId),
                    eq(playlistVideos.videoId, videoId)
                ))
            // if it exist, then conflict has happen
            if (!existingPlaylistVideo) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "The video is not found in the playlist"
                });
            }
            // delete the video the from the playlist
            const [deletedPlaylistVideo] = await db
                .delete(playlistVideos)
                .where(and(
                    eq(playlistVideos.playlistId, playlistId),
                    eq(playlistVideos.videoId, videoId),
                ))
                .returning()
            return deletedPlaylistVideo

        }),
    getVideosFromPlaylist: protectedProcedure
        .input(videosFromPlaylistSchema)
        .query(async ({ input, ctx }) => {
            const { id: userId } = ctx.user
            const { limit, cursor, playlistId } = input;

            const [existingPlaylist] = await db
                .select()
                .from(playlists)
                .where(and(
                    eq(playlists.userId, userId),
                    eq(playlists.id, playlistId)
                ))
            if (!existingPlaylist) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                    message: 'Playlist not found'
                })
            }
            const videosFromPlaylist = db.$with("playlist_videos").as(
                db
                    .select({
                        videoId: playlistVideos.videoId,
                    })
                    .from(playlistVideos)
                    .where(eq(playlistVideos.playlistId, playlistId))
            )

            const rows = await db
                .with(videosFromPlaylist)
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
                .innerJoin(videosFromPlaylist, eq(videosFromPlaylist.videoId, videos.id))
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
    getOnePlaylist: protectedProcedure
        .input(PlaylistIdSchema)
        .query(async ({ input, ctx }) => {
            const { id: userId } = ctx.user
            const { id } = input;
            // Ensure userId is available in the context
            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID not found, sign in.",
                });
            }
            // Ensure playlist Id is available in the context
            if (!id) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "playlist id is not found.",
                });
            }
            // find the playlist
            const [existingPlaylist] = await db
                .select()
                .from(playlists)
                .where(and(
                    eq(playlists.id, id),
                    eq(playlists.userId, userId),
                ))
            // check if playlist is found
            if (!existingPlaylist) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Paylist not found.",
                });
            }
            return existingPlaylist;
        }),
    deletePlaylist: protectedProcedure
        .input(PlaylistIdSchema)
        .mutation(async ({ ctx, input }) => {
            const { id: userId } = ctx.user
            const { id } = input
            // Ensure userId is available in the context
            if (!userId) {
                throw new TRPCError({
                    code: "UNAUTHORIZED",
                    message: "User ID not found, sign in.",
                });
            }
            // Ensure playlist Id is available in the context
            if (!id) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "playlist id is not found.",
                });
            }
            // find the playlist
            const [existingPlaylist] = await db
                .select()
                .from(playlists)
                .where(and(
                    eq(playlists.id, id),
                    eq(playlists.userId, userId),
                ))
            // check if playlist is found
            if (!existingPlaylist) {
                throw new TRPCError({
                    code: "NOT_FOUND",
                    message: "Paylist not found.",
                });
            }
            const [deletedPlaylist] = await db
                .delete(playlists)
                .where(and(
                    eq(playlists.id, id),
                    eq(playlists.userId, userId)
                ))
                .returning()
            if (!deletedPlaylist) {
                throw new TRPCError({
                    code: 'NOT_FOUND',
                })
            }
            return deletedPlaylist

        }),
});