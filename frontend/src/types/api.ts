// API Response types
export interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    error?: string;
    code?: string;
    message?: string;
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        total: number;
        page: number;
        totalPages: number;
    };
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface ApiError {
    success: false;
    error: string;
    code?: string;
    details?: ValidationError[];
}

// Access Request types
export type AccessLevel = 'VIEW_METADATA' | 'VIEW_CONTENT' | 'DOWNLOAD' | 'FULL_ACCESS';

export type AccessRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'REVOKED' | 'EXPIRED';

export interface AccessRequest {
    id: string;
    manuscriptId: string;
    requesterId: string;
    requester?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        institution?: string;
    };
    requestedLevel: AccessLevel;
    purpose: string;
    institution: string;
    justification: string;
    duration?: number;
    status: AccessRequestStatus;
    reviewerId?: string;
    reviewer?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
    };
    reviewedAt?: string;
    reviewNotes?: string;
    approvedLevel?: AccessLevel;
    approvedDuration?: number;
    createdAt: string;
    updatedAt: string;
}

export interface AccessRequestCreate {
    manuscriptId: string;
    requestedLevel: AccessLevel;
    purpose: string;
    institution: string;
    justification: string;
    duration?: number;
}

// Audit Log types
export interface AuditLog {
    _id: string;
    userId?: string;
    userEmail?: string;
    userRole?: string;
    action: string;
    actionCategory: string;
    status: 'success' | 'failure' | 'pending';
    resourceType?: string;
    resourceId?: string;
    resourceName?: string;
    method: string;
    path: string;
    statusCode?: number;
    responseTime?: number;
    ipAddress: string;
    userAgent?: string;
    timestamp: string;
}

// Statistics types
export interface PlatformStatistics {
    users: {
        total: number;
        active: number;
        verified: number;
    };
    manuscripts: {
        total: number;
        published: number;
    };
    pending: {
        accessRequests: number;
        verifications: number;
    };
}
