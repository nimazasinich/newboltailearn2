/**
 * Validated environment configuration
 */
export declare const config: {
    NODE_ENV: "development" | "production" | "test";
    PORT: string;
    JWT_SECRET: string;
    RATE_LIMIT_GLOBAL: string;
    RATE_LIMIT_AUTH: string;
    RATE_LIMIT_API: string;
    RATE_LIMIT_TRAINING: string;
    RATE_LIMIT_DOWNLOAD: string;
    CORS_ORIGIN: string;
    DATABASE_PATH: string;
    SESSION_SECRET?: string;
    CSRF_SECRET?: string;
    HF_TOKEN_B64?: string;
    HF_TOKEN_ENC?: string;
    USE_FAKE_DATA?: boolean;
    DEMO_MODE?: boolean;
    USE_WORKERS?: boolean;
    SKIP_CSRF?: boolean;
    DEV_ADMIN_USER?: string;
    DEV_ADMIN_PASS?: string;
    DEFAULT_ADMIN_PASSWORD?: string;
    ENABLE_METRICS?: boolean;
    ENABLE_LOG_SHIPPING?: boolean;
    LOG_SHIPPING_URL?: string;
};
/**
 * Check if running in production
 */
export declare const isProduction: () => boolean;
/**
 * Check if running in development
 */
export declare const isDevelopment: () => boolean;
/**
 * Check if running in test mode
 */
export declare const isTest: () => boolean;
/**
 * Check if demo mode is enabled
 */
export declare const isDemoMode: () => boolean;
/**
 * Check if fake data should be used
 */
export declare const useFakeData: () => boolean;
/**
 * Get decoded HF token
 */
export declare const getHFToken: () => string | undefined;
//# sourceMappingURL=config.d.ts.map