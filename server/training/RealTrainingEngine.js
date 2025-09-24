// Silence TensorFlow info messages (AVX2 FMA optimization logs)
process.env.TF_CPP_MIN_LOG_LEVEL = '2';

import * as tf from "@tensorflow/tfjs-node";
import { PersianTokenizer } from "./tokenizer";
import fs from "fs";
import path from "path";
export class RealTrainingEngine {
    constructor() {
        this.model = null;
        this.maxLen = 128;
        this.tokenizer = new PersianTokenizer({ maxLen: this.maxLen });
    }
    /** معماری سبک و واقعی برای طبقه‌بندی متن */
    buildModel(vocabSize, numClasses) {
        const input = tf.input({ shape: [this.maxLen], dtype: "int32" });
        // Embedding
        const x = tf.layers.embedding({
            inputDim: vocabSize,
            outputDim: 128,
            inputLength: this.maxLen,
            maskZero: true,
        }).apply(input);
        // BiLSTM به‌عنوان تقریبی ساده (واقعی، نه موک)
        const bi = tf.layers.bidirectional({
            layer: tf.layers.lstm({ units: 64, returnSequences: false, dropout: 0.1, recurrentDropout: 0.1 }),
            mergeMode: "concat",
        }).apply(x);
        const dense1 = tf.layers.dense({ units: 128, activation: "relu", kernelRegularizer: tf.regularizers.l2({ l2: 1e-3 }) }).apply(bi);
        const drop1 = tf.layers.dropout({ rate: 0.3 }).apply(dense1);
        const out = tf.layers.dense({ units: numClasses, activation: "softmax" }).apply(drop1);
        const model = tf.model({ inputs: input, outputs: out });
        model.compile({
            optimizer: tf.train.adam(this.learningRate ?? 1e-3),
            loss: "sparseCategoricalCrossentropy",
            metrics: ["accuracy"],
        });
        return model;
    }
    toTensors(samples) {
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
    toTensorsFromEncoded(xsArr, samples) {
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
    ensureDir(p) {
        if (!fs.existsSync(p))
            fs.mkdirSync(p, { recursive: true });
    }
    async trainOnSamples(samples, opts) {
        if (!samples.length)
            throw new Error("No training samples provided");
        // First, encode samples to grow vocabulary if needed
        const xsArr = samples.map(s => this.tokenizer.encode(s.text));
        // Now get the final vocabulary size after encoding
        const vocabSize = this.tokenizer.getVocabSize();
        console.log(`Vocabulary size: ${vocabSize}`);
        console.log(`Number of samples: ${samples.length}`);
        console.log(`Number of classes: ${opts.numClasses}`);
        // Build model with correct vocabulary size
        const model = (this.model ?? (this.model = this.buildModel(vocabSize, opts.numClasses)));
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
                        const loss = (logs?.loss ?? 0);
                        const acc = (logs?.acc ?? logs?.accuracy);
                        const vLoss = logs?.val_loss;
                        const vAcc = (logs?.val_acc ?? logs?.val_accuracy);
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
                        opts.onComplete?.();
                    },
                },
            });
            // آزادسازی حافظه
            xs.dispose();
            ys.dispose();
            // (مدل نگه داشته می‌شود برای predict/eval)
        }
        catch (e) {
            opts.onError?.(String(e?.message ?? e));
            throw e;
        }
    }
    stopTraining() {
        if (this.model)
            this.model.stopTraining = true;
    }
    dispose() {
        if (this.model) {
            this.model = null;
            // GC خودکار برای tfjs-node در زمان نبود تانسور
        }
    }
}
