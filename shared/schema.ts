import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const letItGoEntries = pgTable("let_it_go_entries", {
  id: text("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  mode: text("mode").notNull(), // 'burn', 'smash', 'scream'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export const insertLetItGoEntrySchema = createInsertSchema(letItGoEntries).pick({
  userId: true,
  content: true,
  mode: true,
});

export type InsertLetItGoEntry = z.infer<typeof insertLetItGoEntrySchema>;
export type LetItGoEntry = typeof letItGoEntries.$inferSelect;
