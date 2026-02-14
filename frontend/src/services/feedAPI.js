import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const feedAPI = {
    getFeed: async () => {
        const response = await client.get(ENDPOINTS.SOCIAL.FEED);
        return response.data;
    },
    createPost: async (postData) => {
        const response = await client.post(ENDPOINTS.SOCIAL.CREATE, postData);
        return response.data;
    },
    reactToPost: async (postId, reactionType) => {
        const response = await client.post(ENDPOINTS.SOCIAL.REACT, { post: postId, reaction_type: reactionType });
        return response.data;
    },
    getComments: async (postId) => {
        const response = await client.get(ENDPOINTS.SOCIAL.COMMENTS(postId));
        return response.data;
    },
    postComment: async (postId, text) => {
        const response = await client.post(ENDPOINTS.SOCIAL.COMMENT, { post: postId, text });
        return response.data;
    },
    savePost: async (postId) => {
        const response = await client.post(ENDPOINTS.SOCIAL.SAVE, { post: postId });
        return response.data;
    },
    getUserPosts: async (userId) => {
        const response = await client.get(ENDPOINTS.SOCIAL.USER_POSTS(userId));
        return response.data;
    },
    getGroupFeed: async (groupId) => {
        const response = await client.get(ENDPOINTS.SOCIAL.GROUP_FEED(groupId));
        return response.data;
    }
};

export default feedAPI;