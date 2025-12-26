import { Request, Response } from 'express';
import * as accessService from '../services/access.service.js';
import { AccessRequestInput, ReviewAccessRequestInput } from '../utils/validators.js';

/**
 * Create access request
 */
export async function createRequest(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const data = req.body as AccessRequestInput;
    const result = await accessService.createAccessRequest(data, req.user.userId);

    if (!result.success) {
        const status = result.code === 'NOT_FOUND' ? 404 :
            result.code === 'IDENTITY_NOT_VERIFIED' ? 403 :
                result.code === 'ALREADY_HAS_ACCESS' || result.code === 'PENDING_REQUEST_EXISTS' ? 409 : 400;
        res.status(status).json({
            success: false,
            error: result.error,
            code: result.code,
        });
        return;
    }

    res.status(201).json({
        success: true,
        message: 'Access request submitted successfully',
        request: result.request,
    });
}

/**
 * Get my access requests
 */
export async function getMyRequests(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const result = await accessService.getUserAccessRequests(req.user.userId);

    if (!result.success) {
        res.status(500).json({
            success: false,
            error: result.error,
            code: result.code,
        });
        return;
    }

    res.json({
        success: true,
        requests: result.requests,
    });
}

/**
 * Get access requests for a manuscript
 */
export async function getManuscriptRequests(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const { manuscriptId } = req.params;
    const result = await accessService.getManuscriptAccessRequests(manuscriptId, req.user.userId);

    if (!result.success) {
        const status = result.code === 'NOT_FOUND' ? 404 :
            result.code === 'FORBIDDEN' ? 403 : 500;
        res.status(status).json({
            success: false,
            error: result.error,
            code: result.code,
        });
        return;
    }

    res.json({
        success: true,
        requests: result.requests,
    });
}

/**
 * Approve access request
 */
export async function approveRequest(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const { id } = req.params;
    const data: ReviewAccessRequestInput = {
        status: 'APPROVED',
        reviewNotes: req.body.reviewNotes,
        approvedLevel: req.body.approvedLevel,
        approvedDuration: req.body.approvedDuration,
    };

    const result = await accessService.reviewAccessRequest(id, req.user.userId, data);

    if (!result.success) {
        const status = result.code === 'NOT_FOUND' ? 404 :
            result.code === 'FORBIDDEN' ? 403 :
                result.code === 'ALREADY_REVIEWED' ? 409 : 400;
        res.status(status).json({
            success: false,
            error: result.error,
            code: result.code,
        });
        return;
    }

    res.json({
        success: true,
        message: 'Access request approved',
        request: result.request,
    });
}

/**
 * Reject access request
 */
export async function rejectRequest(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const { id } = req.params;
    const data: ReviewAccessRequestInput = {
        status: 'REJECTED',
        reviewNotes: req.body.reviewNotes,
    };

    const result = await accessService.reviewAccessRequest(id, req.user.userId, data);

    if (!result.success) {
        const status = result.code === 'NOT_FOUND' ? 404 :
            result.code === 'FORBIDDEN' ? 403 :
                result.code === 'ALREADY_REVIEWED' ? 409 : 400;
        res.status(status).json({
            success: false,
            error: result.error,
            code: result.code,
        });
        return;
    }

    res.json({
        success: true,
        message: 'Access request rejected',
        request: result.request,
    });
}

/**
 * Revoke access
 */
export async function revokeAccess(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const { manuscriptId, userId } = req.params;
    const { reason } = req.body;

    const result = await accessService.revokeAccess(manuscriptId, userId, req.user.userId, reason);

    if (!result.success) {
        const status = result.code === 'NOT_FOUND' ? 404 :
            result.code === 'FORBIDDEN' ? 403 : 400;
        res.status(status).json({
            success: false,
            error: result.error,
            code: result.code,
        });
        return;
    }

    res.json({
        success: true,
        message: 'Access revoked successfully',
    });
}
