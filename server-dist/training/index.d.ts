import Database from "better-sqlite3";
type DB = Database.Database;
/** فکتوری: موتور واقعی + یکپارچگی با DB و ثبت پیشرفت/چک‌پوینت/لاگ */
export declare function getRealTrainingEngine(db: DB): {
    /** آموزش یک مدل با دیتاست */
    train(modelId: number, datasetId: string, config: {
        epochs?: number;
        batch_size?: number;
        learning_rate?: number;
        validation_split?: number;
    }, progressCallback: (p: any) => void): Promise<void>;
    /** توقف آموزش جاری (ایمن) */
    stop(): void;
    /** آزادسازی منابع */
    dispose(): void;
};
export default getRealTrainingEngine;
//# sourceMappingURL=index.d.ts.map