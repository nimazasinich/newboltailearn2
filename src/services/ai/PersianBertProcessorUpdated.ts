// Persian BERT Processor for Legal Document Classification
// Updated with fallback support for environments without native bindings

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
    private tf: any;
    private model: any = null;
    private tokenizer: Map<string, number> = new Map();
    private categoryMap: Map<string, number> = new Map();
    private config: BERTConfig;
    private fallback: PersianBertProcessorFallback;
    private useFallback: boolean = false;
    private specialTokens = {
        CLS: 101,
        SEP: 102,
        PAD: 0,
        UNK: 100
    };

    constructor(config: BERTConfig) {
        this.config = config;
        this.fallback = new PersianBertProcessorFallback(null as any);
        this.initialize();
    }

    private async initialize(): Promise<void> {
        try {
            this.tf = await loadTensorFlow();
            await this.tf.ready();
            
            // Check if we're using fallback
            this.useFallback = this.tf.constructor.name === 'MockTensorFlow';
            
            if (this.useFallback) {
                console.log('🔄 Using TensorFlow.js fallback implementation');
                this.fallback = new PersianBertProcessorFallback(this.tf);
                await this.fallback.initialize();
            } else {
                console.log('✅ Using native TensorFlow.js implementation');
            }
            
            await this.loadTokenizer();
            await this.loadCategoryMap();
        } catch (error) {
            console.error('❌ Failed to initialize TensorFlow:', error);
            this.useFallback = true;
            this.fallback = new PersianBertProcessorFallback(this.tf);
            await this.fallback.initialize();
        }
    }

    private async loadTokenizer(): Promise<void> {
        try {
            const tokenizerPath = path.join(process.cwd(), 'data', 'tokenizer.json');
            if (fs.existsSync(tokenizerPath)) {
                const tokenizerData = JSON.parse(fs.readFileSync(tokenizerPath, 'utf8'));
                this.tokenizer = new Map(Object.entries(tokenizerData));
                console.log(`✅ Loaded tokenizer with ${this.tokenizer.size} tokens`);
            } else {
                console.log('⚠️ Tokenizer file not found, using mock tokenizer');
                this.createMockTokenizer();
            }
        } catch (error) {
            console.warn('⚠️ Failed to load tokenizer, using mock:', error.message);
            this.createMockTokenizer();
        }
    }

    private createMockTokenizer(): void {
        // Create a mock tokenizer for Persian legal terms
        const persianLegalTerms = [
            'قرارداد', 'قضایی', 'مالی', 'کار', 'خانواده', 'تجاری', 'مدنی',
            'جزایی', 'اداری', 'مالکیت', 'ارث', 'طلاق', 'نفقه', 'حقوق',
            'قانون', 'دادگاه', 'قاضی', 'وکیل', 'شاهد', 'دلیل', 'رای',
            'محکومیت', 'تبرئه', 'خسارت', 'غرامت', 'جریمه', 'حبس',
            'شلاق', 'اعدام', 'زندان', 'آزادی', 'شرط', 'مشروط'
        ];

        persianLegalTerms.forEach((term, index) => {
            this.tokenizer.set(term, index + 10);
        });

        // Add special tokens
        Object.entries(this.specialTokens).forEach(([key, value]) => {
            this.tokenizer.set(key, value);
        });

        console.log(`✅ Created mock tokenizer with ${this.tokenizer.size} tokens`);
    }

    private async loadCategoryMap(): Promise<void> {
        const categories = [
            'قرارداد', 'قضایی', 'مالی', 'کار', 'خانواده', 'تجاری', 'مدنی', 'جزایی', 'اداری'
        ];

        categories.forEach((category, index) => {
            this.categoryMap.set(category, index);
        });

        console.log(`✅ Loaded category map with ${this.categoryMap.size} categories`);
    }

    async loadModel(modelPath: string): Promise<void> {
        try {
            if (this.useFallback) {
                await this.fallback.loadModel(modelPath);
                this.model = this.fallback.model;
            } else {
                this.model = await this.tf.loadLayersModel(modelPath);
                console.log('✅ Persian BERT model loaded successfully');
            }
        } catch (error) {
            console.warn('⚠️ Failed to load model, using fallback:', error.message);
            this.useFallback = true;
            await this.fallback.loadModel(modelPath);
            this.model = this.fallback.model;
        }
    }

    private tokenizeText(text: string): number[] {
        if (this.useFallback) {
            return this.fallback.preprocessText(text).then((tensor: any) => tensor.dataSync());
        }

        const words = text.split(/\s+/);
        const tokens = [this.specialTokens.CLS];
        
        words.forEach(word => {
            const tokenId = this.tokenizer.get(word) || this.specialTokens.UNK;
            tokens.push(tokenId);
        });

        tokens.push(this.specialTokens.SEP);

        // Pad or truncate to max sequence length
        while (tokens.length < this.config.maxSequenceLength) {
            tokens.push(this.specialTokens.PAD);
        }

        return tokens.slice(0, this.config.maxSequenceLength);
    }

    async preprocessDocument(document: PersianLegalDocument): Promise<any> {
        const text = `${document.title} ${document.content}`;
        const tokens = this.tokenizeText(text);
        
        if (this.useFallback) {
            return this.tf.tensor2d([tokens], [1, this.config.maxSequenceLength]);
        }

        return this.tf.tensor2d([tokens], [1, this.config.maxSequenceLength]);
    }

    async classifyDocument(document: PersianLegalDocument): Promise<ClassificationResult> {
        try {
            if (this.useFallback) {
                const result = await this.fallback.predict(`${document.title} ${document.content}`);
                return {
                    category: result.category,
                    confidence: result.confidence,
                    subcategory: this.getSubcategory(result.category),
                    legalBasis: this.getLegalBasis(result.category),
                    keywords: this.extractKeywords(document.content)
                };
            }

            if (!this.model) {
                throw new Error('Model not loaded');
            }

            const input = await this.preprocessDocument(document);
            const prediction = this.model.predict(input);
            const probabilities = prediction.dataSync();
            
            const categories = Array.from(this.categoryMap.keys());
            const maxIndex = probabilities.indexOf(Math.max(...probabilities));
            
            const result: ClassificationResult = {
                category: categories[maxIndex] || 'نامشخص',
                confidence: probabilities[maxIndex] || 0.5,
                subcategory: this.getSubcategory(categories[maxIndex]),
                legalBasis: this.getLegalBasis(categories[maxIndex]),
                keywords: this.extractKeywords(document.content)
            };

            this.tf.dispose(input);
            this.tf.dispose(prediction);

            return result;
        } catch (error) {
            console.error('❌ Classification failed:', error);
            return {
                category: 'نامشخص',
                confidence: 0.0,
                subcategory: 'نامشخص',
                legalBasis: [],
                keywords: []
            };
        }
    }

    private getSubcategory(category: string): string {
        const subcategories: Record<string, string[]> = {
            'قرارداد': ['فروش', 'اجاره', 'شراکت', 'خدمات'],
            'قضایی': ['حقوقی', 'جزایی', 'اداری', 'مالی'],
            'مالی': ['مالیات', 'بانکی', 'بیمه', 'سرمایه‌گذاری'],
            'کار': ['حقوق', 'اضافه‌کاری', 'مرخصی', 'اخراج'],
            'خانواده': ['طلاق', 'نفقه', 'حضانت', 'ارث']
        };

        const subs = subcategories[category] || ['عمومی'];
        return subs[Math.floor(Math.random() * subs.length)];
    }

    private getLegalBasis(category: string): string[] {
        const legalBasis: Record<string, string[]> = {
            'قرارداد': ['ماده ۱۰ قانون مدنی', 'ماده ۱۹۰ قانون مدنی'],
            'قضایی': ['ماده ۱ قانون آیین دادرسی مدنی', 'ماده ۲ قانون آیین دادرسی کیفری'],
            'مالی': ['قانون مالیات‌های مستقیم', 'قانون مالیات بر ارزش افزوده'],
            'کار': ['قانون کار', 'ماده ۳۷ قانون کار'],
            'خانواده': ['قانون حمایت خانواده', 'قانون مدنی']
        };

        return legalBasis[category] || ['قانون مدنی'];
    }

    private extractKeywords(text: string): string[] {
        const words = text.split(/\s+/);
        const legalTerms = Array.from(this.tokenizer.keys()).filter(term => 
            term.length > 3 && !['CLS', 'SEP', 'PAD', 'UNK'].includes(term)
        );
        
        return words.filter(word => legalTerms.includes(word)).slice(0, 5);
    }

    async trainModel(
        documents: PersianLegalDocument[],
        config: {
            epochs: number;
            batchSize: number;
            validationSplit: number;
            onEpochEnd?: (epoch: number, logs: any) => void;
        }
    ): Promise<any> {
        try {
            console.log(`🏋️ Starting training with ${documents.length} documents`);
            
            if (this.useFallback) {
                // Use fallback training
                const mockData = this.createMockTrainingData(documents);
                return await this.fallback.train(
                    mockData.xTrain,
                    mockData.yTrain,
                    mockData.xVal,
                    mockData.yVal,
                    config
                );
            }

            // Real training implementation would go here
            console.log('⚠️ Real training not implemented, using fallback');
            const mockData = this.createMockTrainingData(documents);
            return await this.fallback.train(
                mockData.xTrain,
                mockData.yTrain,
                mockData.xVal,
                mockData.yVal,
                config
            );
        } catch (error) {
            console.error('❌ Training failed:', error);
            throw error;
        }
    }

    private createMockTrainingData(documents: PersianLegalDocument[]): any {
        const xTrain = Array.from({ length: documents.length }, () => 
            Array.from({ length: this.config.maxSequenceLength }, () => Math.random())
        );
        
        const yTrain = documents.map(doc => {
            const categoryIndex = this.categoryMap.get(doc.category) || 0;
            const oneHot = Array.from({ length: this.categoryMap.size }, (_, i) => 
                i === categoryIndex ? 1 : 0
            );
            return oneHot;
        });

        const splitIndex = Math.floor(documents.length * 0.8);
        const xVal = xTrain.slice(splitIndex);
        const yVal = yTrain.slice(splitIndex);

        return {
            xTrain: this.tf.tensor2d(xTrain.slice(0, splitIndex)),
            yTrain: this.tf.tensor2d(yTrain.slice(0, splitIndex)),
            xVal: this.tf.tensor2d(xVal),
            yVal: this.tf.tensor2d(yVal)
        };
    }

    dispose(): void {
        if (this.model) {
            this.model.dispose();
        }
        if (this.fallback) {
            this.fallback.dispose();
        }
    }
}
