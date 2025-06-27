import { users, letItGoEntries, type User, type UpsertUser, type LetItGoEntry, type InsertLetItGoEntry } from "@shared/schema";
import { db } from "./db";
import { eq, lt } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  createLetItGoEntry(entry: InsertLetItGoEntry): Promise<LetItGoEntry>;
  getUserLetItGoEntries(userId: string): Promise<LetItGoEntry[]>;
  deleteExpiredLetItGoEntries(): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async createLetItGoEntry(insertEntry: InsertLetItGoEntry): Promise<LetItGoEntry> {
    const id = `entry_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);
    
    const entryData = {
      id,
      userId: insertEntry.userId,
      content: insertEntry.content,
      mode: insertEntry.mode,
      expiresAt: expiresAt
    };
    
    const [entry] = await db
      .insert(letItGoEntries)
      .values(entryData)
      .returning();
    return entry;
  }

  async getUserLetItGoEntries(userId: string): Promise<LetItGoEntry[]> {
    return await db
      .select()
      .from(letItGoEntries)
      .where(eq(letItGoEntries.userId, userId));
  }

  async deleteExpiredLetItGoEntries(): Promise<void> {
    const expiryTime = new Date();
    
    await db
      .delete(letItGoEntries)
      .where(lt(letItGoEntries.expiresAt, expiryTime));
  }
}

export const storage = new DatabaseStorage();