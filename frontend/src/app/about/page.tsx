'use client';

import React from 'react';
import Image from 'next/image';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function AboutPage() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#ffffff' }}>
            <Header />

            <main style={{ flex: 1 }}>
                {/* Hero Section */}
                <div style={{
                    background: 'linear-gradient(to bottom, #f0fdf4, #ffffff)',
                    padding: '4rem 1rem',
                    textAlign: 'center'
                }}>
                    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                        <h1 style={{
                            fontSize: '2.5rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            marginBottom: '1.5rem',
                            letterSpacing: '-0.02em'
                        }}>
                            Preserving Our Intellectual Heritage
                        </h1>
                        <p style={{
                            fontSize: '1.125rem',
                            color: '#475569',
                            lineHeight: 1.7,
                            marginBottom: '0'
                        }}>
                            The IKS Manuscript Management System is a state-of-the-art digital archive dedicated to the preservation, exploration, and research of Indian Knowledge Systems.
                        </p>
                    </div>
                </div>

                {/* Main Content */}
                <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem 5rem' }}>

                    {/* Mission Section */}
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '4rem',
                        alignItems: 'center',
                        marginBottom: '5rem'
                    }}>
                        <div>
                            <div style={{
                                width: '100%',
                                height: '300px',
                                position: 'relative',
                                borderRadius: '1rem',
                                overflow: 'hidden',
                                boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
                            }}>
                                <Image
                                    src="/assets/manuscript-sample.webp"
                                    alt="Ancient Manuscripts"
                                    fill
                                    style={{ objectFit: 'cover' }}
                                />
                                {/* Fallback if image doesn't exist, though typically we should use generic assets or allow failover */}
                            </div>
                        </div>
                        <div>
                            <h2 style={{
                                fontSize: '1.875rem',
                                fontWeight: 600,
                                color: '#0f172a',
                                marginBottom: '1rem'
                            }}>
                                Our Mission
                            </h2>
                            <p style={{
                                fontSize: '1rem',
                                color: '#475569',
                                lineHeight: 1.7,
                                marginBottom: '1.5rem'
                            }}>
                                We aim to bridge the gap between ancient wisdom and modern research. By digitizing thousands of manuscripts from various domains—Ayurveda, Astronomy, Mathematics, Philosophy, and more—we ensure that this knowledge is accessible to scholars and researchers worldwide.
                            </p>
                            <ul style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.75rem',
                                padding: 0,
                                margin: 0,
                                listStyle: 'none'
                            }}>
                                {[
                                    'Digitize and catalogue fragile manuscripts',
                                    'Provide advanced search and research tools',
                                    'Facilitate collaboration between researchers',
                                    'Ensure secure, controlled access to materials'
                                ].map((item, i) => (
                                    <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: '#334155' }}>
                                        <div style={{
                                            width: '20px',
                                            height: '20px',
                                            borderRadius: '50%',
                                            background: '#dcfce7',
                                            color: '#16a34a',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontSize: '0.75rem'
                                        }}>✓</div>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Organization Section */}
                    <div style={{
                        background: '#f8fafc',
                        borderRadius: '1.5rem',
                        padding: '3rem',
                        marginBottom: '5rem'
                    }}>
                        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
                            <h2 style={{ fontSize: '1.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                                Supported By
                            </h2>
                            <p style={{ color: '#64748b' }}>
                                This initiative is a collaborative effort involving leading institutions.
                            </p>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                            gap: '2rem',
                            alignItems: 'center',
                            textAlign: 'center'
                        }}>
                            <div style={{
                                background: 'white',
                                padding: '2rem',
                                borderRadius: '1rem',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <div style={{ position: 'relative', width: '100px', height: '100px' }}>
                                    <Image
                                        src="/assets/govt.webp"
                                        alt="Government of India"
                                        fill
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>Government of India</h3>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Ministry of Culture</p>
                                </div>
                            </div>

                            <div style={{
                                background: 'white',
                                padding: '2rem',
                                borderRadius: '1rem',
                                border: '1px solid #e2e8f0',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '1rem'
                            }}>
                                <div style={{ position: 'relative', width: '200px', height: '100px' }}>
                                    <Image
                                        src="/assets/amrita.webp"
                                        alt="Amrita Vishwa Vidyapeetham"
                                        fill
                                        style={{ objectFit: 'contain' }}
                                    />
                                </div>
                                <div>
                                    <h3 style={{ fontWeight: 600, color: '#0f172a', marginBottom: '0.25rem' }}>Amrita Vishwa Vidyapeetham</h3>
                                    <p style={{ fontSize: '0.875rem', color: '#64748b' }}>Center for Research in Analytics, Technologies & Education (CREATE)</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact/CTA */}
                    <div style={{ textAlign: 'center' }}>
                        <h2 style={{ fontSize: '1.875rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>
                            Join Our Community
                        </h2>
                        <p style={{ fontSize: '1.125rem', color: '#475569', marginBottom: '2rem', maxWidth: '600px', margin: '0 auto 2rem' }}>
                            Researchers, students, and historians are invited to explore our archive. Contribute to the preservation of our shared heritage.
                        </p>
                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                            <a href="/register" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.75rem 1.5rem',
                                background: '#059669',
                                color: 'white',
                                fontWeight: 500,
                                borderRadius: '0.5rem',
                                textDecoration: 'none',
                                transition: 'background 0.2s'
                            }}>
                                Create Account
                            </a>
                            <a href="/manuscripts" style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.75rem 1.5rem',
                                background: 'white',
                                color: '#0f172a',
                                fontWeight: 500,
                                borderRadius: '0.5rem',
                                border: '1px solid #e2e8f0',
                                textDecoration: 'none',
                                transition: 'background 0.2s'
                            }}>
                                Browse Archive
                            </a>
                        </div>
                    </div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
