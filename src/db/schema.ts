// import { timestamp } from "drizzle-orm/gel-core";
import { pgTable, text, uuid, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").primaryKey().defaultRandom(),
    clerkId: text("clerk_id").unique().notNull(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    imageUrl: text("image_url").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => [uniqueIndex("clerk_id_idx").on(table.clerkId)],)