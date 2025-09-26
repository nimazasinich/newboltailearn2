import * as tf from '@tensorflow/tfjs';

export interface TensorFlowTrainingConfig {
  epochs: number;
  batchSize: number;
  learningRate: number;
  validationSplit?: number;
  earlyStopping?: boolean;
  patience?: number;
  modelType?: 'sequential' | 'functional';
  layers?: LayerConfig[];
}

export interface LayerConfig {
  type: 'dense' | 'conv2d' | 'lstm' | 'dropout' | 'batchNormalization';
  units?: number;
  activation?: string;
  kernelSize?: number[];
  filters?: number;
  dropout?: number;
  returnSequences?: boolean;
}

export interface TrainingProgress {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss?: number;
  valAccuracy?: number;
  progress: number;
}

export interface ModelMetrics {
  totalParams: number;
  trainableParams: number;
  nonTrainableParams: number;
  modelSize: number; // in MB
  trainingTime: number; // in seconds
  finalAccuracy: number;
  finalLoss: number;
}

export class TensorFlowTrainingEngine {
  private model: tf.LayersModel | null = null;
  private trainingHistory: TrainingProgress[] = [];
  private isTraining = false;
  private currentEpoch = 0;
  private totalEpochs = 0;

  constructor() {
    // Initialize TensorFlow backend
    tf.ready().then(() => {
      console.log('TensorFlow.js backend ready');
    });
  }

  /**
   * Create a new model based on configuration
   */
  createModel(config: TensorFlowTrainingConfig): tf.LayersModel {
    const model = tf.sequential();
    
    // Add layers based on configuration
    if (config.layers && config.layers.length > 0) {
      config.layers.forEach(layerConfig => {
        switch (layerConfig.type) {
          case 'dense':
            model.add(tf.layers.dense({
              units: layerConfig.units || 128,
              activation: (layerConfig.activation || 'relu') as any,
              inputShape: layerConfig.units === config.layers![0].units ? [784] : undefined
            }));
            break;
          case 'dropout':
            model.add(tf.layers.dropout({
              rate: layerConfig.dropout || 0.2
            }));
            break;
          case 'batchNormalization':
            model.add(tf.layers.batchNormalization());
            break;
        }
      });
    } else {
      // Default architecture for Persian legal document classification
      model.add(tf.layers.dense({
        units: 512,
        activation: 'relu',
        inputShape: [768] // BERT embedding size
      }));
      model.add(tf.layers.dropout({ rate: 0.3 }));
      model.add(tf.layers.dense({
        units: 256,
        activation: 'relu'
      }));
      model.add(tf.layers.dropout({ rate: 0.2 }));
      model.add(tf.layers.dense({
        units: 128,
        activation: 'relu'
      }));
      model.add(tf.layers.dense({
        units: 10, // Number of legal document categories
        activation: 'softmax'
      }));
    }

    // Compile the model
    model.compile({
      optimizer: tf.train.adam(config.learningRate),
      loss: 'categoricalCrossentropy',
      metrics: ['accuracy']
    });

    this.model = model;
    return model;
  }

  /**
   * Train the model with progress tracking
   */
  async trainModel(
    xTrain: tf.Tensor,
    yTrain: tf.Tensor,
    config: TensorFlowTrainingConfig,
    onProgress?: (progress: TrainingProgress) => void
  ): Promise<ModelMetrics> {
    if (!this.model) {
      throw new Error('Model not created. Call createModel() first.');
    }

    this.isTraining = true;
    this.currentEpoch = 0;
    this.totalEpochs = config.epochs;
    this.trainingHistory = [];

    const startTime = Date.now();
    
    // Prepare validation data if validation split is specified
    let xVal: tf.Tensor | undefined;
    let yVal: tf.Tensor | undefined;

    try {
      
      if (config.validationSplit && config.validationSplit > 0) {
        const xShape = xTrain.shape;
        const yShape = yTrain.shape;
        if (xShape[0] && xShape[1] && yShape[0] && yShape[1]) {
          const splitIndex = Math.floor(xShape[0] * (1 - config.validationSplit));
          xVal = xTrain.slice([splitIndex, 0], [xShape[0] - splitIndex, xShape[1]]);
          yVal = yTrain.slice([splitIndex, 0], [yShape[0] - splitIndex, yShape[1]]);
          xTrain = xTrain.slice([0, 0], [splitIndex, xShape[1]]);
          yTrain = yTrain.slice([0, 0], [splitIndex, yShape[1]]);
        }
      }

      // Training loop
      for (let epoch = 0; epoch < config.epochs; epoch++) {
        if (!this.isTraining) break;

        this.currentEpoch = epoch;
        
        // Train for one epoch
        const history = await this.model.fit(xTrain, yTrain, {
          epochs: 1,
          batchSize: config.batchSize,
          validationData: xVal && yVal ? [xVal, yVal] : undefined,
          verbose: 0
        });

        const loss = history.history.loss[0] as number;
        const accuracy = history.history.acc[0] as number;
        const valLoss = history.history.val_loss ? history.history.val_loss[0] as number : undefined;
        const valAccuracy = history.history.val_acc ? history.history.val_acc[0] as number : undefined;

        const progress: TrainingProgress = {
          epoch: epoch + 1,
          loss,
          accuracy,
          valLoss,
          valAccuracy,
          progress: ((epoch + 1) / config.epochs) * 100
        };

        this.trainingHistory.push(progress);

        // Call progress callback
        if (onProgress) {
          onProgress(progress);
        }

        // Early stopping check
        if (config.earlyStopping && config.patience) {
          if (this.shouldStopEarly(config.patience)) {
            console.log(`Early stopping at epoch ${epoch + 1}`);
            break;
          }
        }
      }

      const endTime = Date.now();
      const trainingTime = (endTime - startTime) / 1000;

      // Calculate model metrics
      const totalParams = this.model.countParams();
      const metrics: ModelMetrics = {
        totalParams,
        trainableParams: Math.floor(totalParams * 0.8), // Estimate
        nonTrainableParams: Math.floor(totalParams * 0.2), // Estimate
        modelSize: this.calculateModelSize(),
        trainingTime,
        finalAccuracy: this.trainingHistory[this.trainingHistory.length - 1]?.accuracy || 0,
        finalLoss: this.trainingHistory[this.trainingHistory.length - 1]?.loss || 0
      };

      return metrics;

    } finally {
      this.isTraining = false;
      // Clean up tensors
      xTrain.dispose();
      yTrain.dispose();
      if (xVal) xVal.dispose();
      if (yVal) yVal.dispose();
    }
  }

  /**
   * Pause training
   */
  pauseTraining(): void {
    this.isTraining = false;
  }

  /**
   * Resume training
   */
  resumeTraining(): void {
    this.isTraining = true;
  }

  /**
   * Stop training
   */
  stopTraining(): void {
    this.isTraining = false;
  }

  /**
   * Get training history
   */
  getTrainingHistory(): TrainingProgress[] {
    return [...this.trainingHistory];
  }

  /**
   * Save model
   */
  async saveModel(path: string): Promise<void> {
    if (!this.model) {
      throw new Error('No model to save');
    }
    await this.model.save(`file://${path}`);
  }

  /**
   * Load model
   */
  async loadModel(path: string): Promise<void> {
    this.model = await tf.loadLayersModel(`file://${path}`);
  }

  /**
   * Get model summary
   */
  getModelSummary(): string {
    if (!this.model) {
      return 'No model loaded';
    }
    this.model.summary();
    return 'Model summary printed to console';
  }

  /**
   * Predict with the model
   */
  predict(input: tf.Tensor): tf.Tensor {
    if (!this.model) {
      throw new Error('No model loaded');
    }
    return this.model.predict(input) as tf.Tensor;
  }

  /**
   * Dispose of the model and free memory
   */
  dispose(): void {
    if (this.model) {
      this.model.dispose();
      this.model = null;
    }
    this.trainingHistory = [];
  }

  private shouldStopEarly(patience: number): boolean {
    if (this.trainingHistory.length < patience + 1) {
      return false;
    }

    const recentHistory = this.trainingHistory.slice(-patience - 1);
    const bestValLoss = Math.min(...recentHistory.map(h => h.valLoss || h.loss));
    const currentValLoss = recentHistory[recentHistory.length - 1].valLoss || recentHistory[recentHistory.length - 1].loss;

    return currentValLoss > bestValLoss;
  }

  private calculateModelSize(): number {
    if (!this.model) return 0;
    
    // Rough estimation of model size in MB
    const totalParams = this.model.countParams();
    const bytesPerParam = 4; // Assuming float32
    const totalBytes = totalParams * bytesPerParam;
    return totalBytes / (1024 * 1024); // Convert to MB
  }
}

// Export singleton instance
export const tensorFlowEngine = new TensorFlowTrainingEngine();