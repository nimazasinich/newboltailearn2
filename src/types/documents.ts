// Document Processing Types
export interface LegalDocument {
  id: string;
  title: string;
  content: string;
  category: DocumentCategory;
  subcategory: string;
  classification: ClassificationResult;
  metadata: DocumentMetadata;
  searchTokens: string[];
  createdAt: Date;
  updatedAt: Date;
  userId: string;
}

export type DocumentCategory = 
  | 'قرارداد' // Contract
  | 'دادگاه' // Court
  | 'قانون' // Law
  | 'آیین‌نامه' // Regulation
  | 'حکم' // Judgment
  | 'لایحه' // Bill
  | 'مصوبه' // Resolution
  | 'بخشنامه'; // Circular

export interface ClassificationResult {
  category: DocumentCategory;
  confidence: number;
  subcategories: Array<{
    name: string;
    confidence: number;
  }>;
  keyTerms: Array<{
    term: string;
    importance: number;
    position: number[];
  }>;
  sentiment: 'positive' | 'neutral' | 'negative';
  complexity: 'low' | 'medium' | 'high';
  language: 'persian' | 'arabic' | 'mixed';
}

export interface DocumentMetadata {
  fileSize: number;
  fileType: string;
  wordCount: number;
  pageCount: number;
  author?: string;
  source?: string;
  jurisdiction?: string;
  dateCreated?: Date;
  tags: string[];
  references: string[];
}

export interface SearchFilters {
  categories?: DocumentCategory[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  minConfidence?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  complexity?: 'low' | 'medium' | 'high';
  author?: string;
  source?: string;
}

export interface SearchResult {
  document: LegalDocument;
  relevanceScore: number;
  matchedTerms: string[];
  highlights: Array<{
    text: string;
    startIndex: number;
    endIndex: number;
  }>;
}

export interface DocumentAnalysis {
  documentId: string;
  statistics: {
    wordFrequency: Array<{
      word: string;
      count: number;
      percentage: number;
    }>;
    sentenceComplexity: number;
    readabilityScore: number;
    keyPhrases: string[];
    namedEntities: Array<{
      entity: string;
      type: 'person' | 'organization' | 'location' | 'date' | 'law';
      confidence: number;
    }>;
  };
  legalAnalysis: {
    contractElements: string[];
    legalConcepts: string[];
    obligations: string[];
    rights: string[];
    penalties: string[];
    jurisdiction: string[];
  };
  recommendations: string[];
}