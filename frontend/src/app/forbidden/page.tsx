'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function ForbiddenPage() {
    const router = useRouter();

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#f8fafc', // var(--color-surface)
            padding: '1rem',
            textAlign: 'center'
        }}>
            <div style={{
                background: 'white',
                padding: '3rem 2rem',
                borderRadius: '1rem', // var(--radius-xl)
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', // var(--shadow-lg)
                maxWidth: '500px',
                width: '100%'
            }}>
                {/* Lock Icon */}
                <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '50%',
                        background: '#fee2e2', // red-100
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}>
                        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                    </div>
                </div>

                <h1 style={{
                    fontSize: '2rem',
                    fontWeight: '700',
                    color: '#0f172a', // var(--color-text-primary)
                    marginBottom: '0.5rem',
                }}>Access Restricted</h1>

                <h2 style={{
                    fontSize: '1rem',
                    fontWeight: '500',
                    color: '#64748b', // var(--color-text-muted)
                    marginBottom: '1.5rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em'
                }}>403 Forbidden</h2>

                <p style={{
                    color: '#475569',
                    marginBottom: '2rem',
                    fontSize: '1rem',
                    lineHeight: '1.6'
                }}>
                    You don't have permission to access this page. Please contact an administrator if you believe this is an error.
                </p>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                    <button
                        onClick={() => router.back()}
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            border: '1px solid #e5e7eb',
                            background: 'white',
                            color: '#374151',
                            cursor: 'pointer',
                            fontWeight: 500,
                            fontSize: '0.95rem',
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        Go Back
                    </button>

                    <Link
                        href="/dashboard"
                        style={{
                            padding: '0.75rem 1.5rem',
                            borderRadius: '0.5rem',
                            background: '#059669', // var(--color-primary-600)
                            color: 'white',
                            cursor: 'pointer',
                            fontWeight: 500,
                            fontSize: '0.95rem',
                            textDecoration: 'none',
                            transition: 'all 0.2s',
                            border: '1px solid #059669',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem'
                        }}
                    >
                        Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
