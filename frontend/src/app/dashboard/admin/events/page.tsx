'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchJsonWithAuth, getApiUrl, isAuthenticated } from '@/lib/api';

// ─── Icons ────────────────────────────────────────────────────────────────────

const PlusIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19" />
        <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
);

const CalendarIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
);

const TrashIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="3 6 5 6 21 6" />
        <path d="M19 6l-1 14H6L5 6" />
        <path d="M10 11v6" />
        <path d="M14 11v6" />
        <path d="M9 6V4h6v2" />
    </svg>
);

const EditIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
);

const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
    </svg>
);

const ImageIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
    </svg>
);

const SearchIcon = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
);

const XIcon = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
);

// ─── Types ────────────────────────────────────────────────────────────────────

interface IEvent {
    _id: string;
    title: string;
    description?: string;
    date: string;
    images: string[];
    createdAt: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AdminEventsPage() {
    const router = useRouter();
    const [events, setEvents] = useState<IEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [errorMessage, setErrorMessage] = useState('');

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    // View Modal
    const [viewEvent, setViewEvent] = useState<IEvent | null>(null);

    useEffect(() => {
        if (!isAuthenticated()) {
            router.push('/login');
            return;
        }
        fetchEvents();
    }, [router]);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await fetchJsonWithAuth<{ success: boolean; events: IEvent[] }>(
                getApiUrl('/events')
            );
            if (res.success) setEvents(res.events);
        } catch (err) {
            console.error('Failed to load events:', err);
            setErrorMessage('Failed to load events.');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string, title: string) => {
        if (!window.confirm(`Delete event "${title}"? This cannot be undone.`)) return;
        setDeletingId(id);
        try {
            await fetchJsonWithAuth(getApiUrl(`/events/${id}`), { method: 'DELETE' });
            setEvents((prev) => prev.filter((e) => e._id !== id));
        } catch (err) {
            console.error('Delete failed:', err);
            setErrorMessage('Failed to delete event. Please try again.');
        } finally {
            setDeletingId(null);
        }
    };

    const formatDate = (dateStr: string) =>
        new Date(dateStr).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });

    // ─── Filter Logic ─────────────────────────────────────────────────────────

    const filteredEvents = events.filter((e) => {
        // Search
        if (searchQuery && !e.title.toLowerCase().includes(searchQuery.toLowerCase())) {
            return false;
        }

        // Date filters
        if (startDate || endDate) {
            const eventDate = new Date(e.date);
            eventDate.setHours(0, 0, 0, 0);

            if (startDate) {
                const sDate = new Date(startDate);
                sDate.setHours(0, 0, 0, 0);
                if (eventDate < sDate) return false;
            }
            if (endDate) {
                const eDate = new Date(endDate);
                eDate.setHours(0, 0, 0, 0);
                if (eventDate > eDate) return false;
            }
        }

        return true;
    });

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
                gap: '1rem',
            }}>
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: '#0f172a', marginBottom: '0.25rem' }}>
                        Events
                    </h1>
                    <p style={{ color: '#64748b', fontSize: '0.9375rem', margin: 0 }}>
                        Manage public events displayed on the IKS website.
                    </p>
                </div>

                <Link
                    href="/dashboard/admin/events/add"
                    style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        padding: '0.625rem 1.25rem',
                        fontSize: '0.9375rem',
                        fontWeight: 600,
                        color: 'white',
                        background: '#059669',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        transition: 'background 0.15s',
                    }}
                >
                    <PlusIcon />
                    Add Event
                </Link>
            </div>

            {/* Error Banner */}
            {errorMessage && (
                <div style={{ padding: '1rem 1.25rem', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', marginBottom: '1.5rem', color: '#991b1b', fontSize: '0.9375rem' }}>
                    {errorMessage}
                </div>
            )}

            {/* Search & Filters */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                marginBottom: '1.5rem',
                flexWrap: 'wrap',
            }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: '1 1 300px' }}>
                    <div style={{ position: 'absolute', top: '50%', left: '0.875rem', transform: 'translateY(-50%)', color: '#94a3b8', display: 'flex' }}>
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Search events by title..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '0.625rem 1rem 0.625rem 2.5rem',
                            fontSize: '0.9375rem',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            background: 'white',
                            outline: 'none',
                            boxSizing: 'border-box',
                        }}
                    />
                </div>

                {/* Date Filters */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            title="Start Date"
                            style={{
                                padding: '0.625rem 1rem',
                                fontSize: '0.875rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                background: 'white',
                                outline: 'none',
                                color: startDate ? '#0f172a' : '#94a3b8',
                                colorScheme: 'light',
                            }}
                        />
                    </div>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>to</span>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            title="End Date"
                            style={{
                                padding: '0.625rem 1rem',
                                fontSize: '0.875rem',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                background: 'white',
                                outline: 'none',
                                color: endDate ? '#0f172a' : '#94a3b8',
                                colorScheme: 'light',
                            }}
                        />
                    </div>

                    {/* Clear Button */}
                    {(startDate || endDate) && (
                        <button
                            onClick={() => { setStartDate(''); setEndDate(''); }}
                            title="Clear dates"
                            style={{
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                padding: '0.5rem', background: '#f1f5f9', color: '#64748b', border: 'none',
                                borderRadius: '8px', cursor: 'pointer', transition: 'background 0.15s'
                            }}
                        >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                        </button>
                    )}
                </div>
            </div>

            {/* Content List */}
            {loading ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {[1, 2, 3].map((i) => (
                        <div key={i} style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '1.5rem', height: '90px', animation: 'pulse 1.5s ease-in-out infinite' }} />
                    ))}
                </div>
            ) : filteredEvents.length === 0 ? (
                <div style={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px', padding: '4rem 2rem', textAlign: 'center' }}>
                    <div style={{ marginBottom: '1rem', color: '#94a3b8' }}><CalendarIcon /></div>
                    <p style={{ fontSize: '1rem', fontWeight: 500, color: '#475569', marginBottom: '0.5rem' }}>No events found</p>
                    <p style={{ fontSize: '0.875rem', color: '#94a3b8' }}>Try adjusting your search or filter criteria.</p>
                </div>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {filteredEvents.map((event) => (
                        <div
                            key={event._id}
                            style={{
                                background: 'white',
                                border: '1px solid #e2e8f0',
                                borderRadius: '12px',
                                padding: '1.25rem 1.5rem',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'space-between',
                                gap: '1rem',
                            }}
                        >
                            {/* Left Side Info */}
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#0f172a', marginBottom: '0.375rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                    {event.title}
                                </h2>

                                {event.description && (
                                    <p style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                        {event.description}
                                    </p>
                                )}

                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#059669', fontWeight: 500 }}>
                                        <CalendarIcon /> {formatDate(event.date)}
                                    </span>

                                    {event.images.length > 0 && (
                                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.8125rem', color: '#64748b' }}>
                                            <ImageIcon /> {event.images.length} image{event.images.length > 1 ? 's' : ''}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Right Side Actions */}
                            <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                                <button
                                    onClick={() => setViewEvent(event)}
                                    title="View Event Details"
                                    style={{ padding: '0.5rem', background: '#f8fafc', color: '#475569', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <EyeIcon />
                                </button>
                                
                                <Link
                                    href={`/dashboard/admin/events/edit/${event._id}`}
                                    title="Edit Event"
                                    style={{ padding: '0.5rem', background: '#f8fafc', color: '#2563eb', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                >
                                    <EditIcon />
                                </Link>

                                <button
                                    onClick={() => handleDelete(event._id, event.title)}
                                    disabled={deletingId === event._id}
                                    title="Delete Event"
                                    style={{ padding: '0.5rem', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', cursor: deletingId === event._id ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: deletingId === event._id ? 0.5 : 1 }}
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* View Modal */}
            {viewEvent && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    zIndex: 100, padding: '1rem',
                }}>
                    <div style={{
                        background: 'white', borderRadius: '16px', width: '100%', maxWidth: '600px',
                        maxHeight: '90vh', display: 'flex', flexDirection: 'column',
                        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1f5f9' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>Event Details</h2>
                            <button onClick={() => setViewEvent(null)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', display: 'flex' }}>
                                <XIcon />
                            </button>
                        </div>

                        <div style={{ padding: '1.5rem', overflowY: 'auto' }}>
                            <h3 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#0f172a', margin: '0 0 0.5rem 0' }}>{viewEvent.title}</h3>
                            
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#059669', fontSize: '0.9375rem', fontWeight: 500, marginBottom: '1.25rem' }}>
                                <CalendarIcon />
                                {formatDate(viewEvent.date)}
                            </div>

                            {viewEvent.description && (
                                <div style={{ marginBottom: '1.5rem' }}>
                                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.375rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Description</h4>
                                    <p style={{ fontSize: '0.9375rem', color: '#334155', lineHeight: 1.6, margin: 0, whiteSpace: 'pre-wrap' }}>
                                        {viewEvent.description}
                                    </p>
                                </div>
                            )}

                            {viewEvent.images && viewEvent.images.length > 0 && (
                                <div>
                                    <h4 style={{ fontSize: '0.875rem', fontWeight: 600, color: '#475569', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Images ({viewEvent.images.length})</h4>
                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '0.75rem' }}>
                                        {viewEvent.images.map((imgUrl, i) => (
                                            <a key={i} href={getApiUrl(imgUrl)} target="_blank" rel="noopener noreferrer" style={{ display: 'block', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0', aspectRatio: '1', background: '#f1f5f9' }}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img src={getApiUrl(imgUrl)} alt={`Event Image ${i+1}`} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} loading="lazy" />
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div style={{ padding: '1.25rem 1.5rem', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                            <Link
                                href={`/dashboard/admin/events/edit/${viewEvent._id}`}
                                style={{ padding: '0.625rem 1.25rem', background: '#f8fafc', color: '#2563eb', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 500, textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.375rem' }}
                            >
                                <EditIcon /> Edit Event
                            </Link>
                            <button
                                onClick={() => setViewEvent(null)}
                                style={{ padding: '0.625rem 1.25rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '8px', fontSize: '0.9375rem', fontWeight: 500, cursor: 'pointer' }}
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
