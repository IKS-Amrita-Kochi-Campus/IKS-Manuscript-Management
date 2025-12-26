'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { fetchJsonWithAuth, getApiUrl, isAuthenticated, logout } from '@/lib/api';
import { UserRole } from '@/types';

// Icon Components
const DashboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" />
        <rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" />
    </svg>
);

const ManuscriptsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);

const BookmarkIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);

const RequestsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
);

const ReviewIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
);

const UsersIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
);

const AnalyticsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="20" x2="18" y2="10" />
        <line x1="12" y1="20" x2="12" y2="4" />
        <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
);

const ArchiveIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="21 8 21 21 3 21 3 8" />
        <rect x="1" y="3" width="22" height="5" />
        <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
);

const ActivityIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
);

const SettingsIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
);

const LogoutIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

const BellIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const BrowseIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const ShieldIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
);

const ClipboardIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
        <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    </svg>
);

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
    roles?: UserRole[]; // If undefined, visible to all roles
    badge?: string;
}

interface NavSection {
    title?: string;
    items: NavItem[];
}

// Role-based navigation configuration
const getNavSections = (role: UserRole): NavSection[] => {
    const sections: NavSection[] = [];

    // Common section - visible to all roles
    const commonItems: NavItem[] = [
        { href: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    ];

    // ADMIN - Full administrative access
    if (role === 'ADMIN') {
        sections.push({
            title: 'Main',
            items: [
                ...commonItems,
                { href: '/dashboard/browse', label: 'Browse Archive', icon: <BrowseIcon /> },
            ],
        });
        sections.push({
            title: 'Administration',
            items: [
                { href: '/dashboard/admin/users', label: 'User Management', icon: <UsersIcon /> },
                { href: '/dashboard/admin/manuscripts', label: 'All Manuscripts', icon: <ArchiveIcon /> },
                { href: '/dashboard/admin/requests', label: 'Access Requests', icon: <RequestsIcon /> },
                { href: '/dashboard/admin/reviews', label: 'Review Queue', icon: <ReviewIcon />, badge: 'Active' },
            ],
        });
        sections.push({
            title: 'Insights',
            items: [
                { href: '/dashboard/admin/analytics', label: 'Analytics', icon: <AnalyticsIcon /> },
                { href: '/dashboard/admin/audit', label: 'Audit Logs', icon: <ShieldIcon /> },
            ],
        });
        return sections;
    }

    // REVIEWER - Manuscript & request reviewer
    if (role === 'REVIEWER') {
        sections.push({
            title: 'Main',
            items: [
                ...commonItems,
                { href: '/dashboard/browse', label: 'Browse Archive', icon: <BrowseIcon /> },
                { href: '/dashboard/bookmarks', label: 'Bookmarks', icon: <BookmarkIcon /> },
            ],
        });
        sections.push({
            title: 'Review Tasks',
            items: [
                { href: '/dashboard/review/manuscripts', label: 'Review Manuscripts', icon: <ReviewIcon />, badge: 'Pending' },
                { href: '/dashboard/review/requests', label: 'Review Requests', icon: <ClipboardIcon /> },
                { href: '/dashboard/review/history', label: 'Review History', icon: <ActivityIcon /> },
            ],
        });
        return sections;
    }

    // VISITOR (Includes USER, OWNER, VISITOR)
    // "Normal user that check all the files", view metadata, upload manuscripts
    const isVisitor = ['VISITOR', 'USER', 'OWNER'].includes(role);
    if (isVisitor) {
        const visitorItems = [
            ...commonItems,
            { href: '/dashboard/browse', label: 'Browse Archive', icon: <BrowseIcon /> },
            { href: '/dashboard/manuscripts', label: 'My Manuscripts', icon: <ManuscriptsIcon /> },
            { href: '/dashboard/bookmarks', label: 'Bookmarks', icon: <BookmarkIcon /> },
            { href: '/dashboard/requests', label: 'My Requests', icon: <RequestsIcon /> },
            { href: '/dashboard/activity', label: 'Activity', icon: <ActivityIcon /> },
        ];

        // If they are specifically an OWNER role in the backend, they might need to manage incoming requests
        // But conceptually they are still under the "VISITOR" umbrella per user request
        if (role === 'OWNER') {
            visitorItems.push({ href: '/dashboard/manage-requests', label: 'Incoming Requests', icon: <ClipboardIcon />, badge: 'Manage' });
        }

        sections.push({
            title: 'Main',
            items: visitorItems,
        });
        return sections;
    }

    return sections;
};

// Role labels and colors
// Simplified to 3 main persona groups as requested: Admin, Reviewer, Visitor
const roleConfig: Record<UserRole, { label: string; color: string; bg: string }> = {
    // Admin
    ADMIN: { label: 'Administrator', color: '#dc2626', bg: '#fee2e2' },

    // Reviewer
    REVIEWER: { label: 'Reviewer', color: '#ea580c', bg: '#ffedd5' },

    // Visitor Group (Consolidated)
    VISITOR: { label: 'Visitor', color: '#0284c7', bg: '#e0f2fe' },
    USER: { label: 'Visitor', color: '#0284c7', bg: '#e0f2fe' },
    OWNER: { label: 'Visitor', color: '#0284c7', bg: '#e0f2fe' },
};

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const [user, setUser] = useState<{ firstName: string; lastName: string; role: UserRole; email: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }

        // Fetch user data
        const fetchUser = async () => {
            try {
                const response = await fetchJsonWithAuth<{ success: boolean; user: { first_name: string; last_name: string; role: UserRole; email: string } }>(
                    getApiUrl('/users/me')
                );
                if (response.success) {
                    setUser({
                        firstName: response.user.first_name,
                        lastName: response.user.last_name,
                        role: response.user.role || 'USER',
                        email: response.user.email,
                    });
                }
            } catch (error) {
                console.error('Failed to fetch user:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [router]);

    const handleLogout = async () => {
        await logout();
    };

    const navSections = user ? getNavSections(user.role) : [];

    const NavLink = ({ item }: { item: NavItem }) => {
        const isActive = pathname === item.href ||
            (item.href !== '/dashboard' && pathname.startsWith(item.href));

        return (
            <Link
                href={item.href}
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.625rem 0.875rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: isActive ? '#059669' : '#475569',
                    textDecoration: 'none',
                    borderRadius: '0.5rem',
                    background: isActive ? '#ecfdf5' : 'transparent',
                    transition: 'all 0.15s',
                }}
            >
                <span style={{ color: isActive ? '#059669' : '#64748b', display: 'flex' }}>
                    {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                    <span style={{
                        padding: '0.125rem 0.5rem',
                        fontSize: '0.6875rem',
                        fontWeight: 600,
                        background: '#fef3c7',
                        color: '#b45309',
                        borderRadius: '999px',
                    }}>
                        {item.badge}
                    </span>
                )}
            </Link>
        );
    };

    const userInitials = user
        ? `${user.firstName?.charAt(0) || ''}${user.lastName?.charAt(0) || ''}`.toUpperCase() || 'U'
        : 'U';

    const roleInfo = user ? roleConfig[user.role] : roleConfig.USER;

    return (
        <div style={{ minHeight: '100vh', background: '#f8fafc' }}>
            {/* Header */}
            <header style={{
                position: 'fixed',
                top: 0,
                left: 0,
                right: 0,
                height: '64px',
                background: 'white',
                borderBottom: '1px solid #e5e7eb',
                zIndex: 100,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0 1.5rem',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                }}>
                    <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                            borderRadius: '8px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontSize: '14px',
                            fontWeight: 700,
                        }}>
                            IKS
                        </div>
                        <span style={{
                            fontSize: '1.125rem',
                            fontWeight: 600,
                            color: '#0f172a',
                        }}>
                            Research Platform
                        </span>
                    </Link>
                </div>

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                }}>
                    <button style={{
                        width: '40px',
                        height: '40px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        border: 'none',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                        color: '#64748b',
                        position: 'relative',
                    }}>
                        <BellIcon />
                        <span style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            width: '8px',
                            height: '8px',
                            background: '#dc2626',
                            borderRadius: '50%',
                            border: '2px solid white',
                        }} />
                    </button>
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.5rem',
                        borderRadius: '0.5rem',
                        cursor: 'pointer',
                    }}>
                        <div style={{
                            width: '36px',
                            height: '36px',
                            background: roleInfo.bg,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                            color: roleInfo.color,
                        }}>
                            {userInitials}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>
                                {user ? `${user.firstName} ${user.lastName}` : 'Loading...'}
                            </span>
                            <span style={{
                                fontSize: '0.6875rem',
                                fontWeight: 500,
                                color: roleInfo.color,
                            }}>
                                {roleInfo.label}
                            </span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Sidebar */}
            <aside style={{
                position: 'fixed',
                left: 0,
                top: '64px',
                bottom: 0,
                width: '260px',
                background: 'white',
                borderRight: '1px solid #e5e7eb',
                display: 'flex',
                flexDirection: 'column',
                padding: '1rem',
                overflowY: 'auto',
            }}>
                {/* Role Badge removed as requested */}

                {/* Navigation Sections */}
                <nav style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1.5rem',
                    flex: 1,
                }}>
                    {isLoading ? (
                        <div style={{ padding: '1rem', color: '#64748b', fontSize: '0.875rem' }}>
                            Loading...
                        </div>
                    ) : (
                        navSections.map((section, index) => (
                            <div key={index}>
                                {section.title && (
                                    <div style={{
                                        fontSize: '0.6875rem',
                                        fontWeight: 600,
                                        color: '#94a3b8',
                                        textTransform: 'uppercase',
                                        letterSpacing: '0.05em',
                                        padding: '0 0.875rem',
                                        marginBottom: '0.5rem',
                                    }}>
                                        {section.title}
                                    </div>
                                )}
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    {section.items.map((item) => (
                                        <NavLink key={item.href} item={item} />
                                    ))}
                                </div>
                            </div>
                        ))
                    )}
                </nav>

                {/* Bottom Navigation */}
                <div style={{
                    borderTop: '1px solid #e5e7eb',
                    paddingTop: '1rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.25rem',
                }}>
                    <NavLink item={{ href: '/dashboard/settings', label: 'Settings', icon: <SettingsIcon /> }} />
                    <button
                        onClick={handleLogout}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            padding: '0.625rem 0.875rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: '#dc2626',
                            borderRadius: '0.5rem',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            width: '100%',
                            textAlign: 'left',
                            transition: 'all 0.15s',
                        }}
                    >
                        <LogoutIcon />
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main style={{
                marginLeft: '260px',
                paddingTop: '64px',
                minHeight: '100vh',
            }}>
                <div style={{
                    maxWidth: '1200px',
                    margin: '0 auto',
                    padding: '2rem',
                }}>
                    {children}
                </div>
            </main>
        </div>
    );
}
