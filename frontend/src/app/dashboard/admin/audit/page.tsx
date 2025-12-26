'use client';

import React, { useState, useEffect } from 'react';
import { fetchJsonWithAuth, getApiUrl } from '@/lib/api';

// Icons
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

interface AuditLog {
    id: string;
    timestamp: string;
    user: string;
    action: string;
    resource: string;
    ipAddress: string;
    status: 'success' | 'failure';
}

export default function AuditLogsPage() {
    const [logs, setLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

    const fetchLogs = async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('page', page.toString());
            if (searchQuery) params.append('action', searchQuery);

            const response = await fetchJsonWithAuth<any>(getApiUrl(`/admin/audit-logs?${params.toString()}`));
            if (response.success) {
                setLogs(response.logs);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch audit logs:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    // Trigger search on enter or button click
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchLogs(1);
    };

    const filteredLogs = logs; // Filtered by backend mostly, but we can keep the local list if needed.

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                    Audit Logs
                </h1>
                <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
                    Track system activity and security events.
                </p>
            </div>

            {/* Search */}
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
                        placeholder="Search logs by user, action, or resource..."
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
                <button style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.75rem 1.25rem', background: 'white', border: '1px solid #cbd5e1', borderRadius: '0.5rem',
                    color: '#475569', fontWeight: 500, cursor: 'pointer'
                }}>
                    <FilterIcon /> Filters
                </button>
            </div>

            {/* Table */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e1e4e8',
                overflow: 'hidden',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.875rem' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>Timestamp</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: '#64748b' }}>User</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: '#64748b' }}>Action</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: '#64748b' }}>Resource</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: '#64748b' }}>IP Address</th>
                            <th style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: '#64748b' }}>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : filteredLogs.length > 0 ? (
                            filteredLogs.map((log: any) => (
                                <tr key={log._id || log.id} style={{ borderBottom: '1px solid #f1f5f9', fontFamily: 'monospace' }}>
                                    <td style={{ padding: '0.75rem 1.5rem', color: '#64748b' }}>{new Date(log.timestamp).toLocaleString()}</td>
                                    <td style={{ padding: '0.75rem 1.5rem', color: '#334155' }}>{log.userId}</td>
                                    <td style={{ padding: '0.75rem 1.5rem', fontWeight: 600, color: '#0f172a' }}>{log.action}</td>
                                    <td style={{ padding: '0.75rem 1.5rem', color: '#64748b' }}>{log.actionCategory || 'N/A'}</td>
                                    <td style={{ padding: '0.75rem 1.5rem', color: '#64748b' }}>{log.ipAddress || 'Internal'}</td>
                                    <td style={{ padding: '0.75rem 1.5rem' }}>
                                        <span style={{
                                            color: '#166534',
                                            fontWeight: 600
                                        }}>
                                            SUCCESS
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>No logs found.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
