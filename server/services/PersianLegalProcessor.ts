import fs from "fs";
import path from "path";
import { createHash } from "crypto";

export interface ProcessedDocument {
  id: string;
  text: string;
  entities: LegalEntity[];
  classification: DocumentClassification;
  metadata: DocumentMetadata;
  processedAt: string;
}

export interface LegalEntity {
  text: string;
  type: LegalEntityType;
  start: number;
  end: number;
  confidence: number;
}

export interface DocumentClassification {
  category: string;
  subcategory?: string;
  confidence: number;
  legalType: LegalDocumentType;
}

export interface DocumentMetadata {
  fileName: string;
  fileSize: number;
  mimeType: string;
  language: string;
  pageCount?: number;
  wordCount: number;
  characterCount: number;
  extractedAt: string;
}

export type LegalEntityType = 
  | 'PERSON' 
  | 'ORGANIZATION' 
  | 'LAW' 
  | 'ARTICLE' 
  | 'CLAUSE' 
  | 'DATE' 
  | 'AMOUNT' 
  | 'COURT' 
  | 'CASE_NUMBER'
  | 'JUDGE'
  | 'LAWYER'
  | 'CONTRACT_PARTY'
  | 'LEGAL_TERM';

export type LegalDocumentType = 
  | 'CONTRACT'
  | 'COURT_DECISION'
  | 'LAW_TEXT'
  | 'LEGAL_OPINION'
  | 'NOTARY_DOCUMENT'
  | 'LEGAL_BRIEF'
  | 'REGULATION'
  | 'LEGAL_NOTICE'
  | 'OTHER';

export class PersianLegalProcessor {
  private legalTerms: Set<string>;
  private courtNames: Set<string>;
  private legalPatterns: Map<LegalEntityType, RegExp[]>;

  constructor() {
    this.legalTerms = new Set();
    this.courtNames = new Set();
    this.legalPatterns = new Map();
    this.initializeLegalData();
  }

  private initializeLegalData(): void {
    // Persian legal terms
    this.legalTerms = new Set([
      'قرارداد', 'عقد', 'مبایعه‌نامه', 'اجاره‌نامه', 'شرکت', 'سهام',
      'حقوق', 'قانون', 'ماده', 'بند', 'تبصره', 'آیین‌نامه',
      'دادگاه', 'قاضی', 'وکیل', 'شاهد', 'متهم', 'مدعی',
      'حکم', 'رای', 'استیناف', 'تمیز', 'فرجام', 'اعاده',
      'خسارت', 'غرامت', 'جریمه', 'مبلغ', 'ریال', 'تومان',
      'تاریخ', 'ماه', 'سال', 'روز', 'هفته', 'میلادی', 'شمسی',
      'طرف اول', 'طرف دوم', 'متعهد', 'متعهدله', 'ضامن', 'کفیل'
    ]);

    // Persian court names
    this.courtNames = new Set([
      'دادگاه عمومی', 'دادگاه انقلاب', 'دادگاه خانواده', 'دادگاه تجاری',
      'دادگاه کیفری', 'دادگاه مدنی', 'دادگاه اداری', 'دادگاه نظامی',
      'دیوان عالی کشور', 'دادگاه تجدیدنظر', 'دادگاه بدوی'
    ]);

    // Legal entity patterns
    this.legalPatterns.set('PERSON', [
      /[آ-ی]+\s+[آ-ی]+/g, // Persian names
      /[آ-ی]+\s+[آ-ی]+\s+[آ-ی]+/g // Full Persian names
    ]);

    this.legalPatterns.set('ORGANIZATION', [
      /شرکت\s+[آ-ی\s]+/g,
      /موسسه\s+[آ-ی\s]+/g,
      /سازمان\s+[آ-ی\s]+/g,
      /اداره\s+[آ-ی\s]+/g,
      /وزارت\s+[آ-ی\s]+/g
    ]);

    this.legalPatterns.set('LAW', [
      /قانون\s+[آ-ی\s]+/g,
      /آیین‌نامه\s+[آ-ی\s]+/g,
      /مقررات\s+[آ-ی\s]+/g
    ]);

    this.legalPatterns.set('ARTICLE', [
      /ماده\s+\d+/g,
      /بند\s+\d+/g,
      /تبصره\s+\d+/g
    ]);

    this.legalPatterns.set('DATE', [
      /\d{4}\/\d{1,2}\/\d{1,2}/g, // Persian date format
      /\d{1,2}\/\d{1,2}\/\d{4}/g, // Alternative format
      /[آ-ی]+\s+\d{4}/g // Persian month + year
    ]);

    this.legalPatterns.set('AMOUNT', [
      /\d+[\s,]*\d*\s*(ریال|تومان|دلار|یورو)/g,
      /مبلغ\s+\d+[\s,]*\d*\s*(ریال|تومان|دلار|یورو)/g
    ]);

    this.legalPatterns.set('CASE_NUMBER', [
      /\d+\/\d{4}/g,
      /پرونده\s+\d+\/\d{4}/g,
      /شماره\s+\d+\/\d{4}/g
    ]);

    this.legalPatterns.set('COURT', [
      /دادگاه\s+[آ-ی\s]+/g,
      /دیوان\s+[آ-ی\s]+/g
    ]);
  }

  /**
   * Process a Persian legal document
   */
  async processDocument(file: File | Buffer, fileName?: string): Promise<ProcessedDocument> {
    try {
      // Extract text from file
      const text = await this.extractText(file, fileName);
      
      // Generate document ID
      const documentId = this.generateDocumentId(text, fileName);
      
      // Extract legal entities
      const entities = await this.extractLegalEntities(text);
      
      // Classify document
      const classification = await this.classifyDocument(text);
      
      // Create metadata
      const metadata = this.createMetadata(file, fileName, text);
      
      return {
        id: documentId,
        text,
        entities,
        classification,
        metadata,
        processedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error processing document:', error);
      throw new Error(`Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Extract text from various file formats
   */
  private async extractText(file: File | Buffer, fileName?: string): Promise<string> {
    try {
      if (Buffer.isBuffer(file)) {
        // Handle buffer input
        const text = file.toString('utf8');
        return this.cleanText(text);
      }

      // Handle File object
      const mimeType = file.type || this.getMimeTypeFromFileName(fileName);
      
      switch (mimeType) {
        case 'text/plain':
        case 'text/html':
          return this.cleanText(await file.text());
        
        case 'application/pdf':
          // For PDF files, we would need a PDF parser
          // For now, return placeholder text
          return this.cleanText('PDF content extraction not implemented yet');
        
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          // For Word documents, we would need a Word parser
          return this.cleanText('Word document content extraction not implemented yet');
        
        default:
          // Try to read as text
          try {
            return this.cleanText(await file.text());
          } catch {
            throw new Error(`Unsupported file type: ${mimeType}`);
          }
      }
    } catch (error) {
      console.error('Error extracting text:', error);
      throw new Error(`Failed to extract text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Clean and normalize Persian text
   */
  private cleanText(text: string): string {
    return text
      .replace(/\r\n/g, '\n') // Normalize line endings
      .replace(/\r/g, '\n')   // Normalize line endings
      .replace(/\n+/g, '\n')  // Remove multiple newlines
      .replace(/\s+/g, ' ')   // Normalize whitespace
      .trim();                // Remove leading/trailing whitespace
  }

  /**
   * Extract legal entities from text
   */
  private async extractLegalEntities(text: string): Promise<LegalEntity[]> {
    const entities: LegalEntity[] = [];
    
    // Extract entities using patterns
    for (const [entityType, patterns] of this.legalPatterns) {
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(text)) !== null) {
          entities.push({
            text: match[0],
            type: entityType,
            start: match.index,
            end: match.index + match[0].length,
            confidence: this.calculateEntityConfidence(match[0], entityType)
          });
        }
      }
    }

    // Remove overlapping entities (keep higher confidence)
    return this.removeOverlappingEntities(entities);
  }

  /**
   * Calculate confidence score for an entity
   */
  private calculateEntityConfidence(text: string, type: LegalEntityType): number {
    let confidence = 0.5; // Base confidence

    // Increase confidence for known legal terms
    if (this.legalTerms.has(text.toLowerCase())) {
      confidence += 0.3;
    }

    // Increase confidence for court names
    if (type === 'COURT' && this.courtNames.has(text.toLowerCase())) {
      confidence += 0.2;
    }

    // Increase confidence for specific patterns
    switch (type) {
      case 'DATE':
        if (/\d{4}\/\d{1,2}\/\d{1,2}/.test(text)) {
          confidence += 0.2;
        }
        break;
      case 'AMOUNT':
        if (/(ریال|تومان|دلار|یورو)/.test(text)) {
          confidence += 0.2;
        }
        break;
      case 'CASE_NUMBER':
        if (/\d+\/\d{4}/.test(text)) {
          confidence += 0.2;
        }
        break;
    }

    return Math.min(confidence, 1.0);
  }

  /**
   * Remove overlapping entities, keeping the one with higher confidence
   */
  private removeOverlappingEntities(entities: LegalEntity[]): LegalEntity[] {
    // Sort by start position
    entities.sort((a, b) => a.start - b.start);
    
    const result: LegalEntity[] = [];
    
    for (const entity of entities) {
      const overlapping = result.find(existing => 
        (entity.start < existing.end && entity.end > existing.start)
      );
      
      if (!overlapping) {
        result.push(entity);
      } else if (entity.confidence > overlapping.confidence) {
        // Replace with higher confidence entity
        const index = result.indexOf(overlapping);
        result[index] = entity;
      }
    }
    
    return result;
  }

  /**
   * Classify document type
   */
  private async classifyDocument(text: string): Promise<DocumentClassification> {
    const lowerText = text.toLowerCase();
    
    // Contract indicators
    const contractIndicators = ['قرارداد', 'عقد', 'مبایعه‌نامه', 'اجاره‌نامه', 'طرف اول', 'طرف دوم'];
    const contractScore = contractIndicators.reduce((score, indicator) => 
      score + (lowerText.includes(indicator) ? 1 : 0), 0);

    // Court decision indicators
    const courtIndicators = ['دادگاه', 'قاضی', 'حکم', 'رای', 'متهم', 'مدعی'];
    const courtScore = courtIndicators.reduce((score, indicator) => 
      score + (lowerText.includes(indicator) ? 1 : 0), 0);

    // Law text indicators
    const lawIndicators = ['قانون', 'ماده', 'بند', 'تبصره', 'آیین‌نامه'];
    const lawScore = lawIndicators.reduce((score, indicator) => 
      score + (lowerText.includes(indicator) ? 1 : 0), 0);

    // Determine document type
    let legalType: LegalDocumentType = 'OTHER';
    let confidence = 0.5;

    if (contractScore >= 2) {
      legalType = 'CONTRACT';
      confidence = Math.min(0.9, 0.5 + (contractScore * 0.1));
    } else if (courtScore >= 2) {
      legalType = 'COURT_DECISION';
      confidence = Math.min(0.9, 0.5 + (courtScore * 0.1));
    } else if (lawScore >= 2) {
      legalType = 'LAW_TEXT';
      confidence = Math.min(0.9, 0.5 + (lawScore * 0.1));
    }

    return {
      category: this.getCategoryFromType(legalType),
      subcategory: this.getSubcategoryFromType(legalType),
      confidence,
      legalType
    };
  }

  /**
   * Get category from legal document type
   */
  private getCategoryFromType(type: LegalDocumentType): string {
    const categoryMap: Record<LegalDocumentType, string> = {
      'CONTRACT': 'قراردادها',
      'COURT_DECISION': 'احکام قضایی',
      'LAW_TEXT': 'متون قانونی',
      'LEGAL_OPINION': 'نظرات حقوقی',
      'NOTARY_DOCUMENT': 'اسناد رسمی',
      'LEGAL_BRIEF': 'لایحه‌های حقوقی',
      'REGULATION': 'مقررات',
      'LEGAL_NOTICE': 'اعلانات حقوقی',
      'OTHER': 'سایر'
    };
    return categoryMap[type] || 'سایر';
  }

  /**
   * Get subcategory from legal document type
   */
  private getSubcategoryFromType(type: LegalDocumentType): string | undefined {
    const subcategoryMap: Record<LegalDocumentType, string | undefined> = {
      'CONTRACT': 'قراردادهای تجاری',
      'COURT_DECISION': 'احکام مدنی',
      'LAW_TEXT': 'قوانین موضوعه',
      'LEGAL_OPINION': undefined,
      'NOTARY_DOCUMENT': 'اسناد ملکی',
      'LEGAL_BRIEF': undefined,
      'REGULATION': 'آیین‌نامه‌ها',
      'LEGAL_NOTICE': undefined,
      'OTHER': undefined
    };
    return subcategoryMap[type];
  }

  /**
   * Create document metadata
   */
  private createMetadata(file: File | Buffer, fileName?: string, text?: string): DocumentMetadata {
    const now = new Date().toISOString();
    
    if (Buffer.isBuffer(file)) {
      return {
        fileName: fileName || 'unknown.txt',
        fileSize: file.length,
        mimeType: this.getMimeTypeFromFileName(fileName) || 'application/octet-stream',
        language: 'fa', // Persian
        wordCount: text ? text.split(/\s+/).length : 0,
        characterCount: text ? text.length : 0,
        extractedAt: now
      };
    }

    return {
      fileName: file.name || fileName || 'unknown',
      fileSize: file.size,
      mimeType: file.type || this.getMimeTypeFromFileName(fileName) || 'application/octet-stream',
      language: 'fa', // Persian
      wordCount: text ? text.split(/\s+/).length : 0,
      characterCount: text ? text.length : 0,
      extractedAt: now
    };
  }

  /**
   * Get MIME type from file name
   */
  private getMimeTypeFromFileName(fileName?: string): string | undefined {
    if (!fileName) return undefined;
    
    const ext = path.extname(fileName).toLowerCase();
    const mimeTypes: Record<string, string> = {
      '.txt': 'text/plain',
      '.html': 'text/html',
      '.pdf': 'application/pdf',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      '.rtf': 'application/rtf'
    };
    
    return mimeTypes[ext];
  }

  /**
   * Generate unique document ID
   */
  private generateDocumentId(text: string, fileName?: string): string {
    const content = `${text.substring(0, 100)}${fileName || ''}${Date.now()}`;
    return createHash('md5').update(content).digest('hex');
  }

  /**
   * Process multiple documents in batch
   */
  async processDocuments(files: (File | Buffer)[], fileNames?: string[]): Promise<ProcessedDocument[]> {
    const results: ProcessedDocument[] = [];
    
    for (let i = 0; i < files.length; i++) {
      try {
        const fileName = fileNames?.[i];
        const result = await this.processDocument(files[i], fileName);
        results.push(result);
      } catch (error) {
        console.error(`Error processing document ${i}:`, error);
        // Continue processing other documents
      }
    }
    
    return results;
  }

  /**
   * Get processing statistics
   */
  getProcessingStats(documents: ProcessedDocument[]): {
    totalDocuments: number;
    totalEntities: number;
    entityTypeCounts: Record<LegalEntityType, number>;
    documentTypeCounts: Record<LegalDocumentType, number>;
    averageConfidence: number;
  } {
    const entityTypeCounts: Record<LegalEntityType, number> = {} as any;
    const documentTypeCounts: Record<LegalDocumentType, number> = {} as any;
    let totalEntities = 0;
    let totalConfidence = 0;

    for (const doc of documents) {
      // Count entities by type
      for (const entity of doc.entities) {
        entityTypeCounts[entity.type] = (entityTypeCounts[entity.type] || 0) + 1;
        totalEntities++;
        totalConfidence += entity.confidence;
      }

      // Count documents by type
      documentTypeCounts[doc.classification.legalType] = 
        (documentTypeCounts[doc.classification.legalType] || 0) + 1;
    }

    return {
      totalDocuments: documents.length,
      totalEntities,
      entityTypeCounts,
      documentTypeCounts,
      averageConfidence: totalEntities > 0 ? totalConfidence / totalEntities : 0
    };
  }
}