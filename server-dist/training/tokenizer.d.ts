/** توکنایزر ساده و واقعی فارسی با نرمال‌سازی و واژگان قابل رشد (Persist به دیسک) */
export declare class PersianTokenizer {
    private vocab;
    private invVocab;
    private maxLen;
    private vocabFile;
    private allowGrowth;
    constructor(opts?: {
        maxLen?: number;
        vocabFile?: string;
        allowGrowth?: boolean;
    });
    private initializeBaseVocabulary;
    private normalize;
    private ensureToken;
    /** برش/پدینگ به maxLen و نگاشت به آیدی‌ها */
    encode(text: string): number[];
    getVocabSize(): number;
    save(): void;
}
//# sourceMappingURL=tokenizer.d.ts.map