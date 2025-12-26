/**
 * API Client with automatic token refresh
 */

import { User, RegisterData, LoginResponse, AuthTokens } from '@/types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

interface TokenResponse {
    success: boolean;
    tokens?: {
        accessToken: string;
        refreshToken: string;
    };
    error?: string;
}

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

// ============================================================
// Token Management Functions
// ============================================================

/**
 * Get the access token from localStorage
 */
export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
}

/**
 * Get the refresh token from localStorage
 */
export function getRefreshToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('refreshToken');
}

/**
 * Set both access and refresh tokens
 */
export function setTokens(accessToken: string, refreshToken: string): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
}

/**
 * Clear all tokens from localStorage
 */
export function clearTokens(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
}

// ============================================================
// Token Refresh
// ============================================================

/**
 * Refresh the access token using the refresh token
 */
async function refreshAccessToken(): Promise<boolean> {
    const refreshToken = getRefreshToken();

    if (!refreshToken) {
        return false;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ refreshToken }),
        });

        const data: TokenResponse = await response.json();

        if (data.success && data.tokens) {
            setTokens(data.tokens.accessToken, data.tokens.refreshToken);
            return true;
        }

        return false;
    } catch (error) {
        console.error('Token refresh failed:', error);
        return false;
    }
}

/**
 * Clear all auth data and redirect to login
 */
function clearAuthAndRedirect(): void {
    clearTokens();

    // Only redirect if we're in the browser and not already on the login page
    if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
    }
}

// ============================================================
// Fetch Helpers with Authentication
// ============================================================

/**
 * Fetch with authentication and automatic token refresh
 */
export async function fetchWithAuth(
    url: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = getAccessToken();

    if (!token) {
        clearAuthAndRedirect();
        throw new Error('No access token');
    }

    // Make the initial request
    let response = await fetch(url, {
        ...options,
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
        },
    });

    // If unauthorized, try to refresh the token
    if (response.status === 401) {
        // Avoid multiple simultaneous refresh requests
        if (!isRefreshing) {
            isRefreshing = true;
            refreshPromise = refreshAccessToken();
        }

        const refreshed = await refreshPromise;
        isRefreshing = false;
        refreshPromise = null;

        if (refreshed) {
            // Retry the request with the new token
            const newToken = getAccessToken();
            response = await fetch(url, {
                ...options,
                headers: {
                    'Authorization': `Bearer ${newToken}`,
                    'Content-Type': 'application/json',
                    ...options.headers,
                },
            });
        } else {
            // Refresh failed, redirect to login
            clearAuthAndRedirect();
            throw new Error('Session expired');
        }
    }

    return response;
}

/**
 * Fetch JSON with authentication
 */
export async function fetchJsonWithAuth<T = unknown>(
    url: string,
    options: RequestInit = {}
): Promise<T> {
    const response = await fetchWithAuth(url, options);
    return response.json();
}

/**
 * Get the full API URL
 */
export function getApiUrl(path: string): string {
    return `${API_BASE_URL}${path}`;
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    return !!getAccessToken();
}

/**
 * Logout user
 */
export async function logout(): Promise<void> {
    try {
        await fetchWithAuth(`${API_BASE_URL}/auth/logout`, {
            method: 'POST',
        });
    } catch (error) {
        // Ignore errors during logout
        console.error('Logout error:', error);
    } finally {
        clearAuthAndRedirect();
    }
}

// ============================================================
// API Object (for AuthContext compatibility)
// ============================================================

export const api = {
    auth: {
        async login(email: string, password: string): Promise<LoginResponse & { tokens?: AuthTokens }> {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });
            return response.json();
        },

        async register(data: RegisterData): Promise<{ success: boolean; error?: string }> {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            return response.json();
        },

        async logout(): Promise<void> {
            await fetchWithAuth(`${API_BASE_URL}/auth/logout`, {
                method: 'POST',
            });
        },

        async refresh(): Promise<TokenResponse> {
            const refreshToken = getRefreshToken();
            const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            });
            return response.json();
        },
    },

    users: {
        async getProfile(): Promise<{ success: boolean; user: User }> {
            return fetchJsonWithAuth(getApiUrl('/users/me'));
        },

        async updateProfile(data: Partial<User>): Promise<{ success: boolean; user: User }> {
            return fetchJsonWithAuth(getApiUrl('/users/me'), {
                method: 'PUT',
                body: JSON.stringify(data),
            });
        },
    },
};

export { API_BASE_URL };
