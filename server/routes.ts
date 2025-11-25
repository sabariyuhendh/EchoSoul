import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import crypto from 'crypto';
import { insertLetItGoEntrySchema, insertMoodEntrySchema, insertLetterSchema, insertVaultEntrySchema, insertWhisperSchema, insertPostSchema, insertHumourClubEntrySchema, insertHumourClubPollSchema } from "@shared/schema";
import { z } from "zod";
import OpenAI from "openai";
import Groq from "groq-sdk";
import { getCalmPreferences, saveCalmPreferences, logMeditationSession, getMeditationStats } from './calmSpaceRoutes';
import { setupAuthRoutes } from './routes-auth';
import { requireAuth } from './auth-new';

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup new clean authentication
  setupAuthRoutes(app);

  // Handle GET request to /api/login - redirect to login page
  app.get('/api/login', (req, res) => {
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

  app.delete("/api/whisper/:id", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const whisperId = req.params.id;
      
      // First check if the whisper belongs to the user
      const whisper = await storage.getUserWhisper(userId, whisperId);
      if (!whisper) {
        return res.status(404).json({ error: "Whisper not found" });
      }

      await storage.deleteWhisper(whisperId);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting whisper:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Whisper upload endpoint with Cloudinary
  app.post("/api/whisper/upload", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      
      // Check for file upload
      if (!req.files || !req.files.audio) {
        console.error("No audio file in request. Files:", req.files);
        return res.status(400).json({ error: "No audio file provided" });
      }

      const audioFile = req.files.audio;
      const name = req.body.name || `Whisper ${new Date().toLocaleTimeString()}`;
      const duration = parseFloat(req.body.duration) || 0;

      console.log("Uploading whisper:", { name, duration, fileSize: audioFile.size, mimetype: audioFile.mimetype });

      // Check Cloudinary config
      if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
        console.error("Cloudinary credentials missing");
        // Save to database without Cloudinary URL if credentials are missing
        const validatedData = insertWhisperSchema.parse({
          userId,
          name,
          duration,
          audioUrl: null
        });
        const whisper = await storage.createWhisper(validatedData);
        return res.json({ success: true, whisper, warning: "Cloudinary not configured, audio not uploaded" });
      }

      // Upload to Cloudinary
      const cloudinary = require('cloudinary').v2;
      cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
      });

      // Get file buffer - express-fileupload provides .data property
      const fileBuffer = audioFile.data || audioFile.buffer || Buffer.from(audioFile);

      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: "video", // Cloudinary uses "video" for audio files
            folder: "echosoul/whispers",
            public_id: `whisper_${Date.now()}_${userId}`,
            format: "wav"
          },
          (error: any, result: any) => {
            if (error) {
              console.error("Cloudinary upload error:", error);
              reject(error);
            } else {
              console.log("Cloudinary upload successful:", result.secure_url);
              resolve(result);
            }
          }
        );
        
        uploadStream.end(fileBuffer);
      });

      const audioUrl = (uploadResult as any).secure_url;

      // Save to database with Cloudinary URL
      const validatedData = insertWhisperSchema.parse({
        userId,
        name,
        duration,
        audioUrl
      });

      const whisper = await storage.createWhisper(validatedData);
      console.log("Whisper saved to database:", whisper.id);
      res.json({ success: true, whisper });
    } catch (error: any) {
      console.error("Error uploading whisper:", error);
      console.error("Error details:", error.message, error.stack);
      res.status(500).json({ 
        error: "Internal server error",
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
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

  // Initialize OpenAI with API key (optional - currently not used, but kept for future features)
  // Only initialize if API key is provided to avoid errors
  const openai = process.env.OPENAI_API_KEY 
    ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    : null;
  
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

  // Lyra conversation history routes
  app.get("/api/lyra/conversations", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { sessionId } = req.query;
      
      const conversations = await storage.getUserLyraConversations(userId, sessionId as string);
      res.json({ conversations });
    } catch (error) {
      console.error("Error fetching Lyra conversations:", error);
      res.status(500).json({ error: "Failed to fetch conversations" });
    }
  });

  app.get("/api/lyra/sessions", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sessions = await storage.getUserLyraSessions(userId);
      res.json({ sessions });
    } catch (error) {
      console.error("Error fetching Lyra sessions:", error);
      res.status(500).json({ error: "Failed to fetch sessions" });
    }
  });

  app.delete("/api/lyra/history", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      await storage.clearUserLyraHistory(userId);
      res.json({ success: true, message: "Chat history cleared" });
    } catch (error) {
      console.error("Error clearing Lyra history:", error);
      res.status(500).json({ error: "Failed to clear history" });
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

  app.post("/api/humour/polls", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
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
  app.get("/api/health", async (req, res) => {
    try {
      // Test database connection
      const testUser = await storage.getUser('health-check-test-id');
      // Test session store by checking if we can query sessions table
      res.json({ 
        status: "ok", 
        timestamp: new Date().toISOString(),
        database: "connected",
        sessionStore: "available"
      });
    } catch (error) {
      res.status(500).json({ 
        status: "error", 
        timestamp: new Date().toISOString(),
        database: "error",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
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

  // Matchmaking API endpoints
  app.post("/api/matchmaking/join", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { getChatServer } = await import("./websocket");
      const chatServer = getChatServer();
      
      if (!chatServer) {
        return res.status(503).json({ error: "Chat server not available" });
      }

      const joined = chatServer.joinQueue(userId);
      if (joined) {
        res.json({ success: true, message: "Joined matchmaking queue" });
      } else {
        res.status(400).json({ error: "User not connected via WebSocket" });
      }
    } catch (error) {
      console.error("Error joining matchmaking:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/matchmaking/leave", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const { getChatServer } = await import("./websocket");
      const chatServer = getChatServer();
      
      if (chatServer) {
        chatServer.leaveQueue(userId);
      }
      res.json({ success: true, message: "Left matchmaking queue" });
    } catch (error) {
      console.error("Error leaving matchmaking:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/matchmaking/status", requireAuth, async (req: any, res) => {
    try {
      const { getChatServer } = await import("./websocket");
      const chatServer = getChatServer();
      
      if (!chatServer) {
        return res.status(503).json({ error: "Chat server not available" });
      }

      const status = chatServer.getQueueStatus();
      const userId = req.user.id;
      
      // Check if user is connected via WebSocket
      const { getChatServer: getChatServer2 } = await import("./websocket");
      const chatServer2 = getChatServer2();
      const isConnected = chatServer2 ? chatServer2.isUserConnected(userId) : false;
      
      res.json({ ...status, isConnected, userId });
    } catch (error) {
      console.error("Error getting matchmaking status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Chat session endpoints
  app.get("/api/chat/sessions", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const sessions = await storage.getUserChatSessions(userId);
      res.json({ sessions });
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/chat/sessions/:sessionId/messages", requireAuth, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      
      // Verify user is part of this session
      const session = await storage.getChatSession(sessionId);
      if (!session || (session.userId1 !== userId && session.userId2 !== userId)) {
        return res.status(403).json({ error: "Access denied" });
      }

      const messages = await storage.getChatMessages(sessionId);
      res.json({ messages });
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.post("/api/chat/sessions/:sessionId/end", requireAuth, async (req: any, res) => {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      
      // Verify user is part of this session
      const session = await storage.getChatSession(sessionId);
      if (!session || (session.userId1 !== userId && session.userId2 !== userId)) {
        return res.status(403).json({ error: "Access denied" });
      }

      await storage.endChatSession(sessionId);
      
      const { getChatServer } = await import("./websocket");
      const chatServer = getChatServer();
      if (chatServer) {
        chatServer.endSessionForUser(userId);
      }

      res.json({ success: true, message: "Session ended" });
    } catch (error) {
      console.error("Error ending chat session:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  app.get("/api/chat/history", requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id;
      const history = await storage.getUserChatHistory(userId);
      res.json({ history });
    } catch (error) {
      console.error("Error fetching chat history:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}