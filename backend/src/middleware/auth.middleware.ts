import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken, TokenPayload } from '../utils/jwt.js';
import { userRepo, sessionRepo } from '../repositories/postgres.repository.js';

// Extend Express Request type
declare global {
    namespace Express {
        interface Request {
            user?: TokenPayload & { userId: string };
            sessionId?: string;
        }
    }
}

/**
 * Authentication middleware
 * Verifies JWT token and attaches user info to request
 */
export async function authenticate(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            error: 'Authentication token required',
            code: 'AUTH_REQUIRED',
        });
        return;
    }

    const token = authHeader.substring(7);

    // Verify token
    try {
        const decoded = verifyAccessToken(token);
        if (!decoded) {
            res.status(401).json({
                success: false,
                error: 'Invalid or expired token',
                code: 'TOKEN_INVALID',
            });
            return;
        }

        // Verify session is still valid
        const session = await sessionRepo.findValidByUserId(decoded.userId);

        if (!session) {
            res.status(401).json({
                success: false,
                error: 'Session expired or invalidated',
                code: 'SESSION_INVALID',
            });
            return;
        }

        // Check if user is still active
        const user = await userRepo.findById(decoded.userId);
        if (!user || !user.is_active) {
            res.status(401).json({
                success: false,
                error: 'Account inactive or not found',
                code: 'ACCOUNT_INACTIVE',
            });
            return;
        }

        // Attach user info to request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: user.role,
        };
        req.sessionId = session.id;

        next();
    } catch (error: any) {
        if (error.name === 'TokenExpiredError') {
            res.status(401).json({
                success: false,
                error: 'Token expired',
                code: 'TOKEN_EXPIRED',
            });
            return;
        }
        res.status(401).json({
            success: false,
            error: 'Invalid token',
            code: 'TOKEN_INVALID',
        });
        return;
    }
}

/**
 * Optional authentication middleware
 * Attaches user info if token is present, but doesn't require it
 */
export async function optionalAuth(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        next();
        return;
    }

    const token = authHeader.substring(7);
    const decoded = verifyAccessToken(token);

    if (decoded) {
        const session = await sessionRepo.findValidByUserId(decoded.userId);

        if (session) {
            const user = await userRepo.findById(decoded.userId);
            if (user && user.is_active) {
                req.user = {
                    userId: decoded.userId,
                    email: decoded.email,
                    role: user.role,
                };
                req.sessionId = session.id;
            }
        }
    }

    next();
}

/**
 * Require email verification
 */
export async function requireEmailVerified(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'Authentication required',
            code: 'AUTH_REQUIRED',
        });
        return;
    }

    const user = await userRepo.findById(req.user.userId);

    if (!user || !user.is_email_verified) {
        res.status(403).json({
            success: false,
            error: 'Email verification required',
            code: 'EMAIL_NOT_VERIFIED',
        });
        return;
    }

    next();
}

/**
 * Require identity verification
 */
export async function requireIdentityVerified(
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> {
    if (!req.user) {
        res.status(401).json({
            success: false,
            error: 'Authentication required',
            code: 'AUTH_REQUIRED',
        });
        return;
    }

    const user = await userRepo.findById(req.user.userId);

    if (!user || user.verification_status !== 'VERIFIED') {
        res.status(403).json({
            success: false,
            error: 'Identity verification required',
            code: 'IDENTITY_NOT_VERIFIED',
        });
        return;
    }

    next();
}
