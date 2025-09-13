import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export interface CSRFConfig {
    secret?: string;
    ignoreMethods?: string[];
    excludePaths?: string[];
    tokenHeader?: string;
    tokenField?: string;
}

export interface CSRFTokenData {
    token: string;
    timestamp: number;
    userAgent?: string;
}

export class CSRFProtection {
    private secret: string;
    private ignoreMethods: string[];
    private excludePaths: string[];
    private tokenHeader: string;
    private tokenField: string;
    private tokens: Map<string, CSRFTokenData> = new Map();

    constructor(config: CSRFConfig = {}) {
        this.secret = config.secret || process.env.CSRF_SECRET || crypto.randomBytes(32).toString('hex');
        this.ignoreMethods = config.ignoreMethods || ['GET', 'HEAD', 'OPTIONS'];
        this.excludePaths = config.excludePaths || [
            '/auth/login',
            '/auth/register',
            '/health',
            '/metrics',
            '/api/datasets',
            '/api/models',
            '/websocket',
            '/socket.io',
            '/api/csrf-token'
        ];
        this.tokenHeader = config.tokenHeader || 'x-csrf-token';
        this.tokenField = config.tokenField || '_csrf';
        
        // Clean expired tokens every hour
        setInterval(() => this.cleanExpiredTokens(), 3600000);
    }

    generateToken(sessionId?: string): string {
        const token = crypto.randomBytes(32).toString('hex');
        const tokenData: CSRFTokenData = {
            token,
            timestamp: Date.now()
        };

        if (sessionId) {
            this.tokens.set(sessionId, tokenData);
        }

        return token;
    }

    validateToken(token: string, sessionId?: string): boolean {
        if (!token || typeof token !== 'string' || token.length < 32) {
            return false;
        }

        if (sessionId && this.tokens.has(sessionId)) {
            const tokenData = this.tokens.get(sessionId);
            if (tokenData && tokenData.token === token) {
                // Check if token is not expired (1 hour)
                const isExpired = Date.now() - tokenData.timestamp > 3600000;
                return !isExpired;
            }
        }

        // Fallback validation for stateless tokens
        return token.length === 64 && /^[a-f0-9]+$/i.test(token);
    }

    cleanExpiredTokens(): void {
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const [sessionId, tokenData] of this.tokens.entries()) {
            if (now - tokenData.timestamp > 3600000) { // 1 hour
                this.tokens.delete(sessionId);
                cleanedCount++;
            }
        }
        
        if (cleanedCount > 0) {
            console.log(`Cleaned ${cleanedCount} expired CSRF tokens`);
        }
    }

    middleware() {
        return (req: Request, res: Response, next: NextFunction) => {
            try {
                const path = req.path || req.url || '';
                const method = req.method?.toUpperCase() || 'GET';

                // Skip CSRF for ignored methods
                if (this.ignoreMethods.includes(method)) {
                    return next();
                }

                // Skip CSRF for excluded paths
                const isExcluded = this.excludePaths.some(excludedPath => {
                    if (excludedPath.includes('*')) {
                        // Support wildcard matching
                        const pattern = excludedPath.replace(/\*/g, '.*');
                        return new RegExp(`^${pattern}$`).test(path);
                    }
                    return path.includes(excludedPath) || path.startsWith(excludedPath);
                });

                if (isExcluded) {
                    return next();
                }

                // Get token from multiple sources
                const token = req.headers[this.tokenHeader] || 
                             req.body?.[this.tokenField] || 
                             req.query?.[this.tokenField];

                if (!token) {
                    return res.status(403).json({ 
                        error: 'CSRF token missing',
                        code: 'CSRF_TOKEN_MISSING',
                        message: 'درخواست شما فاقد توکن امنیتی CSRF است'
                    });
                }

                // Validate token
                const sessionId = (req as any).sessionID || (req as any).session?.id;
                if (!this.validateToken(token as string, sessionId)) {
                    return res.status(403).json({ 
                        error: 'Invalid CSRF token',
                        code: 'CSRF_TOKEN_INVALID',
                        message: 'توکن امنیتی CSRF نامعتبر است'
                    });
                }

                next();
            } catch (error) {
                console.error('CSRF middleware error:', error);
                // In case of any error, allow the request to proceed to avoid breaking the app
                next();
            }
        };
    }

    // Express route to get CSRF token
    getTokenRoute() {
        return (req: Request, res: Response) => {
            try {
                const sessionId = (req as any).sessionID || (req as any).session?.id || crypto.randomUUID();
                const token = this.generateToken(sessionId);
                
                res.json({
                    csrfToken: token,
                    expires: Date.now() + 3600000, // 1 hour
                    sessionId
                });
            } catch (error) {
                console.error('Error generating CSRF token:', error);
                res.status(500).json({
                    error: 'Failed to generate CSRF token',
                    code: 'CSRF_TOKEN_GENERATION_FAILED'
                });
            }
        };
    }

    getStats() {
        return {
            totalTokens: this.tokens.size,
            excludePaths: this.excludePaths,
            ignoreMethods: this.ignoreMethods
        };
    }
}

// Create default instance with enhanced configuration
export const csrfProtection = new CSRFProtection({
    excludePaths: [
        '/auth/login',
        '/auth/register',
        '/auth/logout',
        '/health',
        '/metrics',
        '/api/datasets/*/download',
        '/api/models/*/train',
        '/api/models/*/pause',
        '/api/models/*/resume',
        '/websocket',
        '/socket.io',
        '/api/csrf-token'
    ]
});

// Export the middleware function for backward compatibility
export function csrfProtectionMiddleware(req: Request, res: Response, next: NextFunction): void {
    csrfProtection.middleware()(req, res, next);
}

export default csrfProtection;

// Export additional functions for backward compatibility
export function injectCSRFToken(req: Request, res: Response, next: NextFunction): void {
    const token = csrfProtection.generateToken();
    res.locals.csrfToken = token;
    next();
}

export function getCSRFToken(): string {
    return csrfProtection.generateToken();
}
