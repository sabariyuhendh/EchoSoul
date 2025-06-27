import { pgTable, text, varchar, integer, boolean, timestamp, jsonb, index, real } from "drizzle-orm/pg-core";
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

export const vaultEntries = pgTable("vault_entries", {
  id: text("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  duration: integer("duration").notNull(), // duration in seconds
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const moodEntries = pgTable("mood_entries", {
  id: text("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull(),
  mood: integer("mood").notNull(), // 1-10 scale
  note: text("note"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const letters = pgTable("letters", {
  id: text("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull(),
  to: varchar("to").notNull(),
  content: text("content").notNull(),
  style: text("style").notNull(), // 'romantic', 'angry', 'sad', 'grateful', 'original'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const whispers = pgTable("whispers", {
  id: text("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull(),
  name: varchar("name").notNull(),
  duration: real("duration").notNull(), // duration in seconds
  audioUrl: text("audio_url"), // URL to stored audio file
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const posts = pgTable("posts", {
  id: text("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull(),
  content: text("content").notNull(),
  mood: text("mood").notNull(), // 'calm', 'sage', 'lavender', 'rose', 'amber'
  likes: integer("likes").default(0),
  isAnonymous: boolean("is_anonymous").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// User types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

// Let It Go types
export const insertLetItGoEntrySchema = createInsertSchema(letItGoEntries).pick({
  userId: true,
  content: true,
  mode: true,
});
export type InsertLetItGoEntry = z.infer<typeof insertLetItGoEntrySchema>;
export type LetItGoEntry = typeof letItGoEntries.$inferSelect;

// Vault types
export const insertVaultEntrySchema = createInsertSchema(vaultEntries).pick({
  userId: true,
  content: true,
  duration: true,
});
export type InsertVaultEntry = z.infer<typeof insertVaultEntrySchema>;
export type VaultEntry = typeof vaultEntries.$inferSelect;

// Mood types
export const insertMoodEntrySchema = createInsertSchema(moodEntries).pick({
  userId: true,
  mood: true,
  note: true,
});
export type InsertMoodEntry = z.infer<typeof insertMoodEntrySchema>;
export type MoodEntry = typeof moodEntries.$inferSelect;

// Letter types
export const insertLetterSchema = createInsertSchema(letters).pick({
  userId: true,
  to: true,
  content: true,
  style: true,
});
export type InsertLetter = z.infer<typeof insertLetterSchema>;
export type Letter = typeof letters.$inferSelect;

// Whisper types
export const insertWhisperSchema = createInsertSchema(whispers).pick({
  userId: true,
  name: true,
  duration: true,
  audioUrl: true,
});
export type InsertWhisper = z.infer<typeof insertWhisperSchema>;
export type Whisper = typeof whispers.$inferSelect;

// Post types
export const insertPostSchema = createInsertSchema(posts).pick({
  userId: true,
  content: true,
  mood: true,
  isAnonymous: true,
});
export type InsertPost = z.infer<typeof insertPostSchema>;
export type Post = typeof posts.$inferSelect;
