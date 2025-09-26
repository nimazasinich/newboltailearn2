import { Router, Request, Response } from 'express';
import { ModelPersistence } from '../services/ModelPersistence';
import { requireAuth, requireRole } from '../middleware/auth';
import { ErrorHandler } from '../middleware/errorHandler';
import Database from 'better-sqlite3';
import multer from 'multer';
import path from 'path';

const router = Router();

// Initialize services
const db = Database('./persian_legal_ai.db');
const modelPersistence = new ModelPersistence(db);
const errorHandler = new ErrorHandler(db);

// Configure multer for file uploads
const upload = multer({
  dest: 'uploads/',
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only specific file types
    const allowedTypes = [
      'application/json',
      'text/plain',
      'application/octet-stream'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JSON and text files are allowed.'));
    }
  }
});

/**
 * List all saved models
 */
router.get('/', requireAuth, async (req: Request, res: Response) => {
  try {
    const models = modelPersistence.listModels();
    res.json({ models });
  } catch (error) {
    const appError = errorHandler.handleTrainingError(error as Error, 'list_models');
    res.status(appError.statusCode || 500).json({ error: appError.message });
  }
});

/**
 * Get model metadata by ID
 */
router.get('/:modelId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { modelId } = req.params;
    const metadata = modelPersistence.getModelMetadata(modelId);
    
    if (!metadata) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    res.json({ model: metadata });
  } catch (error) {
    const appError = errorHandler.handleTrainingError(error as Error, 'get_model_metadata', req.params.modelId);
    res.status(appError.statusCode || 500).json({ error: appError.message });
  }
});

/**
 * Load a model
 */
router.post('/:modelId/load', requireAuth, requireRole('trainer'), async (req: Request, res: Response) => {
  try {
    const { modelId } = req.params;
    
    const { model, tokenizer, metadata } = await modelPersistence.loadModel(modelId);
    
    res.json({ 
      success: true, 
      message: 'Model loaded successfully',
      metadata 
    });
  } catch (error) {
    const appError = errorHandler.handleTrainingError(error as Error, 'load_model', req.params.modelId);
    res.status(appError.statusCode || 500).json({ error: appError.message });
  }
});

/**
 * Delete a model
 */
router.delete('/:modelId', requireAuth, requireRole('admin'), async (req: Request, res: Response) => {
  try {
    const { modelId } = req.params;
    
    const deleted = await modelPersistence.deleteModel(modelId);
    
    if (!deleted) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    res.json({ success: true, message: 'Model deleted successfully' });
  } catch (error) {
    const appError = errorHandler.handleTrainingError(error as Error, 'delete_model', req.params.modelId);
    res.status(appError.statusCode || 500).json({ error: appError.message });
  }
});

/**
 * Update model metadata
 */
router.patch('/:modelId', requireAuth, requireRole('trainer'), async (req: Request, res: Response) => {
  try {
    const { modelId } = req.params;
    const updates = req.body;
    
    const updated = modelPersistence.updateModelMetadata(modelId, updates);
    
    if (!updated) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    res.json({ success: true, message: 'Model metadata updated successfully' });
  } catch (error) {
    const appError = errorHandler.handleTrainingError(error as Error, 'update_model_metadata', req.params.modelId);
    res.status(appError.statusCode || 500).json({ error: appError.message });
  }
});

/**
 * Check if model exists
 */
router.head('/:modelId', requireAuth, async (req: Request, res: Response) => {
  try {
    const { modelId } = req.params;
    const exists = modelPersistence.modelExists(modelId);
    
    if (exists) {
      res.status(200).end();
    } else {
      res.status(404).end();
    }
  } catch (error) {
    res.status(500).end();
  }
});

/**
 * Get model file path
 */
router.get('/:modelId/path', requireAuth, requireRole('trainer'), async (req: Request, res: Response) => {
  try {
    const { modelId } = req.params;
    const modelPath = modelPersistence.getModelPath(modelId);
    
    if (!modelPath) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    res.json({ modelPath });
  } catch (error) {
    const appError = errorHandler.handleTrainingError(error as Error, 'get_model_path', req.params.modelId);
    res.status(appError.statusCode || 500).json({ error: appError.message });
  }
});

/**
 * Export model (download)
 */
router.get('/:modelId/export', requireAuth, requireRole('trainer'), async (req: Request, res: Response) => {
  try {
    const { modelId } = req.params;
    const modelPath = modelPersistence.getModelPath(modelId);
    
    if (!modelPath) {
      return res.status(404).json({ error: 'Model not found' });
    }
    
    // Check if model directory exists
    const modelDir = path.dirname(modelPath);
    if (!require('fs').existsSync(modelDir)) {
      return res.status(404).json({ error: 'Model files not found' });
    }
    
    // Create zip file with model files
    const archiver = require('archiver');
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${modelId}.zip"`);
    
    archive.pipe(res);
    archive.directory(modelDir, false);
    archive.finalize();
    
  } catch (error) {
    const appError = errorHandler.handleTrainingError(error as Error, 'export_model', req.params.modelId);
    res.status(appError.statusCode || 500).json({ error: appError.message });
  }
});

/**
 * Import model (upload)
 */
router.post('/import', requireAuth, requireRole('admin'), upload.single('model'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const { modelId, modelName, modelType } = req.body;
    
    if (!modelId || !modelName) {
      return res.status(400).json({ error: 'Model ID and name are required' });
    }
    
    // Check if model already exists
    if (modelPersistence.modelExists(modelId)) {
      return res.status(409).json({ error: 'Model with this ID already exists' });
    }
    
    // Extract uploaded file
    const extractPath = path.join('models', 'imported', modelId);
    const fs = require('fs');
    const AdmZip = require('adm-zip');
    
    if (!fs.existsSync(extractPath)) {
      fs.mkdirSync(extractPath, { recursive: true });
    }
    
    const zip = new AdmZip(req.file.path);
    zip.extractAllTo(extractPath, true);
    
    // Clean up uploaded file
    fs.unlinkSync(req.file.path);
    
    // Update database with imported model info
    const metadata = {
      id: modelId,
      name: modelName,
      type: modelType || 'persian-bert',
      status: 'completed',
      accuracy: 0,
      loss: 0,
      epochs: 0,
      current_epoch: 0,
      config: JSON.stringify({
        filePath: path.join(extractPath, 'model.json'),
        tokenizerPath: path.join(extractPath, 'tokenizer.json'),
        imported: true
      }),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      created_by: (req as any).user?.id
    };
    
    db.prepare(`
      INSERT INTO models (id, name, type, status, accuracy, loss, epochs, current_epoch, config, created_at, updated_at, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      metadata.id,
      metadata.name,
      metadata.type,
      metadata.status,
      metadata.accuracy,
      metadata.loss,
      metadata.epochs,
      metadata.current_epoch,
      metadata.config,
      metadata.created_at,
      metadata.updated_at,
      metadata.created_by
    );
    
    res.json({ 
      success: true, 
      message: 'Model imported successfully',
      modelId 
    });
    
  } catch (error) {
    const appError = errorHandler.handleTrainingError(error as Error, 'import_model');
    res.status(appError.statusCode || 500).json({ error: appError.message });
  }
});

/**
 * Get model statistics
 */
router.get('/stats/overview', requireAuth, async (req: Request, res: Response) => {
  try {
    const models = modelPersistence.listModels();
    
    const stats = {
      totalModels: models.length,
      modelsByType: models.reduce((acc, model) => {
        acc[model.type] = (acc[model.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      averageAccuracy: models.length > 0 ? 
        models.reduce((sum, model) => sum + model.accuracy, 0) / models.length : 0,
      averageLoss: models.length > 0 ? 
        models.reduce((sum, model) => sum + model.loss, 0) / models.length : 0,
      totalEpochs: models.reduce((sum, model) => sum + model.epochs, 0),
      recentModels: models
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 5)
    };
    
    res.json({ stats });
  } catch (error) {
    const appError = errorHandler.handleTrainingError(error as Error, 'get_model_stats');
    res.status(appError.statusCode || 500).json({ error: appError.message });
  }
});

export default router;