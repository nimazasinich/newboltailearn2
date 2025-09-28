import { Counter, Histogram, Gauge } from 'prom-client';
export declare const httpRequestDuration: Histogram<"method" | "route" | "status_code">;
export declare const httpRequestTotal: Counter<"method" | "route" | "status_code">;
export declare const activeConnections: Gauge<string>;
export declare const trainingSessionsActive: Gauge<string>;
export declare const trainingSessionsTotal: Counter<"status" | "model_type">;
export declare const databaseOperations: Counter<"operation" | "table">;
export declare const systemMemoryUsage: Gauge<"type">;
export declare const systemCpuUsage: Gauge<string>;
export declare const handler: (req: any, res: any) => Promise<void>;
export declare function updateSystemMetrics(): void;
//# sourceMappingURL=prom.d.ts.map