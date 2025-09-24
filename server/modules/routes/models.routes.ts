import { Router } from 'express';
import { ModelsController } from '../controllers/models.controller';
import { requireAuth, requireRole } from '../../middleware/auth';
import { validate, validateQuery, schemas } from '../security/validators';
import { apiRateLimiter } from '../security/rateLimiter';
import { csrfProtection } from '../security/csrf';

export function createModelsRoutes(modelsController: ModelsController): Router {
  const router = Router();

  // Apply rate limiting to all routes
  router.use(apiRateLimiter);

  // List models (protected)
  router.get('/',
    requireAuth,
    validateQuery(schemas.pagination),
    modelsController.listModels.bind(modelsController)
  );

  // Get model by ID (protected)
  router.get('/:id',
    requireAuth,
    modelsController.getModel.bind(modelsController)
  );

  // Create model (trainer/admin only)
  router.post('/',
    requireAuth,
    requireRole('trainer'),
    csrfProtection.middleware(),
    validate(schemas.createModel),
    modelsController.createModel.bind(modelsController)
  );

  // Update model (trainer/admin only)
  router.put('/:id',
    requireAuth,
    requireRole('trainer'),
    csrfProtection.middleware(),
    validate(schemas.updateModel),
    modelsController.updateModel.bind(modelsController)
  );

  // Delete model (admin only)
  router.delete('/:id',
    requireAuth,
    requireRole('admin'),
    csrfProtection.middleware(),
    modelsController.deleteModel.bind(modelsController)
  );

  // Get model logs
  router.get('/:id/logs',
    requireAuth,
    validateQuery(schemas.pagination),
    modelsController.getModelLogs.bind(modelsController)
  );

  // Get model checkpoints
  router.get('/:id/checkpoints',
    requireAuth,
    modelsController.getModelCheckpoints.bind(modelsController)
  );

  // Export model
  router.post('/:id/export',
    requireAuth,
    requireRole('trainer'),
    csrfProtection.middleware(),
    modelsController.exportModel.bind(modelsController)
  );

  return router;
}