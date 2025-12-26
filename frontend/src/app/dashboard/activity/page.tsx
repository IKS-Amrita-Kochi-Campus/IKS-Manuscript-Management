'use client';

import React from 'react';

// Icon Components
const BookIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
);

const BookmarkIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
    </svg>
);

const SendIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="22" y1="2" x2="11" y2="13" />
        <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
);

const DownloadIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
);

const CheckIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

// Sample activity data
const activities = [
    { id: 1, type: 'view', title: 'Viewed manuscript', description: 'Ayurvedic Pharmacopoeia of India - Vol 3', time: '2 hours ago', icon: <BookIcon /> },
    { id: 2, type: 'bookmark', title: 'Added bookmark', description: 'Traditional Healing Practices of Kerala', time: '5 hours ago', icon: <BookmarkIcon /> },
    { id: 3, type: 'request', title: 'Submitted request', description: 'Access request for restricted manuscripts', time: '1 day ago', icon: <SendIcon /> },
    { id: 4, type: 'download', title: 'Downloaded', description: 'Yoga Sutras PDF export', time: '2 days ago', icon: <DownloadIcon /> },
    { id: 5, type: 'view', title: 'Viewed manuscript', description: 'Sanskrit Medical Texts Collection', time: '2 days ago', icon: <BookIcon /> },
    { id: 6, type: 'approved', title: 'Request approved', description: 'Access granted to Ayurvedic Texts', time: '3 days ago', icon: <CheckIcon /> },
    { id: 7, type: 'bookmark', title: 'Added bookmark', description: 'Vedic Astronomy and Mathematics', time: '3 days ago', icon: <BookmarkIcon /> },
    { id: 8, type: 'view', title: 'Viewed manuscript', description: 'Arthashastra - Ancient Political Philosophy', time: '4 days ago', icon: <BookIcon /> },
];

// Activity Item Component
const ActivityItem = ({ activity }: { activity: typeof activities[0] }) => {
    const typeColors = {
        view: { bg: '#dbeafe', color: '#1d4ed8' },
        bookmark: { bg: '#fef3c7', color: '#b45309' },
        request: { bg: '#e0e7ff', color: '#4338ca' },
        download: { bg: '#d1fae5', color: '#059669' },
        approved: { bg: '#dcfce7', color: '#166534' },
    };

    const config = typeColors[activity.type as keyof typeof typeColors] || typeColors.view;

    return (
        <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '1rem',
            padding: '1.25rem 0',
            borderBottom: '1px solid #f1f5f9',
        }}>
            <div style={{
                width: '40px',
                height: '40px',
                background: config.bg,
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: config.color,
                flexShrink: 0,
            }}>
                {activity.icon}
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                    fontSize: '0.9375rem',
                    fontWeight: 500,
                    color: '#0f172a',
                    marginBottom: '0.25rem',
                }}>
                    {activity.title}
                </div>
                <div style={{
                    fontSize: '0.8125rem',
                    color: '#64748b',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                }}>
                    {activity.description}
                </div>
            </div>

            <div style={{
                fontSize: '0.8125rem',
                color: '#94a3b8',
                whiteSpace: 'nowrap',
            }}>
                {activity.time}
            </div>
        </div>
    );
};

export default function ActivityPage() {
    return (
        <div>
            {/* Page Header */}
            <div style={{
                marginBottom: '2rem',
            }}>
                <h1 style={{
                    fontSize: '1.5rem',
                    fontWeight: 600,
                    color: '#0f172a',
                    margin: 0,
                }}>
                    Activity
                </h1>
                <p style={{
                    fontSize: '0.9375rem',
                    color: '#64748b',
                    marginTop: '0.25rem',
                }}>
                    Your recent actions and research activity
                </p>
            </div>

            {/* Filter Tabs */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                marginBottom: '1.5rem',
            }}>
                {['All', 'Views', 'Bookmarks', 'Requests', 'Downloads'].map((filter, index) => (
                    <button
                        key={filter}
                        style={{
                            padding: '0.5rem 1rem',
                            fontSize: '0.875rem',
                            fontWeight: 500,
                            color: index === 0 ? 'white' : '#475569',
                            background: index === 0 ? '#059669' : 'white',
                            border: index === 0 ? 'none' : '1px solid #e5e7eb',
                            borderRadius: '999px',
                            cursor: 'pointer',
                            transition: 'all 0.15s',
                        }}
                    >
                        {filter}
                    </button>
                ))}
            </div>

            {/* Activity List */}
            <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '0 1.5rem',
            }}>
                {activities.map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                ))}
            </div>

            {/* Load More */}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                marginTop: '1.5rem',
            }}>
                <button style={{
                    padding: '0.75rem 2rem',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: '#475569',
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                }}>
                    Load More
                </button>
            </div>
        </div>
    );
}
