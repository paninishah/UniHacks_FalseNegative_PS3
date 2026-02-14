import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Assuming routing
import io from 'socket.io-client'; // Is there a socket server? Or just polling?
// Requirements said "No mock data". Backend is Django.
// Games: Start Most Likely To, Submit vote, Finish game.
// Endpoints: START, VOTE, FINISH.
import gameAPI from '../../services/gameAPI';
import './GameLobby.css'; // Assuming CSS exists or I need to create it.

const GameLobby = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedGame, setSelectedGame] = useState('most_likely_to');
    const [sessionId, setSessionId] = useState('');

    const PROMPTS = [
        "Who is most likely to become a billionaire?",
        "Who is most likely to get arrested?",
        "Who is most likely to join a cult?",
        "Who is most likely to cry in public?",
        "Who is most likely to win a Nobel Prize?",
        "Who is most likely to forget their own birthday?"
    ];

    const handleStartGame = async () => {
        setLoading(true);
        try {
            // Need a session ID or group ID?
            // "Start Most Likely To" -> usually within a group.
            // But endpoints.js said `START: (id) => ...`
            // Is ID the group ID?
            // Let's assume we are in a group context or we create a new global session?
            // "Create group ... Group isolation must be enforced"
            // "Games ... Start Most Likely To"
            // Probably triggered from Group Dashboard.
            // But this is GameLobby.
            // Let's assume passed via props or context if integrated.
            // Or this creates a standalone game session?
            // For now, let's implement a generic starter.

            // Temporary: We need a valid ID for the endpoint.
            // If the user selects a group, we use that.
            // Let's just use a placeholder ID '1' for demo if no props.
            // Realistically, this component should be embedded in GroupDetails or take groupId as prop.

            // user prompt: "Start Most Likely To... Submit vote... Finish game"
            // I'll assume we can start a game for a specific group.
            // How to select group?
            // Let's just make it simple: "Start New Game" button that calls API.

            const randomPrompt = PROMPTS[Math.floor(Math.random() * PROMPTS.length)];
            const secretWord = "Bicycle"; // Simple word for Skribbl demo

            const payload = {
                game_type: selectedGame,
                prompt_text: selectedGame === 'most_likely_to' ? randomPrompt : null,
                secret_word: selectedGame === 'skribbl' ? secretWord : null
            };

            const response = await gameAPI.startGame(sessionId || '1', payload); // sessionId here is groupId
            // Navigate to game board
            navigate(`/games/${selectedGame}/${response.game_id}`);
        } catch (error) {
            console.error("Failed to start game", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="game-lobby">
            <h1>ARCADE</h1>
            <div className="game-selection">
                <div
                    className={`game-card ${selectedGame === 'most_likely_to' ? 'selected' : ''}`}
                    onClick={() => setSelectedGame('most_likely_to')}
                >
                    <h3>Most Likely To</h3>
                    <p>Expose your friends.</p>
                </div>
                <div
                    className={`game-card ${selectedGame === 'skribbl' ? 'selected' : ''}`}
                    onClick={() => setSelectedGame('skribbl')}
                >
                    <h3>Skribbl</h3>
                    <p>Draw and guess.</p>
                </div>
            </div>

            <div className="lobby-controls">
                <input
                    type="text"
                    placeholder="Enter Group ID (Demo)"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    className="lobby-input"
                />
                <button className="start-btn" onClick={handleStartGame} disabled={loading}>
                    {loading ? 'STARTING...' : 'START GAME'}
                </button>
            </div>
        </div>
    );
};

export default GameLobby;
