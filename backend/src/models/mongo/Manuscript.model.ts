import { Schema, Model } from 'mongoose';
import { getMongoManuscriptsConnection } from '../../config/database.js';

export interface IManuscript {
    _id?: string;
    // Core metadata
    title: string;
    alternateTitle?: string;
    originalTitle?: string;

    // Authorship
    author?: string;
    scribe?: string;
    patron?: string;
    commentator?: string;
    translator?: string;

    // Classification
    subject: string[];
    category: string;
    subcategory?: string;
    languages: string[];
    script?: string[];

    // Physical description
    material?: string;
    format?: string;
    dimensions?: {
        height: number;
        width: number;
        unit: string;
    };
    folioCount?: number;
    lineCount?: number;
    condition?: string;
    conditionNotes?: string;

    // Date and origin
    dateComposed?: string;
    dateCopied?: string;
    centuryEstimate?: string;
    eraNotation?: string;
    origin?: string;

    // Repository information
    repository: string;
    repositoryId?: string;
    shelfMark?: string;
    accessionNumber?: string;
    doi?: string;

    // Content
    abstract: string;
    incipit?: string;
    explicit?: string;
    colophon?: string;
    tableOfContents?: string[];
    relatedManuscripts?: string[];

    // Access control
    ownerId: string;
    visibility: 'public' | 'private' | 'restricted';
    accessLevel: {
        metadata: 'public' | 'registered' | 'approved';
        content: 'registered' | 'approved' | 'owner';
        download: 'approved' | 'owner';
    };

    // Files
    files: {
        type: 'pdf' | 'image' | 'text';
        originalName: string;
        mimeType: string;
        size: number;
        encryptedPath: string;
        checksum: string;
        encryptionKeyId?: string;
        pageCount?: number;
        uploadedAt: Date;
    }[];

    coverThumbnail?: string;

    // Status
    status: 'draft' | 'review' | 'published' | 'archived';
    reviewedBy?: string;
    reviewNotes?: string;
    publishedAt?: Date;
    archivedAt?: Date;

    // Statistics
    viewCount: number;
    downloadCount: number;
    accessRequestCount: number;

    // SEO and discovery
    keywords: string[];
    tags: string[];

    // Soft delete
    deletedAt?: Date;
    deletedBy?: string;

    // Timestamps
    createdAt: Date;
    updatedAt: Date;
}

const ManuscriptSchema = new Schema<IManuscript>(
    {
        title: { type: String, required: true, index: 'text' },
        alternateTitle: { type: String, index: 'text' },
        originalTitle: { type: String },
        author: { type: String, index: 'text' },
        scribe: { type: String },
        patron: { type: String },
        commentator: { type: String },
        translator: { type: String },
        subject: [{ type: String, index: true }],
        category: { type: String, required: true, index: true },
        subcategory: { type: String },
        languages: [{ type: String, required: true, index: true }],
        script: [{ type: String, index: true }],
        material: { type: String, index: true },
        format: { type: String },
        dimensions: {
            height: { type: Number },
            width: { type: Number },
            unit: { type: String, default: 'cm' },
        },
        folioCount: { type: Number },
        lineCount: { type: Number },
        condition: { type: String },
        conditionNotes: { type: String },
        dateComposed: { type: String },
        dateCopied: { type: String },
        centuryEstimate: { type: String, index: true },
        eraNotation: { type: String },
        origin: { type: String, index: true },
        repository: { type: String, required: true, index: true },
        repositoryId: { type: String },
        shelfMark: { type: String },
        accessionNumber: { type: String },
        doi: { type: String, unique: true, sparse: true, index: true },
        abstract: { type: String, required: true, index: 'text' },
        incipit: { type: String },
        explicit: { type: String },
        colophon: { type: String },
        tableOfContents: [{ type: String }],
        relatedManuscripts: [{ type: String }],
        ownerId: { type: String, required: true, index: true },
        visibility: {
            type: String,
            enum: ['public', 'private', 'restricted'],
            default: 'restricted',
        },
        accessLevel: {
            metadata: { type: String, enum: ['public', 'registered', 'approved'], default: 'public' },
            content: { type: String, enum: ['registered', 'approved', 'owner'], default: 'approved' },
            download: { type: String, enum: ['approved', 'owner'], default: 'approved' },
        },
        files: [
            {
                type: { type: String, enum: ['pdf', 'image', 'text'], required: true },
                originalName: { type: String, required: true },
                mimeType: { type: String, required: true },
                size: { type: Number, required: true },
                encryptedPath: { type: String, required: true },
                checksum: { type: String, required: true },
                encryptionKeyId: { type: String },
                pageCount: { type: Number },
                uploadedAt: { type: Date, default: Date.now },
            },
        ],
        coverThumbnail: { type: String },
        status: {
            type: String,
            enum: ['draft', 'review', 'published', 'archived'],
            default: 'draft',
            index: true,
        },
        reviewedBy: { type: String },
        reviewNotes: { type: String },
        publishedAt: { type: Date },
        archivedAt: { type: Date },
        viewCount: { type: Number, default: 0 },
        downloadCount: { type: Number, default: 0 },
        accessRequestCount: { type: Number, default: 0 },
        keywords: [{ type: String, index: 'text' }],
        tags: [{ type: String, index: true }],
        deletedAt: { type: Date },
        deletedBy: { type: String },
    },
    {
        timestamps: true,
        collection: 'manuscripts',
    }
);

// Compound text index for search
// Using language_override to avoid conflict with the 'language' field (which is an array of manuscript languages)
ManuscriptSchema.index(
    { title: 'text', alternateTitle: 'text', author: 'text', abstract: 'text', keywords: 'text' },
    { weights: { title: 10, author: 5, keywords: 3, abstract: 1 }, language_override: 'textSearchLanguage' }
);

// Cache the model instance
let cachedModel: Model<IManuscript> | null = null;

export function getManuscriptModel(): Model<IManuscript> {
    if (!cachedModel) {
        const connection = getMongoManuscriptsConnection();
        cachedModel = connection.model<IManuscript>('Manuscript', ManuscriptSchema);
    }
    return cachedModel;
}
