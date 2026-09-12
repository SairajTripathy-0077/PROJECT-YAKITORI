import type { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import User from '../models/User.js';

// Extend Express Request with our custom user types
declare global {
  namespace Express {
    interface Request {
      firebaseUser?: admin.auth.DecodedIdToken;
      dbUser?: InstanceType<typeof User>;
    }
  }
}

/**
 * Middleware: Verify Firebase ID token from Authorization header.
 * 
 * Security measures:
 * - Checks for Bearer token format
 * - Verifies token signature with Firebase Admin SDK
 * - Checks token revocation status
 * - Checks if user is banned in our database
 * - Attaches decoded Firebase user & DB user to request
 */
export async function verifyFirebaseToken(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'ACCESS_DENIED',
        message: 'No authentication token provided',
      });
      return;
    }

    const token = authHeader.split('Bearer ')[1];

    if (!token || token.length < 10) {
      res.status(401).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'Malformed authentication token',
      });
      return;
    }

    // Verify token with Firebase Admin SDK (checkRevoked catches stolen/expired tokens)
    let decodedToken: admin.auth.DecodedIdToken;
    try {
      decodedToken = await admin.auth().verifyIdToken(token, true /* checkRevoked */);
    } catch (firebaseError: unknown) {
      const code = (firebaseError as { code?: string }).code;
      if (code === 'auth/id-token-revoked') {
        res.status(401).json({
          success: false,
          error: 'TOKEN_REVOKED',
          message: 'Token has been revoked. Please sign in again.',
        });
        return;
      }
      if (code === 'auth/id-token-expired') {
        res.status(401).json({
          success: false,
          error: 'TOKEN_EXPIRED',
          message: 'Token has expired. Please sign in again.',
        });
        return;
      }
      res.status(401).json({
        success: false,
        error: 'AUTH_FAILED',
        message: 'Authentication failed',
      });
      return;
    }

    req.firebaseUser = decodedToken;

    // Check if user is banned
    const dbUser = await User.findOne({ firebaseUid: decodedToken.uid }).lean();
    if (dbUser && dbUser.isBanned) {
      res.status(403).json({
        success: false,
        error: 'ACCOUNT_BANNED',
        message: 'Your account has been suspended',
      });
      return;
    }

    next();
  } catch (error) {
    console.error('[Auth Middleware] Unexpected error:', error);
    res.status(500).json({
      success: false,
      error: 'INTERNAL_ERROR',
      message: 'Authentication service unavailable',
    });
  }
}
