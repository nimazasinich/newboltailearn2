import { Request, Response } from 'express';
import Database from 'better-sqlite3';
export declare class AuthController {
    private authService;
    constructor(db: Database.Database);
    login(req: Request, res: Response): Promise<void>;
    register(req: Request, res: Response): Promise<void>;
    refreshToken(req: Request, res: Response): Promise<void>;
    logout(req: Request, res: Response): Promise<void>;
    getCurrentUser(req: Request, res: Response): Promise<void>;
    getProfile(req: Request, res: Response): Promise<void>;
    updateProfile(req: Request, res: Response): Promise<void>;
    changePassword(req: Request, res: Response): Promise<void>;
}
//# sourceMappingURL=auth.controller.d.ts.map