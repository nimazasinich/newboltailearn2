// SQLite Database Service for Windows VPS deployment
import { TrainingSession, ModelCheckpoint } from '../../types/training';
import { LegalDocument } from '../../types/documents';
import { User } from '../../types/user';

export interface DatabaseConfig {
  path: string;
  enableWAL: boolean;
  timeout: number;
}

export interface ModelRecord {
  id: number;
  name: string;
  type: 'dora' | 'qr-adaptor' | 'persian-bert';
  status: 'training' | 'completed' | 'failed' | 'paused';
  accuracy: number;
  loss: number;
  epochs: number;
  dataset_size: number;
  created_at: string;
  updated_at: string;
  config: string; // JSON string
  model_data: string; // Base64 encoded model
}

export interface TrainingRecord {
  id: number;
  model_id: number;
  session_id: string;
  status: 'running' | 'completed' | 'failed' | 'paused';
  current_epoch: number;
  total_epochs: number;
  current_step: number;
  total_steps: number;
  loss: number;
  accuracy: number;
  learning_rate: number;
  batch_size: number;
  started_at: string;
  completed_at?: string;
  progress_data: string; // JSON string
  metrics_data: string; // JSON string
}

export interface DocumentRecord {
  id: number;
  title: string;
  content: string;
  category: string;
  classification_result: string; // JSON string
  user_id: string;
  created_at: string;
  updated_at: string;
  file_size: number;
  word_count: number;
}

// Browser-compatible SQLite implementation using IndexedDB as fallback
export class SQLiteService {
  private static instance: SQLiteService;
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  static getInstance(): SQLiteService {
    if (!SQLiteService.instance) {
      SQLiteService.instance = new SQLiteService();
    }
    return SQLiteService.instance;
  }

  async initialize(config?: DatabaseConfig): Promise<void> {
    if (this.isInitialized) return;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PersianLegalAI_SQLite', 1);

      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('SQLite-compatible database initialized');
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Models table
        if (!db.objectStoreNames.contains('models')) {
          const modelsStore = db.createObjectStore('models', { keyPath: 'id', autoIncrement: true });
          modelsStore.createIndex('name', 'name', { unique: false });
          modelsStore.createIndex('type', 'type', { unique: false });
          modelsStore.createIndex('status', 'status', { unique: false });
          modelsStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // Training sessions table
        if (!db.objectStoreNames.contains('training_sessions')) {
          const trainingStore = db.createObjectStore('training_sessions', { keyPath: 'id', autoIncrement: true });
          trainingStore.createIndex('model_id', 'model_id', { unique: false });
          trainingStore.createIndex('session_id', 'session_id', { unique: true });
          trainingStore.createIndex('status', 'status', { unique: false });
          trainingStore.createIndex('started_at', 'started_at', { unique: false });
        }

        // Documents table
        if (!db.objectStoreNames.contains('documents')) {
          const documentsStore = db.createObjectStore('documents', { keyPath: 'id', autoIncrement: true });
          documentsStore.createIndex('title', 'title', { unique: false });
          documentsStore.createIndex('category', 'category', { unique: false });
          documentsStore.createIndex('user_id', 'user_id', { unique: false });
          documentsStore.createIndex('created_at', 'created_at', { unique: false });
        }

        // Users table
        if (!db.objectStoreNames.contains('users')) {
          const usersStore = db.createObjectStore('users', { keyPath: 'id' });
          usersStore.createIndex('email', 'email', { unique: true });
          usersStore.createIndex('role', 'role', { unique: false });
        }

        // System logs table
        if (!db.objectStoreNames.contains('system_logs')) {
          const logsStore = db.createObjectStore('system_logs', { keyPath: 'id', autoIncrement: true });
          logsStore.createIndex('timestamp', 'timestamp', { unique: false });
          logsStore.createIndex('level', 'level', { unique: false });
          logsStore.createIndex('category', 'category', { unique: false });
        }
      };
    });
  }

  // Model operations
  async createModel(model: Omit<ModelRecord, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const modelRecord: Omit<ModelRecord, 'id'> = {
      ...model,
      created_at: now,
      updated_at: now
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['models'], 'readwrite');
      const store = transaction.objectStore('models');
      const request = store.add(modelRecord);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getModel(id: number): Promise<ModelRecord | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['models'], 'readonly');
      const store = transaction.objectStore('models');
      const request = store.get(id);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async getAllModels(): Promise<ModelRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['models'], 'readonly');
      const store = transaction.objectStore('models');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async updateModel(id: number, updates: Partial<ModelRecord>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const model = await this.getModel(id);
    if (!model) throw new Error('Model not found');

    const updatedModel = {
      ...model,
      ...updates,
      updated_at: new Date().toISOString()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['models'], 'readwrite');
      const store = transaction.objectStore('models');
      const request = store.put(updatedModel);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async deleteModel(id: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['models'], 'readwrite');
      const store = transaction.objectStore('models');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Training session operations
  async createTrainingSession(session: Omit<TrainingRecord, 'id'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['training_sessions'], 'readwrite');
      const store = transaction.objectStore('training_sessions');
      const request = store.add(session);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async getTrainingSession(sessionId: string): Promise<TrainingRecord | null> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['training_sessions'], 'readonly');
      const store = transaction.objectStore('training_sessions');
      const index = store.index('session_id');
      const request = index.get(sessionId);

      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  }

  async updateTrainingSession(sessionId: string, updates: Partial<TrainingRecord>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const session = await this.getTrainingSession(sessionId);
    if (!session) throw new Error('Training session not found');

    const updatedSession = { ...session, ...updates };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['training_sessions'], 'readwrite');
      const store = transaction.objectStore('training_sessions');
      const request = store.put(updatedSession);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  async getTrainingSessionsByModel(modelId: number): Promise<TrainingRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['training_sessions'], 'readonly');
      const store = transaction.objectStore('training_sessions');
      const index = store.index('model_id');
      const request = index.getAll(modelId);

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Document operations
  async createDocument(document: Omit<DocumentRecord, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');

    const now = new Date().toISOString();
    const documentRecord: Omit<DocumentRecord, 'id'> = {
      ...document,
      created_at: now,
      updated_at: now
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['documents'], 'readwrite');
      const store = transaction.objectStore('documents');
      const request = store.add(documentRecord);

      request.onsuccess = () => resolve(request.result as number);
      request.onerror = () => reject(request.error);
    });
  }

  async searchDocuments(query: string, category?: string): Promise<DocumentRecord[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['documents'], 'readonly');
      const store = transaction.objectStore('documents');
      const request = store.getAll();

      request.onsuccess = () => {
        const allDocuments = request.result;
        const filtered = allDocuments.filter(doc => {
          const matchesQuery = !query || 
            doc.title.toLowerCase().includes(query.toLowerCase()) ||
            doc.content.toLowerCase().includes(query.toLowerCase());
          
          const matchesCategory = !category || doc.category === category;
          
          return matchesQuery && matchesCategory;
        });

        resolve(filtered);
      };
      
      request.onerror = () => reject(request.error);
    });
  }

  // System logging
  async log(level: 'info' | 'warn' | 'error', category: string, message: string, metadata?: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const logRecord = {
      timestamp: new Date().toISOString(),
      level,
      category,
      message,
      metadata: metadata ? JSON.stringify(metadata) : null
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['system_logs'], 'readwrite');
      const store = transaction.objectStore('system_logs');
      const request = store.add(logRecord);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  }

  // Database statistics
  async getStats(): Promise<{
    totalModels: number;
    totalTrainingSessions: number;
    totalDocuments: number;
    totalLogs: number;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const stats = {
      totalModels: 0,
      totalTrainingSessions: 0,
      totalDocuments: 0,
      totalLogs: 0
    };

    const promises = [
      this.countRecords('models'),
      this.countRecords('training_sessions'),
      this.countRecords('documents'),
      this.countRecords('system_logs')
    ];

    const [models, sessions, documents, logs] = await Promise.all(promises);
    
    return {
      totalModels: models,
      totalTrainingSessions: sessions,
      totalDocuments: documents,
      totalLogs: logs
    };
  }

  private async countRecords(storeName: string): Promise<number> {
    if (!this.db) return 0;

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([storeName], 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.count();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  // Export data for backup
  async exportData(): Promise<{
    models: ModelRecord[];
    trainingSessions: TrainingRecord[];
    documents: DocumentRecord[];
    exportedAt: string;
  }> {
    if (!this.db) throw new Error('Database not initialized');

    const [models, trainingSessions, documents] = await Promise.all([
      this.getAllModels(),
      this.getAllTrainingSessions(),
      this.getAllDocuments()
    ]);

    return {
      models,
      trainingSessions,
      documents,
      exportedAt: new Date().toISOString()
    };
  }

  private async getAllTrainingSessions(): Promise<TrainingRecord[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['training_sessions'], 'readonly');
      const store = transaction.objectStore('training_sessions');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  private async getAllDocuments(): Promise<DocumentRecord[]> {
    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['documents'], 'readonly');
      const store = transaction.objectStore('documents');
      const request = store.getAll();

      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }

  async close(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }
}

export const sqliteService = SQLiteService.getInstance();