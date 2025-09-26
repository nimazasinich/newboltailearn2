import * as tf from "@tensorflow/tfjs-node";
import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

export interface ModelMetadata {
  id: string;
  name: string;
  type: string;
  accuracy: number;
  loss: number;
  epochs: number;
  vocabSize: number;
  maxLen: number;
  numClasses: number;
  createdAt: string;
  updatedAt: string;
  filePath: string;
  tokenizerPath: string;
  createdBy?: number;
}

export interface SaveModelOptions {
  modelId: string;
  modelName: string;
  modelType: string;
  accuracy: number;
  loss: number;
  epochs: number;
  vocabSize: number;
  maxLen: number;
  numClasses: number;
  createdBy?: number;
}

export class ModelPersistence {
  private modelsDir: string;
  private db: Database.Database;

  constructor(database: Database.Database, modelsDir: string = "./models/saved") {
    this.db = database;
    this.modelsDir = path.resolve(modelsDir);
    this.ensureModelsDirectory();
  }

  private ensureModelsDirectory(): void {
    if (!fs.existsSync(this.modelsDir)) {
      fs.mkdirSync(this.modelsDir, { recursive: true });
    }
  }

  /**
   * Save a trained model to filesystem and database
   */
  async saveModel(
    model: tf.LayersModel,
    tokenizer: any,
    options: SaveModelOptions
  ): Promise<ModelMetadata> {
    try {
      const modelId = options.modelId;
      const modelDir = path.join(this.modelsDir, modelId);
      
      // Create model directory
      if (!fs.existsSync(modelDir)) {
        fs.mkdirSync(modelDir, { recursive: true });
      }

      // Save model to filesystem
      const modelPath = path.join(modelDir, "model.json");
      await model.save(`file://${modelDir}`);

      // Save tokenizer
      const tokenizerPath = path.join(modelDir, "tokenizer.json");
      if (tokenizer && typeof tokenizer.save === 'function') {
        tokenizer.save(tokenizerPath);
      } else if (tokenizer) {
        fs.writeFileSync(tokenizerPath, JSON.stringify(tokenizer, null, 2));
      }

      // Save metadata to database
      const metadata: ModelMetadata = {
        id: modelId,
        name: options.modelName,
        type: options.modelType,
        accuracy: options.accuracy,
        loss: options.loss,
        epochs: options.epochs,
        vocabSize: options.vocabSize,
        maxLen: options.maxLen,
        numClasses: options.numClasses,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        filePath: modelPath,
        tokenizerPath: tokenizerPath,
        createdBy: options.createdBy
      };

      // Insert or update model in database
      this.db.prepare(`
        INSERT OR REPLACE INTO models (
          id, name, type, status, accuracy, loss, epochs, 
          current_epoch, config, created_at, updated_at, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        modelId,
        options.modelName,
        options.modelType,
        'completed',
        options.accuracy,
        options.loss,
        options.epochs,
        options.epochs, // current_epoch = total epochs when completed
        JSON.stringify({
          vocabSize: options.vocabSize,
          maxLen: options.maxLen,
          numClasses: options.numClasses,
          filePath: modelPath,
          tokenizerPath: tokenizerPath
        }),
        metadata.createdAt,
        metadata.updatedAt,
        options.createdBy
      );

      console.log(`Model saved successfully: ${modelId}`);
      return metadata;

    } catch (error) {
      console.error('Error saving model:', error);
      throw new Error(`Failed to save model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Load a model from filesystem
   */
  async loadModel(modelId: string): Promise<{
    model: tf.LayersModel;
    tokenizer: any;
    metadata: ModelMetadata;
  }> {
    try {
      // Get model metadata from database
      const modelRecord = this.db.prepare(`
        SELECT * FROM models WHERE id = ?
      `).get(modelId) as any;

      if (!modelRecord) {
        throw new Error(`Model not found: ${modelId}`);
      }

      const config = JSON.parse(modelRecord.config || '{}');
      const modelDir = path.dirname(config.filePath || path.join(this.modelsDir, modelId, 'model.json'));

      // Load model from filesystem
      const model = await tf.loadLayersModel(`file://${modelDir}/model.json`);

      // Load tokenizer
      let tokenizer = null;
      if (config.tokenizerPath && fs.existsSync(config.tokenizerPath)) {
        try {
          const tokenizerData = JSON.parse(fs.readFileSync(config.tokenizerPath, 'utf8'));
          // Reconstruct tokenizer object if it has a load method
          if (tokenizerData && typeof tokenizerData.load === 'function') {
            tokenizer = tokenizerData;
          } else {
            tokenizer = tokenizerData;
          }
        } catch (tokenizerError) {
          console.warn('Failed to load tokenizer:', tokenizerError);
        }
      }

      const metadata: ModelMetadata = {
        id: modelRecord.id,
        name: modelRecord.name,
        type: modelRecord.type,
        accuracy: modelRecord.accuracy,
        loss: modelRecord.loss,
        epochs: modelRecord.epochs,
        vocabSize: config.vocabSize,
        maxLen: config.maxLen,
        numClasses: config.numClasses,
        createdAt: modelRecord.created_at,
        updatedAt: modelRecord.updated_at,
        filePath: config.filePath,
        tokenizerPath: config.tokenizerPath,
        createdBy: modelRecord.created_by
      };

      console.log(`Model loaded successfully: ${modelId}`);
      return { model, tokenizer, metadata };

    } catch (error) {
      console.error('Error loading model:', error);
      throw new Error(`Failed to load model: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * List all saved models
   */
  listModels(): ModelMetadata[] {
    try {
      const models = this.db.prepare(`
        SELECT * FROM models WHERE status = 'completed' ORDER BY updated_at DESC
      `).all() as any[];

      return models.map(model => {
        const config = JSON.parse(model.config || '{}');
        return {
          id: model.id,
          name: model.name,
          type: model.type,
          accuracy: model.accuracy,
          loss: model.loss,
          epochs: model.epochs,
          vocabSize: config.vocabSize,
          maxLen: config.maxLen,
          numClasses: config.numClasses,
          createdAt: model.created_at,
          updatedAt: model.updated_at,
          filePath: config.filePath,
          tokenizerPath: config.tokenizerPath,
          createdBy: model.created_by
        };
      });
    } catch (error) {
      console.error('Error listing models:', error);
      return [];
    }
  }

  /**
   * Delete a model from filesystem and database
   */
  async deleteModel(modelId: string): Promise<boolean> {
    try {
      // Get model metadata
      const modelRecord = this.db.prepare(`
        SELECT * FROM models WHERE id = ?
      `).get(modelId) as any;

      if (!modelRecord) {
        return false;
      }

      const config = JSON.parse(modelRecord.config || '{}');
      const modelDir = path.dirname(config.filePath || path.join(this.modelsDir, modelId, 'model.json'));

      // Delete model files
      if (fs.existsSync(modelDir)) {
        fs.rmSync(modelDir, { recursive: true, force: true });
      }

      // Delete from database
      const result = this.db.prepare(`
        DELETE FROM models WHERE id = ?
      `).run(modelId);

      console.log(`Model deleted successfully: ${modelId}`);
      return result.changes > 0;

    } catch (error) {
      console.error('Error deleting model:', error);
      return false;
    }
  }

  /**
   * Get model metadata by ID
   */
  getModelMetadata(modelId: string): ModelMetadata | null {
    try {
      const modelRecord = this.db.prepare(`
        SELECT * FROM models WHERE id = ?
      `).get(modelId) as any;

      if (!modelRecord) {
        return null;
      }

      const config = JSON.parse(modelRecord.config || '{}');
      return {
        id: modelRecord.id,
        name: modelRecord.name,
        type: modelRecord.type,
        accuracy: modelRecord.accuracy,
        loss: modelRecord.loss,
        epochs: modelRecord.epochs,
        vocabSize: config.vocabSize,
        maxLen: config.maxLen,
        numClasses: config.numClasses,
        createdAt: modelRecord.created_at,
        updatedAt: modelRecord.updated_at,
        filePath: config.filePath,
        tokenizerPath: config.tokenizerPath,
        createdBy: modelRecord.created_by
      };
    } catch (error) {
      console.error('Error getting model metadata:', error);
      return null;
    }
  }

  /**
   * Update model metadata
   */
  updateModelMetadata(modelId: string, updates: Partial<{
    name: string;
    accuracy: number;
    loss: number;
    epochs: number;
  }>): boolean {
    try {
      const fields = Object.keys(updates).filter(key => 
        ['name', 'accuracy', 'loss', 'epochs'].includes(key)
      );

      if (fields.length === 0) {
        return true;
      }

      const setClause = fields.map(field => `${field} = ?`).join(', ');
      const values = fields.map(field => updates[field as keyof typeof updates]);

      const result = this.db.prepare(`
        UPDATE models 
        SET ${setClause}, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `).run(...values, modelId);

      return result.changes > 0;
    } catch (error) {
      console.error('Error updating model metadata:', error);
      return false;
    }
  }

  /**
   * Check if model exists
   */
  modelExists(modelId: string): boolean {
    try {
      const result = this.db.prepare(`
        SELECT 1 FROM models WHERE id = ?
      `).get(modelId);
      return !!result;
    } catch (error) {
      console.error('Error checking model existence:', error);
      return false;
    }
  }

  /**
   * Get model file path
   */
  getModelPath(modelId: string): string | null {
    try {
      const modelRecord = this.db.prepare(`
        SELECT config FROM models WHERE id = ?
      `).get(modelId) as any;

      if (!modelRecord) {
        return null;
      }

      const config = JSON.parse(modelRecord.config || '{}');
      return config.filePath || null;
    } catch (error) {
      console.error('Error getting model path:', error);
      return null;
    }
  }
}