import passport from "passport";
import session from "express-session";
import type { Express } from "express";
import connectPg from "connect-pg-simple";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: false,
    ttl: sessionTtl,
    tableName: "sessions",
  });
  
  const secret = process.env.SESSION_SECRET || "fallback-secret-for-development-only";
  
  return session({
    secret: secret,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    name: 'connect.sid',
    cookie: {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: sessionTtl,
      sameSite: 'lax',
      domain: undefined,
    },
  });
}

// Simple authentication middleware
export const requireAuth = (req: any, res: any, next: any) => {
  if (!req.requireAuth() || !req.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
};

export async function setupAuth(app: Express) {
  // Setup session management
  app.use(getSession());
  app.use(passport.initialize());
  app.use(passport.session());

  // Simple session serialization - store user ID in session
  passport.serializeUser((user: any, cb) => {
    console.log('Serializing user:', user.id);
    cb(null, user.id);
  });
  
  passport.deserializeUser(async (userId: string, cb) => {
    try {
      console.log('Deserializing user ID:', userId);
      const user = await storage.getUser(userId);
      if (!user) {
        return cb(new Error('User not found'), null);
      }
      // Remove sensitive data before sending to client
      const { passwordHash, ...safeUser } = user;
      console.log('Deserialized user:', safeUser.email);
      cb(null, safeUser);
    } catch (error) {
      console.error('Deserialization error:', error);
      cb(error, null);
    }
  });
}