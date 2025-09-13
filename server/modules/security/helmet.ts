import helmet from 'helmet';
import { Application } from 'express';

/**
 * Configure Helmet security headers
 */
export function configureHelmet(app: Application): void {
  // Configure helmet with appropriate settings for the application
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // unsafe-eval needed for some React dev tools
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "ws:", "wss:", "http://localhost:*", "https://huggingface.co"],
      },
    },
    crossOriginEmbedderPolicy: false, // Disable for development, enable in production
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true
    }
  }));

  // Disable X-Powered-By header
  app.disable('x-powered-by');
}