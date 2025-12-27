import { z } from 'zod';

// User Registration Schema
export const registerSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    firstName: z.string().min(1, 'First name is required').max(50),
    lastName: z.string().min(1, 'Last name is required').max(50),
    institution: z.string().optional(),
    designation: z.string().optional(),
    researchInterests: z.string().optional(),
    phone: z.string().optional(),
});

// Login Schema
export const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

// Password Reset Request Schema
export const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

// Password Reset Schema
export const resetPasswordSchema = z.object({
    token: z.string().min(1, 'Reset token is required'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
});

// Profile Update Schema
export const updateProfileSchema = z.object({
    firstName: z.string().min(1).max(50).optional(),
    lastName: z.string().min(1).max(50).optional(),
    institution: z.string().optional(),
    designation: z.string().optional(),
    researchInterests: z.string().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
});

// Manuscript Create/Update Schema
export const manuscriptSchema = z.object({
    title: z.string().min(1, 'Title is required').max(500),
    alternateTitle: z.string().optional(),
    originalTitle: z.string().optional(),
    author: z.string().optional(),
    scribe: z.string().optional(),
    patron: z.string().optional(),
    subject: z.array(z.string()).min(1, 'At least one subject is required'),
    category: z.string().min(1, 'Category is required'),
    subcategory: z.string().optional(),
    languages: z.array(z.string()).min(1, 'At least one language is required'),
    script: z.array(z.string()).optional(),
    material: z.string().optional(),
    format: z.string().optional(),
    dimensions: z.object({
        height: z.number().positive().optional(),
        width: z.number().positive().optional(),
        unit: z.string().default('cm'),
    }).optional(),
    folioCount: z.number().int().positive().optional(),
    lineCount: z.number().int().positive().optional(),
    condition: z.string().optional(),
    conditionNotes: z.string().optional(),
    dateComposed: z.string().optional(),
    dateCopied: z.string().optional(),
    centuryEstimate: z.string().optional(),
    eraNotation: z.string().optional(),
    origin: z.string().optional(),
    repository: z.string().min(1, 'Repository is required'),
    repositoryId: z.string().optional(),
    abstract: z.string().min(10, 'Abstract must be at least 10 characters'),
    incipit: z.string().optional(),
    explicit: z.string().optional(),
    colophon: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    visibility: z.enum(['public', 'private', 'restricted']).default('restricted'),
});

// Access Request Schema
export const accessRequestSchema = z.object({
    manuscriptId: z.string().min(1, 'Manuscript ID is required'),
    requestedLevel: z.enum(['VIEW_METADATA', 'VIEW_CONTENT', 'DOWNLOAD', 'FULL_ACCESS']),
    purpose: z.string().min(10, 'Purpose must be at least 10 characters'),
    institution: z.string().min(1, 'Institution is required'),
    justification: z.string().min(50, 'Justification must be at least 50 characters'),
    duration: z.number().int().positive().optional(), // Days
});

// Access Request Review Schema
export const reviewAccessRequestSchema = z.object({
    status: z.enum(['APPROVED', 'REJECTED']),
    reviewNotes: z.string().optional(),
    approvedLevel: z.enum(['VIEW_METADATA', 'VIEW_CONTENT', 'DOWNLOAD', 'FULL_ACCESS']).optional(),
    approvedDuration: z.number().int().positive().optional(), // Days
});

// User Role Update Schema
export const updateRoleSchema = z.object({
    role: z.enum(['VISITOR', 'USER', 'OWNER', 'REVIEWER', 'ADMIN']),
});

// Identity Verification Schema
export const verifyIdentitySchema = z.object({
    status: z.enum(['VERIFIED', 'REJECTED']),
    reviewNotes: z.string().optional(),
});

// Search Query Schema
export const searchSchema = z.object({
    q: z.string().optional(),
    category: z.string().optional(),
    language: z.string().optional(),
    script: z.string().optional(),
    material: z.string().optional(),
    century: z.string().optional(),
    origin: z.string().optional(),
    repository: z.string().optional(),
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    sortBy: z.enum(['relevance', 'title', 'date', 'views']).default('relevance'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Pagination Schema
export const paginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
export type ManuscriptInput = z.infer<typeof manuscriptSchema>;
export type AccessRequestInput = z.infer<typeof accessRequestSchema>;
export type ReviewAccessRequestInput = z.infer<typeof reviewAccessRequestSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type VerifyIdentityInput = z.infer<typeof verifyIdentitySchema>;
export type SearchInput = z.infer<typeof searchSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
