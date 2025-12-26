'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
        <line x1="10" y1="9" x2="8" y2="9" />
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
        <path d="M12 1v6M12 17v6M4.22 4.22l4.24 4.24M15.54 15.54l4.24 4.24M1 12h6M17 12h6M4.22 19.78l4.24-4.24M15.54 8.46l4.24-4.24" />
    </svg>
);

const LogoutIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
);

interface NavItem {
    href: string;
    label: string;
    icon: React.ReactNode;
}

const mainNavItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
    { href: '/dashboard/manuscripts', label: 'Manuscripts', icon: <ManuscriptsIcon /> },
    { href: '/dashboard/bookmarks', label: 'Bookmarks', icon: <BookmarkIcon /> },
    { href: '/dashboard/requests', label: 'Requests', icon: <RequestsIcon /> },
    { href: '/dashboard/activity', label: 'Activity', icon: <ActivityIcon /> },
];

const bottomNavItems: NavItem[] = [
    { href: '/dashboard/settings', label: 'Settings', icon: <SettingsIcon /> },
];

export const Sidebar: React.FC = () => {
    const pathname = usePathname();

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
                {item.label}
            </Link>
        );
    };

    return (
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
            padding: '1.5rem 1rem',
            overflowY: 'auto',
        }}>
            {/* Main Navigation */}
            <nav style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
                flex: 1,
            }}>
                {mainNavItems.map((item) => (
                    <NavLink key={item.href} item={item} />
                ))}
            </nav>

            {/* Bottom Navigation */}
            <div style={{
                borderTop: '1px solid #e5e7eb',
                paddingTop: '1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.25rem',
            }}>
                {bottomNavItems.map((item) => (
                    <NavLink key={item.href} item={item} />
                ))}
                <button
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        padding: '0.625rem 0.875rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#dc2626',
                        textDecoration: 'none',
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
    );
};

export default Sidebar;
