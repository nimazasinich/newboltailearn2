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
export declare const globalRateLimiter: any;
/**
 * Strict rate limiter for authentication endpoints
 */
export declare const authRateLimiter: any;
/**
 * API rate limiter for general API endpoints
 */
export declare const apiRateLimiter: any;
/**
 * Training rate limiter - for resource-intensive operations
 */
export declare const trainingRateLimiter: any;
/**
 * Download rate limiter - for dataset downloads
 */
export declare const downloadRateLimiter: any;
//# sourceMappingURL=rateLimiter.d.ts.map