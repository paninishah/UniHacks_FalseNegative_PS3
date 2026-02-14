import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import NotificationToast from '../features/notifications/NotificationToast';
import './MainLayout.css';

const MainLayout = () => {
    return (
        <div className="main-layout">
            <Sidebar />
            <div className="main-content">
                <Outlet />
            </div>
            <NotificationToast />
        </div>
    );
};

export default MainLayout;
