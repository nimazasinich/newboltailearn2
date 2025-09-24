// Persian BERT Processor for Legal Document Classification
// Real implementation with actual BERT operations

import { loadTensorFlow, PersianBertProcessorFallback } from './TensorFlowFallback';
import fs from 'fs';
import path from 'path';

export interface PersianLegalDocument {
    id: string;
    title: string;
    content: string;
    category: string;
    subcategory?: string;
    keywords?: string;
    legal_basis?: string;
    decision_summary?: string;
}

export interface BERTConfig {
    maxSequenceLength: number;
    vocabSize: number;
    hiddenSize: number;
    numLayers: number;
    numAttentionHeads: number;
    intermediateSize: number;
    dropout: number;
    learningRate: number;
}

export interface ClassificationResult {
    category: string;
    confidence: number;
    subcategory?: string;
    legalBasis?: string[];
    keywords?: string[];
}

export class PersianBertProcessor {
    private model: tf.LayersModel | null = null;
    private tokenizer: Map<string, number> = new Map();
    private categoryMap: Map<string, number> = new Map();
    private config: BERTConfig;
    private specialTokens = {
        CLS: 101,
        SEP: 102,
        PAD: 0,
        UNK: 100
    };

    constructor(config: BERTConfig) {
        this.config = config;
        this.initializeTokenizer();
    }

    // Initialize Persian BERT tokenizer
    private initializeTokenizer() {
        // Persian legal vocabulary with BERT-style subword tokenization
        const persianLegalTerms = [
            // Court terms
            'دادگاه', 'قاضی', 'رای', 'حکم', 'محکومیت', 'خواهان', 'خوانده', 'متهم',
            'شاهد', 'شهادت', 'مدرک', 'مستند', 'قانون', 'ماده', 'بند', 'تبصره',
            
            // Legal categories
            'حقوق', 'مدنی', 'جزا', 'تجارت', 'خانواده', 'کار', 'اداری', 'قرارداد',
            
            // Civil law terms
            'اجاره', 'خرید', 'فروش', 'مالکیت', 'ارث', 'وصیت', 'وقف', 'شرکت',
            
            // Criminal law terms
            'سرقت', 'کلاهبرداری', 'خیانت_در_امانت', 'ضرب_و_جرح', 'قتل', 'قتل_عمد',
            'قتل_شبه_عمد', 'قتل_خطا', 'حبس', 'تعزیری', 'مجازات', 'جزای_نقدی',
            
            // Family law terms
            'طلاق', 'حضانت', 'نفقه', 'مهریه', 'ازدواج', 'نکاح', 'فسخ', 'بطلان',
            
            // Labor law terms
            'کارگر', 'کارفرما', 'استخدام', 'اخراج', 'اضافه_کاری', 'مرخصی',
            'حقوق_معوق', 'پاداش', 'بیمه', 'بازنشستگی',
            
            // Commercial law terms
            'تجاری', 'بازرگانی', 'صنعتی', 'تولیدی', 'خدماتی', 'سهام', 'سرمایه',
            'سود', 'زیان', 'ترازنامه', 'صورت_مالی',
            
            // Administrative law terms
            'دولت', 'اداره', 'وزارت', 'استان', 'شهرستان', 'شهرداری', 'مجلس',
            'رئیس_جمهور', 'وزیر', 'معاون', 'مدیر', 'رئیس'
        ];

        // Add Persian legal terms to vocabulary
        persianLegalTerms.forEach((term, index) => {
            this.tokenizer.set(term, index + 10); // Start from 10 to reserve special tokens
        });

        // Add common Persian words
        const commonPersianWords = [
            'در', 'از', 'به', 'با', 'که', 'این', 'آن', 'برای', 'بود', 'است',
            'می', 'را', 'تا', 'یا', 'هم', 'نیز', 'همچنین', 'لذا', 'بنابراین',
            'مورد', 'خصوص', 'نسبت', 'طبق', 'مطابق', 'براساس', 'برطبق',
            'شده', 'کرده', 'بوده', 'خواهد', 'می‌شود', 'می‌کند', 'می‌باشد'
        ];

        commonPersianWords.forEach((word, index) => {
            this.tokenizer.set(word, persianLegalTerms.length + index + 10);
        });

        console.log(`✅ Persian BERT tokenizer initialized with ${this.tokenizer.size} terms`);
    }

    // Tokenize Persian text with BERT-style subword tokenization
    private tokenizeText(text: string): number[] {
        // Simple BERT-style tokenization for Persian
        const tokens = text
            .replace(/[،؛:؟!]/g, ' ') // Replace Persian punctuation
            .split(/\s+/)
            .filter(token => token.length > 0)
            .flatMap(token => {
                // Simple subword tokenization
                if (token.length > 4) {
                    // Split long words into subwords
                    const subwords = [];
                    for (let i = 0; i < token.length; i += 2) {
                        subwords.push(token.slice(i, i + 2));
                    }
                    return subwords;
                }
                return [token];
            })
            .map(token => {
                const normalized = token.toLowerCase().trim();
                return this.tokenizer.get(normalized) || this.specialTokens.UNK;
            });

        // Add CLS token at the beginning
        const tokenIds = [this.specialTokens.CLS, ...tokens];
        
        // Truncate or pad to max sequence length
        if (tokenIds.length > this.config.maxSequenceLength - 1) {
            tokenIds.splice(this.config.maxSequenceLength - 1);
        }
        
        // Add SEP token at the end
        tokenIds.push(this.specialTokens.SEP);
        
        // Pad to max sequence length
        while (tokenIds.length < this.config.maxSequenceLength) {
            tokenIds.push(this.specialTokens.PAD);
        }

        return tokenIds;
    }

    // Initialize category mapping
    private initializeCategoryMapping(documents: PersianLegalDocument[]) {
        const categories = [...new Set(documents.map(doc => doc.category))];
        categories.forEach((category, index) => {
            this.categoryMap.set(category, index);
        });
        console.log(`✅ Category mapping initialized: ${categories.join(', ')}`);
    }

    // Create BERT model architecture
    private createBERTModel(): tf.LayersModel {
        const input = tf.input({ shape: [this.config.maxSequenceLength] });
        
        // Token embeddings
        const tokenEmbeddings = tf.layers.embedding({
            inputDim: this.config.vocabSize,
            outputDim: this.config.hiddenSize,
            inputLength: this.config.maxSequenceLength,
            maskZero: true
        }).apply(input) as tf.SymbolicTensor;

        // Position embeddings
        const positionEmbeddings = tf.layers.embedding({
            inputDim: this.config.maxSequenceLength,
            outputDim: this.config.hiddenSize
        }).apply(tf.range(0, this.config.maxSequenceLength).expandDims(0)) as tf.SymbolicTensor;

        // Combine embeddings
        const embeddings = tf.layers.add().apply([tokenEmbeddings, positionEmbeddings]) as tf.SymbolicTensor;
        
        // Layer normalization
        let hiddenStates = tf.layers.layerNormalization().apply(embeddings) as tf.SymbolicTensor;

        // BERT transformer layers
        for (let i = 0; i < this.config.numLayers; i++) {
            hiddenStates = this.createTransformerLayer(hiddenStates, i);
        }

        // Classification head
        const pooledOutput = tf.layers.globalAveragePooling1d().apply(hiddenStates) as tf.SymbolicTensor;
        const dropout = tf.layers.dropout({ rate: this.config.dropout }).apply(pooledOutput) as tf.SymbolicTensor;
        const classifier = tf.layers.dense({
            units: this.categoryMap.size,
            activation: 'softmax'
        }).apply(dropout) as tf.SymbolicTensor;

        const model = tf.model({ inputs: input, outputs: classifier });

        // Compile model
        model.compile({
            optimizer: tf.train.adam(this.config.learningRate),
            loss: 'categoricalCrossentropy',
            metrics: ['accuracy']
        });

        console.log('✅ Persian BERT model architecture created');
        return model;
    }

    // Create transformer layer
    private createTransformerLayer(input: tf.SymbolicTensor, layerIndex: number): tf.SymbolicTensor {
        // Multi-head self-attention
        const attentionOutput = tf.layers.multiHeadAttention({
            numHeads: this.config.numAttentionHeads,
            keyDim: this.config.hiddenSize / this.config.numAttentionHeads
        }).apply([input, input]) as tf.SymbolicTensor;

        // Add & Norm
        const attentionNorm = tf.layers.add().apply([input, attentionOutput]) as tf.SymbolicTensor;
        const attentionLayerNorm = tf.layers.layerNormalization().apply(attentionNorm) as tf.SymbolicTensor;

        // Feed-forward network
        const ffn = tf.layers.dense({
            units: this.config.intermediateSize,
            activation: 'relu'
        }).apply(attentionLayerNorm) as tf.SymbolicTensor;

        const ffnOutput = tf.layers.dense({
            units: this.config.hiddenSize
        }).apply(ffn) as tf.SymbolicTensor;

        // Add & Norm
        const ffnNorm = tf.layers.add().apply([attentionLayerNorm, ffnOutput]) as tf.SymbolicTensor;
        const output = tf.layers.layerNormalization().apply(ffnNorm) as tf.SymbolicTensor;

        return output;
    }

    // Prepare training data
    private prepareTrainingData(documents: PersianLegalDocument[]): { x: tf.Tensor, y: tf.Tensor } {
        const tokenizedTexts: number[][] = [];
        const labels: number[] = [];

        documents.forEach(doc => {
            const tokens = this.tokenizeText(doc.content);
            tokenizedTexts.push(tokens);
            
            const categoryIndex = this.categoryMap.get(doc.category);
            if (categoryIndex !== undefined) {
                labels.push(categoryIndex);
            }
        });

        // Convert to tensors
        const x = tf.tensor2d(tokenizedTexts);
        const y = tf.oneHot(tf.tensor1d(labels, 'int32'), this.categoryMap.size);

        console.log(`✅ Training data prepared: ${documents.length} documents, ${this.categoryMap.size} categories`);
        return { x, y };
    }

    // Train the model
    async train(
        documents: PersianLegalDocument[],
        onProgress?: (progress: any) => void
    ): Promise<tf.History> {
        try {
            console.log(`🚀 Starting Persian BERT training with ${documents.length} documents`);

            // Initialize category mapping
            this.initializeCategoryMapping(documents);

            // Create model
            this.model = this.createBERTModel();

            // Prepare data
            const { x, y } = this.prepareTrainingData(documents);

            // Split data for validation
            const validationSplit = 0.2;
            const validationSize = Math.floor(documents.length * validationSplit);
            const trainSize = documents.length - validationSize;

            const xTrain = x.slice([0, 0], [trainSize, this.config.maxSequenceLength]);
            const yTrain = y.slice([0, 0], [trainSize, this.categoryMap.size]);
            const xVal = x.slice([trainSize, 0], [validationSize, this.config.maxSequenceLength]);
            const yVal = y.slice([trainSize, 0], [validationSize, this.categoryMap.size]);

            console.log(`📊 Training split: ${trainSize} train, ${validationSize} validation`);

            // Training callbacks
            const callbacks = {
                onEpochEnd: (epoch: number, logs: any) => {
                    console.log(`📈 Epoch ${epoch + 1} - Loss: ${logs.loss.toFixed(4)}, Accuracy: ${(logs.accuracy * 100).toFixed(2)}%`);
                    
                    if (onProgress) {
                        onProgress({
                            epoch: epoch + 1,
                            loss: logs.loss,
                            accuracy: logs.accuracy,
                            valLoss: logs.val_loss,
                            valAccuracy: logs.val_accuracy
                        });
                    }
                }
            };

            // Train the model
            const history = await this.model.fit(xTrain, yTrain, {
                epochs: 10,
                batchSize: 8, // Smaller batch size for BERT
                validationData: [xVal, yVal],
                callbacks: callbacks,
                verbose: 1
            });

            // Clean up tensors
            x.dispose();
            y.dispose();
            xTrain.dispose();
            yTrain.dispose();
            xVal.dispose();
            yVal.dispose();

            console.log('✅ Persian BERT training completed successfully');
            return history;

        } catch (error) {
            console.error('❌ Persian BERT training failed:', error);
            throw error;
        }
    }

    // Classify document
    async classify(document: PersianLegalDocument): Promise<ClassificationResult> {
        if (!this.model) {
            throw new Error('Model not trained yet');
        }

        const tokens = this.tokenizeText(document.content);
        const input = tf.tensor2d([tokens]);
        
        const prediction = this.model.predict(input) as tf.Tensor;
        const probabilities = await prediction.data();
        
        // Find highest probability category
        let maxIndex = 0;
        let maxProb = probabilities[0];
        
        for (let i = 1; i < probabilities.length; i++) {
            if (probabilities[i] > maxProb) {
                maxProb = probabilities[i];
                maxIndex = i;
            }
        }

        // Get category name from index
        const categoryName = Array.from(this.categoryMap.keys())[maxIndex];
        
        // Extract legal basis and keywords
        const legalBasis = this.extractLegalBasis(document.content);
        const keywords = this.extractKeywords(document.content);
        
        input.dispose();
        prediction.dispose();

        return {
            category: categoryName,
            confidence: maxProb,
            subcategory: document.subcategory,
            legalBasis,
            keywords
        };
    }

    // Extract legal basis from document content
    private extractLegalBasis(content: string): string[] {
        const legalBasisPatterns = [
            /ماده\s+(\d+)/g,
            /بند\s+(\d+)/g,
            /تبصره\s+(\d+)/g,
            /قانون\s+([^،]+)/g,
            /مقررات\s+([^،]+)/g
        ];

        const legalBasis: string[] = [];
        
        legalBasisPatterns.forEach(pattern => {
            const matches = content.match(pattern);
            if (matches) {
                legalBasis.push(...matches);
            }
        });

        return [...new Set(legalBasis)]; // Remove duplicates
    }

    // Extract keywords from document content
    private extractKeywords(content: string): string[] {
        const keywords: string[] = [];
        
        // Extract legal terms
        this.tokenizer.forEach((tokenId, term) => {
            if (content.includes(term) && term.length > 2) {
                keywords.push(term);
            }
        });

        // Sort by frequency and return top keywords
        return keywords
            .sort((a, b) => {
                const countA = (content.match(new RegExp(a, 'g')) || []).length;
                const countB = (content.match(new RegExp(b, 'g')) || []).length;
                return countB - countA;
            })
            .slice(0, 10); // Top 10 keywords
    }

    // Save model
    async saveModel(modelPath: string): Promise<void> {
        if (!this.model) {
            throw new Error('Model not trained yet');
        }

        try {
            const dir = path.dirname(modelPath);
            if (!fs.existsSync(dir)) {
                fs.mkdirSync(dir, { recursive: true });
            }

            await this.model.save(`file://${modelPath}`);
            
            const metadata = {
                tokenizer: Object.fromEntries(this.tokenizer),
                categoryMap: Object.fromEntries(this.categoryMap),
                config: this.config,
                specialTokens: this.specialTokens
            };

            fs.writeFileSync(`${modelPath}_metadata.json`, JSON.stringify(metadata, null, 2));
            
            console.log(`✅ Persian BERT model saved to ${modelPath}`);
        } catch (error) {
            console.error('❌ Failed to save model:', error);
            throw error;
        }
    }

    // Load model
    async loadModel(modelPath: string): Promise<void> {
        try {
            this.model = await tf.loadLayersModel(`file://${modelPath}/model.json`);
            
            const metadataPath = `${modelPath}_metadata.json`;
            if (fs.existsSync(metadataPath)) {
                const metadata = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
                
                this.tokenizer = new Map(Object.entries(metadata.tokenizer));
                this.categoryMap = new Map(Object.entries(metadata.categoryMap));
                this.config = metadata.config;
                this.specialTokens = metadata.specialTokens;
                
                console.log(`✅ Persian BERT model loaded from ${modelPath}`);
            } else {
                throw new Error('Model metadata not found');
            }
        } catch (error) {
            console.error('❌ Failed to load model:', error);
            throw error;
        }
    }

    // Get model info
    getModelInfo(): any {
        return {
            vocabSize: this.tokenizer.size,
            categories: this.categoryMap.size,
            config: this.config,
            specialTokens: this.specialTokens
        };
    }
}

export default PersianBertProcessor;
