'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchJsonWithAuth, getApiUrl } from '@/lib/api';

// Icons
const SearchIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
    </svg>
);

interface ReviewTask {
    id: string;
    manuscriptId: string;
    manuscriptTitle: string;
    assignedReviewer: string;
    assignedDate: string;
    status: 'pending' | 'in_progress' | 'completed' | 'overdue';
    priority: 'high' | 'medium' | 'low';
}

export default function ReviewQueuePage() {
    const [tasks, setTasks] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        const fetchTasks = async () => {
            try {
                setLoading(true);
                const response = await fetchJsonWithAuth<any>(getApiUrl('/admin/manuscripts?status=review'));
                if (response.success) {
                    setTasks(response.manuscripts);
                }
            } catch (error) {
                console.error('Failed to fetch review tasks:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchTasks();
    }, []);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'pending': return { bg: '#f1f5f9', color: '#475569', label: 'Pending' };
            case 'in_progress': return { bg: '#dbeafe', color: '#1d4ed8', label: 'In Progress' };
            case 'completed': return { bg: '#dcfce7', color: '#166534', label: 'Completed' };
            case 'overdue': return { bg: '#fee2e2', color: '#991b1b', label: 'Overdue' };
            default: return { bg: '#e2e8f0', color: '#475569', label: status };
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high': return '#dc2626';
            case 'medium': return '#d97706';
            case 'low': return '#059669';
            default: return '#64748b';
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        Review Queue
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
                        Monitor and assign manuscript verification tasks.
                    </p>
                </div>
                <button style={{
                    padding: '0.75rem 1.25rem', backgroundColor: '#0f172a', color: 'white', borderRadius: '0.5rem', border: 'none', fontWeight: 500, cursor: 'pointer'
                }}>
                    Assign Reviewer
                </button>
            </div>

            {/* Content */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e1e4e8',
                overflow: 'hidden',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Manuscript</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Assigned To</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Date Assigned</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Priority</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center' }}>Loading...</td></tr>
                        ) : tasks.length > 0 ? (
                            tasks.map(task => {
                                const status = getStatusBadge(task.status);
                                return (
                                    <tr key={task._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ fontWeight: 600, color: '#0f172a' }}>{task.title}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>ID: {task._id}</div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#334155' }}>
                                            {task.reviewedBy || 'Unassigned'}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem', color: '#64748b' }}>
                                            {new Date(task.createdAt).toLocaleDateString()}
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getPriorityColor('medium') }}></div>
                                                <span style={{ fontSize: '0.875rem', color: '#334155', textTransform: 'capitalize' }}>Medium</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.625rem', borderRadius: '9999px',
                                                fontSize: '0.75rem', fontWeight: 600,
                                                background: status.bg, color: status.color
                                            }}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 1.5rem' }}>
                                            <button style={{ color: '#0284c7', background: 'none', border: 'none', fontWeight: 500, cursor: 'pointer' }}>Manage</button>
                                        </td>
                                    </tr>
                                )
                            })
                        ) : (
                            <tr><td colSpan={6} style={{ padding: '3rem', textAlign: 'center' }}>No reviews.</td></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
