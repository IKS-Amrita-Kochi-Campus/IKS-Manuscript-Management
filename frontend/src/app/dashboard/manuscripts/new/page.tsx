'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchJsonWithAuth, getApiUrl, isAuthenticated } from '@/lib/api';

// Icons
const ArrowLeftIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m12 19-7-7 7-7" />
        <path d="M19 12H5" />
    </svg>
);

const UploadIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="17 8 12 3 7 8" />
        <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
);

const FileIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
    </svg>
);

const XIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

const CheckIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

const LoadingSpinner = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}>
        <circle cx="12" cy="12" r="10" opacity="0.25" />
        <path d="M12 2a10 10 0 0 1 10 10" />
    </svg>
);

interface FileUploadStatus {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'complete' | 'error';
    error?: string;
}

export default function NewManuscriptPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form Data
    const [formData, setFormData] = useState({
        title: '',
        alternateTitle: '',
        author: '',
        category: '',
        subject: '',
        language: '',
        repository: '',
        abstract: '',
        visibility: 'restricted',
        origin: '',
        centuryEstimate: '',
    });

    // File upload state
    const [files, setFiles] = useState<FileUploadStatus[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadedManuscriptId, setUploadedManuscriptId] = useState<string | null>(null);
    const [metadataSubmitted, setMetadataSubmitted] = useState(false);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
        }
    }, [router]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files).map(file => ({
                file,
                progress: 0,
                status: 'pending' as const,
            }));
            setFiles(prev => [...prev, ...newFiles]);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    // Step 1: Submit metadata and get manuscript ID
    const handleMetadataSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const manuscriptData = {
                ...formData,
                subject: formData.subject.split(',').map(s => s.trim()).filter(s => s),
                languages: formData.language.split(',').map(s => s.trim()).filter(s => s),
            };
            delete (manuscriptData as any).language;

            const response = await fetchJsonWithAuth<{ success: boolean; manuscript: { _id: string }; error?: string }>(
                getApiUrl('/manuscripts'),
                {
                    method: 'POST',
                    body: JSON.stringify(manuscriptData),
                }
            );

            if (!response.success) {
                throw new Error(response.error || 'Failed to create manuscript');
            }

            setUploadedManuscriptId(response.manuscript._id);
            setMetadataSubmitted(true);
            setStep(2);
        } catch (err: any) {
            console.error('Metadata submit error:', err);
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Upload files with progress
    const uploadFiles = async () => {
        if (!uploadedManuscriptId || files.length === 0) return;

        setIsUploading(true);
        setError('');

        // Get access token from correct location
        const accessToken = localStorage.getItem('accessToken');

        for (let i = 0; i < files.length; i++) {
            const fileStatus = files[i];
            if (fileStatus.status === 'complete') continue;

            // Update status to uploading
            setFiles(prev => prev.map((f, idx) =>
                idx === i ? { ...f, status: 'uploading' as const, progress: 0 } : f
            ));

            try {
                const formData = new FormData();
                formData.append('files', fileStatus.file);

                // Use XMLHttpRequest for progress tracking
                await new Promise<void>((resolve, reject) => {
                    const xhr = new XMLHttpRequest();

                    xhr.upload.onprogress = (event) => {
                        if (event.lengthComputable) {
                            const progress = Math.round((event.loaded / event.total) * 100);
                            setFiles(prev => prev.map((f, idx) =>
                                idx === i ? { ...f, progress } : f
                            ));
                        }
                    };

                    xhr.onload = () => {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            const response = JSON.parse(xhr.responseText);
                            if (response.success) {
                                setFiles(prev => prev.map((f, idx) =>
                                    idx === i ? { ...f, status: 'complete' as const, progress: 100 } : f
                                ));
                                resolve();
                            } else {
                                reject(new Error(response.error || 'Upload failed'));
                            }
                        } else {
                            reject(new Error(`Upload failed with status ${xhr.status}`));
                        }
                    };

                    xhr.onerror = () => reject(new Error('Network error'));

                    xhr.open('POST', getApiUrl(`/manuscripts/${uploadedManuscriptId}/files`));
                    xhr.setRequestHeader('Authorization', `Bearer ${accessToken}`);
                    xhr.send(formData);
                });

            } catch (err: any) {
                setFiles(prev => prev.map((f, idx) =>
                    idx === i ? { ...f, status: 'error' as const, error: err.message } : f
                ));
            }
        }

        setIsUploading(false);
    };

    // Check if all files are uploaded
    const allFilesUploaded = files.length > 0 && files.every(f => f.status === 'complete');
    const hasUploadErrors = files.some(f => f.status === 'error');

    // Final submit - navigate to manuscript page
    const handleFinalSubmit = () => {
        if (uploadedManuscriptId) {
            setSuccess('Manuscript submitted successfully! It will be reviewed by our team before being published to the archive.');
            setTimeout(() => {
                router.push(`/dashboard/manuscripts/${uploadedManuscriptId}`);
            }, 2000);
        }
    };

    const getProgressColor = (status: FileUploadStatus['status']) => {
        switch (status) {
            case 'complete': return '#059669';
            case 'error': return '#dc2626';
            case 'uploading': return '#3b82f6';
            default: return '#94a3b8';
        }
    };

    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
            <div style={{ marginBottom: '2rem' }}>
                <Link href="/dashboard/manuscripts" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: '#64748b',
                    fontSize: '0.875rem',
                    textDecoration: 'none',
                    marginBottom: '1rem'
                }}>
                    <ArrowLeftIcon />
                    Back to Manuscripts
                </Link>
                <h1 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                    Upload New Manuscript
                </h1>
                <p style={{ color: '#64748b', marginTop: '0.5rem' }}>
                    Share indigenous knowledge with the community by archiving your manuscripts.
                </p>
            </div>

            {error && (
                <div style={{ padding: '1rem', background: '#fee2e2', border: '1px solid #fecaca', borderRadius: '0.5rem', marginBottom: '1.5rem', color: '#991b1b', fontSize: '0.875rem' }}>
                    {error}
                </div>
            )}

            {success && (
                <div style={{ padding: '1rem', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '0.5rem', marginBottom: '1.5rem', color: '#166534', fontSize: '0.875rem' }}>
                    {success}
                </div>
            )}

            <div style={{ background: 'white', border: '1px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
                {/* Progress Steps */}
                <div style={{ display: 'flex', borderBottom: '1px solid #e5e7eb' }}>
                    <div style={{
                        flex: 1,
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: step === 1 ? '#f0fdf4' : metadataSubmitted ? '#ecfdf5' : '#f8fafc'
                    }}>
                        <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: metadataSubmitted ? '#059669' : step === 1 ? '#059669' : '#e2e8f0',
                            color: 'white',
                            fontSize: '0.75rem',
                            fontWeight: 600
                        }}>
                            {metadataSubmitted ? <CheckIcon /> : '1'}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#0f172a' }}>Manuscript Details</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Basic information</div>
                        </div>
                    </div>
                    <div style={{
                        flex: 1,
                        padding: '1rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        background: step === 2 ? '#f0fdf4' : '#f8fafc',
                        borderLeft: '1px solid #e5e7eb'
                    }}>
                        <div style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: allFilesUploaded ? '#059669' : step === 2 ? '#059669' : '#e2e8f0',
                            color: step === 2 || allFilesUploaded ? 'white' : '#64748b',
                            fontSize: '0.75rem',
                            fontWeight: 600
                        }}>
                            {allFilesUploaded ? <CheckIcon /> : '2'}
                        </div>
                        <div>
                            <div style={{ fontSize: '0.875rem', fontWeight: 600, color: step === 2 ? '#0f172a' : '#64748b' }}>Upload Files</div>
                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Add manuscript files</div>
                        </div>
                    </div>
                </div>

                <div style={{ padding: '2rem' }}>
                    {step === 1 && (
                        <form onSubmit={handleMetadataSubmit}>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Title *</label>
                                    <input
                                        required
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Ramayana - Valmiki"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', outline: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Author / Compiler</label>
                                        <input
                                            type="text"
                                            name="author"
                                            value={formData.author}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Valmiki"
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Category *</label>
                                        <input
                                            required
                                            type="text"
                                            name="category"
                                            value={formData.category}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Epic, Philosophy"
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Languages (comma separated) *</label>
                                        <input
                                            required
                                            type="text"
                                            name="language"
                                            value={formData.language}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Sanskrit, Malayalam"
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Subjects (comma separated) *</label>
                                        <input
                                            required
                                            type="text"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Literature, Mythology"
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Repository / Current Home *</label>
                                    <input
                                        required
                                        type="text"
                                        name="repository"
                                        value={formData.repository}
                                        onChange={handleInputChange}
                                        placeholder="e.g., Amrita University Library"
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', outline: 'none' }}
                                    />
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Abstract / Description *</label>
                                    <textarea
                                        required
                                        name="abstract"
                                        rows={4}
                                        value={formData.abstract}
                                        onChange={handleInputChange}
                                        placeholder="Enter a brief description of the manuscript (min 10 characters)..."
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', outline: 'none', resize: 'none' }}
                                    />
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Period / Century</label>
                                        <input
                                            type="text"
                                            name="centuryEstimate"
                                            value={formData.centuryEstimate}
                                            onChange={handleInputChange}
                                            placeholder="e.g., 15th Century, 1800 CE"
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Origin / Region</label>
                                        <input
                                            type="text"
                                            name="origin"
                                            value={formData.origin}
                                            onChange={handleInputChange}
                                            placeholder="e.g., Kerala, Tamil Nadu"
                                            style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', outline: 'none' }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>Visibility</label>
                                    <select
                                        name="visibility"
                                        value={formData.visibility}
                                        onChange={handleInputChange}
                                        style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', outline: 'none' }}
                                    >
                                        <option value="public">Public (Anyone can view)</option>
                                        <option value="restricted">Restricted (Requires approval)</option>
                                        <option value="private">Private (Only you can see)</option>
                                    </select>
                                </div>

                                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        style={{
                                            padding: '0.75rem 2rem',
                                            background: loading ? '#6ee7b7' : '#059669',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '0.5rem',
                                            fontWeight: 500,
                                            cursor: loading ? 'not-allowed' : 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '0.5rem'
                                        }}
                                    >
                                        {loading && <LoadingSpinner />}
                                        {loading ? 'Saving...' : 'Save & Continue to Upload'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    )}

                    {step === 2 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            <div>
                                <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.5rem' }}>
                                    Upload Manuscript Files
                                </h2>
                                <p style={{ fontSize: '0.875rem', color: '#64748b' }}>
                                    Add PDF files or images of your manuscript. You can upload multiple files.
                                </p>
                            </div>

                            {/* File Drop Zone */}
                            <div style={{
                                border: '2px dashed #e2e8f0',
                                borderRadius: '12px',
                                padding: '2rem',
                                textAlign: 'center',
                                background: '#f8fafc',
                                position: 'relative',
                                cursor: 'pointer'
                            }}>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    multiple
                                    accept=".pdf,.jpg,.jpeg,.png,.tiff"
                                    onChange={handleFileSelect}
                                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                                    disabled={isUploading}
                                />
                                <div style={{ color: '#94a3b8' }}>
                                    <UploadIcon />
                                    <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>Click to select files or drag and drop</div>
                                    <div style={{ fontSize: '0.75rem', marginTop: '0.25rem' }}>PDF, JPG, PNG, TIFF (max 50MB each)</div>
                                </div>
                            </div>

                            {/* File List with Progress */}
                            {files.length > 0 && (
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                                    {files.map((fileStatus, index) => (
                                        <div key={index} style={{
                                            padding: '1rem',
                                            background: '#f8fafc',
                                            borderRadius: '8px',
                                            border: '1px solid #f1f5f9'
                                        }}>
                                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    <FileIcon />
                                                    <div>
                                                        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0f172a' }}>{fileStatus.file.name}</span>
                                                        <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginLeft: '0.5rem' }}>
                                                            {(fileStatus.file.size / 1024 / 1024).toFixed(2)} MB
                                                        </span>
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                    {fileStatus.status === 'complete' && (
                                                        <span style={{ color: '#059669', display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8125rem' }}>
                                                            <CheckIcon /> Uploaded
                                                        </span>
                                                    )}
                                                    {fileStatus.status === 'error' && (
                                                        <span style={{ color: '#dc2626', fontSize: '0.8125rem' }}>
                                                            Failed
                                                        </span>
                                                    )}
                                                    {fileStatus.status !== 'complete' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeFile(index)}
                                                            disabled={isUploading}
                                                            style={{ border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}
                                                        >
                                                            <XIcon />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {/* Progress bar */}
                                            <div style={{
                                                height: '4px',
                                                background: '#e2e8f0',
                                                borderRadius: '999px',
                                                overflow: 'hidden'
                                            }}>
                                                <div style={{
                                                    height: '100%',
                                                    width: `${fileStatus.progress}%`,
                                                    background: getProgressColor(fileStatus.status),
                                                    transition: 'width 0.3s ease'
                                                }} />
                                            </div>
                                            {fileStatus.status === 'uploading' && (
                                                <div style={{ fontSize: '0.75rem', color: '#3b82f6', marginTop: '0.25rem' }}>
                                                    Uploading... {fileStatus.progress}%
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Upload Button */}
                            {files.length > 0 && !allFilesUploaded && (
                                <button
                                    onClick={uploadFiles}
                                    disabled={isUploading || files.filter(f => f.status === 'pending').length === 0}
                                    style={{
                                        padding: '0.75rem 2rem',
                                        background: isUploading ? '#93c5fd' : '#3b82f6',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        fontWeight: 500,
                                        cursor: isUploading ? 'not-allowed' : 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    {isUploading && <LoadingSpinner />}
                                    {isUploading ? 'Uploading...' : 'Upload Files'}
                                </button>
                            )}

                            {/* Final Submit */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #e5e7eb' }}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        if (uploadedManuscriptId && files.length === 0) {
                                            // Skip to finish if no files
                                            handleFinalSubmit();
                                        }
                                    }}
                                    disabled={isUploading}
                                    style={{
                                        padding: '0.75rem 1.5rem',
                                        background: 'white',
                                        color: '#475569',
                                        border: '1px solid #e2e8f0',
                                        borderRadius: '0.5rem',
                                        fontWeight: 500,
                                        cursor: 'pointer'
                                    }}
                                >
                                    {files.length === 0 ? 'Skip & Finish' : 'Back'}
                                </button>
                                <button
                                    onClick={handleFinalSubmit}
                                    disabled={!allFilesUploaded && files.length > 0}
                                    style={{
                                        padding: '0.75rem 2rem',
                                        background: (allFilesUploaded || files.length === 0) ? '#059669' : '#94a3b8',
                                        color: 'white',
                                        border: 'none',
                                        borderRadius: '0.5rem',
                                        fontWeight: 500,
                                        cursor: (allFilesUploaded || files.length === 0) ? 'pointer' : 'not-allowed',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.5rem'
                                    }}
                                >
                                    <CheckIcon />
                                    Complete Upload
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
}
