'use client';

import React from 'react';
import Link from 'next/link';

// Icon Components
const BookmarkIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 6h18" />
        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
);

const ExternalLinkIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
);

// Sample bookmarks data
const bookmarks = [
    { id: 1, title: 'Ayurvedic Pharmacopoeia of India - Volume 3', author: 'Government of India', language: 'Sanskrit', addedDate: '2024-12-20' },
    { id: 2, title: 'Traditional Healing Practices of Kerala', author: 'Dr. K. Narayanan', language: 'Malayalam', addedDate: '2024-12-18' },
    { id: 3, title: 'Vedic Astronomy and Mathematics', author: 'Aryabhata', language: 'Sanskrit', addedDate: '2024-12-15' },
    { id: 4, title: 'Yoga Sutras of Patanjali', author: 'Patanjali', language: 'Sanskrit', addedDate: '2024-12-10' },
];

// Bookmark Row Component
const BookmarkRow = ({ bookmark }: { bookmark: typeof bookmarks[0] }) => (
    <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem 1.5rem',
        background: 'white',
        borderBottom: '1px solid #f1f5f9',
        transition: 'all 0.15s',
    }}>
        <div style={{
            width: '40px',
            height: '40px',
            background: '#fef3c7',
            borderRadius: '10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#b45309',
            flexShrink: 0,
        }}>
            <BookmarkIcon />
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
            <Link href="#" style={{
                fontSize: '0.9375rem',
                fontWeight: 500,
                color: '#0f172a',
                textDecoration: 'none',
                display: 'block',
                marginBottom: '0.25rem',
            }}>
                {bookmark.title}
            </Link>
            <div style={{
                fontSize: '0.8125rem',
                color: '#64748b',
            }}>
                {bookmark.author} · {bookmark.language}
            </div>
        </div>

        <div style={{
            fontSize: '0.8125rem',
            color: '#94a3b8',
            whiteSpace: 'nowrap',
        }}>
            Added {new Date(bookmark.addedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>

        <div style={{
            display: 'flex',
            gap: '0.5rem',
        }}>
            <button style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.375rem',
                padding: '0.5rem 0.75rem',
                fontSize: '0.8125rem',
                fontWeight: 500,
                color: '#0f172a',
                background: '#f8fafc',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
            }}>
                <ExternalLinkIcon />
                View
            </button>
            <button style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '0.5rem',
                color: '#dc2626',
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'all 0.15s',
            }}>
                <TrashIcon />
            </button>
        </div>
    </div>
);

export default function BookmarksPage() {
    return (
        <div>
            {/* Page Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '2rem',
            }}>
                <div>
                    <h1 style={{
                        fontSize: '1.5rem',
                        fontWeight: 600,
                        color: '#0f172a',
                        margin: 0,
                    }}>
                        Bookmarks
                    </h1>
                    <p style={{
                        fontSize: '0.9375rem',
                        color: '#64748b',
                        marginTop: '0.25rem',
                    }}>
                        Your saved manuscripts for quick access
                    </p>
                </div>
                <span style={{
                    padding: '0.375rem 0.75rem',
                    background: '#f1f5f9',
                    color: '#475569',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    borderRadius: '999px',
                }}>
                    {bookmarks.length} items
                </span>
            </div>

            {/* Bookmarks List */}
            <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                overflow: 'hidden',
            }}>
                {bookmarks.length > 0 ? (
                    bookmarks.map((bookmark) => (
                        <BookmarkRow key={bookmark.id} bookmark={bookmark} />
                    ))
                ) : (
                    <div style={{
                        padding: '4rem 2rem',
                        textAlign: 'center',
                    }}>
                        <div style={{
                            width: '64px',
                            height: '64px',
                            background: '#f8fafc',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 1rem',
                            color: '#94a3b8',
                        }}>
                            <BookmarkIcon />
                        </div>
                        <h3 style={{
                            fontSize: '1rem',
                            fontWeight: 600,
                            color: '#0f172a',
                            marginBottom: '0.5rem',
                        }}>
                            No bookmarks yet
                        </h3>
                        <p style={{
                            fontSize: '0.875rem',
                            color: '#64748b',
                            marginBottom: '1.5rem',
                        }}>
                            Start exploring manuscripts and save your favorites here
                        </p>
                        <Link href="/dashboard/manuscripts" style={{
                            display: 'inline-flex',
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: 'white',
                            textDecoration: 'none',
                            background: '#059669',
                            borderRadius: '0.5rem',
                        }}>
                            Browse Manuscripts
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
