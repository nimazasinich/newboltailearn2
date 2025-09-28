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
export type LegalEntityType = 'PERSON' | 'ORGANIZATION' | 'LAW' | 'ARTICLE' | 'CLAUSE' | 'DATE' | 'AMOUNT' | 'COURT' | 'CASE_NUMBER' | 'JUDGE' | 'LAWYER' | 'CONTRACT_PARTY' | 'LEGAL_TERM';
export type LegalDocumentType = 'CONTRACT' | 'COURT_DECISION' | 'LAW_TEXT' | 'LEGAL_OPINION' | 'NOTARY_DOCUMENT' | 'LEGAL_BRIEF' | 'REGULATION' | 'LEGAL_NOTICE' | 'OTHER';
export declare class PersianLegalProcessor {
    private legalTerms;
    private courtNames;
    private legalPatterns;
    constructor();
    private initializeLegalData;
    /**
     * Process a Persian legal document
     */
    processDocument(file: File | Buffer, fileName?: string): Promise<ProcessedDocument>;
    /**
     * Extract text from various file formats
     */
    private extractText;
    /**
     * Clean and normalize Persian text
     */
    private cleanText;
    /**
     * Extract legal entities from text
     */
    private extractLegalEntities;
    /**
     * Calculate confidence score for an entity
     */
    private calculateEntityConfidence;
    /**
     * Remove overlapping entities, keeping the one with higher confidence
     */
    private removeOverlappingEntities;
    /**
     * Classify document type
     */
    private classifyDocument;
    /**
     * Get category from legal document type
     */
    private getCategoryFromType;
    /**
     * Get subcategory from legal document type
     */
    private getSubcategoryFromType;
    /**
     * Create document metadata
     */
    private createMetadata;
    /**
     * Get MIME type from file name
     */
    private getMimeTypeFromFileName;
    /**
     * Generate unique document ID
     */
    private generateDocumentId;
    /**
     * Process multiple documents in batch
     */
    processDocuments(files: (File | Buffer)[], fileNames?: string[]): Promise<ProcessedDocument[]>;
    /**
     * Get processing statistics
     */
    getProcessingStats(documents: ProcessedDocument[]): {
        totalDocuments: number;
        totalEntities: number;
        entityTypeCounts: Record<LegalEntityType, number>;
        documentTypeCounts: Record<LegalDocumentType, number>;
        averageConfidence: number;
    };
}
//# sourceMappingURL=PersianLegalProcessor.d.ts.map