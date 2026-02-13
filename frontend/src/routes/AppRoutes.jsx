import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from '../features/landing/Landing';
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
        </Routes>
    );
};

export default AppRoutes;
