import { Request, Response, NextFunction } from 'express';
declare global {
    namespace Express {
        interface Request {
            user?: {
                id: number;
                username: string;
                role: string;
                email: string;
            };
        }
    }
}
/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header and adds user info to request
 */
export declare function requireAuth(req: Request, res: Response, next: NextFunction): void;
/**
 * Role-based authorization middleware
 * Checks if user has required role
 */
export declare function requireRole(requiredRole: string): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Generate JWT token for user
 */
export declare function generateToken(user: {
    id: number;
    username: string;
    role: string;
    email: string;
}): string;
/**
 * Verify token without middleware (for manual verification)
 */
export declare function verifyToken(token: string): {
    id: number;
    username: string;
    role: string;
    email: string;
};
//# sourceMappingURL=auth.d.ts.map