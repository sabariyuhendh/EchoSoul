import "dotenv/config";
import express, { type Request, Response, NextFunction } from "express";
import path from "path";
import fileUpload from "express-fileupload";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Verify DATABASE_URL is loaded
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set!');
  console.error('   Make sure your .env file exists and contains DATABASE_URL');
  process.exit(1);
}

// Log DATABASE_URL (masked) for verification
const maskedDbUrl = process.env.DATABASE_URL.replace(/:[^:@]+@/, ':****@');
console.log('[server] DATABASE_URL loaded:', maskedDbUrl);

const app = express();

// Enable trust proxy for proper session handling
app.set('trust proxy', 1);

// Add CORS middleware to allow credentials - allow all origins in development
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    res.header('Access-Control-Allow-Origin', origin);
  }
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(fileUpload({
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  useTempFiles: false,
  tempFileDir: '/tmp/'
}));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    // Don't override responses that were already sent
    if (!res.headersSent) {
      res.status(status).json({ message, error: message, details: err.details || err.stack });
    }
    // Only throw in development for debugging
    if (process.env.NODE_ENV === 'development') {
      console.error('Unhandled error:', err);
    }
  });

  // Serve the test auth page for debugging
  app.get('/test-auth', (req, res) => {
    res.sendFile(path.resolve('test-auth.html'));
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on port 5000
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = 5000;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
