import { Request, Response } from 'express';
import { getManuscriptModel, getAuditLogModel } from '../models/index.js';
import {
    userRepo,
    accessRequestRepo,
    verificationDocRepo
} from '../repositories/postgres.repository.js';
import { sessionRepo } from '../repositories/postgres.repository.js';

/**
 * Get all users
 */
export async function getUsers(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const role = req.query.role as string;
    const status = req.query.status as string;
    const search = req.query.search as string;

    const { users, total } = await userRepo.findAll({
        page,
        limit,
        role,
        isActive: status === 'active' ? true : status === 'inactive' ? false : undefined,
        search,
    });

    // Remove sensitive fields
    const safeUsers = users.map(({ password_hash, email_verification_token, password_reset_token, ...user }) => user);

    res.json({
        success: true,
        users: safeUsers,
        pagination: {
            total,
            page,
            totalPages: Math.ceil(total / limit),
        },
    });
}

/**
 * Get user by ID
 */
export async function getUserById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;

    const user = await userRepo.findById(id);

    if (!user) {
        res.status(404).json({
            success: false,
            error: 'User not found',
            code: 'NOT_FOUND',
        });
        return;
    }

    // Remove sensitive fields
    const { password_hash, email_verification_token, password_reset_token, ...safeUser } = user;

    // Get counts
    const Manuscript = getManuscriptModel();
    const manuscriptCount = await Manuscript.countDocuments({ ownerId: id });
    const accessRequestCount = await accessRequestRepo.findByRequester(id);

    res.json({
        success: true,
        user: {
            ...safeUser,
            _count: {
                ownedManuscripts: manuscriptCount,
                accessRequests: accessRequestCount.length,
            },
        },
    });
}

/**
 * Update user role
 */
export async function updateUserRole(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { role } = req.body;

    const user = await userRepo.update(id, { role });

    if (!user) {
        res.status(404).json({
            success: false,
            error: 'User not found',
            code: 'NOT_FOUND',
        });
        return;
    }

    res.json({
        success: true,
        message: 'User role updated',
        user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
        },
    });
}

/**
 * Update user status (activate/deactivate)
 */
export async function updateUserStatus(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await userRepo.update(id, { is_active: isActive });

    if (!user) {
        res.status(404).json({
            success: false,
            error: 'User not found',
            code: 'NOT_FOUND',
        });
        return;
    }

    // If deactivating, invalidate all sessions
    if (!isActive) {
        await sessionRepo.invalidateAllForUser(id);
    }

    res.json({
        success: true,
        message: isActive ? 'User activated' : 'User deactivated',
        user: {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            is_active: user.is_active,
        },
    });
}

/**
 * Get pending verification requests
 */
export async function getVerificationRequests(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { documents, total } = await verificationDocRepo.findAllPending(page, limit);

    // Populate user info
    const docsWithUsers = await Promise.all(
        documents.map(async (doc) => {
            const user = await userRepo.findById(doc.user_id);
            return {
                ...doc,
                user: user ? {
                    id: user.id,
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                    institution: user.institution,
                } : null,
            };
        })
    );

    res.json({
        success: true,
        documents: docsWithUsers,
        pagination: {
            total,
            page,
            totalPages: Math.ceil(total / limit),
        },
    });
}

/**
 * Verify user identity
 */
export async function verifyIdentity(req: Request, res: Response): Promise<void> {
    const { userId } = req.params;
    const { status, reviewNotes } = req.body;

    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    // Update verification document
    await verificationDocRepo.updateByUserId(userId, status, { review_notes: reviewNotes });

    // Update user verification status
    const updateData: Record<string, unknown> = {
        verification_status: status,
    };

    if (status === 'VERIFIED') {
        updateData.verified_at = new Date();
        updateData.verified_by = req.user.userId;
        updateData.role = 'USER'; // Upgrade from VISITOR
    }

    const user = await userRepo.update(userId, updateData);

    res.json({
        success: true,
        message: status === 'VERIFIED' ? 'Identity verified' : 'Identity verification rejected',
        user: user ? {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            verification_status: user.verification_status,
            role: user.role,
        } : null,
    });
}

/**
 * Get all manuscripts (admin view)
 */
export async function getAllManuscripts(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const status = req.query.status as string;

    const Manuscript = getManuscriptModel();

    const query: Record<string, unknown> = {
        deletedAt: { $exists: false },
    };

    if (status) query.status = status;

    const [manuscripts, total] = await Promise.all([
        Manuscript.find(query)
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .select('-files.encryptedPath -files.encryptionKeyId')
            .lean(),
        Manuscript.countDocuments(query),
    ]);

    res.json({
        success: true,
        manuscripts,
        pagination: {
            total,
            page,
            totalPages: Math.ceil(total / limit),
        },
    });
}

/**
 * Update manuscript status
 */
export async function updateManuscriptStatus(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const { id } = req.params;
    const { status, reviewNotes } = req.body;

    const Manuscript = getManuscriptModel();

    const updateData: Record<string, unknown> = {
        status,
        reviewNotes,
        reviewedBy: req.user.userId,
    };

    if (status === 'published') {
        updateData.publishedAt = new Date();
    }

    const manuscript = await Manuscript.findByIdAndUpdate(id, updateData, { new: true });

    if (!manuscript) {
        res.status(404).json({
            success: false,
            error: 'Manuscript not found',
            code: 'NOT_FOUND',
        });
        return;
    }

    res.json({
        success: true,
        message: 'Manuscript status updated',
        manuscript,
    });
}

/**
 * Get audit logs
 */
export async function getAuditLogs(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const userId = req.query.userId as string;
    const action = req.query.action as string;
    const category = req.query.category as string;
    const startDate = req.query.startDate as string;
    const endDate = req.query.endDate as string;

    const AuditLog = getAuditLogModel();

    const query: Record<string, unknown> = {};

    if (userId) query.userId = userId;
    if (action) query.action = { $regex: action, $options: 'i' };
    if (category) query.actionCategory = category;
    if (startDate || endDate) {
        query.timestamp = {};
        if (startDate) (query.timestamp as Record<string, unknown>).$gte = new Date(startDate);
        if (endDate) (query.timestamp as Record<string, unknown>).$lte = new Date(endDate);
    }

    const [logs, total] = await Promise.all([
        AuditLog.find(query)
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        AuditLog.countDocuments(query),
    ]);

    res.json({
        success: true,
        logs,
        pagination: {
            total,
            page,
            totalPages: Math.ceil(total / limit),
        },
    });
}

/**
 * Get platform statistics
 */
export async function getStatistics(req: Request, res: Response): Promise<void> {
    const Manuscript = getManuscriptModel();

    const [
        totalUsers,
        activeUsers,
        verifiedUsers,
        totalManuscripts,
        publishedManuscripts,
        pendingRequests,
        pendingVerifications,
    ] = await Promise.all([
        userRepo.count(),
        userRepo.count({ is_active: true }),
        userRepo.count({ verification_status: 'VERIFIED' }),
        Manuscript.countDocuments({ deletedAt: { $exists: false } }),
        Manuscript.countDocuments({ status: 'published', deletedAt: { $exists: false } }),
        accessRequestRepo.countPending(),
        verificationDocRepo.countPending(),
    ]);

    res.json({
        success: true,
        statistics: {
            users: {
                total: totalUsers,
                active: activeUsers,
                verified: verifiedUsers,
            },
            manuscripts: {
                total: totalManuscripts,
                published: publishedManuscripts,
            },
            pending: {
                accessRequests: pendingRequests,
                verifications: pendingVerifications,
            },
        },
    });
}

/**
 * Get pending approvals count
 */
export async function getPendingApprovals(req: Request, res: Response): Promise<void> {
    const Manuscript = getManuscriptModel();

    const [accessRequests, verificationRequests, manuscriptReviews] = await Promise.all([
        accessRequestRepo.countPending(),
        verificationDocRepo.countPending(),
        Manuscript.countDocuments({ status: 'review', deletedAt: { $exists: false } }),
    ]);

    res.json({
        success: true,
        pending: {
            accessRequests,
            verificationRequests,
            manuscriptReviews,
            total: accessRequests + verificationRequests + manuscriptReviews,
        },
    });
}

/**
 * Get all access requests (admin view)
 */
export async function getAccessRequests(req: Request, res: Response): Promise<void> {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    const { requests, total } = await accessRequestRepo.findAll(page, limit);

    // Populate user and manuscript info
    const requestsWithDetails = await Promise.all(
        requests.map(async (request) => {
            const user = await userRepo.findById(request.requester_id);
            const Manuscript = getManuscriptModel();
            const manuscript = await Manuscript.findById(request.manuscript_id).select('title').lean();

            return {
                ...request,
                user: user ? {
                    email: user.email,
                    first_name: user.first_name,
                    last_name: user.last_name,
                } : null,
                manuscript: manuscript || { title: 'Unknown Manuscript' }
            };
        })
    );

    res.json({
        success: true,
        requests: requestsWithDetails,
        pagination: {
            total,
            page,
            totalPages: Math.ceil(total / limit),
        },
    });
}
