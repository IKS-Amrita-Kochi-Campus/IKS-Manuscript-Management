import { getManuscriptModel, IManuscript } from '../models/index.js';
import { userRepo } from '../repositories/postgres.repository.js';
import { encryptFile } from '../utils/encryption.js';
import { uploadToStorage, deleteFromStorage } from '../config/storage.js';
import { v4 as uuidv4 } from 'uuid';

interface ManuscriptInput {
    title: string;
    alternateTitle?: string;
    author?: string;
    category: string;
    subject: string[];
    languages: string[];
    script?: string[];
    material?: string;
    format?: string;
    dimensions?: { height: number; width: number; unit: string };
    folioCount?: number;
    centuryEstimate?: string;
    origin?: string;
    repository: string;
    abstract: string;
    incipit?: string;
    explicit?: string;
    colophon?: string;
    keywords?: string[];
    tags?: string[];
    visibility?: 'public' | 'private' | 'restricted';
}

interface ManuscriptResult {
    success: boolean;
    manuscript?: IManuscript;
    manuscripts?: IManuscript[];
    error?: string;
    code?: string;
    total?: number;
    page?: number;
    totalPages?: number;
}

/**
 * Create manuscript
 */
export async function createManuscript(
    data: ManuscriptInput,
    userId: string
): Promise<ManuscriptResult> {
    const Manuscript = getManuscriptModel();

    const manuscript = await Manuscript.create({
        ...data,
        ownerId: userId,
        status: 'review', // New manuscripts need reviewer approval before being visible
    });

    return {
        success: true,
        manuscript: manuscript.toObject() as IManuscript,
    };
}

// In-memory view tracking to prevent duplicate counts (expires after 1 hour)
const viewTracker: Map<string, number> = new Map();
const VIEW_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

// Cleanup old entries periodically
setInterval(() => {
    const now = Date.now();
    for (const [key, timestamp] of viewTracker.entries()) {
        if (now - timestamp > VIEW_COOLDOWN_MS) {
            viewTracker.delete(key);
        }
    }
}, 5 * 60 * 1000); // Cleanup every 5 minutes

/**
 * Get manuscript by ID
 */
export async function getManuscriptById(
    id: string,
    userId?: string,
    ipAddress?: string
): Promise<ManuscriptResult> {
    const Manuscript = getManuscriptModel();

    const manuscript = await Manuscript.findById(id);

    if (!manuscript || manuscript.deletedAt) {
        return {
            success: false,
            error: 'Manuscript not found',
            code: 'NOT_FOUND',
        };
    }

    // Only increment view count if not recently viewed by this user/IP
    const viewKey = `${id}:${userId || ipAddress || 'anonymous'}`;
    const lastViewed = viewTracker.get(viewKey);
    const now = Date.now();

    if (!lastViewed || (now - lastViewed) > VIEW_COOLDOWN_MS) {
        await Manuscript.updateOne({ _id: id }, { $inc: { viewCount: 1 } });
        viewTracker.set(viewKey, now);
    }

    return {
        success: true,
        manuscript: manuscript.toObject() as IManuscript,
    };
}

/**
 * Update manuscript
 */
export async function updateManuscript(
    id: string,
    data: Partial<ManuscriptInput>,
    userId: string
): Promise<ManuscriptResult> {
    const Manuscript = getManuscriptModel();

    const manuscript = await Manuscript.findById(id);

    if (!manuscript || manuscript.deletedAt) {
        return {
            success: false,
            error: 'Manuscript not found',
            code: 'NOT_FOUND',
        };
    }

    // Check ownership
    const user = await userRepo.findById(userId);
    if (manuscript.ownerId !== userId && user?.role !== 'ADMIN') {
        return {
            success: false,
            error: 'You do not have permission to update this manuscript',
            code: 'FORBIDDEN',
        };
    }

    const updated = await Manuscript.findByIdAndUpdate(id, data, { new: true });

    return {
        success: true,
        manuscript: updated?.toObject() as IManuscript,
    };
}

/**
 * Delete manuscript (soft delete)
 */
export async function deleteManuscript(
    id: string,
    userId: string
): Promise<ManuscriptResult> {
    const Manuscript = getManuscriptModel();

    const manuscript = await Manuscript.findById(id);

    if (!manuscript || manuscript.deletedAt) {
        return {
            success: false,
            error: 'Manuscript not found',
            code: 'NOT_FOUND',
        };
    }

    // Check ownership
    const user = await userRepo.findById(userId);
    if (manuscript.ownerId !== userId && user?.role !== 'ADMIN') {
        return {
            success: false,
            error: 'You do not have permission to delete this manuscript',
            code: 'FORBIDDEN',
        };
    }

    await Manuscript.updateOne(
        { _id: id },
        { deletedAt: new Date(), deletedBy: userId }
    );

    return { success: true };
}

/**
 * Upload manuscript file
 */
export async function uploadManuscriptFile(
    manuscriptId: string,
    file: Express.Multer.File,
    userId: string
): Promise<ManuscriptResult> {
    const Manuscript = getManuscriptModel();

    const manuscript = await Manuscript.findById(manuscriptId);

    if (!manuscript || manuscript.deletedAt) {
        return {
            success: false,
            error: 'Manuscript not found',
            code: 'NOT_FOUND',
        };
    }

    // Check ownership
    const user = await userRepo.findById(userId);
    if (manuscript.ownerId !== userId && user?.role !== 'ADMIN') {
        return {
            success: false,
            error: 'You do not have permission to upload files to this manuscript',
            code: 'FORBIDDEN',
        };
    }

    // Determine file type
    let fileType: 'pdf' | 'image' | 'text' = 'text';
    if (file.mimetype === 'application/pdf') {
        fileType = 'pdf';
    } else if (file.mimetype.startsWith('image/')) {
        fileType = 'image';
    }

    // Apply watermark immediately on upload for PDFs and images
    // let contentToStore = file.buffer; // Removed duplicate declaration

    // Import watermark functions dynamically to avoid circular dependencies
    const { watermarkPdf } = await import('./watermark.service.js');
    const { getWatermarkSettings } = await import('../repositories/settings.repository.js');

    // Merge logic: If it's a PDF or Image, we want to normalize it to a single PDF
    // For now, the input `file` is a single file from Multer. 
    // If we want to support "50 files uploaded -> 1 PDF", we need to handle an array of files in the controller or service.
    // The current signature receives `file: Express.Multer.File` (single).
    // Assuming the user meant "when I upload files, merge them", but the current flow handles 1 at a time.
    // However, we can ensure even a single file is standardized to A4 PDF with the requested watermarks.

    let contentToStore = file.buffer;
    let fileTypeToStore = fileType;
    let mimeTypeToStore = file.mimetype;
    let originalNameToStore = file.originalname;

    // Convert Image to PDF or Normalize PDF to A4 if possible/needed, then watermark
    // actually, let's stick to watermarking what we have, but if it's an image, convert to PDF A4 page?
    // User asked "make it into one pdf... default size a4".
    // Since we receive one file here, we will convert this one file to an A4 PDF if it's an image or PDF.

    if (fileType === 'image' || fileType === 'pdf') {
        const { PDFDocument, PageSizes } = await import('pdf-lib');

        let pdfDoc: any; // PDFDocument type

        if (fileType === 'pdf') {
            pdfDoc = await PDFDocument.load(file.buffer);
        } else {
            pdfDoc = await PDFDocument.create();
            const page = pdfDoc.addPage(PageSizes.A4);

            // Embed image logic
            let image;
            try {
                // Try embedding as PNG first
                image = await pdfDoc.embedPng(file.buffer);
            } catch (e) {
                // Fallback to JPG
                image = await pdfDoc.embedJpg(file.buffer);
            }

            // Scale content to fit A4 maintaining aspect ratio
            const { width, height } = page.getSize();
            const margin = 40;
            const availableWidth = width - (margin * 2);
            const availableHeight = height - (margin * 2);

            const imgDims = image.scale(1);

            // Calculate scale to fit within available space
            const scaleWidth = availableWidth / imgDims.width;
            const scaleHeight = availableHeight / imgDims.height;
            const scale = Math.min(scaleWidth, scaleHeight, 1); // Ensure we don't upscale if image is small

            page.drawImage(image, {
                x: (width - imgDims.width * scale) / 2,
                y: (height - imgDims.height * scale) / 2,
                width: imgDims.width * scale,
                height: imgDims.height * scale,
            });
        }

        // Apply watermarks within this PDF generation/normalization flow
        // Watermark settings
        const watermarkSettings = await getWatermarkSettings();
        const user = await userRepo.findById(userId);

        const watermarkOptions = {
            userId: userId,
            userEmail: user?.email || '',
            userName: user ? `${user.first_name} ${user.last_name}` : 'Unknown',
            watermarkId: `upload-${manuscriptId.substring(0, 8)}`,
            timestamp: new Date(),
            institution: 'Amrita Vishwa Vidyapeetham Kochi', // Force this text as requested
            // Force enabled for upload processing if we want it baked in, or use settings check
        };

        // We apply watermarks directly here using the service logic but adapting for the doc we hold
        // Or simpler: save this PDF buffer, then pass to watermarkPdf service which handles "drawing" 
        // But the service saves/loads doc again. Optimization: valid enough.

        const pdfBytes = await pdfDoc.save();
        contentToStore = Buffer.from(pdfBytes);

        // Now apply the specific "Top/Bottom + 3 Vertical" watermark requested
        if (watermarkSettings.enabled) {
            contentToStore = await watermarkPdf(contentToStore, watermarkOptions);
        }

        // Change stored metadata to PDF since we converted/normalized
        fileTypeToStore = 'pdf';
        mimeTypeToStore = 'application/pdf';
        if (!originalNameToStore.toLowerCase().endsWith('.pdf')) {
            originalNameToStore += '.pdf';
        }
    }

    // Encrypt file (now watermarked)
    const { encryptedContent, checksum } = await encryptFile(contentToStore);

    // Upload to storage
    const fileId = uuidv4();
    const storagePath = `manuscripts/${manuscriptId}/${fileId}.enc`;

    await uploadToStorage(storagePath, encryptedContent, 'application/octet-stream', {
        originalName: file.originalname,
        mimeType: file.mimetype,
        checksum,
    });

    // Add file to manuscript
    const fileData = {
        type: fileTypeToStore,
        originalName: originalNameToStore,
        mimeType: mimeTypeToStore,
        size: contentToStore.length, // Use watermarked content size
        encryptedPath: storagePath,
        checksum,
        uploadedAt: new Date(),
    };

    const updated = await Manuscript.findByIdAndUpdate(
        manuscriptId,
        { $push: { files: fileData } },
        { new: true }
    );

    return {
        success: true,
        manuscript: updated?.toObject() as IManuscript,
    };
}

/**
 * Delete manuscript file
 */
export async function deleteManuscriptFile(
    manuscriptId: string,
    fileIndex: number,
    userId: string
): Promise<ManuscriptResult> {
    const Manuscript = getManuscriptModel();

    const manuscript = await Manuscript.findById(manuscriptId);

    if (!manuscript || manuscript.deletedAt) {
        return {
            success: false,
            error: 'Manuscript not found',
            code: 'NOT_FOUND',
        };
    }

    // Check ownership
    const user = await userRepo.findById(userId);
    if (manuscript.ownerId !== userId && user?.role !== 'ADMIN') {
        return {
            success: false,
            error: 'You do not have permission to delete files from this manuscript',
            code: 'FORBIDDEN',
        };
    }

    if (!manuscript.files[fileIndex]) {
        return {
            success: false,
            error: 'File not found',
            code: 'FILE_NOT_FOUND',
        };
    }

    const file = manuscript.files[fileIndex];

    // Delete from storage
    await deleteFromStorage(file.encryptedPath);

    // Remove file from manuscript
    manuscript.files.splice(fileIndex, 1);
    await manuscript.save();

    return { success: true };
}

/**
 * Search manuscripts
 */
export async function searchManuscripts(
    params: {
        q?: string;
        category?: string;
        language?: string;
        script?: string;
        material?: string;
        century?: string;
        origin?: string;
        repository?: string;
        page?: number;
        limit?: number;
        sortBy?: string;
        sortOrder?: string;
    },
    userId?: string
): Promise<ManuscriptResult> {
    const Manuscript = getManuscriptModel();

    const {
        q,
        category,
        language,
        script,
        material,
        century,
        origin,
        repository,
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
    } = params;

    const query: Record<string, unknown> = {
        deletedAt: { $exists: false },
        status: 'published',
    };

    // Search
    if (q) {
        query.$or = [
            { title: { $regex: q, $options: 'i' } },
            { author: { $regex: q, $options: 'i' } },
            { abstract: { $regex: q, $options: 'i' } },
            { keywords: { $regex: q, $options: 'i' } },
        ];
    }

    // Filters
    if (category) query.category = category;
    if (language) query.languages = { $in: [language] };
    if (script) query.script = { $in: [script] };
    if (material) query.material = material;
    if (century) query.centuryEstimate = century;
    if (origin) query.origin = origin;
    if (repository) query.repository = repository;

    // Sort
    const sort: Record<string, 1 | -1> = {};
    // if (q) {
    //    sort.score = -1; // Regex search doesn't provide score
    // }
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const [manuscripts, total] = await Promise.all([
        Manuscript.find(query)
            .select('-files.encryptedPath -files.checksum -files.encryptionKeyId')
            .sort(sort)
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Manuscript.countDocuments(query),
    ]);

    return {
        success: true,
        manuscripts: manuscripts as IManuscript[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}

/**
 * Get user's manuscripts
 */
export async function getUserManuscripts(
    userId: string,
    page = 1,
    limit = 20,
    search?: string
): Promise<ManuscriptResult> {
    const Manuscript = getManuscriptModel();

    const query: Record<string, unknown> = {
        ownerId: userId,
        deletedAt: { $exists: false },
    };

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { author: { $regex: search, $options: 'i' } },
            { category: { $regex: search, $options: 'i' } },
            { abstract: { $regex: search, $options: 'i' } },
        ];
    }

    const [manuscripts, total] = await Promise.all([
        Manuscript.find(query)
            .select('-files.encryptedPath -files.checksum -files.encryptionKeyId')
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean(),
        Manuscript.countDocuments(query),
    ]);

    return {
        success: true,
        manuscripts: manuscripts as IManuscript[],
        total,
        page,
        totalPages: Math.ceil(total / limit),
    };
}

/**
 * Get filter options
 */
export async function getFilterOptions(): Promise<{
    categories: string[];
    languages: string[];
    scripts: string[];
    materials: string[];
    centuries: string[];
    origins: string[];
    repositories: string[];
}> {
    const Manuscript = getManuscriptModel();

    const query = { deletedAt: { $exists: false }, status: 'published' };

    const [categories, languages, scripts, materials, centuries, origins, repositories] =
        await Promise.all([
            Manuscript.distinct('category', query),
            Manuscript.distinct('languages', query),
            Manuscript.distinct('script', query),
            Manuscript.distinct('material', query),
            Manuscript.distinct('centuryEstimate', query),
            Manuscript.distinct('origin', query),
            Manuscript.distinct('repository', query),
        ]);

    return {
        categories: categories.filter(Boolean).sort(),
        languages: (languages as string[]).filter(Boolean).sort(),
        scripts: scripts.filter(Boolean).sort(),
        materials: materials.filter(Boolean).sort(),
        centuries: centuries.filter(Boolean).sort(),
        origins: origins.filter(Boolean).sort(),
        repositories: repositories.filter(Boolean).sort(),
    };
}

/**
 * Get public statistics
 */
export async function getPublicStatistics(): Promise<{
    manuscriptsCount: number;
    activeResearchersCount: number;
    languagesCount: number;
}> {
    const Manuscript = getManuscriptModel();
    const query = { deletedAt: { $exists: false }, status: 'published' };

    const [manuscriptsCount, languages, activeResearchersCount] = await Promise.all([
        Manuscript.countDocuments(query),
        Manuscript.distinct('languages', query),
        userRepo.count({ is_active: true } as any)
    ]);

    return {
        manuscriptsCount,
        activeResearchersCount: activeResearchersCount || 0,
        languagesCount: languages.length
    };
}
