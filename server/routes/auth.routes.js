import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validate, schemas } from '../modules/security/validators.js';
import { authRateLimiter } from '../modules/security/rateLimiter.js';
import { csrfProtection } from '../modules/security/csrf.js';
export function createAuthRoutes(controller) {
    const router = Router();
    // Apply rate limiting to auth routes
    router.use(authRateLimiter);
    // CSRF protection for state-changing methods
    router.use((req, res, next) => {
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            return csrfProtection(req, res, next);
        }
        next();
    });
    // Auth routes
    router.post('/login', validate(schemas.login), controller.login.bind(controller));
    router.post('/register', validate(schemas.register), controller.register.bind(controller));
    router.get('/me', requireAuth, controller.getCurrentUser.bind(controller));
    router.put('/profile', requireAuth, validate(schemas.updateProfile), controller.updateProfile.bind(controller));
    router.post('/change-password', requireAuth, validate(schemas.changePassword), controller.changePassword.bind(controller));
    return router;
}
