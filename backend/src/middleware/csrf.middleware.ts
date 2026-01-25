import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

// CSRF Protection Middleware using Double Submit Cookie Pattern

// Cookie options for CSRF - must work across subdomains (ikskochi.org -> api.ikskochi.org)
export const csrfCookieOptions = {
    httpOnly: true, // Secure, JS cannot read it directly (prevents XSS reading the cookie)
    // For cross-origin cookies (different subdomains), we need:
    // - SameSite: 'none' + Secure: true in production
    // - SameSite: 'lax' for development
    secure: process.env.NODE_ENV === 'production', // Only send over HTTPS in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' as const : 'lax' as const,
    path: '/',
    // Allow cookie to be shared across subdomains (e.g., ikskochi.org and api.ikskochi.org)
    domain: process.env.COOKIE_DOMAIN || undefined, // Set to '.ikskochi.org' in production
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
};

/**
 * Middleware to Generate and Set CSRF Token
 * Usage: Attach to a GET route (e.g., /auth/csrf)
 */
export const generateCsrfToken = (req: Request, res: Response) => {
    const csrfToken = uuidv4();

    // Set token in a cookie
    res.cookie('csrf_token', csrfToken, csrfCookieOptions);

    // Send token in JSON response (so client can read it and send it back in header)
    res.json({ csrfToken });
};

/**
 * Middleware to Validate CSRF Token
 * Usage: Attach globally or to specific routes (POST, PUT, DELETE, PATCH)
 */
export const validateCsrfToken = (req: Request, res: Response, next: NextFunction) => {
    // Skip CSRF check for safe methods
    if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) {
        return next();
    }

    // Skip CSRF check for auth endpoints that don't modify existing sessions
    // These endpoints create new sessions or don't require session state
    const exemptPaths = [
        '/api/auth/login',
        '/api/auth/register',
        '/api/auth/refresh',
        '/api/auth/forgot-password',
        '/api/auth/reset-password',
        '/api/auth/verify-email',
        '/auth/login',
        '/auth/register',
        '/auth/refresh',
        '/auth/forgot-password',
        '/auth/reset-password',
        '/auth/verify-email',
    ];

    if (exemptPaths.some(path => req.path.includes(path) || req.originalUrl.includes(path))) {
        return next();
    }

    const tokenFromHeader = req.headers['x-csrf-token'] as string;
    const tokenFromCookie = req.cookies['csrf_token'];

    if (!tokenFromCookie || !tokenFromHeader || tokenFromCookie !== tokenFromHeader) {
        return res.status(403).json({
            success: false,
            error: 'Invalid or missing CSRF token',
            code: 'CSRF_ERROR'
        });
    }

    next();
};
