import { verifyToken } from '../../middleware/auth.js';
/**
 * Configure Socket.IO authentication
 */
export function configureSocketAuth(io) {
    // Authentication middleware for Socket.IO
    io.use(async (socket, next) => {
        try {
            // Get token from multiple sources (fixed extraction)
            const token = socket.handshake.auth?.token ||
                socket.handshake.headers?.authorization?.split(' ')[1] ||
                socket.handshake.query?.token;
            if (!token) {
                return next(new Error('Authentication required'));
            }
            // Verify token
            const decoded = verifyToken(token);
            // Attach user info to socket
            socket.userId = decoded.id;
            socket.username = decoded.username;
            socket.role = decoded.role;
            // Join user-specific room
            socket.join(`user:${decoded.id}`);
            // Join role-specific room
            socket.join(`role:${decoded.role}`);
            next();
        }
        catch (error) {
            console.error('Socket authentication failed:', error);
            next(new Error('Invalid token'));
        }
    });
    // Handle connection
    io.on('connection', (socket) => {
        console.log(`User ${socket.username} (ID: ${socket.userId}) connected via WebSocket`);
        // Send authentication success
        socket.emit('auth:success', {
            userId: socket.userId,
            username: socket.username,
            role: socket.role
        });
        // Handle disconnection
        socket.on('disconnect', () => {
            console.log(`User ${socket.username} (ID: ${socket.userId}) disconnected`);
        });
        // Handle errors
        socket.on('error', (error) => {
            console.error(`Socket error for user ${socket.username}:`, error);
        });
    });
}
/**
 * Emit event to specific user
 */
export function emitToUser(io, userId, event, data) {
    io.to(`user:${userId}`).emit(event, data);
}
/**
 * Emit event to users with specific role
 */
export function emitToRole(io, role, event, data) {
    io.to(`role:${role}`).emit(event, data);
}
/**
 * Broadcast event to all authenticated users except sender
 */
export function broadcastToAuthenticated(socket, event, data) {
    socket.broadcast.emit(event, data);
}
/**
 * Check if user has permission for socket event
 */
export function checkSocketPermission(socket, requiredRole) {
    const roleHierarchy = {
        'viewer': 1,
        'trainer': 2,
        'admin': 3
    };
    const userRoleLevel = roleHierarchy[socket.role || ''] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
    return userRoleLevel >= requiredRoleLevel;
}
/**
 * Socket event handler with permission check
 */
export function socketHandler(requiredRole, handler) {
    return (socket, ...args) => {
        if (!checkSocketPermission(socket, requiredRole)) {
            socket.emit('error', {
                message: 'Insufficient permissions for this operation',
                required: requiredRole,
                current: socket.role
            });
            return;
        }
        handler(socket, ...args);
    };
}
