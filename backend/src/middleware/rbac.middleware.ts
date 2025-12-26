import { Request, Response, NextFunction } from 'express';

// Define UserRole type locally since we're using PostgreSQL now
type UserRole = 'VISITOR' | 'USER' | 'OWNER' | 'REVIEWER' | 'ADMIN';

// Role hierarchy (higher number = more permissions)
const roleHierarchy: Record<UserRole, number> = {
    VISITOR: 0,
    USER: 1,
    OWNER: 2,
    REVIEWER: 3,
    ADMIN: 4,
};

/**
 * Require specific role(s)
 */
export function requireRole(...allowedRoles: UserRole[]) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
                code: 'AUTH_REQUIRED',
            });
            return;
        }

        const userRole = req.user.role as UserRole;

        if (!allowedRoles.includes(userRole)) {
            res.status(403).json({
                success: false,
                error: 'Insufficient permissions',
                code: 'FORBIDDEN',
            });
            return;
        }

        next();
    };
}

/**
 * Require minimum role level
 */
export function requireMinRole(minRole: UserRole) {
    return (req: Request, res: Response, next: NextFunction): void => {
        if (!req.user) {
            res.status(401).json({
                success: false,
                error: 'Authentication required',
                code: 'AUTH_REQUIRED',
            });
            return;
        }

        const userRole = req.user.role as UserRole;
        const userLevel = roleHierarchy[userRole];
        const requiredLevel = roleHierarchy[minRole];

        if (userLevel < requiredLevel) {
            res.status(403).json({
                success: false,
                error: 'Insufficient permissions',
                code: 'FORBIDDEN',
            });
            return;
        }

        next();
    };
}

// Convenience middleware
export const requireAdmin = requireRole('ADMIN');
export const requireReviewer = requireMinRole('REVIEWER');
export const requireOwner = requireMinRole('OWNER');
export const requireUser = requireMinRole('USER');

// Alias for backwards compatibility
export const requireExactRole = requireRole;

/**
 * Check if user has higher or equal role
 */
export function hasMinRole(userRole: UserRole, minRole: UserRole): boolean {
    return roleHierarchy[userRole] >= roleHierarchy[minRole];
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: UserRole): boolean {
    return userRole === 'ADMIN';
}

/**
 * Check if user is reviewer or admin
 */
export function isReviewer(userRole: UserRole): boolean {
    return roleHierarchy[userRole] >= roleHierarchy.REVIEWER;
}
