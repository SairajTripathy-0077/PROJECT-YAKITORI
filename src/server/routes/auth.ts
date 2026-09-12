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

    // Extract RPG stats if provided
    const level = typeof body.level === 'number' && body.level >= 1 ? body.level : undefined;
    const xp = typeof body.xp === 'number' && body.xp >= 0 ? body.xp : undefined;
    const streakDays = typeof body.streakDays === 'number' && body.streakDays >= 0 ? body.streakDays : undefined;
    const characterClass = ['Warrior', 'Mage', 'Rogue', 'Paladin'].includes(body.characterClass) ? body.characterClass : undefined;
    const avatarIcon = typeof body.avatarIcon === 'string' ? sanitizeString(body.avatarIcon, 10) : undefined;

    // Upsert user in MongoDB
    let user = await User.findOne({ firebaseUid: uid });

    if (user) {
      // Update existing user profile
      user.email = cleanEmail || user.email;
      user.displayName = cleanDisplayName || user.displayName;
      if (cleanPhotoURL) user.photoURL = cleanPhotoURL;
      if (level !== undefined) user.level = level;
      if (xp !== undefined) user.xp = xp;
      if (streakDays !== undefined) user.streakDays = streakDays;
      if (characterClass !== undefined) user.characterClass = characterClass;
      if (avatarIcon !== undefined) user.avatarIcon = avatarIcon;
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
        level: level || 1,
        xp: xp || 0,
        streakDays: streakDays || 1,
        characterClass: characterClass || 'Warrior',
        avatarIcon: avatarIcon || '⚔️',
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
 * GET /api/auth/members
 * Retrieves all study room heroes for the community leaderboard/roster.
 */
router.get('/members', async (_req: Request, res: Response): Promise<void> => {
  try {
    // Purge any legacy demo seed users from MongoDB so database contains only real registered users
    await User.deleteMany({
      $or: [
        { firebaseUid: { $regex: /^seed-guild-/ } },
        { email: { $regex: /@.*\.guild$/ } },
        { displayName: { $in: ['Archmage Kai', 'Shadow Ren', 'Paladin Faye', 'Cyber Scout Aero'] } }
      ]
    }).catch(() => {});

    // Fetch real registered users from MongoDB
    const users = await User.find({ isBanned: false })
      .select('displayName email photoURL level xp streakDays characterClass avatarIcon lastLoginAt createdAt')
      .sort({ level: -1, xp: -1 })
      .limit(50)
      .lean();

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error('[Auth Route] Members error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVER_ERROR',
      message: 'Failed to retrieve study room roster',
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
