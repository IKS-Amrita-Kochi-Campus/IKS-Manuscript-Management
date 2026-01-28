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

const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);



const MoreVerticalIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="1" />
        <circle cx="12" cy="5" r="1" />
        <circle cx="12" cy="19" r="1" />
    </svg>
);

interface User {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: 'active' | 'inactive' | 'pending';
    institution?: string;
    lastLogin?: string;
    joinedAt: string;
}

export default function UserManagementPage() {
    // Existing state
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [roleFilter, setRoleFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');
    const [pagination, setPagination] = useState({ total: 0, page: 1, totalPages: 1 });

    // New state for menu
    const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    const fetchUsers = async (page = 1) => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            params.append('page', page.toString());
            if (searchQuery) params.append('search', searchQuery);
            if (roleFilter !== 'All') params.append('role', roleFilter);
            if (statusFilter !== 'All') params.append('status', statusFilter.toLowerCase());

            const response = await fetchJsonWithAuth<any>(getApiUrl(`/admin/users?${params.toString()}`));
            if (response.success) {
                setUsers(response.users);
                setPagination(response.pagination);
            }
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, [roleFilter, statusFilter]);

    // Handle search with debounce or manual trigger
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchUsers(1);
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'ADMIN': return { bg: '#fee2e2', text: '#dc2626' };
            case 'REVIEWER': return { bg: '#ffedd5', text: '#ea580c' };
            default: return { bg: '#e0f2fe', text: '#0284c7' };
        }
    };

    const getStatusColor = (isActive: boolean) => {
        return isActive ? '#10b981' : '#64748b';
    };

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => setMenuOpenId(null);
        document.addEventListener('click', handleClickOutside);
        return () => document.removeEventListener('click', handleClickOutside);
    }, []);

    const handleMenuClick = (e: React.MouseEvent, userId: string) => {
        e.stopPropagation();
        setMenuOpenId(menuOpenId === userId ? null : userId);
    };

    const handleStatusUpdate = async (userId: string, currentStatus: boolean) => {
        try {
            setActionLoading(userId);
            const response = await fetchJsonWithAuth<{ success: boolean; message: string }>(
                getApiUrl(`/admin/users/${userId}/status`),
                {
                    method: 'PUT',
                    body: JSON.stringify({ isActive: !currentStatus })
                }
            );

            if (response.success) {
                // Optimistic update
                setUsers(users.map(u => u.id === userId ? { ...u, is_active: !currentStatus } : u));
            }
        } catch (error) {
            console.error('Failed to update status:', error);
            alert('Failed to update user status');
        } finally {
            setActionLoading(null);
            setMenuOpenId(null);
        }
    };

    const handleRoleUpdate = async (userId: string, newRole: string) => {
        if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

        try {
            setActionLoading(userId);
            const response = await fetchJsonWithAuth<{ success: boolean; message: string }>(
                getApiUrl(`/admin/users/${userId}/role`),
                {
                    method: 'PUT',
                    body: JSON.stringify({ role: newRole })
                }
            );

            if (response.success) {
                setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));
            }
        } catch (error) {
            console.error('Failed to update role:', error);
            alert('Failed to update user role');
        } finally {
            setActionLoading(null);
            setMenuOpenId(null);
        }
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', margin: 0 }}>
                        User Management
                    </h1>
                    <p style={{ color: '#64748b', marginTop: '0.25rem' }}>
                        Manage system users, roles, and permissions
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                background: 'white',
                padding: '1.25rem',
                borderRadius: '12px',
                border: '1px solid #e1e4e8',
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                <div style={{ position: 'relative', flex: 1, minWidth: '300px' }}>
                    <div style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.75rem 1rem 0.75rem 3rem',
                            border: '1px solid #cbd5e1',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            outline: 'none',
                            transition: 'border-color 0.2s'
                        }}
                    />
                </div>

                <select
                    value={roleFilter}
                    onChange={(e) => setRoleFilter(e.target.value)}
                    style={{
                        padding: '0.75rem 2.5rem 0.75rem 1rem',
                        border: '1px solid #cbd5e1',
                        borderRadius: '0.5rem',
                        background: 'white',
                        minWidth: '150px',
                        cursor: 'pointer'
                    }}
                >
                    <option value="All">All Roles</option>
                    <option value="ADMIN">Admin</option>
                    <option value="REVIEWER">Reviewer</option>
                    <option value="USER">User</option>
                    <option value="OWNER">Owner</option>
                    <option value="VISITOR">Visitor</option>
                </select>

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
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                </select>
            </div>

            {/* Table */}
            <div style={{
                background: 'white',
                borderRadius: '12px',
                border: '1px solid #e1e4e8',
                overflow: 'hidden',
                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
                minHeight: '400px' // Ensure enough height for dropdowns
            }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                    <thead>
                        <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>User</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Role</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Last Login</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Joined</th>
                            <th style={{ padding: '1rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr>
                                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                    Loading users...
                                </td>
                            </tr>
                        ) : users.length > 0 ? (
                            users.map((user: any) => (
                                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background-color 0.15s' }}>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
                                                borderRadius: '50%',
                                                background: '#f1f5f9',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                color: '#64748b'
                                            }}>
                                                <UserIcon />
                                            </div>
                                            <div>
                                                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>{user.first_name} {user.last_name}</div>
                                                <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.625rem',
                                            borderRadius: '9999px',
                                            fontSize: '0.75rem',
                                            fontWeight: 600,
                                            ...getRoleBadgeColor(user.role)
                                        }}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: getStatusColor(user.is_active) }}></div>
                                            <span style={{ fontSize: '0.875rem', color: '#334155', textTransform: 'capitalize' }}>{user.is_active ? 'Active' : 'Inactive'}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                                        {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', fontSize: '0.875rem', color: '#64748b' }}>
                                        {new Date(user.created_at).toLocaleDateString()}
                                    </td>
                                    <td style={{ padding: '1rem 1.5rem', textAlign: 'right', position: 'relative' }}>
                                        <button
                                            onClick={(e) => handleMenuClick(e, user.id)}
                                            style={{
                                                background: menuOpenId === user.id ? '#f1f5f9' : 'transparent',
                                                border: 'none',
                                                color: '#64748b',
                                                cursor: 'pointer',
                                                padding: '0.5rem',
                                                borderRadius: '0.375rem',
                                                transition: 'background-color 0.15s'
                                            }}>
                                            <MoreVerticalIcon />
                                        </button>

                                        {/* Dropdown Menu */}
                                        {menuOpenId === user.id && (
                                            <div style={{
                                                position: 'absolute',
                                                right: '1.5rem',
                                                top: '3rem',
                                                background: 'white',
                                                border: '1px solid #e2e8f0',
                                                borderRadius: '0.5rem',
                                                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                                                zIndex: 50,
                                                minWidth: '160px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{ padding: '0.5rem 0' }}>
                                                    <div style={{ padding: '0.25rem 1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>ACTIONS</div>

                                                    {/* Toggle Status */}
                                                    <button
                                                        onClick={() => handleStatusUpdate(user.id, user.is_active)}
                                                        disabled={actionLoading === user.id}
                                                        style={{
                                                            width: '100%',
                                                            textAlign: 'left',
                                                            padding: '0.5rem 1rem',
                                                            background: 'white',
                                                            border: 'none',
                                                            fontSize: '0.875rem',
                                                            color: user.is_active ? '#dc2626' : '#16a34a',
                                                            cursor: 'pointer',
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            gap: '0.5rem'
                                                        }}
                                                        onMouseOver={(e) => e.currentTarget.style.background = '#f8fafc'}
                                                        onMouseOut={(e) => e.currentTarget.style.background = 'white'}
                                                    >
                                                        {user.is_active ? 'Deactivate User' : 'Activate User'}
                                                    </button>

                                                    <div style={{ borderTop: '1px solid #f1f5f9', margin: '0.5rem 0' }}></div>
                                                    <div style={{ padding: '0.25rem 1rem', fontSize: '0.75rem', color: '#94a3b8', fontWeight: 600 }}>CHANGE ROLE</div>

                                                    {['ADMIN', 'REVIEWER', 'OWNER', 'USER', 'VISITOR'].map(role => (
                                                        <button
                                                            key={role}
                                                            onClick={() => handleRoleUpdate(user.id, role)}
                                                            disabled={user.role === role}
                                                            style={{
                                                                width: '100%',
                                                                textAlign: 'left',
                                                                padding: '0.5rem 1rem',
                                                                background: user.role === role ? '#f0f9ff' : 'white',
                                                                border: 'none',
                                                                fontSize: '0.875rem',
                                                                color: user.role === role ? '#0ea5e9' : '#334155',
                                                                cursor: user.role === role ? 'default' : 'pointer',
                                                                fontWeight: user.role === role ? 500 : 400
                                                            }}
                                                            onMouseOver={(e) => user.role !== role && (e.currentTarget.style.background = '#f8fafc')}
                                                            onMouseOut={(e) => user.role !== role && (e.currentTarget.style.background = 'white')}
                                                        >
                                                            Mark as {role.charAt(0) + role.slice(1).toLowerCase()}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={6} style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
                                    No users found matching your filters.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
