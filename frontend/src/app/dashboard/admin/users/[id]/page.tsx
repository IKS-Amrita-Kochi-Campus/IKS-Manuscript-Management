'use client';

import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { fetchJsonWithAuth, getApiUrl } from '@/lib/api';
import Link from 'next/link';

interface UserDetail extends Record<string, unknown> {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    is_active: boolean;
    verification_status: string;
    institution?: string;
    last_login_at?: string;
    created_at: string;
    manuscript_access_count: number;
    sessions_count: number;
    sessions?: Array<{
        id: string;
        user_agent: string;
        ip_address: string;
        last_active_at: string;
        created_at: string;
        is_valid: boolean;
    }>;
}

const BackIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
    </svg>
);

const UserAvatar = () => (
    <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter();
    // Unwrap params using React.use()
    const resolvedParams = use(params);
    const { id } = resolvedParams;

    const [user, setUser] = useState<UserDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch user details
    useEffect(() => {
        const fetchUserDetails = async () => {
            try {
                // In a real implementation, you might have a specific endpoint for full details
                // including sessions. For now, assuming standard user get + mocked extra data or separate calls if needed.
                // Or you can update the backend to support /admin/users/:id/details
                // Let's assume we can fetch basic user first
                const response = await fetchJsonWithAuth<{ user: UserDetail }>(getApiUrl(`/admin/users/${id}`));
                // For sessions, we might need another call or it comes with user details depending on API design.
                // Assuming it comes for now or we just show a placeholder if not.
                if (response.user) {
                    // Mocking sessions for demonstration if not provided by backend yet
                    const userData = { ...response.user, sessions: response.user.sessions || [] };
                    setUser(userData);
                }
            } catch (error) {
                console.error('Failed to fetch user details:', error);
                alert('Failed to load user details');
                router.push('/dashboard/admin/users');
            } finally {
                setLoading(false);
            }
        };

        fetchUserDetails();
    }, [id, router]);

    const handleStatusUpdate = async () => {
        if (!user) return;
        try {
            setActionLoading(true);
            const response = await fetchJsonWithAuth<{ success: boolean; message: string }>(
                getApiUrl(`/admin/users/${user.id}/status`),
                {
                    method: 'PUT',
                    body: JSON.stringify({ isActive: !user.is_active })
                }
            );

            if (response.success) {
                setUser({ ...user, is_active: !user.is_active });
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update status');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRoleUpdate = async (newRole: string) => {
        if (!user) return;
        if (!confirm(`Change role to ${newRole}?`)) return;

        try {
            setActionLoading(true);
            const response = await fetchJsonWithAuth<{ success: boolean; message: string }>(
                getApiUrl(`/admin/users/${user.id}/role`),
                {
                    method: 'PUT',
                    body: JSON.stringify({ role: newRole })
                }
            );

            if (response.success) {
                setUser({ ...user, role: newRole });
            }
        } catch (error) {
            console.error('Failed to update role:', error);
            alert('Failed to update role');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRevokeSession = async (sessionId: string) => {
        if (!confirm('Are you sure you want to revoke this session?')) return;

        // This is a mocked action since the backend endpoint might not be wired up fully in this context yet
        // Ideally: POST /admin/users/{userId}/sessions/{sessionId}/revoke
        alert('Session revocation logic would run here. (Backend endpoint pending)');
    };

    if (loading) {
        return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>Loading user details...</div>;
    }

    if (!user) {
        return <div style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>User not found</div>;
    }

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div>
                <Link href="/dashboard/admin/users" style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
                    color: '#64748b', textDecoration: 'none', marginBottom: '1rem',
                    fontSize: '0.875rem'
                }}>
                    <BackIcon />
                    Back to Users
                </Link>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                        <div style={{
                            width: '80px', height: '80px', borderRadius: '50%',
                            background: '#eff6ff', color: '#3b82f6',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <UserAvatar />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>
                                {user.firstName} {user.lastName}
                            </h1>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                <span style={{ color: '#64748b' }}>{user.email}</span>
                                <span style={{
                                    padding: '0.25rem 0.75rem', borderRadius: '999px',
                                    fontSize: '0.75rem', fontWeight: 600,
                                    background: user.is_active ? '#dcfce7' : '#fee2e2',
                                    color: user.is_active ? '#166534' : '#991b1b'
                                }}>
                                    {user.is_active ? 'Active' : 'Inactive'}
                                </span>
                                <span style={{
                                    padding: '0.25rem 0.75rem', borderRadius: '999px',
                                    fontSize: '0.75rem', fontWeight: 600,
                                    background: '#f1f5f9', color: '#475569',
                                    textTransform: 'uppercase'
                                }}>
                                    {user.role}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button
                            onClick={handleStatusUpdate}
                            disabled={actionLoading}
                            style={{
                                padding: '0.5rem 1rem', borderRadius: '0.5rem',
                                border: '1px solid #e2e8f0', background: 'white',
                                color: user.is_active ? '#dc2626' : '#16a34a',
                                fontWeight: 500, cursor: 'pointer', fontSize: '0.875rem'
                            }}
                        >
                            {user.is_active ? 'Deactivate Account' : 'Activate Account'}
                        </button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                {/* Left Column: Details & Sessions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>

                    {/* Basic Info Card */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.5rem' }}>Account Details</h3>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Institution</label>
                                <div style={{ color: '#0f172a' }}>{user.institution || 'N/A'}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Joined Date</label>
                                <div style={{ color: '#0f172a' }}>{new Date(user.created_at).toLocaleDateString()}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Verification Status</label>
                                <div style={{ color: '#0f172a', textTransform: 'capitalize' }}>{user.verification_status?.toLowerCase().replace('_', ' ') || 'Pending'}</div>
                            </div>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.75rem', color: '#64748b', marginBottom: '0.25rem' }}>Last Login</label>
                                <div style={{ color: '#0f172a' }}>{user.last_login_at ? new Date(user.last_login_at).toLocaleString() : 'Never'}</div>
                            </div>
                        </div>
                    </div>

                    {/* Active Sessions */}
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.5rem' }}>Active Sessions</h3>
                        {(!user.sessions || user.sessions.length === 0) ? (
                            <div style={{ color: '#64748b', fontSize: '0.875rem', fontStyle: 'italic' }}>No active sessions found.</div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {user.sessions.map(session => (
                                    <div key={session.id} style={{
                                        padding: '1rem', border: '1px solid #f1f5f9', borderRadius: '0.5rem',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
                                    }}>
                                        <div>
                                            <div style={{ fontWeight: 500, color: '#0f172a', fontSize: '0.875rem' }}>{session.user_agent}</div>
                                            <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                                                {session.ip_address} • Last active: {new Date(session.last_active_at).toLocaleString()}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleRevokeSession(session.id)}
                                            style={{
                                                color: '#dc2626', background: 'none', border: 'none',
                                                fontSize: '0.75rem', fontWeight: 500, cursor: 'pointer'
                                            }}
                                        >
                                            Revoke
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>
                            Role Management
                        </h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                            {['ADMIN', 'REVIEWER', 'OWNER', 'USER', 'VISITOR'].map(role => (
                                <button
                                    key={role}
                                    onClick={() => handleRoleUpdate(role)}
                                    disabled={loading || user.role === role}
                                    style={{
                                        padding: '0.5rem 1rem',
                                        textAlign: 'left',
                                        borderRadius: '0.375rem',
                                        background: user.role === role ? '#f0f9ff' : 'white',
                                        border: user.role === role ? '1px solid #bae6fd' : '1px solid #e2e8f0',
                                        color: user.role === role ? '#0284c7' : '#64748b',
                                        fontSize: '0.875rem',
                                        cursor: user.role === role ? 'default' : 'pointer'
                                    }}
                                >
                                    {role.charAt(0) + role.slice(1).toLowerCase()}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
                        <h3 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', marginBottom: '1rem' }}>
                            Danger Zone
                        </h3>
                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginBottom: '1rem', lineHeight: 1.5 }}>
                            These actions may affect the user's ability to access the platform.
                        </p>
                        <button style={{
                            width: '100%', padding: '0.5rem',
                            border: '1px solid #fee2e2', borderRadius: '0.375rem',
                            background: '#fef2f2', color: '#991b1b',
                            fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer'
                        }}>
                            Reset Password
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
