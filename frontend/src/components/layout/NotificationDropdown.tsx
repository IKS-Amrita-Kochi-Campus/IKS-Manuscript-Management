import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { fetchJsonWithAuth, getApiUrl } from '@/lib/api';

interface Notification {
    _id: string;
    title: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    link?: string;
    isRead: boolean;
    createdAt: string;
}

const BellIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
);

const CheckIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
    </svg>
);

export const NotificationDropdown = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const response = await fetchJsonWithAuth<{ success: boolean; notifications: Notification[]; unreadCount: number }>(
                getApiUrl('/notifications')
            );
            if (response.success) {
                setNotifications(response.notifications);
                setUnreadCount(response.unreadCount);
            }
        } catch (error) {
            console.error('Failed to fetch notifications:', error);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async (id: string) => {
        try {
            // Optimistic update
            setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));

            await fetchJsonWithAuth(getApiUrl(`/notifications/${id}/read`), { method: 'POST' });
        } catch (error) {
            console.error('Failed to mark notification as read:', error);
            fetchNotifications(); // Revert on error
        }
    };

    const markAllAsRead = async () => {
        try {
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);

            await fetchJsonWithAuth(getApiUrl('/notifications/read-all'), { method: 'POST' });
        } catch (error) {
            console.error('Failed to mark all as read:', error);
            fetchNotifications();
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'success': return '#059669';
            case 'warning': return '#d97706';
            case 'error': return '#dc2626';
            default: return '#3b82f6';
        }
    };

    return (
        <div style={{ position: 'relative' }} ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isOpen ? '#f1f5f9' : 'transparent',
                    border: 'none',
                    borderRadius: '0.5rem',
                    cursor: 'pointer',
                    color: '#64748b',
                    position: 'relative',
                    transition: 'all 0.15s',
                }}
            >
                <BellIcon />
                {unreadCount > 0 && (
                    <span style={{
                        position: 'absolute',
                        top: '6px',
                        right: '6px',
                        minWidth: '16px',
                        height: '16px',
                        padding: '0 4px',
                        background: '#dc2626',
                        color: 'white',
                        fontSize: '0.625rem',
                        fontWeight: 700,
                        borderRadius: '999px',
                        border: '2px solid white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}>
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: 0,
                    marginTop: '0.5rem',
                    width: '360px',
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '0.75rem',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                    zIndex: 50,
                    overflow: 'hidden',
                }}>
                    <div style={{
                        padding: '1rem',
                        borderBottom: '1px solid #e5e7eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                    }}>
                        <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, color: '#0f172a', margin: 0 }}>
                            Notifications
                        </h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={markAllAsRead}
                                style={{
                                    fontSize: '0.75rem',
                                    color: '#059669',
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    fontWeight: 500,
                                }}
                            >
                                Mark all as read
                            </button>
                        )}
                    </div>

                    <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                        {notifications.length === 0 ? (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#64748b', fontSize: '0.875rem' }}>
                                No notifications
                            </div>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {notifications.map((notification) => (
                                    <div
                                        key={notification._id}
                                        style={{
                                            padding: '1rem',
                                            paddingRight: '2.5rem', // Space for read indicator
                                            borderBottom: '1px solid #f1f5f9',
                                            background: notification.isRead ? 'white' : '#f8fafc',
                                            position: 'relative',
                                            transition: 'background 0.15s',
                                        }}
                                    >
                                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '0.25rem' }}>
                                            <div style={{
                                                width: '8px',
                                                height: '8px',
                                                borderRadius: '50%',
                                                background: getTypeColor(notification.type),
                                                marginTop: '6px',
                                                flexShrink: 0,
                                            }} />
                                            <div>
                                                <div style={{
                                                    fontSize: '0.875rem',
                                                    fontWeight: 600,
                                                    color: '#0f172a',
                                                    marginBottom: '0.25rem',
                                                }}>
                                                    {notification.title}
                                                </div>
                                                <div style={{
                                                    fontSize: '0.8125rem',
                                                    color: '#64748b',
                                                    lineHeight: 1.5,
                                                    marginBottom: '0.5rem',
                                                }}>
                                                    {notification.message}
                                                </div>
                                                {notification.link && (
                                                    <Link
                                                        href={notification.link}
                                                        onClick={() => setIsOpen(false)}
                                                        style={{
                                                            fontSize: '0.75rem',
                                                            color: '#059669',
                                                            textDecoration: 'none',
                                                            fontWeight: 500,
                                                            display: 'inline-block',
                                                            marginBottom: '0.5rem',
                                                        }}
                                                    >
                                                        View details →
                                                    </Link>
                                                )}
                                                <div style={{ fontSize: '0.6875rem', color: '#94a3b8' }}>
                                                    {formatDate(notification.createdAt)}
                                                </div>
                                            </div>
                                        </div>

                                        {!notification.isRead && (
                                            <button
                                                onClick={() => markAsRead(notification._id)}
                                                title="Mark as read"
                                                style={{
                                                    position: 'absolute',
                                                    top: '1rem',
                                                    right: '1rem',
                                                    width: '24px',
                                                    height: '24px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    border: 'none',
                                                    background: 'transparent',
                                                    color: '#94a3b8',
                                                    cursor: 'pointer',
                                                    opacity: 0.6,
                                                }}
                                            >
                                                <CheckIcon />
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
