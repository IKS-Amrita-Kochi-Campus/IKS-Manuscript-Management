'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchJsonWithAuth, getApiUrl, isAuthenticated } from '@/lib/api';
import ImageViewer from '@/components/ImageViewer';

// Icons
const DocumentIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

const CheckIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const XIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const EditIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const EyeIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const RefreshIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 2v6h-6" />
        <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
        <path d="M3 22v-6h6" />
        <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
);

const FileIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

const DownloadIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const LoadingSpinner = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
);

interface ManuscriptFile {
    originalName: string;
    mimeType: string;
    size: number;
}

interface Manuscript {
    _id: string;
    title: string;
    author?: string;
    category: string;
    languages?: string[];
    status: string;
    visibility: string;
    ownerId: string;
    abstract?: string;
    repository?: string;
    subject?: string[];
    origin?: string;
    createdAt: string;
    reviewNotes?: string;
    files?: ManuscriptFile[];
}

interface User {
    id: string;
    role: string;
}

type ReviewAction = 'approve' | 'deny' | 'request_changes' | null;

export default function ReviewerDashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [selectedManuscript, setSelectedManuscript] = useState<Manuscript | null>(null);
    const [reviewNotes, setReviewNotes] = useState('');
    const [filter, setFilter] = useState<'review' | 'draft' | 'published' | 'all'>('review');
    const [selectedAction, setSelectedAction] = useState<ReviewAction>(null);
    const [viewingFile, setViewingFile] = useState<{ url: string; name: string; mimeType: string; manuscriptId: string; fileIndex: number } | null>(null);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchUser();
    }, [router]);

    useEffect(() => {
        if (user && (user.role === 'REVIEWER' || user.role === 'ADMIN')) {
            fetchManuscripts();
        }
    }, [user, filter]);

    const fetchUser = async () => {
        try {
            const response = await fetchJsonWithAuth<{ success: boolean; user: User }>(getApiUrl('/users/me'));
            if (response.success) {
                setUser(response.user);
                if (response.user.role !== 'REVIEWER' && response.user.role !== 'ADMIN') {
                    router.push('/dashboard');
                }
            }
        } catch (err) {
            console.error('Failed to fetch user:', err);
            router.push('/dashboard');
        }
    };

    const fetchManuscripts = async () => {
        try {
            setLoading(true);
            setError('');

            const statusQuery = filter === 'all' ? '' : `?status=${filter}`;
            const response = await fetchJsonWithAuth<{
                success: boolean;
                manuscripts: Manuscript[];
                pagination: { total: number };
            }>(getApiUrl(`/admin/manuscripts${statusQuery}`));

            if (response.success) {
                setManuscripts(response.manuscripts);
            }
        } catch (err) {
            console.error('Failed to fetch manuscripts:', err);
            setError('Failed to load manuscripts');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (manuscriptId: string, newStatus: 'published' | 'draft') => {
        if (!reviewNotes.trim() && newStatus === 'draft') {
            setError('Please provide feedback when requesting changes or denying a submission.');
            return;
        }

        setActionLoading(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetchJsonWithAuth<{ success: boolean; error?: string }>(
                getApiUrl(`/admin/manuscripts/${manuscriptId}/status`),
                {
                    method: 'PUT',
                    body: JSON.stringify({
                        status: newStatus,
                        reviewNotes: reviewNotes || undefined,
                    }),
                }
            );

            if (response.success) {
                const actionText = newStatus === 'published' ? 'approved and published' :
                    selectedAction === 'deny' ? 'denied' : 'sent back for changes';
                setSuccess(`Manuscript has been ${actionText}!`);
                setSelectedManuscript(null);
                setReviewNotes('');
                setSelectedAction(null);
                fetchManuscripts();
            } else {
                throw new Error(response.error || 'Failed to update status');
            }
        } catch (err: any) {
            console.error('Status update error:', err);
            setError(err.message || 'Failed to update manuscript status');
        } finally {
            setActionLoading(false);
        }
    };

    const viewFile = async (manuscriptId: string, fileIndex: number, fileName: string, mimeType: string) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(getApiUrl(`/manuscripts/${manuscriptId}/view/${fileIndex}`), {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to load file');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            setViewingFile({ url, name: fileName, mimeType, manuscriptId, fileIndex });
        } catch (err) {
            console.error('View file error:', err);
            setError('Failed to load file for viewing');
        }
    };

    const downloadFile = async (manuscriptId: string, fileIndex: number, fileName: string) => {
        try {
            const accessToken = localStorage.getItem('accessToken');
            const response = await fetch(getApiUrl(`/manuscripts/${manuscriptId}/download/${fileIndex}`), {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to download file');
            }

            const blob = await response.blob();
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Download file error:', err);
            setError('Failed to download file');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, { bg: string; color: string; label: string }> = {
            draft: { bg: '#fee2e2', color: '#991b1b', label: 'Needs Revision' },
            review: { bg: '#fef3c7', color: '#92400e', label: 'Pending Review' },
            published: { bg: '#dcfce7', color: '#166534', label: 'Published' },
            archived: { bg: '#e5e7eb', color: '#374151', label: 'Archived' },
        };
        const style = styles[status] || styles.review;

        return (
            <span style={{
                padding: '0.25rem 0.625rem',
                background: style.bg,
                color: style.color,
                borderRadius: '999px',
                fontSize: '0.75rem',
                fontWeight: 600,
                textTransform: 'uppercase',
            }}>
                {style.label}
            </span>
        );
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const closeSelectedManuscript = () => {
        setSelectedManuscript(null);
        setReviewNotes('');
        setSelectedAction(null);
    };

    if (loading && !user) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                <LoadingSpinner />
                <span style={{ marginLeft: '1rem', color: '#64748b' }}>Loading...</span>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* File Viewer Modal */}
            {viewingFile && (
                viewingFile.mimeType.startsWith('image/') ? (
                    <ImageViewer
                        src={viewingFile.url}
                        alt={viewingFile.name}
                        onClose={() => {
                            URL.revokeObjectURL(viewingFile.url);
                            setViewingFile(null);
                        }}
                        onDownload={() => downloadFile(viewingFile.manuscriptId, viewingFile.fileIndex, viewingFile.name)}
                        showDownload={true}
                    />
                ) : (
                    <div style={{
                        position: 'fixed',
                        inset: 0,
                        background: 'rgba(0,0,0,0.8)',
                        zIndex: 1000,
                        display: 'flex',
                        flexDirection: 'column',
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '1rem 1.5rem',
                            background: '#1e293b',
                            color: 'white',
                        }}>
                            <span style={{ fontWeight: 500 }}>{viewingFile.name}</span>
                            <button
                                onClick={() => {
                                    URL.revokeObjectURL(viewingFile.url);
                                    setViewingFile(null);
                                }}
                                style={{
                                    background: '#ef4444',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '6px',
                                    padding: '0.5rem 1rem',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                }}
                            >
                                Close Viewer
                            </button>
                        </div>
                        <iframe
                            src={viewingFile.url}
                            style={{
                                flex: 1,
                                border: 'none',
                                background: 'white',
                            }}
                            title="File Viewer"
                        />
                    </div>
                )
            )}

            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                    Manuscript Review Queue
                </h1>
                <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                    Review and verify manuscript submissions before they are published to the archive.
                </p>
            </div>

            {/* Filters and Actions Bar */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '1.5rem',
                background: 'white',
                padding: '1rem 1.5rem',
                borderRadius: '12px',
                border: '1px solid #e5e7eb',
            }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    {([
                        { key: 'review', label: 'Pending Review' },
                        { key: 'draft', label: 'Needs Revision' },
                        { key: 'published', label: 'Published' },
                        { key: 'all', label: 'All' },
                    ] as const).map((item) => (
                        <button
                            key={item.key}
                            onClick={() => setFilter(item.key)}
                            style={{
                                padding: '0.5rem 1rem',
                                background: filter === item.key ? '#059669' : '#f1f5f9',
                                color: filter === item.key ? 'white' : '#475569',
                                border: 'none',
                                borderRadius: '6px',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                cursor: 'pointer',
                            }}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>
                <button
                    onClick={fetchManuscripts}
                    disabled={loading}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        background: '#f1f5f9',
                        color: '#475569',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        cursor: 'pointer',
                    }}
                >
                    <RefreshIcon /> Refresh
                </button>
            </div>

            {error && (
                <div style={{ padding: '1rem', background: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{ padding: '1rem', background: '#dcfce7', color: '#166534', borderRadius: '0.5rem', fontSize: '0.875rem', marginBottom: '1rem' }}>
                    {success}
                </div>
            )}

            {/* Main Content - Split View */}
            <div style={{ display: 'grid', gridTemplateColumns: selectedManuscript ? '1fr 480px' : '1fr', gap: '1.5rem' }}>
                {/* Manuscripts List */}
                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                    {loading ? (
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem' }}>
                            <LoadingSpinner />
                            <span style={{ marginLeft: '1rem', color: '#64748b' }}>Loading manuscripts...</span>
                        </div>
                    ) : manuscripts.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                            <DocumentIcon />
                            <p style={{ marginTop: '1rem' }}>No manuscripts found in this category.</p>
                        </div>
                    ) : (
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                                        <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Manuscript</th>
                                        <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Category</th>
                                        <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                                        <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Files</th>
                                        <th style={{ padding: '0.875rem 1rem', textAlign: 'left', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Submitted</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {manuscripts.map((manuscript) => (
                                        <tr
                                            key={manuscript._id}
                                            style={{
                                                borderBottom: '1px solid #f1f5f9',
                                                background: selectedManuscript?._id === manuscript._id ? '#f0fdf4' : 'transparent',
                                                cursor: 'pointer',
                                                transition: 'background 0.15s',
                                            }}
                                            onClick={() => {
                                                setSelectedManuscript(manuscript);
                                                setReviewNotes(manuscript.reviewNotes || '');
                                                setSelectedAction(null);
                                            }}
                                            onMouseEnter={(e) => {
                                                if (selectedManuscript?._id !== manuscript._id) {
                                                    e.currentTarget.style.background = '#f8fafc';
                                                }
                                            }}
                                            onMouseLeave={(e) => {
                                                if (selectedManuscript?._id !== manuscript._id) {
                                                    e.currentTarget.style.background = 'transparent';
                                                }
                                            }}
                                        >
                                            <td style={{ padding: '1rem' }}>
                                                <div style={{ fontWeight: 500, color: '#0f172a', marginBottom: '0.25rem' }}>{manuscript.title}</div>
                                                <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>by {manuscript.author || 'Unknown'}</div>
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#475569' }}>
                                                {manuscript.category}
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                {getStatusBadge(manuscript.status)}
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.875rem', color: '#475569' }}>
                                                {manuscript.files?.length || 0} file(s)
                                            </td>
                                            <td style={{ padding: '1rem', fontSize: '0.8125rem', color: '#64748b' }}>
                                                {formatDate(manuscript.createdAt)}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Review Panel */}
                {selectedManuscript && (
                    <div style={{
                        background: 'white',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        display: 'flex',
                        flexDirection: 'column',
                        maxHeight: 'calc(100vh - 200px)',
                        overflow: 'hidden',
                    }}>
                        {/* Panel Header */}
                        <div style={{
                            padding: '1.25rem',
                            borderBottom: '1px solid #e5e7eb',
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                        }}>
                            <div>
                                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                                    Review Manuscript
                                </h3>
                                <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: '0.25rem 0 0' }}>
                                    Verify content and approve or request changes
                                </p>
                            </div>
                            <button
                                onClick={closeSelectedManuscript}
                                style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}
                            >
                                <XIcon />
                            </button>
                        </div>

                        {/* Panel Content - Scrollable */}
                        <div style={{ flex: 1, overflow: 'auto', padding: '1.25rem' }}>
                            {/* Manuscript Info */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.375rem' }}>
                                    {selectedManuscript.title}
                                </h4>
                                <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.75rem' }}>
                                    by {selectedManuscript.author || 'Unknown Author'}
                                </p>
                                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                    {getStatusBadge(selectedManuscript.status)}
                                    <span style={{
                                        padding: '0.25rem 0.625rem',
                                        background: '#f1f5f9',
                                        color: '#475569',
                                        borderRadius: '999px',
                                        fontSize: '0.75rem',
                                        fontWeight: 500,
                                    }}>
                                        {selectedManuscript.visibility}
                                    </span>
                                </div>
                            </div>

                            {/* Metadata Grid */}
                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1rem',
                                marginBottom: '1.5rem',
                                background: '#f8fafc',
                                padding: '1rem',
                                borderRadius: '8px',
                            }}>
                                <div>
                                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Category</div>
                                    <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>{selectedManuscript.category}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Languages</div>
                                    <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>{selectedManuscript.languages?.join(', ') || 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Repository</div>
                                    <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>{selectedManuscript.repository || 'N/A'}</div>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.25rem' }}>Origin</div>
                                    <div style={{ fontSize: '0.875rem', color: '#0f172a', fontWeight: 500 }}>{selectedManuscript.origin || 'N/A'}</div>
                                </div>
                            </div>

                            {/* Abstract */}
                            {selectedManuscript.abstract && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Abstract</div>
                                    <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.6, margin: 0 }}>
                                        {selectedManuscript.abstract}
                                    </p>
                                </div>
                            )}

                            {/* Files Section */}
                            <div style={{ marginBottom: '1.5rem' }}>
                                <div style={{ fontSize: '0.6875rem', color: '#94a3b8', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
                                    Attached Files ({selectedManuscript.files?.length || 0})
                                </div>
                                {selectedManuscript.files && selectedManuscript.files.length > 0 ? (
                                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                        {selectedManuscript.files.map((file, index) => (
                                            <div
                                                key={index}
                                                style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    padding: '0.75rem',
                                                    background: '#f8fafc',
                                                    border: '1px solid #e5e7eb',
                                                    borderRadius: '8px',
                                                }}
                                            >
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
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
                                                <div style={{ display: 'flex', gap: '0.375rem' }}>
                                                    <button
                                                        onClick={() => viewFile(selectedManuscript._id, index, file.originalName, file.mimeType)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem',
                                                            padding: '0.375rem 0.625rem',
                                                            background: '#3b82f6',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 500,
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        <EyeIcon /> View
                                                    </button>
                                                    <button
                                                        onClick={() => downloadFile(selectedManuscript._id, index, file.originalName)}
                                                        style={{
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.25rem',
                                                            padding: '0.375rem 0.625rem',
                                                            background: '#f1f5f9',
                                                            color: '#475569',
                                                            border: '1px solid #e5e7eb',
                                                            borderRadius: '4px',
                                                            fontSize: '0.75rem',
                                                            fontWeight: 500,
                                                            cursor: 'pointer',
                                                        }}
                                                    >
                                                        <DownloadIcon />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div style={{ fontSize: '0.875rem', color: '#94a3b8', fontStyle: 'italic' }}>
                                        No files attached to this manuscript.
                                    </div>
                                )}
                            </div>

                            {/* View Full Details Link */}
                            <Link
                                href={`/dashboard/manuscripts/${selectedManuscript._id}`}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.375rem',
                                    fontSize: '0.875rem',
                                    color: '#3b82f6',
                                    textDecoration: 'none',
                                    marginBottom: '1.5rem',
                                }}
                            >
                                <EyeIcon /> View Full Manuscript Details
                            </Link>

                            {/* Review Notes */}
                            <div style={{ marginBottom: '1rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.6875rem',
                                    color: '#94a3b8',
                                    textTransform: 'uppercase',
                                    marginBottom: '0.5rem',
                                }}>
                                    Review Notes / Feedback {selectedAction !== 'approve' && selectedAction && '(Required)'}
                                </label>
                                <textarea
                                    value={reviewNotes}
                                    onChange={(e) => setReviewNotes(e.target.value)}
                                    placeholder={
                                        selectedAction === 'deny'
                                            ? 'Explain why the manuscript is being denied...'
                                            : selectedAction === 'request_changes'
                                                ? 'Describe the changes needed before approval...'
                                                : 'Add optional notes about this review...'
                                    }
                                    rows={4}
                                    style={{
                                        width: '100%',
                                        padding: '0.75rem',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '8px',
                                        fontSize: '0.875rem',
                                        resize: 'none',
                                        outline: 'none',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Action Buttons - Fixed at bottom */}
                        <div style={{
                            padding: '1.25rem',
                            borderTop: '1px solid #e5e7eb',
                            background: '#f8fafc',
                        }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem' }}>
                                {/* Deny Button */}
                                <button
                                    onClick={() => {
                                        setSelectedAction('deny');
                                        if (reviewNotes.trim()) {
                                            handleStatusUpdate(selectedManuscript._id, 'draft');
                                        } else {
                                            setError('Please provide feedback explaining why the manuscript is denied.');
                                        }
                                    }}
                                    disabled={actionLoading}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.375rem',
                                        padding: '0.875rem',
                                        background: '#fee2e2',
                                        color: '#991b1b',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '0.8125rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <XIcon />
                                    Deny
                                </button>

                                {/* Request Changes Button */}
                                <button
                                    onClick={() => {
                                        setSelectedAction('request_changes');
                                        if (reviewNotes.trim()) {
                                            handleStatusUpdate(selectedManuscript._id, 'draft');
                                        } else {
                                            setError('Please describe the changes needed.');
                                        }
                                    }}
                                    disabled={actionLoading}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.375rem',
                                        padding: '0.875rem',
                                        background: '#fef3c7',
                                        color: '#92400e',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '0.8125rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    <EditIcon />
                                    Request Changes
                                </button>

                                {/* Approve Button */}
                                <button
                                    onClick={() => {
                                        setSelectedAction('approve');
                                        handleStatusUpdate(selectedManuscript._id, 'published');
                                    }}
                                    disabled={actionLoading}
                                    style={{
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.375rem',
                                        padding: '0.875rem',
                                        background: '#059669',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '8px',
                                        fontSize: '0.8125rem',
                                        fontWeight: 600,
                                        cursor: 'pointer',
                                    }}
                                >
                                    {actionLoading ? <LoadingSpinner /> : <CheckIcon />}
                                    Approve
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
