import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from '../features/landing/Landing';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import MainLayout from '../layouts/MainLayout';
import Feed from '../features/feed/Feed';
import Groups from '../features/groups/Groups';
import GroupDetails from '../features/groups/GroupDetails';
import InterventionPage from '../features/groups/Interventions/InterventionPage';
import Communities from '../features/communities/Communities';
import Vault from '../features/vault/Vault';
import Analytics from '../features/analytics/Analytics';
import Notifications from '../features/notifications/Notifications';
import Profile from '../features/profile/Profile';
import ProtectedRoute from './ProtectedRoute';
import GameLobby from '../features/games/GameLobby';
import MostLikelyTo from '../features/games/MostLikelyTo';
import Skribbl from '../features/games/Skribbl';
import Cupid from '../features/games/Cupid';
import RecapPage from '../features/recap/RecapPage';

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
                    <Route path="/groups/interventions/:interventionId" element={<InterventionPage />} />
                    <Route path="/communities" element={<Communities />} />
                    <Route path="/vault" element={<Vault />} />
                    <Route path="/recap" element={<RecapPage />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/notifications" element={<Notifications />} />
                    <Route path="/profile/:userId?" element={<Profile />} />

                    {/* Games Routes */}
                    <Route path="/games" element={<GameLobby />} />
                    <Route path="/games/most_likely_to/:sessionId" element={<MostLikelyTo />} />
                    <Route path="/games/skribbl/:sessionId" element={<Skribbl />} />
                    <Route path="/games/cupid/:sessionId" element={<Cupid />} />
                </Route>
            </Route>
        </Routes>
    );
};

export default AppRoutes;
