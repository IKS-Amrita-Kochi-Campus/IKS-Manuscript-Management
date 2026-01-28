'use client';

import React from 'react';
import Header from '../../components/layout/Header';
import Footer from '../../components/layout/Footer';

export default function PrivacyPolicy() {
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
                        Privacy Policy
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
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>1. Introduction</h2>
                            <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>
                                The Indian Knowledge Systems (IKS) Platform is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you visit our website and use our research services.
                            </p>
                        </section>

                        <section style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>2. Information We Collect</h2>
                            <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>
                                We collect information that you provide directly to us:
                            </p>
                            <ul style={{ color: '#475569', lineHeight: 1.7, paddingLeft: '1.5rem', listStyle: 'disc' }}>
                                <li style={{ marginBottom: '0.5rem' }}><strong>Account Information:</strong> Name, email address, password, and institutional affiliation provided during registration.</li>
                                <li style={{ marginBottom: '0.5rem' }}><strong>Research Data:</strong> Search queries, manuscript viewing history, and any notes or annotations you create.</li>
                                <li><strong>Communications:</strong> Any feedback or support requests you send to us.</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>3. How We Use Your Information</h2>
                            <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>
                                We use the information we collect to:
                            </p>
                            <ul style={{ color: '#475569', lineHeight: 1.7, paddingLeft: '1.5rem', listStyle: 'disc' }}>
                                <li style={{ marginBottom: '0.5rem' }}>Provide, maintain, and improve our services.</li>
                                <li style={{ marginBottom: '0.5rem' }}>Verify your identity and authorization to access specific restricted materials.</li>
                                <li style={{ marginBottom: '0.5rem' }}>Analyze usage patterns to improve the user experience and research capabilities.</li>
                                <li>Respond to your comments and provide customer support.</li>
                            </ul>
                        </section>

                        <section style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>4. Data Protection</h2>
                            <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>
                                We implement appropriate technical and organizational measures to protect specific user data and the integrity of the digital archive. We use secure protocols for data transmission and restricted access controls for sensitive manuscript data.
                            </p>
                        </section>

                        <section style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>5. Sharing of Information</h2>
                            <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>
                                We do not sell your personal information. We may share your information with our institutional partners (Government of India, Amrita Vishwa Vidyapeetham) solely for the purpose of research collaboration and platform administration, or if required by law.
                            </p>
                        </section>

                        <section style={{ marginBottom: '2.5rem' }}>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>6. Your Rights</h2>
                            <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>
                                You have the right to access, correct, or delete your personal account information. You may update your profile settings within the dashboard or contact us for assistance with data removal.
                            </p>
                        </section>

                        <section>
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '1rem' }}>7. Contact Us</h2>
                            <p style={{ color: '#475569', lineHeight: 1.7, marginBottom: '1rem' }}>
                                If you have any questions about this Privacy Policy, please contact us at support@iksplatform.org.
                            </p>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
