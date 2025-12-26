import multer from 'multer';
import path from 'path';
import { Request } from 'express';

// Allowed file types for manuscripts
const ALLOWED_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/tiff',
    'image/webp',
    'text/plain',
];

// Allowed file types for identity documents
const IDENTITY_MIME_TYPES = [
    'application/pdf',
    'image/jpeg',
    'image/png',
];

// Max file sizes
const MAX_MANUSCRIPT_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_IDENTITY_DOC_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_THUMBNAIL_SIZE = 5 * 1024 * 1024; // 5MB

// Memory storage for processing before encryption
const memoryStorage = multer.memoryStorage();

/**
 * File filter for manuscript files
 */
const manuscriptFileFilter = (
    _req: Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback
): void => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error(`File type ${file.mimetype} is not allowed. Allowed types: PDF, JPEG, PNG, TIFF, WebP, TXT`));
    }
};

/**
 * File filter for identity documents
 */
const identityFileFilter = (
    _req: Request,
    file: Express.Multer.File,
    callback: multer.FileFilterCallback
): void => {
    if (IDENTITY_MIME_TYPES.includes(file.mimetype)) {
        callback(null, true);
    } else {
        callback(new Error(`File type ${file.mimetype} is not allowed for identity documents. Allowed types: PDF, JPEG, PNG`));
    }
};

/**
 * Multer instance for manuscript uploads
 */
export const manuscriptUpload = multer({
    storage: memoryStorage,
    limits: {
        fileSize: MAX_MANUSCRIPT_SIZE,
        files: 10, // Max 10 files per upload
    },
    fileFilter: manuscriptFileFilter,
});

/**
 * Multer instance for identity document uploads
 */
export const identityUpload = multer({
    storage: memoryStorage,
    limits: {
        fileSize: MAX_IDENTITY_DOC_SIZE,
        files: 1, // Single file only
    },
    fileFilter: identityFileFilter,
});

/**
 * Multer instance for thumbnail uploads
 */
export const thumbnailUpload = multer({
    storage: memoryStorage,
    limits: {
        fileSize: MAX_THUMBNAIL_SIZE,
        files: 1,
    },
    fileFilter: (_req, file, callback) => {
        if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new Error('Thumbnail must be JPEG, PNG, or WebP'));
        }
    },
});

/**
 * Get file extension from mime type
 */
export function getExtensionFromMime(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
        'application/pdf': '.pdf',
        'image/jpeg': '.jpg',
        'image/png': '.png',
        'image/tiff': '.tiff',
        'image/webp': '.webp',
        'text/plain': '.txt',
    };
    return mimeToExt[mimeType] || '';
}

/**
 * Validate file is a valid manuscript type
 */
export function isValidManuscriptFile(mimeType: string): boolean {
    return ALLOWED_MIME_TYPES.includes(mimeType);
}

/**
 * Get file type category
 */
export function getFileType(mimeType: string): 'pdf' | 'image' | 'text' {
    if (mimeType === 'application/pdf') return 'pdf';
    if (mimeType.startsWith('image/')) return 'image';
    return 'text';
}
