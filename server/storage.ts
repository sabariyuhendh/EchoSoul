import { users, letItGoEntries, type User, type InsertUser, type LetItGoEntry, type InsertLetItGoEntry } from "@shared/schema";
import { db } from "./db";
import { eq, lt } from "drizzle-orm";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createLetItGoEntry(entry: InsertLetItGoEntry): Promise<LetItGoEntry>;
  getUserLetItGoEntries(userId: number): Promise<LetItGoEntry[]>;
  deleteExpiredLetItGoEntries(): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private letItGoEntries: Map<number, LetItGoEntry>;
  currentId: number;
  letItGoCurrentId: number;

  constructor() {
    this.users = new Map();
    this.letItGoEntries = new Map();
    this.currentId = 1;
    this.letItGoCurrentId = 1;
    
    // Clean up expired entries every 5 minutes
    setInterval(() => {
      this.deleteExpiredLetItGoEntries();
    }, 5 * 60 * 1000);
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async createLetItGoEntry(insertEntry: InsertLetItGoEntry): Promise<LetItGoEntry> {
    const id = this.letItGoCurrentId++;
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
    
    const entry: LetItGoEntry = {
      id,
      userId: insertEntry.userId,
      content: insertEntry.content,
      mode: insertEntry.mode,
      createdAt: now,
      expiresAt: expiresAt,
    };
    
    this.letItGoEntries.set(id, entry);
    return entry;
  }

  async getUserLetItGoEntries(userId: number): Promise<LetItGoEntry[]> {
    const now = new Date();
    return Array.from(this.letItGoEntries.values())
      .filter(entry => entry.userId === userId && entry.expiresAt > now)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async deleteExpiredLetItGoEntries(): Promise<void> {
    const now = new Date();
    const expiredIds: number[] = [];
    
    Array.from(this.letItGoEntries.entries()).forEach(([id, entry]) => {
      if (entry.expiresAt <= now) {
        expiredIds.push(id);
      }
    });
    
    expiredIds.forEach(id => this.letItGoEntries.delete(id));
  }
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createLetItGoEntry(insertEntry: InsertLetItGoEntry): Promise<LetItGoEntry> {
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24); // Expire after 24 hours
    
    const entryData = {
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

  async getUserLetItGoEntries(userId: number): Promise<LetItGoEntry[]> {
    return await db
      .select()
      .from(letItGoEntries)
      .where(eq(letItGoEntries.userId, userId));
  }

  async deleteExpiredLetItGoEntries(): Promise<void> {
    const expiryTime = new Date();
    expiryTime.setHours(expiryTime.getHours() - 24);
    
    await db
      .delete(letItGoEntries)
      .where(lt(letItGoEntries.createdAt, expiryTime));
  }
}

export const storage = new DatabaseStorage();
