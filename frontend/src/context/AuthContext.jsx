import React, { createContext, useState, useEffect, useContext } from 'react';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';
import authAPI from '../services/authAPI';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const checkAuth = async () => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                // Assuming duplicate call to profile to verify token valid
                const response = await client.get(ENDPOINTS.AUTH.PROFILE);
                setUser(response.data);
            } catch (error) {
                console.error("Auth check failed", error);
                localStorage.removeItem('token');
                setUser(null);
            }
        }
        setLoading(false);
    };

    useEffect(() => {
        checkAuth();
    }, []);

    const login = async (identifier, password) => {
        try {
            const data = await authAPI.login(identifier, password);
            const { token, user: userData } = data;
            localStorage.setItem('token', token);
            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            const errorMsg = error.response?.data?.detail
                || error.response?.data?.non_field_errors?.[0]
                || error.response?.data?.error
                || 'Login failed';
            return {
                success: false,
                error: errorMsg
            };
        }
    };

    const register = async (userData) => {
        try {
            await authAPI.register(userData);
            return { success: true };
        } catch (error) {
            console.error("Registration failed", error);
            return {
                success: false,
                error: error.response?.data?.detail || JSON.stringify(error.response?.data) || 'Registration failed'
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
        window.location.href = '/login';
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
