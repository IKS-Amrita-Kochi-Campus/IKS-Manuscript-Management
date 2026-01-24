'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { API_BASE_URL } from '@/lib/api';

// Types
interface Manuscript {
    _id: string;
    title: string;
    alternateTitle?: string;
    author: string;
    category: string;
    subject?: string[];
    languages?: string[];
    visibility: string;
    status: string;
    abstract?: string;
    centuryEstimate?: string;
    origin?: string;
    material?: string;
    repository?: string;
    viewCount?: number;
    keywords?: string[];
    createdAt?: string;
    files?: Array<{
        originalName: string;
        mimeType: string;
        size: number;
    }>;
}

// Icons
const ArrowLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
    </svg>
);

const BookIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);

const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const LockIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const FileIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

const LoadingSpinner = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
);

// Header Component
const Header = () => (
    <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '64px',
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        borderBottom: '1px solid #e5e7eb',
        zIndex: 100,
    }}>
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 2rem',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
        }}>
            <Link href="/" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                textDecoration: 'none',
            }}>
                <div style={{
                    width: '36px',
                    height: '36px',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontSize: '14px',
                    fontWeight: 700,
                }}>
                    IKS
                </div>
                <span style={{
                    fontSize: '1.125rem',
                    fontWeight: 600,
                    color: '#0f172a',
                }}>
                    Indigenous Knowledge Systems
                </span>
            </Link>

            <nav style={{
                display: 'flex',
                alignItems: 'center',
                gap: '2rem',
            }}>
                <Link href="/manuscripts" style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#059669',
                    textDecoration: 'none',
                }}>
                    Browse Archive
                </Link>
                <Link href="/about" style={{
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#475569',
                    textDecoration: 'none',
                }}>
                    About
                </Link>
            </nav>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
            }}>
                <Link href="/login" style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#475569',
                    textDecoration: 'none',
                    borderRadius: '0.5rem',
                }}>
                    Sign In
                </Link>
                <Link href="/register" style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'white',
                    textDecoration: 'none',
                    background: '#059669',
                    borderRadius: '0.5rem',
                }}>
                    Get Started
                </Link>
            </div>
        </div>
    </header>
);

// Footer Component
const Footer = () => (
    <footer style={{
        background: '#f8fafc',
        borderTop: '1px solid #e5e7eb',
        padding: '2rem 0',
        marginTop: 'auto',
    }}>
        <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 2rem',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
        }}>
            <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                © {new Date().getFullYear()} Indigenous Knowledge Systems. All rights reserved.
            </p>
            <div style={{ display: 'flex', gap: '1.5rem' }}>
                <Link href="/manuscripts" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>
                    Browse Archive
                </Link>
                <Link href="/about" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>
                    About
                </Link>
            </div>
        </div>
    </footer>
);

export default function PublicManuscriptDetailPage() {
    const params = useParams();
    const id = params.id as string;

    const [manuscript, setManuscript] = useState<Manuscript | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (id) {
            fetchManuscript();
        }
    }, [id]);

    const fetchManuscript = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetch(`${API_BASE_URL}/manuscripts/${id}`);
            const data = await response.json();

            if (data.success) {
                setManuscript(data.manuscript);
            } else {
                setError(data.error || 'Manuscript not found');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load manuscript details');
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header />
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: '64px',
                }}>
                    <LoadingSpinner />
                    <span style={{ marginLeft: '1rem', color: '#64748b' }}>Loading manuscript...</span>
                </div>
                <Footer />
            </div>
        );
    }

    if (error || !manuscript) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Header />
                <div style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    paddingTop: '64px',
                    textAlign: 'center',
                }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
                            Manuscript Not Found
                        </h2>
                        <p style={{ color: '#64748b', marginBottom: '1.5rem' }}>
                            {error || 'The manuscript you are looking for does not exist or has been removed.'}
                        </p>
                        <Link href="/manuscripts" style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: '#059669',
                            color: 'white',
                            textDecoration: 'none',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                        }}>
                            <ArrowLeftIcon /> Back to Archive
                        </Link>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            <Header />

            <main style={{
                flex: 1,
                paddingTop: 'calc(64px + 2rem)',
                paddingBottom: '3rem',
            }}>
                <div style={{
                    maxWidth: '1000px',
                    margin: '0 auto',
                    padding: '0 2rem',
                }}>
                    {/* Back Button */}
                    <Link href="/manuscripts" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#64748b',
                        textDecoration: 'none',
                        fontSize: '0.875rem',
                        marginBottom: '1.5rem',
                    }}>
                        <ArrowLeftIcon /> Back to Archive
                    </Link>

                    {/* Header Section */}
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        padding: '2rem',
                        marginBottom: '1.5rem',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <h1 style={{
                                    fontSize: '1.75rem',
                                    fontWeight: 600,
                                    color: '#0f172a',
                                    marginBottom: '0.5rem',
                                    lineHeight: 1.3,
                                }}>
                                    {manuscript.title}
                                </h1>
                                {manuscript.alternateTitle && (
                                    <p style={{ fontSize: '1rem', color: '#64748b', fontStyle: 'italic' }}>
                                        {manuscript.alternateTitle}
                                    </p>
                                )}
                            </div>
                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <span style={{
                                    padding: '0.375rem 0.75rem',
                                    background: manuscript.visibility === 'public' ? '#dcfce7' : '#fef3c7',
                                    color: manuscript.visibility === 'public' ? '#166534' : '#92400e',
                                    borderRadius: '999px',
                                    fontSize: '0.75rem',
                                    fontWeight: 600,
                                    textTransform: 'uppercase',
                                }}>
                                    {manuscript.visibility}
                                </span>
                            </div>
                        </div>

                        <p style={{ fontSize: '1rem', color: '#475569', marginBottom: '1.5rem' }}>
                            by <strong>{manuscript.author}</strong>
                        </p>

                        {/* Quick Info */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.375rem',
                                padding: '0.375rem 0.75rem',
                                background: '#f1f5f9',
                                borderRadius: '6px',
                                fontSize: '0.8125rem',
                                color: '#475569',
                            }}>
                                <BookIcon /> {manuscript.category}
                            </div>
                            {manuscript.centuryEstimate && (
                                <div style={{
                                    padding: '0.375rem 0.75rem',
                                    background: '#f1f5f9',
                                    borderRadius: '6px',
                                    fontSize: '0.8125rem',
                                    color: '#475569',
                                }}>
                                    {manuscript.centuryEstimate}
                                </div>
                            )}
                            {manuscript.languages && manuscript.languages.length > 0 && (
                                <div style={{
                                    padding: '0.375rem 0.75rem',
                                    background: '#f1f5f9',
                                    borderRadius: '6px',
                                    fontSize: '0.8125rem',
                                    color: '#475569',
                                }}>
                                    {manuscript.languages.join(', ')}
                                </div>
                            )}
                            {manuscript.viewCount !== undefined && (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    padding: '0.375rem 0.75rem',
                                    background: '#f1f5f9',
                                    borderRadius: '6px',
                                    fontSize: '0.8125rem',
                                    color: '#475569',
                                }}>
                                    <EyeIcon /> {manuscript.viewCount} views
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '1.5rem' }}>
                        {/* Left Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {/* Abstract */}
                            <div style={{
                                background: 'white',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                padding: '1.5rem',
                            }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                                    Abstract
                                </h3>
                                <p style={{ color: '#475569', lineHeight: 1.7, margin: 0 }}>
                                    {manuscript.abstract || 'No abstract available for this manuscript.'}
                                </p>
                            </div>

                            {/* Keywords */}
                            {manuscript.keywords && manuscript.keywords.length > 0 && (
                                <div style={{
                                    background: 'white',
                                    borderRadius: '12px',
                                    border: '1px solid #e5e7eb',
                                    padding: '1.5rem',
                                }}>
                                    <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                                        Keywords
                                    </h3>
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                                        {manuscript.keywords.map((keyword, index) => (
                                            <span
                                                key={index}
                                                style={{
                                                    padding: '0.25rem 0.625rem',
                                                    background: '#ecfdf5',
                                                    color: '#059669',
                                                    borderRadius: '999px',
                                                    fontSize: '0.8125rem',
                                                    fontWeight: 500,
                                                }}
                                            >
                                                {keyword}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Files Section - Public View */}
                            <div style={{
                                background: 'white',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                padding: '1.5rem',
                            }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                                    Manuscript Files
                                </h3>

                                {manuscript.visibility === 'public' ? (
                                    manuscript.files && manuscript.files.length > 0 ? (
                                        <div>
                                            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                                                Sign in to view and download the full manuscript files.
                                            </p>
                                            {manuscript.files.map((file, index) => (
                                                <div
                                                    key={index}
                                                    style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: '0.75rem',
                                                        padding: '0.75rem',
                                                        background: '#f8fafc',
                                                        borderRadius: '8px',
                                                        marginBottom: '0.5rem',
                                                    }}
                                                >
                                                    <FileIcon />
                                                    <div>
                                                        <div style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>
                                                            {file.originalName}
                                                        </div>
                                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <Link href="/login" style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                gap: '0.5rem',
                                                padding: '0.625rem 1rem',
                                                background: '#059669',
                                                color: 'white',
                                                textDecoration: 'none',
                                                borderRadius: '0.5rem',
                                                fontSize: '0.875rem',
                                                fontWeight: 500,
                                                marginTop: '1rem',
                                            }}>
                                                Sign In to Access Files
                                            </Link>
                                        </div>
                                    ) : (
                                        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
                                            No files available for this manuscript.
                                        </p>
                                    )
                                ) : (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '2rem',
                                        background: '#f8fafc',
                                        borderRadius: '8px',
                                    }}>
                                        <div style={{ color: '#94a3b8', marginBottom: '1rem' }}>
                                            <LockIcon />
                                        </div>
                                        <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
                                            Restricted Access
                                        </h4>
                                        <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '1rem' }}>
                                            This manuscript requires special permission to access. Sign in and request access from the owner.
                                        </p>
                                        <Link href="/login" style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.625rem 1rem',
                                            background: '#059669',
                                            color: 'white',
                                            textDecoration: 'none',
                                            borderRadius: '0.5rem',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                        }}>
                                            Sign In to Request Access
                                        </Link>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Right Column - Metadata */}
                        <div>
                            <div style={{
                                background: 'white',
                                borderRadius: '12px',
                                border: '1px solid #e5e7eb',
                                padding: '1.5rem',
                                position: 'sticky',
                                top: 'calc(64px + 1rem)',
                            }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.25rem' }}>
                                    Manuscript Details
                                </h3>

                                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                    <div>
                                        <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                            Category
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>
                                            {manuscript.category}
                                        </div>
                                    </div>

                                    {manuscript.subject && manuscript.subject.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                                Subject
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>
                                                {manuscript.subject.join(', ')}
                                            </div>
                                        </div>
                                    )}

                                    {manuscript.languages && manuscript.languages.length > 0 && (
                                        <div>
                                            <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                                Languages
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>
                                                {manuscript.languages.join(', ')}
                                            </div>
                                        </div>
                                    )}

                                    {manuscript.material && (
                                        <div>
                                            <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                                Material
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>
                                                {manuscript.material}
                                            </div>
                                        </div>
                                    )}

                                    {manuscript.origin && (
                                        <div>
                                            <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                                Origin
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>
                                                {manuscript.origin}
                                            </div>
                                        </div>
                                    )}

                                    {manuscript.repository && (
                                        <div>
                                            <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                                Repository
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>
                                                {manuscript.repository}
                                            </div>
                                        </div>
                                    )}

                                    {manuscript.centuryEstimate && (
                                        <div>
                                            <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                                Century
                                            </div>
                                            <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>
                                                {manuscript.centuryEstimate}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>
                                            Added to Archive
                                        </div>
                                        <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>
                                            {formatDate(manuscript.createdAt)}
                                        </div>
                                    </div>
                                </div>

                                {/* CTA */}
                                <div style={{
                                    marginTop: '1.5rem',
                                    paddingTop: '1.5rem',
                                    borderTop: '1px solid #e5e7eb',
                                }}>
                                    <p style={{ fontSize: '0.8125rem', color: '#64748b', marginBottom: '1rem' }}>
                                        Want to access this manuscript or contribute to the archive?
                                    </p>
                                    <Link href="/register" style={{
                                        display: 'block',
                                        textAlign: 'center',
                                        padding: '0.75rem 1rem',
                                        background: '#059669',
                                        color: 'white',
                                        textDecoration: 'none',
                                        borderRadius: '0.5rem',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                    }}>
                                        Create Free Account
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
