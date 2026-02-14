import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const recapAPI = {
    generateRecap: async (groupId) => {
        const response = await client.post(ENDPOINTS.RECAP.GENERATE(groupId));
        return response.data;
    },
    getLatestRecap: async (groupId) => {
        const response = await client.get(ENDPOINTS.RECAP.LATEST(groupId));
        return response.data;
    }
};

export default recapAPI;