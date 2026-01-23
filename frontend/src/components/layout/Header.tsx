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

    const navItems = [
        { href: '/manuscripts', label: 'Manuscripts' },
        { href: '/about', label: 'About' },
        { href: '/researchers', label: 'Researchers' },
    ];

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
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 2rem',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
            }}>
                <Link href="/" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    textDecoration: 'none',
                }}>
                    <Logo />
                    <span style={{
                        fontSize: '1.125rem',
                        fontWeight: 600,
                        color: '#0f172a',
                    }}>
                        Indigenous Knowledge Systems
                    </span>
                </Link>

                <nav style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '2rem',
                }}>
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

                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                }}>
                    <Link href="/login" style={{
                        padding: '0.5rem 1rem',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: '#475569',
                        textDecoration: 'none',
                        borderRadius: '0.5rem',
                        transition: 'all 0.15s',
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
                        transition: 'all 0.15s',
                    }}>
                        Get Started
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
