import jwt, { SignOptions, JwtPayload } from 'jsonwebtoken';
import { config } from '../config/index.js';

export interface TokenPayload extends JwtPayload {
    userId: string;
    email: string;
    role: string;
    sessionId: string;
}

export interface TokenPair {
    accessToken: string;
    refreshToken: string;
}

/**
 * Parse duration string to seconds
 */
function parseDuration(duration: string): number {
    const match = duration.match(/^(\d+)(s|m|h|d)$/);
    if (!match) return 900; // Default 15 minutes

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
        case 's': return value;
        case 'm': return value * 60;
        case 'h': return value * 3600;
        case 'd': return value * 86400;
        default: return 900;
    }
}

/**
 * Generates an access token
 */
export function generateAccessToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    const options: SignOptions = {
        expiresIn: config.jwt.accessExpiresIn as unknown as number,
        issuer: 'manuscript-archive',
        audience: 'manuscript-users',
    };

    return jwt.sign(payload, config.jwt.accessSecret, options);
}

/**
 * Generates a refresh token
 */
export function generateRefreshToken(payload: Omit<TokenPayload, 'iat' | 'exp'>): string {
    const options: SignOptions = {
        expiresIn: config.jwt.refreshExpiresIn as unknown as number,
        issuer: 'manuscript-archive',
        audience: 'manuscript-users',
    };

    return jwt.sign(payload, config.jwt.refreshSecret, options);
}

/**
 * Generates both access and refresh tokens
 */
export function generateTokenPair(payload: Omit<TokenPayload, 'iat' | 'exp'>): TokenPair {
    return {
        accessToken: generateAccessToken(payload),
        refreshToken: generateRefreshToken(payload),
    };
}

/**
 * Verifies an access token
 */
export function verifyAccessToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.accessSecret, {
        issuer: 'manuscript-archive',
        audience: 'manuscript-users',
    }) as TokenPayload;
}

/**
 * Verifies a refresh token
 */
export function verifyRefreshToken(token: string): TokenPayload {
    return jwt.verify(token, config.jwt.refreshSecret, {
        issuer: 'manuscript-archive',
        audience: 'manuscript-users',
    }) as TokenPayload;
}

/**
 * Decodes a token without verification
 */
export function decodeToken(token: string): TokenPayload | null {
    try {
        return jwt.decode(token) as TokenPayload;
    } catch {
        return null;
    }
}

/**
 * Gets token expiration time in seconds
 */
export function getAccessTokenExpiry(): number {
    return parseDuration(config.jwt.accessExpiresIn);
}

export function getRefreshTokenExpiry(): number {
    return parseDuration(config.jwt.refreshExpiresIn);
}
