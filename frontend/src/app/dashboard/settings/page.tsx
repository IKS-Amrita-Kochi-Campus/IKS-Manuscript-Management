'use client';

import React, { useEffect, useState } from 'react';
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
    designation?: string;
    research_interests?: string[];
    phone?: string;
    address?: string;
    verification_status?: string;
    email_verified?: boolean;
    created_at?: string;
}

interface Session {
    id: string;
    ipAddress: string;
    userAgent: string;
    createdAt: string;
    expiresAt: string;
    isCurrent: boolean;
}

// Icon Components
const UserIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
        <circle cx="12" cy="7" r="4" />
    </svg>
);

const ShieldIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const BellIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const FileCheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <path d="m9 15 2 2 4-4" />
    </svg>
);

const LoadingSpinner = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" />
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </svg>
);

export default function SettingsPage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'profile' | 'security' | 'verification' | 'notifications'>('profile');
    const [user, setUser] = useState<User | null>(null);
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form states
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [institution, setInstitution] = useState('');
    const [designation, setDesignation] = useState('');
    const [phone, setPhone] = useState('');

    // Password change states
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [changingPassword, setChangingPassword] = useState(false);

    // Verification states
    const [idType, setIdType] = useState('PAN_CARD');
    const [idFile, setIdFile] = useState<File | null>(null);
    const [uploadingId, setUploadingId] = useState(false);

    const fetchUserData = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetchJsonWithAuth<{ success: boolean; user: User }>(getApiUrl('/users/me'));
            if (response.success) {
                setUser(response.user);
                setFirstName(response.user.first_name || '');
                setLastName(response.user.last_name || '');
                setInstitution(response.user.institution || '');
                setDesignation(response.user.designation || '');
                setPhone(response.user.phone || '');
            }

            // Fetch sessions
            try {
                const sessionsResponse = await fetchJsonWithAuth<{ success: boolean; sessions: Session[] }>(getApiUrl('/users/me/sessions'));
                if (sessionsResponse.success) {
                    setSessions(sessionsResponse.sessions || []);
                }
            } catch {
                // Sessions endpoint may not exist yet
                console.log('Sessions endpoint not available');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load settings. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchUserData();
    }, [router]);

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetchJsonWithAuth<{ success: boolean; user: User; error?: string }>(getApiUrl('/users/me'), {
                method: 'PUT',
                body: JSON.stringify({
                    firstName,
                    lastName,
                    institution,
                    designation,
                    phone,
                }),
            });

            if (response.success) {
                setSuccess('Profile updated successfully');
                setUser(response.user);
            } else {
                setError(response.error || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Save error:', err);
            setError('Failed to update profile. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();

        if (newPassword !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }

        setChangingPassword(true);
        setError('');
        setSuccess('');

        try {
            const response = await fetchJsonWithAuth<{ success: boolean; error?: string }>(getApiUrl('/users/me/password'), {
                method: 'PUT',
                body: JSON.stringify({
                    currentPassword,
                    newPassword,
                }),
            });

            if (response.success) {
                setSuccess('Password changed successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setError(response.error || 'Failed to change password');
            }
        } catch (err) {
            console.error('Password change error:', err);
            setError('Failed to change password. Please try again.');
        } finally {
            setChangingPassword(false);
        }
    };

    const handleRevokeSession = async (sessionId: string) => {
        try {
            const response = await fetchJsonWithAuth<{ success: boolean; error?: string }>(getApiUrl(`/users/me/sessions/${sessionId}`), {
                method: 'DELETE',
            });

            if (response.success) {
                setSessions(sessions.filter(s => s.id !== sessionId));
                setSuccess('Session revoked successfully');
            } else {
                setError(response.error || 'Failed to revoke session');
            }
        } catch (err) {
            console.error('Revoke error:', err);
            setError('Failed to revoke session. Please try again.');
        }
    };

    const handleUploadIdentity = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!idFile) {
            setError('Please select a file to upload');
            return;
        }

        setUploadingId(true);
        setError('');
        setSuccess('');

        try {
            const formData = new FormData();
            formData.append('document', idFile);
            formData.append('documentType', idType);

            const tokens = localStorage.getItem('auth_tokens');
            const { accessToken } = tokens ? JSON.parse(tokens) : {};

            const response = await fetch(getApiUrl('/users/me/identity'), {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setSuccess('Identity document uploaded successfully. It is now pending verification.');
                setIdFile(null);
                fetchUserData();
            } else {
                setError(data.error || 'Failed to upload document');
            }
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload document. Please try again.');
        } finally {
            setUploadingId(false);
        }
    };

    const tabs = [
        { id: 'profile' as const, label: 'Profile', icon: <UserIcon /> },
        { id: 'security' as const, label: 'Security', icon: <ShieldIcon /> },
        { id: 'verification' as const, label: 'ID Verification', icon: <FileCheckIcon /> },
        { id: 'notifications' as const, label: 'Notifications', icon: <BellIcon /> },
    ];

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                <LoadingSpinner />
                <span style={{ marginLeft: '0.5rem', color: '#64748b' }}>Loading settings...</span>
            </div>
        );
    }

    return (
        <div>
            {/* Page Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    margin: 0,
                }}>
                    Account Settings
                </h1>
                <p style={{
                    fontSize: '0.9375rem',
                    color: '#64748b',
                    marginTop: '0.25rem',
                }}>
                    Manage your profile and account preferences
                </p>
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

            {success && (
                <div style={{
                    padding: '1rem',
                    background: '#dcfce7',
                    border: '1px solid #bbf7d0',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                    fontSize: '0.875rem',
                    color: '#166534',
                }}>
                    {success}
                </div>
            )}

            <div style={{
                display: 'grid',
                gridTemplateColumns: '240px 1fr',
                gap: '2rem',
            }}>
                {/* Sidebar Tabs */}
                <div style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '1rem',
                    height: 'fit-content',
                }}>
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.75rem',
                                width: '100%',
                                padding: '0.75rem 1rem',
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: activeTab === tab.id ? '#059669' : '#475569',
                                background: activeTab === tab.id ? '#ecfdf5' : 'transparent',
                                border: 'none',
                                borderRadius: '0.5rem',
                                cursor: 'pointer',
                                textAlign: 'left',
                                marginBottom: '0.25rem',
                            }}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '12px',
                    padding: '2rem',
                }}>
                    {activeTab === 'profile' && (
                        <form onSubmit={handleSaveProfile}>
                            <h2 style={{
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                color: '#0f172a',
                                marginBottom: '1.5rem',
                            }}>
                                Profile Information
                            </h2>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1.5rem',
                                marginBottom: '1.5rem',
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#0f172a',
                                        marginBottom: '0.5rem',
                                    }}>
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        value={firstName}
                                        onChange={(e) => setFirstName(e.target.value)}
                                        style={{
                                            width: '100%',
                                            height: '44px',
                                            padding: '0 0.875rem',
                                            fontSize: '0.9375rem',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.5rem',
                                            background: 'white',
                                            color: '#0f172a',
                                            outline: 'none',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#0f172a',
                                        marginBottom: '0.5rem',
                                    }}>
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        value={lastName}
                                        onChange={(e) => setLastName(e.target.value)}
                                        style={{
                                            width: '100%',
                                            height: '44px',
                                            padding: '0 0.875rem',
                                            fontSize: '0.9375rem',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.5rem',
                                            background: 'white',
                                            color: '#0f172a',
                                            outline: 'none',
                                        }}
                                    />
                                </div>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#0f172a',
                                    marginBottom: '0.5rem',
                                }}>
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={user?.email || ''}
                                    disabled
                                    style={{
                                        width: '100%',
                                        height: '44px',
                                        padding: '0 0.875rem',
                                        fontSize: '0.9375rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        background: '#f8fafc',
                                        color: '#64748b',
                                        outline: 'none',
                                    }}
                                />
                                <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                    Email cannot be changed
                                </p>
                            </div>

                            <div style={{ marginBottom: '1.5rem' }}>
                                <label style={{
                                    display: 'block',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: '#0f172a',
                                    marginBottom: '0.5rem',
                                }}>
                                    Institution / Organization
                                </label>
                                <input
                                    type="text"
                                    value={institution}
                                    onChange={(e) => setInstitution(e.target.value)}
                                    style={{
                                        width: '100%',
                                        height: '44px',
                                        padding: '0 0.875rem',
                                        fontSize: '0.9375rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        background: 'white',
                                        color: '#0f172a',
                                        outline: 'none',
                                    }}
                                />
                            </div>

                            <div style={{
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '1.5rem',
                                marginBottom: '2rem',
                            }}>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#0f172a',
                                        marginBottom: '0.5rem',
                                    }}>
                                        Designation
                                    </label>
                                    <input
                                        type="text"
                                        value={designation}
                                        onChange={(e) => setDesignation(e.target.value)}
                                        placeholder="e.g., Professor, Researcher"
                                        style={{
                                            width: '100%',
                                            height: '44px',
                                            padding: '0 0.875rem',
                                            fontSize: '0.9375rem',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.5rem',
                                            background: 'white',
                                            color: '#0f172a',
                                            outline: 'none',
                                        }}
                                    />
                                </div>
                                <div>
                                    <label style={{
                                        display: 'block',
                                        fontSize: '0.875rem',
                                        fontWeight: 500,
                                        color: '#0f172a',
                                        marginBottom: '0.5rem',
                                    }}>
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        style={{
                                            width: '100%',
                                            height: '44px',
                                            padding: '0 0.875rem',
                                            fontSize: '0.9375rem',
                                            border: '1px solid #e5e7eb',
                                            borderRadius: '0.5rem',
                                            background: 'white',
                                            color: '#0f172a',
                                            outline: 'none',
                                        }}
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                style={{
                                    display: 'inline-flex',
                                    alignItems: 'center',
                                    gap: '0.5rem',
                                    padding: '0.5rem 1.5rem',
                                    fontSize: '0.875rem',
                                    fontWeight: 500,
                                    color: 'white',
                                    background: saving ? '#6ee7b7' : '#059669',
                                    border: 'none',
                                    borderRadius: '0.5rem',
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                }}
                            >
                                {saving && <LoadingSpinner />}
                                {saving ? 'Saving...' : 'Save Changes'}
                            </button>
                        </form>
                    )}

                    {activeTab === 'security' && (
                        <div>
                            <h2 style={{
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                color: '#0f172a',
                                marginBottom: '1.5rem',
                            }}>
                                Security Settings
                            </h2>

                            {/* Change Password */}
                            <div style={{
                                padding: '1.5rem',
                                background: '#f8fafc',
                                borderRadius: '12px',
                                marginBottom: '2rem',
                            }}>
                                <h3 style={{
                                    fontSize: '0.9375rem',
                                    fontWeight: 600,
                                    color: '#0f172a',
                                    marginBottom: '1rem',
                                }}>
                                    Change Password
                                </h3>

                                <form onSubmit={handleChangePassword}>
                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            color: '#0f172a',
                                            marginBottom: '0.5rem',
                                        }}>
                                            Current Password
                                        </label>
                                        <input
                                            type="password"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            style={{
                                                width: '100%',
                                                maxWidth: '400px',
                                                height: '44px',
                                                padding: '0 0.875rem',
                                                fontSize: '0.9375rem',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '0.5rem',
                                                background: 'white',
                                                color: '#0f172a',
                                                outline: 'none',
                                            }}
                                        />
                                    </div>

                                    <div style={{ marginBottom: '1rem' }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            color: '#0f172a',
                                            marginBottom: '0.5rem',
                                        }}>
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            style={{
                                                width: '100%',
                                                maxWidth: '400px',
                                                height: '44px',
                                                padding: '0 0.875rem',
                                                fontSize: '0.9375rem',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '0.5rem',
                                                background: 'white',
                                                color: '#0f172a',
                                                outline: 'none',
                                            }}
                                        />
                                        <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                            Must be at least 8 characters
                                        </p>
                                    </div>

                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            color: '#0f172a',
                                            marginBottom: '0.5rem',
                                        }}>
                                            Confirm New Password
                                        </label>
                                        <input
                                            type="password"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            style={{
                                                width: '100%',
                                                maxWidth: '400px',
                                                height: '44px',
                                                padding: '0 0.875rem',
                                                fontSize: '0.9375rem',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '0.5rem',
                                                background: 'white',
                                                color: '#0f172a',
                                                outline: 'none',
                                            }}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={changingPassword}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.5rem 1.5rem',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            color: 'white',
                                            background: changingPassword ? '#6ee7b7' : '#059669',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            cursor: changingPassword ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        {changingPassword && <LoadingSpinner />}
                                        {changingPassword ? 'Changing...' : 'Change Password'}
                                    </button>
                                </form>
                            </div>

                            {/* Active Sessions */}
                            <div>
                                <h3 style={{
                                    fontSize: '0.9375rem',
                                    fontWeight: 600,
                                    color: '#0f172a',
                                    marginBottom: '1rem',
                                }}>
                                    Active Sessions
                                </h3>

                                <div style={{
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '12px',
                                    overflow: 'hidden',
                                }}>
                                    {sessions.length > 0 ? sessions.map((session, index) => (
                                        <div
                                            key={session.id}
                                            style={{
                                                padding: '1rem 1.5rem',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                borderBottom: index < sessions.length - 1 ? '1px solid #f1f5f9' : 'none',
                                            }}
                                        >
                                            <div>
                                                <div style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 500,
                                                    color: '#0f172a',
                                                    marginBottom: '0.25rem',
                                                }}>
                                                    {session.userAgent?.slice(0, 50) || 'Unknown Device'}
                                                    {session.isCurrent && (
                                                        <span style={{
                                                            marginLeft: '0.5rem',
                                                            padding: '0.125rem 0.5rem',
                                                            background: '#dcfce7',
                                                            color: '#166534',
                                                            fontSize: '0.6875rem',
                                                            fontWeight: 500,
                                                            borderRadius: '999px',
                                                        }}>
                                                            Current
                                                        </span>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                                                    IP: {session.ipAddress} • Created: {new Date(session.createdAt).toLocaleDateString()}
                                                </div>
                                            </div>
                                            {!session.isCurrent && (
                                                <button
                                                    onClick={() => handleRevokeSession(session.id)}
                                                    style={{
                                                        padding: '0.375rem 0.75rem',
                                                        fontSize: '0.8125rem',
                                                        fontWeight: 500,
                                                        color: '#dc2626',
                                                        background: '#fee2e2',
                                                        border: 'none',
                                                        borderRadius: '0.5rem',
                                                        cursor: 'pointer',
                                                    }}
                                                >
                                                    Revoke
                                                </button>
                                            )}
                                        </div>
                                    )) : (
                                        <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>
                                            No active sessions found
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'verification' && (
                        <div>
                            <h2 style={{
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                color: '#0f172a',
                                marginBottom: '1.5rem',
                            }}>
                                Identity Verification
                            </h2>

                            <div style={{
                                padding: '1.5rem',
                                background: user?.verification_status === 'VERIFIED' ? '#f0fdf4' : '#f8fafc',
                                border: `1px solid ${user?.verification_status === 'VERIFIED' ? '#bbf7d0' : '#e5e7eb'}`,
                                borderRadius: '12px',
                                marginBottom: '2rem',
                            }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                                    <div style={{
                                        width: '40px',
                                        height: '40px',
                                        borderRadius: '50%',
                                        background: user?.verification_status === 'VERIFIED' ? '#166534' :
                                            user?.verification_status === 'PENDING' ? '#b45309' : '#64748b',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white'
                                    }}>
                                        <ShieldIcon />
                                    </div>
                                    <div>
                                        <div style={{ fontWeight: 600, color: '#0f172a' }}>
                                            Status: {user?.verification_status || 'NOT_STARTED'}
                                        </div>
                                        <p style={{ fontSize: '0.8125rem', color: '#64748b', margin: 0 }}>
                                            {user?.verification_status === 'VERIFIED' ?
                                                'Your identity has been verified. You can now request manuscript access.' :
                                                user?.verification_status === 'PENDING' ?
                                                    'Your document is currently being reviewed by our administrators.' :
                                                    'Please upload a valid identity document to request access to restricted manuscripts.'
                                            }
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {user?.verification_status !== 'VERIFIED' && user?.verification_status !== 'PENDING' && (
                                <form onSubmit={handleUploadIdentity}>
                                    <div style={{ marginBottom: '1.5rem' }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            color: '#0f172a',
                                            marginBottom: '0.5rem',
                                        }}>
                                            Document Type
                                        </label>
                                        <select
                                            value={idType}
                                            onChange={(e) => setIdType(e.target.value)}
                                            style={{
                                                width: '100%',
                                                maxWidth: '400px',
                                                height: '44px',
                                                padding: '0 0.875rem',
                                                fontSize: '0.9375rem',
                                                border: '1px solid #e5e7eb',
                                                borderRadius: '0.5rem',
                                                background: 'white',
                                                outline: 'none',
                                            }}
                                        >
                                            <option value="PAN_CARD">PAN Card</option>
                                            <option value="AADHAAR_CARD">Aadhaar Card</option>
                                            <option value="PASSPORT">Passport</option>
                                            <option value="VOTER_ID">Voter ID</option>
                                            <option value="INSTITUTIONAL_ID">Institutional ID</option>
                                        </select>
                                    </div>

                                    <div style={{ marginBottom: '2rem' }}>
                                        <label style={{
                                            display: 'block',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            color: '#0f172a',
                                            marginBottom: '0.5rem',
                                        }}>
                                            Upload Document (PDF or Image, max 5MB)
                                        </label>
                                        <div style={{
                                            width: '100%',
                                            maxWidth: '400px',
                                            padding: '2rem',
                                            border: '2px dashed #e5e7eb',
                                            borderRadius: '12px',
                                            textAlign: 'center',
                                            background: '#f8fafc',
                                            cursor: 'pointer',
                                            position: 'relative'
                                        }}>
                                            <input
                                                type="file"
                                                accept=".pdf,.jpg,.jpeg,.png"
                                                onChange={(e) => setIdFile(e.target.files?.[0] || null)}
                                                style={{
                                                    position: 'absolute',
                                                    inset: 0,
                                                    opacity: 0,
                                                    cursor: 'pointer',
                                                }}
                                            />
                                            <div style={{ color: '#64748b' }}>
                                                {idFile ? (
                                                    <div style={{ color: '#059669', fontWeight: 500 }}>
                                                        {idFile.name}
                                                    </div>
                                                ) : (
                                                    <>
                                                        <FileCheckIcon />
                                                        <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                                            Click to select or drag and drop
                                                        </div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={uploadingId}
                                        style={{
                                            display: 'inline-flex',
                                            alignItems: 'center',
                                            gap: '0.5rem',
                                            padding: '0.625rem 1.5rem',
                                            fontSize: '0.875rem',
                                            fontWeight: 500,
                                            color: 'white',
                                            background: uploadingId ? '#6ee7b7' : '#059669',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            cursor: uploadingId ? 'not-allowed' : 'pointer',
                                        }}
                                    >
                                        {uploadingId && <LoadingSpinner />}
                                        {uploadingId ? 'Uploading...' : 'Upload Document'}
                                    </button>
                                </form>
                            )}
                        </div>
                    )}

                    {activeTab === 'notifications' && (
                        <div>
                            <h2 style={{
                                fontSize: '1.125rem',
                                fontWeight: 600,
                                color: '#0f172a',
                                marginBottom: '1.5rem',
                            }}>
                                Notification Preferences
                            </h2>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {[
                                    { id: 'access_requests', label: 'Access Request Updates', description: 'Get notified when your access requests are reviewed' },
                                    { id: 'new_manuscripts', label: 'New Manuscripts', description: 'Receive updates when new manuscripts matching your interests are added' },
                                    { id: 'research_updates', label: 'Research Updates', description: 'Weekly digest of research news and platform updates' },
                                    { id: 'security_alerts', label: 'Security Alerts', description: 'Important security notifications about your account' },
                                ].map((pref) => (
                                    <div
                                        key={pref.id}
                                        style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            padding: '1rem 1.5rem',
                                            background: '#f8fafc',
                                            borderRadius: '12px',
                                        }}
                                    >
                                        <div>
                                            <div style={{
                                                fontSize: '0.9375rem',
                                                fontWeight: 500,
                                                color: '#0f172a',
                                                marginBottom: '0.25rem',
                                            }}>
                                                {pref.label}
                                            </div>
                                            <div style={{ fontSize: '0.8125rem', color: '#64748b' }}>
                                                {pref.description}
                                            </div>
                                        </div>
                                        <label style={{ position: 'relative', display: 'inline-block', width: '44px', height: '24px' }}>
                                            <input
                                                type="checkbox"
                                                defaultChecked={pref.id === 'security_alerts'}
                                                style={{ opacity: 0, width: 0, height: 0 }}
                                            />
                                            <span style={{
                                                position: 'absolute',
                                                cursor: 'pointer',
                                                inset: 0,
                                                background: '#e5e7eb',
                                                borderRadius: '24px',
                                                transition: 'all 0.2s',
                                            }} />
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
