'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchJsonWithAuth, getApiUrl, isAuthenticated } from '@/lib/api';

// Types
interface User {
    id: string;
    email: string;
    first_name: string;
    last_name: string;
    role: string;
    institution?: string;
    verification_status?: string;
}

interface Manuscript {
    _id: string;
    title: string;
    author: string;
    language: string;
    category: string;
    visibility: string;
    status: string;
    viewCount?: number;
    createdAt?: string;
}

interface AccessRequest {
    id: string;
    manuscript_id: string;
    manuscript_title?: string;
    status: string;
    requested_level: string;
    created_at: string;
    reviewed_at?: string;
}

interface DashboardStats {
    totalManuscripts: number;
    totalRequests: number;
    pendingRequests: number;
    approvedRequests: number;
}

// Icon Components
const BookIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);

const ClockIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const FileTextIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);

const ChevronRightIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m9 18 6-6-6-6" />
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

// Stats Card Component
const StatsCard = ({ value, label, icon, trend, color = 'emerald' }: {
    value: string | number;
    label: string;
    icon: React.ReactNode;
    trend?: string;
    color?: 'emerald' | 'blue' | 'amber' | 'rose';
}) => {
    const colorClasses = {
        emerald: { bg: '#ecfdf5', text: '#059669' },
        blue: { bg: '#dbeafe', text: '#2563eb' },
        amber: { bg: '#fef3c7', text: '#d97706' },
        rose: { bg: '#ffe4e6', text: '#e11d48' },
    };

    return (
        <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
        }}>
            <div>
                <div style={{
                    fontSize: '1.75rem',
                    fontWeight: 700,
                    color: '#0f172a',
                    lineHeight: 1.2,
                }}>
                    {value}
                </div>
                <div style={{
                    fontSize: '0.875rem',
                    color: '#64748b',
                    marginTop: '0.25rem',
                }}>
                    {label}
                </div>
                {trend && (
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                        marginTop: '0.75rem',
                        padding: '0.25rem 0.5rem',
                        background: '#dcfce7',
                        borderRadius: '999px',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        color: '#166534',
                    }}>
                        {trend}
                    </div>
                )}
            </div>
            <div style={{
                width: '48px',
                height: '48px',
                background: colorClasses[color].bg,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: colorClasses[color].text,
            }}>
                {icon}
            </div>
        </div>
    );
};

// Request Item Component
const RequestItem = ({ request }: { request: AccessRequest }) => {
    const statusConfig = {
        PENDING: { bg: '#fef3c7', color: '#b45309', label: 'Pending' },
        APPROVED: { bg: '#dcfce7', color: '#166534', label: 'Approved' },
        REJECTED: { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
    };

    const config = statusConfig[request.status as keyof typeof statusConfig] || statusConfig.PENDING;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '1rem 0',
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
                <ClockIcon />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: '0.875rem',
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
                    {request.requested_level} access
                </div>
            </div>
            <span style={{
                padding: '0.25rem 0.625rem',
                background: config.bg,
                color: config.color,
                fontSize: '0.75rem',
                fontWeight: 500,
                borderRadius: '999px',
            }}>
                {config.label}
            </span>
        </div>
    );
};

// Manuscript Item Component
const ManuscriptItem = ({ manuscript }: { manuscript: Manuscript }) => (
    <Link
        href={`/dashboard/manuscripts/${manuscript._id}`}
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.75rem 1rem',
            background: '#f8fafc',
            borderRadius: '8px',
            textDecoration: 'none',
            transition: 'all 0.15s',
        }}
    >
        <div style={{ minWidth: 0, flex: 1 }}>
            <div style={{
                fontSize: '0.875rem',
                fontWeight: 500,
                color: '#0f172a',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
            }}>
                {manuscript.title}
            </div>
            <div style={{
                fontSize: '0.75rem',
                color: '#64748b',
                marginTop: '0.125rem',
            }}>
                {manuscript.author}
            </div>
        </div>
        <ChevronRightIcon />
    </Link>
);

// Loading Skeleton
const LoadingSkeleton = () => (
    <div style={{
        background: '#f1f5f9',
        borderRadius: '8px',
        height: '60px',
        animation: 'pulse 2s ease-in-out infinite',
    }} />
);

export default function DashboardPage() {
    const router = useRouter();
    const [user, setUser] = useState<User | null>(null);
    const [manuscripts, setManuscripts] = useState<Manuscript[]>([]);
    const [requests, setRequests] = useState<AccessRequest[]>([]);
    const [stats, setStats] = useState<DashboardStats>({
        totalManuscripts: 0,
        totalRequests: 0,
        pendingRequests: 0,
        approvedRequests: 0,
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError('');

            // Fetch user profile
            const userResponse = await fetchJsonWithAuth<{ success: boolean; user: User }>(getApiUrl('/users/me'));
            if (userResponse.success) {
                setUser(userResponse.user);
            }

            // Fetch user's manuscripts
            const manuscriptsResponse = await fetchJsonWithAuth<{ success: boolean; manuscripts: Manuscript[]; pagination?: { total: number } }>(
                getApiUrl('/manuscripts/my/manuscripts?limit=5')
            );
            if (manuscriptsResponse.success) {
                setManuscripts(manuscriptsResponse.manuscripts || []);
                setStats(prev => ({
                    ...prev,
                    totalManuscripts: manuscriptsResponse.pagination?.total || manuscriptsResponse.manuscripts?.length || 0,
                }));
            }

            // Fetch user's access requests
            const requestsResponse = await fetchJsonWithAuth<{ success: boolean; requests: AccessRequest[] }>(
                getApiUrl('/access-requests/my')
            );
            if (requestsResponse.success) {
                const allRequests = requestsResponse.requests || [];
                setRequests(allRequests.slice(0, 5));
                setStats(prev => ({
                    ...prev,
                    totalRequests: allRequests.length,
                    pendingRequests: allRequests.filter((r: AccessRequest) => r.status === 'PENDING').length,
                    approvedRequests: allRequests.filter((r: AccessRequest) => r.status === 'APPROVED').length,
                }));
            }

        } catch (err) {
            console.error('Dashboard fetch error:', err);
            // Session expired errors are handled by the API client which redirects to login
            setError('Failed to load dashboard data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Check if user is logged in
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }

        fetchDashboardData();
    }, [router]);

    if (loading) {
        return (
            <div>
                <div style={{ marginBottom: '2rem' }}>
                    <div style={{ width: '200px', height: '32px', background: '#f1f5f9', borderRadius: '8px', marginBottom: '0.5rem' }} />
                    <div style={{ width: '300px', height: '20px', background: '#f1f5f9', borderRadius: '4px' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.5rem', height: '120px' }}>
                            <LoadingSkeleton />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

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
                        Welcome back, {user?.first_name || 'Researcher'}
                    </h1>
                    <p style={{
                        fontSize: '0.9375rem',
                        color: '#64748b',
                        marginTop: '0.25rem',
                    }}>
                        Here&apos;s an overview of your research activity
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button
                        onClick={fetchDashboardData}
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
                            transition: 'all 0.15s',
                        }}
                    >
                        <RefreshIcon />
                        Refresh
                    </button>
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
                        transition: 'all 0.15s',
                    }}>
                        <PlusIcon />
                        New Manuscript
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

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '1.5rem',
                marginBottom: '2rem',
            }}>
                <StatsCard
                    value={stats.totalManuscripts}
                    label="Your Manuscripts"
                    icon={<BookIcon />}
                    color="emerald"
                />
                <StatsCard
                    value={stats.totalRequests}
                    label="Total Requests"
                    icon={<FileTextIcon />}
                    color="blue"
                />
                <StatsCard
                    value={stats.pendingRequests}
                    label="Pending Review"
                    icon={<ClockIcon />}
                    color="amber"
                />
                <StatsCard
                    value={stats.approvedRequests}
                    label="Approved Access"
                    icon={<CheckCircleIcon />}
                    color="emerald"
                />
            </div>

            {/* Main Content Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 380px',
                gap: '1.5rem',
            }}>
                {/* Recent Requests */}
                <div style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '1.5rem',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1rem',
                    }}>
                        <h2 style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: '#0f172a',
                            margin: 0,
                        }}>
                            Recent Access Requests
                        </h2>
                        <Link href="/dashboard/requests" style={{
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            color: '#059669',
                            textDecoration: 'none',
                        }}>
                            View all
                        </Link>
                    </div>

                    {requests.length > 0 ? (
                        <div>
                            {requests.map((request) => (
                                <RequestItem key={request.id} request={request} />
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: '#64748b',
                        }}>
                            <ClockIcon />
                            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                No access requests yet
                            </p>
                            <Link href="/manuscripts" style={{
                                display: 'inline-block',
                                marginTop: '1rem',
                                padding: '0.5rem 1rem',
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                color: '#059669',
                                textDecoration: 'none',
                                background: '#ecfdf5',
                                borderRadius: '0.5rem',
                            }}>
                                Browse Manuscripts
                            </Link>
                        </div>
                    )}
                </div>

                {/* Your Manuscripts */}
                <div style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '1.5rem',
                }}>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginBottom: '1rem',
                    }}>
                        <h2 style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: '#0f172a',
                            margin: 0,
                        }}>
                            Your Manuscripts
                        </h2>
                        <Link href="/dashboard/manuscripts" style={{
                            fontSize: '0.8125rem',
                            fontWeight: 500,
                            color: '#059669',
                            textDecoration: 'none',
                        }}>
                            View all
                        </Link>
                    </div>

                    {manuscripts.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {manuscripts.map((manuscript) => (
                                <ManuscriptItem key={manuscript._id} manuscript={manuscript} />
                            ))}
                        </div>
                    ) : (
                        <div style={{
                            padding: '2rem',
                            textAlign: 'center',
                            color: '#64748b',
                        }}>
                            <BookIcon />
                            <p style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                No manuscripts uploaded yet
                            </p>
                            <Link href="/dashboard/manuscripts/new" style={{
                                display: 'inline-block',
                                marginTop: '1rem',
                                padding: '0.5rem 1rem',
                                fontSize: '0.8125rem',
                                fontWeight: 500,
                                color: 'white',
                                textDecoration: 'none',
                                background: '#059669',
                                borderRadius: '0.5rem',
                            }}>
                                Upload Manuscript
                            </Link>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px solid #f1f5f9' }}>
                        <h3 style={{
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: '#0f172a',
                            margin: '0 0 1rem 0',
                        }}>
                            Quick Actions
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            <Link
                                href="/manuscripts"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem 1rem',
                                    background: '#f8fafc',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#0f172a',
                                }}
                            >
                                Browse Archive
                                <ChevronRightIcon />
                            </Link>
                            <Link
                                href="/dashboard/settings"
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    padding: '0.75rem 1rem',
                                    background: '#f8fafc',
                                    borderRadius: '8px',
                                    textDecoration: 'none',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#0f172a',
                                }}
                            >
                                Account Settings
                                <ChevronRightIcon />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
