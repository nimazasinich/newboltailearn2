import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';

// Extend Request interface to include rateLimit
declare global {
  namespace Express {
    interface Request {
      rateLimit?: {
        limit: number;
        current: number;
        remaining: number;
        resetTime: Date;
      };
    }
  }
}

/**
 * Global rate limiter - applied to all routes
 */
export const globalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_GLOBAL || '100'), // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req: Request, res: Response) => {
    res.status(429).json({
      error: 'Too many requests',
      message: 'You have exceeded the rate limit. Please try again later.',
      retryAfter: req.rateLimit?.resetTime
    });
  }
});

/**
 * Strict rate limiter for authentication endpoints
 */
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_AUTH || '5'), // Limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts, please try again later.',
  skipSuccessfulRequests: true, // Don't count successful requests
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * API rate limiter for general API endpoints
 */
export const apiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: parseInt(process.env.RATE_LIMIT_API || '30'), // Limit each IP to 30 requests per minute
  message: 'API rate limit exceeded.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Training rate limiter - for resource-intensive operations
 */
export const trainingRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.RATE_LIMIT_TRAINING || '10'), // Limit each IP to 10 training sessions per hour
  message: 'Training rate limit exceeded. Please wait before starting new training sessions.',
  standardHeaders: true,
  legacyHeaders: false,
});

/**
 * Download rate limiter - for dataset downloads
 */
export const downloadRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: parseInt(process.env.RATE_LIMIT_DOWNLOAD || '20'), // Limit each IP to 20 downloads per hour
  message: 'Download rate limit exceeded.',
  standardHeaders: true,
  legacyHeaders: false,
});