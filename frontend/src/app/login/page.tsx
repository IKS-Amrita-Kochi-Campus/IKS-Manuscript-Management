'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Icon Components
const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const EyeOffIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
        <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
);

const LoadingSpinner = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </svg>
);

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export default function LoginPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [info, setInfo] = useState('');
    const [loading, setLoading] = useState(false);

    // Check for session expired message on mount
    useEffect(() => {
        const authMessage = sessionStorage.getItem('authMessage');
        if (authMessage) {
            setInfo(authMessage);
            sessionStorage.removeItem('authMessage');
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(data.error || 'Login failed. Please check your credentials.');
                setLoading(false);
                return;
            }

            // Store tokens in localStorage
            if (data.tokens) {
                localStorage.setItem('accessToken', data.tokens.accessToken);
                localStorage.setItem('refreshToken', data.tokens.refreshToken);
            }

            // Store user info
            if (data.user) {
                localStorage.setItem('user', JSON.stringify(data.user));
            }

            // Redirect to dashboard
            router.push('/dashboard');
        } catch (err) {
            console.error('Login error:', err);
            setError('Unable to connect to the server. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            background: '#f8fafc',
        }}>
            {/* Left Panel - Branding */}
            <div style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '3rem',
                background: '#f8fafc',
                borderRight: '1px solid #e5e7eb',
            }}>
                <div style={{ maxWidth: '400px', textAlign: 'center' }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: '#059669',
                        borderRadius: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '24px',
                        fontWeight: 700,
                        color: 'white',
                        margin: '0 auto 2rem',
                    }}>
                        IKS
                    </div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        lineHeight: 1.3,
                        marginBottom: '1rem',
                    }}>
                        Indigenous Knowledge Systems
                    </h1>
                    <p style={{
                        fontSize: '1rem',
                        color: '#64748b',
                        lineHeight: 1.6,
                    }}>
                        Access thousands of manuscripts, collaborate with researchers worldwide, and contribute to preserving traditional wisdom.
                    </p>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div style={{
                width: '540px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                padding: '3rem',
                background: 'white',
            }}>
                <div style={{ maxWidth: '360px', margin: '0 auto', width: '100%' }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        marginBottom: '0.5rem',
                    }}>
                        Welcome back
                    </h2>
                    <p style={{
                        fontSize: '0.9375rem',
                        color: '#64748b',
                        marginBottom: '2rem',
                    }}>
                        Sign in to continue your research
                    </p>

                    {info && (
                        <div style={{
                            padding: '0.75rem 1rem',
                            background: '#dbeafe',
                            border: '1px solid #bfdbfe',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem',
                            fontSize: '0.875rem',
                            color: '#1e40af',
                        }}>
                            {info}
                        </div>
                    )}

                    {error && (
                        <div style={{
                            padding: '0.75rem 1rem',
                            background: '#fee2e2',
                            border: '1px solid #fecaca',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem',
                            fontSize: '0.875rem',
                            color: '#991b1b',
                        }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{ marginBottom: '1.25rem' }}>
                            <label style={{
                                display: 'block',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: '#0f172a',
                                marginBottom: '0.5rem',
                            }}>
                                Email Address
                            </label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    height: '44px',
                                    padding: '0 0.875rem',
                                    fontSize: '0.9375rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    background: 'white',
                                    color: '#0f172a',
                                    outline: 'none',
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: '1.25rem' }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: '0.5rem',
                            }}>
                                <label style={{
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#0f172a',
                                }}>
                                    Password
                                </label>
                                <Link href="/forgot-password" style={{
                                    fontSize: '0.8125rem',
                                    color: '#059669',
                                    textDecoration: 'none',
                                }}>
                                    Forgot password?
                                </Link>
                            </div>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        height: '44px',
                                        padding: '0 2.75rem 0 0.875rem',
                                        fontSize: '0.9375rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        background: 'white',
                                        color: '#0f172a',
                                        outline: 'none',
                                    }}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{
                                        position: 'absolute',
                                        right: '0.75rem',
                                        top: '50%',
                                        transform: 'translateY(-50%)',
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#64748b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                    }}
                                >
                                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                height: '44px',
                                fontSize: '0.9375rem',
                                fontWeight: 500,
                                color: 'white',
                                background: loading ? '#6ee7b7' : '#059669',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'all 0.15s',
                                marginBottom: '1.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                gap: '0.5rem',
                            }}
                        >
                            {loading && <LoadingSpinner />}
                            {loading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    <div style={{
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        color: '#64748b',
                    }}>
                        Don&apos;t have an account?{' '}
                        <Link href="/register" style={{
                            color: '#059669',
                            fontWeight: 500,
                            textDecoration: 'none',
                        }}>
                            Create one
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
