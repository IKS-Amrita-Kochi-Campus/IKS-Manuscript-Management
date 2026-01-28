'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchJsonWithAuth, getApiUrl, isAuthenticated } from '@/lib/api';

// Types
interface Bookmark {
    id: string;
    manuscript_id: string;
    notes?: string;
    created_at: string;
}

interface Manuscript {
    _id: string;
    title: string;
    author: string;
    category: string;
    languages?: string[];
    visibility: string;
    abstract?: string;
}

// Icons
const BookmarkIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);

const BookmarkOutlineIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </svg>
);

const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

const LoadingSpinner = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
);

export default function BookmarksPage() {
    const router = useRouter();
    const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
    const [manuscripts, setManuscripts] = useState<Record<string, Manuscript>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchBookmarks();
    }, [router]);

    const fetchBookmarks = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetchJsonWithAuth<{
                success: boolean;
                bookmarks: Bookmark[];
                error?: string;
            }>(getApiUrl('/bookmarks'));

            if (response.success) {
                setBookmarks(response.bookmarks);

                // Fetch manuscript details for each bookmark
                const manuscriptPromises = response.bookmarks.map(async (bookmark) => {
                    try {
                        const manuscriptRes = await fetchJsonWithAuth<{
                            success: boolean;
                            manuscript: Manuscript;
                        }>(getApiUrl(`/manuscripts/${bookmark.manuscript_id}`));

                        if (manuscriptRes.success) {
                            return { id: bookmark.manuscript_id, manuscript: manuscriptRes.manuscript };
                        }
                    } catch (err) {
                        console.error(`Failed to fetch manuscript ${bookmark.manuscript_id}:`, err);
                    }
                    return null;
                });

                const results = await Promise.all(manuscriptPromises);
                const manuscriptMap: Record<string, Manuscript> = {};
                results.forEach((result) => {
                    if (result) {
                        manuscriptMap[result.id] = result.manuscript;
                    }
                });
                setManuscripts(manuscriptMap);
            } else {
                setError(response.error || 'Failed to load bookmarks');
            }
        } catch (err) {
            console.error('Fetch bookmarks error:', err);
            setError('Failed to load bookmarks');
        } finally {
            setLoading(false);
        }
    };

    const removeBookmark = async (manuscriptId: string) => {
        try {
            const response = await fetchJsonWithAuth<{ success: boolean }>(
                getApiUrl(`/bookmarks/${manuscriptId}`),
                { method: 'DELETE' }
            );

            if (response.success) {
                setBookmarks(bookmarks.filter((b) => b.manuscript_id !== manuscriptId));
            }
        } catch (err) {
            console.error('Remove bookmark error:', err);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    const filteredBookmarks = bookmarks.filter(bookmark => {
        if (!searchQuery) return true;
        const manuscript = manuscripts[bookmark.manuscript_id];
        if (!manuscript) return false;

        const query = searchQuery.toLowerCase();
        return (
            manuscript.title.toLowerCase().includes(query) ||
            manuscript.author.toLowerCase().includes(query) ||
            manuscript.category.toLowerCase().includes(query) ||
            (manuscript.abstract && manuscript.abstract.toLowerCase().includes(query))
        );
    });

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                <LoadingSpinner />
                <span style={{ marginLeft: '1rem', color: '#64748b' }}>Loading bookmarks...</span>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                    Your Bookmarks
                </h1>
                <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                    Manuscripts you've saved for later • {bookmarks.length} saved
                </p>
            </div>

            {/* Search Bar */}
            {bookmarks.length > 0 && (
                <div className="search-filter-bar" style={{ marginBottom: '1.5rem' }}>
                    <div style={{ position: 'relative', flex: 1 }}>
                        <div style={{
                            position: 'absolute',
                            left: '1rem',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            color: '#64748b',
                        }}>
                            <SearchIcon />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by title, author, category..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{
                                width: '100%',
                                height: '44px',
                                padding: '0 1rem 0 3rem',
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
            )}

            {error && (
                <div style={{
                    padding: '1rem',
                    background: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '0.5rem',
                    marginBottom: '1rem',
                }}>
                    {error}
                </div>
            )}

            {bookmarks.length === 0 ? (
                <div style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '4rem 2rem',
                    textAlign: 'center',
                }}>
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: '#f8fafc',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1.5rem',
                        color: '#94a3b8',
                    }}>
                        <BookmarkOutlineIcon />
                    </div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
                        No bookmarks yet
                    </h3>
                    <p style={{ fontSize: '0.9375rem', color: '#64748b', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
                        Browse the manuscript archive and click the bookmark icon to save manuscripts for later access
                    </p>
                    <Link href="/dashboard/browse" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1.25rem',
                        background: '#059669',
                        color: 'white',
                        textDecoration: 'none',
                        borderRadius: '0.5rem',
                        fontSize: '0.9375rem',
                        fontWeight: 500,
                    }}>
                        Browse Archive
                    </Link>
                </div>
            ) : filteredBookmarks.length === 0 ? (
                <div style={{
                    padding: '3rem',
                    textAlign: 'center',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                }}>
                    <p style={{ color: '#64748b' }}>No bookmarks match your search.</p>
                    <button
                        onClick={() => setSearchQuery('')}
                        style={{
                            marginTop: '1rem',
                            color: '#059669',
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            fontWeight: 500,
                        }}
                    >
                        Clear search
                    </button>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filteredBookmarks.map((bookmark) => {
                        const manuscript = manuscripts[bookmark.manuscript_id];

                        return (
                            <div
                                key={bookmark.id}
                                style={{
                                    background: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    padding: '1.25rem',
                                    display: 'flex',
                                    gap: '1rem',
                                    alignItems: 'flex-start',
                                }}
                            >
                                <div style={{
                                    width: '44px',
                                    height: '44px',
                                    background: '#fef3c7',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: '#d97706',
                                    flexShrink: 0,
                                }}>
                                    <BookmarkIcon />
                                </div>

                                <div style={{ flex: 1, minWidth: 0 }}>
                                    {manuscript ? (
                                        <>
                                            <Link
                                                href={`/dashboard/manuscripts/${bookmark.manuscript_id}`}
                                                style={{
                                                    fontSize: '1rem',
                                                    fontWeight: 600,
                                                    color: '#0f172a',
                                                    textDecoration: 'none',
                                                    display: 'block',
                                                    marginBottom: '0.25rem',
                                                }}
                                            >
                                                {manuscript.title}
                                            </Link>
                                            <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
                                                by {manuscript.author}
                                            </p>
                                            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    background: '#f1f5f9',
                                                    color: '#475569',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    borderRadius: '4px',
                                                }}>
                                                    {manuscript.category}
                                                </span>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    background: manuscript.visibility === 'public' ? '#dcfce7' : '#fef3c7',
                                                    color: manuscript.visibility === 'public' ? '#166534' : '#92400e',
                                                    fontSize: '0.75rem',
                                                    fontWeight: 500,
                                                    borderRadius: '4px',
                                                }}>
                                                    {manuscript.visibility}
                                                </span>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
                                                Manuscript
                                            </div>
                                            <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>
                                                Loading details...
                                            </p>
                                        </>
                                    )}
                                    <p style={{
                                        fontSize: '0.75rem',
                                        color: '#94a3b8',
                                        marginTop: '0.5rem',
                                    }}>
                                        Saved on {formatDate(bookmark.created_at)}
                                    </p>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    <Link
                                        href={`/dashboard/manuscripts/${bookmark.manuscript_id}`}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.375rem',
                                            padding: '0.5rem 0.75rem',
                                            background: '#059669',
                                            color: 'white',
                                            textDecoration: 'none',
                                            borderRadius: '6px',
                                            fontSize: '0.8125rem',
                                            fontWeight: 500,
                                        }}
                                    >
                                        <EyeIcon /> View
                                    </Link>
                                    <button
                                        onClick={() => removeBookmark(bookmark.manuscript_id)}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            padding: '0.5rem',
                                            background: '#fee2e2',
                                            color: '#991b1b',
                                            border: 'none',
                                            borderRadius: '6px',
                                            cursor: 'pointer',
                                        }}
                                        title="Remove bookmark"
                                    >
                                        <TrashIcon />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
