import Database from 'better-sqlite3';
/**
 * Data Service with fake/real data toggle and demo mode support
 */
export declare class DataService {
    private db;
    private useFakeData;
    private isDemoMode;
    constructor(db: Database.Database);
    /**
     * Get datasets (fake or real based on configuration)
     */
    getDatasets(limit?: number, offset?: number): any;
    /**
     * Get fake datasets for testing/demo
     */
    private getFakeDatasets;
    /**
     * Create dataset (blocked in demo mode)
     */
    createDataset(data: any): any;
    /**
     * Update dataset (blocked in demo mode)
     */
    updateDataset(id: string, updates: any): any;
    /**
     * Delete dataset (blocked in demo mode)
     */
    deleteDataset(id: string): {
        success: boolean;
        message: string;
    };
    /**
     * Get single dataset
     */
    getDataset(id: string): any;
    /**
     * Get models (with fake data support)
     */
    getModels(limit?: number, offset?: number): any;
    /**
     * Get fake models for testing/demo
     */
    private getFakeModels;
    /**
     * Start training (simulated in demo mode)
     */
    startTraining(modelId: number, config: any): {
        success: boolean;
        message: string;
        sessionId: string;
        modelId: number;
        config: any;
    };
    /**
     * Get training logs (with fake data support)
     */
    getTrainingLogs(modelId: number, limit?: number): any;
    /**
     * Get fake training logs
     */
    private getFakeTrainingLogs;
    /**
     * Check if in demo mode
     */
    isInDemoMode(): boolean;
    /**
     * Check if using fake data
     */
    isUsingFakeData(): boolean;
}
//# sourceMappingURL=dataService.d.ts.map