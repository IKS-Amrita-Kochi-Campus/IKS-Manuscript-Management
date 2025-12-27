import { v4 as uuidv4 } from 'uuid';
import { getManuscriptModel } from '../models/index.js';
import { userRepo, accessRequestRepo, manuscriptAccessRepo } from '../repositories/postgres.repository.js';

type AccessLevel = 'VIEW_METADATA' | 'VIEW_CONTENT' | 'DOWNLOAD' | 'FULL_ACCESS';

interface AccessRequestInput {
    manuscriptId: string;
    requestedLevel: AccessLevel;
    purpose: string;
    institution: string;
    justification: string;
    duration?: number;
}

interface ReviewInput {
    status: 'APPROVED' | 'REJECTED';
    reviewNotes?: string;
    approvedLevel?: AccessLevel;
    approvedDuration?: number;
}

interface AccessResult {
    success: boolean;
    request?: Record<string, unknown>;
    requests?: Record<string, unknown>[];
    error?: string;
    code?: string;
}

// Access level hierarchy
const accessLevelHierarchy: Record<AccessLevel, number> = {
    VIEW_METADATA: 1,
    VIEW_CONTENT: 2,
    DOWNLOAD: 3,
    FULL_ACCESS: 4,
};

/**
 * Create access request
 */
export async function createAccessRequest(
    data: AccessRequestInput,
    userId: string
): Promise<AccessResult> {
    const Manuscript = getManuscriptModel();

    // Check if manuscript exists
    const manuscript = await Manuscript.findById(data.manuscriptId);
    if (!manuscript) {
        return {
            success: false,
            error: 'Manuscript not found',
            code: 'NOT_FOUND',
        };
    }

    // Check if user is the owner
    if (manuscript.ownerId === userId) {
        return {
            success: false,
            error: 'You already have full access as the owner',
            code: 'ALREADY_HAS_ACCESS',
        };
    }

    // Check if user is identity verified
    const user = await userRepo.findById(userId);
    if (!user || user.verification_status !== 'VERIFIED') {
        return {
            success: false,
            error: 'Identity verification required before requesting access',
            code: 'IDENTITY_NOT_VERIFIED',
        };
    }

    // Check for existing access at or above requested level
    const existingAccess = await manuscriptAccessRepo.findByManuscriptAndUser(data.manuscriptId, userId);

    if (existingAccess) {
        const existingLevel = accessLevelHierarchy[existingAccess.access_level as AccessLevel];
        const requestedLevel = accessLevelHierarchy[data.requestedLevel];

        if (existingLevel >= requestedLevel) {
            return {
                success: false,
                error: 'You already have access at or above this level',
                code: 'ALREADY_HAS_ACCESS',
            };
        }
    }

    // Check for pending request
    const pendingRequest = await accessRequestRepo.findByManuscriptAndRequester(
        data.manuscriptId,
        userId,
        'PENDING'
    );

    if (pendingRequest) {
        return {
            success: false,
            error: 'You already have a pending request for this manuscript',
            code: 'PENDING_REQUEST_EXISTS',
        };
    }

    // Create access request
    const request = await accessRequestRepo.create({
        manuscript_id: data.manuscriptId,
        requester_id: userId,
        requested_level: data.requestedLevel,
        purpose: data.purpose,
        institution: data.institution,
        justification: data.justification,
        duration: data.duration,
    });

    // Increment access request count on manuscript
    await Manuscript.updateOne(
        { _id: data.manuscriptId },
        { $inc: { accessRequestCount: 1 } }
    );

    return {
        success: true,
        request,
    };
}

/**
 * Get user's access requests
 */
export async function getUserAccessRequests(userId: string): Promise<AccessResult> {
    const Manuscript = getManuscriptModel();
    const requests = await accessRequestRepo.findByRequester(userId);

    // Populate manuscript titles
    const populatedRequests = await Promise.all(
        requests.map(async (req) => {
            const manuscript = await Manuscript.findById(req.manuscript_id);
            return {
                ...req,
                manuscript_title: manuscript?.title || 'Unknown Manuscript',
            };
        })
    );

    return {
        success: true,
        requests: populatedRequests,
    };
}

/**
 * Get access requests for a manuscript
 */
export async function getManuscriptAccessRequests(
    manuscriptId: string,
    userId: string
): Promise<AccessResult> {
    const Manuscript = getManuscriptModel();

    // Check if manuscript exists and user is owner or admin
    const manuscript = await Manuscript.findById(manuscriptId);
    if (!manuscript) {
        return {
            success: false,
            error: 'Manuscript not found',
            code: 'NOT_FOUND',
        };
    }

    const user = await userRepo.findById(userId);
    const isOwner = manuscript.ownerId === userId;
    const isAdmin = user?.role === 'ADMIN' || user?.role === 'REVIEWER';

    if (!isOwner && !isAdmin) {
        return {
            success: false,
            error: 'You do not have permission to view these requests',
            code: 'FORBIDDEN',
        };
    }

    const requests = await accessRequestRepo.findByManuscript(manuscriptId);

    // Populate requester info
    const populatedRequests = await Promise.all(
        requests.map(async (req) => {
            const requester = await userRepo.findById(req.requester_id);
            return {
                ...req,
                requester: requester ? {
                    id: requester.id,
                    email: requester.email,
                    firstName: requester.first_name,
                    lastName: requester.last_name,
                    institution: requester.institution,
                } : null,
            };
        })
    );

    return {
        success: true,
        requests: populatedRequests,
    };
}

/**
 * Review access request (approve/reject)
 */
export async function reviewAccessRequest(
    requestId: string,
    reviewerId: string,
    data: ReviewInput
): Promise<AccessResult> {
    const Manuscript = getManuscriptModel();

    const request = await accessRequestRepo.findById(requestId);
    if (!request) {
        return {
            success: false,
            error: 'Request not found',
            code: 'NOT_FOUND',
        };
    }

    if (request.status !== 'PENDING') {
        return {
            success: false,
            error: 'Request has already been reviewed',
            code: 'ALREADY_REVIEWED',
        };
    }

    // Check if reviewer has permission
    const manuscript = await Manuscript.findById(request.manuscript_id);
    if (!manuscript) {
        return {
            success: false,
            error: 'Manuscript not found',
            code: 'NOT_FOUND',
        };
    }

    const reviewer = await userRepo.findById(reviewerId);
    const isOwner = manuscript.ownerId === reviewerId;
    const isAdmin = reviewer?.role === 'ADMIN' || reviewer?.role === 'REVIEWER';

    if (!isOwner && !isAdmin) {
        return {
            success: false,
            error: 'You do not have permission to review this request',
            code: 'FORBIDDEN',
        };
    }

    // Update request
    await accessRequestRepo.update(requestId, {
        status: data.status,
        reviewer_id: reviewerId,
        reviewed_at: new Date(),
        review_notes: data.reviewNotes,
        approved_level: data.status === 'APPROVED' ? data.approvedLevel || request.requested_level : undefined,
        approved_duration: data.status === 'APPROVED' ? data.approvedDuration || request.duration : undefined,
    });

    // If approved, create access grant
    if (data.status === 'APPROVED') {
        const approvedLevel = data.approvedLevel || request.requested_level;
        const approvedDuration = data.approvedDuration || request.duration;

        // Calculate expiry
        let expiresAt: Date | undefined;
        if (approvedDuration) {
            expiresAt = new Date(Date.now() + approvedDuration * 24 * 60 * 60 * 1000);
        }

        // Check for existing access
        const existingAccess = await manuscriptAccessRepo.findByManuscriptAndUser(
            request.manuscript_id,
            request.requester_id
        );

        if (existingAccess) {
            // Update existing access
            await manuscriptAccessRepo.update(existingAccess.id, {
                access_level: approvedLevel,
                granted_by: reviewerId,
                granted_at: new Date(),
                expires_at: expiresAt,
                is_active: true,
                revoked_at: undefined,
                revoked_by: undefined,
                revoke_reason: undefined,
            });
        } else {
            // Create new access
            await manuscriptAccessRepo.create({
                manuscript_id: request.manuscript_id,
                user_id: request.requester_id,
                access_level: approvedLevel,
                granted_by: reviewerId,
                expires_at: expiresAt,
                watermark_id: uuidv4(),
            });
        }
    }

    const updatedRequest = await accessRequestRepo.findById(requestId);

    return {
        success: true,
        request: updatedRequest || undefined,
    };
}

/**
 * Check user access to manuscript
 */
export async function checkAccess(
    manuscriptId: string,
    userId: string,
    requiredLevel: AccessLevel
): Promise<{ hasAccess: boolean; watermarkId?: string }> {
    const Manuscript = getManuscriptModel();

    // Check if user is owner
    const manuscript = await Manuscript.findById(manuscriptId);
    if (!manuscript) {
        return { hasAccess: false };
    }

    if (manuscript.ownerId === userId) {
        return { hasAccess: true };
    }

    // Check if user is admin
    const user = await userRepo.findById(userId);
    if (user?.role === 'ADMIN') {
        return { hasAccess: true };
    }

    // Check access grant
    const access = await manuscriptAccessRepo.findByManuscriptAndUser(manuscriptId, userId);

    if (!access) {
        return { hasAccess: false };
    }

    // Check access level
    const userLevel = accessLevelHierarchy[access.access_level as AccessLevel];
    const requiredLevelNum = accessLevelHierarchy[requiredLevel];

    if (userLevel >= requiredLevelNum) {
        return { hasAccess: true, watermarkId: access.watermark_id };
    }

    return { hasAccess: false };
}

/**
 * Revoke access
 */
export async function revokeAccess(
    manuscriptId: string,
    userId: string,
    revokerId: string,
    reason?: string
): Promise<AccessResult> {
    const Manuscript = getManuscriptModel();

    // Check if revoker has permission
    const manuscript = await Manuscript.findById(manuscriptId);
    if (!manuscript) {
        return {
            success: false,
            error: 'Manuscript not found',
            code: 'NOT_FOUND',
        };
    }

    const revoker = await userRepo.findById(revokerId);
    const isOwner = manuscript.ownerId === revokerId;
    const isAdmin = revoker?.role === 'ADMIN';

    if (!isOwner && !isAdmin) {
        return {
            success: false,
            error: 'You do not have permission to revoke access',
            code: 'FORBIDDEN',
        };
    }

    // Find and revoke access
    const access = await manuscriptAccessRepo.findByManuscriptAndUser(manuscriptId, userId);

    if (!access) {
        return {
            success: false,
            error: 'Access grant not found',
            code: 'NOT_FOUND',
        };
    }

    await manuscriptAccessRepo.revoke(manuscriptId, userId, revokerId, reason);

    return { success: true };
}
