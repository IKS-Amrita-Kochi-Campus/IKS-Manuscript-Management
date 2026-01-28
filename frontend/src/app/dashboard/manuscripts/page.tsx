'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchJsonWithAuth, getApiUrl, isAuthenticated } from '@/lib/api';

// Types
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
    viewCount?: number;
    createdAt?: string;
    coverThumbnail?: string;
}

interface Pagination {
    total: number;
    page: number;
    totalPages: number;
}

// Icon Components
const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const GridIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
);

const ListIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="8" y1="6" x2="21" y2="6" />
        <line x1="8" y1="12" x2="21" y2="12" />
        <line x1="8" y1="18" x2="21" y2="18" />
        <line x1="3" y1="6" x2="3.01" y2="6" />
        <line x1="3" y1="12" x2="3.01" y2="12" />
        <line x1="3" y1="18" x2="3.01" y2="18" />
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

const EditIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

// Manuscript Card Component
const ManuscriptCard = ({ manuscript }: { manuscript: Manuscript }) => {
    const statusConfig = {
        draft: { bg: '#fee2e2', color: '#991b1b', label: 'Needs Revision' },
        review: { bg: '#fef3c7', color: '#b45309', label: 'Pending Review' },
        pending: { bg: '#fef3c7', color: '#b45309', label: 'Pending' },
        published: { bg: '#dcfce7', color: '#166534', label: 'Published' },
        archived: { bg: '#f1f5f9', color: '#64748b', label: 'Archived' },
    };

    const config = statusConfig[manuscript.status as keyof typeof statusConfig] || statusConfig.review;

    return (
        <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
        }}>
            <div style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
            }}>
                <span style={{
                    padding: '0.25rem 0.625rem',
                    background: config.bg,
                    color: config.color,
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    borderRadius: '999px',
                }}>
                    {config.label}
                </span>
                <span style={{
                    padding: '0.25rem 0.5rem',
                    background: manuscript.visibility === 'public' ? '#ecfdf5' : '#fef3c7',
                    color: manuscript.visibility === 'public' ? '#047857' : '#b45309',
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    borderRadius: '6px',
                }}>
                    {manuscript.visibility === 'public' ? 'Public' : 'Restricted'}
                </span>
            </div>

            <h3 style={{
                fontSize: '1rem',
                fontWeight: 600,
                color: '#0f172a',
                marginBottom: '0.5rem',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
            }}>
                {manuscript.title}
            </h3>

            <p style={{
                fontSize: '0.8125rem',
                color: '#64748b',
                marginBottom: '0.75rem',
            }}>
                {manuscript.author}
            </p>

            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1rem',
                flexWrap: 'wrap',
            }}>
                <span style={{
                    padding: '0.25rem 0.5rem',
                    background: '#f1f5f9',
                    color: '#475569',
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    borderRadius: '6px',
                }}>
                    {manuscript.languages && manuscript.languages.length > 0 ? manuscript.languages.join(', ') : 'N/A'}
                </span>
                <span style={{
                    padding: '0.25rem 0.5rem',
                    background: '#f1f5f9',
                    color: '#475569',
                    fontSize: '0.6875rem',
                    fontWeight: 500,
                    borderRadius: '6px',
                }}>
                    {manuscript.category}
                </span>
            </div>

            <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                <Link href={`/dashboard/manuscripts/${manuscript._id}`} style={{
                    flex: 1,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.375rem',
                    padding: '0.5rem',
                    fontSize: '0.8125rem',
                    fontWeight: 500,
                    color: 'white',
                    background: '#059669',
                    border: 'none',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                }}>
                    <EyeIcon />
                    View
                </Link>
                <Link href={`/dashboard/manuscripts/${manuscript._id}/edit`} style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '0.5rem 0.75rem',
                    color: '#64748b',
                    background: '#f8fafc',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    textDecoration: 'none',
                }}>
                    <EditIcon />
                </Link>
            </div>
        </div>
    );
};

// Loading Skeleton
const LoadingSkeleton = () => (
    <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1.5rem',
        height: '220px',
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ width: '60px', height: '22px', background: '#f1f5f9', borderRadius: '999px' }} />
            <div style={{ width: '60px', height: '22px', background: '#f1f5f9', borderRadius: '6px' }} />
        </div>
        <div style={{ width: '100%', height: '20px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '0.5rem' }} />
        <div style={{ width: '70%', height: '20px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '0.75rem' }} />
        <div style={{ width: '40%', height: '14px', background: '#f1f5f9', borderRadius: '4px' }} />
    </div>
);

export default function ManuscriptsPage() {
    const router = useRouter();
    const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
    const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [currentPage, setCurrentPage] = useState(1);

    // Debounce search query
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(searchQuery);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery);
        }, 500);

        return () => clearTimeout(timer);
    }, [searchQuery]);

    const fetchManuscripts = async (page = 1, search = '') => {
        try {
            setLoading(true);
            setError('');

            let url = `/manuscripts/my/manuscripts?page=${page}&limit=12`;
            if (search) {
                url += `&q=${encodeURIComponent(search)}`;
            }

            const response = await fetchJsonWithAuth<{ success: boolean; manuscripts: Manuscript[]; pagination: Pagination; error?: string }>(
                getApiUrl(url)
            );
            if (response.success) {
                setManuscripts(response.manuscripts || []);
                setPagination(response.pagination || { total: 0, page: 1, totalPages: 1 });
            } else {
                setError(response.error || 'Failed to load manuscripts');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load manuscripts. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }
        // Fetch only if it's the initial load or debounce value changes
        // But we handle initial load separately or via this same effect
        fetchManuscripts(1, debouncedSearchQuery);
        setCurrentPage(1); // Reset page on search change
    }, [router, debouncedSearchQuery]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchManuscripts(1, searchQuery);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchManuscripts(page, searchQuery);
    };

    return (
        <div>
            {/* Page Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '2rem',
            }}>
                <div>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        margin: 0,
                    }}>
                        Your Manuscripts
                    </h1>
                    <p style={{
                        fontSize: '0.9375rem',
                        color: '#64748b',
                        marginTop: '0.25rem',
                    }}>
                        Manage your uploaded manuscripts and submissions
                    </p>
                </div>
                <Link href="/dashboard/manuscripts/new" style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.5rem 1rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'white',
                    textDecoration: 'none',
                    background: '#059669',
                    borderRadius: '0.5rem',
                }}>
                    <PlusIcon />
                    Upload New
                </Link>
            </div>

            {error && (
                <div style={{
                    padding: '1rem',
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

            {/* Search and Filters */}
            <div className="search-filter-bar">
                <form onSubmit={handleSearch} style={{ flex: 1, position: 'relative' }}>
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
                        placeholder="Search your manuscripts..."
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
                </form>

                <div style={{
                    display: 'flex',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    overflow: 'hidden',
                }}>
                    <button
                        onClick={() => setViewMode('grid')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '44px',
                            height: '44px',
                            background: viewMode === 'grid' ? '#f1f5f9' : 'white',
                            border: 'none',
                            borderRight: '1px solid #e5e7eb',
                            cursor: 'pointer',
                            color: viewMode === 'grid' ? '#0f172a' : '#64748b',
                        }}
                    >
                        <GridIcon />
                    </button>
                    <button
                        onClick={() => setViewMode('list')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '44px',
                            height: '44px',
                            background: viewMode === 'list' ? '#f1f5f9' : 'white',
                            border: 'none',
                            cursor: 'pointer',
                            color: viewMode === 'list' ? '#0f172a' : '#64748b',
                        }}
                    >
                        <ListIcon />
                    </button>
                </div>
            </div>

            {/* Results Count */}
            <div style={{
                marginBottom: '1rem',
                fontSize: '0.875rem',
                color: '#64748b',
            }}>
                Showing <strong style={{ color: '#0f172a' }}>{manuscripts.length}</strong> of {pagination.total} manuscripts
            </div>

            {/* Manuscripts Grid */}
            {loading ? (
                <div className={viewMode === 'grid' ? "manuscripts-grid" : "manuscripts-list"}>
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <LoadingSkeleton key={i} />
                    ))}
                </div>
            ) : manuscripts.length > 0 ? (
                <div className={viewMode === 'grid' ? "manuscripts-grid" : "manuscripts-list"}>
                    {manuscripts.map((manuscript) => (
                        <ManuscriptCard key={manuscript._id} manuscript={manuscript} />
                    ))}
                </div>
            ) : (
                <div style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '4rem 2rem',
                    textAlign: 'center',
                }}>
                    <div style={{
                        width: '64px',
                        height: '64px',
                        background: '#f8fafc',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        color: '#94a3b8',
                    }}>
                        <BookIcon />
                    </div>
                    <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        marginBottom: '0.5rem',
                    }}>
                        No manuscripts yet
                    </h3>
                    <p style={{
                        fontSize: '0.875rem',
                        color: '#64748b',
                        marginBottom: '1.5rem',
                    }}>
                        Start by uploading your first manuscript to the archive
                    </p>
                    <Link href="/dashboard/manuscripts/new" style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'white',
                        textDecoration: 'none',
                        background: '#059669',
                        borderRadius: '0.5rem',
                    }}>
                        <PlusIcon />
                        Upload Manuscript
                    </Link>
                </div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                    marginTop: '2rem',
                    paddingTop: '2rem',
                    borderTop: '1px solid #e5e7eb',
                }}>
                    <button
                        onClick={() => handlePageChange(currentPage - 1)}
                        disabled={currentPage === 1}
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: currentPage === 1 ? '#94a3b8' : '#0f172a',
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                        }}
                    >
                        Previous
                    </button>
                    {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                        const page = i + 1;
                        return (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: page === currentPage ? 'white' : '#64748b',
                                    background: page === currentPage ? '#059669' : 'white',
                                    border: page === currentPage ? 'none' : '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                }}
                            >
                                {page}
                            </button>
                        );
                    })}
                    <button
                        onClick={() => handlePageChange(currentPage + 1)}
                        disabled={currentPage === pagination.totalPages}
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: currentPage === pagination.totalPages ? '#94a3b8' : '#0f172a',
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
                        }}
                    >
                        Next
                    </button>
                </div>
            )}
        </div>
    );
}
