'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

export const Footer: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer style={{
            background: '#f8fafc',
            borderTop: '1px solid #e5e7eb',
            padding: '3rem 0',
        }}>
            <div style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '0 2rem',
            }}>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(4, 1fr)',
                    gap: '2rem',
                }}>
                    <div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.75rem',
                            marginBottom: '1rem',
                        }}>
                            <div style={{
                                position: 'relative',
                                width: '36px',
                                height: '36px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                <Image
                                    src="/assets/iks.webp"
                                    alt="IKS Logo"
                                    width={36}
                                    height={36}
                                    style={{ objectFit: 'contain' }}
                                />
                            </div>
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
                                IKS Platform
                            </span>
                        </div>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#64748b',
                            lineHeight: 1.6,
                            margin: '0 0 1.5rem 0',
                        }}>
                            Preserving and advancing indigenous knowledge through digital research and collaboration.
                        </p>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <Image
                                src="/assets/govt.webp"
                                alt="Government of India"
                                height={80}
                                width={80}
                                style={{ objectFit: 'contain', opacity: 0.9 }}
                            />
                            <div style={{ width: '1px', height: '40px', background: '#cbd5e1' }} />
                            <Image
                                src="/assets/amrita.webp"
                                alt="Amrita Vishwa Vidyapeetham"
                                height={80}
                                width={200}
                                style={{ objectFit: 'contain', opacity: 0.9 }}
                            />
                        </div>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                            Platform
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {['Manuscripts', 'Research Tools', 'Collaboration', 'API Access'].map((item) => (
                                <li key={item} style={{ marginBottom: '0.5rem' }}>
                                    <Link href="#" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                            Resources
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            {['Documentation', 'Research Guides', 'Community', 'Support'].map((item) => (
                                <li key={item} style={{ marginBottom: '0.5rem' }}>
                                    <Link href="#" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                            Legal
                        </h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                            <li style={{ marginBottom: '0.5rem' }}>
                                <Link href="/privacy" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>
                                    Privacy Policy
                                </Link>
                            </li>
                            <li style={{ marginBottom: '0.5rem' }}>
                                <Link href="/terms" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>
                                    Terms of Service
                                </Link>
                            </li>
                            <li style={{ marginBottom: '0.5rem' }}>
                                <Link href="#" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>
                                    Data Protection
                                </Link>
                            </li>
                            <li style={{ marginBottom: '0.5rem' }}>
                                <Link href="#" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>
                                    Accessibility
                                </Link>
                            </li>
                        </ul>
                    </div>
                </div>

                <div style={{
                    marginTop: '2rem',
                    paddingTop: '2rem',
                    borderTop: '1px solid #e5e7eb',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                        © {currentYear} Indian Knowledge Systems. All rights reserved.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <Link href="#" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>
                            GitHub
                        </Link>
                        <Link href="#" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>
                            Twitter
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
