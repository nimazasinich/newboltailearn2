import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller.js';
import { validate, schemas } from '../security/validators.js';
import { authRateLimiter } from '../security/rateLimiter.js';
import { requireAuth } from '../../middleware/auth.js';

export function createAuthRoutes(authController: AuthController): Router {
  const router = Router();

  // Public routes (with rate limiting)
  router.post('/login', 
    authRateLimiter,
    validate(schemas.login),
    authController.login.bind(authController)
  );

  router.post('/register',
    authRateLimiter,
    validate(schemas.register),
    authController.register.bind(authController)
  );

  router.post('/refresh',
    authRateLimiter,
    authController.refreshToken.bind(authController)
  );

  // Protected routes
  router.post('/logout',
    requireAuth,
    authController.logout.bind(authController)
  );

  router.get('/profile',
    requireAuth,
    authController.getProfile.bind(authController)
  );

  router.put('/profile',
    requireAuth,
    authController.updateProfile.bind(authController)
  );

  router.post('/change-password',
    requireAuth,
    authController.changePassword.bind(authController)
  );

  return router;
}