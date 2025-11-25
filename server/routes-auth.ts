// New clean authentication routes
import type { Express } from "express";
import { setupSession, requireAuth, registerUser, loginUser } from "./auth-new";
import { storage } from "./storage";

export function setupAuthRoutes(app: Express) {
  // Setup session middleware
  setupSession(app);

  // Get current user
  app.get("/api/auth/user", async (req: any, res) => {
    try {
      if (!req.session?.user) {
        return res.status(401).json({ error: "Not authenticated" });
      }

      const user = await storage.getUser(req.session.user.id);
      if (!user) {
        return res.status(401).json({ error: "User not found" });
      }

      // Remove sensitive data
      const { passwordHash, ...safeUser } = user;
      res.json(safeUser);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ error: "Failed to fetch user" });
    }
  });

  // Register
  app.post("/api/auth/register", async (req: any, res) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Register user
      const user = await registerUser(email, password, firstName, lastName);

      // Set session
      req.session.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        } 
      });
    } catch (error: any) {
      console.error("Registration error:", error);
      const status = error.message?.includes("already exists") ? 400 : 500;
      res.status(status).json({ error: error.message || "Registration failed" });
    }
  });

  // Login
  app.post("/api/auth/login", async (req: any, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ error: "Email and password are required" });
      }

      // Login user
      const user = await loginUser(email, password);

      // Set session
      req.session.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      };

      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName
        } 
      });
    } catch (error: any) {
      console.error("Login error:", error);
      const status = error.message?.includes("Invalid") ? 401 : 500;
      res.status(status).json({ error: error.message || "Login failed" });
    }
  });

  // Logout
  app.post("/api/auth/logout", (req: any, res) => {
    req.session.destroy((err: any) => {
      if (err) {
        return res.status(500).json({ error: "Failed to logout" });
      }
      res.clearCookie("echosoul.sid");
      res.json({ success: true, message: "Logged out successfully" });
    });
  });

  // Update profile
  app.patch("/api/auth/profile", requireAuth, async (req: any, res) => {
    try {
      const { firstName, lastName } = req.body;
      const userId = req.user.id;

      const updated = await storage.updateUser(userId, {
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });

      res.json({ success: true, user: updated });
    } catch (error) {
      console.error("Profile update error:", error);
      res.status(500).json({ error: "Failed to update profile" });
    }
  });
}

