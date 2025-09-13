import jwt from 'jsonwebtoken';
/**
 * JWT Authentication Middleware
 * Verifies JWT token from Authorization header and adds user info to request
 */
export function requireAuth(req, res, next) {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
            res.status(401).json({ error: 'Authorization header is required' });
            return;
        }
        const token = authHeader.split(' ')[1]; // Extract token from "Bearer <token>"
        if (!token) {
            res.status(401).json({ error: 'Token is required' });
            return;
        }
        const jwtSecret = process.env.JWT_SECRET;
        if (!jwtSecret) {
            console.error('JWT_SECRET environment variable is not set');
            res.status(500).json({ error: 'Server configuration error' });
            return;
        }
        // Verify and decode the token
        const decoded = jwt.verify(token, jwtSecret);
        // Add user info to request object
        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role,
            email: decoded.email
        };
        next();
    }
    catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(403).json({ error: 'Invalid token' });
        }
        else if (error instanceof jwt.TokenExpiredError) {
            res.status(403).json({ error: 'Token has expired' });
        }
        else {
            console.error('Authentication error:', error);
            res.status(500).json({ error: 'Authentication failed' });
        }
    }
}
/**
 * Role-based authorization middleware
 * Checks if user has required role
 */
export function requireRole(requiredRole) {
    return (req, res, next) => {
        if (!req.user) {
            res.status(401).json({ error: 'Authentication required' });
            return;
        }
        const userRole = req.user.role;
        const roleHierarchy = {
            'viewer': 1,
            'trainer': 2,
            'admin': 3
        };
        const userRoleLevel = roleHierarchy[userRole] || 0;
        const requiredRoleLevel = roleHierarchy[requiredRole] || 0;
        if (userRoleLevel < requiredRoleLevel) {
            res.status(403).json({
                error: 'Insufficient permissions',
                required: requiredRole,
                current: userRole
            });
            return;
        }
        next();
    };
}
/**
 * Generate JWT token for user
 */
export function generateToken(user) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not set');
    }
    const payload = {
        id: user.id,
        username: user.username,
        role: user.role,
        email: user.email
    };
    const options = {
        expiresIn: '24h', // Token expires in 24 hours
        issuer: 'persian-legal-ai',
        audience: 'persian-legal-ai-users'
    };
    return jwt.sign(payload, jwtSecret, options);
}
/**
 * Verify token without middleware (for manual verification)
 */
export function verifyToken(token) {
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
        throw new Error('JWT_SECRET environment variable is not set');
    }
    return jwt.verify(token, jwtSecret);
}
