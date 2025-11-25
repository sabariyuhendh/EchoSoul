// New clean authentication system
import session from "express-session";
import type { Express } from "express";
import connectPg from "connect-pg-simple";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { storage } from "./storage";

const pgStore = connectPg(session);

export function setupSession(app: Express) {
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
    ttl: 7 * 24 * 60 * 60 * 1000, // 7 days
    tableName: "sessions",
  });

  app.use(
    session({
      secret: process.env.SESSION_SECRET || "echosoul-secret-key-change-in-production",
      store: sessionStore,
      resave: false,
      saveUninitialized: false,
      name: "echosoul.sid",
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 7 * 24 * 60 * 60 * 1000,
        sameSite: "lax",
        path: "/",
      },
    })
  );
}

export function requireAuth(req: any, res: any, next: any) {
  if (!req.session?.user) {
    return res.status(401).json({ error: "Authentication required" });
  }
  req.user = req.session.user;
  next();
}

// Register new user
export async function registerUser(email: string, password: string, firstName?: string, lastName?: string) {
  // Validate input
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  if (password.length < 6) {
    throw new Error("Password must be at least 6 characters");
  }

  // Check if user exists
  const existing = await storage.getUserByEmail(email);
  if (existing) {
    throw new Error("User with this email already exists");
  }

  // Hash password
  const passwordHash = await bcrypt.hash(password, 10);

  // Create user
  const userId = crypto.randomUUID();
  const user = await storage.createUser({
    id: userId,
    email,
    firstName: firstName || "",
    lastName: lastName || "",
    passwordHash,
    googleId: null,
    profileImageUrl: null,
  });

  return user;
}

// Login user
export async function loginUser(email: string, password: string) {
  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  // Find user
  const user = await storage.getUserByEmail(email);
  if (!user) {
    throw new Error("Invalid email or password");
  }

  // Check password
  if (!user.passwordHash) {
    throw new Error("Invalid email or password");
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new Error("Invalid email or password");
  }

  return user;
}


