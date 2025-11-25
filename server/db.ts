import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Log connection info (without password) for debugging
const dbUrl = process.env.DATABASE_URL;
const maskedUrl = dbUrl.replace(/:[^:@]+@/, ':****@');
console.log('[db] Initializing database connection:', maskedUrl);

// Test connection on startup
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// Test connection immediately
pool.query('SELECT 1 as test').then(() => {
  console.log('[db] ✅ Database connection verified');
}).catch((err) => {
  console.error('[db] ❌ Database connection failed:', err.message);
  console.error('[db] Error code:', err.code);
  if (err.code === '28P01') {
    console.error('[db] 💡 Password authentication failed - check your DATABASE_URL password');
  }
});

export { pool };
export const db = drizzle({ client: pool, schema });