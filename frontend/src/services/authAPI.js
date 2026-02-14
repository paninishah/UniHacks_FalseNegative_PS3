import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const authAPI = {
    login: async (username, password) => {
        const response = await client.post(ENDPOINTS.AUTH.LOGIN, { username_or_email: username, password });
        return response.data;
    },
    register: async (userData) => {
        const response = await client.post(ENDPOINTS.AUTH.REGISTER, userData);
        return response.data;
    },
    getProfile: async () => {
        const response = await client.get(ENDPOINTS.AUTH.PROFILE);
        return response.data;
    },
    getPublicProfile: async (userId) => {
        const response = await client.get(ENDPOINTS.AUTH.PROFILE_ID(userId));
        return response.data;
    },
    updateProfile: async (data) => {
        const response = await client.put(ENDPOINTS.AUTH.PROFILE, data);
        return response.data;
    },
    followUser: async (userId) => {
        const response = await client.post(ENDPOINTS.AUTH.FOLLOW(userId));
        return response.data;
    },
    unfollowUser: async (userId) => {
        const response = await client.post(ENDPOINTS.AUTH.UNFOLLOW(userId));
        return response.data;
    }
};

export default authAPI;