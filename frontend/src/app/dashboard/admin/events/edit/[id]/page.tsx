'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { fetchJsonWithAuth, fetchWithAuth, getApiUrl, isAuthenticated } from '@/lib/api';

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

// ─── Image preview items ──────────────────────────────────────────────────────

interface NewFilePreview {
    file: File;
    previewUrl: string;
    id: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function EditEventPage() {
    const router = useRouter();
    const params = useParams();
    const eventId = params.id as string;

    const fileInputRef = useRef<HTMLInputElement>(null);

    const [loadingData, setLoadingData] = useState(true);
    
    // Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    
    // Images existing on the server
    const [existingImages, setExistingImages] = useState<string[]>([]);
    
    // New files to upload
    const [newPreviews, setNewPreviews] = useState<NewFilePreview[]>([]);
    
    const [isDragging, setIsDragging] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }
        if (eventId) {
            fetchEventData();
        }
    }, [router, eventId]);

    const fetchEventData = async () => {
        try {
            const res = await fetchJsonWithAuth<{ success: boolean; event: any }>(
                getApiUrl(`/events/${eventId}`)
            );
            
            if (res.success && res.event) {
                setTitle(res.event.title);
                setDescription(res.event.description || '');
                // Format date for <input type="date">
                setDate(new Date(res.event.date).toISOString().split('T')[0]);
                setExistingImages(res.event.images || []);
            } else {
                setErrorMessage('Failed to load event data.');
            }
        } catch (err: any) {
            setErrorMessage('Error fetching event: ' + err.message);
        } finally {
            setLoadingData(false);
        }
    };

    // Clean up object URLs on unmount
    useEffect(() => {
        return () => newPreviews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    }, []);

    // ── File helpers ───────────────────────────────────────────────────────────

    const addFiles = (files: FileList | File[]) => {
        const fileArray = Array.from(files);
        const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];
        const valid = fileArray.filter((f) => allowed.includes(f.type));

        if (valid.length !== fileArray.length) {
            setErrorMessage('Some files were skipped — only JPEG, PNG, WebP, or AVIF images are allowed.');
        }

        const added: NewFilePreview[] = valid.map((file) => ({
            file,
            previewUrl: URL.createObjectURL(file),
            id: Math.random().toString(36).slice(2),
        }));

        setNewPreviews((prev) => {
            const total = existingImages.length + prev.length + added.length;
            if (total > 10) {
                alert(`You can only upload up to 10 images total. Keeping the first ${10 - existingImages.length}.`);
            }
            // limit total max to 10
            return [...prev, ...added].slice(0, 10 - existingImages.length);
        });
    };

    const removeExistingImage = (url: string) => {
        setExistingImages((prev) => prev.filter(img => img !== url));
    };

    const removeNewFile = (id: string) => {
        setNewPreviews((prev) => {
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
            
            // Append existing images that are kept (multer ignores fields it doesn't process, but controller reads req.body.existingImages)
            existingImages.forEach(img => formData.append('existingImages', img));

            // Append new files
            newPreviews.forEach((p) => formData.append('images', p.file));

            const response = await fetchWithAuth(getApiUrl(`/events/${eventId}`), {
                method: 'PUT',
                body: formData,
                headers: {}, // Do NOT set Content-Type
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Failed to update event');
            }

            const data = await response.json();
            setSuccessMessage('Event updated successfully!');
            // Previews will become existing images now, reset state cleanly
            setExistingImages(data.event.images);
            
            // Cleanup previews
            newPreviews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
            setNewPreviews([]);
        } catch (err: unknown) {
            setErrorMessage(err instanceof Error ? err.message : 'Failed to update event.');
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

    if (loadingData) {
        return (
            <div style={{ padding: '2rem 1rem' }}>
                <p style={{ color: '#64748b' }}>Loading event details...</p>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/dashboard/admin/events" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#64748b', textDecoration: 'none', marginBottom: '1rem' }}>
                    <ChevronLeftIcon /> Back to All Events
                </Link>
                <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.375rem' }}>Edit Event</h1>
                <p style={{ fontSize: '0.9375rem', color: '#64748b' }}>
                    Update details or images for this event.
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
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#374151', marginBottom: '0.75rem' }}>
                            Event Images
                            <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: '#94a3b8', marginLeft: '0.5rem' }}>
                                (up to 10 total)
                            </span>
                        </label>

                        {/* Existing + New Grids Combined */}
                        {(existingImages.length > 0 || newPreviews.length > 0) && (
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem', marginBottom: '1.25rem' }}>
                                
                                {/* Server Images */}
                                {existingImages.map((imgUrl) => (
                                    <div key={imgUrl} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '2px solid #e2e8f0', aspectRatio: '1', background: '#f8fafc' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={getApiUrl(imgUrl)} alt="Event Image" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                                        <button type="button" onClick={() => removeExistingImage(imgUrl)} title="Remove instantly on save" style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                            <XIcon />
                                        </button>
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, fontSize: '0.625rem', color: '#1e293b', background: 'rgba(241, 245, 249, 0.9)', padding: '0.25rem 0.375rem', fontWeight: 600, textAlign: 'center' }}>
                                            UPLOADED
                                        </div>
                                    </div>
                                ))}

                                {/* New Files To Upload */}
                                {newPreviews.map((p) => (
                                    <div key={p.id} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', border: '2px dashed #3b82f6', aspectRatio: '1', background: '#eff6ff' }}>
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img src={p.previewUrl} alt={p.file.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', opacity: 0.8 }} />
                                        <button type="button" onClick={() => removeNewFile(p.id)} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                                            <XIcon />
                                        </button>
                                        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, fontSize: '0.6875rem', color: 'white', background: '#3b82f6', padding: '0.25rem 0.375rem', fontWeight: 600, textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                            NEW ({(p.file.size / 1024).toFixed(0)}KB)
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Drop zone (hidden if max capacity) */}
                        {(existingImages.length + newPreviews.length) < 10 && (
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
                                }}
                            >
                                <div style={{ color: isDragging ? '#059669' : '#94a3b8', marginBottom: '0.5rem', display: 'flex', justifyContent: 'center' }}>
                                    <UploadCloudIcon />
                                </div>
                                <p style={{ fontSize: '0.9375rem', fontWeight: 500, color: isDragging ? '#059669' : '#475569', margin: '0 0 0.25rem 0' }}>
                                    {isDragging ? 'Drop images here' : 'Drop additional images here'}
                                </p>
                                <p style={{ fontSize: '0.8125rem', color: '#94a3b8', margin: 0 }}>
                                    Add up to {10 - (existingImages.length + newPreviews.length)} more • WebP, PNG, JPEG
                                </p>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp,image/avif"
                            multiple
                            style={{ display: 'none' }}
                            onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ''; }}
                        />
                    </div>

                    {/* Actions */}
                    <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid #f1f5f9' }}>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.75rem', fontSize: '0.9375rem', fontWeight: 600, color: 'white', background: isSubmitting ? '#6ee7b7' : '#059669', border: 'none', borderRadius: '8px', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'background 0.15s' }}
                        >
                            {isSubmitting ? 'Saving changes...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
