import { Router, type Request, type Response } from 'express';
import { verifyFirebaseToken } from '../middleware/auth.js';
import User from '../models/User.js';
import { sanitizeString, sanitizeUrl, validateEmail, validateProvider } from '../utils/sanitize.js';

const router = Router();

/**
 * POST /api/auth/sync
 * Syncs Firebase user with MongoDB profile upon sign-in or profile update.
 * Protected by verifyFirebaseToken middleware.
 */
router.post('/sync', verifyFirebaseToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const firebaseUser = req.firebaseUser;
    if (!firebaseUser) {
      res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'User not authenticated' });
      return;
    }

    const { uid, email, picture, name, firebase } = firebaseUser;
    const body = req.body || {};

    // Validate and sanitize incoming data
    const cleanEmail = validateEmail(email || body.email);
    const rawDisplayName = body.displayName || name || email?.split('@')[0] || 'Adventurer';
    const cleanDisplayName = sanitizeString(rawDisplayName, 50);
    const cleanPhotoURL = sanitizeUrl(body.photoURL || picture);
    const rawProvider = body.provider || firebase?.sign_in_provider || 'email';
    const cleanProvider = validateProvider(rawProvider === 'google.com' ? 'google' : rawProvider);

    // Upsert user in MongoDB
    let user = await User.findOne({ firebaseUid: uid });

    if (user) {
      // Update existing user profile
      user.email = cleanEmail || user.email;
      user.displayName = cleanDisplayName || user.displayName;
      if (cleanPhotoURL) user.photoURL = cleanPhotoURL;
      user.lastLoginAt = new Date();
      user.loginCount = (user.loginCount || 0) + 1;
      await user.save();
    } else {
      // Create new user profile
      user = await User.create({
        firebaseUid: uid,
        email: cleanEmail,
        displayName: cleanDisplayName || 'Adventurer',
        photoURL: cleanPhotoURL,
        provider: cleanProvider,
        lastLoginAt: new Date(),
        loginCount: 1,
        isBanned: false,
        role: 'user',
      });
    }

    res.status(200).json({
      success: true,
      message: 'User synced successfully',
      data: user,
    });
  } catch (error) {
    console.error('[Auth Route] Sync error:', error);
    res.status(500).json({
      success: false,
      error: 'SYNC_FAILED',
      message: 'Failed to sync user session',
    });
  }
});

/**
 * GET /api/auth/me
 * Retrieves current user's profile from MongoDB.
 */
router.get('/me', verifyFirebaseToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const firebaseUser = req.firebaseUser;
    if (!firebaseUser) {
      res.status(401).json({ success: false, error: 'UNAUTHORIZED', message: 'User not authenticated' });
      return;
    }

    const user = await User.findOne({ firebaseUid: firebaseUser.uid }).lean();
    if (!user) {
      res.status(404).json({
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User profile not found in database',
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('[Auth Route] Me error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to retrieve profile',
    });
  }
});

/**
 * POST /api/auth/logout
 * Acknowledges user logout on server side.
 */
router.post('/logout', verifyFirebaseToken, async (_req: Request, res: Response): Promise<void> => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
});

export default router;
