'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchJsonWithAuth, getApiUrl, isAuthenticated } from '@/lib/api';

// Icons
const ArrowLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
    </svg>
);

const LoadingSpinner = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
);

interface Manuscript {
    _id: string;
    title: string;
    alternateTitle?: string;
    author: string;
    category: string;
    subject?: string;
    languages?: string[];
    visibility: string;
    status: string;
    abstract?: string;
    centuryEstimate?: string;
    origin?: string;
    keywords?: string[];
    ownerId: string;
}

const CATEGORIES = [
    'Philosophy', 'Medicine', 'Astronomy', 'Mathematics', 'Literature',
    'Religion', 'History', 'Epic', 'Poetry', 'Drama', 'Science', 'Other'
];

const LANGUAGES = [
    'Sanskrit', 'Tamil', 'Telugu', 'Kannada', 'Malayalam', 'Pali',
    'Prakrit', 'Hindi', 'Bengali', 'Marathi', 'Gujarati', 'Other'
];

const VISIBILITIES = [
    { value: 'public', label: 'Public - Anyone can view' },
    { value: 'restricted', label: 'Restricted - Request needed' },
    { value: 'private', label: 'Private - Only you can view' },
];

export default function EditManuscriptPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Form state
    const [title, setTitle] = useState('');
    const [alternateTitle, setAlternateTitle] = useState('');
    const [author, setAuthor] = useState('');
    const [category, setCategory] = useState('');
    const [subject, setSubject] = useState('');
    const [language, setLanguage] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [abstract, setAbstract] = useState('');
    const [centuryEstimate, setCenturyEstimate] = useState('');
    const [origin, setOrigin] = useState('');
    const [keywords, setKeywords] = useState('');

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchManuscript();
    }, [id, router]);

    const fetchManuscript = async () => {
        try {
            setLoading(true);
            setError('');

            const response = await fetchJsonWithAuth<{ success: boolean; manuscript: Manuscript; error?: string }>(
                getApiUrl(`/manuscripts/${id}`)
            );

            if (response.success && response.manuscript) {
                const m = response.manuscript;
                setTitle(m.title || '');
                setAlternateTitle(m.alternateTitle || '');
                setAuthor(m.author || '');
                setCategory(m.category || '');
                setSubject(m.subject || '');
                // Handle languages array from backend
                const lang = m.languages && m.languages.length > 0 ? m.languages[0] : '';
                setLanguage(lang);
                setVisibility(m.visibility || 'public');
                setAbstract(m.abstract || '');
                setCenturyEstimate(m.centuryEstimate || '');
                setOrigin(m.origin || '');
                setKeywords(m.keywords?.join(', ') || '');
            } else {
                setError(response.error || 'Failed to load manuscript');
            }
        } catch (err) {
            console.error('Fetch error:', err);
            setError('Failed to load manuscript details');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        try {
            const updateData = {
                title,
                alternateTitle: alternateTitle || undefined,
                author,
                category,
                subject: subject || undefined,
                languages: language ? [language] : [],
                visibility,
                abstract: abstract || undefined,
                centuryEstimate: centuryEstimate || undefined,
                origin: origin || undefined,
                keywords: keywords ? keywords.split(',').map(k => k.trim()).filter(k => k) : [],
            };

            const response = await fetchJsonWithAuth<{ success: boolean; error?: string }>(
                getApiUrl(`/manuscripts/${id}`),
                {
                    method: 'PUT',
                    body: JSON.stringify(updateData),
                }
            );

            if (response.success) {
                setSuccess('Manuscript updated successfully!');
                setTimeout(() => {
                    router.push(`/dashboard/manuscripts/${id}`);
                }, 1500);
            } else {
                setError(response.error || 'Failed to update manuscript');
            }
        } catch (err) {
            console.error('Update error:', err);
            setError('Failed to update manuscript. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh' }}>
                <LoadingSpinner />
                <span style={{ marginLeft: '1rem', color: '#64748b' }}>Loading manuscript...</span>
            </div>
        );
    }

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <Link href={`/dashboard/manuscripts/${id}`} style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: '#64748b',
                textDecoration: 'none',
                fontSize: '0.875rem',
                marginBottom: '1.5rem',
            }}>
                <ArrowLeftIcon /> Back to Manuscript
            </Link>

            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#0f172a', marginBottom: '2rem' }}>
                Edit Manuscript
            </h1>

            {error && (
                <div style={{
                    padding: '1rem',
                    background: '#fee2e2',
                    color: '#991b1b',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{
                    padding: '1rem',
                    background: '#dcfce7',
                    color: '#166534',
                    borderRadius: '0.5rem',
                    marginBottom: '1.5rem',
                }}>
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.25rem' }}>
                        Basic Information
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>
                                Title <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 0.875rem',
                                    fontSize: '0.9375rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    outline: 'none',
                                }}
                                placeholder="Enter manuscript title"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>
                                Alternate Title
                            </label>
                            <input
                                type="text"
                                value={alternateTitle}
                                onChange={(e) => setAlternateTitle(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 0.875rem',
                                    fontSize: '0.9375rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    outline: 'none',
                                }}
                                placeholder="Enter alternate title (optional)"
                            />
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>
                                Author / Compiler <span style={{ color: '#ef4444' }}>*</span>
                            </label>
                            <input
                                type="text"
                                value={author}
                                onChange={(e) => setAuthor(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 0.875rem',
                                    fontSize: '0.9375rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    outline: 'none',
                                }}
                                placeholder="Enter author or compiler name"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>
                                    Category <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 0.875rem',
                                        fontSize: '0.9375rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        outline: 'none',
                                        background: 'white',
                                    }}
                                >
                                    <option value="">Select category</option>
                                    {CATEGORIES.map(cat => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>
                                    Language <span style={{ color: '#ef4444' }}>*</span>
                                </label>
                                <select
                                    value={language}
                                    onChange={(e) => setLanguage(e.target.value)}
                                    required
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 0.875rem',
                                        fontSize: '0.9375rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        outline: 'none',
                                        background: 'white',
                                    }}
                                >
                                    <option value="">Select language</option>
                                    {LANGUAGES.map(lang => (
                                        <option key={lang} value={lang}>{lang}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>
                                Subject
                            </label>
                            <input
                                type="text"
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 0.875rem',
                                    fontSize: '0.9375rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    outline: 'none',
                                }}
                                placeholder="e.g., Ayurveda, Yoga, Jyotisha"
                            />
                        </div>
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.25rem' }}>
                        Additional Details
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>
                                Abstract
                            </label>
                            <textarea
                                value={abstract}
                                onChange={(e) => setAbstract(e.target.value)}
                                rows={4}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 0.875rem',
                                    fontSize: '0.9375rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    outline: 'none',
                                    resize: 'vertical',
                                }}
                                placeholder="Brief description of the manuscript content"
                            />
                        </div>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>
                                    Period / Century
                                </label>
                                <input
                                    type="text"
                                    value={centuryEstimate}
                                    onChange={(e) => setCenturyEstimate(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 0.875rem',
                                        fontSize: '0.9375rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        outline: 'none',
                                    }}
                                    placeholder="e.g., 15th Century, 1800 CE"
                                />
                            </div>

                            <div>
                                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>
                                    Origin / Region
                                </label>
                                <input
                                    type="text"
                                    value={origin}
                                    onChange={(e) => setOrigin(e.target.value)}
                                    style={{
                                        width: '100%',
                                        padding: '0.625rem 0.875rem',
                                        fontSize: '0.9375rem',
                                        border: '1px solid #e5e7eb',
                                        borderRadius: '0.5rem',
                                        outline: 'none',
                                    }}
                                    placeholder="e.g., Kerala, Tamil Nadu"
                                />
                            </div>
                        </div>

                        <div>
                            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#0f172a', marginBottom: '0.5rem' }}>
                                Keywords
                            </label>
                            <input
                                type="text"
                                value={keywords}
                                onChange={(e) => setKeywords(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '0.625rem 0.875rem',
                                    fontSize: '0.9375rem',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '0.5rem',
                                    outline: 'none',
                                }}
                                placeholder="Comma-separated keywords for search"
                            />
                            <p style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                                Separate keywords with commas
                            </p>
                        </div>
                    </div>
                </div>

                <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '1.25rem' }}>
                        Visibility
                    </h2>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                        {VISIBILITIES.map(v => (
                            <label
                                key={v.value}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    padding: '1rem',
                                    background: visibility === v.value ? '#f0fdf4' : '#f8fafc',
                                    border: `1px solid ${visibility === v.value ? '#86efac' : '#e5e7eb'}`,
                                    borderRadius: '0.5rem',
                                    cursor: 'pointer',
                                }}
                            >
                                <input
                                    type="radio"
                                    name="visibility"
                                    value={v.value}
                                    checked={visibility === v.value}
                                    onChange={(e) => setVisibility(e.target.value)}
                                    style={{ accentColor: '#059669' }}
                                />
                                <span style={{ fontWeight: 500, color: '#0f172a' }}>{v.label}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                    <Link
                        href={`/dashboard/manuscripts/${id}`}
                        style={{
                            padding: '0.625rem 1.25rem',
                            fontSize: '0.9375rem',
                            fontWeight: 500,
                            color: '#64748b',
                            background: '#f8fafc',
                            border: '1px solid #e5e7eb',
                            borderRadius: '0.5rem',
                            textDecoration: 'none',
                        }}
                    >
                        Cancel
                    </Link>
                    <button
                        type="submit"
                        disabled={saving}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.625rem 1.5rem',
                            fontSize: '0.9375rem',
                            fontWeight: 500,
                            color: 'white',
                            background: saving ? '#6ee7b7' : '#059669',
                            border: 'none',
                            borderRadius: '0.5rem',
                            cursor: saving ? 'not-allowed' : 'pointer',
                        }}
                    >
                        {saving && <LoadingSpinner />}
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </form>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
