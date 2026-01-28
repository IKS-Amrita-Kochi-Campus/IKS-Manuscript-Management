'use client';

import React, { useState, useEffect } from 'react';
import { fetchJsonWithAuth, getApiUrl } from '@/lib/api';
import Link from 'next/link';

// Icons
const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

const FileTextIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

const MoreVerticalIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="19" r="1" />
    </svg>
);

const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

interface Manuscript {
    id: string;
    title: string;
    author: string;
    owner: string;
    visibility: 'public' | 'private' | 'restricted';
    status: 'published' | 'draft' | 'under_review';
    uploadedAt: string;
    viewCount: number;
}

export default function AllManuscriptsPage() {
    const [manuscripts, setManuscripts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

    const fetchManuscripts = async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('page', page.toString());
            if (statusFilter !== 'All') params.append('status', statusFilter);

            const response = await fetchJsonWithAuth<any>(getApiUrl(`/admin/manuscripts?${params.toString()}`));
            if (response.success) {
                setManuscripts(response.manuscripts);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch manuscripts:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchManuscripts();
    }, [statusFilter]);

    const filteredManuscripts = manuscripts.filter(m =>
        m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (m.author && m.author.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case 'published': return { bg: '#dcfce7', color: '#166534', label: 'Published' };
            case 'draft': return { bg: '#f1f5f9', color: '#475569', label: 'Draft' };
            case 'under_review': return { bg: '#ffedd5', color: '#c2410c', label: 'Under Review' };
            default: return { bg: '#e2e8f0', color: '#475569', label: status };
        }
    };

    const getVisibilityColor = (visibility: string) => {
        switch (visibility) {
            case 'public': return '#10b981';
            case 'restricted': return '#f59e0b';
            case 'private': return '#ef4444';
            default: return '#cbd5e1';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Manuscripts Archive
                </h1>
                <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
                    View and manage all manuscripts in the system.
                </p>
            </div>

            {/* Filters */}
            <div style={{
                background: 'white',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #e1e4e8',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center'
            }}>
                <div style={{ position: 'relative', flex: 1 }}>
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Search manuscripts..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            outline: 'none',
                        }}
                    />
                </div>

                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    style={{
                        padding: '0.75rem 2.5rem 0.75rem 1rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '0.5rem',
                        background: 'white',
                        minWidth: '150px',
                        cursor: 'pointer'
                    }}
                >
                    <option value="All">All Status</option>
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                    <option value="under_review">Under Review</option>
                </select>
            </div>

            {/* Table */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e1e4e8',
                overflow: 'hidden',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Title / ID</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Owner</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Visibility</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Uploaded</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Views</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading...</td></tr>
                        ) : filteredManuscripts.length > 0 ? (
                            filteredManuscripts.map((m) => {
                                const statusStyle = getStatusBadgeStyle(m.status);
                                return (
                                    <tr key={m._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                                                <div style={{ marginTop: '2px', color: '#94a3b8' }}><FileTextIcon /></div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: '#0f172a' }}>{m.title}</div>
                                                    <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>ID: {m._id} • Author: {m.author || 'Unknown'}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#334155' }}>{m.ownerId}</td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.625rem',
                                                borderRadius: '9999px',
                                                fontSize: '0.75rem',
                                                fontWeight: 600,
                                                background: statusStyle.bg,
                                                color: statusStyle.color
                                            }}>
                                                {statusStyle.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: getVisibilityColor(m.visibility) }}></div>
                                                <span style={{ fontSize: '0.875rem', color: '#64748b', textTransform: 'capitalize' }}>{m.visibility}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                                            {new Date(m.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                                            {(m.viewCount || 0).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                                                <Link href={`/dashboard/manuscripts/${m._id}`} style={{
                                                    display: 'inline-flex', padding: '0.25rem', color: '#64748b', borderRadius: '4px'
                                                }}>
                                                    <EyeIcon />
                                                </Link>
                                                <button style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '0.25rem' }}>
                                                    <MoreVerticalIcon />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr><td colSpan={7} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>No manuscripts found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
