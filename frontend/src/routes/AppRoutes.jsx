import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Landing from '../features/landing/Landing';

const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Landing />} />
        </Routes>
    );
};

export default AppRoutes;
