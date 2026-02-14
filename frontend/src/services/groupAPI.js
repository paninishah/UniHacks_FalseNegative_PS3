import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const groupAPI = {
    getAllGroups: async () => {
        const response = await client.get(ENDPOINTS.GROUPS.LIST);
        return response.data;
    },
    getMyGroups: async () => {
        const response = await client.get(ENDPOINTS.GROUPS.MINE);
        return response.data;
    },
    getGroupDetails: async (id) => {
        const response = await client.get(ENDPOINTS.GROUPS.DETAILS(id));
        return response.data;
    },
    createGroup: async (groupData) => {
        const response = await client.post(ENDPOINTS.GROUPS.LIST, groupData);
        return response.data;
    },
    joinGroup: async (id) => {
        const response = await client.post(ENDPOINTS.GROUPS.JOIN(id));
        return response.data;
    },
    leaveGroup: async (id) => {
        const response = await client.post(ENDPOINTS.GROUPS.LEAVE(id));
        return response.data;
    },
    getMembers: async (id) => {
        const response = await client.get(ENDPOINTS.GROUPS.MEMBERS(id));
        return response.data;
    }
};

export default groupAPI;