'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchJsonWithAuth, getApiUrl, isAuthenticated } from '@/lib/api';

// Types
interface AccessRequest {
    id: string;
    manuscript_id: string;
    manuscript_title?: string;
    status: string;
    requested_level: string;
    purpose: string;
    created_at: string;
    reviewed_at?: string;
    review_notes?: string;
    expires_at?: string;
}

// Icon Components
const ClockIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const XCircleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
    </svg>
);

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const RefreshIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="23 4 23 10 17 10" />
        <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
);

// Request Row Component
const RequestRow = ({ request }: { request: AccessRequest }) => {
    const statusConfig = {
        PENDING: { bg: '#fef3c7', color: '#b45309', icon: <ClockIcon />, label: 'Pending' },
        APPROVED: { bg: '#dcfce7', color: '#166534', icon: <CheckCircleIcon />, label: 'Approved' },
        REJECTED: { bg: '#fee2e2', color: '#991b1b', icon: <XCircleIcon />, label: 'Rejected' },
    };

    const config = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1.25rem 1.5rem',
            background: 'white',
            borderBottom: '1px solid #f1f5f9',
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                background: config.bg,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: config.color,
                flexShrink: 0,
            }}>
                {config.icon}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    color: '#0f172a',
                    marginBottom: '0.25rem',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {request.manuscript_title || `Manuscript ${request.manuscript_id}`}
                </div>
                <div style={{
                    fontSize: '0.8125rem',
                    color: '#64748b',
                }}>
                    {request.requested_level} access • {request.purpose?.slice(0, 50)}{request.purpose?.length > 50 ? '...' : ''}
                </div>
            </div>

            <span style={{
                padding: '0.25rem 0.625rem',
                background: config.bg,
                color: config.color,
                fontSize: '0.75rem',
                fontWeight: 500,
                borderRadius: '999px',
                flexShrink: 0,
            }}>
                {config.label}
            </span>

            <div style={{
                fontSize: '0.8125rem',
                color: '#94a3b8',
                whiteSpace: 'nowrap',
                flexShrink: 0,
            }}>
                {new Date(request.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>

            <Link href={`/manuscripts/${request.manuscript_id}`} style={{
                padding: '0.5rem 0.75rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: '#475569',
                background: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                textDecoration: 'none',
                transition: 'all 0.15s',
                flexShrink: 0,
            }}>
                View Manuscript
            </Link>
        </div>
    );
};

// Loading Skeleton
const LoadingSkeleton = () => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1.25rem 1.5rem',
        borderBottom: '1px solid #f1f5f9',
    }}>
        <div style={{ width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '10px' }} />
        <div style={{ flex: 1 }}>
            <div style={{ width: '60%', height: '16px', background: '#f1f5f9', borderRadius: '4px', marginBottom: '0.5rem' }} />
            <div style={{ width: '40%', height: '12px', background: '#f1f5f9', borderRadius: '4px' }} />
        </div>
        <div style={{ width: '80px', height: '24px', background: '#f1f5f9', borderRadius: '999px' }} />
    </div>
);

export default function RequestsPage() {
    const router = useRouter();
    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState<'all' | 'PENDING' | 'APPROVED' | 'REJECTED'>('all');

    const fetchRequests = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetchJsonWithAuth<{ success: boolean; requests: AccessRequest[]; error?: string }>(
                getApiUrl('/access-requests/my')
            );
            if (response.success) {
                setRequests(response.requests || []);
            } else {
                setError(response.error || 'Failed to load requests');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load requests. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchRequests();
    }, [router]);

    const filteredRequests = filter === 'all'
        ? requests
        : requests.filter(r => r.status === filter);

    const pendingCount = requests.filter(r => r.status === 'PENDING').length;
    const approvedCount = requests.filter(r => r.status === 'APPROVED').length;
    const rejectedCount = requests.filter(r => r.status === 'REJECTED').length;

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
                        Access Requests
                    </h1>
                    <p style={{
                        fontSize: '0.9375rem',
                        color: '#64748b',
                        marginTop: '0.25rem',
                    }}>
                        Track your manuscript access and download requests
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={fetchRequests}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#475569',
                            background: 'white',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            cursor: 'pointer',
                        }}
                    >
                        <RefreshIcon />
                        Refresh
                    </button>
                    <Link href="/manuscripts" style={{
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
                        Browse Manuscripts
                    </Link>
                </div>
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

            {/* Stats Cards */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1rem',
                marginBottom: '2rem',
            }}>
                <div style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '1.25rem',
                }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{requests.length}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Total Requests</div>
                </div>
                <div style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '1.25rem',
                }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#b45309' }}>{pendingCount}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Pending Review</div>
                </div>
                <div style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '1.25rem',
                }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#166534' }}>{approvedCount}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Approved</div>
                </div>
                <div style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '1.25rem',
                }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#991b1b' }}>{rejectedCount}</div>
                    <div style={{ fontSize: '0.875rem', color: '#64748b' }}>Rejected</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
            }}>
                {[
                    { key: 'all', label: 'All', count: requests.length },
                    { key: 'PENDING', label: 'Pending', count: pendingCount },
                    { key: 'APPROVED', label: 'Approved', count: approvedCount },
                    { key: 'REJECTED', label: 'Rejected', count: rejectedCount },
                ].map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setFilter(tab.key as typeof filter)}
                        style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: filter === tab.key ? 'white' : '#475569',
                            background: filter === tab.key ? '#059669' : 'white',
                            border: filter === tab.key ? 'none' : '1px solid #e5e7eb',
                            borderRadius: '999px',
                            cursor: 'pointer',
                        }}
                    >
                        {tab.label}
                        <span style={{
                            padding: '0.125rem 0.5rem',
                            background: filter === tab.key ? 'rgba(255,255,255,0.2)' : '#f1f5f9',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                        }}>
                            {tab.count}
                        </span>
                    </button>
                ))}
            </div>

            {/* Requests List */}
            <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
            }}>
                <div style={{
                    padding: '1rem 1.5rem',
                    borderBottom: '1px solid #e5e7eb',
                    background: '#f8fafc',
                }}>
                    <h2 style={{
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        margin: 0,
                    }}>
                        {filter === 'all' ? 'All Requests' : `${filter.charAt(0) + filter.slice(1).toLowerCase()} Requests`}
                    </h2>
                </div>

                {loading ? (
                    <>
                        <LoadingSkeleton />
                        <LoadingSkeleton />
                        <LoadingSkeleton />
                    </>
                ) : filteredRequests.length > 0 ? (
                    filteredRequests.map((request) => (
                        <RequestRow key={request.id} request={request} />
                    ))
                ) : (
                    <div style={{
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
                            <ClockIcon />
                        </div>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: '#0f172a',
                            marginBottom: '0.5rem',
                        }}>
                            {filter === 'all' ? 'No access requests yet' : `No ${filter.toLowerCase()} requests`}
                        </h3>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#64748b',
                            marginBottom: '1.5rem',
                        }}>
                            Browse the manuscript archive to request access to restricted materials
                        </p>
                        <Link href="/manuscripts" style={{
                            display: 'inline-flex',
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'white',
                            textDecoration: 'none',
                            background: '#059669',
                            borderRadius: '0.5rem',
                        }}>
                            Browse Manuscripts
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
