import { 
  users, letItGoEntries, vaultEntries, moodEntries, letters, whispers, posts,
  smashModeStats, calmSpacePreferences, humourClubEntries, humourClubPolls, pollVotes, reflections, lyraConversations,
  chatSessions, chatMessages, userChatHistory,
  type User, type UpsertUser, type LetItGoEntry, type InsertLetItGoEntry,
  type VaultEntry, type InsertVaultEntry, type MoodEntry, type InsertMoodEntry,
  type Letter, type InsertLetter, type Whisper, type InsertWhisper,
  type Post, type InsertPost, type SmashModeStats, type InsertSmashModeStats,
  type CalmSpacePreferences, type InsertCalmSpacePreferences,
  type HumourClubEntry, type InsertHumourClubEntry,
  type HumourClubPoll, type InsertHumourClubPoll,
  type Reflection, type InsertReflection,
  type LyraConversation, type InsertLyraConversation,
  type ChatSession, type InsertChatSession,
  type ChatMessage, type InsertChatMessage,
  type UserChatHistory, type InsertUserChatHistory
} from "@shared/schema";
import { db } from "./db";
import { eq, lt, desc, sql, and } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserByGoogleId(googleId: string): Promise<User | undefined>;
  updateUser(id: string, userData: Partial<User>): Promise<User>;
  createUser(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User>;
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
  getUserWhisper(userId: string, whisperId: string): Promise<Whisper | null>;
  deleteWhisper(whisperId: string): Promise<void>;
  
  // Post operations
  createPost(post: InsertPost): Promise<Post>;
  getPublicPosts(): Promise<Post[]>;
  deletePost(postId: string, userId: string): Promise<void>;
  
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
  getUserPollVote(pollId: string, userId: string): Promise<number | null>;
  voteInHumourClubPoll(pollId: string, userId: string, optionIndex: number): Promise<HumourClubPoll>;
  deletePoll(pollId: string, userId: string): Promise<void>;
  
  // Reflection operations
  createReflection(reflection: InsertReflection): Promise<Reflection>;
  getUserReflections(userId: string): Promise<Reflection[]>;
  updateReflection(id: string, reflection: Partial<InsertReflection>): Promise<Reflection>;
  
  // Lyra conversation operations
  createLyraConversation(conversation: InsertLyraConversation): Promise<LyraConversation>;
  getUserLyraConversations(userId: string, sessionId?: string): Promise<LyraConversation[]>;
  getUserLyraSessions(userId: string): Promise<{sessionId: string, lastMessage: Date, messageCount: number}[]>;
  clearUserLyraHistory(userId: string): Promise<void>;
  
  // Chat operations
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(sessionId: string): Promise<ChatSession | undefined>;
  getUserChatSessions(userId: string): Promise<ChatSession[]>;
  endChatSession(sessionId: string): Promise<void>;
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  createUserChatHistory(history: InsertUserChatHistory): Promise<UserChatHistory>;
  getUserChatHistory(userId: string): Promise<UserChatHistory[]>;
  updateUserChatHistory(id: string, history: Partial<InsertUserChatHistory>): Promise<UserChatHistory>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.email, email));
      if (!result || result.length === 0) {
        return undefined;
      }
      const [user] = result;
      return user || undefined;
    } catch (error) {
      console.error('Database error in getUserByEmail:', error);
      throw new Error(`Failed to get user by email: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async getUserByGoogleId(googleId: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.googleId, googleId));
    return user || undefined;
  }

  async updateUser(id: string, userData: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...userData, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async createUser(userData: Omit<User, 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      const result = await db
        .insert(users)
        .values({ ...userData, createdAt: new Date(), updatedAt: new Date() })
        .returning();
      
      if (!result || result.length === 0) {
        throw new Error('Failed to create user: No data returned from database');
      }
      
      const [user] = result;
      if (!user) {
        throw new Error('Failed to create user: User object is undefined');
      }
      
      return user;
    } catch (error) {
      console.error('Database error in createUser:', error);
      // Re-throw with more context
      if (error instanceof Error) {
        throw new Error(`Failed to create user: ${error.message}`);
      }
      throw error;
    }
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

  async getUserWhisper(userId: string, whisperId: string): Promise<Whisper | null> {
    const result = await db
      .select()
      .from(whispers)
      .where(and(eq(whispers.userId, userId), eq(whispers.id, whisperId)))
      .limit(1);
    
    return result.length > 0 ? result[0] : null;
  }

  async deleteWhisper(whisperId: string): Promise<void> {
    await db
      .delete(whispers)
      .where(eq(whispers.id, whisperId));
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

  async deletePost(postId: string, userId: string): Promise<void> {
    // Verify the post belongs to the user before deleting
    const [post] = await db
      .select()
      .from(posts)
      .where(and(eq(posts.id, postId), eq(posts.userId, userId)))
      .limit(1);
    
    if (!post) {
      throw new Error("Post not found or you don't have permission to delete it");
    }
    
    await db
      .delete(posts)
      .where(eq(posts.id, postId));
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
    
    // Ensure options and votes are properly formatted as JSON arrays
    const options = Array.isArray(insertPoll.options) ? insertPoll.options : [];
    const votes = Array.isArray(insertPoll.votes) ? insertPoll.votes : options.map(() => 0);
    
    const pollData = {
      id,
      userId: insertPoll.userId,
      question: insertPoll.question,
      options: JSON.stringify(options),
      votes: JSON.stringify(votes),
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

  async getUserPollVote(pollId: string, userId: string): Promise<number | null> {
    const [vote] = await db
      .select()
      .from(pollVotes)
      .where(and(eq(pollVotes.pollId, pollId), eq(pollVotes.userId, userId)))
      .limit(1);
    
    return vote ? vote.optionIndex : null;
  }

  async voteInHumourClubPoll(pollId: string, userId: string, optionIndex: number): Promise<HumourClubPoll> {
    // Check if user has already voted
    const existingVote = await this.getUserPollVote(pollId, userId);
    if (existingVote !== null) {
      throw new Error("User has already voted in this poll");
    }

    const [poll] = await db
      .select()
      .from(humourClubPolls)
      .where(eq(humourClubPolls.id, pollId))
      .limit(1);
    
    if (!poll) {
      throw new Error("Poll not found");
    }
    
    // Record the vote
    const voteId = `poll_vote_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(pollVotes).values({
      id: voteId,
      pollId,
      userId,
      optionIndex,
    });
    
    // Update vote counts
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

  async deletePoll(pollId: string, userId: string): Promise<void> {
    // Verify the poll belongs to the user before deleting
    const [poll] = await db
      .select()
      .from(humourClubPolls)
      .where(and(eq(humourClubPolls.id, pollId), eq(humourClubPolls.userId, userId)))
      .limit(1);
    
    if (!poll) {
      throw new Error("Poll not found or you don't have permission to delete it");
    }
    
    // Delete all votes for this poll
    await db
      .delete(pollVotes)
      .where(eq(pollVotes.pollId, pollId));
    
    // Delete the poll
    await db
      .delete(humourClubPolls)
      .where(eq(humourClubPolls.id, pollId));
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

  // Lyra conversation operations
  async createLyraConversation(insertConversation: InsertLyraConversation): Promise<LyraConversation> {
    const id = `lyra_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const conversationData = {
      id,
      userId: insertConversation.userId,
      sessionId: insertConversation.sessionId,
      userMessage: insertConversation.userMessage,
      lyraResponse: insertConversation.lyraResponse,
      mood: insertConversation.mood || null,
      messageIndex: insertConversation.messageIndex
    };
    
    const [conversation] = await db
      .insert(lyraConversations)
      .values(conversationData)
      .returning();
    return conversation;
  }

  async getUserLyraConversations(userId: string, sessionId?: string): Promise<LyraConversation[]> {
    let whereClause = eq(lyraConversations.userId, userId);
    
    if (sessionId) {
      whereClause = and(whereClause, eq(lyraConversations.sessionId, sessionId)) as any;
    }
    
    return await db
      .select()
      .from(lyraConversations)
      .where(whereClause)
      .orderBy(desc(lyraConversations.createdAt));
  }

  async getUserLyraSessions(userId: string): Promise<{sessionId: string, lastMessage: Date, messageCount: number}[]> {
    const sessions = await db
      .select({
        sessionId: lyraConversations.sessionId,
        lastMessage: sql<Date>`max(${lyraConversations.createdAt})`.as('lastMessage'),
        messageCount: sql<number>`count(*)`.as('messageCount')
      })
      .from(lyraConversations)
      .where(eq(lyraConversations.userId, userId))
      .groupBy(lyraConversations.sessionId)
      .orderBy(desc(sql`max(${lyraConversations.createdAt})`));
    
    return sessions;
  }

  async clearUserLyraHistory(userId: string): Promise<void> {
    await db
      .delete(lyraConversations)
      .where(eq(lyraConversations.userId, userId));
  }

  // Chat operations
  async createChatSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const sessionData = {
      id,
      userId1: insertSession.userId1,
      userId2: insertSession.userId2,
      status: insertSession.status || 'active'
    };
    
    const [session] = await db
      .insert(chatSessions)
      .values(sessionData)
      .returning();
    return session;
  }

  async getChatSession(sessionId: string): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, sessionId));
    return session || undefined;
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    return await db
      .select()
      .from(chatSessions)
      .where(
        sql`${chatSessions.userId1} = ${userId} OR ${chatSessions.userId2} = ${userId}`
      )
      .orderBy(desc(chatSessions.startedAt));
  }

  async endChatSession(sessionId: string): Promise<void> {
    await db
      .update(chatSessions)
      .set({ 
        status: 'ended',
        endedAt: new Date()
      })
      .where(eq(chatSessions.id, sessionId));
  }

  async createChatMessage(insertMessage: InsertChatMessage): Promise<ChatMessage> {
    const id = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const messageData = {
      id,
      sessionId: insertMessage.sessionId,
      senderId: insertMessage.senderId,
      content: insertMessage.content
    };
    
    const [message] = await db
      .insert(chatMessages)
      .values(messageData)
      .returning();
    return message;
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  }

  async createUserChatHistory(insertHistory: InsertUserChatHistory): Promise<UserChatHistory> {
    const id = `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const historyData = {
      id,
      userId: insertHistory.userId,
      sessionId: insertHistory.sessionId,
      partnerId: insertHistory.partnerId,
      messages: insertHistory.messages || [],
      summary: insertHistory.summary || null
    };
    
    const [history] = await db
      .insert(userChatHistory)
      .values(historyData)
      .returning();
    return history;
  }

  async getUserChatHistory(userId: string): Promise<UserChatHistory[]> {
    return await db
      .select()
      .from(userChatHistory)
      .where(eq(userChatHistory.userId, userId))
      .orderBy(desc(userChatHistory.createdAt));
  }

  async updateUserChatHistory(id: string, history: Partial<InsertUserChatHistory>): Promise<UserChatHistory> {
    const [updated] = await db
      .update(userChatHistory)
      .set({ ...history, updatedAt: new Date() })
      .where(eq(userChatHistory.id, id))
      .returning();
    return updated;
  }
}

export const storage = new DatabaseStorage();