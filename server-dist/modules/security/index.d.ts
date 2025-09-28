import { Application } from 'express';
/**
 * Apply all security middleware to the application
 */
export declare function applySecurity(app: Application): void;
/**
 * Export all security middleware for selective use
 */
export { configureHelmet } from './helmet';
export { globalRateLimiter, authRateLimiter, apiRateLimiter, trainingRateLimiter, downloadRateLimiter } from './rateLimiter';
export { csrfProtection, injectCSRFToken, getCSRFToken } from './csrf';
export * from './validators';
export * from './config';
/**
 * Dev identification endpoint (non-production only)
 */
export declare function setupDevIdentification(app: Application): void;
//# sourceMappingURL=index.d.ts.map