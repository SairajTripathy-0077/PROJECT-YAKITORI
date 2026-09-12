import type { Request, Response } from 'express';
import app, { connectToDatabase } from '../src/server/app.js';

export default async function handler(req: Request, res: Response) {
  try {
    await connectToDatabase();
    return app(req, res);
  } catch (error) {
    console.error('[Vercel Serverless] Execution error:', error);
    res.status(500).json({
      success: false,
      error: 'SERVERLESS_ERROR',
      message: 'Failed to handle serverless request',
    });
  }
}
