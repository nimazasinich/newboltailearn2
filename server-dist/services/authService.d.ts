import Database from 'better-sqlite3';
export interface User {
    id: number;
    username: string;
    email: string;
    role: string;
    created_at: string;
    last_login: string | null;
}
export interface LoginCredentials {
    username: string;
    password: string;
}
export interface RegisterData {
    username: string;
    email: string;
    password: string;
    role?: string;
}
export declare class AuthService {
    private db;
    constructor(database: Database.Database);
    /**
     * Authenticate user with username and password
     */
    authenticate(credentials: LoginCredentials): Promise<{
        user: User;
        token: string;
    } | null>;
    /**
     * Register a new user
     */
    register(userData: RegisterData): Promise<{
        user: User;
        token: string;
    } | null>;
    /**
     * Get user by ID
     */
    getUserById(id: number): User | null;
    /**
     * Update user profile
     */
    updateUser(id: number, updates: Partial<{
        username: string;
        email: string;
        role: string;
    }>): Promise<User | null>;
    /**
     * Change user password
     */
    changePassword(id: number, currentPassword: string, newPassword: string): Promise<boolean>;
    /**
     * Get all users (admin only)
     */
    getAllUsers(): User[];
    /**
     * Delete user (admin only)
     */
    deleteUser(id: number): boolean;
    /**
     * Validate user credentials
     */
    validateUser(username: string, password: string): Promise<User | null>;
    /**
     * Find user by username
     */
    findUserByUsername(username: string): Promise<User | null>;
    /**
     * Find user by email
     */
    findUserByEmail(email: string): Promise<User | null>;
    /**
     * Find user by ID
     */
    findUserById(id: number): Promise<User | null>;
    /**
     * Create new user
     */
    createUser(userData: RegisterData): Promise<User>;
    /**
     * Validate password for user
     */
    validatePassword(username: string, password: string): Promise<boolean>;
    /**
     * Update user password
     */
    updatePassword(userId: number, newPassword: string): Promise<void>;
    /**
     * Update last login timestamp
     */
    updateLastLogin(userId: number): void;
}
//# sourceMappingURL=authService.d.ts.map