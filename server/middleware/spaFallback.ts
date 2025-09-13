import { Request, Response, NextFunction } from "express";
import path from "path";

/**
 * SPA Fallback Middleware
 * Serves index.html for all non-API routes to support client-side routing
 */
export function spaFallback(distDir: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const requestPath = req.path;
    
    // Skip SPA fallback for API routes, metrics, health, and static assets
    if (
      requestPath.startsWith("/api") || 
      requestPath.startsWith("/metrics") || 
      requestPath.startsWith("/health") ||
      requestPath.startsWith("/socket.io") ||
      requestPath.includes(".")
    ) {
      return next();
    }
    
    // Serve index.html for all other routes (SPA routing)
    res.sendFile(path.join(distDir, "index.html"));
  };
}