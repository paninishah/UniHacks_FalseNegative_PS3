import client from '../api/client';
import { ENDPOINTS } from '../api/endpoints';

const gameAPI = {
    startGame: async (sessionId, payload) => {
        // Note: Endpoint expects ID, but creating usually implies POST to list or specific start endpoint
        // Adjusted based on endpoints.js: START: (id) => ...
        const response = await client.post(ENDPOINTS.GAMES.START(sessionId), payload);
        // Wait, StartGameView expects post body: game_type, prompt_text
        // We'll update GameLobby to send these.
        return response.data;
    },
    getGame: async (gameId) => {
        const response = await client.get(ENDPOINTS.GAMES.DETAILS(gameId));
        return response.data;
    },
    vote: async (sessionId, voteData) => {
        const response = await client.post(ENDPOINTS.GAMES.VOTE(sessionId), voteData);
        return response.data;
    },
    guess: async (sessionId, guessData) => {
        const response = await client.post(ENDPOINTS.GAMES.GUESS(sessionId), guessData);
        return response.data;
    },
    getLeaderboard: async (sessionId) => {
        const response = await client.get(ENDPOINTS.GAMES.LEADERBOARD(sessionId));
        return response.data;
    }
};

export default gameAPI;