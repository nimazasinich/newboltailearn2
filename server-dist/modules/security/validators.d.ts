import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';
/**
 * Validation schemas for different endpoints
 */
export declare const schemas: {
    login: z.ZodObject<{
        username: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
    register: z.ZodObject<{
        username: z.ZodString;
        email: z.ZodString;
        password: z.ZodString;
        role: z.ZodOptional<z.ZodEnum<{
            viewer: "viewer";
            trainer: "trainer";
            admin: "admin";
        }>>;
    }, z.core.$strip>;
    updateProfile: z.ZodObject<{
        username: z.ZodOptional<z.ZodString>;
        email: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    changePassword: z.ZodObject<{
        currentPassword: z.ZodString;
        newPassword: z.ZodString;
    }, z.core.$strip>;
    createModel: z.ZodObject<{
        name: z.ZodString;
        type: z.ZodEnum<{
            dora: "dora";
            "qr-adaptor": "qr-adaptor";
            "persian-bert": "persian-bert";
        }>;
        dataset_id: z.ZodOptional<z.ZodString>;
        config: z.ZodOptional<z.ZodObject<{
            learning_rate: z.ZodOptional<z.ZodNumber>;
            batch_size: z.ZodOptional<z.ZodNumber>;
            epochs: z.ZodOptional<z.ZodNumber>;
            optimizer: z.ZodOptional<z.ZodEnum<{
                adam: "adam";
                sgd: "sgd";
                rmsprop: "rmsprop";
            }>>;
        }, z.core.$strip>>;
    }, z.core.$strip>;
    updateModel: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            idle: "idle";
            training: "training";
            completed: "completed";
            failed: "failed";
            paused: "paused";
        }>>;
        accuracy: z.ZodOptional<z.ZodNumber>;
        loss: z.ZodOptional<z.ZodNumber>;
        current_epoch: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    createDataset: z.ZodObject<{
        name: z.ZodString;
        type: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        source: z.ZodString;
        huggingface_id: z.ZodOptional<z.ZodString>;
        samples: z.ZodOptional<z.ZodNumber>;
        size_mb: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    updateDataset: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        description: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodEnum<{
            error: "error";
            idle: "idle";
            downloading: "downloading";
            processing: "processing";
            ready: "ready";
        }>>;
    }, z.core.$strip>;
    startTraining: z.ZodObject<{
        model_id: z.ZodNumber;
        dataset_id: z.ZodString;
        config: z.ZodObject<{
            epochs: z.ZodNumber;
            batch_size: z.ZodNumber;
            learning_rate: z.ZodNumber;
            validation_split: z.ZodOptional<z.ZodNumber>;
            early_stopping: z.ZodOptional<z.ZodBoolean>;
            patience: z.ZodOptional<z.ZodNumber>;
        }, z.core.$strip>;
    }, z.core.$strip>;
    pagination: z.ZodObject<{
        page: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
        limit: z.ZodOptional<z.ZodPipe<z.ZodString, z.ZodTransform<number, string>>>;
        sort: z.ZodOptional<z.ZodString>;
        order: z.ZodOptional<z.ZodEnum<{
            asc: "asc";
            desc: "desc";
        }>>;
    }, z.core.$strip>;
    search: z.ZodObject<{
        q: z.ZodString;
        type: z.ZodOptional<z.ZodString>;
        status: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
};
/**
 * Generic validation middleware factory
 */
export declare function validate(schema: z.ZodSchema): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Validate query parameters
 */
export declare function validateQuery(schema: z.ZodSchema): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Validate URL parameters
 */
export declare function validateParams(schema: z.ZodSchema): (req: Request, res: Response, next: NextFunction) => Promise<void>;
/**
 * Sanitize output to prevent XSS
 */
export declare function sanitizeOutput(data: any): any;
/**
 * Middleware to sanitize response data
 */
export declare function sanitizeResponse(req: Request, res: Response, next: NextFunction): void;
//# sourceMappingURL=validators.d.ts.map