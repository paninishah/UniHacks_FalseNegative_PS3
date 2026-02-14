import React, { useState, useEffect, useCallback } from 'react';
import client from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import './Notifications.css';

const Notifications = () => {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await client.get(ENDPOINTS.NOTIFICATIONS.LIST);
            const data = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setNotifications(data);
        } catch (error) {
            console.error("Error fetching notifications:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
    }, [fetchNotifications]);

    const markAsRead = async (id) => {
        try {
            await client.post(ENDPOINTS.NOTIFICATIONS.MARK_READ(id));
            setNotifications(prev =>
                prev.map(n => n.id === id ? { ...n, is_read: true } : n)
            );
        } catch (error) {
            console.error("Error marking as read:", error);
        }
    };

    const markAllRead = async () => {
        try {
            await client.post(ENDPOINTS.NOTIFICATIONS.MARK_ALL_READ);
            setNotifications(prev =>
                prev.map(n => ({ ...n, is_read: true }))
            );
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'post_newsroom': return '📢';
            case 'post_group': return '📰';
            case 'post_community': return '💬';
            case 'group_created': return '🏠';
            case 'community_created': return '🌐';
            case 'capsule_unlocked': return '💊';
            case 'system': return '🔔';
            default: return '🔔';
        }
    };

    const unreadCount = notifications.filter(n => !n.is_read).length;

    if (loading) {
        return (
            <div className="notifications-container">
                <h1 className="notif-title">NOTIFICATIONS</h1>
                <div style={{ textAlign: 'center', color: '#666', marginTop: '40px' }}>
                    Loading...
                </div>
            </div>
        );
    }

    return (
        <div className="notifications-container">
            <div className="notif-header">
                <h1 className="notif-title">NOTIFICATIONS</h1>
                {unreadCount > 0 && (
                    <span className="notif-badge">{unreadCount}</span>
                )}
            </div>

            {unreadCount > 0 && (
                <button className="mark-all-btn" onClick={markAllRead}>
                    Mark All Read ({unreadCount})
                </button>
            )}

            <div className="notif-list">
                {notifications.length === 0 ? (
                    <div className="notif-empty">
                        <div className="notif-empty-icon">🔕</div>
                        <p>No notifications yet.</p>
                        <small>When someone posts, creates a group, or a capsule pops — you'll see it here.</small>
                    </div>
                ) : (
                    notifications.map(notif => (
                        <div
                            key={notif.id}
                            className={`notif-item ${notif.is_read ? 'read' : 'unread'}`}
                            onClick={() => !notif.is_read && markAsRead(notif.id)}
                        >
                            <div className="notif-icon-col">
                                <div className={`notif-icon ${notif.notification_type}`}>
                                    {getIcon(notif.notification_type)}
                                </div>
                            </div>

                            <div className="notif-content-col">
                                <p className="notif-title-text">{notif.title}</p>
                                <p className="notif-text">{notif.message}</p>
                                <span className="notif-time">{notif.time_ago}</span>
                            </div>

                            {!notif.is_read && <div className="notif-status-dot"></div>}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Notifications;
