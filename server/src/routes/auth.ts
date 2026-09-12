import { Router, type Request, type Response } from 'express';
import rateLimit from 'express-rate-limit';
import User from '../models/User.js';
import { verifyFirebaseToken } from '../middleware/auth.js';
import {
  sanitizeString,
  validateEmail,
  sanitizeUrl,
  validateProvider,
} from '../utils/sanitize.js';

const router = Router();

// ── Aggressive rate limiter for auth endpoints ──────────────────
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max: 15,                      // 15 requests per window per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    error: 'RATE_LIMITED',
    message: 'Too many authentication attempts. Please try again in 15 minutes.',
  },
});

router.use(authLimiter);

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/auth/sync
// Called by frontend after Firebase auth to create/update user in MongoDB.
// This is the ONLY way a user document gets created.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post('/sync', verifyFirebaseToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const firebaseUser = req.firebaseUser!;
    const { displayName, photoURL, provider } = req.body;

    // ── Sanitize all user-supplied inputs ──
    const cleanDisplayName = sanitizeString(
      displayName || firebaseUser.name || 'Adventurer',
      50
    );
    const cleanEmail = validateEmail(firebaseUser.email || req.body.email);
    const cleanPhotoURL = sanitizeUrl(photoURL || firebaseUser.picture || null);
    const cleanProvider = validateProvider(
      provider || (firebaseUser.firebase?.sign_in_provider === 'google.com' ? 'google' : 
                   firebaseUser.firebase?.sign_in_provider === 'password' ? 'email' : 'anonymous')
    );

    // ── Upsert: create if not exists, update if exists ──
    const user = await User.findOneAndUpdate(
      { firebaseUid: firebaseUser.uid },
      {
        $set: {
          email: cleanEmail,
          displayName: cleanDisplayName,
          photoURL: cleanPhotoURL,
          provider: cleanProvider,
          lastLoginAt: new Date(),
        },
        $inc: { loginCount: 1 },
        $setOnInsert: {
          firebaseUid: firebaseUser.uid,
          role: 'user',
          isBanned: false,
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error: unknown) {
    console.error('[POST /api/auth/sync] Error:', error);

    // Handle Mongoose duplicate key errors
    if ((error as { code?: number }).code === 11000) {
      res.status(409).json({
        success: false,
        error: 'DUPLICATE_ENTRY',
        message: 'An account with this email already exists',
      });
      return;
    }

    // Handle Mongoose validation errors
    if ((error as { name?: string }).name === 'ValidationError') {
      res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Invalid user data provided',
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to sync user profile',
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// GET /api/auth/me
// Returns the current user's profile from MongoDB.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/me', verifyFirebaseToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const firebaseUser = req.firebaseUser!;

    const user = await User.findOne({ firebaseUid: firebaseUser.uid });

    if (!user) {
      res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User profile not found. Please sign in again.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: {
        user: user.toJSON(),
      },
    });
  } catch (error) {
    console.error('[GET /api/auth/me] Error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Failed to fetch user profile',
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// POST /api/auth/logout
// Server-side cleanup (optional — clears any server-side cache, etc.)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post('/logout', verifyFirebaseToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const firebaseUser = req.firebaseUser!;

    // Update last login timestamp
    await User.findOneAndUpdate(
      { firebaseUid: firebaseUser.uid },
      { $set: { lastLoginAt: new Date() } }
    );

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('[POST /api/auth/logout] Error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Logout failed',
    });
  }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Health check (no auth required)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ success: true, message: 'Auth service healthy' });
});

export default router;
