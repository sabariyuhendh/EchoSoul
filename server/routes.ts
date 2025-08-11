import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import passport from 'passport';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { insertLetItGoEntrySchema, insertMoodEntrySchema, insertLetterSchema, insertVaultEntrySchema, insertWhisperSchema, insertPostSchema, insertHumourClubEntrySchema, insertHumourClubPollSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import Groq from "groq-sdk";
import { getCalmPreferences, saveCalmPreferences, logMeditationSession, getMeditationStats } from './calmSpaceRoutes';
import { setupAuth, requireAuth } from './auth';

export async function registerRoutes(app: Express): Promise<Server> {
  // Enable clean authentication
  await setupAuth(app);

  // Real auth routes
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      console.log('Auth check - isAuthenticated:', req.isAuthenticated(), 'user:', req.user);
      
      if (!req.isAuthenticated() || !req.user) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      // If user is just an ID, fetch full user data
      let userData = req.user;
      if (typeof req.user === 'string') {
        userData = await storage.getUser(req.user);
        if (!userData) {
          return res.status(401).json({ message: "User not found" });
        }
      }
      
      // Remove sensitive data
      const { passwordHash, ...safeUser } = userData;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Remove Google OAuth routes since we're using Firebase + API auth

  // Profile update endpoint
  app.patch("/api/auth/profile", requireAuth, async (req: any, res) => {
    try {
      const { firstName, lastName } = req.body;
      const userId = req.user.id;
      
      const updatedUser = await storage.updateUser(userId, {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });

      if (!updatedUser) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ success: true, user: updatedUser });
    } catch (error) {
      console.error('Profile update error:', error);
      res.status(500).json({ message: 'Failed to update profile' });
    }
  });

  app.post('/api/auth/logout', (req, res) => {
    req.logout((err) => {
      if (err) {
        return res.status(500).json({ message: "Failed to logout" });
      }
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  // Google OAuth authentication endpoint
  app.post('/api/auth/google', async (req, res) => {
    try {
      const { uid, email, firstName, lastName, profileImageUrl } = req.body;

      if (!uid || !email) {
        return res.status(400).json({ error: 'Missing required Google user data' });
      }

      // Check if user exists with this Google ID
      let user = await storage.getUserByGoogleId(uid);
      
      if (!user) {
        // Check if user exists with this email
        user = await storage.getUserByEmail(email);
        
        if (user) {
          // Link Google account to existing user
          user = await storage.updateUser(user.id, { googleId: uid, profileImageUrl });
        } else {
          // Create new user
          const userId = crypto.randomUUID();
          user = await storage.createUser({
            id: userId,
            email,
            firstName,
            lastName,
            googleId: uid,
            profileImageUrl,
            passwordHash: null, // No password for Google users
          });
        }
      }

      // Log the user in by setting up the session
      req.login(user, (err) => {
        if (err) {
          console.error('Login error:', err);
          return res.status(500).json({ error: 'Failed to establish session' });
        }
        console.log('User logged in successfully:', { id: user.id, email: user.email });
        console.log('Session after login:', req.session);
        console.log('Session ID:', req.sessionID);
        console.log('Response headers will include Set-Cookie for:', req.sessionID);
        res.json({ success: true, user: { id: user.id, email: user.email } });
      });
    } catch (error) {
      console.error('Google auth error:', error);
      res.status(500).json({ error: 'Google authentication failed' });
    }
  });

  // Google-only authentication - email/password removed

  // Handle GET request to /api/login - redirect to login page
  app.get('/api/login', (req, res) => {
    res.redirect('/login');
  });

  // Handle Google OAuth (mock for development)
  app.get('/api/auth/google', (req, res) => {
    res.redirect('/login');
  });

  // Let It Go Room API endpoints
  app.post("/api/letitgo", requireAuth, async (req: any, res) => {
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

  app.get("/api/letitgo", requireAuth, async (req: any, res) => {
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
  app.post("/api/vault", requireAuth, async (req: any, res) => {
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

  app.get("/api/vault", requireAuth, async (req: any, res) => {
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
  app.post("/api/mood", requireAuth, async (req: any, res) => {
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

  app.get("/api/mood", requireAuth, async (req: any, res) => {
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
  app.post("/api/letters", requireAuth, async (req: any, res) => {
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

  app.get("/api/letters", requireAuth, async (req: any, res) => {
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
  app.post("/api/whisper", requireAuth, async (req: any, res) => {
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

  app.get("/api/whisper", requireAuth, async (req: any, res) => {
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

  app.post("/api/feed", requireAuth, async (req: any, res) => {
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
    app.post("/api/smash/stats", requireAuth, async (req: any, res) => {
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
    
    app.get("/api/smash/stats", requireAuth, async (req: any, res) => {
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
  
  // Initialize Groq with API key - use fallback if env var not set
  const groq = new Groq({ 
    apiKey: process.env.GROQ_API_KEY || "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"
  });

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

  app.post("/api/humour/entries", requireAuth, async (req: any, res) => {
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

  app.post("/api/humour/entries/:id/like", requireAuth, async (req: any, res) => {
    try {
      const { id } = req.params;
      await storage.likeHumourClubEntry(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error liking humour entry:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Lyra AI Chatbot endpoint with Groq
  app.post("/api/lyra/chat", requireAuth, async (req: any, res) => {
    const { message, conversationHistory = [], currentMood } = req.body;
    
    try {
      // Build system prompt based on user's mood and conversation context
      let systemPrompt = `You are Lyra, a compassionate AI emotional support companion. You provide empathetic, non-judgmental support for emotional wellness. Key traits:
- Warm, understanding, and genuinely caring
- Use simple, everyday language that feels natural
- Ask thoughtful follow-up questions
- Validate emotions without trying to "fix" everything
- Offer gentle guidance when appropriate
- Remember previous conversation context`;

      if (currentMood) {
        systemPrompt += `\n\nThe user's current emotional state seems to be: ${currentMood}. Tailor your response accordingly while being sensitive to their feelings.`;
      }

      // Prepare conversation messages
      const messages = [
        { role: "system", content: systemPrompt },
        ...conversationHistory.map((msg: any) => ({
          role: msg.isUser ? "user" : "assistant",
          content: msg.content
        })),
        { role: "user", content: message }
      ];

      const response = await groq.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: messages,
        max_tokens: 300,
        temperature: 0.7,
      });

      const aiResponse = response.choices[0].message.content;
      res.json({ response: aiResponse });
    } catch (error) {
      console.error("Error with Lyra chat:", error);
      
      // Fallback empathetic responses
      const fallbackResponses = [
        "I hear you, and what you're feeling is completely valid. Want to tell me more about what's going on?",
        "That sounds really tough. You're so brave for sharing this with me. How long have you been feeling this way?",
        "Thank you for trusting me with this. Your feelings matter, and you matter. What would help you feel a little lighter right now?",
        "I'm proud of you for reaching out. Sometimes just putting feelings into words can be healing. How can I support you today?",
        "You're not alone in this. What you're experiencing is part of being human, and it's okay to not be okay sometimes."
      ];
      
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
      res.json({ response: randomResponse });
    }
  });

  // Humour Club AI Joke endpoint with Groq
  app.post("/api/humour/joke", requireAuth, async (req: any, res) => {
    const { category = "general" } = req.body;
    
    try {
      const response = await groq.chat.completions.create({
        model: "meta-llama/llama-4-scout-17b-16e-instruct",
        messages: [
          {
            role: "system",
            content: "You are a wholesome, positive joke generator. Create clean, uplifting jokes that would make someone smile. Keep them light-hearted and appropriate for all audiences. Avoid dark humor, controversial topics, or anything that could be offensive. Generate only ONE joke per request."
          },
          {
            role: "user",
            content: `Tell me a ${category} joke that's clean, positive, and will make someone laugh or smile.`
          }
        ],
        max_tokens: 150,
        temperature: 0.8,
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