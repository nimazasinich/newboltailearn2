"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHFToken = exports.useFakeData = exports.isDemoMode = exports.isTest = exports.isDevelopment = exports.isProduction = exports.config = void 0;
const dotenv_1 = require("dotenv");
const zod_1 = require("zod");
// Load environment variables
dotenv_1.default.config();
/**
 * Environment configuration schema
 */
const envSchema = zod_1.z.object({
    // Server
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    PORT: zod_1.z.string().regex(/^\d+$/).default('3001'),
    // Security
    JWT_SECRET: zod_1.z.string().min(32),
    SESSION_SECRET: zod_1.z.string().min(32).optional(),
    CSRF_SECRET: zod_1.z.string().min(32).optional(),
    // Rate Limiting
    RATE_LIMIT_GLOBAL: zod_1.z.string().regex(/^\d+$/).default('100'),
    RATE_LIMIT_AUTH: zod_1.z.string().regex(/^\d+$/).default('5'),
    RATE_LIMIT_API: zod_1.z.string().regex(/^\d+$/).default('30'),
    RATE_LIMIT_TRAINING: zod_1.z.string().regex(/^\d+$/).default('10'),
    RATE_LIMIT_DOWNLOAD: zod_1.z.string().regex(/^\d+$/).default('20'),
    // CORS
    CORS_ORIGIN: zod_1.z.string().default('http://localhost:5173'),
    // Database
    DATABASE_PATH: zod_1.z.string().default('./persian_legal_ai.db'),
    // Hugging Face
    HF_TOKEN_B64: zod_1.z.string().optional(),
    HF_TOKEN_ENC: zod_1.z.string().optional(), // Legacy support
    // Features
    USE_FAKE_DATA: zod_1.z.string().default('false').transform(val => val === 'true'),
    DEMO_MODE: zod_1.z.string().default('false').transform(val => val === 'true'),
    USE_WORKERS: zod_1.z.string().default('false').transform(val => val === 'true'),
    SKIP_CSRF: zod_1.z.string().default('false').transform(val => val === 'true'),
    // Dev Identification (non-production only)
    DEV_ADMIN_USER: zod_1.z.string().optional(),
    DEV_ADMIN_PASS: zod_1.z.string().optional(),
    DEFAULT_ADMIN_PASSWORD: zod_1.z.string().optional(),
    // Monitoring
    ENABLE_METRICS: zod_1.z.string().default('true').transform(val => val === 'true'),
    ENABLE_LOG_SHIPPING: zod_1.z.string().default('false').transform(val => val === 'true'),
    LOG_SHIPPING_URL: zod_1.z.string().url().optional(),
});
/**
 * Validated environment configuration
 */
exports.config = (() => {
    try {
        const env = envSchema.parse(process.env);
        // Decode HF token if provided (support both formats)
        if (env.HF_TOKEN_B64) {
            env.HF_TOKEN = Buffer.from(env.HF_TOKEN_B64, 'base64').toString('utf8');
        }
        else if (env.HF_TOKEN_ENC) {
            // Legacy support
            env.HF_TOKEN = Buffer.from(env.HF_TOKEN_ENC, 'base64').toString('utf8');
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
        if (error instanceof zod_1.z.ZodError) {
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
const isProduction = () => exports.config.NODE_ENV === 'production';
exports.isProduction = isProduction;
/**
 * Check if running in development
 */
const isDevelopment = () => exports.config.NODE_ENV === 'development';
exports.isDevelopment = isDevelopment;
/**
 * Check if running in test mode
 */
const isTest = () => exports.config.NODE_ENV === 'test';
exports.isTest = isTest;
/**
 * Check if demo mode is enabled
 */
const isDemoMode = () => exports.config.DEMO_MODE === true;
exports.isDemoMode = isDemoMode;
/**
 * Check if fake data should be used
 */
const useFakeData = () => exports.config.USE_FAKE_DATA === true;
exports.useFakeData = useFakeData;
/**
 * Get decoded HF token
 */
const getHFToken = () => {
    return exports.config.HF_TOKEN;
};
exports.getHFToken = getHFToken;
