'use client';

import React, { useState, useEffect } from 'react';
import { fetchJsonWithAuth, getApiUrl } from '@/lib/api';

// Icons
const UsersIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const FileTextIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

const ActivityIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

const DatabaseIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <ellipse cx="12" cy="5" rx="9" ry="3" />
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
);

const StatCard = ({ title, value, change, icon: Icon, color }: { title: string; value: string; change: string; icon: any; color: string }) => (
    <div style={{
        background: 'white',
        borderRadius: '12px',
        padding: '1.5rem',
        border: '1px solid #e1e4e8',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        display: 'flex',
        flexDirection: 'column',
    }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
            <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: `${color}20`, // 20% opacity
                color: color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}>
                <Icon />
            </div>
            {change && (
                <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    color: change.startsWith('+') ? '#10b981' : '#ef4444',
                    background: change.startsWith('+') ? '#dcfce7' : '#fee2e2',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '999px',
                }}>
                    {change}
                </span>
            )}
        </div>
        <div style={{ fontSize: '2rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
            {value}
        </div>
        <div style={{ fontSize: '0.875rem', color: '#64748b' }}>
            {title}
        </div>
    </div>
);

export default function AnalyticsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await fetchJsonWithAuth<any>(getApiUrl('/admin/statistics'));
                if (response.success) {
                    setStats(response.statistics);
                }
            } catch (error) {
                console.error('Failed to fetch statistics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    if (loading) {
        return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading statistics...</div>;
    }

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    System Analytics
                </h1>
                <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
                    Overview of platform performance and growth.
                </p>
            </div>

            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.5rem',
            }}>
                <StatCard
                    title="Total Users"
                    value={stats?.users?.total?.toLocaleString() || '0'}
                    change={`${stats?.users?.active || 0} active`}
                    icon={UsersIcon}
                    color="#0284c7" // Blue
                />
                <StatCard
                    title="Manuscripts"
                    value={stats?.manuscripts?.total?.toLocaleString() || '0'}
                    change={`${stats?.manuscripts?.published || 0} published`}
                    icon={FileTextIcon}
                    color="#059669" // Green
                />
                <StatCard
                    title="Pending Requests"
                    value={stats?.pending?.accessRequests?.toLocaleString() || '0'}
                    change="Awaiting action"
                    icon={ActivityIcon}
                    color="#d97706" // Amber
                />
                <StatCard
                    title="Pending Verifications"
                    value={stats?.pending?.verifications?.toLocaleString() || '0'}
                    change="Identity checks"
                    icon={DatabaseIcon}
                    color="#7c3aed" // Violet
                />
            </div>

            {/* Recent Activity Section */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                padding: '1.5rem',
                border: '1px solid #e1e4e8',
            }}>
                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                    Recent System Events
                </h2>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    <div style={{ padding: '1rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                        Activity logs can be viewed in the Audit Logs section.
                    </div>
                </div>
            </div>
        </div>
    );
}
