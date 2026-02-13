import React from 'react';
import './Notifications.css';

const Notifications = () => {
    // Dummy notifications
    const notifications = [
        {
            id: 1,
            type: 'like',
            user: { name: 'Sarah Jenkins', pfp: '' },
            content: "liked your post about 'Finals Week'.",
            time: '5m ago',
            read: false
        },
        {
            id: 2,
            type: 'comment',
            user: { name: 'Mike Ross', pfp: '' },
            content: "commented: 'Totally relate to this!'",
            time: '1h ago',
            read: false
        },
        {
            id: 3,
            type: 'system',
            content: "Welcome to Converse! Complete your profile to get started.",
            time: '1d ago',
            read: true
        },
        {
            id: 4,
            type: 'like',
            user: { name: 'Alex Chen', pfp: '' },
            content: "liked your photo.",
            time: '2d ago',
            read: true
        },
        {
            id: 5,
            type: 'follow',
            user: { name: 'Jessica Lee', pfp: '' },
            content: "started following you.",
            time: '3d ago',
            read: true
        }
    ];

    return (
        <div className="notifications-container">
            <h1 className="notif-title">NOTIFICATIONS</h1>

            <div className="notif-list">
                {notifications.map(notif => (
                    <div key={notif.id} className={`notif-item ${notif.read ? 'read' : 'unread'}`}>
                        {/* Icon/Avatar */}
                        <div className="notif-icon-col">
                            {notif.type === 'system' ? (
                                <div className="notif-icon system">🔔</div>
                            ) : (
                                <div className="notif-pfp"></div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="notif-content-col">
                            <p className="notif-text">
                                {notif.user && <span className="notif-user">{notif.user.name} </span>}
                                {notif.content}
                            </p>
                            <span className="notif-time">{notif.time}</span>
                        </div>

                        {/* Status Dot */}
                        {!notif.read && <div className="notif-status-dot"></div>}
                    </div>
                ))}
            </div>

            <button className="mark-all-btn">Mark All Read</button>
        </div>
    );
};

export default Notifications;
