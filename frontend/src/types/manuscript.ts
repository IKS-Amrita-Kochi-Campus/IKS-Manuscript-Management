// Manuscript types
export interface Manuscript {
    _id: string;
    title: string;
    alternateTitle?: string;
    originalTitle?: string;
    author?: string;
    scribe?: string;
    patron?: string;
    subject: string[];
    category: string;
    subcategory?: string;
    language: string[];
    script?: string[];
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
    dateComposed?: string;
    dateCopied?: string;
    centuryEstimate?: string;
    eraNotation?: string;
    origin?: string;
    repository: string;
    repositoryId?: string;
    abstract: string;
    incipit?: string;
    explicit?: string;
    colophon?: string;
    tableOfContents?: string[];
    relatedManuscripts?: string[];
    ownerId: string;
    visibility: 'public' | 'private' | 'restricted';
    accessLevel: {
        metadata: 'public' | 'registered' | 'approved';
        content: 'registered' | 'approved' | 'owner';
        download: 'approved' | 'owner';
    };
    files: ManuscriptFile[];
    coverThumbnail?: string;
    status: 'draft' | 'review' | 'published' | 'archived';
    publishedAt?: string;
    viewCount: number;
    downloadCount: number;
    accessRequestCount: number;
    keywords: string[];
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export interface ManuscriptFile {
    type: 'pdf' | 'image' | 'text';
    originalName: string;
    mimeType: string;
    size: number;
    pageCount?: number;
}

export interface ManuscriptCreateData {
    title: string;
    alternateTitle?: string;
    originalTitle?: string;
    author?: string;
    scribe?: string;
    patron?: string;
    subject: string[];
    category: string;
    subcategory?: string;
    language: string[];
    script?: string[];
    material?: string;
    format?: string;
    repository: string;
    abstract: string;
    keywords?: string[];
    tags?: string[];
    visibility?: 'public' | 'private' | 'restricted';
}

export interface ManuscriptSearchParams {
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
    sortBy?: 'relevance' | 'title' | 'date' | 'views';
    sortOrder?: 'asc' | 'desc';
}

export interface ManuscriptFilters {
    categories: string[];
    languages: string[];
    scripts: string[];
    materials: string[];
    centuries: string[];
    origins: string[];
    repositories: string[];
}
