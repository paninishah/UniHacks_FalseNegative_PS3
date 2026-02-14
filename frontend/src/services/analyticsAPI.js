import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const analyticsAPI = {
    getGroupAnalytics: async (groupId) => {
        const response = await client.get(ENDPOINTS.ANALYTICS.GROUP(groupId));
        return response.data;
    },
    getDNA: async (groupId) => {
        const response = await client.get(ENDPOINTS.ANALYTICS.DNA(groupId));
        return response.data;
    },
    getHeatmap: async (groupId) => {
        const response = await client.get(ENDPOINTS.ANALYTICS.HEATMAP(groupId));
        return response.data;
    }
};

export default analyticsAPI;