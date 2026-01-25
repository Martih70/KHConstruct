import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../services/authService.js';
import logger from '../utils/logger.js';
import type { JWTPayload } from '../models/types.js';

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

/**
 * JWT verification middleware
 * Extracts and verifies the JWT token from Authorization header
 */
export function verifyAuth(req: Request, res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn(`Missing or invalid Authorization header for ${req.method} ${req.path}`);
      res.status(401).json({
        success: false,
        error: 'Missing or invalid authorization header',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    const payload = verifyToken(token);
    if (!payload) {
      logger.warn(`Invalid token for ${req.method} ${req.path}`);
      res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
      });
      return;
    }

    // Attach user payload to request
    req.user = payload;
    next();
  } catch (error) {
    logger.error(`Auth middleware error: ${error}`);
    res.status(500).json({
      success: false,
      error: 'Authentication error',
    });
  }
}

/**
 * Optional auth middleware
 * Verifies JWT if provided, but doesn't require it
 */
export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const payload = verifyToken(token);
      if (payload) {
        req.user = payload;
      }
    }

    next();
  } catch (error) {
    logger.error(`Optional auth middleware error: ${error}`);
    next(); // Continue even if there's an error
  }
}
