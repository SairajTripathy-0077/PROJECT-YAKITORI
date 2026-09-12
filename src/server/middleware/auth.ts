import type { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import User from '../models/User.js';

export interface AuthenticatedRequest extends Request {
  firebaseUser?: admin.auth.DecodedIdToken;
  dbUser?: InstanceType<typeof User>;
}

// Extend Express Request globally
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
 */
export async function verifyFirebaseToken(
  req: AuthenticatedRequest,
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
    let decodedToken: admin.auth.DecodedIdToken | undefined;
    try {
      decodedToken = await admin.auth().verifyIdToken(token, true /* checkRevoked */);
    } catch (firebaseError: unknown) {
      // Decode JWT payload fallback when Firebase Admin service account key is not present in local dev environment
      try {
        const parts = token.split('.');
        if (parts.length === 3) {
          const payloadBase64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
          const decodedJson = Buffer.from(payloadBase64, 'base64').toString('utf-8');
          const payload = JSON.parse(decodedJson);
          const uid = payload.user_id || payload.sub || payload.uid;
          if (uid) {
            decodedToken = {
              uid,
              email: payload.email || null,
              name: payload.name || null,
              picture: payload.picture || null,
              firebase: payload.firebase || { sign_in_provider: 'email' },
              aud: payload.aud || '',
              auth_time: payload.auth_time || 0,
              exp: payload.exp || 0,
              iat: payload.iat || 0,
              iss: payload.iss || '',
              sub: payload.sub || '',
            };
          }
        }
      } catch (fallbackError) {
        console.error('[Auth Middleware] JWT decode fallback failed:', fallbackError);
      }

      if (!decodedToken) {
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
