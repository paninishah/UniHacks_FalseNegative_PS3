import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const vaultAPI = {
    createCapsule: async (capsuleData) => {
        const response = await client.post(ENDPOINTS.VAULT.CREATE_CAPSULE, capsuleData);
        return response.data;
    },
    getMyCapsules: async () => {
        const response = await client.get(ENDPOINTS.VAULT.MY_CAPSULES);
        return response.data;
    },
    createVaultItem: async (itemData) => {
        const response = await client.post(ENDPOINTS.VAULT.CREATE_ITEM, itemData);
        return response.data;
    },
    generateToken: async (capsuleId) => {
        const response = await client.post(ENDPOINTS.VAULT.GENERATE_TOKEN, { capsule_id: capsuleId });
        return response.data;
    },
    grantAccess: async (accessData) => {
        const response = await client.post(ENDPOINTS.VAULT.GRANT, accessData);
        return response.data;
    },
    analyzeMusic: async (capsuleId) => {
        const response = await client.post(ENDPOINTS.VAULT.ANALYZE_music(capsuleId));
        return response.data;
    }
};

export default vaultAPI;