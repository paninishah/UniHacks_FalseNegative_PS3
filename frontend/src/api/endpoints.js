export const ENDPOINTS = {
    AUTH: {
        LOGIN: '/api/users/login/',
        REGISTER: '/api/users/signup/',
        PROFILE: '/api/users/profile/',
        PROFILE_ID: (id) => `/api/users/profile/${id}/`,
        FOLLOW: (id) => `/api/users/follow/${id}/`,
        UNFOLLOW: (id) => `/api/users/unfollow/${id}/`,
    },
    SOCIAL: {
        FEED: '/api/social/feed/',
        CREATE: '/api/social/create/',
        REACT: '/api/social/react/',
        COMMENT: '/api/social/comment/',
        COMMENTS: (id) => `/api/social/comments/${id}/`,
        SAVE: '/api/social/save/',
        USER_POSTS: (id) => `/api/social/user-posts/${id}/`,
        GROUP_FEED: (id) => `/api/social/group-posts/${id}/`,
    },
    GROUPS: {
        LIST: '/api/groups/',
        MINE: '/api/groups/mine/',
        DETAILS: (id) => `/api/groups/${id}/`,
        JOIN: (id) => `/api/groups/${id}/join/`,
        LEAVE: (id) => `/api/groups/${id}/leave/`,
        MEMBERS: (id) => `/api/groups/${id}/members/`,
        MESSAGES: (id) => `/api/groups/${id}/messages/`,
    },
    GAMES: {
        START: (id) => `/api/games/start/${id}/`,
        DETAILS: (id) => `/api/games/${id}/`,
        VOTE: (id) => `/api/games/vote/${id}/`,
        FINISH_MOST_LIKELY: (id) => `/api/games/finish-most-likely/${id}/`,
        GUESS: (id) => `/api/games/guess/${id}/`,
        LEADERBOARD: (id) => `/api/games/leaderboard/${id}/`,
    },
    VAULT: {
        CREATE_CAPSULE: '/api/vault/capsule/create/',
        MY_CAPSULES: '/api/vault/capsule/mine/',
        CREATE_ITEM: '/api/vault/vault/create/',
        GENERATE_TOKEN: '/api/vault/vault/generate-token/',
        GRANT: '/api/vault/vault/grant/',
        ANALYZE_music: (id) => `/api/vault/capsule/${id}/analyze-music/`,
    },
    MUSIC: {
        ANALYZE: '/api/music/analyze/',
        SEARCH: '/api/music/search/',
    },
    ANALYTICS: {
        GROUP: (id) => `/api/analytics/group/${id}/`,
        DNA: (id) => `/api/analytics/group/${id}/dna/`,
        HEATMAP: (id) => `/api/analytics/group/${id}/heatmap/`,
    },
    RECAP: {
        GENERATE: (id) => `/api/recap/generate/${id}/`,
        LATEST: (id) => `/api/recap/latest/${id}/`,
    },
    CHATBOT: {
        CHAT: '/api/chatbot/chat/',
    },
    COMMUNITIES: {
        list: '/api/communities/list/',
        create: '/api/communities/create/',
        join: '/api/communities/join/',
        post: '/api/communities/post/',
        feed: (id) => `/api/communities/feed/${id}/`,
    },
    ENGAGEMENT: {
        // checks etc
    }
};
