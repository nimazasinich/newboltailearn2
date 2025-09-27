/**
 * Advanced Security Middleware
 * Comprehensive security measures for the Persian Legal AI system
 */

import crypto from 'crypto';
import rateLimit from 'express-rate-limit';
import slowDown from 'express-slow-down';
import helmet from 'helmet';
import validator from 'validator';
import DOMPurify from 'isomorphic-dompurify';
import path from 'path';

class SecurityManager {
    constructor(options = {}) {
        this.config = {
            enableHelmet: options.enableHelmet !== false,
            enableRateLimit: options.enableRateLimit !== false,
            enableSlowDown: options.enableSlowDown !== false,
            enableInputValidation: options.enableInputValidation !== false,
            enableXSSProtection: options.enableXSSProtection !== false,
            enableCSRFProtection: options.enableCSRFProtection !== false,
            enableSQLInjectionProtection: options.enableSQLInjectionProtection !== false,
            enableFileUploadProtection: options.enableFileUploadProtection !== false,
            ...options
        };

        this.securityMetrics = {
            blockedRequests: 0,
            xssAttempts: 0,
            sqlInjectionAttempts: 0,
            csrfAttempts: 0,
            fileUploadBlocks: 0,
            rateLimitHits: 0
        };

        this.suspiciousPatterns = {
            xss: [
                /<script[^>]*>.*?<\/script>/gi,
                /javascript:/gi,
                /on\w+\s*=/gi,
                /<iframe[^>]*>.*?<\/iframe>/gi,
                /<object[^>]*>.*?<\/object>/gi,
                /<embed[^>]*>.*?<\/embed>/gi,
                /<link[^>]*>.*?<\/link>/gi,
                /<meta[^>]*>.*?<\/meta>/gi
            ],
            sqlInjection: [
                /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|SCRIPT)\b)/gi,
                /(\b(OR|AND)\s+\d+\s*=\s*\d+)/gi,
                /(\b(OR|AND)\s+['"]\s*=\s*['"])/gi,
                /(\b(OR|AND)\s+\w+\s*=\s*\w+)/gi,
                /(UNION\s+SELECT)/gi,
                /(DROP\s+TABLE)/gi,
                /(DELETE\s+FROM)/gi,
                /(INSERT\s+INTO)/gi,
                /(UPDATE\s+SET)/gi
            ],
            pathTraversal: [
                /\.\.\//g,
                /\.\.\\/g,
                /%2e%2e%2f/gi,
                /%2e%2e%5c/gi,
                /\.\.%2f/gi,
                /\.\.%5c/gi
            ]
        };

        this.initialize();
    }

    initialize() {
        console.log('🔒 Security Manager initialized');
    }

    // Helmet configuration
    getHelmetConfig() {
        return helmet({
            contentSecurityPolicy: {
                directives: {
                    defaultSrc: ["'self'"],
                    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
                    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                    fontSrc: ["'self'", "https://fonts.gstatic.com"],
                    imgSrc: ["'self'", "data:", "https:"],
                    connectSrc: ["'self'", "ws:", "wss:"],
                    objectSrc: ["'none'"],
                    mediaSrc: ["'self'"],
                    frameSrc: ["'none'"]
                }
            },
            crossOriginEmbedderPolicy: false,
            hsts: {
                maxAge: 31536000,
                includeSubDomains: true,
                preload: true
            },
            noSniff: true,
            xssFilter: true,
            referrerPolicy: { policy: 'strict-origin-when-cross-origin' }
        });
    }

    // Rate limiting
    getRateLimitConfig() {
        return rateLimit({
            windowMs: 15 * 60 * 1000, // 15 minutes
            max: 100, // Limit each IP to 100 requests per windowMs
            message: {
                error: 'Too many requests from this IP, please try again later.',
                retryAfter: '15 minutes'
            },
            standardHeaders: true,
            legacyHeaders: false,
            handler: (req, res) => {
                this.securityMetrics.rateLimitHits++;
                res.status(429).json({
                    error: 'Too many requests from this IP, please try again later.',
                    retryAfter: '15 minutes'
                });
            }
        });
    }

    // Slow down
    getSlowDownConfig() {
        return slowDown({
            windowMs: 15 * 60 * 1000, // 15 minutes
            delayAfter: 50, // Allow 50 requests per 15 minutes, then...
            delayMs: 500, // Add 500ms delay per request above 50
            maxDelayMs: 20000, // Maximum delay of 20 seconds
            onLimitReached: (req, res, options) => {
                console.warn(`⚠️ Slow down triggered for IP: ${req.ip}`);
            }
        });
    }

    // Input validation middleware
    inputValidation() {
        return (req, res, next) => {
            try {
                // Validate request body
                if (req.body && typeof req.body === 'object') {
                    req.body = this.sanitizeObject(req.body);
                }

                // Validate query parameters
                if (req.query && typeof req.query === 'object') {
                    req.query = this.sanitizeObject(req.query);
                }

                // Validate URL parameters
                if (req.params && typeof req.params === 'object') {
                    req.params = this.sanitizeObject(req.params);
                }

                next();
            } catch (error) {
                console.error('❌ Input validation error:', error);
                res.status(400).json({ error: 'Invalid input data' });
            }
        };
    }

    // XSS protection middleware
    xssProtection() {
        return (req, res, next) => {
            try {
                // Check for XSS patterns in request data
                const requestData = JSON.stringify({
                    body: req.body,
                    query: req.query,
                    params: req.params
                });

                if (this.detectXSS(requestData)) {
                    this.securityMetrics.xssAttempts++;
                    console.warn(`⚠️ XSS attempt detected from IP: ${req.ip}`);
                    return res.status(400).json({ error: 'Suspicious content detected' });
                }

                next();
            } catch (error) {
                console.error('❌ XSS protection error:', error);
                next();
            }
        };
    }

    // SQL injection protection middleware
    sqlInjectionProtection() {
        return (req, res, next) => {
            try {
                const requestData = JSON.stringify({
                    body: req.body,
                    query: req.query,
                    params: req.params
                });

                if (this.detectSQLInjection(requestData)) {
                    this.securityMetrics.sqlInjectionAttempts++;
                    console.warn(`⚠️ SQL injection attempt detected from IP: ${req.ip}`);
                    return res.status(400).json({ error: 'Suspicious content detected' });
                }

                next();
            } catch (error) {
                console.error('❌ SQL injection protection error:', error);
                next();
            }
        };
    }

    // File upload protection middleware
    fileUploadProtection() {
        return (req, res, next) => {
            try {
                if (req.files || req.file) {
                    const files = req.files || [req.file];
                    
                    for (const file of files) {
                        if (!this.isValidFile(file)) {
                            this.securityMetrics.fileUploadBlocks++;
                            console.warn(`⚠️ Invalid file upload attempt from IP: ${req.ip}`);
                            return res.status(400).json({ error: 'Invalid file type or content' });
                        }
                    }
                }

                next();
            } catch (error) {
                console.error('❌ File upload protection error:', error);
                next();
            }
        };
    }

    // CSRF protection middleware
    csrfProtection() {
        return (req, res, next) => {
            try {
                // Skip CSRF for GET requests
                if (req.method === 'GET') {
                    return next();
                }

                // Check CSRF token
                const csrfToken = req.headers['x-csrf-token'] || req.body._csrf;
                const sessionToken = req.session?.csrfToken;

                if (!csrfToken || !sessionToken || csrfToken !== sessionToken) {
                    this.securityMetrics.csrfAttempts++;
                    console.warn(`⚠️ CSRF attempt detected from IP: ${req.ip}`);
                    return res.status(403).json({ error: 'Invalid CSRF token' });
                }

                next();
            } catch (error) {
                console.error('❌ CSRF protection error:', error);
                next();
            }
        };
    }

    // Generate CSRF token
    generateCSRFToken() {
        return crypto.randomBytes(32).toString('hex');
    }

    // Sanitize object recursively
    sanitizeObject(obj) {
        if (typeof obj === 'string') {
            return this.sanitizeString(obj);
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeObject(item));
        }

        if (obj && typeof obj === 'object') {
            const sanitized = {};
            for (const [key, value] of Object.entries(obj)) {
                sanitized[key] = this.sanitizeObject(value);
            }
            return sanitized;
        }

        return obj;
    }

    // Sanitize string
    sanitizeString(str) {
        if (typeof str !== 'string') return str;

        // Remove null bytes
        str = str.replace(/\0/g, '');

        // HTML sanitization
        str = DOMPurify.sanitize(str);

        // Additional XSS protection
        str = str.replace(/javascript:/gi, '');
        str = str.replace(/on\w+\s*=/gi, '');

        return str;
    }

    // Detect XSS patterns
    detectXSS(input) {
        for (const pattern of this.suspiciousPatterns.xss) {
            if (pattern.test(input)) {
                return true;
            }
        }
        return false;
    }

    // Detect SQL injection patterns
    detectSQLInjection(input) {
        for (const pattern of this.suspiciousPatterns.sqlInjection) {
            if (pattern.test(input)) {
                return true;
            }
        }
        return false;
    }

    // Detect path traversal patterns
    detectPathTraversal(input) {
        for (const pattern of this.suspiciousPatterns.pathTraversal) {
            if (pattern.test(input)) {
                return true;
            }
        }
        return false;
    }

    // Validate file upload
    isValidFile(file) {
        const allowedTypes = [
            'text/plain',
            'text/csv',
            'application/json',
            'application/pdf',
            'application/zip',
            'application/x-zip-compressed'
        ];

        const allowedExtensions = ['.txt', '.csv', '.json', '.pdf', '.zip'];

        // Check file type
        if (!allowedTypes.includes(file.mimetype)) {
            return false;
        }

        // Check file extension
        const extension = path.extname(file.originalname).toLowerCase();
        if (!allowedExtensions.includes(extension)) {
            return false;
        }

        // Check file size (10MB limit)
        if (file.size > 10 * 1024 * 1024) {
            return false;
        }

        // Check for suspicious content
        if (file.buffer) {
            const content = file.buffer.toString('utf8', 0, Math.min(1024, file.size));
            if (this.detectXSS(content) || this.detectSQLInjection(content)) {
                return false;
            }
        }

        return true;
    }

    // Security headers middleware
    securityHeaders() {
        return (req, res, next) => {
            // Additional security headers
            res.setHeader('X-Content-Type-Options', 'nosniff');
            res.setHeader('X-Frame-Options', 'DENY');
            res.setHeader('X-XSS-Protection', '1; mode=block');
            res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
            res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
            
            // Remove server information
            res.removeHeader('X-Powered-By');
            
            next();
        };
    }

    // Get security metrics
    getSecurityMetrics() {
        return {
            ...this.securityMetrics,
            patterns: {
                xss: this.suspiciousPatterns.xss.length,
                sqlInjection: this.suspiciousPatterns.sqlInjection.length,
                pathTraversal: this.suspiciousPatterns.pathTraversal.length
            }
        };
    }

    // Reset security metrics
    resetSecurityMetrics() {
        this.securityMetrics = {
            blockedRequests: 0,
            xssAttempts: 0,
            sqlInjectionAttempts: 0,
            csrfAttempts: 0,
            fileUploadBlocks: 0,
            rateLimitHits: 0
        };
    }
}

export default SecurityManager;
