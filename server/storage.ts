import { 
  users, letItGoEntries, vaultEntries, moodEntries, letters, whispers, posts,
  type User, type UpsertUser, type LetItGoEntry, type InsertLetItGoEntry,
  type VaultEntry, type InsertVaultEntry, type MoodEntry, type InsertMoodEntry,
  type Letter, type InsertLetter, type Whisper, type InsertWhisper,
  type Post, type InsertPost
} from "@shared/schema";
import { db } from "./db";
import { eq, lt, desc } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Let It Go operations
  createLetItGoEntry(entry: InsertLetItGoEntry): Promise<LetItGoEntry>;
  getUserLetItGoEntries(userId: string): Promise<LetItGoEntry[]>;
  deleteExpiredLetItGoEntries(): Promise<void>;
  
  // Vault operations
  createVaultEntry(entry: InsertVaultEntry): Promise<VaultEntry>;
  getUserVaultEntries(userId: string): Promise<VaultEntry[]>;
  
  // Mood operations
  createMoodEntry(entry: InsertMoodEntry): Promise<MoodEntry>;
  getUserMoodEntries(userId: string): Promise<MoodEntry[]>;
  
  // Letter operations
  createLetter(letter: InsertLetter): Promise<Letter>;
  getUserLetters(userId: string): Promise<Letter[]>;
  
  // Whisper operations
  createWhisper(whisper: InsertWhisper): Promise<Whisper>;
  getUserWhispers(userId: string): Promise<Whisper[]>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPublicPosts(): Promise<Post[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
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

  // Let It Go operations
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
      .where(eq(letItGoEntries.userId, userId))
      .orderBy(desc(letItGoEntries.createdAt));
  }

  async deleteExpiredLetItGoEntries(): Promise<void> {
    const expiryTime = new Date();
    
    await db
      .delete(letItGoEntries)
      .where(lt(letItGoEntries.expiresAt, expiryTime));
  }

  // Vault operations
  async createVaultEntry(insertEntry: InsertVaultEntry): Promise<VaultEntry> {
    const id = `vault_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const entryData = {
      id,
      userId: insertEntry.userId,
      content: insertEntry.content,
      duration: insertEntry.duration
    };
    
    const [entry] = await db
      .insert(vaultEntries)
      .values(entryData)
      .returning();
    return entry;
  }

  async getUserVaultEntries(userId: string): Promise<VaultEntry[]> {
    return await db
      .select()
      .from(vaultEntries)
      .where(eq(vaultEntries.userId, userId))
      .orderBy(desc(vaultEntries.createdAt));
  }

  // Mood operations
  async createMoodEntry(insertEntry: InsertMoodEntry): Promise<MoodEntry> {
    const id = `mood_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const entryData = {
      id,
      userId: insertEntry.userId,
      mood: insertEntry.mood,
      note: insertEntry.note || null
    };
    
    const [entry] = await db
      .insert(moodEntries)
      .values(entryData)
      .returning();
    return entry;
  }

  async getUserMoodEntries(userId: string): Promise<MoodEntry[]> {
    return await db
      .select()
      .from(moodEntries)
      .where(eq(moodEntries.userId, userId))
      .orderBy(desc(moodEntries.createdAt));
  }

  // Letter operations
  async createLetter(insertLetter: InsertLetter): Promise<Letter> {
    const id = `letter_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const letterData = {
      id,
      userId: insertLetter.userId,
      to: insertLetter.to,
      content: insertLetter.content,
      style: insertLetter.style
    };
    
    const [letter] = await db
      .insert(letters)
      .values(letterData)
      .returning();
    return letter;
  }

  async getUserLetters(userId: string): Promise<Letter[]> {
    return await db
      .select()
      .from(letters)
      .where(eq(letters.userId, userId))
      .orderBy(desc(letters.createdAt));
  }

  // Whisper operations
  async createWhisper(insertWhisper: InsertWhisper): Promise<Whisper> {
    const id = `whisper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const whisperData = {
      id,
      userId: insertWhisper.userId,
      name: insertWhisper.name,
      duration: insertWhisper.duration,
      audioUrl: insertWhisper.audioUrl || null
    };
    
    const [whisper] = await db
      .insert(whispers)
      .values(whisperData)
      .returning();
    return whisper;
  }

  async getUserWhispers(userId: string): Promise<Whisper[]> {
    return await db
      .select()
      .from(whispers)
      .where(eq(whispers.userId, userId))
      .orderBy(desc(whispers.createdAt));
  }

  // Post operations
  async createPost(insertPost: InsertPost): Promise<Post> {
    const id = `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const postData = {
      id,
      userId: insertPost.userId,
      content: insertPost.content,
      mood: insertPost.mood,
      isAnonymous: insertPost.isAnonymous ?? true,
      likes: 0
    };
    
    const [post] = await db
      .insert(posts)
      .values(postData)
      .returning();
    return post;
  }

  async getPublicPosts(): Promise<Post[]> {
    return await db
      .select()
      .from(posts)
      .orderBy(desc(posts.createdAt))
      .limit(50); // Limit to recent 50 posts
  }
}

export const storage = new DatabaseStorage();