"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.huggingFaceAPI = exports.HuggingFaceAPI = exports.REAL_DATASETS = void 0;
exports.REAL_DATASETS = {
    'iran-legal-qa': {
        id: 'PerSets/iran-legal-persian-qa',
        name: 'پرسش و پاسخ حقوقی ایران',
        description: 'مجموعه داده پرسش و پاسخ حقوقی به زبان فارسی',
        api: 'https://datasets-server.huggingface.co/rows?dataset=PerSets/iran-legal-persian-qa&config=default&split=train&offset=0&length=100',
        samples: 10247,
        language: 'persian',
        domain: 'legal',
        size_mb: 15.2
    },
    'legal-laws': {
        id: 'QomSSLab/legal_laws_lite_chunk_v1',
        name: 'متون قوانین ایران',
        description: 'مجموعه قوانین و مقررات جمهوری اسلامی ایران',
        api: 'https://datasets-server.huggingface.co/rows?dataset=QomSSLab/legal_laws_lite_chunk_v1&config=default&split=train&offset=0&length=100',
        samples: 50000,
        language: 'persian',
        domain: 'legal',
        size_mb: 125.8
    },
    'persian-ner': {
        id: 'mansoorhamidzadeh/Persian-NER-Dataset-500k',
        name: 'تشخیص موجودیت فارسی',
        description: 'مجموعه داده تشخیص موجودیت‌های نامدار فارسی',
        api: 'https://datasets-server.huggingface.co/rows?dataset=mansoorhamidzadeh/Persian-NER-Dataset-500k&config=default&split=train&offset=0&length=100',
        samples: 500000,
        language: 'persian',
        domain: 'ner',
        size_mb: 890.5
    },
    'persian-sentiment': {
        id: 'HooshvareLab/sentiment-fa',
        name: 'تحلیل احساسات فارسی',
        description: 'مجموعه داده تحلیل احساسات متون فارسی',
        api: 'https://datasets-server.huggingface.co/rows?dataset=HooshvareLab/sentiment-fa&config=default&split=train&offset=0&length=100',
        samples: 25000,
        language: 'persian',
        domain: 'sentiment',
        size_mb: 45.3
    },
    'persian-summarization': {
        id: 'HooshvareLab/pn-summary',
        name: 'خلاصه‌سازی متون فارسی',
        description: 'مجموعه داده خلاصه‌سازی اخبار فارسی',
        api: 'https://datasets-server.huggingface.co/rows?dataset=HooshvareLab/pn-summary&config=default&split=train&offset=0&length=100',
        samples: 93207,
        language: 'persian',
        domain: 'summarization',
        size_mb: 78.9
    }
};
class HuggingFaceAPI {
    constructor() {
        this.cache = new Map();
        this.baseUrl = 'https://datasets-server.huggingface.co';
    }
    static getInstance() {
        if (!HuggingFaceAPI.instance) {
            HuggingFaceAPI.instance = new HuggingFaceAPI();
        }
        return HuggingFaceAPI.instance;
    }
    async fetchDataset(datasetKey, offset = 0, length = 100) {
        const cacheKey = `${datasetKey}-${offset}-${length}`;
        if (this.cache.has(cacheKey)) {
            return this.cache.get(cacheKey);
        }
        const dataset = exports.REAL_DATASETS[datasetKey];
        if (!dataset) {
            throw new Error(`Dataset ${datasetKey} not found`);
        }
        try {
            const url = `${this.baseUrl}/rows?dataset=${dataset.id}&config=default&split=train&offset=${offset}&length=${length}`;
            console.log(`Fetching real data from: ${url}`);
            
            // Get secure HuggingFace headers
            const { getHFHeaders } = await import('../../utils/decode');
            const headers = getHFHeaders();
            
            const response = await fetch(url, {
                headers: {
                    ...headers,
                    'Accept': 'application/json',
                    'User-Agent': 'Persian-Legal-AI/1.0'
                }
            });
            
            if (!response.ok) {
                if (response.status === 401) {
                    throw new Error('Invalid HuggingFace token. Please check HF_TOKEN_B64.');
                }
                if (response.status === 429) {
                    throw new Error('Rate limited by HuggingFace. Please try again later.');
                }
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            // Validate response structure
            if (!data.rows || !Array.isArray(data.rows)) {
                throw new Error('Invalid dataset response structure');
            }
            // Cache the response
            this.cache.set(cacheKey, data);
            console.log(`Successfully fetched ${data.rows.length} rows from ${dataset.name}`);
            return data;
        }
        catch (error) {
            console.error(`Error fetching dataset ${datasetKey}:`, error);
            // Return fallback data structure instead of throwing
            return {
                rows: [],
                num_rows_total: 0,
                num_rows_per_page: length,
                partial: true,
                error: error.message
            };
        }
    }
    async fetchMultipleDatasets(datasetKeys, samplesPerDataset = 50) {
        const results = {};
        const promises = datasetKeys.map(async (key) => {
            try {
                const data = await this.fetchDataset(key, 0, samplesPerDataset);
                results[key] = data;
            }
            catch (error) {
                console.error(`Failed to fetch dataset ${key}:`, error);
                results[key] = {
                    rows: [],
                    num_rows_total: 0,
                    num_rows_per_page: samplesPerDataset,
                    partial: true
                };
            }
        });
        await Promise.all(promises);
        return results;
    }
    async getDatasetInfo(datasetKey) {
        return exports.REAL_DATASETS[datasetKey] || null;
    }
    getAllDatasets() {
        return Object.values(exports.REAL_DATASETS);
    }
    async searchDatasets(query) {
        const allDatasets = this.getAllDatasets();
        const lowerQuery = query.toLowerCase();
        return allDatasets.filter(dataset => dataset.name.toLowerCase().includes(lowerQuery) ||
            dataset.description.toLowerCase().includes(lowerQuery) ||
            dataset.domain.toLowerCase().includes(lowerQuery));
    }
    clearCache() {
        this.cache.clear();
    }
    getCacheSize() {
        return this.cache.size;
    }
    
    // Download dataset with progress reporting
    async downloadDataset(datasetKey, onProgress = null) {
        const dataset = exports.REAL_DATASETS[datasetKey];
        if (!dataset) {
            throw new Error(`Dataset ${datasetKey} not found`);
        }
        
        try {
            const { getHFHeaders } = await import('../../utils/decode');
            const headers = getHFHeaders();
            
            const allData = [];
            let offset = 0;
            const batchSize = 1000;
            let hasMore = true;
            
            console.log(`Starting download of ${dataset.name}...`);
            
            while (hasMore) {
                try {
                    const url = `${this.baseUrl}/rows?dataset=${dataset.id}&config=default&split=train&offset=${offset}&length=${batchSize}`;
                    
                    const response = await fetch(url, {
                        headers: {
                            ...headers,
                            'Accept': 'application/json',
                            'User-Agent': 'Persian-Legal-AI/1.0'
                        }
                    });
                    
                    if (!response.ok) {
                        if (response.status === 401) {
                            throw new Error('Invalid HuggingFace token. Please check HF_TOKEN_B64.');
                        }
                        if (response.status === 429) {
                            throw new Error('Rate limited by HuggingFace. Please try again later.');
                        }
                        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                    }
                    
                    const data = await response.json();
                    
                    if (!data.rows || data.rows.length === 0) {
                        hasMore = false;
                        break;
                    }
                    
                    allData.push(...data.rows);
                    offset += batchSize;
                    
                    // Report progress
                    if (onProgress) {
                        const percentage = Math.min(100, (allData.length / dataset.samples) * 100);
                        onProgress({
                            datasetKey,
                            downloaded: allData.length,
                            total: dataset.samples,
                            percentage: Math.round(percentage),
                            currentBatch: data.rows.length
                        });
                    }
                    
                    // Limit total samples to prevent excessive downloads
                    if (allData.length >= 10000) {
                        hasMore = false;
                    }
                    
                    // Add delay to respect rate limits
                    await new Promise(resolve => setTimeout(resolve, 100));
                    
                } catch (fetchError) {
                    console.error(`Error fetching batch at offset ${offset}:`, fetchError);
                    hasMore = false;
                }
            }
            
            if (allData.length === 0) {
                throw new Error('No data downloaded');
            }
            
            console.log(`Successfully downloaded ${allData.length} samples from ${dataset.name}`);
            return {
                datasetKey,
                samples: allData.length,
                data: allData,
                metadata: {
                    downloadedAt: new Date().toISOString(),
                    totalSamples: allData.length,
                    datasetInfo: dataset
                }
            };
            
        } catch (error) {
            console.error(`Dataset download failed for ${datasetKey}:`, error);
            throw error;
        }
    }
    // Process real Persian text data
    processRealPersianText(data) {
        const texts = [];
        const labels = [];
        const metadata = [];
        data.forEach((item, index) => {
            const row = item.row;
            // Extract text content based on dataset structure
            let text = '';
            let label = '';
            if (row.question && row.answer) {
                // Q&A dataset
                text = `${row.question} ${row.answer}`;
                label = 'qa';
            }
            else if (row.text) {
                // Text dataset
                text = row.text;
                label = row.label || 'text';
            }
            else if (row.tokens && Array.isArray(row.tokens)) {
                // NER dataset
                text = row.tokens.join(' ');
                label = 'ner';
            }
            else {
                // Fallback
                text = JSON.stringify(row).substring(0, 500);
                label = 'unknown';
            }
            if (text && text.length > 10) {
                texts.push(text);
                labels.push(label);
                metadata.push({
                    index,
                    originalRow: row,
                    processedAt: new Date().toISOString()
                });
            }
        });
        return { texts, labels, metadata };
    }
    // Get dataset statistics
    async getDatasetStats(datasetKey) {
        const data = await this.fetchDataset(datasetKey, 0, 1000);
        const processed = this.processRealPersianText(data.rows);
        const avgTextLength = processed.texts.reduce((sum, text) => sum + text.length, 0) / processed.texts.length;
        const uniqueLabels = [...new Set(processed.labels)];
        const sampleTexts = processed.texts.slice(0, 5);
        return {
            totalSamples: data.num_rows_total,
            avgTextLength: Math.round(avgTextLength),
            uniqueLabels,
            sampleTexts
        };
    }
}
exports.HuggingFaceAPI = HuggingFaceAPI;
// Export singleton instance
exports.huggingFaceAPI = HuggingFaceAPI.getInstance();
