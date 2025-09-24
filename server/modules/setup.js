import { applySecurity, setupDevIdentification } from './security/index';
import { applyRouteProtection } from './security/routeProtection';
import { setupMetrics } from './monitoring/metrics';
import { configureSocketAuth } from './sockets/auth';
import { createAuthRoutes } from './routes/auth.routes';
import { createModelsRoutes } from './routes/models.routes';
import { AuthController } from './controllers/auth.controller';
import { ModelsController } from './controllers/models.controller';
import { config } from './security/config';
/**
 * Setup all modular components
 * This function is called from server/index.ts to wire up all modules
 * without breaking the existing structure
 */
export function setupModules(app, db, io) {
    console.log('🔧 Setting up modular components...');
    // 1. Apply security middleware
    applySecurity(app);
    console.log('✅ Security middleware applied');
    // 2. Apply route-specific protection (JWT, CSRF, rate limiting)
    applyRouteProtection(app);
    console.log('✅ Route protection enforced');
    // 3. Setup dev identification (non-production only)
    setupDevIdentification(app);
    if (config.NODE_ENV !== 'production' && config.DEV_ADMIN_USER) {
        console.log('✅ Dev identification endpoint enabled');
    }
    // 4. Setup metrics endpoint
    setupMetrics(app);
    if (config.ENABLE_METRICS) {
        console.log('✅ Metrics endpoint enabled at /metrics');
    }
    // 5. Configure Socket.IO authentication
    configureSocketAuth(io);
    console.log('✅ Socket.IO authentication configured');
    // 6. Setup modular routes
    setupModularRoutes(app, db, io);
    console.log('✅ Modular routes configured');
}
/**
 * Setup modular routes
 */
function setupModularRoutes(app, db, io) {
    // Create controllers
    const authController = new AuthController(db);
    const modelsController = new ModelsController(db, io);
    // Mount routes
    app.use('/api/auth', createAuthRoutes(authController));
    app.use('/api/models', createModelsRoutes(modelsController, io));
    
    // Import and mount datasets gallery route
    import('../routes/datasets.ts').then(({ default: datasetsRoute }) => {
        app.use('/api/datasets-gallery', datasetsRoute);
        console.log('✅ Datasets gallery route mounted');
    });
    
    // Note: We're not removing existing routes from server/index.ts
    // to maintain backward compatibility. The new routes will coexist
    // with the old ones, and we can gradually migrate functionality.
}
/**
 * Export configuration for use in server/index.ts
 */
export { config } from './security/config';
export { metricsCollector } from './monitoring/metrics';
