// User types
export interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    institution?: string;
    designation?: string;
    researchInterests?: string;
    phone?: string;
    address?: string;
    verificationStatus: VerificationStatus;
    isEmailVerified: boolean;
    createdAt: string;
    lastLoginAt?: string;
}

export type UserRole = 'VISITOR' | 'USER' | 'OWNER' | 'REVIEWER' | 'ADMIN';

export type VerificationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';

// Authentication types
export interface AuthTokens {
    accessToken: string;
    refreshToken: string;
}

export interface LoginResponse {
    success: boolean;
    user: User;
    tokens: AuthTokens;
}

export interface RegisterData {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    institution?: string;
    designation?: string;
    researchInterests?: string;
    phone?: string;
}
