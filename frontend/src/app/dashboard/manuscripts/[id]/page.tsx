'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchJsonWithAuth, getApiUrl, isAuthenticated } from '@/lib/api';
import ImageViewer from '@/components/ImageViewer';

// Icons
const ArrowLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
    </svg>
);

const DownloadIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const EyeIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const LockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
);

const LoadingSpinner = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
);

const BookmarkIcon = ({ filled }: { filled?: boolean }) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

interface Manuscript {
    _id: string;
    title: string;
    alternateTitle?: string;
    author: string;
    category: string;
    subject?: string;
    languages?: string[];
    visibility: string;
    status: string;
    abstract?: string;
    centuryEstimate?: string;
    origin?: string;
    doi?: string;
    viewCount?: number;
    ownerId: string;
    files?: Array<{
        name: string;
        mimetype: string;
        size: number;
    }>;
}

interface User {
    id: string;
    verification_status: string;
}

interface AccessStatus {
    hasAccess: boolean;
    level?: string;
    status?: string;
}

export default function ManuscriptDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [user, setUser] = useState<User | null>(null);
    const [manuscript, setManuscript] = useState<Manuscript | null>(null);
    const [accessStatus, setAccessStatus] = useState<AccessStatus>({ hasAccess: false });
    const [loading, setLoading] = useState(true);
    const [requestingAccess, setRequestingAccess] = useState(false);
    const [requestPurpose, setRequestPurpose] = useState('');
    const [requestLevel, setRequestLevel] = useState('VIEW_CONTENT');
    const [showRequestForm, setShowRequestForm] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isBookmarked, setIsBookmarked] = useState(false);
    const [bookmarkLoading, setBookmarkLoading] = useState(false);
    const [viewingImage, setViewingImage] = useState<{ url: string; name: string; index: number } | null>(null);

    // Check if current user is the owner
    const isOwner = user && manuscript && user.id === manuscript.ownerId;

    // Owner always has full access
    const hasFullAccess = isOwner || accessStatus.hasAccess || manuscript?.visibility === 'public';

    const fetchData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch manuscript details
            const response = await fetchJsonWithAuth<{ success: boolean; manuscript: Manuscript }>(getApiUrl(`/manuscripts/${id}`));
            if (response.success) {
                setManuscript(response.manuscript);
            } else {
                setError('Manuscript not found');
            }

            // Fetch user profile
            const userResponse = await fetchJsonWithAuth<{ success: boolean; user: User }>(getApiUrl('/users/me'));
            if (userResponse.success) {
                setUser(userResponse.user);
            }

            // Check access status
            const accessResponse = await fetchJsonWithAuth<{ success: boolean; hasAccess: boolean; level?: string; status?: string }>(
                getApiUrl(`/access-requests/check/${id}`)
            );
            if (accessResponse.success) {
                setAccessStatus({
                    hasAccess: accessResponse.hasAccess,
                    level: accessResponse.level,
                    status: accessResponse.status
                });
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load manuscript details');
        } finally {
            setLoading(false);
        }
    };

    const checkBookmark = async () => {
        try {
            const response = await fetchJsonWithAuth<{ success: boolean; isBookmarked: boolean }>(
                getApiUrl(`/bookmarks/check/${id}`)
            );
            if (response.success) {
                setIsBookmarked(response.isBookmarked);
            }
        } catch (err) {
            console.error('Check bookmark error:', err);
        }
    };

    const toggleBookmark = async () => {
        try {
            setBookmarkLoading(true);
            const response = await fetchJsonWithAuth<{ success: boolean; isBookmarked: boolean }>(
                getApiUrl('/bookmarks/toggle'),
                {
                    method: 'POST',
                    body: JSON.stringify({ manuscriptId: id }),
                }
            );
            if (response.success) {
                setIsBookmarked(response.isBookmarked);
            }
        } catch (err) {
            console.error('Toggle bookmark error:', err);
        } finally {
            setBookmarkLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchData();
        checkBookmark();
    }, [id, router]);

    const handleRequestAccess = async (e: React.FormEvent) => {
        e.preventDefault();
        setRequestingAccess(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetchJsonWithAuth<{ success: boolean; error?: string }>(getApiUrl('/access-requests'), {
                method: 'POST',
                body: JSON.stringify({
                    manuscriptId: id,
                    requestedLevel: requestLevel,
                    purpose: requestPurpose,
                }),
            });

            if (response.success) {
                setSuccess('Access request submitted successfully. It will be reviewed by the manuscript owner or administrator.');
                setShowRequestForm(false);
                setAccessStatus(prev => ({ ...prev, status: 'PENDING' }));
            } else {
                setError(response.error || 'Failed to submit request');
            }
        } catch (err) {
            console.error('Request error:', err);
            setError('Failed to submit request. Please try again.');
        } finally {
            setRequestingAccess(false);
        }
    };

    const handleViewFile = async (fileIndex: number, file: { name: string; mimetype: string }) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(getApiUrl(`/manuscripts/${id}/view/${fileIndex}`), {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to load file');
            }

            // Get the blob and create a URL for it
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // Check if it's an image - use ImageViewer
            const mimetype = file.mimetype || '';
            if (mimetype.startsWith('image/')) {
                setViewingImage({ url, name: file.name, index: fileIndex });
            } else {
                // For PDFs and other files, open in new tab
                window.open(url, '_blank');
            }
        } catch (err: any) {
            console.error('View file error:', err);
            setError(err.message || 'Failed to view file');
        }
    };

    const handleDownloadFile = async (fileIndex: number) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(getApiUrl(`/manuscripts/${id}/download/${fileIndex}`), {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to download file');
            }

            // Get the blob and trigger download
            const blob = await response.blob();
            const url = URL.createObjectURL(blob);

            // Get filename from Content-Disposition header or use default
            const contentDisposition = response.headers.get('Content-Disposition');
            let filename = `manuscript-file-${fileIndex}`;
            if (contentDisposition) {
                const match = contentDisposition.match(/filename="?(.+?)"?$/);
                if (match) filename = match[1];
            }

            // Create download link and trigger it
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error('Download file error:', err);
            setError(err.message || 'Failed to download file');
        }
    };

    const handleExport = async (format: 'bibtex' | 'ris') => {
        try {
            const response = await fetch(getApiUrl(`/manuscripts/${id}/citation?format=${format}`), {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'Failed to export citation');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const extension = format === 'bibtex' ? 'bib' : 'ris';

            const a = document.createElement('a');
            a.href = url;
            a.download = `citation-${id}.${extension}`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err: any) {
            console.error('Export error:', err);
            setError(err.message || 'Failed to export citation');
        }
    };

    const handleAssignDoi = async () => {
        if (!confirm('Are you sure you want to assign a permanent DOI/Handle to this manuscript? This action cannot be undone.')) {
            return;
        }

        try {
            // Use local loading state to avoid full page spinner if desired, but reusing setLoading is fine for now
            // actually setLoading(true) will replace the whole UI with spinner which might be jarring.
            // Let's rely on optimistics or just assume it's fast.
            // But verify calls usually take time.
            // I'll skip global loading for now to keep UI visible.

            const response = await fetchJsonWithAuth<{ success: boolean; doi: string; message?: string }>(
                getApiUrl(`/manuscripts/${id}/doi`),
                { method: 'POST' }
            );

            if (response.success) {
                setManuscript(prev => prev ? ({ ...prev, doi: response.doi }) : null);
                setSuccess('Permanent Handle assigned successfully');
            } else {
                // setError('Failed to assign DOI');
                // fetchJsonWithAuth logs error but returns success: false if handled?
                // No, fetchJsonWithAuth throws if !response.ok usually, unless it parses error.
                // If it returns {success:false}, I show error.
                setError('Failed to assign DOI');
            }
        } catch (err: any) {
            console.error('Assign DOI error:', err);
            setError(err.message || 'Failed to assign DOI');
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                <LoadingSpinner />
                <span style={{ marginLeft: '1rem', color: '#64748b' }}>Loading manuscript...</span>
            </div>
        );
    }

    if (!manuscript) {
        return (
            <div style={{ textAlign: 'center', padding: '4rem 0' }}>
                <h2>Manuscript not found</h2>
                <Link href="/dashboard/browse">Back to Archive</Link>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                    <button
                        onClick={() => router.back()}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            cursor: 'pointer',
                            fontSize: '0.875rem',
                            padding: 0
                        }}
                    >
                        <ArrowLeftIcon />
                        Back
                    </button>
                    <button
                        onClick={toggleBookmark}
                        disabled={bookmarkLoading}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            background: isBookmarked ? '#fef3c7' : '#f8fafc',
                            color: isBookmarked ? '#d97706' : '#64748b',
                            border: `1px solid ${isBookmarked ? '#fde68a' : '#e5e7eb'}`,
                            borderRadius: '0.5rem',
                            cursor: bookmarkLoading ? 'not-allowed' : 'pointer',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            transition: 'all 0.15s',
                        }}
                    >
                        <BookmarkIcon filled={isBookmarked} />
                        {isBookmarked ? 'Bookmarked' : 'Bookmark'}
                    </button>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <h1 style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                                {manuscript.title}
                            </h1>
                            {isOwner && (
                                <Link
                                    href={`/dashboard/manuscripts/${id}/edit`}
                                    style={{
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '0.375rem',
                                        padding: '0.5rem 0.875rem',
                                        fontSize: '0.8125rem',
                                        fontWeight: 500,
                                        color: '#0369a1',
                                        background: '#e0f2fe',
                                        border: 'none',
                                        borderRadius: '6px',
                                        textDecoration: 'none',
                                        transition: 'all 0.15s',
                                    }}
                                >
                                    <EditIcon /> Edit
                                </Link>
                            )}
                        </div>
                        {manuscript.alternateTitle && (
                            <p style={{ fontSize: '1.125rem', color: '#64748b', marginTop: '0.5rem' }}>
                                {manuscript.alternateTitle}
                            </p>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        {isOwner && (
                            <span style={{
                                padding: '0.375rem 0.75rem',
                                background: '#e0f2fe',
                                color: '#0369a1',
                                borderRadius: '999px',
                                fontSize: '0.8125rem',
                                fontWeight: 600
                            }}>
                                YOUR MANUSCRIPT
                            </span>
                        )}
                        {/* Status Badge */}
                        {manuscript.status === 'review' && (
                            <span style={{
                                padding: '0.375rem 0.75rem',
                                background: '#fef3c7',
                                color: '#92400e',
                                borderRadius: '999px',
                                fontSize: '0.8125rem',
                                fontWeight: 600
                            }}>
                                PENDING REVIEW
                            </span>
                        )}
                        {manuscript.status === 'published' && (
                            <span style={{
                                padding: '0.375rem 0.75rem',
                                background: '#dcfce7',
                                color: '#166534',
                                borderRadius: '999px',
                                fontSize: '0.8125rem',
                                fontWeight: 600
                            }}>
                                PUBLISHED
                            </span>
                        )}
                        {manuscript.status === 'draft' && (
                            <span style={{
                                padding: '0.375rem 0.75rem',
                                background: '#fee2e2',
                                color: '#991b1b',
                                borderRadius: '999px',
                                fontSize: '0.8125rem',
                                fontWeight: 600
                            }}>
                                DRAFT
                            </span>
                        )}
                        <span style={{
                            padding: '0.375rem 0.75rem',
                            background: manuscript.visibility === 'public' ? '#dcfce7' : '#f1f5f9',
                            color: manuscript.visibility === 'public' ? '#166534' : '#64748b',
                            borderRadius: '999px',
                            fontSize: '0.8125rem',
                            fontWeight: 600
                        }}>
                            {manuscript.visibility.toUpperCase()}
                        </span>
                    </div>
                </div>
            </div>

            {error && (
                <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '0.5rem', fontSize: '0.875rem' }}>
                    {success}
                </div>
            )}

            {/* Pending Review Notice for Owner */}
            {isOwner && manuscript.status === 'review' && (
                <div style={{
                    padding: '1.25rem',
                    background: '#fffbeb',
                    border: '1px solid #fde68a',
                    borderRadius: '12px',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start'
                }}>
                    <div style={{ color: '#d97706', flexShrink: 0 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="16" x2="12" y2="12" />
                            <line x1="12" y1="8" x2="12.01" y2="8" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: '#92400e', marginBottom: '0.25rem' }}>
                            Pending Review
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#b45309' }}>
                            Your manuscript has been submitted and is currently being reviewed by our team.
                            Once approved, it will be published and visible in the archive for everyone to discover.
                        </div>
                    </div>
                </div>
            )}

            {/* Rejected/Draft Notice for Owner */}
            {isOwner && manuscript.status === 'draft' && (
                <div style={{
                    padding: '1.25rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '12px',
                    display: 'flex',
                    gap: '1rem',
                    alignItems: 'flex-start'
                }}>
                    <div style={{ color: '#dc2626', flexShrink: 0 }}>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="12" cy="12" r="10" />
                            <line x1="12" y1="8" x2="12" y2="12" />
                            <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                    </div>
                    <div>
                        <div style={{ fontWeight: 600, color: '#991b1b', marginBottom: '0.25rem' }}>
                            Needs Revision
                        </div>
                        <div style={{ fontSize: '0.875rem', color: '#b91c1c' }}>
                            This manuscript has been sent back for revision. Please review the feedback and make necessary updates before resubmitting.
                        </div>
                    </div>
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: '2rem' }}>
                {/* Left Column: Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Abstract</h3>
                        <p style={{ color: '#475569', lineHeight: 1.6, margin: 0 }}>
                            {manuscript.abstract || 'No abstract available for this manuscript.'}
                        </p>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Author / Compiler</div>
                            <div style={{ fontWeight: 500, color: manuscript.author ? '#0f172a' : '#94a3b8', fontStyle: manuscript.author ? 'normal' : 'italic' }}>
                                {manuscript.author || 'Not specified'}
                            </div>
                        </div>
                        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Language</div>
                            <div style={{ fontWeight: 500, color: manuscript.languages && manuscript.languages.length > 0 ? '#0f172a' : '#94a3b8', fontStyle: manuscript.languages && manuscript.languages.length > 0 ? 'normal' : 'italic' }}>
                                {manuscript.languages && manuscript.languages.length > 0 ? manuscript.languages.join(', ') : 'Not specified'}
                            </div>
                        </div>
                        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Category</div>
                            <div style={{ fontWeight: 500, color: manuscript.category ? '#0f172a' : '#94a3b8', fontStyle: manuscript.category ? 'normal' : 'italic' }}>
                                {manuscript.category || 'Not specified'}
                            </div>
                        </div>
                        <div style={{ background: 'white', padding: '1.25rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                            <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.25rem' }}>Period</div>
                            <div style={{ fontWeight: 500, color: manuscript.centuryEstimate ? '#0f172a' : '#94a3b8', fontStyle: manuscript.centuryEstimate ? 'normal' : 'italic' }}>
                                {manuscript.centuryEstimate || 'Not specified'}
                            </div>
                        </div>
                    </div>

                    {/* Files Section */}
                    {hasFullAccess ? (
                        <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.25rem' }}>Available Files</h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                {manuscript.files && manuscript.files.length > 0 ? (
                                    manuscript.files.map((file, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '1rem',
                                            background: '#f8fafc',
                                            borderRadius: '8px',
                                            border: '1px solid #f1f5f9'
                                        }}>
                                            <div>
                                                <div style={{ fontSize: '0.9375rem', fontWeight: 500, color: '#0f172a' }}>{file.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{(file.size / 1024 / 1024).toFixed(2)} MB • {file.mimetype}</div>
                                            </div>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    onClick={() => handleViewFile(index, file)}
                                                    style={{
                                                        display: 'flex', alignItems: 'center', gap: '0.375rem',
                                                        padding: '0.5rem 0.875rem', fontSize: '0.8125rem', fontWeight: 500,
                                                        color: '#059669', background: '#ecfdf5', border: 'none', borderRadius: '6px', cursor: 'pointer'
                                                    }}
                                                >
                                                    <EyeIcon /> View
                                                </button>
                                                {(isOwner || accessStatus.level === 'DOWNLOAD') && (
                                                    <button
                                                        onClick={() => handleDownloadFile(index)}
                                                        style={{
                                                            display: 'flex', alignItems: 'center', gap: '0.375rem',
                                                            padding: '0.5rem 0.875rem', fontSize: '0.8125rem', fontWeight: 500,
                                                            color: '#white', background: '#059669', border: 'none', borderRadius: '6px', cursor: 'pointer'
                                                        }}
                                                    >
                                                        <DownloadIcon /> Download
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div style={{ textAlign: 'center', color: '#64748b', padding: '1rem' }}>No files associated with this manuscript.</div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div style={{
                            padding: '2.5rem',
                            textAlign: 'center',
                            background: '#f8fafc',
                            borderRadius: '12px',
                            border: '1px solid #e5e7eb'
                        }}>
                            <div style={{ color: '#94a3b8', marginBottom: '1rem' }}><LockIcon /></div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>Access Restricted</h3>
                            <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                                This manuscript is restricted. You need to request access from the owner to view or download the full contents.
                            </p>

                            {accessStatus.status === 'PENDING' ? (
                                <div style={{
                                    display: 'inline-block',
                                    padding: '0.75rem 1.5rem',
                                    background: '#fef3c7',
                                    color: '#b45309',
                                    borderRadius: '0.5rem',
                                    fontWeight: 500,
                                    fontSize: '0.875rem'
                                }}>
                                    Your request is currently pending review.
                                </div>
                            ) : user?.verification_status !== 'VERIFIED' ? (
                                <div style={{
                                    padding: '1.5rem',
                                    background: '#fff7ed',
                                    border: '1px solid #ffedd5',
                                    borderRadius: '12px',
                                    color: '#9a3412',
                                    fontSize: '0.875rem',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '0.75rem'
                                }}>
                                    <p style={{ margin: 0, fontWeight: 500 }}>
                                        Verification Required
                                    </p>
                                    <p style={{ margin: 0, fontSize: '0.8125rem' }}>
                                        You must verify your identity before you can request access to manuscripts.
                                    </p>
                                    <Link href="/dashboard/settings" style={{
                                        color: '#c2410c',
                                        fontWeight: 600,
                                        textDecoration: 'underline'
                                    }}>
                                        Go to ID Verification
                                    </Link>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowRequestForm(true)}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: '#059669',
                                        color: 'white',
                                        borderRadius: '0.5rem',
                                        border: 'none',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    Request Access
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Right Column: Sidebar */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>Metadata Information</h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.125rem' }}>Origin</div>
                                <div style={{ fontSize: '0.875rem', color: '#475569' }}>{manuscript.origin || 'Unknown'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.125rem' }}>Subject</div>
                                <div style={{ fontSize: '0.875rem', color: '#475569' }}>{manuscript.subject || 'General'}</div>
                            </div>
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.125rem' }}>View Count</div>
                                <div style={{ fontSize: '0.875rem', color: '#475569' }}>{manuscript.viewCount || 0} views</div>
                            </div>
                        </div>
                    </div>

                    {/* Identifiers & Actions */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                            Identifiers & Citation
                        </h4>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                            {/* DOI Section */}
                            {(manuscript.doi || isOwner) && (
                                <div>
                                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                        Permanent Handle
                                    </div>
                                    {manuscript.doi ? (
                                        <div style={{
                                            fontSize: '0.8125rem', color: '#0369a1', fontFamily: 'ui-monospace, monospace',
                                            background: '#f0f9ff', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e0f2fe',
                                            wordBreak: 'break-all'
                                        }}>
                                            {manuscript.doi}
                                        </div>
                                    ) : (
                                        <div>
                                            <button
                                                onClick={handleAssignDoi}
                                                style={{
                                                    width: '100%', padding: '0.5rem', fontSize: '0.8125rem', fontWeight: 500,
                                                    color: 'white', background: '#334155', border: 'none', borderRadius: '6px',
                                                    cursor: 'pointer', transition: 'background 0.15s'
                                                }}
                                                onMouseOver={(e) => e.currentTarget.style.background = '#1e293b'}
                                                onMouseOut={(e) => e.currentTarget.style.background = '#334155'}
                                            >
                                                Assign Handle (DOI)
                                            </button>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.375rem', lineHeight: 1.4 }}>
                                                Generate a unique persistent identifier for this manuscript.
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Citation Export */}
                            <div>
                                <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                    Export Citation
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                                    <button
                                        onClick={() => handleExport('bibtex')}
                                        style={{
                                            padding: '0.5rem', fontSize: '0.8125rem', fontWeight: 500,
                                            color: '#334155', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        BibTeX
                                    </button>
                                    <button
                                        onClick={() => handleExport('ris')}
                                        style={{
                                            padding: '0.5rem', fontSize: '0.8125rem', fontWeight: 500,
                                            color: '#334155', background: 'white', border: '1px solid #cbd5e1', borderRadius: '6px',
                                            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center'
                                        }}
                                    >
                                        RIS
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Request Access Modal */}
            {showRequestForm && (
                <div style={{
                    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{
                        background: 'white', padding: '2rem', borderRadius: '16px', width: '90%', maxWidth: '500px',
                        boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.5rem' }}>Request Access</h2>
                        <form onSubmit={handleRequestAccess}>
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Requested Level</label>
                                <select
                                    value={requestLevel}
                                    onChange={(e) => setRequestLevel(e.target.value)}
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', outline: 'none' }}
                                >
                                    <option value="VIEW_METADATA">View Metadata Only</option>
                                    <option value="VIEW_CONTENT">View Full Content</option>
                                    <option value="DOWNLOAD">Download Files</option>
                                </select>
                            </div>
                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Purpose of Request</label>
                                <textarea
                                    required
                                    rows={4}
                                    value={requestPurpose}
                                    onChange={(e) => setRequestPurpose(e.target.value)}
                                    placeholder="Explain why you need access to this manuscript (e.g., research, study, etc.)"
                                    style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', outline: 'none', resize: 'none' }}
                                />
                            </div>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <button
                                    type="button"
                                    onClick={() => setShowRequestForm(false)}
                                    style={{ flex: 1, padding: '0.75rem', border: '1px solid #e2e8f0', background: 'white', color: '#475569', borderRadius: '0.5rem', fontWeight: 500, cursor: 'pointer' }}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={requestingAccess}
                                    style={{
                                        flex: 1, padding: '0.75rem', background: '#059669', color: 'white', border: 'none',
                                        borderRadius: '0.5rem', fontWeight: 500, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem'
                                    }}
                                >
                                    {requestingAccess && <LoadingSpinner />}
                                    Submit Request
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>

            {/* Image Viewer Modal */}
            {viewingImage && (
                <ImageViewer
                    src={viewingImage.url}
                    alt={viewingImage.name}
                    onClose={() => {
                        URL.revokeObjectURL(viewingImage.url);
                        setViewingImage(null);
                    }}
                    onDownload={() => handleDownloadFile(viewingImage.index)}
                    showDownload={isOwner || accessStatus.level === 'DOWNLOAD'}
                />
            )}
        </div>
    );
}
