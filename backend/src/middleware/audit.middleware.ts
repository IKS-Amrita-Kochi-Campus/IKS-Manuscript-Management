import { Request, Response, NextFunction } from 'express';
import { getAuditLogModel } from '../models/index.js';

// Sensitive fields to sanitize from logs
const sensitiveFields = ['password', 'passwordHash', 'token', 'refreshToken', 'accessToken', 'secret'];

/**
 * Extract clean IP address from request
 * Handles Cloudflare tunnel and standard reverse proxies
 */
function getClientIp(req: Request): string {
    // Check for Cloudflare header first (most reliable for Cloudflare tunnels)
    const cfConnectingIp = req.headers['cf-connecting-ip'] as string | undefined;
    if (cfConnectingIp) {
        return cfConnectingIp;
    }
    
    // Check for standard X-Forwarded-For header
    const xForwardedFor = req.headers['x-forwarded-for'] as string | undefined;
    if (xForwardedFor) {
        // X-Forwarded-For can contain multiple IPs, take the first one (client IP)
        const ips = xForwardedFor.split(',').map(ip => ip.trim());
        return ips[0];
    }
    
    // Fallback to Express req.ip
    let ip = req.ip || req.socket.remoteAddress || 'unknown';
    
    // Remove IPv4-mapped IPv6 prefix
    if (ip && ip.startsWith('::ffff:')) {
        ip = ip.substring(7); // Remove '::ffff:' prefix
    }
    
    return ip;
}

/**
 * Sanitize object by removing sensitive fields
 */
function sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
    if (!obj || typeof obj !== 'object') return obj;

    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(obj)) {
        if (sensitiveFields.some((field) => key.toLowerCase().includes(field.toLowerCase()))) {
            sanitized[key] = '[REDACTED]';
        } else if (typeof value === 'object' && value !== null) {
            sanitized[key] = sanitizeObject(value as Record<string, unknown>);
        } else {
            sanitized[key] = value;
        }
    }

    return sanitized;
}

/**
 * Determine action category from path and method
 */
function getActionCategory(path: string, method: string): string {
    if (path.includes('/auth')) return 'authentication';
    if (path.includes('/users')) return 'user_management';
    if (path.includes('/manuscripts')) return 'manuscript_management';
    if (path.includes('/access')) return 'access_control';
    if (path.includes('/admin')) return 'admin_operations';
    if (path.includes('/files') || path.includes('/upload') || path.includes('/download')) return 'file_operations';
    return 'system';
}

/**
 * Determine action from path and method
 */
function getAction(path: string, method: string): string {
    const pathParts = path.split('/').filter(Boolean);
    const resource = pathParts[1] || 'unknown';

    const methodActions: Record<string, string> = {
        GET: 'view',
        POST: 'create',
        PUT: 'update',
        PATCH: 'update',
        DELETE: 'delete',
    };

    const action = methodActions[method] || 'access';
    return `${action}_${resource}`;
}

/**
 * Audit logging middleware
 */
export function auditLog(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    // Capture original end function
    const originalEnd = res.end;
    const chunks: Buffer[] = [];

    // Override end to capture response
    res.end = function (chunk?: unknown, ...args: unknown[]) {
        if (chunk) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string));
        }

        const responseTime = Date.now() - startTime;

        // Log asynchronously
        setImmediate(async () => {
            try {
                const AuditLog = getAuditLogModel();

                await AuditLog.create({
                    sessionId: req.sessionId,
                    userId: req.user?.userId,
                    userEmail: req.user?.email,
                    userRole: req.user?.role,
                    action: getAction(req.path, req.method),
                    actionCategory: getActionCategory(req.path, req.method),
                    status: res.statusCode < 400 ? 'success' : 'failure',
                    resourceType: req.path.split('/')[2],
                    resourceId: req.params?.id,
                    method: req.method,
                    path: req.path,
                    query: Object.keys(req.query).length > 0 ? sanitizeObject(req.query as Record<string, unknown>) : undefined,
                    body: req.body && Object.keys(req.body).length > 0 ? sanitizeObject(req.body) : undefined,
                    statusCode: res.statusCode,
                    responseTime,
                    ipAddress: getClientIp(req),
                    userAgent: req.headers['user-agent'],
                    timestamp: new Date(),
                });
            } catch (error) {
                console.error('Audit log error:', error);
            }
        });

        return originalEnd.call(this, chunk, ...args) as Response;
    };

    next();
}

/**
 * Log custom action
 */
export async function logAction(data: {
    userId?: string;
    userEmail?: string;
    userRole?: string;
    action: string;
    actionCategory: string;
    status: 'success' | 'failure';
    resourceType?: string;
    resourceId?: string;
    resourceName?: string;
    ipAddress: string;
    userAgent?: string;
    metadata?: Record<string, unknown>;
}): Promise<void> {
    try {
        const AuditLog = getAuditLogModel();

        await AuditLog.create({
            ...data,
            method: 'CUSTOM',
            path: 'N/A',
            timestamp: new Date(),
        });
    } catch (error) {
        console.error('Audit log error:', error);
    }
}
