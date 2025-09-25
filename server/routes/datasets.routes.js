import { Router } from 'express';
import fs from 'fs';
import path from 'path';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate, schemas } from '../modules/security/validators.js';
import { apiRateLimiter } from '../modules/security/validators.js';
import { csrfProtection } from '../modules/security/validators.js';

const ROOT = process.cwd();
const DATASETS_DIR = path.join(ROOT, 'datasets');
const CATALOG_PATH = path.join(DATASETS_DIR, 'catalog.json');
const FILES_DIR = path.join(DATASETS_DIR, 'files');

function etagOf(filePath) {
  const stat = fs.statSync(filePath);
  return `"${stat.size.toString(16)}-${stat.mtimeMs.toString(16)}"`;
}
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
    
    // Enhanced catalog route (must come before /:id routes)
    router.get('/catalog', (_req, res) => {
        try {
            if (!fs.existsSync(CATALOG_PATH)) return res.status(404).json({ error: 'catalog.json not found' });
            const json = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
            res.setHeader('Cache-Control', 'no-store');
            return res.json(json);
        } catch (e) {
            console.error('CATALOG_ERR', e);
            return res.status(500).json({ error: 'Failed to read dataset catalog' });
        }
    });

    // Other dataset routes (after catalog)
    router.get('/:id', controller.getDataset.bind(controller));
    router.put('/:id', requireRole('trainer'), validate(schemas.updateDataset), controller.updateDataset.bind(controller));
    router.delete('/:id', requireRole('admin'), controller.deleteDataset.bind(controller));
    router.post('/:id/process', requireRole('trainer'), controller.processDataset.bind(controller));

    // HEAD /api/datasets/:id/download
    router.head('/:id/download', (req, res) => {
        try {
            if (!fs.existsSync(CATALOG_PATH)) return res.sendStatus(404);
            const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
            const item = Array.isArray(catalog) ? catalog.find((x) => x.id === req.params.id) : null;
            if (!item) return res.sendStatus(404);
            if (item.localFile) {
                const filePath = path.join(FILES_DIR, item.localFile);
                if (!fs.existsSync(filePath)) return res.sendStatus(404);
                res.setHeader('ETag', etagOf(filePath));
                res.setHeader('Last-Modified', fs.statSync(filePath).mtime.toUTCString());
                return res.sendStatus(200);
            }
            if (item.remoteUrl) return res.sendStatus(200);
            return res.sendStatus(400);
        } catch { return res.sendStatus(500); }
    });

    // GET /api/datasets/:id/download (enhanced version)
    router.get('/:id/download', async (req, res) => {
        try {
            if (!fs.existsSync(CATALOG_PATH)) return res.status(404).json({ error: 'catalog.json not found' });
            const catalog = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
            const item = Array.isArray(catalog) ? catalog.find((x) => x.id === req.params.id) : null;
            if (!item) return res.status(404).json({ error: 'Dataset not found' });

            if (item.localFile) {
                const filePath = path.join(FILES_DIR, item.localFile);
                if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'Local dataset file not found' });
                res.setHeader('Content-Disposition', `attachment; filename="${item.id}.zip"`);
                res.setHeader('Content-Type', 'application/zip');
                res.setHeader('ETag', etagOf(filePath));
                res.setHeader('Last-Modified', fs.statSync(filePath).mtime.toUTCString());
                return fs.createReadStream(filePath).pipe(res);
            }

            if (item.remoteUrl) {
                const { default: fetch } = await import('node-fetch');
                const up = await fetch(item.remoteUrl);
                if (!up.ok || !up.body) return res.status(502).json({ error: 'Upstream fetch failed' });
                res.setHeader('Content-Disposition', `attachment; filename="${item.id}.zip"`);
                return up.body.pipe(res);
            }

            return res.status(400).json({ error: 'No localFile or remoteUrl for this dataset' });
        } catch (e) {
            console.error('DOWNLOAD_ERR', e);
            return res.status(500).json({ error: 'Download proxy error' });
        }
    });
    return router;
}
