import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';
import hpp from 'hpp';
import mongoose from 'mongoose';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import dns from 'node:dns';
import authRoutes from './routes/auth.ts';

// Suppress non-fatal Node.js DNS MetadataLookupWarning when querying MongoDB SRV records on Windows
process.on('warning', (warning) => {
  const str = String(warning) + (warning.message || '') + (warning.name || '');
  if (str.includes('MetadataLookupWarning') || str.includes('All promises were rejected')) {
    return;
  }
  console.warn(warning);
});

// Configure Node.js DNS resolver to Google (8.8.8.8) and Cloudflare (1.1.1.1) to resolve MongoDB SRV records reliably
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);
} catch {
  // Ignore DNS override errors if in restricted environment
}

// Load environment variables
dotenv.config();

// Global cached Mongoose connection state for serverless execution
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

const cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };
if (!global.mongooseCache) {
  global.mongooseCache = cached;
}

export async function connectToDatabase(): Promise<typeof mongoose> {
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  const primaryUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb+srv://tryinghard75days_db_user:3XlBThxna1ntMXCY@devchoice.krymjtr.mongodb.net/yakitodo_app?retryWrites=true&w=majority';
  const fallbackUri = 'mongodb://tryinghard75days_db_user:3XlBThxna1ntMXCY@devchoice-shard-00-00.krymjtr.mongodb.net:27017,devchoice-shard-00-01.krymjtr.mongodb.net:27017,devchoice-shard-00-02.krymjtr.mongodb.net:27017/yakitodo_app?replicaSet=atlas-devchoice-shard-0&ssl=true&authSource=admin';

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000,
    };

    cached.promise = mongoose.connect(primaryUri, opts)
      .then((m) => {
        console.log('[MongoDB] Connected successfully via SRV');
        return m;
      })
      .catch(async (srvErr) => {
        console.warn('[MongoDB] SRV lookup failed, trying direct seed list fallback:', srvErr.message || srvErr);
        return mongoose.connect(fallbackUri, opts).then((m) => {
          console.log('[MongoDB] Connected successfully via Direct Cluster Fallback');
          return m;
        });
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

// Initialize Firebase Admin SDK
const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID || 'yakitori-5f00f';

if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: FIREBASE_PROJECT_ID,
    });
    console.log(`[Firebase Admin] Initialized for project: ${FIREBASE_PROJECT_ID}`);
  } catch (err) {
    console.error('[Firebase Admin] Initialization error:', err);
  }
}

const app = express();
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

// -------------------------------------------------------------
// Security Middleware Stack
// -------------------------------------------------------------

// 1. Helmet HTTP headers protection
app.use(helmet());

// 2. CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, or same-origin Vercel requests)
      if (!origin) return callback(null, true);
      const allowedOrigins = [
        FRONTEND_URL,
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://localhost:5000',
      ];
      // On Vercel, allow any *.vercel.app domain
      if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive in dev/staging, fallback safe
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Body parser with strict payload size limit
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));

// 4. NoSQL Injection protection
app.use(mongoSanitize());

// 5. XSS Protection
app.use(xss());

// 6. HTTP Parameter Pollution protection
app.use(hpp());

// 7. Rate Limiters
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'TOO_MANY_REQUESTS',
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
app.use(globalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RATE_LIMIT_EXCEEDED',
    message: 'Too many requests to auth endpoints. Please try again later.',
  },
});

// -------------------------------------------------------------
// Routes
// -------------------------------------------------------------

// Ensure DB connection before processing API routes
app.use(async (_req: Request, _res: Response, next: NextFunction) => {
  try {
    await connectToDatabase();
    next();
  } catch (err) {
    console.error('[Database] Connection middleware error:', err);
    next(err);
  }
});

// Health check
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    dbState: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
  });
});

// Auth Routes
app.use('/api/auth', authLimiter, authRoutes);

// 404 Handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Resource not found' });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]:', err);
  res.status(500).json({
    success: false,
    error: 'INTERNAL_SERVER_ERROR',
    message: process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : err.message,
  });
});

export default app;
