import { Request, Response } from 'express';
import { userRepo, sessionRepo, verificationDocRepo } from '../repositories/postgres.repository.js';
import { hashPassword, verifyPassword, validatePasswordStrength } from '../utils/hash.js';
import { encryptFile } from '../utils/encryption.js';
import { uploadToStorage } from '../config/storage.js';
import { UpdateProfileInput } from '../utils/validators.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Get current user profile
 */
export async function getProfile(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const user = await userRepo.findById(req.user.userId);

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

    res.json({
        success: true,
        user: safeUser,
    });
}

/**
 * Update current user profile
 */
export async function updateProfile(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const data = req.body as UpdateProfileInput;

    // Map camelCase to snake_case
    const updateData: Record<string, unknown> = {};
    if (data.firstName) updateData.first_name = data.firstName;
    if (data.lastName) updateData.last_name = data.lastName;
    if (data.institution !== undefined) updateData.institution = data.institution;
    if (data.designation !== undefined) updateData.designation = data.designation;
    if (data.researchInterests !== undefined) updateData.research_interests = data.researchInterests;
    if (data.phone !== undefined) updateData.phone = data.phone;
    if (data.address !== undefined) updateData.address = data.address;

    const user = await userRepo.update(req.user.userId, updateData);

    res.json({
        success: true,
        message: 'Profile updated successfully',
        user: user ? {
            id: user.id,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            institution: user.institution,
            designation: user.designation,
            research_interests: user.research_interests,
            phone: user.phone,
            address: user.address,
        } : null,
    });
}

/**
 * Change password
 */
export async function changePassword(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const { currentPassword, newPassword } = req.body;

    // Validate new password strength
    const validation = validatePasswordStrength(newPassword);
    if (!validation.isValid) {
        res.status(400).json({
            success: false,
            error: validation.errors.join('. '),
            code: 'WEAK_PASSWORD',
        });
        return;
    }

    // Get user with password
    const user = await userRepo.findById(req.user.userId);

    if (!user) {
        res.status(404).json({
            success: false,
            error: 'User not found',
            code: 'NOT_FOUND',
        });
        return;
    }

    // Verify current password
    const isValid = await verifyPassword(currentPassword, user.password_hash);

    if (!isValid) {
        res.status(400).json({
            success: false,
            error: 'Current password is incorrect',
            code: 'INVALID_PASSWORD',
        });
        return;
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password
    await userRepo.update(req.user.userId, { password_hash: newPasswordHash });

    // Invalidate all sessions except current
    await sessionRepo.invalidateAllForUser(req.user.userId, req.sessionId);

    res.json({
        success: true,
        message: 'Password changed successfully',
    });
}

/**
 * Upload identity document
 */
export async function uploadIdentityDocument(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const file = req.file;
    if (!file) {
        res.status(400).json({
            success: false,
            error: 'No file provided',
            code: 'NO_FILE',
        });
        return;
    }

    const { documentType } = req.body;
    if (!documentType) {
        res.status(400).json({
            success: false,
            error: 'Document type is required',
            code: 'MISSING_TYPE',
        });
        return;
    }

    // Check if user already has a pending verification
    const existingDoc = await verificationDocRepo.findPendingByUserId(req.user.userId);

    if (existingDoc) {
        res.status(409).json({
            success: false,
            error: 'You already have a pending verification request',
            code: 'PENDING_EXISTS',
        });
        return;
    }

    // Encrypt and upload file
    const { encryptedContent, checksum } = await encryptFile(file.buffer);
    const fileId = uuidv4();
    const storagePath = `identity/${req.user.userId}/${fileId}.enc`;

    await uploadToStorage(storagePath, encryptedContent, 'application/octet-stream', {
        originalName: file.originalname,
        mimeType: file.mimetype,
        checksum,
    });

    // Create verification document record
    await verificationDocRepo.create({
        user_id: req.user.userId,
        document_type: documentType,
        document_hash: checksum,
        encrypted_path: storagePath,
        original_name: file.originalname,
        mime_type: file.mimetype,
    });

    // Update user verification status to pending
    await userRepo.update(req.user.userId, {
        verification_status: 'PENDING',
        identity_document_type: documentType,
        identity_document_hash: checksum,
    });

    res.json({
        success: true,
        message: 'Identity document uploaded successfully. Verification pending.',
    });
}

/**
 * Get identity verification status
 */
export async function getVerificationStatus(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const user = await userRepo.findById(req.user.userId);
    const documents = await verificationDocRepo.findByUserId(req.user.userId);

    res.json({
        success: true,
        verification: {
            status: user?.verification_status,
            documentType: user?.identity_document_type,
            verifiedAt: user?.verified_at,
            documents: documents.map((doc) => ({
                documentType: doc.document_type,
                status: doc.status,
                uploadedAt: doc.uploaded_at,
                verifiedAt: doc.verified_at,
                reviewNotes: doc.review_notes,
            })),
        },
    });
}

/**
 * Get active sessions
 */
export async function getSessions(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const sessions = await sessionRepo.findAllForUser(req.user.userId);

    res.json({
        success: true,
        sessions: sessions.map((s) => ({
            id: s.id,
            ipAddress: s.ip_address,
            userAgent: s.user_agent,
            createdAt: s.created_at,
            expiresAt: s.expires_at,
            isCurrent: s.id === req.sessionId,
        })),
    });
}

/**
 * Revoke session
 */
export async function revokeSession(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const { id } = req.params;

    // Verify session belongs to user
    const session = await sessionRepo.findById(id);

    if (!session || session.user_id !== req.user.userId) {
        res.status(404).json({
            success: false,
            error: 'Session not found',
            code: 'NOT_FOUND',
        });
        return;
    }

    await sessionRepo.invalidate(id);

    res.json({
        success: true,
        message: 'Session revoked successfully',
    });
}
