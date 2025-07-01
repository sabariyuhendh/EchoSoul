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

// User storage table for Replit Auth and Google OAuth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().notNull(),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  googleId: varchar("google_id"),
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

// Smash mode analytics and preferences
export const smashModeStats = pgTable("smash_mode_stats", {
  id: text("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull(),
  objectType: text("object_type").notNull(), // 'crystal_orb', 'ceramic_vase', 'glass_bottle', 'metal_cube'
  smashForce: real("smash_force").notNull(), // 0-100
  destructionPattern: text("destruction_pattern"), // physics pattern used
  emotionalRelease: integer("emotional_release"), // user rating 1-10
  sessionId: text("session_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const calmSpacePreferences = pgTable("calm_space_preferences", {
  id: text("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull().unique(),
  favoriteTrack: integer("favorite_track").default(0),
  volume: real("volume").default(0.7),
  breathingPattern: jsonb("breathing_pattern").default({ inhale: 4, hold: 4, exhale: 6 }),
  ambientSounds: boolean("ambient_sounds").default(true),
  cosmicDebrisEnabled: boolean("cosmic_debris_enabled").default(true),
  debrisIntensity: real("debris_intensity").default(0.5),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const humourClubEntries = pgTable("humour_club_entries", {
  id: text("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull(),
  type: text("type").notNull(), // 'joke', 'meme', 'poll', 'game_score', 'gif_reaction'
  content: text("content").notNull(),
  metadata: jsonb("metadata"), // JSON object for additional data
  isPublic: boolean("is_public").default(false),
  likes: integer("likes").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const humourClubPolls = pgTable("humour_club_polls", {
  id: text("id").primaryKey().notNull(),
  userId: varchar("user_id").notNull(),
  question: text("question").notNull(),
  options: jsonb("options").notNull(), // Array of poll options
  votes: jsonb("votes").notNull().default([]), // Array of vote counts
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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

// Smash mode types
export const insertSmashModeStatsSchema = createInsertSchema(smashModeStats).pick({
  userId: true,
  objectType: true,
  smashForce: true,
  destructionPattern: true,
  emotionalRelease: true,
  sessionId: true,
});
export type InsertSmashModeStats = z.infer<typeof insertSmashModeStatsSchema>;
export type SmashModeStats = typeof smashModeStats.$inferSelect;

// Calm space preference types  
export const insertCalmSpacePreferencesSchema = createInsertSchema(calmSpacePreferences).pick({
  userId: true,
  favoriteTrack: true,
  volume: true,
  breathingPattern: true,
  ambientSounds: true,
  cosmicDebrisEnabled: true,
  debrisIntensity: true,
});
export type InsertCalmSpacePreferences = z.infer<typeof insertCalmSpacePreferencesSchema>;
export type CalmSpacePreferences = typeof calmSpacePreferences.$inferSelect;

// Humour Club types
export const insertHumourClubEntrySchema = createInsertSchema(humourClubEntries).pick({
  userId: true,
  type: true,
  content: true,
  metadata: true,
  isPublic: true,
});
export type InsertHumourClubEntry = z.infer<typeof insertHumourClubEntrySchema>;
export type HumourClubEntry = typeof humourClubEntries.$inferSelect;

export const insertHumourClubPollSchema = createInsertSchema(humourClubPolls).pick({
  userId: true,
  question: true,
  options: true,
  votes: true,
  isActive: true,
});
export type InsertHumourClubPoll = z.infer<typeof insertHumourClubPollSchema>;
export type HumourClubPoll = typeof humourClubPolls.$inferSelect;
