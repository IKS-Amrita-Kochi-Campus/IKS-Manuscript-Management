'use client';

import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function TermsOfService() {
    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f8fafc' }}>
            <Header />

            <main style={{ flex: 1, paddingTop: '64px' }}>
                <div style={{
                    maxWidth: '800px',
                    margin: '0 auto',
                    padding: '4rem 2rem',
                }}>
                    <h1 style={{
                        fontSize: '2.5rem',
                        fontWeight: 700,
                        color: '#0f172a',
                        marginBottom: '1rem',
                        lineHeight: 1.2
                    }}>
                        Terms of Service
                    </h1>
                    <p style={{
                        color: '#64748b',
                        fontSize: '1rem',
                        marginBottom: '3rem'
                    }}>
                        Last updated: {new Date().toLocaleDateString()}
                    </p>

                    <div style={{
                        background: 'white',
                        padding: '3rem',
                        borderRadius: '12px',
                        border: '1px solid #e5e7eb',
                        boxShadow: '0 1px 3px 0 rgb(0 0 0 / 0.1)'
                    }}>
                        <section style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>1. Acceptance of Terms</h2>
                            <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>
                                By accessing and using the Indian Knowledge Systems (IKS) Platform, you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services.
                            </p>
                        </section>

                        <section style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>2. Description of Service</h2>
                            <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>
                                The IKS Platform is a digital archive and research tool designed to preserve, catalog, and facilitate the study of indigenous manuscripts and knowledge systems. We provide registered users with access to digitized manuscripts, metadata, and collaboration tools.
                            </p>
                        </section>

                        <section style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>3. User Conduct</h2>
                            <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>
                                You agree to use the platform only for lawful purposes and in a way that respects the cultural sensitivity of the material. You specifically agree not to:
                            </p>
                            <ul style={{ color: '#475569', lineHeight: 1.7, paddingLeft: '1.5rem', listStyle: 'disc' }}>
                                <li style={{ marginBottom: '0.5rem' }}>Misappropriate or misuse indigenous knowledge for commercial gain without appropriate permission.</li>
                                <li style={{ marginBottom: '0.5rem' }}>Harass or harm other researchers or community members.</li>
                                <li style={{ marginBottom: '0.5rem' }}>Attempt to gain unauthorized access to restricted sections of the archive.</li>
                                <li>Upload malicious code or interfere with the platform's functionality.</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>4. Intellectual Property Rights</h2>
                            <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>
                                The intellectual property rights of the manuscripts and traditional knowledge displayed on this platform remain with their respective custodial communities, authors, or owners. The IKS Platform claims no ownership over this traditional knowledge.
                            </p>
                            <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>
                                Users may access, download, and use materials for personal research and educational purposes only, subject to specific access restrictions pertinent to certain manuscripts.
                            </p>
                        </section>

                        <section style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>5. Account Security</h2>
                            <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>
                                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. Please notify us immediately of any unauthorized use of your account.
                            </p>
                        </section>

                        <section style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>6. Termination</h2>
                            <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>
                                We reserve the right to suspend or terminate your access to the platform at our sole discretion, without notice, for conduct that we believe violates these Terms of Service or is harmful to other users, us, or third parties, or for any other reason.
                            </p>
                        </section>

                        <section>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>7. Changes to Terms</h2>
                            <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>
                                We may modify these Terms at any time. We will provide notice of any material changes through the platform. Your continued use of the platform after such changes constitutes your acceptance of the new Terms.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
