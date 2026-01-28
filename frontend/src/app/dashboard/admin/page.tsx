'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchJsonWithAuth, getApiUrl } from '@/lib/api';

// --- Icons ---
const UsersIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const ShieldCheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);

const FileCheckIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="m9 15 2 2 4-4" />
    </svg>
);

const BookOpenIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const ActivityIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

// --- Types ---
interface AdminStats {
    users: {
        total: number;
        active: number;
        verified: number;
    };
    manuscripts: {
        total: number;
        published: number;
    };
    pending: {
        accessRequests: number;
        verifications: number;
    };
}

// Stats Card Component
const AdminStatsCard = ({ title, value, subtext, icon, color = 'blue', href }: {
    title: string;
    value: number | string;
    subtext?: string;
    icon: React.ReactNode;
    color?: 'blue' | 'green' | 'amber' | 'purple';
    href?: string;
}) => {
    const colorClasses = {
        blue: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
        green: { bg: '#f0fdf4', text: '#16a34a', border: '#bbf7d0' },
        amber: { bg: '#fffbeb', text: '#d97706', border: '#fde68a' },
        purple: { bg: '#faf5ff', text: '#9333ea', border: '#e9d5ff' },
    };

    const cardContent = (
        <div style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '1.5rem',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            height: '100%',
            transition: 'transform 0.15s, box-shadow 0.15s',
            cursor: href ? 'pointer' : 'default',
        }}
            onMouseOver={href ? (e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
            } : undefined}
            onMouseOut={href ? (e) => {
                e.currentTarget.style.transform = 'none';
                e.currentTarget.style.boxShadow = 'none';
            } : undefined}
        >
            <div>
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: '#64748b', marginBottom: '0.5rem' }}>
                    {title}
                </p>
                <div style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', lineHeight: 1.2 }}>
                    {value}
                </div>
                {subtext && (
                    <p style={{ fontSize: '0.8125rem', color: '#64748b', marginTop: '0.5rem' }}>
                        {subtext}
                    </p>
                )}
            </div>
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '10px',
                background: colorClasses[color].bg,
                color: colorClasses[color].text,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                {icon}
            </div>
        </div>
    );

    if (href) {
        return <Link href={href} style={{ textDecoration: 'none' }}>{cardContent}</Link>;
    }

    return cardContent;
};

export default function AdminDashboardPage() {
    const router = useRouter();
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                // Determine API endpoint based on role check in backend, usually admin/statistics
                const response = await fetchJsonWithAuth<{ success: boolean; statistics: AdminStats }>(
                    getApiUrl('/admin/statistics')
                );
                if (response.success) {
                    setStats(response.statistics);
                }
            } catch (error) {
                console.error('Failed to load admin stats:', error);
            } finally {
                setLoading(false);
            }
        };

        loadStats();
    }, []);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading admin dashboard...</div>;
    }

    return (
        <div>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.5rem' }}>
                    Admin Dashboard
                </h1>
                <p style={{ color: '#64748b' }}>
                    System overview and management controls
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                {/* User Management */}
                <AdminStatsCard
                    title="Total Users"
                    value={stats?.users.total || 0}
                    subtext={`${stats?.users.active || 0} active • ${stats?.users.verified || 0} verified`}
                    icon={<UsersIcon />}
                    color="blue"
                    href="/dashboard/admin/users"
                />

                {/* Pending Verifications */}
                <AdminStatsCard
                    title="Pending Verifications"
                    value={stats?.pending.verifications || 0}
                    subtext="Users waiting for ID approval"
                    icon={<ShieldCheckIcon />}
                    color={stats?.pending.verifications ? 'amber' : 'green'}
                    href="/dashboard/admin/verifications"
                />

                {/* Access Requests */}
                <AdminStatsCard
                    title="Access Requests"
                    value={stats?.pending.accessRequests || 0}
                    subtext="Pending manuscript access reviews"
                    icon={<FileCheckIcon />}
                    color={stats?.pending.accessRequests ? 'amber' : 'green'}
                    href="/dashboard/admin/requests"
                />

                {/* Manuscripts */}
                <AdminStatsCard
                    title="Manuscripts"
                    value={stats?.manuscripts.total || 0}
                    subtext={`${stats?.manuscripts.published || 0} published`}
                    icon={<BookOpenIcon />}
                    color="purple"
                    href="/dashboard/admin/manuscripts"
                />
            </div>

            {/* Admin Quick Actions / Sections */}
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.5rem' }}>
                Management Modules
            </h2>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '1.5rem'
            }}>
                {/* User Module */}
                <Link href="/dashboard/admin/users" style={{ textDecoration: 'none' }}>
                    <div style={{
                        background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem',
                        transition: 'transform 0.15s', cursor: 'pointer'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: '#eff6ff', borderRadius: '8px', color: '#2563eb' }}>
                                <UsersIcon />
                            </div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>User Management</h3>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                            View all registered users, manage roles, and review account statuses.
                        </p>
                    </div>
                </Link>

                {/* Verification Module */}
                <Link href="/dashboard/admin/verifications" style={{ textDecoration: 'none' }}>
                    <div style={{
                        background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem',
                        transition: 'transform 0.15s', cursor: 'pointer'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: '#ecfccb', borderRadius: '8px', color: '#65a30d' }}>
                                <ShieldCheckIcon />
                            </div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Identity Verification</h3>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                            Review uploaded identity documents and approve or reject user verification requests.
                        </p>
                    </div>
                </Link>

                {/* System Logs Module */}
                <Link href="/dashboard/admin/audit" style={{ textDecoration: 'none' }}>
                    <div style={{
                        background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem',
                        transition: 'transform 0.15s', cursor: 'pointer'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                            <div style={{ padding: '0.75rem', background: '#f3f4f6', borderRadius: '8px', color: '#4b5563' }}>
                                <ActivityIcon />
                            </div>
                            <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>System Audit Logs</h3>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                            Track system activities, user actions, and security events for compliance.
                        </p>
                    </div>
                </Link>
            </div>
        </div>
    );
}
