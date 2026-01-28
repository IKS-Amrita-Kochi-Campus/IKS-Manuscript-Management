'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { API_BASE_URL } from '@/lib/api';

const LoadingSpinner = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </svg>
);

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');
        setMessage('');

        try {
            const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, phone }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to submit request');
            }

            setStatus('success');
            setMessage(data.message || 'Request sent successfully.');
        } catch (error: any) {
            setStatus('error');
            setMessage(error.message || 'An error occurred. Please try again.');
        }
    };

    return (
        <div className="split-layout-container">
            {/* Left Panel - Branding */}
            <div className="split-layout-left">
                <div style={{ maxWidth: '400px', textAlign: 'center' }}>
                    <div style={{
                        position: 'relative',
                        width: '80px',
                        height: '80px',
                        margin: '0 auto 2rem',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        <Image
                            src="/assets/iks.webp"
                            alt="IKS Logo"
                            fill
                            style={{ objectFit: 'contain' }}
                            priority
                            sizes="80px"
                        />
                    </div>
                    <h1 style={{
                        fontSize: '1.75rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        lineHeight: 1.3,
                        marginBottom: '1rem',
                    }}>
                        Account Access
                    </h1>
                    <p style={{
                        fontSize: '1rem',
                        color: '#64748b',
                        lineHeight: 1.6,
                        marginBottom: '3rem',
                    }}>
                        If you have lost access to your account, you can request a password reset from the administration.
                    </p>

                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '1.5rem',
                        opacity: 0.8,
                    }}>
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
                            <p style={{ fontSize: '0.75rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Supported By</p>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                                <Image
                                    src="/assets/govt.webp"
                                    alt="Government of India"
                                    height={80}
                                    width={80}
                                    style={{ objectFit: 'contain' }}
                                />
                                <Image
                                    src="/assets/amrita.webp"
                                    alt="Amrita Vishwa Vidyapeetham"
                                    height={80}
                                    width={200}
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel - Form */}
            <div className="split-layout-right">
                <div style={{ maxWidth: '360px', margin: '0 auto', width: '100%' }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        marginBottom: '0.5rem',
                    }}>
                        Forgot Password?
                    </h2>
                    <p style={{
                        fontSize: '0.9375rem',
                        color: '#64748b',
                        marginBottom: '2rem',
                    }}>
                        Enter your details to request a reset
                    </p>

                    {status === 'success' ? (
                        <div style={{
                            padding: '1rem',
                            background: '#dcfce7',
                            border: '1px solid #bbf7d0',
                            borderRadius: '0.5rem',
                            color: '#166534',
                            fontSize: '0.9375rem',
                        }}>
                            <p style={{ marginBottom: '1rem' }}>{message}</p>
                            <Link href="/login" style={{
                                display: 'block',
                                width: '100%',
                                padding: '0.75rem',
                                background: '#16a34a',
                                color: 'white',
                                textAlign: 'center',
                                borderRadius: '0.375rem',
                                textDecoration: 'none',
                                fontWeight: 500,
                            }}>
                                Return to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit}>
                            {status === 'error' && (
                                <div style={{
                                    padding: '0.75rem 1rem',
                                    background: '#fee2e2',
                                    border: '1px solid #fecaca',
                                    borderRadius: '0.5rem',
                                    marginBottom: '1.5rem',
                                    fontSize: '0.875rem',
                                    color: '#991b1b',
                                }}>
                                    {message}
                                </div>
                            )}

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
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#0f172a',
                                    marginBottom: '0.5rem',
                                }}>
                                    Mobile Number
                                </label>
                                <input
                                    type="tel"
                                    placeholder="e.g. +91 98765 43210"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    required
                                    minLength={10}
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

                            <button
                                type="submit"
                                disabled={status === 'loading'}
                                style={{
                                    width: '100%',
                                    height: '44px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '0.5rem',
                                    fontSize: '0.9375rem',
                                    fontWeight: 500,
                                    color: 'white',
                                    background: status === 'loading' ? '#6ee7b7' : '#059669',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                                    transition: 'all 0.15s',
                                    marginBottom: '1.5rem',
                                }}
                            >
                                {status === 'loading' && <LoadingSpinner />}
                                {status === 'loading' ? 'Sending Request...' : 'Send Request'}
                            </button>

                            <div style={{
                                textAlign: 'center',
                                fontSize: '0.875rem',
                            }}>
                                <Link href="/login" style={{
                                    color: '#64748b',
                                    textDecoration: 'none',
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.25rem'
                                }}>
                                    ← Back to Login
                                </Link>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}
