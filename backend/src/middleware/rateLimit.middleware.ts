import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';

/**
 * General API rate limiter
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
});

/**
 * Stricter rate limiter for login attempts
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
});

/**
 * Rate limiter for registration
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
});

/**
 * Rate limiter for password reset requests
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
});

/**
 * Rate limiter for file downloads
 */
export const downloadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // 10 downloads per hour
    message: {
        success: false,
        error: 'Download limit exceeded, please try again later',
        code: 'DOWNLOAD_RATE_LIMIT',
    },
    standardHeaders: true,
    legacyHeaders: false,
});

/**
 * Rate limiter for file uploads
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
});
