'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchJsonWithAuth, getApiUrl } from '@/lib/api';

// Types
interface Manuscript {
    _id: string;
    title: string;
    alternateTitle?: string;
    author: string;
    category: string;
    subject?: string;
    language: string;
    visibility: string;
    status: string;
    abstract?: string;
    centuryEstimate?: string;
    origin?: string;
    viewCount?: number;
    coverThumbnail?: string;
}

interface FilterOptions {
    languages: string[];
    categories: string[];
    subjects: string[];
    origins: string[];
    materials: string[];
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

const FilterIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
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

const BookmarkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);

const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const ChevronDownIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6" />
    </svg>
);

const XIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const BookIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);

// Manuscript Card Component
const ManuscriptCard = ({ manuscript }: { manuscript: Manuscript }) => (
    <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1.5rem',
        transition: 'all 0.2s',
        cursor: 'pointer',
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
                display: 'inline-flex',
                padding: '0.25rem 0.625rem',
                background: manuscript.visibility === 'public' ? '#dcfce7' : '#fef3c7',
                color: manuscript.visibility === 'public' ? '#166534' : '#92400e',
                fontSize: '0.6875rem',
                fontWeight: 500,
                borderRadius: '999px',
            }}>
                {manuscript.visibility === 'public' ? 'Available' : 'Restricted'}
            </span>
            <span style={{
                fontSize: '0.75rem',
                color: '#94a3b8',
            }}>
                {manuscript.centuryEstimate || 'Unknown'}
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

        <p style={{
            fontSize: '0.8125rem',
            color: '#94a3b8',
            lineHeight: 1.5,
            marginBottom: '1rem',
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
        }}>
            {manuscript.abstract || 'No description available'}
        </p>

        <div style={{
            display: 'flex',
            gap: '0.5rem',
            marginBottom: '1rem',
        }}>
            <span style={{
                padding: '0.25rem 0.5rem',
                background: '#f1f5f9',
                color: '#475569',
                fontSize: '0.6875rem',
                fontWeight: 500,
                borderRadius: '6px',
            }}>
                {manuscript.language}
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

        <div style={{
            display: 'flex',
            gap: '0.5rem',
            paddingTop: '1rem',
            borderTop: '1px solid #f1f5f9',
            marginTop: 'auto',
        }}>
            <Link href={`/manuscripts/${manuscript._id}`} style={{
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
                transition: 'all 0.15s',
            }}>
                <EyeIcon />
                View Details
            </Link>
            <button style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem 0.75rem',
                color: '#64748b',
                background: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
            }}>
                <BookmarkIcon />
            </button>
        </div>
    </div>
);

// Loading Skeleton
const LoadingSkeleton = () => (
    <div style={{
        background: 'white',
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        padding: '1.5rem',
        height: '280px',
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <div style={{ width: '70px', height: '22px', background: '#f1f5f9', borderRadius: '999px' }} />
            <div style={{ width: '60px', height: '16px', background: '#f1f5f9', borderRadius: '4px' }} />
        </div>
        <div style={{ width: '100%', height: '20px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '0.5rem' }} />
        <div style={{ width: '70%', height: '20px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '1rem' }} />
        <div style={{ width: '40%', height: '14px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '1rem' }} />
        <div style={{ width: '100%', height: '40px', background: '#f1f5f9', borderRadius: '4px' }} />
    </div>
);

export default function DashboardBrowsePage() {
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [selectedLanguage, setSelectedLanguage] = useState('All');
    const [showFilters, setShowFilters] = useState(false);
    const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
    const [filters, setFilters] = useState<FilterOptions | null>(null);
    const [pagination, setPagination] = useState<Pagination>({ total: 0, page: 1, totalPages: 1 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    // Fetch filter options
    const fetchFilters = async () => {
        try {
            const response = await fetchJsonWithAuth<{ success: boolean; filters: FilterOptions }>(getApiUrl('/manuscripts/filters'));
            if (response.success) {
                setFilters(response.filters);
            }
        } catch (err) {
            console.error('Failed to fetch filters:', err);
        }
    };

    // Fetch manuscripts
    const fetchManuscripts = async (page = 1) => {
        try {
            setLoading(true);
            setError('');

            const params = new URLSearchParams();
            params.append('page', String(page));
            params.append('limit', '12');

            if (searchQuery) {
                params.append('q', searchQuery);
            }
            if (selectedCategory !== 'All') {
                params.append('category', selectedCategory);
            }
            if (selectedLanguage !== 'All') {
                params.append('language', selectedLanguage);
            }

            const response = await fetchJsonWithAuth<{ success: boolean; manuscripts: Manuscript[]; pagination: Pagination }>(
                getApiUrl(`/manuscripts/search?${params.toString()}`)
            );

            if (response.success) {
                setManuscripts(response.manuscripts || []);
                setPagination(response.pagination || { total: 0, page: 1, totalPages: 1 });
            } else {
                setError('Failed to load manuscripts');
            }
        } catch (err) {
            console.error('Failed to fetch manuscripts:', err);
            setError('Failed to load manuscripts. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFilters();
        fetchManuscripts();
    }, []);

    useEffect(() => {
        setCurrentPage(1);
        fetchManuscripts(1);
    }, [selectedCategory, selectedLanguage]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setCurrentPage(1);
        fetchManuscripts(1);
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
        fetchManuscripts(page);
    };

    const activeFilters = [];
    if (selectedCategory !== 'All') activeFilters.push({ type: 'category', value: selectedCategory });
    if (selectedLanguage !== 'All') activeFilters.push({ type: 'language', value: selectedLanguage });

    const categories = ['All', ...(filters?.categories || [])];
    const languages = ['All', ...(filters?.languages || [])];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header Section */}
            <div>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    marginBottom: '0.5rem',
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: '#ecfdf5',
                        borderRadius: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#059669',
                    }}>
                        <BookIcon />
                    </div>
                    <div>
                        <h1 style={{
                            fontSize: '1.75rem',
                            fontWeight: 600,
                            color: '#0f172a',
                            margin: 0,
                        }}>
                            Browse Archive
                        </h1>
                        <p style={{
                            fontSize: '0.9375rem',
                            color: '#64748b',
                            marginTop: '0.25rem',
                        }}>
                            Explore the comprehensive collection of indigenous knowledge texts
                        </p>
                    </div>
                </div>
            </div>

            {/* Search and Filters Bar */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '0.5rem',
            }}>
                <form onSubmit={handleSearch} style={{
                    flex: 1,
                    position: 'relative',
                }}>
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
                        placeholder="Search manuscripts by title, author, or keywords..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            height: '48px',
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

                <button
                    onClick={() => setShowFilters(!showFilters)}
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0 1.25rem',
                        height: '48px',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: showFilters ? '#059669' : '#475569',
                        background: showFilters ? '#ecfdf5' : 'white',
                        border: `1px solid ${showFilters ? '#059669' : '#e5e7eb'}`,
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        transition: 'all 0.15s',
                    }}
                >
                    <FilterIcon />
                    Filters
                    {activeFilters.length > 0 && (
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '20px',
                            height: '20px',
                            background: '#059669',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            borderRadius: '50%',
                        }}>
                            {activeFilters.length}
                        </span>
                    )}
                </button>

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
                            width: '48px',
                            height: '48px',
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
                            width: '48px',
                            height: '48px',
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

            {/* Filter Panel */}
            {showFilters && (
                <div style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '1.5rem',
                    marginBottom: '0.5rem',
                }}>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                        gap: '1.5rem',
                    }}>
                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                color: '#0f172a',
                                marginBottom: '0.5rem',
                            }}>
                                Category
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '40px',
                                        padding: '0 2rem 0 0.75rem',
                                        fontSize: '0.875rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        background: 'white',
                                        color: '#0f172a',
                                        outline: 'none',
                                        appearance: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {categories.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <div style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none',
                                    color: '#64748b',
                                }}>
                                    <ChevronDownIcon />
                                </div>
                            </div>
                        </div>

                        <div>
                            <label style={{
                                display: 'block',
                                fontSize: '0.8125rem',
                                fontWeight: 600,
                                color: '#0f172a',
                                marginBottom: '0.5rem',
                            }}>
                                Language
                            </label>
                            <div style={{ position: 'relative' }}>
                                <select
                                    value={selectedLanguage}
                                    onChange={(e) => setSelectedLanguage(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '40px',
                                        padding: '0 2rem 0 0.75rem',
                                        fontSize: '0.875rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        background: 'white',
                                        color: '#0f172a',
                                        outline: 'none',
                                        appearance: 'none',
                                        cursor: 'pointer',
                                    }}
                                >
                                    {languages.map((lang) => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </select>
                                <div style={{
                                    position: 'absolute',
                                    right: '0.75rem',
                                    top: '50%',
                                    transform: 'translateY(-50%)',
                                    pointerEvents: 'none',
                                    color: '#64748b',
                                }}>
                                    <ChevronDownIcon />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div style={{
                    padding: '1rem',
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    borderRadius: '0.5rem',
                    color: '#991b1b',
                    fontSize: '0.875rem',
                }}>
                    {error}
                </div>
            )}

            {/* Content Grid */}
            {loading ? (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: viewMode === 'grid'
                        ? 'repeat(auto-fill, minmax(300px, 1fr))'
                        : '1fr',
                    gap: '1.5rem',
                }}>
                    {[1, 2, 3, 4, 5, 6].map((n) => (
                        <LoadingSkeleton key={n} />
                    ))}
                </div>
            ) : manuscripts.length > 0 ? (
                <>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: viewMode === 'grid'
                            ? 'repeat(auto-fill, minmax(300px, 1fr))'
                            : '1fr',
                        gap: '1.5rem',
                    }}>
                        {manuscripts.map((manuscript) => (
                            <ManuscriptCard key={manuscript._id} manuscript={manuscript} />
                        ))}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div style={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            gap: '1rem',
                            marginTop: '2rem',
                            marginBottom: '2rem',
                        }}>
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #e5e7eb',
                                    background: 'white',
                                    color: currentPage === 1 ? '#94a3b8' : '#0f172a',
                                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                                }}
                            >
                                Previous
                            </button>
                            <span style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                Page {currentPage} of {pagination.totalPages}
                            </span>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === pagination.totalPages}
                                style={{
                                    padding: '0.5rem 1rem',
                                    borderRadius: '0.5rem',
                                    border: '1px solid #e5e7eb',
                                    background: 'white',
                                    color: currentPage === pagination.totalPages ? '#94a3b8' : '#0f172a',
                                    cursor: currentPage === pagination.totalPages ? 'not-allowed' : 'pointer',
                                }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            ) : (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 1rem',
                    background: 'white',
                    borderRadius: '12px',
                    border: '1px solid #e5e7eb',
                }}>
                    <div style={{
                        width: '48px',
                        height: '48px',
                        background: '#f1f5f9',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 1rem',
                        color: '#94a3b8',
                    }}>
                        <SearchIcon />
                    </div>
                    <h3 style={{
                        fontSize: '1rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        marginBottom: '0.5rem',
                    }}>
                        No manuscripts found
                    </h3>
                    <p style={{
                        fontSize: '0.875rem',
                        color: '#64748b',
                    }}>
                        Try adjusting your search or filters to find what you're looking for.
                    </p>
                </div>
            )}
        </div>
    );
}
