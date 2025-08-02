import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth } from "./replitAuth";
import { insertLetItGoEntrySchema, insertMoodEntrySchema, insertLetterSchema, insertVaultEntrySchema, insertWhisperSchema, insertPostSchema, insertHumourClubEntrySchema, insertHumourClubPollSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import { getCalmPreferences, saveCalmPreferences, logMeditationSession, getMeditationStats } from './calmSpaceRoutes';
import { isAuthenticated } from './replitAuth';
import passport from 'passport';
import bcrypt from 'bcrypt';
import crypto from 'crypto';

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable real authentication
  await setupAuth(app);

  // Real auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      res.json(req.user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Google OAuth routes
  app.get('/auth/google', 
    passport.authenticate('google', { scope: ['profile', 'email'] })
  );

  app.get('/auth/google/callback', 
    passport.authenticate('google', { failureRedirect: '/login' }),
    (req, res) => {
      // Successful authentication, redirect to home
      res.redirect('/');
    }
  );

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  // Email/Password authentication endpoints
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Check if user already exists
      const existingUser = await storage.getUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists with this email' });
      }

      // Hash the password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create new user with UUID-compatible ID
      const userId = crypto.randomUUID();
      const userData = {
        id: userId,
        email,
        firstName: firstName || 'User',
        lastName: lastName || '',
        profileImageUrl: '',
        passwordHash
      };

      const user = await storage.upsertUser(userData);
      
      // Log the user in automatically
      req.login(user, (err) => {
        if (err) {
          console.error('Auto-login error:', err);
          return res.status(201).json({ success: true, user: { id: user.id, email: user.email } });
        }
        res.status(201).json({ success: true, user: { id: user.id, email: user.email } });
      });

    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      // Find user by email
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Check password
      const passwordMatch = await bcrypt.compare(password, user.passwordHash);
      if (!passwordMatch) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Log the user in
      req.login(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ error: 'Failed to log in' });
        }
        res.json({ success: true, user: { id: user.id, email: user.email } });
      });

    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Handle GET request to /api/login - redirect to login page
  app.get('/api/login', (req, res) => {
    res.redirect('/login');
  });

  // Handle Google OAuth (mock for development)
  app.get('/api/auth/google', (req, res) => {
    res.redirect('/login');
  });

  // Let It Go Room API endpoints
  app.post("/api/letitgo", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;

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

  app.get("/api/letitgo", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const entries = await storage.getUserLetItGoEntries(userId);
      res.json({ entries });
    } catch (error) {
      console.error("Error fetching Let It Go entries:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Vault API endpoints
  app.post("/api/vault", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.get("/api/vault", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const entries = await storage.getUserVaultEntries(userId);
      res.json({ entries });
    } catch (error) {
      console.error("Error fetching vault entries:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Mood API endpoints
  app.post("/api/mood", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.get("/api/mood", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const entries = await storage.getUserMoodEntries(userId);
      res.json({ entries });
    } catch (error) {
      console.error("Error fetching mood entries:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Letters API endpoints
  app.post("/api/letters", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.get("/api/letters", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const letters = await storage.getUserLetters(userId);
      res.json({ letters });
    } catch (error) {
      console.error("Error fetching letters:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Whisper API endpoints
  app.post("/api/whisper", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.get("/api/whisper", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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

  app.post("/api/feed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
    app.post("/api/smash/stats", isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.id;
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
    
    app.get("/api/smash/stats", isAuthenticated, async (req: any, res) => {
      try {
        const userId = req.user.id;
        const stats = await storage.getUserSmashModeStats(userId);
        res.json({ stats });
      } catch (error) {
        console.error("Error fetching smash stats:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });

  // Initialize OpenAI with API key
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  // Humour Club API endpoints
  app.get("/api/humour/entries", async (req: any, res) => {
    try {
      const entries = await storage.getPublicHumourClubEntries();
      res.json({ entries });
    } catch (error) {
      console.error("Error fetching humour entries:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/humour/entries", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const validatedData = insertHumourClubEntrySchema.parse({
        ...req.body,
        userId
      });

      const entry = await storage.createHumourClubEntry(validatedData);
      res.json({ success: true, entry });
    } catch (error) {
      console.error("Error creating humour entry:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.post("/api/humour/entries/:id/like", isAuthenticated, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.likeHumourClubEntry(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking humour entry:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Humour Club AI Joke endpoint
  app.post("/api/humour/joke", isAuthenticated, async (req: any, res) => {
    const { category = "general" } = req.body;
    
    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
        messages: [
          {
            role: "system",
            content: "You are a wholesome, positive joke generator. Create clean, uplifting jokes that would make someone smile. Keep them light-hearted and appropriate for all audiences. Avoid dark humor, controversial topics, or anything that could be offensive."
          },
          {
            role: "user",
            content: `Tell me a ${category} joke that's clean, positive, and will make someone laugh or smile.`
          }
        ],
        max_tokens: 150,
      });

      const joke = response.choices[0].message.content;
      res.json({ joke });
    } catch (error) {
      console.error("Error generating joke:", error);
      
      // Fallback jokes when OpenAI is unavailable
      const fallbackJokes = {
        general: [
          "Why don't scientists trust atoms? Because they make up everything!",
          "What do you call a fake noodle? An impasta!",
          "Why did the scarecrow win an award? He was outstanding in his field!",
          "What do you call a dinosaur that crashes his car? Tyrannosaurus Wrecks!",
          "Why don't eggs tell jokes? They'd crack each other up!"
        ],
        dad: [
          "I'm reading a book about anti-gravity. It's impossible to put down!",
          "Why don't scientists trust atoms? Because they make up everything!",
          "What did the ocean say to the beach? Nothing, it just waved!",
          "Why do fish live in saltwater? Because pepper makes them sneeze!"
        ]
      };
      
      const jokes = fallbackJokes[category as keyof typeof fallbackJokes] || fallbackJokes.general;
      const randomJoke = jokes[Math.floor(Math.random() * jokes.length)];
      res.json({ joke: randomJoke });
    }
  });

  // Humour Club Meme endpoint
  app.get("/api/humour/meme", async (req: any, res) => {
    try {
      // Predefined collection of positive, uplifting memes
      const memes = [
        {
          text: "When you finally understand a concept you've been struggling with",
          image: "🎯",
          category: "success"
        },
        {
          text: "Me trying to adult responsibly vs me wanting to stay in bed",
          image: "⚖️",
          category: "relatable"
        },
        {
          text: "When you remember something funny and start laughing alone",
          image: "😂",
          category: "everyday"
        },
        {
          text: "That feeling when you complete all your tasks for the day",
          image: "✅",
          category: "productivity"
        },
        {
          text: "When your favorite song comes on shuffle",
          image: "🎵",
          category: "music"
        },
        {
          text: "Me pretending I have my life together",
          image: "🎭",
          category: "life"
        },
        {
          text: "When you find money in your old jacket pocket",
          image: "💰",
          category: "surprise"
        },
        {
          text: "The satisfaction of peeling the plastic off new electronics",
          image: "📱",
          category: "satisfaction"
        }
      ];

      const randomMeme = memes[Math.floor(Math.random() * memes.length)];
      res.json({ meme: randomMeme });
    } catch (error) {
      console.error("Error getting meme:", error);
      res.status(500).json({ error: "Failed to get meme" });
    }
  });

  // Humour Club Polls
  app.get("/api/humour/polls", async (req: any, res) => {
    try {
      const polls = await storage.getActiveHumourClubPolls();
      res.json({ polls });
    } catch (error) {
      console.error("Error fetching polls:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/humour/polls", async (req: any, res) => {
    try {
      const userId = req.user?.id || "dev-user-1";
      const validatedData = insertHumourClubPollSchema.parse({
        ...req.body,
        userId
      });

      const poll = await storage.createHumourClubPoll(validatedData);
      res.json({ success: true, poll });
    } catch (error) {
      console.error("Error creating poll:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: "Invalid data", details: error.errors });
      } else {
        res.status(500).json({ error: "Internal server error" });
      }
    }
  });

  app.post("/api/humour/polls/:id/vote", async (req: any, res) => {
    try {
      const { id } = req.params;
      const { optionIndex } = req.body;
      
      if (typeof optionIndex !== 'number' || optionIndex < 0) {
        return res.status(400).json({ error: "Invalid option index" });
      }

      const poll = await storage.voteInHumourClubPoll(id, optionIndex);
      res.json({ success: true, poll });
    } catch (error) {
      console.error("Error voting in poll:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Reflection routes
  app.get('/api/reflections', async (req, res) => {
    try {
      const userId = "dev-user-1"; // Mock user ID for development

      const userReflections = await storage.getUserReflections(userId);
      res.json(userReflections);
    } catch (error) {
      console.error('Error fetching reflections:', error);
      res.status(500).json({ error: 'Failed to fetch reflections' });
    }
  });

  app.post('/api/reflections', async (req, res) => {
    try {
      const userId = "dev-user-1"; // Mock user ID for development

      const reflectionData = {
        userId,
        questionIndex: req.body.questionIndex,
        question: req.body.question,
        answer: req.body.answer,
        category: req.body.category,
      };

      const reflection = await storage.createReflection(reflectionData);
      res.json(reflection);
    } catch (error) {
      console.error('Error creating reflection:', error);
      res.status(500).json({ error: 'Failed to create reflection' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}