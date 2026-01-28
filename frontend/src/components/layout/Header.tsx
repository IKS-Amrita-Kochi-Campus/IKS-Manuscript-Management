'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import Image from 'next/image';

const Logo = () => (
    <div style={{
        position: 'relative',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    }}>
        <Image
            src="/assets/iks.webp"
            alt="IKS Logo"
            width={40}
            height={40}
            style={{ objectFit: 'contain' }}
        />
    </div>
);

export const Header: React.FC = () => {
    const pathname = usePathname();
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);

    const navItems = [
        { href: '/manuscripts', label: 'Manuscripts' },
        { href: '/about', label: 'About' },
        { href: '/researchers', label: 'Researchers' },
    ];

    const MenuIcon = () => (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            {isMenuOpen ? (
                <path d="M18 6L6 18M6 6l12 12" />
            ) : (
                <path d="M3 12h18M3 6h18M3 18h18" />
            )}
        </svg>
    );

    return (
        <header style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            height: '64px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderBottom: '1px solid #e5e7eb',
            zIndex: 100,
        }}>
            <div className="container header-container">
                <Link href="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textDecoration: 'none',
                }} onClick={() => setIsMenuOpen(false)}>
                    <Logo />
                    <span style={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: '#0f172a',
                    }}>
                        Indian Knowledge Systems
                    </span>
                </Link>

                {/* Desktop Nav */}
                <nav className="nav-desktop">
                    {navItems.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            style={{
                                fontSize: '0.875rem',
                                fontWeight: 500,
                                color: pathname === item.href ? '#059669' : '#475569',
                                textDecoration: 'none',
                                transition: 'color 0.15s',
                            }}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>

                {/* Desktop Actions */}
                <div className="nav-actions">
                    <Link href="/login" style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#475569',
                        textDecoration: 'none',
                    }}>
                        Sign In
                    </Link>
                    <Link href="/register" style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'white',
                        textDecoration: 'none',
                        background: '#059669',
                        borderRadius: '0.5rem',
                    }}>
                        Get Started
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="mobile-menu-btn"
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    aria-label="Toggle menu"
                >
                    <MenuIcon />
                </button>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="mobile-menu">
                    <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => setIsMenuOpen(false)}
                                style={{
                                    fontSize: '1rem',
                                    fontWeight: 500,
                                    color: pathname === item.href ? '#059669' : '#475569',
                                    textDecoration: 'none',
                                    padding: '0.5rem 0'
                                }}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </nav>
                    <div style={{ height: '1px', background: '#e5e7eb', margin: '0.5rem 0' }} />
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <Link href="/login" onClick={() => setIsMenuOpen(false)} style={{
                            textAlign: 'center',
                            padding: '0.75rem',
                            fontWeight: 500,
                            color: '#475569',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem'
                        }}>
                            Sign In
                        </Link>
                        <Link href="/register" onClick={() => setIsMenuOpen(false)} style={{
                            textAlign: 'center',
                            padding: '0.75rem',
                            fontWeight: 500,
                            color: 'white',
                            background: '#059669',
                            borderRadius: '0.5rem'
                        }}>
                            Get Started
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;
