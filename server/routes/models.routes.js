import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate, schemas } from '../modules/security/validators.js';
import { apiRateLimiter, trainingRateLimiter } from '../modules/security/rateLimiter.js';
import { csrfProtection } from '../modules/security/csrf.js';
export function createModelsRoutes(controller, io) {
    const router = Router();
    // Apply common middleware for models routes
    router.use(requireAuth); // All model routes require authentication
    router.use(apiRateLimiter); // Apply API rate limiting
    // CSRF protection for state-changing methods
    router.use((req, res, next) => {
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            return csrfProtection(req, res, next);
        }
        next();
    });
    // Basic CRUD operations
    router.get('/', controller.listModels.bind(controller));
    router.post('/', validate(schemas.createModel), controller.createModel.bind(controller));
    router.get('/:id', controller.getModel.bind(controller));
    router.put('/:id', validate(schemas.updateModel), controller.updateModel.bind(controller));
    router.delete('/:id', controller.deleteModel.bind(controller));
    // Training specific routes
    router.post('/:id/train', requireRole('trainer'), trainingRateLimiter, (req, res, next) => controller.startTraining(req, res, next));
    router.post('/:id/pause', requireRole('trainer'), (req, res, next) => controller.pauseTraining(req, res, next));
    router.post('/:id/resume', requireRole('trainer'), (req, res, next) => controller.resumeTraining(req, res, next));
    router.post('/:id/optimize', requireRole('trainer'), (req, res, next) => controller.startOptimization(req, res, next));
    router.post('/:id/export', requireRole('trainer'), controller.exportModel.bind(controller));
    router.post('/:id/load', requireRole('trainer'), controller.loadModel.bind(controller));
    router.get('/:id/checkpoints', controller.getModelCheckpoints.bind(controller));
    router.get('/:id/logs', controller.getModelLogs.bind(controller));
    return router;
}
