import { Request, Response, NextFunction } from 'express';
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
export declare class CSRFProtection {
    private secret;
    private ignoreMethods;
    private excludePaths;
    private tokenHeader;
    private tokenField;
    private tokens;
    constructor(config?: CSRFConfig);
    generateToken(sessionId?: string): string;
    validateToken(token: string, sessionId?: string): boolean;
    cleanExpiredTokens(): void;
    middleware(): (req: Request, res: Response, next: NextFunction) => any;
    getTokenRoute(): (req: Request, res: Response) => void;
    getStats(): {
        totalTokens: number;
        excludePaths: string[];
        ignoreMethods: string[];
    };
}
export declare const csrfProtection: CSRFProtection;
export declare function csrfProtectionMiddleware(req: Request, res: Response, next: NextFunction): void;
export default csrfProtection;
export declare function injectCSRFToken(req: Request, res: Response, next: NextFunction): void;
export declare function getCSRFToken(): string;
//# sourceMappingURL=csrf.d.ts.map