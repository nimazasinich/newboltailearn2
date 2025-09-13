import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate, schemas } from '../modules/security/validators.js';
import { apiRateLimiter } from '../modules/security/rateLimiter.js';
import { csrfProtection } from '../modules/security/csrf.js';
export function createDatasetsRoutes(controller, io) {
    const router = Router();
    // Apply common middleware
    router.use(requireAuth);
    router.use(apiRateLimiter);
    // CSRF protection for state-changing methods
    router.use((req, res, next) => {
        if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method)) {
            return csrfProtection(req, res, next);
        }
        next();
    });
    // Dataset routes
    router.get('/', controller.listDatasets.bind(controller));
    router.post('/', requireRole('trainer'), validate(schemas.createDataset), controller.createDataset.bind(controller));
    router.get('/:id', controller.getDataset.bind(controller));
    router.put('/:id', requireRole('trainer'), validate(schemas.updateDataset), controller.updateDataset.bind(controller));
    router.delete('/:id', requireRole('admin'), controller.deleteDataset.bind(controller));
    router.post('/:id/download', requireRole('trainer'), controller.downloadDataset.bind(controller));
    router.post('/:id/process', requireRole('trainer'), controller.processDataset.bind(controller));
    return router;
}
