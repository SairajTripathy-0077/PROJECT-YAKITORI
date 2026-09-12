import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import mongoSanitize from 'express-mongo-sanitize';
import hpp from 'hpp';
import rateLimit from 'express-rate-limit';
import admin from 'firebase-admin';
import authRoutes from './routes/auth.js';

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. ENVIRONMENT VALIDATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const PORT = parseInt(process.env.PORT || '5000', 10);
const MONGO_URI = process.env.MONGO_URI;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
const NODE_ENV = process.env.NODE_ENV || 'development';

if (!MONGO_URI) {
  console.error('❌ FATAL: MONGO_URI environment variable is not set');
  process.exit(1);
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. FIREBASE ADMIN SDK INITIALIZATION
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
if (!admin.apps.length) {
  const firebaseConfig: admin.AppOptions = {};

  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Option A: Service account JSON file path
    firebaseConfig.credential = admin.credential.applicationDefault();
  } else if (process.env.FIREBASE_PROJECT_ID) {
    // Option B: Inline credentials or project ID only
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (clientEmail && privateKey) {
      firebaseConfig.credential = admin.credential.cert({
        projectId,
        clientEmail,
        privateKey,
      });
    } else {
      // Project ID only mode — works for ID token verification in GCP environments
      // For local development, we'll use a lenient approach
      firebaseConfig.projectId = projectId;
    }
  }

  admin.initializeApp(firebaseConfig);
  console.log('🔥 Firebase Admin SDK initialized');
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. EXPRESS APP SETUP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const app = express();

// ── Security Headers (helmet) ───────────────────────────────────
// Sets: CSP, X-Content-Type-Options, X-Frame-Options, HSTS, etc.
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://identitytoolkit.googleapis.com', 'https://securetoken.googleapis.com'],
      },
    },
    crossOriginEmbedderPolicy: false,  // Allow cross-origin images
  })
);

// ── CORS (locked to frontend origin) ───────────────────────────
app.use(
  cors({
    origin: CLIENT_ORIGIN.split(',').map(o => o.trim()),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 86400, // 24h preflight cache
  })
);

// ── Body Parsing (limit payload size to prevent abuse) ──────────
app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: false, limit: '16kb' }));

// ── NoSQL Injection Prevention ──────────────────────────────────
// Strips $ and . from req.body, req.query, req.params
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    console.warn(`🛡️  [Sanitize] Blocked NoSQL injection attempt in ${key} from ${req.ip}`);
  },
}));

// ── HTTP Parameter Pollution Prevention ─────────────────────────
app.use(hpp());

// ── Global Rate Limiter ─────────────────────────────────────────
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,    // 15 minutes
  max: 100,                     // 100 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RATE_LIMITED',
    message: 'Too many requests. Please slow down.',
  },
});
app.use(globalLimiter);

// ── Request Logging (development) ───────────────────────────────
if (NODE_ENV === 'development') {
  app.use((req, _res, next) => {
    console.log(`📡 ${req.method} ${req.path} [${req.ip}]`);
    next();
  });
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. ROUTES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
app.use('/api/auth', authRoutes);

// Root health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    service: 'yakitori-server',
    environment: NODE_ENV,
    timestamp: new Date().toISOString(),
  });
});

// ── 404 Handler ─────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    error: 'NOT_FOUND',
    message: 'The requested endpoint does not exist',
  });
});

// ── Global Error Handler ────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('💥 Unhandled error:', err.stack);
  res.status(500).json({
    success: false,
    error: 'INTERNAL_ERROR',
    message: NODE_ENV === 'development' ? err.message : 'Something went wrong',
  });
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 5. DATABASE CONNECTION & SERVER START
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
async function startServer() {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    console.log('✅ MongoDB connected successfully');

    // Mongoose connection event listeners
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB connection error:', err);
    });
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️  MongoDB disconnected');
    });

    app.listen(PORT, () => {
      console.log(`
╔══════════════════════════════════════════════════╗
║  🍢 YAKITORI SERVER                              ║
║  Environment: ${NODE_ENV.padEnd(33)}║
║  Port:        ${String(PORT).padEnd(33)}║
║  CORS Origin: ${CLIENT_ORIGIN.padEnd(33)}║
╚══════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down gracefully...');
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 SIGTERM received. Shutting down...');
  await mongoose.connection.close();
  process.exit(0);
});

startServer();
