import session from "express-session";
import type { Express } from "express";
import connectPg from "connect-pg-simple";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const pgStore = connectPg(session);
  const sessionStore = new pgStore({
    conString: process.env.DATABASE_URL,
    createTableIfMissing: true,
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
      httpOnly: false,
      secure: false,
      maxAge: sessionTtl,
      sameSite: 'lax',
    },
  });
}

// Firebase-based authentication middleware
export const requireAuth = (req: any, res: any, next: any) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: "Authentication required" });
  }
  req.user = req.session.user;
  next();
};

export async function setupAuth(app: Express) {
  // Setup session management only
  app.use(getSession());
}