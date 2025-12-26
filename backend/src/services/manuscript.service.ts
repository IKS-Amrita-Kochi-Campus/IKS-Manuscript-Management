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
    language: string[];
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
        status: 'draft',
    });

    return {
        success: true,
        manuscript: manuscript.toObject() as IManuscript,
    };
}

/**
 * Get manuscript by ID
 */
export async function getManuscriptById(
    id: string,
    userId?: string
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

    // Increment view count
    await Manuscript.updateOne({ _id: id }, { $inc: { viewCount: 1 } });

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

    // Encrypt file
    const { encryptedContent, checksum } = await encryptFile(file.buffer);

    // Upload to storage
    const fileId = uuidv4();
    const storagePath = `manuscripts/${manuscriptId}/${fileId}.enc`;

    await uploadToStorage(storagePath, encryptedContent, 'application/octet-stream', {
        originalName: file.originalname,
        mimeType: file.mimetype,
        checksum,
    });

    // Determine file type
    let fileType: 'pdf' | 'image' | 'text' = 'text';
    if (file.mimetype === 'application/pdf') {
        fileType = 'pdf';
    } else if (file.mimetype.startsWith('image/')) {
        fileType = 'image';
    }

    // Add file to manuscript
    const fileData = {
        type: fileType,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
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

    // Text search
    if (q) {
        query.$text = { $search: q };
    }

    // Filters
    if (category) query.category = category;
    if (language) query.language = { $in: [language] };
    if (script) query.script = { $in: [script] };
    if (material) query.material = material;
    if (century) query.centuryEstimate = century;
    if (origin) query.origin = origin;
    if (repository) query.repository = repository;

    // Sort
    const sort: Record<string, 1 | -1> = {};
    if (q) {
        sort.score = -1; // Text search relevance
    }
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
    limit = 20
): Promise<ManuscriptResult> {
    const Manuscript = getManuscriptModel();

    const query = {
        ownerId: userId,
        deletedAt: { $exists: false },
    };

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
            Manuscript.distinct('language', query),
            Manuscript.distinct('script', query),
            Manuscript.distinct('material', query),
            Manuscript.distinct('centuryEstimate', query),
            Manuscript.distinct('origin', query),
            Manuscript.distinct('repository', query),
        ]);

    return {
        categories: categories.filter(Boolean).sort(),
        languages: languages.filter(Boolean).sort(),
        scripts: scripts.filter(Boolean).sort(),
        materials: materials.filter(Boolean).sort(),
        centuries: centuries.filter(Boolean).sort(),
        origins: origins.filter(Boolean).sort(),
        repositories: repositories.filter(Boolean).sort(),
    };
}
