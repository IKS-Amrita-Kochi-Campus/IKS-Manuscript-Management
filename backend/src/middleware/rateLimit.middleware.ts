import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { Request, Response } from 'express';

// Helper to get client IP (handles proxies)
const getClientIp = (req: Request): string => {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
        return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket.remoteAddress || 'unknown';
};

/**
 * General API rate limiter - 100 requests per minute per IP
 */
export const apiLimiter = rateLimit({
    windowMs: config.rateLimit.windowMs,
    max: config.rateLimit.maxRequests,
    message: {
        success: false,
        error: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
    skip: (req: Request) => {
        // Skip rate limiting for health checks
        return req.path === '/health' || req.path === '/api/health';
    },
});

/**
 * Stricter rate limiter for login attempts - 5 attempts per 15 minutes
 */
export const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts
    message: {
        success: false,
        error: 'Too many login attempts, please try again after 15 minutes',
        code: 'LOGIN_RATE_LIMIT',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
    skipSuccessfulRequests: false, // Count all requests, not just failed ones
});

/**
 * Rate limiter for registration - 3 per hour per IP
 */
export const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 registrations per hour per IP
    message: {
        success: false,
        error: 'Too many registration attempts, please try again later',
        code: 'REGISTER_RATE_LIMIT',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
});

/**
 * Rate limiter for password reset requests - 3 per hour
 */
export const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 attempts per hour
    message: {
        success: false,
        error: 'Too many password reset requests, please try again later',
        code: 'RESET_RATE_LIMIT',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
});

/**
 * Rate limiter for file downloads - 50 downloads per hour
 */
export const downloadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 downloads per hour
    message: {
        success: false,
        error: 'Download limit exceeded, please try again later',
        code: 'DOWNLOAD_RATE_LIMIT',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
});

/**
 * Rate limiter for file uploads - 20 uploads per hour
 */
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // 20 uploads per hour
    message: {
        success: false,
        error: 'Upload limit exceeded, please try again later',
        code: 'UPLOAD_RATE_LIMIT',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
});

/**
 * Very strict limiter for sensitive operations (e.g., password change, email change)
 */
export const sensitiveOpLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 attempts per hour
    message: {
        success: false,
        error: 'Too many attempts for this sensitive operation, please try again later',
        code: 'SENSITIVE_OP_RATE_LIMIT',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
});

/**
 * Burst limiter for DDoS protection - 30 requests per 10 seconds
 */
export const burstLimiter = rateLimit({
    windowMs: 10 * 1000, // 10 seconds
    max: 30, // 30 requests per 10 seconds
    message: {
        success: false,
        error: 'Request rate too high, please slow down',
        code: 'BURST_RATE_LIMIT',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
});

/**
 * Search/query limiter - 30 searches per minute
 */
export const searchLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 30, // 30 searches per minute
    message: {
        success: false,
        error: 'Too many search requests, please try again later',
        code: 'SEARCH_RATE_LIMIT',
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: getClientIp,
});
