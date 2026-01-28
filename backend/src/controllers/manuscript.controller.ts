import { Request, Response } from 'express';
import * as manuscriptService from '../services/manuscript.service.js';
import * as accessService from '../services/access.service.js';
import { getManuscriptModel, userRepo, manuscriptAccessRepo } from '../models/index.js';
import { getFromStorage } from '../config/storage.js';
import { decryptFile } from '../utils/encryption.js';
import { watermarkPdf, watermarkImage } from '../services/watermark.service.js';
import { ManuscriptInput, SearchInput } from '../utils/validators.js';
import * as settingsRepo from '../repositories/settings.repository.js';
import { CitationService } from '../services/citation.service.js';
import { logger } from '../utils/logger.js';

/**
 * Create manuscript
 */
export async function create(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const data = req.body as ManuscriptInput;
    const result = await manuscriptService.createManuscript(data as any, req.user.userId);

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
        manuscript: result.manuscript,
    });
}

/**
 * Get manuscript by ID
 */
export async function getById(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const userId = req.user?.userId;
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    const result = await manuscriptService.getManuscriptById(id, userId, ipAddress);

    if (!result.success) {
        res.status(404).json({
            success: false,
            error: result.error,
            code: result.code,
        });
        return;
    }

    const manuscript = result.manuscript!;

    // Check access level and filter response accordingly
    let responseData: Partial<typeof manuscript> = {
        // Always return metadata
        _id: manuscript._id,
        title: manuscript.title,
        alternateTitle: manuscript.alternateTitle,
        author: manuscript.author,
        category: manuscript.category,
        subject: manuscript.subject,
        languages: manuscript.languages,
        material: manuscript.material,
        centuryEstimate: manuscript.centuryEstimate,
        origin: manuscript.origin,
        repository: manuscript.repository,
        abstract: manuscript.abstract,
        visibility: manuscript.visibility,
        status: manuscript.status,
        viewCount: manuscript.viewCount,
        keywords: manuscript.keywords,
        tags: manuscript.tags,
        coverThumbnail: manuscript.coverThumbnail,
        ownerId: manuscript.ownerId,
    };

    // If user is owner or has content access, include more details
    if (userId) {
        const access = await accessService.checkAccess(id, userId, 'VIEW_CONTENT');

        if (access.hasAccess) {
            responseData = {
                ...responseData,
                script: manuscript.script,
                format: manuscript.format,
                dimensions: manuscript.dimensions as any,
                folioCount: manuscript.folioCount,
                condition: manuscript.condition,
                dateComposed: manuscript.dateComposed,
                dateCopied: manuscript.dateCopied,
                incipit: manuscript.incipit,
                explicit: manuscript.explicit,
                colophon: manuscript.colophon,
                files: manuscript.files.map((f: { type: string; originalName: string; mimeType: string; size: number; pageCount?: number }) => ({
                    type: f.type,
                    originalName: f.originalName,
                    mimeType: f.mimeType,
                    size: f.size,
                    pageCount: f.pageCount,
                })) as any,
            };
        }
    }

    res.json({
        success: true,
        manuscript: responseData,
    });
}

/**
 * Update manuscript
 */
export async function update(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const { id } = req.params;
    const data = req.body as Partial<ManuscriptInput>;

    const result = await manuscriptService.updateManuscript(id, data as any, req.user.userId);

    if (!result.success) {
        const status =
            result.code === 'NOT_FOUND' ? 404 : result.code === 'FORBIDDEN' ? 403 : 400;
        res.status(status).json({
            success: false,
            error: result.error,
            code: result.code,
        });
        return;
    }

    res.json({
        success: true,
        manuscript: result.manuscript,
    });
}

/**
 * Delete manuscript
 */
export async function remove(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const { id } = req.params;
    const result = await manuscriptService.deleteManuscript(id, req.user.userId);

    if (!result.success) {
        const status =
            result.code === 'NOT_FOUND' ? 404 : result.code === 'FORBIDDEN' ? 403 : 400;
        res.status(status).json({
            success: false,
            error: result.error,
            code: result.code,
        });
        return;
    }

    res.json({
        success: true,
        message: 'Manuscript deleted successfully',
    });
}

/**
 * Upload files to manuscript
 */
export async function uploadFiles(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const { id } = req.params;
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
        res.status(400).json({
            success: false,
            error: 'No files provided',
            code: 'NO_FILES',
        });
        return;
    }

    let lastResult;
    for (const file of files) {
        lastResult = await manuscriptService.uploadManuscriptFile(id, file, req.user.userId);
        if (!lastResult.success) {
            res.status(400).json({
                success: false,
                error: lastResult.error,
                code: lastResult.code,
            });
            return;
        }
    }

    res.json({
        success: true,
        message: `${files.length} file(s) uploaded successfully`,
        manuscript: lastResult?.manuscript,
    });
}

/**
 * Delete file from manuscript
 */
export async function deleteFile(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const { id, fileIndex } = req.params;
    const result = await manuscriptService.deleteManuscriptFile(
        id,
        parseInt(fileIndex, 10),
        req.user.userId
    );

    if (!result.success) {
        const status =
            result.code === 'NOT_FOUND' || result.code === 'FILE_NOT_FOUND'
                ? 404
                : result.code === 'FORBIDDEN'
                    ? 403
                    : 400;
        res.status(status).json({
            success: false,
            error: result.error,
            code: result.code,
        });
        return;
    }

    res.json({
        success: true,
        message: 'File deleted successfully',
    });
}

/**
 * Search manuscripts
 */
export async function search(req: Request, res: Response): Promise<void> {
    const params = req.query as unknown as SearchInput;
    const userId = req.user?.userId;

    const result = await manuscriptService.searchManuscripts(params, userId);

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
        manuscripts: result.manuscripts,
        pagination: {
            total: result.total,
            page: result.page,
            totalPages: result.totalPages,
        },
    });
}

/**
 * Get user's manuscripts
 */
export async function getMyManuscripts(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;
    const search = req.query.q as string | undefined;

    const result = await manuscriptService.getUserManuscripts(req.user.userId, page, limit, search);

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
        manuscripts: result.manuscripts,
        pagination: {
            total: result.total,
            page: result.page,
            totalPages: result.totalPages,
        },
    });
}

/**
 * Get filter options
 */
export async function getFilters(req: Request, res: Response): Promise<void> {
    const filters = await manuscriptService.getFilterOptions();

    res.json({
        success: true,
        filters,
    });
}

/**
 * Get public statistics
 */
export async function getPublicStats(req: Request, res: Response): Promise<void> {
    const stats = await manuscriptService.getPublicStatistics();

    res.json({
        success: true,
        stats,
    });
}

/**
 * View manuscript file (secure streaming)
 */
export async function viewFile(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const { id, fileIndex } = req.params;
    const Manuscript = getManuscriptModel();

    // First get the manuscript to check ownership
    const manuscript = await Manuscript.findById(id);
    if (!manuscript) {
        res.status(404).json({
            success: false,
            error: 'Manuscript not found',
            code: 'NOT_FOUND',
        });
        return;
    }

    // Check if user is the owner (owners always have full access)
    const isOwner = manuscript.ownerId === req.user.userId;

    // Check if user is a reviewer or admin (they can view files for review)
    const user = await userRepo.findById(req.user.userId);
    const isReviewer = user?.role === 'REVIEWER' || user?.role === 'ADMIN';

    // Check access (only if not owner and not reviewer)
    let access: { hasAccess: boolean; watermarkId?: string } = { hasAccess: isOwner || isReviewer };
    if (!isOwner && !isReviewer) {
        access = await accessService.checkAccess(id, req.user.userId, 'VIEW_CONTENT');
    }

    if (!access.hasAccess) {
        res.status(403).json({
            success: false,
            error: 'Access denied',
            code: 'FORBIDDEN',
        });
        return;
    }
    // Check file exists
    if (!manuscript.files[parseInt(fileIndex, 10)]) {
        res.status(404).json({
            success: false,
            error: 'File not found',
            code: 'NOT_FOUND',
        });
        return;
    }

    const file = manuscript.files[parseInt(fileIndex, 10)];

    try {
        // Get encrypted file from storage
        const encryptedContent = await getFromStorage(file.encryptedPath);

        // Decrypt file
        const decryptedContent = await decryptFile(encryptedContent, file.checksum);

        // Apply watermark for viewing (user is already fetched above)
        let finalContent = decryptedContent;

        if (user) {
            // Get watermark settings
            const watermarkSettings = await settingsRepo.getWatermarkSettings();

            if (watermarkSettings.enabled) {
                const watermarkId = access.watermarkId || `view-${Date.now()}`;
                const watermarkOptions = {
                    userId: req.user.userId,
                    userEmail: watermarkSettings.includeUserId ? user.email : '',
                    userName: `${user.first_name} ${user.last_name}`,
                    watermarkId: watermarkId,
                    timestamp: new Date(),
                    institution: watermarkSettings.text,
                    // Pass all other settings
                    fontSize: watermarkSettings.fontSize,
                    opacity: watermarkSettings.opacity,
                    color: watermarkSettings.color,
                    position: watermarkSettings.position as any,
                    includeUserId: watermarkSettings.includeUserId,
                    includeTimestamp: watermarkSettings.includeTimestamp,
                    customText: watermarkSettings.text,
                    logoPath: 'src/assets/iks.webp'
                };

                if (file.type === 'pdf') {
                    finalContent = await watermarkPdf(decryptedContent, watermarkOptions);
                } else if (file.type === 'image') {
                    finalContent = await watermarkImage(decryptedContent, watermarkOptions);
                }
            }
        }

        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
        res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
        res.setHeader('X-Content-Type-Options', 'nosniff');
        res.send(finalContent);
    } catch (error) {
        console.error('View file error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to retrieve file',
            code: 'FILE_ERROR',
        });
    }
}

/**
 * Download manuscript file (with watermark)
 */
export async function downloadFile(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const { id, fileIndex } = req.params;
    const Manuscript = getManuscriptModel();

    // First get the manuscript to check ownership
    const manuscript = await Manuscript.findById(id);
    if (!manuscript) {
        res.status(404).json({
            success: false,
            error: 'Manuscript not found',
            code: 'NOT_FOUND',
        });
        return;
    }

    // Check if user is the owner (owners always have full access)
    const isOwner = manuscript.ownerId === req.user.userId;

    // Check download access (only if not owner)
    let access: { hasAccess: boolean; watermarkId?: string } = { hasAccess: isOwner };
    if (!isOwner) {
        access = await accessService.checkAccess(id, req.user.userId, 'DOWNLOAD');
    }

    if (!access.hasAccess) {
        res.status(403).json({
            success: false,
            error: 'Download access denied',
            code: 'FORBIDDEN',
        });
        return;
    }

    // Check file exists
    if (!manuscript.files[parseInt(fileIndex, 10)]) {
        res.status(404).json({
            success: false,
            error: 'File not found',
            code: 'NOT_FOUND',
        });
        return;
    }

    const file = manuscript.files[parseInt(fileIndex, 10)];

    try {
        // Get encrypted file from storage
        const encryptedContent = await getFromStorage(file.encryptedPath);

        // Decrypt file
        const decryptedContent = await decryptFile(encryptedContent, file.checksum);

        // Apply watermark for download
        const user = await userRepo.findById(req.user.userId);

        let finalContent = decryptedContent;

        // Get watermark settings from database
        const watermarkSettings = await settingsRepo.getWatermarkSettings();

        // Apply watermark if enabled (always for non-owners, or if owner downloads with watermark setting enabled)
        if (watermarkSettings.enabled && user) {
            const watermarkId = access.watermarkId || `dl-${Date.now()}`;
            const watermarkOptions = {
                userId: req.user.userId,
                userEmail: watermarkSettings.includeUserId ? user.email : '',
                userName: `${user.first_name} ${user.last_name}`,
                watermarkId: watermarkId,
                timestamp: new Date(),
                institution: watermarkSettings.text, // Use institution text from settings
                // Pass all other settings
                fontSize: watermarkSettings.fontSize,
                opacity: watermarkSettings.opacity,
                color: watermarkSettings.color,
                position: watermarkSettings.position as any,
                includeUserId: watermarkSettings.includeUserId,
                includeTimestamp: watermarkSettings.includeTimestamp,
                customText: watermarkSettings.text,
                logoPath: 'src/assets/iks.webp'
            };

            if (file.type === 'pdf') {
                finalContent = await watermarkPdf(decryptedContent, watermarkOptions);
            } else if (file.type === 'image') {
                finalContent = await watermarkImage(decryptedContent, watermarkOptions);
            }
        }

        // Update download count
        await Manuscript.updateOne({ _id: id }, { $inc: { downloadCount: 1 } });

        if (access.watermarkId) {
            await manuscriptAccessRepo.incrementDownloadCount(access.watermarkId);
        }

        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
        res.setHeader('Content-Length', finalContent.length);
        res.send(finalContent);
    } catch (error) {
        logger.error('Download file error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to download file',
            code: 'DOWNLOAD_ERROR',
        });
    }
}

/**
 * Export citation
 */
export async function exportCitation(req: Request, res: Response): Promise<void> {
    const { id } = req.params;
    const { format } = req.query;
    const userId = req.user?.userId;
    const ipAddress = req.ip || req.socket.remoteAddress || 'unknown';

    // Get manuscript (metadata is public/restricted usually, but better to check access)
    // Using getManuscriptById which handles access checks internaly (returns partial if not allowed?)
    const result = await manuscriptService.getManuscriptById(id, userId, ipAddress);

    if (!result.success || !result.manuscript) {
        res.status(404).json({
            success: false,
            error: result.error || 'Manuscript not found',
            code: result.code,
        });
        return;
    }

    const manuscript = result.manuscript;

    // Check visibility if needed, but getManuscriptById checks this usually.
    // If it's private and user has no access, it shouldn't be returned or should be handled.

    let citation = '';
    let contentType = 'text/plain';
    let extension = 'txt';

    if (format === 'bibtex') {
        citation = CitationService.generateBibTeX(manuscript);
        contentType = 'application/x-bibtex';
        extension = 'bib';
    } else if (format === 'ris') {
        citation = CitationService.generateRIS(manuscript);
        contentType = 'application/x-research-info-systems';
        extension = 'ris';
    } else {
        res.status(400).json({
            success: false,
            error: 'Invalid format. Supported formats: bibtex, ris',
            code: 'INVALID_FORMAT',
        });
        return;
    }

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename="${manuscript._id}.${extension}"`);
    res.send(citation);
}

/**
 * Assign DOI/Permanent Handle
 */
export async function assignDoi(req: Request, res: Response): Promise<void> {
    if (!req.user) {
        res.status(401).json({ success: false, error: 'Unauthorized' });
        return;
    }

    const { id } = req.params;

    // Check if user is owner or admin
    const manuscriptResult = await manuscriptService.getManuscriptById(id, req.user.userId, 'unknown');
    if (!manuscriptResult.success || !manuscriptResult.manuscript) {
        res.status(404).json({ success: false, error: 'Manuscript not found' });
        return;
    }

    // Only owner or admin should assign DOI
    const isOwner = manuscriptResult.manuscript.ownerId === req.user.userId;
    // Check for admin role needs looking up user, or we assume route middleware handles 'REVIEWER'/'ADMIN' via something else.
    // accessService.checkAccess doesn't check for "assign DOI".
    // For now allow Owner.

    if (!isOwner) { // strict check
        // We might want to allow Admins too. 
        const user = await userRepo.findById(req.user.userId);
        if (user?.role !== 'ADMIN') {
            res.status(403).json({ success: false, error: 'Only owner or admin can assign DOI' });
            return;
        }
    }

    if (manuscriptResult.manuscript.doi) {
        res.json({
            success: true,
            doi: manuscriptResult.manuscript.doi,
            message: 'Manuscript already has a DOI',
        });
        return;
    }

    // Generate specific DOI/Handle
    // Format: 10.5555/IKS.{shortId}
    const shortId = id.substring(0, 8);
    const newDoi = `10.5555/IKS.${shortId}`; // Simulated Handle

    const updateResult = await manuscriptService.updateManuscript(id, { doi: newDoi } as any, req.user.userId);

    if (!updateResult.success) {
        res.status(500).json({ success: false, error: 'Failed to assign DOI' });
        return;
    }

    res.json({
        success: true,
        doi: newDoi,
        manuscript: updateResult.manuscript,
    });
}

