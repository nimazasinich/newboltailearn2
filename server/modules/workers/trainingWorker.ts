import { Worker, isMainThread, parentPort, workerData } from 'worker_threads';
import { config } from '../security/config.js';

/**
 * Training Worker for CPU-intensive operations
 * Runs training tasks in a separate thread to avoid blocking the main event loop
 */

if (!isMainThread) {
  // Worker thread code
  handleWorkerTask();
} else {
  // Main thread exports
  module.exports = { TrainingWorkerPool };
}

/**
 * Handle tasks in worker thread
 */
async function handleWorkerTask() {
  if (!parentPort) return;
  
  const { type, data } = workerData;
  
  try {
    let result;
    
    switch (type) {
      case 'train':
        result = await performTraining(data);
        break;
      
      case 'evaluate':
        result = await evaluateModel(data);
        break;
      
      case 'preprocess':
        result = await preprocessData(data);
        break;
      
      case 'optimize':
        result = await optimizeModel(data);
        break;
      
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
    
    parentPort.postMessage({ success: true, result });
  } catch (error) {
    parentPort.postMessage({ 
      success: false, 
      error: (error as Error).message 
    });
  }
}

/**
 * Perform training task
 */
async function performTraining(data: any) {
  const { modelId, datasetId, config: trainConfig } = data;
  
  // Simulate training progress
  const epochs = trainConfig.epochs || 10;
  const results = [];
  
  for (let epoch = 1; epoch <= epochs; epoch++) {
    // Simulate epoch processing
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const loss = Math.max(0.1, 1 - (epoch / epochs) + Math.random() * 0.2);
    const accuracy = Math.min(0.99, epoch / epochs + Math.random() * 0.1);
    
    results.push({
      epoch,
      loss: loss.toFixed(4),
      accuracy: accuracy.toFixed(4),
      timestamp: new Date().toISOString()
    });
    
    // Send progress update
    if (parentPort) {
      parentPort.postMessage({
        type: 'progress',
        data: {
          epoch,
          totalEpochs: epochs,
          loss,
          accuracy
        }
      });
    }
  }
  
  return {
    modelId,
    datasetId,
    config: trainConfig,
    results,
    finalLoss: results[results.length - 1].loss,
    finalAccuracy: results[results.length - 1].accuracy
  };
}

/**
 * Evaluate model performance
 */
async function evaluateModel(data: any) {
  const { modelId, testDatasetId } = data;
  
  // Simulate evaluation
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    modelId,
    testDatasetId,
    metrics: {
      accuracy: (0.85 + Math.random() * 0.1).toFixed(4),
      precision: (0.82 + Math.random() * 0.1).toFixed(4),
      recall: (0.88 + Math.random() * 0.1).toFixed(4),
      f1Score: (0.85 + Math.random() * 0.1).toFixed(4),
      confusionMatrix: [
        [850, 150],
        [120, 880]
      ]
    }
  };
}

/**
 * Preprocess dataset
 */
async function preprocessData(data: any) {
  const { datasetId, options } = data;
  
  // Simulate preprocessing
  const steps = ['tokenization', 'normalization', 'vectorization'];
  const results = [];
  
  for (const step of steps) {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    results.push({
      step,
      status: 'completed',
      timestamp: new Date().toISOString()
    });
    
    if (parentPort) {
      parentPort.postMessage({
        type: 'preprocessing_progress',
        data: { step, completed: results.length, total: steps.length }
      });
    }
  }
  
  return {
    datasetId,
    preprocessingSteps: results,
    outputPath: `/data/preprocessed/${datasetId}`,
    samples: 10000,
    features: 512
  };
}

/**
 * Optimize model hyperparameters
 */
async function optimizeModel(data: any) {
  const { modelId, searchSpace } = data;
  
  // Simulate hyperparameter optimization
  const trials = 10;
  const results = [];
  
  for (let i = 0; i < trials; i++) {
    await new Promise(resolve => setTimeout(resolve, 150));
    
    const params = {
      learningRate: (Math.random() * 0.01).toFixed(6),
      batchSize: [16, 32, 64, 128][Math.floor(Math.random() * 4)],
      dropout: (Math.random() * 0.5).toFixed(2)
    };
    
    const score = Math.random() * 0.3 + 0.7;
    
    results.push({
      trial: i + 1,
      params,
      score: score.toFixed(4)
    });
    
    if (parentPort) {
      parentPort.postMessage({
        type: 'optimization_progress',
        data: { trial: i + 1, totalTrials: trials, bestScore: Math.max(...results.map(r => parseFloat(r.score))) }
      });
    }
  }
  
  // Find best parameters
  const best = results.reduce((prev, curr) => 
    parseFloat(curr.score) > parseFloat(prev.score) ? curr : prev
  );
  
  return {
    modelId,
    trials: results,
    bestParams: best.params,
    bestScore: best.score
  };
}

/**
 * Worker Pool for managing multiple workers
 */
export class TrainingWorkerPool {
  private workers: Worker[] = [];
  private available: Worker[] = [];
  private maxWorkers: number;
  private taskQueue: Array<{
    task: any;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];

  constructor(maxWorkers?: number) {
    this.maxWorkers = maxWorkers || (config.USE_WORKERS ? 4 : 1);
    
    if (config.USE_WORKERS) {
      this.initializePool();
    }
  }

  private initializePool(): void {
    for (let i = 0; i < this.maxWorkers; i++) {
      const worker = new Worker(__filename);
      
      worker.on('error', (error) => {
        console.error('Worker error:', error);
        this.handleWorkerError(worker);
      });
      
      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error(`Worker exited with code ${code}`);
          this.replaceWorker(worker);
        }
      });
      
      this.workers.push(worker);
      this.available.push(worker);
    }
    
    console.log(`Worker pool initialized with ${this.maxWorkers} workers`);
  }

  /**
   * Execute task in worker thread
   */
  async execute(type: string, data: any): Promise<any> {
    if (!config.USE_WORKERS) {
      // Execute in main thread if workers disabled
      return this.executeInMainThread(type, data);
    }
    
    return new Promise((resolve, reject) => {
      this.taskQueue.push({ 
        task: { type, data }, 
        resolve, 
        reject 
      });
      
      this.processQueue();
    });
  }

  private async processQueue(): Promise<void> {
    if (this.taskQueue.length === 0 || this.available.length === 0) {
      return;
    }
    
    const { task, resolve, reject } = this.taskQueue.shift()!;
    const worker = this.available.shift()!;
    
    const messageHandler = (message: any) => {
      if (message.type === 'progress' || message.type === 'preprocessing_progress' || message.type === 'optimization_progress') {
        // Handle progress updates
        console.log('Worker progress:', message.data);
        return;
      }
      
      worker.off('message', messageHandler);
      this.available.push(worker);
      this.processQueue();
      
      if (message.success) {
        resolve(message.result);
      } else {
        reject(new Error(message.error));
      }
    };
    
    worker.on('message', messageHandler);
    worker.postMessage(task);
  }

  private async executeInMainThread(type: string, data: any): Promise<any> {
    // Execute directly in main thread
    switch (type) {
      case 'train':
        return performTraining(data);
      case 'evaluate':
        return evaluateModel(data);
      case 'preprocess':
        return preprocessData(data);
      case 'optimize':
        return optimizeModel(data);
      default:
        throw new Error(`Unknown task type: ${type}`);
    }
  }

  private handleWorkerError(worker: Worker): void {
    const index = this.available.indexOf(worker);
    if (index > -1) {
      this.available.splice(index, 1);
    }
    
    this.replaceWorker(worker);
  }

  private replaceWorker(oldWorker: Worker): void {
    const index = this.workers.indexOf(oldWorker);
    if (index > -1) {
      oldWorker.terminate();
      
      const newWorker = new Worker(__filename);
      newWorker.on('error', (error) => {
        console.error('Worker error:', error);
        this.handleWorkerError(newWorker);
      });
      
      this.workers[index] = newWorker;
      this.available.push(newWorker);
    }
  }

  /**
   * Terminate all workers
   */
  async terminate(): Promise<void> {
    for (const worker of this.workers) {
      await worker.terminate();
    }
    
    this.workers = [];
    this.available = [];
    this.taskQueue = [];
    
    console.log('Worker pool terminated');
  }
}