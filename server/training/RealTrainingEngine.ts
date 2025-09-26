import * as tf from "@tensorflow/tfjs-node";
import { PersianTokenizer } from "./tokenizer";
import { ModelPersistence, SaveModelOptions } from "../services/ModelPersistence";
import fs from "fs";
import path from "path";

export type LabeledSample = { text: string; label: number };

export interface TrainOptions {
  epochs: number;
  batchSize?: number;
  learningRate?: number;
  validationSplit?: number;   // اگر valData نداشتیم
  modelId?: string;
  modelName?: string;
  modelType?: string;
  saveModel?: boolean;
  createdBy?: number;
  onProgress?: (p: {
    epoch: number;
    loss: number;
    accuracy?: number;
    val_loss?: number;
    val_accuracy?: number;
  }) => void;
  onComplete?: (modelId?: string) => void;
  onError?: (err: string) => void;
}

export class RealTrainingEngine {
  private model: tf.LayersModel | null = null;
  private tokenizer: PersianTokenizer;
  private maxLen = 128;
  private modelPersistence: ModelPersistence | null = null;

  constructor(modelPersistence?: ModelPersistence) {
    this.tokenizer = new PersianTokenizer({ maxLen: this.maxLen });
    this.modelPersistence = modelPersistence || null;
  }

  /** معماری سبک و واقعی برای طبقه‌بندی متن */
  private buildModel(vocabSize: number, numClasses: number): tf.LayersModel {
    const input = tf.input({ shape: [this.maxLen], dtype: "int32" });

    // Embedding
    const x = tf.layers.embedding({
      inputDim: vocabSize,
      outputDim: 128,
      inputLength: this.maxLen,
      maskZero: true,
    }).apply(input) as tf.SymbolicTensor;

    // BiLSTM به‌عنوان تقریبی ساده (واقعی، نه موک)
    const bi = tf.layers.bidirectional({
      layer: tf.layers.lstm({ units: 64, returnSequences: false, dropout: 0.1, recurrentDropout: 0.1 }),
      mergeMode: "concat",
    }).apply(x) as tf.SymbolicTensor;

    const dense1 = tf.layers.dense({ units: 128, activation: "relu", kernelRegularizer: tf.regularizers.l2({ l2: 1e-3 }) }).apply(bi) as tf.SymbolicTensor;
    const drop1 = tf.layers.dropout({ rate: 0.3 }).apply(dense1) as tf.SymbolicTensor;
    const out = tf.layers.dense({ units: numClasses, activation: "softmax" }).apply(drop1) as tf.SymbolicTensor;

    const model = tf.model({ inputs: input, outputs: out });
    model.compile({
      optimizer: tf.train.adam( (this as any).learningRate ?? 1e-3 ),
      loss: "sparseCategoricalCrossentropy",
      metrics: ["accuracy"],
    });
    return model;
  }

  private toTensors(samples: LabeledSample[]) {
    const xsArr = samples.map(s => this.tokenizer.encode(s.text));
    const ysArr = samples.map(s => s.label);
    
    // Debug: Check token IDs
    const maxTokenId = Math.max(...xsArr.flat());
    const vocabSize = this.tokenizer.getVocabSize();
    console.log(`Max token ID in data: ${maxTokenId}, Vocabulary size: ${vocabSize}`);
    
    if (maxTokenId >= vocabSize) {
      console.log(`Warning: Token ID ${maxTokenId} >= vocab size ${vocabSize}`);
      // Clamp all token IDs to valid range
      xsArr.forEach(arr => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.min(arr[i], vocabSize - 1);
        }
      });
    }
    
    const xs = tf.tensor2d(xsArr, [xsArr.length, this.maxLen], "int32");
    const ys = tf.tensor1d(ysArr, "float32");
    return { xs, ys };
  }

  private toTensorsFromEncoded(xsArr: number[][], samples: LabeledSample[]) {
    const ysArr = samples.map(s => s.label);
    
    // Debug: Check token IDs
    const maxTokenId = Math.max(...xsArr.flat());
    const vocabSize = this.tokenizer.getVocabSize();
    console.log(`Max token ID in data: ${maxTokenId}, Vocabulary size: ${vocabSize}`);
    
    if (maxTokenId >= vocabSize) {
      console.log(`Warning: Token ID ${maxTokenId} >= vocab size ${vocabSize}`);
      // Clamp all token IDs to valid range
      xsArr.forEach(arr => {
        for (let i = 0; i < arr.length; i++) {
          arr[i] = Math.min(arr[i], vocabSize - 1);
        }
      });
    }
    
    const xs = tf.tensor2d(xsArr, [xsArr.length, this.maxLen], "int32");
    const ys = tf.tensor1d(ysArr, "float32");
    return { xs, ys };
  }

  private ensureDir(p: string) {
    if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
  }

  async trainOnSamples(
    samples: LabeledSample[],
    opts: TrainOptions & { numClasses: number; checkpointDir?: string; saveEveryNEpochs?: number }
  ): Promise<void> {
    if (!samples.length) throw new Error("No training samples provided");

    // First, encode samples to grow vocabulary if needed
    const xsArr = samples.map(s => this.tokenizer.encode(s.text));
    
    // Now get the final vocabulary size after encoding
    const vocabSize = this.tokenizer.getVocabSize();
    console.log(`Vocabulary size: ${vocabSize}`);
    console.log(`Number of samples: ${samples.length}`);
    console.log(`Number of classes: ${opts.numClasses}`);
    
    // Build model with correct vocabulary size
    const model = (this.model ??= this.buildModel(vocabSize, opts.numClasses));

    const { xs, ys } = this.toTensorsFromEncoded(xsArr, samples);
    const validationSplit = Math.min(0.2, Math.max(0, opts.validationSplit ?? 0.2));
    const batchSize = Math.max(1, opts.batchSize ?? 8);
    const epochs = Math.max(1, opts.epochs ?? 3);

    const ckptDir = opts.checkpointDir ?? path.join(process.cwd(), "checkpoints");
    this.ensureDir(ckptDir);

    try {
      const history = await model.fit(xs, ys, {
        epochs,
        batchSize,
        validationSplit,
        callbacks: {
          onEpochEnd: async (epoch, logs) => {
            const loss = (logs?.loss ?? 0) as number;
            const acc  = ( (logs as any)?.acc ?? (logs as any)?.accuracy ) as number | undefined;
            const vLoss = (logs as any)?.val_loss as number | undefined;
            const vAcc  = ( (logs as any)?.val_acc ?? (logs as any)?.val_accuracy ) as number | undefined;

            opts.onProgress?.({
              epoch: epoch + 1,
              loss,
              accuracy: acc,
              val_loss: vLoss,
              val_accuracy: vAcc,
            });

            // ذخیره‌ی دوره‌ای چک‌پوینت
            const every = Math.max(1, opts.saveEveryNEpochs ?? 5);
            if ((epoch + 1) % every === 0) {
              const p = path.join(ckptDir, `model_epoch_${epoch + 1}_${Date.now()}`);
              await model.save(`file://${p}`);
            }
          },
          onTrainEnd: async () => {
            // ذخیره چک‌پوینت نهایی
            const p = path.join(ckptDir, `model_final_${Date.now()}`);
            await model.save(`file://${p}`);
            this.tokenizer.save();
            
            // Save model to persistence system if enabled
            let savedModelId: string | undefined;
            if (opts.saveModel && this.modelPersistence && opts.modelId) {
              try {
                const finalLoss = history.history.loss[history.history.loss.length - 1];
                const finalAccuracy = history.history.acc ? 
                  history.history.acc[history.history.acc.length - 1] : 
                  (history.history.accuracy ? history.history.accuracy[history.history.accuracy.length - 1] : 0);

                const saveOptions: SaveModelOptions = {
                  modelId: opts.modelId,
                  modelName: opts.modelName || `Model_${opts.modelId}`,
                  modelType: opts.modelType || 'persian-bert',
                  accuracy: finalAccuracy,
                  loss: finalLoss,
                  epochs: opts.epochs,
                  vocabSize: this.tokenizer.getVocabSize(),
                  maxLen: this.maxLen,
                  numClasses: opts.numClasses,
                  createdBy: opts.createdBy
                };

                await this.modelPersistence.saveModel(model, this.tokenizer, saveOptions);
                savedModelId = opts.modelId;
                console.log(`Model saved to persistence system: ${opts.modelId}`);
              } catch (saveError) {
                console.error('Failed to save model to persistence system:', saveError);
              }
            }
            
            opts.onComplete?.(savedModelId);
          },
        },
      });

      // آزادسازی حافظه
      xs.dispose();
      ys.dispose();
      // (مدل نگه داشته می‌شود برای predict/eval)

    } catch (e: any) {
      opts.onError?.(String(e?.message ?? e));
      throw e;
    }
  }

  stopTraining(): void {
    if (this.model) (this.model as any).stopTraining = true;
  }

  dispose(): void {
    if (this.model) {
      this.model = null;
      // GC خودکار برای tfjs-node در زمان نبود تانسور
    }
  }
}