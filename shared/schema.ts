import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const letItGoEntries = pgTable("let_it_go_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  content: text("content").notNull(),
  mode: text("mode").notNull(), // 'burn', 'smash', 'scream'
  createdAt: timestamp("created_at").defaultNow().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertLetItGoEntrySchema = createInsertSchema(letItGoEntries).pick({
  userId: true,
  content: true,
  mode: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertLetItGoEntry = z.infer<typeof insertLetItGoEntrySchema>;
export type LetItGoEntry = typeof letItGoEntries.$inferSelect;
