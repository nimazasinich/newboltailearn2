import { Application, Request, Response, NextFunction } from 'express';
import promClient from 'prom-client';
declare const register: promClient.Registry<"text/plain; version=0.0.4; charset=utf-8">;
/**
 * Middleware to collect HTTP metrics
 */
export declare function metricsMiddleware(): (req: Request, res: Response, next: NextFunction) => void;
/**
 * Setup metrics endpoint
 */
export declare function setupRealMetrics(app: Application): void;
/**
 * Update WebSocket connections metric
 */
export declare function updateWebSocketConnections(count: number): void;
/**
 * Record training session start
 */
export declare function recordTrainingStart(modelType: string): void;
/**
 * Record training session end
 */
export declare function recordTrainingEnd(): void;
/**
 * Update model metrics
 */
export declare function updateModelMetrics(modelId: string, modelType: string, accuracy: number, loss: number): void;
/**
 * Record database query
 */
export declare function recordDatabaseQuery(operation: string, table: string, duration: number): void;
/**
 * Record authentication attempt
 */
export declare function recordAuthAttempt(status: 'success' | 'failure', method: 'login' | 'register' | 'token'): void;
/**
 * Record application error
 */
export declare function recordError(type: string, severity: 'low' | 'medium' | 'high' | 'critical'): void;
export { register as metricsRegistry };
//# sourceMappingURL=realMetrics.d.ts.map