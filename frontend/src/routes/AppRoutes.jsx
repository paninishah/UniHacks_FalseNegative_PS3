import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from '../features/landing/Landing';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import MainLayout from '../layouts/MainLayout';
import Feed from '../features/feed/Feed';
import Groups from '../features/groups/Groups';
import GroupDetails from '../features/groups/GroupDetails';
import Communities from '../features/communities/Communities';
import Vault from '../features/vault/Vault';
import Analytics from '../features/analytics/Analytics';
import Notifications from '../features/notifications/Notifications';
import Profile from '../features/profile/Profile';
import ProtectedRoute from './ProtectedRoute';

const AppRoutes = () => {
    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Protected Routes (Main Layout) */}
            <Route element={<ProtectedRoute />}>
                <Route element={<MainLayout />}>
                    <Route path="/feed" element={<Feed />} />
                    <Route path="/groups" element={<Groups />} />
                    <Route path="/groups/:groupId" element={<GroupDetails />} />
                    <Route path="/communities" element={<Communities />} />
                    <Route path="/vault" element={<Vault />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/profile" element={<Profile />} />
                    <Route path="/profile/:userId" element={<Profile />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRoutes;
