import { Server, Socket } from 'socket.io';
interface AuthenticatedSocket extends Socket {
    userId?: number;
    username?: string;
    role?: string;
}
/**
 * Configure Socket.IO authentication
 */
export declare function configureSocketAuth(io: Server): void;
/**
 * Emit event to specific user
 */
export declare function emitToUser(io: Server, userId: number, event: string, data: any): void;
/**
 * Emit event to users with specific role
 */
export declare function emitToRole(io: Server, role: string, event: string, data: any): void;
/**
 * Broadcast event to all authenticated users except sender
 */
export declare function broadcastToAuthenticated(socket: AuthenticatedSocket, event: string, data: any): void;
/**
 * Check if user has permission for socket event
 */
export declare function checkSocketPermission(socket: AuthenticatedSocket, requiredRole: string): boolean;
/**
 * Socket event handler with permission check
 */
export declare function socketHandler(requiredRole: string, handler: (socket: AuthenticatedSocket, ...args: any[]) => void): (socket: AuthenticatedSocket, ...args: any[]) => void;
export {};
//# sourceMappingURL=auth.d.ts.map