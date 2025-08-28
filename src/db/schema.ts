// import { timestamp } from "drizzle-orm/gel-core";
import { relations } from "drizzle-orm";
// import { foreignKey } from "drizzle-orm/pg-core";
import { pgTable, text, uuid, timestamp, uniqueIndex, integer, pgEnum, primaryKey, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema, createUpdateSchema } from "drizzle-zod"
import { z } from "zod";

// create users schema
export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").unique().notNull(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    imageUrl: text("image_url").notNull(),
    bannerUrl: text("banner_url"),
    bannerKey: text("banner_key"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("clerk_id_idx").on(table.clerkId)],)
export const usersRelations = relations(users, ({ many }) => ({
    videos: many(videos),
    videoViews: many(videoViews),
    videoReactions: many(videoReactions),
    subscriptions: many(subscriptions, {
        relationName: "subscriptions_viewer_id_fkey"
    }),
    subscribers: many(subscriptions, {
        relationName: "subscriptions_creator_id_fkey"
    }),
    comments: many(comments),
    commentReactions: many(commentReactions),
    playlists: many(playlists),
}));
export const usersInsertSchema = createInsertSchema(users);
export const usersSelectSchema = createSelectSchema(users);
export const userIdSchema = usersInsertSchema.pick({ id: true })
export const userIdSelectSchema = usersSelectSchema.pick({ id: true })


// create categories schema
export const categories = pgTable("categories", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull().unique(),
    description: text("description"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("name_idx").on(table.name)],)
export const categoriesRelations = relations(categories, ({ many }) => ({
    videos: many(videos),
}));


// creatye videos schema
export const videoVisibility = pgEnum("video_visibility", [
    "private",
    "public",
    "unlisted"
]);
export const videos = pgTable("videos", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description"),
    muxStatus: text("mux_status").default("pending").notNull(), // e.g., "pending", "processing", "ready", "error"
    muxUploadId: text("mux_upload_id").unique(),
    muxAssetId: text("mux_asset_id").unique(),
    muxPlaybackId: text("mux_playback_id").unique(),
    muxTrackId: text("mux_track_id").unique(),
    muxTrackStatus: text("mux_track_status"), // e.g., "pending", "processing", "ready"
    thumbnailUrl: text("thumbnail_url"),
    thumbnailKey: text("thumbnail_key"),
    previewUrl: text("preview_url"), // URL for the video preview
    previewKey: text("preview_key"),
    duration: integer("duration").notNull().default(0), // Duration in seconds
    visibility: videoVisibility("visibility").default("private").notNull(), // Default visibility is private
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    categoryId: uuid("category_id").references(() => categories.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
// (table) => [uniqueIndex("name_idx").on(table.userId, table.title)],
export const videosRelations = relations(videos, ({ one, many }) => ({
    user: one(users, {
        fields: [videos.userId],
        references: [users.id],
    }),
    category: one(categories, {
        fields: [videos.categoryId],
        references: [categories.id],
    }),
    views: many(videoViews),
    reactions: many(videoReactions),
    comments: many(comments),
    playlistVideos: many(playlistVideos),
}));
// export const videosUpdateSchema = createUpdateSchema(videos);
export const videosInsertSchema = createInsertSchema(videos);
export const videosSelectSchema = createSelectSchema(videos);
export const videosUpdateSchema = createUpdateSchema(videos); // Use for backend
export const videoIdSchema = videosSelectSchema.pick({ id: true })
export const _id = videosUpdateSchema.shape.id;
export const id = videosUpdateSchema.pick({
    title: true,
    description: true,
    categoryId: true,
    visibility: true,
})
export const videosIdUpdateSchema = videosUpdateSchema.pick({ id: true })

export const videosGenerateThumbnailFrontendSchema = z.object({
    prompt: z.string().min(10)
})
// Create a safe schema just for the frontend form, excluding fields not needed in the form
const videosGenerateThumbnailSchema = {
    id: z.string().uuid(),
    prompt: z.string().min(10)
}
export const videosGenerateThumbnailBackendSchema = z.object(videosGenerateThumbnailSchema);
// Create a safe schema just for the frontend form, excluding fields not needed in the form
export const videoUpdateSchemaFrontend = {
    title: z.string().min(1, "Title is required"),
    description: z.string().nullable().optional(),
    visibility: z.enum(["private", "public", "unlisted"]),
    categoryId: z.string().uuid().nullable().optional(),
    thumbnailUrl: z.string().url("Must be a valid URL").nullable().optional(),
    muxStatus: z.string(),
    muxTrackStatus: z.string().nullable().optional(),
}
export const videoFormSchema = z.object(videoUpdateSchemaFrontend);
export const homeVideosShema = z.object({
    categoryId: z.string().uuid().nullish(),
    userId: z.string().uuid().nullish(),
    cursor: z.object({
        id: z.string().uuid(),
        updatedAt: z.date()
    }).nullish(),
    limit: z.number().min(1).max(100)
})
export const trendingVideosShema = z.object({
    cursor: z.object({
        id: z.string().uuid(),
        viewCount: z.number()
    }).nullish(),
    limit: z.number().min(1).max(100)
})
export const subscribedVideosShema = z.object({
    cursor: z.object({
        id: z.string().uuid(),
        updatedAt: z.date()
    }).nullish(),
    limit: z.number().min(1).max(100)
})
export const historyVideosShema = z.object({
    cursor: z.object({
        id: z.string().uuid(),
        viewedAt: z.date()
    }).nullish(),
    limit: z.number().min(1).max(100)
})
export const likedVideosShema = z.object({
    cursor: z.object({
        id: z.string().uuid(),
        likedAt: z.date()
    }).nullish(),
    limit: z.number().min(1).max(100)
})
export const playlistVideosShema = z.object({
    cursor: z.object({
        id: z.string().uuid(),
        viewedAt: z.date()
    }).nullish(),
    limit: z.number().min(1).max(100)
})


// create views schema
export const videoViews = pgTable(`video_views`, {
    userId: uuid(`user_id`).references(() => users.id, { onDelete: "cascade" }).notNull(),
    videoId: uuid(`video_id`).references(() => videos.id, { onDelete: "cascade" }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
    primaryKey({
        name: `video_views_pk`,
        columns: [t.userId, t.videoId]
    }),
])
export const videoViewRelations = relations(videoViews, ({ one }) => ({
    user: one(users, {
        fields: [videoViews.userId],
        references: [users.id]
    }),
    video: one(videos, {
        fields: [videoViews.videoId],
        references: [videos.id]
    })
}))
export const videoViewInsertSchema = createInsertSchema(videoViews);
export const videoViewSelectSchema = createSelectSchema(videoViews);
export const videoViewUpdateSchema = createUpdateSchema(videoViews);
export const viewsVideoIdSchema = z.object({ videoId: z.string().uuid() });


// Create reaction schema
export const reactionType = pgEnum(`reaction_type`, [`like`, `dislike`])
export const videoReactions = pgTable(`video_reactions`, {
    userId: uuid(`user_id`).references(() => users.id, { onDelete: "cascade" }).notNull(),
    videoId: uuid(`video_id`).references(() => videos.id, { onDelete: "cascade" }).notNull(),
    type: reactionType(`type`).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
    primaryKey({
        name: `video_reactions_pk`,
        columns: [t.userId, t.videoId]
    }),
])
export const videoReactionRelations = relations(videoReactions, ({ one }) => ({
    user: one(users, {
        fields: [videoReactions.userId],
        references: [users.id]
    }),
    video: one(videos, {
        fields: [videoReactions.videoId],
        references: [videos.id]
    })
}))
export const videoReactionSelectSchema = createInsertSchema(videoReactions);
export const videoReactionInsertSchema = createSelectSchema(videoReactions);
export const videoReactionUpdateSchema = createUpdateSchema(videoReactions);
export const reactionTypeVideoIdSchema = z.object({ videoId: z.string().uuid() });


// create subscriptions schema
export const subscriptions = pgTable("subscriptions", {
    viewerId: uuid("viewer_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    creatorId: uuid("creator_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
    primaryKey({
        name: "subscriptions_pk",
        columns: [t.viewerId, t.creatorId]
    })
])
export const subscriptionRelations = relations(subscriptions, ({ one }) => ({
    viewer: one(users, {
        fields: [subscriptions.viewerId],
        references: [users.id],
        relationName: "subscriptions_viewer_id_fkey"
    }),
    creator: one(users, {
        fields: [subscriptions.creatorId],
        references: [users.id],
        relationName: "subscriptions_creator_id_fkey"
    })
}))


// create comments schema
export const comments = pgTable("comments", {
    id: uuid("id").primaryKey().defaultRandom(),
    parentId: uuid("parent_id"),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    videoId: uuid("video_id").references(() => videos.id, { onDelete: "cascade" }).notNull(),
    value: text("value").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => {
    return [
        foreignKey({
            columns: [t.parentId],
            foreignColumns: [t.id],
            name: "comments_parent_id_fkey",
        })
            .onDelete("cascade")
    ]
})
export const commentRelations = relations(comments, ({ one, many }) => ({
    user: one(users, {
        fields: [comments.userId],
        references: [users.id]
    }),
    video: one(videos, {
        fields: [comments.videoId],
        references: [videos.id]
    }),
    reactions: many(commentReactions),
    parent: one(comments, {
        fields: [comments.parentId],
        references: [comments.id],
        relationName: "comments_parent_id_fkey",
    }),
    replies: many(comments, {
        relationName: "comments_parent_id_fkey",
    })
}))
export const commentSelectSchema = createInsertSchema(comments);
export const commentInsertSchema = createSelectSchema(comments);
export const commentUpdateSchema = createUpdateSchema(comments);
export const commentSchemap = commentInsertSchema.pick({ videoId: true, value: true });
export const commentSchema = z.object({
    videoId: z.string().uuid(),
    value: z.string()
        .min(1, { message: "You must type at least 1 character" })
        .refine(
            (val) => !/^[-_]+$/.test(val),
            { message: "Only underscores or hyphens are not allowed" }
        ),
    parentId: z.string().uuid().nullish()
})
export const commentSchemaWithCursorLimit = z.object({
    videoId: z.string().uuid(),
    cursor: z
        .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
        })
        .nullish(),
    limit: z.number().min(1).max(100),
    parentId: z.string().uuid().nullish()
})
export const cursor = z
    .object({
        id: z.string().uuid(),
        updatedAt: z.date(),
    })
    .nullish(); // means it can be undefined or null
export const limit = z.number().min(1).max(100)


// create table for comment reaction
export const commentReactions = pgTable(`comment_reactions`, {
    userId: uuid(`user_id`).references(() => users.id, { onDelete: "cascade" }).notNull(),
    commentId: uuid(`comment_id`).references(() => comments.id, { onDelete: "cascade" }).notNull(),
    type: reactionType(`type`).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
    primaryKey({
        name: `comment_reactions_pk`,
        columns: [t.userId, t.commentId]
    }),
])
export const commnetReactionRelations = relations(commentReactions, ({ one }) => ({
    user: one(users, {
        fields: [commentReactions.userId],
        references: [users.id]
    }),
    comment: one(comments, {
        fields: [commentReactions.commentId],
        references: [comments.id]
    })
}))
// export const commentSchemaWithCursorLimit = commentSelectSchema
//     .extend({
//         cursor, // attach cursor here
//         limit,  // also attach limit
//     }).pick({
//         videoId: true,
//         cursor: true,
//         limit: true
//     })

export const suggestionsSchema = z.object({
    videoId: z.string().uuid(),
    cursor: z.object({
        id: z.string().uuid(),
        updatedAt: z.date()
    }).nullish(),
    limit: z.number().min(1).max(100)
})

export const searchShema = z.object({
    query: z.string().nullish(),
    categoryId: z.string().uuid().nullish(),
    cursor: z.object({
        id: z.string().uuid(),
        updatedAt: z.date()
    }).nullish(),
    limit: z.number().min(1).max(100)
})


// Playlists schema
export const playlists = pgTable("playlists", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    description: text("description"),
    userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
})
export const playlistRelations = relations(playlists, ({ one, many }) => ({
    user: one(users, {
        fields: [playlists.userId],
        references: [users.id]
    }),
    playlistVideos: many(playlistVideos),
}))
export const playlistVideos = pgTable("playlist_videos", {
    playlistId: uuid("playlist_id").references(() => playlists.id, { onDelete: "cascade" }).notNull(),
    videoId: uuid("video_id").references(() => videos.id, { onDelete: "cascade" }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => [
    primaryKey({
        name: "playlist_videos_pk",
        columns: [t.playlistId, t.videoId]
    })
])
export const playlistVideoRelations = relations(playlistVideos, ({ one }) => ({
    playlist: one(playlists, {
        fields: [playlistVideos.playlistId],
        references: [playlists.id]
    }),
    video: one(videos, {
        fields: [playlistVideos.videoId],
        references: [videos.id]
    }),
}))
export const playlistsInsertSchema = createSelectSchema(playlists);
export const createPlaylistschema = playlistsInsertSchema.pick({ name: true })
export const formPlaylistschema = z.object({
    name: z.string().min(1)
})
export const getPlaylistSchema = z.object({
    cursor: z
        .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
        })
        .nullish(),
    limit: z.number().min(1).max(100),
})
export const addVideoToPlaylistSchema = z.object({
    playlistId: z.string().uuid(),
    videoId: z.string().uuid(),
})
export const removeVideoFromPlaylistSchema = z.object({
    playlistId: z.string().uuid(),
    videoId: z.string().uuid(),
})
export const getPlaylistForVideoSchema = z.object({
    videoId: z.string().uuid(),
    cursor: z
        .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
        })
        .nullish(),
    limit: z.number().min(1).max(100),
})
export const videosFromPlaylistSchema = z.object({
    playlistId: z.string().uuid(),
    cursor: z
        .object({
            id: z.string().uuid(),
            updatedAt: z.date(),
        })
        .nullish(),
    limit: z.number().min(1).max(100),
})
export const PlaylistIdSchema = z.object({
    id: z.string().uuid()
})
export const manySubscriptionsSchema = z.object({
    cursor: z.object({
        creatorId: z.string().uuid(),
        updatedAt: z.date()
    }).nullish(),
    limit: z.number().min(1).max(100)
})