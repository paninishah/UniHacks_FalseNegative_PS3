import React, { createContext, useState, useEffect, useContext } from 'react';
import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

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
            const response = await client.post(ENDPOINTS.AUTH.LOGIN, {
                username: identifier, // Backend typically expects username, but UI says username/email. 
                // Adjust backend payload if necessary. For now, sending as username. 
                // Wait, Django `LoginView` usually takes username/password.
                password: password
            });
            const { token, user: userData } = response.data;
            localStorage.setItem('token', token);
            setUser(userData);
            return { success: true };
        } catch (error) {
            console.error("Login failed", error);
            return {
                success: false,
                error: error.response?.data?.detail || 'Login failed'
            };
        }
    };

    const register = async (userData) => {
        try {
            await client.post(ENDPOINTS.AUTH.REGISTER, userData);
            // Auto login after register or just redirect? 
            // Usually redirect to login, let's keep it simple.
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
