import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertLetItGoEntrySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Let It Go Room API endpoints
  app.post("/api/letitgo", async (req, res) => {
    try {
      // For now, use a mock user ID (1) since we don't have authentication yet
      const userId = 1;
      
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

  app.get("/api/letitgo", async (req, res) => {
    try {
      // For now, use a mock user ID (1) since we don't have authentication yet
      const userId = 1;
      
      const entries = await storage.getUserLetItGoEntries(userId);
      res.json({ entries });
    } catch (error) {
      console.error("Error fetching Let It Go entries:", error);
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
