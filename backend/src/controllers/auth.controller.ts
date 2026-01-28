import { Request, Response } from 'express';
import * as authService from '../services/auth.service.js';
import { RegisterInput, LoginInput } from '../utils/validators.js';

/**
 * Register new user
 */
export async function register(req: Request, res: Response): Promise<void> {
    const data = req.body as RegisterInput;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await authService.register(data, ipAddress, userAgent);

    if (!result.success) {
        res.status(400).json({
            success: false,
            error: result.error,
            code: result.code,
        });
        return;
    }

    res.status(201).json({
        success: true,
        message: 'Registration successful. You can now login.',
        user: result.user,
    });
}

/**
 * Login user
 */
export async function login(req: Request, res: Response): Promise<void> {
    const data = req.body as LoginInput;
    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await authService.login(data, ipAddress, userAgent);

    if (!result.success) {
        res.status(401).json({
            success: false,
            error: result.error,
            code: result.code,
        });
        return;
    }

    res.json({
        success: true,
        user: result.user,
        tokens: result.tokens,
    });
}

/**
 * Logout user
 */
export async function logout(req: Request, res: Response): Promise<void> {
    if (!req.sessionId) {
        res.status(400).json({
            success: false,
            error: 'No active session',
        });
        return;
    }

    await authService.logout(req.sessionId);

    res.json({
        success: true,
        message: 'Logged out successfully',
    });
}

/**
 * Refresh access token
 */
export async function refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body;

    if (!refreshToken) {
        res.status(400).json({
            success: false,
            error: 'Refresh token is required',
            code: 'MISSING_REFRESH_TOKEN',
        });
        return;
    }

    const ipAddress = req.ip || 'unknown';
    const userAgent = req.headers['user-agent'] || 'unknown';

    const result = await authService.refreshToken(refreshToken, ipAddress, userAgent);

    if (!result.success) {
        res.status(401).json({
            success: false,
            error: result.error,
            code: result.code,
        });
        return;
    }

    res.json({
        success: true,
        tokens: result.tokens,
    });
}

/**
 * Verify email
 */
export async function verifyEmail(req: Request, res: Response): Promise<void> {
    const { token } = req.params;

    const result = await authService.verifyEmail(token);

    if (!result.success) {
        res.status(400).json({
            success: false,
            error: result.error,
            code: result.code,
        });
        return;
    }

    res.json({
        success: true,
        message: 'Email verified successfully',
    });
}

/**
 * Request password reset
 */
export async function forgotPassword(req: Request, res: Response): Promise<void> {
    const { email, phone } = req.body;

    await authService.requestPasswordReset(email, phone);

    // Always return success (security best practice)
    res.json({
        success: true,
        message: 'If the account exists, the request has been sent to the administrator.',
    });
}

/**
 * Reset password
 */
export async function resetPassword(req: Request, res: Response): Promise<void> {
    const { token, password } = req.body;

    const result = await authService.resetPassword(token, password);

    if (!result.success) {
        res.status(400).json({
            success: false,
            error: result.error,
            code: result.code,
        });
        return;
    }

    res.json({
        success: true,
        message: 'Password reset successfully',
    });
}
