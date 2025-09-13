import dotenv from 'dotenv';
import { z } from 'zod';
// Load environment variables
dotenv.config();
/**
 * Environment configuration schema
 */
const envSchema = z.object({
    // Server
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    PORT: z.string().regex(/^\d+$/).default('3001'),
    // Security
    JWT_SECRET: z.string().min(32),
    SESSION_SECRET: z.string().min(32).optional(),
    // Rate Limiting
    RATE_LIMIT_GLOBAL: z.string().regex(/^\d+$/).default('100'),
    RATE_LIMIT_AUTH: z.string().regex(/^\d+$/).default('5'),
    RATE_LIMIT_API: z.string().regex(/^\d+$/).default('30'),
    RATE_LIMIT_TRAINING: z.string().regex(/^\d+$/).default('10'),
    RATE_LIMIT_DOWNLOAD: z.string().regex(/^\d+$/).default('20'),
    // CORS
    CORS_ORIGIN: z.string().default('http://localhost:5173'),
    // Database
    DATABASE_PATH: z.string().default('./persian_legal_ai.db'),
    // Hugging Face
    HF_TOKEN_B64: z.string().optional(),
    // Features
    USE_FAKE_DATA: z.string().default('false').transform(val => val === 'true'),
    DEMO_MODE: z.string().default('false').transform(val => val === 'true'),
    USE_WORKERS: z.string().default('false').transform(val => val === 'true'),
    SKIP_CSRF: z.string().default('false').transform(val => val === 'true'),
    // Dev Identification (non-production only)
    DEV_ADMIN_USER: z.string().optional(),
    DEV_ADMIN_PASS: z.string().optional(),
    // Monitoring
    ENABLE_METRICS: z.string().default('true').transform(val => val === 'true'),
    ENABLE_LOG_SHIPPING: z.string().default('false').transform(val => val === 'true'),
    LOG_SHIPPING_URL: z.string().url().optional(),
});
/**
 * Validated environment configuration
 */
export const config = (() => {
    try {
        const env = envSchema.parse(process.env);
        // Decode HF token if provided
        if (env.HF_TOKEN_B64) {
            env.HF_TOKEN = Buffer.from(env.HF_TOKEN_B64, 'base64').toString('utf8');
        }
        // Validate dev credentials only in non-production
        if (env.NODE_ENV !== 'production' && (env.DEV_ADMIN_USER || env.DEV_ADMIN_PASS)) {
            if (!env.DEV_ADMIN_USER || !env.DEV_ADMIN_PASS) {
                console.warn('Warning: Both DEV_ADMIN_USER and DEV_ADMIN_PASS must be set for dev identification');
            }
        }
        // Remove dev credentials in production
        if (env.NODE_ENV === 'production') {
            delete env.DEV_ADMIN_USER;
            delete env.DEV_ADMIN_PASS;
        }
        return env;
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            console.error('Environment configuration validation failed:');
            error.issues.forEach(err => {
                console.error(`  ${err.path.join('.')}: ${err.message}`);
            });
            // Provide helpful message for missing required variables
            const missing = error.issues
                .filter(err => err.code === 'invalid_type')
                .map(err => err.path.join('.'));
            if (missing.length > 0) {
                console.error('\nMissing required environment variables:');
                missing.forEach(varName => {
                    console.error(`  - ${varName}`);
                });
                console.error('\nPlease create a .env file with the required variables.');
            }
            process.exit(1);
        }
        throw error;
    }
})();
/**
 * Check if running in production
 */
export const isProduction = () => config.NODE_ENV === 'production';
/**
 * Check if running in development
 */
export const isDevelopment = () => config.NODE_ENV === 'development';
/**
 * Check if running in test mode
 */
export const isTest = () => config.NODE_ENV === 'test';
/**
 * Check if demo mode is enabled
 */
export const isDemoMode = () => config.DEMO_MODE === true;
/**
 * Check if fake data should be used
 */
export const useFakeData = () => config.USE_FAKE_DATA === true;
/**
 * Get decoded HF token
 */
export const getHFToken = () => {
    return config.HF_TOKEN;
};
