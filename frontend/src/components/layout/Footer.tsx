'use client';

import React from 'react';
import Link from 'next/link';

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
                                width: '32px',
                                height: '32px',
                                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                                borderRadius: '6px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'white',
                                fontSize: '12px',
                                fontWeight: 700,
                            }}>
                                IKS
                            </div>
                            <span style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a' }}>
                                IKS Platform
                            </span>
                        </div>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#64748b',
                            lineHeight: 1.6,
                            margin: 0,
                        }}>
                            Preserving and advancing indigenous knowledge through digital research and collaboration.
                        </p>
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
                            {['Privacy Policy', 'Terms of Service', 'Data Protection', 'Accessibility'].map((item) => (
                                <li key={item} style={{ marginBottom: '0.5rem' }}>
                                    <Link href="#" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>
                                        {item}
                                    </Link>
                                </li>
                            ))}
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
                        © {currentYear} Indigenous Knowledge Systems. All rights reserved.
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
