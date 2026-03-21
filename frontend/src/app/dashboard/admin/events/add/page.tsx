'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchWithAuth, getApiUrl, isAuthenticated } from '@/lib/api';

// ─── Icons ────────────────────────────────────────────────────────────────────

const CalendarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const UploadCloudIcon = () => (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" />
        <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3" />
    </svg>
);

const XIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const CheckCircleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

const ChevronLeftIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m15 18-6-6 6-6" />
    </svg>
);

// ─── Image preview item ───────────────────────────────────────────────────────

interface PreviewFile {
    file: File;
    previewUrl: string;
    id: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AddEventPage() {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [previews, setPreviews] = useState<PreviewFile[]>([]);
    const [isDragging, setIsDragging] = useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!isAuthenticated()) router.push('/login');
    }, [router]);

    // Clean up object URLs on unmount
    useEffect(() => {
        return () => previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    }, []);

    // ── File helpers ───────────────────────────────────────────────────────────

    const addFiles = (files: FileList | File[]) => {
        const fileArray = Array.from(files);
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
        const valid = fileArray.filter((f) => allowed.includes(f.type));

        if (valid.length !== fileArray.length) {
            setErrorMessage('Some files were skipped — only JPEG, PNG, WebP, or AVIF images are allowed.');
        }

        const newPreviews: PreviewFile[] = valid.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
            id: Math.random().toString(36).slice(2),
        }));

        setPreviews((prev) => [...prev, ...newPreviews].slice(0, 10)); // cap at 10
    };

    const removeFile = (id: string) => {
        setPreviews((prev) => {
            const removed = prev.find((p) => p.id === id);
            if (removed) URL.revokeObjectURL(removed.previewUrl);
            return prev.filter((p) => p.id !== id);
        });
    };

    // ── Drag and drop ──────────────────────────────────────────────────────────

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files) addFiles(e.dataTransfer.files);
    };

    // ── Submit ─────────────────────────────────────────────────────────────────

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');
        setErrorMessage('');

        if (!title.trim()) { setErrorMessage('Event title is required.'); return; }
        if (!date) { setErrorMessage('Event date is required.'); return; }

        setIsSubmitting(true);

        try {
            // Build multipart/form-data
            const formData = new FormData();
            formData.append('title', title.trim());
            if (description.trim()) formData.append('description', description.trim());
            formData.append('date', date);
            previews.forEach((p) => formData.append('images', p.file));

            // Use fetchWithAuth but pass formData (browser sets Content-Type automatically)
            const response = await fetchWithAuth(getApiUrl('/events/add'), {
                method: 'POST',
                body: formData,
                // Do NOT set Content-Type manually — browser adds boundary automatically
                headers: {},
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to create event');
            }

            setSuccessMessage('Event created!');
            setTitle('');
            setDescription('');
            setDate('');
            // Revoke old preview URLs
            previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
            setPreviews([]);
        } catch (err: unknown) {
            setErrorMessage(err instanceof Error ? err.message : 'Failed to create event. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── Styles ─────────────────────────────────────────────────────────────────

    const inputStyle: React.CSSProperties = {
        width: '100%',
        padding: '0.625rem 0.875rem',
        fontSize: '0.9375rem',
        color: '#0f172a',
        background: '#f8fafc',
        border: '1px solid #e2e8f0',
        borderRadius: '8px',
        outline: 'none',
        transition: 'border-color 0.15s, box-shadow 0.15s',
        boxSizing: 'border-box',
    };

    const focusHandlers = {
        onFocus: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            e.target.style.borderColor = '#059669';
            e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)';
        },
        onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = 'none';
        },
    };

    // ── Render ─────────────────────────────────────────────────────────────────

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.375rem' }}>Add New Event</h1>
                <p style={{ fontSize: '0.9375rem', color: '#64748b' }}>
                </p>
            </div>

            {/* Success */}
            {successMessage && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '1rem 1.25rem', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '10px', marginBottom: '1.5rem', color: '#166534', fontSize: '0.9375rem' }}>
                    <span style={{ color: '#16a34a', flexShrink: 0 }}><CheckCircleIcon /></span>
                    {successMessage}
                </div>
            )}

            {/* Error */}
            {errorMessage && (
                <div style={{ padding: '1rem 1.25rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', marginBottom: '1.5rem', color: '#991b1b', fontSize: '0.9375rem' }}>
                    {errorMessage}
                </div>
            )}

            {/* Form */}
            <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '2rem', maxWidth: '760px' }}>
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                    {/* Title */}
                    <div>
                        <label htmlFor="event-title" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>
                            Event Title <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input id="event-title" type="text" placeholder="e.g. Sanskrit Manuscript Exhibition 2026" value={title} onChange={(e) => setTitle(e.target.value)} required style={inputStyle} {...focusHandlers} />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="event-description" style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>Description</label>
                        <textarea id="event-description" placeholder="Provide details about the event, speakers, venue, etc." value={description} onChange={(e) => setDescription(e.target.value)} rows={5} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }} onFocus={(e) => { e.target.style.borderColor = '#059669'; e.target.style.boxShadow = '0 0 0 3px rgba(5,150,105,0.12)'; }} onBlur={(e) => { e.target.style.borderColor = '#e2e8f0'; e.target.style.boxShadow = 'none'; }} />
                    </div>

                    {/* Date */}
                    <div>
                        <label htmlFor="event-date" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>
                            <CalendarIcon /> Event Date <span style={{ color: '#dc2626' }}>*</span>
                        </label>
                        <input id="event-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} required style={{ ...inputStyle, maxWidth: '280px', colorScheme: 'light' }} {...focusHandlers} />
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.375rem' }}>
                            Event Images
                            <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: '#94a3b8', marginLeft: '0.5rem' }}>
                                (up to 10 — JPEG, PNG, WebP, AVIF — auto-compressed to WebP)
                            </span>
                        </label>

                        {/* Drop zone */}
                        <div
                            onClick={() => fileInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            style={{
                                border: `2px dashed ${isDragging ? '#059669' : '#cbd5e1'}`,
                                borderRadius: '10px',
                                padding: '2rem',
                                textAlign: 'center',
                                cursor: 'pointer',
                                background: isDragging ? '#f0fdf4' : '#f8fafc',
                                transition: 'all 0.2s',
                                marginBottom: previews.length > 0 ? '1rem' : '0',
                            }}
                        >
                            <div style={{ color: isDragging ? '#059669' : '#94a3b8', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                                <UploadCloudIcon />
                            </div>
                            <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: isDragging ? '#059669' : '#475569', margin: '0 0 0.25rem 0' }}>
                                {isDragging ? 'Drop images here' : 'Click or drag to upload images'}
                            </p>
                            <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>
                                JPEG · PNG · WebP · AVIF · up to 10 MB each
                            </p>
                        </div>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            multiple
                            style={{ display: 'none' }}
                            onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
                        />

                        {/* Previews grid */}
                        {previews.length > 0 && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.75rem' }}>
                                {previews.map((p) => (
                                    <div key={p.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', aspectRatio: '1', background: '#f1f5f9' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={p.previewUrl} alt={p.file.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(p.id)}
                                            style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                        >
                                            <XIcon />
                                        </button>
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, fontSize: '0.6875rem', color: 'white', background: 'linear-gradient(transparent, rgba(0,0,0,0.6))', padding: '0.375rem 0.375rem 0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            {(p.file.size / 1024).toFixed(0)} KB
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '0.5rem', borderTop: '1px solid #f1f5f9' }}>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            id="submit-event-btn"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', fontSize: '0.9375rem', fontWeight: 600, color: 'white', background: isSubmitting ? '#6ee7b7' : '#059669', border: 'none', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}
                        >
                            {isSubmitting ? 'Uploading & saving...' : 'Create Event'}
                        </button>

                        <Link href="/dashboard/admin/events" style={{ display: 'inline-flex', alignItems: 'center', padding: '0.75rem 1.5rem', fontSize: '0.9375rem', fontWeight: 500, color: '#475569', background: 'white', border: '1px solid #e2e8f0', borderRadius: '8px', textDecoration: 'none' }}>
                            View All Events
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
