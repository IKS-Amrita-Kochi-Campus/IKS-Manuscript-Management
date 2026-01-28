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
            <div className="container">
                <div className="footer-grid">
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

                    <div>
                        <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                            Contact
                        </h4>
                        <div style={{ fontSize: '0.875rem', color: '#64748b', lineHeight: '1.6' }}>
                            <p style={{ margin: '0 0 1rem 0' }}>
                                Amrita Vishwa Vidhyapeetham,<br />
                                Kochi campus, Brahmasthanam,<br />
                                Edapally North P.O, Kochi,<br />
                                Kerala, 682024
                            </p>
                            <p style={{ margin: '0 0 0.5rem 0' }}>
                                <a href="mailto:ikskochi@kh.amrita.edu" style={{ color: '#059669', textDecoration: 'none' }}>
                                    ikskochi@kh.amrita.edu
                                </a>
                            </p>
                            <p style={{ margin: 0 }}>
                                <a href="tel:0484-7102899" style={{ color: '#64748b', textDecoration: 'none' }}>
                                    0484-7102899
                                </a>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p style={{ fontSize: '0.875rem', color: '#64748b', margin: 0 }}>
                        © {currentYear} Indian Knowledge Systems. All rights reserved.
                    </p>
                    <div style={{ display: 'flex', gap: '1.5rem' }}>
                        <Link href="https://ikskochi.amrita.edu" target="_blank" style={{ fontSize: '0.875rem', color: '#64748b', textDecoration: 'none' }}>
                            www.ikskochi.amrita.edu
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
