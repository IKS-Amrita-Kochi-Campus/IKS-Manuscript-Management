'use client';

import React, { useState } from 'react';
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

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
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

export default function RegisterPage() {
    const router = useRouter();
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form fields
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [institution, setInstitution] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!agreedToTerms) {
            setError('Please agree to the Terms of Service and Privacy Policy');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    firstName,
                    lastName,
                    email,
                    password,
                    institution,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                // Check for validation errors with details
                if (data.details && Array.isArray(data.details)) {
                    const messages = data.details.map((d: { field: string; message: string }) =>
                        `${d.field}: ${d.message}`
                    ).join('. ');
                    setError(messages || data.error || 'Registration failed. Please try again.');
                } else {
                    setError(data.error || 'Registration failed. Please try again.');
                }
                setLoading(false);
                return;
            }

            setSuccess('Registration successful! Please check your email to verify your account.');

            // Redirect to login after a short delay
            setTimeout(() => {
                router.push('/login');
            }, 2000);
        } catch (err) {
            console.error('Registration error:', err);
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
                        Join the Research Community
                    </h1>
                    <p style={{
                        fontSize: '1rem',
                        color: '#64748b',
                        lineHeight: 1.6,
                        marginBottom: '2rem',
                    }}>
                        Create your account to access our comprehensive digital archive and collaborate with researchers worldwide.
                    </p>

                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem',
                        textAlign: 'left',
                    }}>
                        {[
                            'Access 12,000+ digitized manuscripts',
                            'Collaborate with global researchers',
                            'Advanced search and annotation tools',
                            'Secure and authenticated access',
                        ].map((feature) => (
                            <div key={feature} style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                fontSize: '0.875rem',
                                color: '#475569',
                            }}>
                                <div style={{
                                    width: '20px',
                                    height: '20px',
                                    background: '#ecfdf5',
                                    borderRadius: '50%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#059669',
                                    flexShrink: 0,
                                }}>
                                    <CheckIcon />
                                </div>
                                {feature}
                            </div>
                        ))}
                    </div>
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
                overflowY: 'auto',
            }}>
                <div style={{ maxWidth: '360px', margin: '0 auto', width: '100%' }}>
                    <h2 style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        marginBottom: '0.5rem',
                    }}>
                        Create your account
                    </h2>
                    <p style={{
                        fontSize: '0.9375rem',
                        color: '#64748b',
                        marginBottom: '2rem',
                    }}>
                        Start your research journey today
                    </p>

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

                    {success && (
                        <div style={{
                            padding: '0.75rem 1rem',
                            background: '#dcfce7',
                            border: '1px solid #bbf7d0',
                            borderRadius: '0.5rem',
                            marginBottom: '1.5rem',
                            fontSize: '0.875rem',
                            color: '#166534',
                        }}>
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit}>
                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: '1fr 1fr',
                            gap: '1rem',
                            marginBottom: '1.25rem',
                        }}>
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#0f172a',
                                    marginBottom: '0.5rem',
                                }}>
                                    First Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="John"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
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
                            <div>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#0f172a',
                                    marginBottom: '0.5rem',
                                }}>
                                    Last Name
                                </label>
                                <input
                                    type="text"
                                    placeholder="Doe"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
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
                        </div>

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
                                Institution / Organization
                            </label>
                            <input
                                type="text"
                                placeholder="University or Research Institute"
                                value={institution}
                                onChange={(e) => setInstitution(e.target.value)}
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
                                Password
                            </label>
                            <div style={{ position: 'relative' }}>
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Minimum 8 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
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
                            <p style={{
                                fontSize: '0.8125rem',
                                color: '#64748b',
                                marginTop: '0.5rem',
                            }}>
                                Must be at least 8 characters
                            </p>
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: '0.75rem',
                            marginBottom: '1.5rem',
                        }}>
                            <button
                                type="button"
                                onClick={() => setAgreedToTerms(!agreedToTerms)}
                                style={{
                                    width: '20px',
                                    height: '20px',
                                    border: `1px solid ${agreedToTerms ? '#059669' : '#e5e7eb'}`,
                                    borderRadius: '4px',
                                    background: agreedToTerms ? '#059669' : 'white',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    flexShrink: 0,
                                    marginTop: '2px',
                                    color: 'white',
                                }}
                            >
                                {agreedToTerms && <CheckIcon />}
                            </button>
                            <label style={{
                                fontSize: '0.8125rem',
                                color: '#64748b',
                                lineHeight: 1.5,
                            }}>
                                I agree to the{' '}
                                <Link href="/terms" style={{ color: '#059669', textDecoration: 'none' }}>
                                    Terms of Service
                                </Link>
                                {' '}and{' '}
                                <Link href="/privacy" style={{ color: '#059669', textDecoration: 'none' }}>
                                    Privacy Policy
                                </Link>
                            </label>
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
                            {loading ? 'Creating Account...' : 'Create Account'}
                        </button>
                    </form>

                    <div style={{
                        textAlign: 'center',
                        fontSize: '0.875rem',
                        color: '#64748b',
                    }}>
                        Already have an account?{' '}
                        <Link href="/login" style={{
                            color: '#059669',
                            fontWeight: 500,
                            textDecoration: 'none',
                        }}>
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
