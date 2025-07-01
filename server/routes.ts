import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./replitAuth";
import { insertLetItGoEntrySchema, insertMoodEntrySchema, insertLetterSchema, insertVaultEntrySchema, insertWhisperSchema, insertPostSchema } from "@shared/schema";
import { z } from "zod";
import { getCalmPreferences, saveCalmPreferences, logMeditationSession, getMeditationStats } from './calmSpaceRoutes';

export async function registerRoutes(app: Express): Promise<Server> {
  // Temporarily disable auth for development
  // await setupAuth(app);

  // Mock auth routes for development
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      // Return a mock user for development
      const mockUser = {
        id: "dev-user-1",
        email: "developer@echosoul.dev",
        firstName: "Dev",
        lastName: "User",
        profileImageUrl: null,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      res.json(mockUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Mock signup route for development
  app.post('/api/signup', async (req: any, res) => {
    try {
      // In development, just redirect to Google OAuth
      res.json({ redirectUrl: '/api/login' });
    } catch (error) {
      console.error("Error during signup:", error);
      res.status(500).json({ message: "Failed to sign up" });
    }
  });

  // Mock auth signup route for development
  app.post('/api/auth/signup', async (req: any, res) => {
    try {
      // In development, just return success
      res.json({ success: true, message: "Please use Google OAuth to sign in" });
    } catch (error) {
      console.error("Error during signup:", error);
      res.status(500).json({ message: "Failed to sign up" });
    }
  });

  // Let It Go Room API endpoints
  app.post("/api/letitgo", async (req: any, res) => {
    try {
      const userId = "dev-user-1"; // Mock user ID for development

      const validatedData = insertLetItGoEntrySchema.parse({
        ...req.body,
        userId
      });

      const entry = await storage.createLetItGoEntry(validatedData);
      res.json({ success: true, entry });
    } catch (error) {
      console.error("Error creating Let It Go entry:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/letitgo", async (req: any, res) => {
    try {
      const userId = "dev-user-1"; // Mock user ID for development
      const entries = await storage.getUserLetItGoEntries(userId);
      res.json({ entries });
    } catch (error) {
      console.error("Error fetching Let It Go entries:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vault API endpoints
  app.post("/api/vault", async (req: any, res) => {
    try {
      const userId = "dev-user-1";
      const validatedData = insertVaultEntrySchema.parse({
        ...req.body,
        userId
      });

      const entry = await storage.createVaultEntry(validatedData);
      res.json({ success: true, entry });
    } catch (error) {
      console.error("Error creating vault entry:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/vault", async (req: any, res) => {
    try {
      const userId = "dev-user-1";
      const entries = await storage.getUserVaultEntries(userId);
      res.json({ entries });
    } catch (error) {
      console.error("Error fetching vault entries:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Mood API endpoints
  app.post("/api/mood", async (req: any, res) => {
    try {
      const userId = "dev-user-1";
      const validatedData = insertMoodEntrySchema.parse({
        ...req.body,
        userId
      });

      const entry = await storage.createMoodEntry(validatedData);
      res.json({ success: true, entry });
    } catch (error) {
      console.error("Error creating mood entry:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/mood", async (req: any, res) => {
    try {
      const userId = "dev-user-1";
      const entries = await storage.getUserMoodEntries(userId);
      res.json({ entries });
    } catch (error) {
      console.error("Error fetching mood entries:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Letters API endpoints
  app.post("/api/letters", async (req: any, res) => {
    try {
      const userId = "dev-user-1";
      const validatedData = insertLetterSchema.parse({
        ...req.body,
        userId
      });

      const letter = await storage.createLetter(validatedData);
      res.json({ success: true, letter });
    } catch (error) {
      console.error("Error creating letter:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/letters", async (req: any, res) => {
    try {
      const userId = "dev-user-1";
      const letters = await storage.getUserLetters(userId);
      res.json({ letters });
    } catch (error) {
      console.error("Error fetching letters:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Whisper API endpoints
  app.post("/api/whisper", async (req: any, res) => {
    try {
      const userId = "dev-user-1";
      const validatedData = insertWhisperSchema.parse({
        ...req.body,
        userId
      });

      const whisper = await storage.createWhisper(validatedData);
      res.json({ success: true, whisper });
    } catch (error) {
      console.error("Error creating whisper:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.get("/api/whisper", async (req: any, res) => {
    try {
      const userId = "dev-user-1";
      const whispers = await storage.getUserWhispers(userId);
      res.json({ whispers });
    } catch (error) {
      console.error("Error fetching whispers:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Feed API endpoints
  app.get("/api/feed", async (req, res) => {
    try {
      const posts = await storage.getPublicPosts();
      res.json({ posts });
    } catch (error) {
      console.error("Error fetching feed:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/feed", async (req: any, res) => {
    try {
      const userId = "dev-user-1";
      const validatedData = insertPostSchema.parse({
        ...req.body,
        userId
      });

      const post = await storage.createPost(validatedData);
      res.json({ success: true, post });
    } catch (error) {
      console.error("Error creating post:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

    // Calm Space API endpoints
    app.get("/api/calm/preferences", getCalmPreferences);
    app.post("/api/calm/preferences", saveCalmPreferences);
    app.post("/api/calm/meditation", logMeditationSession);
    app.get("/api/calm/meditation/stats", getMeditationStats);
    
    // Smash Mode API endpoints
    app.post("/api/smash/stats", async (req: any, res) => {
      try {
        const userId = req.user?.id || "dev-user-1";
        const { objectType, smashForce, destructionPattern, emotionalRelease, sessionId } = req.body;
        
        const stats = await storage.createSmashModeStats({
          userId,
          objectType,
          smashForce,
          destructionPattern,
          emotionalRelease,
          sessionId
        });
        
        res.json({ success: true, stats });
      } catch (error) {
        console.error("Error saving smash stats:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    
    app.get("/api/smash/stats", async (req: any, res) => {
      try {
        const userId = req.user?.id || "dev-user-1";
        const stats = await storage.getUserSmashModeStats(userId);
        res.json({ stats });
      } catch (error) {
        console.error("Error fetching smash stats:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);
  return httpServer;
}