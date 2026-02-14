import React, { useState, useEffect, useRef } from 'react';
import client from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import './NotificationToast.css';

const NotificationToast = () => {
    const [toasts, setToasts] = useState([]);
    const lastCheckRef = useRef(null);
    const seenIdsRef = useRef(new Set());

    useEffect(() => {
        // Initial fetch to populate seen IDs (don't show toasts for old notifications)
        const initSeen = async () => {
            try {
                const res = await client.get(ENDPOINTS.NOTIFICATIONS.LIST);
                res.data.forEach(n => seenIdsRef.current.add(n.id));
                lastCheckRef.current = new Date();
            } catch (e) {
                // Not logged in or error — skip
            }
        };
        initSeen();

        // Poll every 10 seconds for new notifications
        const interval = setInterval(async () => {
            try {
                const res = await client.get(ENDPOINTS.NOTIFICATIONS.LIST);
                const newNotifs = res.data.filter(n => !seenIdsRef.current.has(n.id));

                if (newNotifs.length > 0) {
                    newNotifs.forEach(n => seenIdsRef.current.add(n.id));
                    // Add new toasts
                    setToasts(prev => [...prev, ...newNotifs.map(n => ({
                        ...n,
                        _toastId: Date.now() + Math.random(),
                    }))]);
                }
            } catch (e) {
                // Silent fail
            }
        }, 10000);

        return () => clearInterval(interval);
    }, []);

    // Auto-dismiss toasts after 5 seconds
    useEffect(() => {
        if (toasts.length === 0) return;
        const timer = setTimeout(() => {
            setToasts(prev => prev.slice(1));
        }, 5000);
        return () => clearTimeout(timer);
    }, [toasts]);

    const dismissToast = (toastId) => {
        setToasts(prev => prev.filter(t => t._toastId !== toastId));
    };

    const getIcon = (type) => {
        switch (type) {
            case 'post_newsroom': return '📢';
            case 'post_group': return '📰';
            case 'post_community': return '💬';
            case 'group_created': return '🏠';
            case 'community_created': return '🌐';
            case 'capsule_unlocked': return '💊';
            default: return '🔔';
        }
    };

    if (toasts.length === 0) return null;

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <div
                    key={toast._toastId}
                    className="toast-notification"
                    onClick={() => dismissToast(toast._toastId)}
                >
                    <div className="toast-icon">{getIcon(toast.notification_type)}</div>
                    <div className="toast-body">
                        <div className="toast-title">{toast.title}</div>
                        <div className="toast-message">{toast.message}</div>
                    </div>
                    <button className="toast-close" onClick={(e) => { e.stopPropagation(); dismissToast(toast._toastId); }}>✕</button>
                </div>
            ))}
        </div>
    );
};

export default NotificationToast;
