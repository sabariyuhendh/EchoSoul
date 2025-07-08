import { 
  users, letItGoEntries, vaultEntries, moodEntries, letters, whispers, posts,
  smashModeStats, calmSpacePreferences, humourClubEntries, humourClubPolls,
  type User, type UpsertUser, type LetItGoEntry, type InsertLetItGoEntry,
  type VaultEntry, type InsertVaultEntry, type MoodEntry, type InsertMoodEntry,
  type Letter, type InsertLetter, type Whisper, type InsertWhisper,
  type Post, type InsertPost, type SmashModeStats, type InsertSmashModeStats,
  type CalmSpacePreferences, type InsertCalmSpacePreferences,
  type HumourClubEntry, type InsertHumourClubEntry,
  type HumourClubPoll, type InsertHumourClubPoll,
  type Reflection, type InsertReflection
} from "@shared/schema";
import { db } from "./db";
import { eq, lt, desc, sql } from "drizzle-orm";

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
  
  // Smash mode operations
  createSmashModeStats(stats: InsertSmashModeStats): Promise<SmashModeStats>;
  getUserSmashModeStats(userId: string): Promise<SmashModeStats[]>;
  
  // Calm space preferences operations
  getCalmSpacePreferences(userId: string): Promise<CalmSpacePreferences | undefined>;
  upsertCalmSpacePreferences(prefs: InsertCalmSpacePreferences): Promise<CalmSpacePreferences>;

  // Humour Club operations
  createHumourClubEntry(entry: InsertHumourClubEntry): Promise<HumourClubEntry>;
  getUserHumourClubEntries(userId: string): Promise<HumourClubEntry[]>;
  getPublicHumourClubEntries(): Promise<HumourClubEntry[]>;
  likeHumourClubEntry(entryId: string): Promise<void>;
  
  // Humour Club Poll operations
  createHumourClubPoll(poll: InsertHumourClubPoll): Promise<HumourClubPoll>;
  getActiveHumourClubPolls(): Promise<HumourClubPoll[]>;
  voteInHumourClubPoll(pollId: string, optionIndex: number): Promise<HumourClubPoll>;
  
  // Reflection operations
  createReflection(reflection: InsertReflection): Promise<Reflection>;
  getUserReflections(userId: string): Promise<Reflection[]>;
  updateReflection(id: string, reflection: Partial<InsertReflection>): Promise<Reflection>;
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

  // Smash mode operations
  async createSmashModeStats(stats: InsertSmashModeStats): Promise<SmashModeStats> {
    const id = `smash_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const statsData = {
      id,
      userId: stats.userId,
      objectType: stats.objectType,
      smashForce: stats.smashForce,
      destructionPattern: stats.destructionPattern || null,
      emotionalRelease: stats.emotionalRelease || null,
      sessionId: stats.sessionId
    };
    
    const [smashStats] = await db
      .insert(smashModeStats)
      .values(statsData)
      .returning();
    return smashStats;
  }

  async getUserSmashModeStats(userId: string): Promise<SmashModeStats[]> {
    return await db
      .select()
      .from(smashModeStats)
      .where(eq(smashModeStats.userId, userId))
      .orderBy(desc(smashModeStats.createdAt));
  }

  // Calm space preferences operations
  async getCalmSpacePreferences(userId: string): Promise<CalmSpacePreferences | undefined> {
    const [prefs] = await db
      .select()
      .from(calmSpacePreferences)
      .where(eq(calmSpacePreferences.userId, userId))
      .limit(1);
    return prefs;
  }

  async upsertCalmSpacePreferences(prefs: InsertCalmSpacePreferences): Promise<CalmSpacePreferences> {
    const id = `calm_prefs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const prefsData = {
      id,
      userId: prefs.userId,
      favoriteTrack: prefs.favoriteTrack ?? 0,
      volume: prefs.volume ?? 0.7,
      breathingPattern: prefs.breathingPattern ?? { inhale: 4, hold: 4, exhale: 6 },
      ambientSounds: prefs.ambientSounds ?? true,
      cosmicDebrisEnabled: prefs.cosmicDebrisEnabled ?? true,
      debrisIntensity: prefs.debrisIntensity ?? 0.5,
      updatedAt: new Date()
    };
    
    const [preference] = await db
      .insert(calmSpacePreferences)
      .values(prefsData)
      .onConflictDoUpdate({
        target: calmSpacePreferences.userId,
        set: {
          favoriteTrack: prefsData.favoriteTrack,
          volume: prefsData.volume,
          breathingPattern: prefsData.breathingPattern,
          ambientSounds: prefsData.ambientSounds,
          cosmicDebrisEnabled: prefsData.cosmicDebrisEnabled,
          debrisIntensity: prefsData.debrisIntensity,
          updatedAt: prefsData.updatedAt
        }
      })
      .returning();
    return preference;
  }

  // Humour Club operations
  async createHumourClubEntry(insertEntry: InsertHumourClubEntry): Promise<HumourClubEntry> {
    const id = `humour_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const entryData = {
      id,
      userId: insertEntry.userId,
      type: insertEntry.type,
      content: insertEntry.content,
      metadata: insertEntry.metadata || null,
      isPublic: insertEntry.isPublic ?? false,
      likes: 0
    };
    
    const [entry] = await db
      .insert(humourClubEntries)
      .values(entryData)
      .returning();
    return entry;
  }

  async getUserHumourClubEntries(userId: string): Promise<HumourClubEntry[]> {
    return await db
      .select()
      .from(humourClubEntries)
      .where(eq(humourClubEntries.userId, userId))
      .orderBy(desc(humourClubEntries.createdAt));
  }

  async getPublicHumourClubEntries(): Promise<HumourClubEntry[]> {
    return await db
      .select()
      .from(humourClubEntries)
      .where(eq(humourClubEntries.isPublic, true))
      .orderBy(desc(humourClubEntries.createdAt))
      .limit(50);
  }

  async likeHumourClubEntry(entryId: string): Promise<void> {
    const [entry] = await db
      .select({ likes: humourClubEntries.likes })
      .from(humourClubEntries)
      .where(eq(humourClubEntries.id, entryId))
      .limit(1);
      
    if (entry) {
      await db
        .update(humourClubEntries)
        .set({ likes: (entry.likes || 0) + 1, updatedAt: new Date() })
        .where(eq(humourClubEntries.id, entryId));
    }
  }

  // Humour Club Poll operations
  async createHumourClubPoll(insertPoll: InsertHumourClubPoll): Promise<HumourClubPoll> {
    const id = `poll_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const pollData = {
      id,
      userId: insertPoll.userId,
      question: insertPoll.question,
      options: insertPoll.options,
      votes: insertPoll.votes || [],
      isActive: insertPoll.isActive ?? true
    };
    
    const [poll] = await db
      .insert(humourClubPolls)
      .values(pollData)
      .returning();
    return poll;
  }

  async getActiveHumourClubPolls(): Promise<HumourClubPoll[]> {
    return await db
      .select()
      .from(humourClubPolls)
      .where(eq(humourClubPolls.isActive, true))
      .orderBy(desc(humourClubPolls.createdAt))
      .limit(10);
  }

  async voteInHumourClubPoll(pollId: string, optionIndex: number): Promise<HumourClubPoll> {
    const [poll] = await db
      .select()
      .from(humourClubPolls)
      .where(eq(humourClubPolls.id, pollId))
      .limit(1);
    
    if (!poll) {
      throw new Error("Poll not found");
    }
    
    const votes = Array.isArray(poll.votes) ? [...(poll.votes as number[])] : [];
    while (votes.length <= optionIndex) {
      votes.push(0);
    }
    votes[optionIndex] = (votes[optionIndex] || 0) + 1;
    
    const [updatedPoll] = await db
      .update(humourClubPolls)
      .set({ votes, updatedAt: new Date() })
      .where(eq(humourClubPolls.id, pollId))
      .returning();
    
    return updatedPoll;
  }
  // Reflection operations
  async createReflection(insertReflection: InsertReflection): Promise<Reflection> {
    const id = `reflection_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const reflectionData = {
      id,
      userId: insertReflection.userId,
      questionIndex: insertReflection.questionIndex,
      question: insertReflection.question,
      answer: insertReflection.answer,
      category: insertReflection.category,
    };
    
    // Check if reflection already exists for this user and question
    const [existingReflection] = await db
      .select()
      .from(reflections)
      .where(
        sql`${reflections.userId} = ${insertReflection.userId} AND ${reflections.questionIndex} = ${insertReflection.questionIndex}`
      )
      .limit(1);
    
    if (existingReflection) {
      // Update existing reflection
      const [updatedReflection] = await db
        .update(reflections)
        .set({
          answer: insertReflection.answer,
          updatedAt: new Date(),
        })
        .where(eq(reflections.id, existingReflection.id))
        .returning();
      return updatedReflection;
    } else {
      // Create new reflection
      const [reflection] = await db
        .insert(reflections)
        .values(reflectionData)
        .returning();
      return reflection;
    }
  }

  async getUserReflections(userId: string): Promise<Reflection[]> {
    return await db
      .select()
      .from(reflections)
      .where(eq(reflections.userId, userId))
      .orderBy(desc(reflections.updatedAt));
  }

  async updateReflection(id: string, updateData: Partial<InsertReflection>): Promise<Reflection> {
    const [updatedReflection] = await db
      .update(reflections)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(reflections.id, id))
      .returning();
    return updatedReflection;
  }
}

export const storage = new DatabaseStorage();