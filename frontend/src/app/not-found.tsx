'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function NotFound() {
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
                {/* Animated Error Icon or Large Number */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
                        <line x1="9" y1="9" x2="9.01" y2="9" />
                        <line x1="15" y1="9" x2="15.01" y2="9" />
                    </svg>
                </div>

                <h1 style={{
                    fontSize: '3rem',
                    fontWeight: '700',
                    color: '#0f172a', // var(--color-text-primary)
                    marginBottom: '0.5rem',
                    lineHeight: 1.2
                }}>404</h1>

                <h2 style={{
                    fontSize: '1.25rem',
                    fontWeight: '500',
                    color: '#475569', // var(--color-text-secondary)
                    marginBottom: '1.5rem'
                }}>Page Not Found</h2>

                <p style={{
                    color: '#64748b', // var(--color-text-muted)
                    marginBottom: '2rem',
                    fontSize: '1rem',
                    lineHeight: '1.6'
                }}>
                    The page you are looking for doesn't exist, has been removed, or is temporarily unavailable.
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
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5" /><path d="M12 19l-7-7 7-7" /></svg>
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
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>
                        Go Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
