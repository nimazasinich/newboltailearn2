import { useState, useEffect, useCallback } from 'react';
import { LegalDocument, DocumentAnalysis, SearchResult, SearchFilters, ClassificationResult } from '../types/documents';
import { db } from '../services/database';
import { PersianBertProcessor } from '../services/ai/PersianBertProcessor';
import { useAuth } from './useAuth';

export function useDocuments() {
  const { user, updateUserStatistics } = useAuth();
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load documents
  const loadDocuments = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      const docs = await db.legalDocuments
        .where('userId')
        .equals(user.id)
        .orderBy('createdAt')
        .reverse()
        .toArray();
      
      setDocuments(docs);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در بارگذاری اسناد';
      setError(errorMessage);
      await db.log('error', 'documents', errorMessage);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Load documents on mount and user change
  useEffect(() => {
    loadDocuments();
  }, [loadDocuments]);

  // Add new document
  const addDocument = useCallback(async (
    title: string,
    content: string,
    category?: LegalDocument['category']
  ): Promise<LegalDocument> => {
    if (!user) throw new Error('کاربر وارد نشده است');

    try {
      setProcessing(true);
      
      // Create Persian BERT processor for classification
      const processor = new PersianBertProcessor({
        modelSize: 'base',
        vocabSize: 30000,
        maxSequenceLength: 512,
        hiddenSize: 768,
        numAttentionHeads: 12,
        numLayers: 12,
        persianTokenization: true,
        legalDomainPretraining: true
      });

      await processor.initialize();

      // Create document with initial data
      const newDocument: LegalDocument = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        title,
        content,
        category: category || 'قرارداد', // Default category
        subcategory: '',
        classification: {
          category: category || 'قرارداد',
          confidence: 0,
          subcategories: [],
          keyTerms: [],
          sentiment: 'neutral',
          complexity: 'medium',
          language: 'persian'
        },
        metadata: {
          fileSize: content.length,
          fileType: 'text',
          wordCount: content.split(/\s+/).length,
          pageCount: Math.ceil(content.length / 3000), // Rough estimate
          tags: [],
          references: []
        },
        searchTokens: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        userId: user.id
      };

      // Process document for classification if no category provided
      if (!category) {
        const classification = await processor.processDocument(newDocument);
        newDocument.classification = classification;
        newDocument.category = classification.category;
      }

      // Add to database (searchTokens will be generated automatically)
      await db.legalDocuments.add(newDocument);
      
      // Update local state
      setDocuments(prev => [newDocument, ...prev]);

      // Update user statistics
      await updateUserStatistics({
        totalDocumentsProcessed: (user.statistics.totalDocumentsProcessed || 0) + 1,
        lastActivityDate: new Date()
      });

      await db.log('info', 'documents', `Added new document: ${title}`);
      return newDocument;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در افزودن سند';
      setError(errorMessage);
      await db.log('error', 'documents', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setProcessing(false);
    }
  }, [user, updateUserStatistics]);

  // Upload and process file
  const uploadDocument = useCallback(async (file: File): Promise<LegalDocument> => {
    if (!user) throw new Error('کاربر وارد نشده است');

    try {
      setProcessing(true);

      // Read file content
      const content = await readFileContent(file);
      const title = file.name.replace(/\.[^/.]+$/, ""); // Remove extension

      return await addDocument(title, content);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در آپلود فایل';
      setError(errorMessage);
      await db.log('error', 'documents', errorMessage);
      throw new Error(errorMessage);
    } finally {
      setProcessing(false);
    }
  }, [addDocument, user]);

  // Search documents
  const searchDocuments = useCallback(async (
    query: string,
    filters?: SearchFilters
  ): Promise<SearchResult[]> => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }

    try {
      setSearching(true);
      const results = await db.searchDocuments(query, filters);
      setSearchResults(results);
      
      await db.log('info', 'documents', `Search performed: ${query}`);
      return results;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در جستجو';
      setError(errorMessage);
      await db.log('error', 'documents', errorMessage);
      return [];
    } finally {
      setSearching(false);
    }
  }, []);

  // Analyze document
  const analyzeDocument = useCallback(async (documentId: string): Promise<DocumentAnalysis | null> => {
    try {
      setProcessing(true);
      
      const document = await db.legalDocuments.get(documentId);
      if (!document) throw new Error('سند یافت نشد');

      // Create Persian BERT processor for analysis
      const processor = new PersianBertProcessor({
        modelSize: 'base',
        vocabSize: 30000,
        maxSequenceLength: 512,
        hiddenSize: 768,
        numAttentionHeads: 12,
        numLayers: 12,
        persianTokenization: true,
        legalDomainPretraining: true
      });

      await processor.initialize();

      // Perform analysis
      const analysis = await processor.analyzeDocument(document);
      
      // Store analysis
      await db.documentAnalyses.put(analysis);

      await db.log('info', 'documents', `Document analyzed: ${document.title}`);
      return analysis;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در تجزیه و تحلیل سند';
      setError(errorMessage);
      await db.log('error', 'documents', errorMessage);
      return null;
    } finally {
      setProcessing(false);
    }
  }, []);

  // Get document analysis
  const getDocumentAnalysis = useCallback(async (documentId: string): Promise<DocumentAnalysis | null> => {
    try {
      const analysis = await db.documentAnalyses.get(documentId);
      return analysis || null;
    } catch (err) {
      console.error('Error getting document analysis:', err);
      return null;
    }
  }, []);

  // Update document
  const updateDocument = useCallback(async (
    documentId: string, 
    updates: Partial<LegalDocument>
  ): Promise<void> => {
    try {
      await db.legalDocuments.update(documentId, {
        ...updates,
        updatedAt: new Date()
      });

      // Update local state
      setDocuments(prev => prev.map(doc => 
        doc.id === documentId ? { ...doc, ...updates, updatedAt: new Date() } : doc
      ));

      await db.log('info', 'documents', `Document updated: ${documentId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در به‌روزرسانی سند';
      setError(errorMessage);
      await db.log('error', 'documents', errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Delete document
  const deleteDocument = useCallback(async (documentId: string): Promise<void> => {
    try {
      // Delete analysis
      await db.documentAnalyses.delete(documentId);
      
      // Delete document
      await db.legalDocuments.delete(documentId);

      // Update local state
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));

      await db.log('info', 'documents', `Document deleted: ${documentId}`);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'خطا در حذف سند';
      setError(errorMessage);
      await db.log('error', 'documents', errorMessage);
      throw new Error(errorMessage);
    }
  }, []);

  // Get document statistics
  const getDocumentStatistics = useCallback(async () => {
    if (!user) return null;

    try {
      const allDocs = await db.legalDocuments.where('userId').equals(user.id).toArray();
      
      // Category statistics
      const categoryStats = allDocs.reduce((acc, doc) => {
        acc[doc.category] = (acc[doc.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Complexity statistics
      const complexityStats = allDocs.reduce((acc, doc) => {
        const complexity = doc.classification.complexity;
        acc[complexity] = (acc[complexity] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Language statistics
      const languageStats = allDocs.reduce((acc, doc) => {
        const language = doc.classification.language;
        acc[language] = (acc[language] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Sentiment statistics
      const sentimentStats = allDocs.reduce((acc, doc) => {
        const sentiment = doc.classification.sentiment;
        acc[sentiment] = (acc[sentiment] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const totalWords = allDocs.reduce((acc, doc) => acc + doc.metadata.wordCount, 0);
      const totalSize = allDocs.reduce((acc, doc) => acc + doc.metadata.fileSize, 0);

      return {
        totalDocuments: allDocs.length,
        totalWords,
        totalSize,
        averageWordsPerDocument: allDocs.length > 0 ? Math.round(totalWords / allDocs.length) : 0,
        categoryStats,
        complexityStats,
        languageStats,
        sentimentStats,
        recentDocuments: allDocs
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
      };
    } catch (err) {
      console.error('Error getting document statistics:', err);
      return null;
    }
  }, [user]);

  // Clear search results
  const clearSearchResults = useCallback(() => {
    setSearchResults([]);
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    documents,
    searchResults,
    loading,
    searching,
    processing,
    error,
    addDocument,
    uploadDocument,
    searchDocuments,
    analyzeDocument,
    getDocumentAnalysis,
    updateDocument,
    deleteDocument,
    getDocumentStatistics,
    clearSearchResults,
    clearError,
    refreshDocuments: loadDocuments
  };
}

// Helper function to read file content
async function readFileContent(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (event) => {
      const content = event.target?.result as string;
      resolve(content);
    };
    
    reader.onerror = () => {
      reject(new Error('خطا در خواندن فایل'));
    };
    
    reader.readAsText(file, 'UTF-8');
  });
}