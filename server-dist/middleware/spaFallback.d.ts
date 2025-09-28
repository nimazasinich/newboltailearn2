import { Request, Response, NextFunction } from "express";
/**
 * SPA Fallback Middleware
 * Serves index.html for all non-API routes to support client-side routing
 */
export declare function spaFallback(distDir: string): (req: Request, res: Response, next: NextFunction) => any;
//# sourceMappingURL=spaFallback.d.ts.map