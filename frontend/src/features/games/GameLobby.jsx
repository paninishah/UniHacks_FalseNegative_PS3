import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import gameAPI from '../../services/gameAPI';
import './GameLobby.css';

const GameLobby = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [selectedGame, setSelectedGame] = useState(null);
    const [groupId, setGroupId] = useState('');

    const games = [
        {
            id: 'most_likely_to',
            title: 'Most Likely To',
            description: 'Vote on who in your group is most likely to... Expose your friends with hilarious prompts!',
            icon: '🎯',
        },
        {
            id: 'skribbl',
            title: 'Skribbl',
            description: 'Draw and guess! One person draws, everyone else guesses the secret word.',
            icon: '🎨',
        },
        {
            id: 'cupid',
            title: 'Cupid',
            description: 'Anonymous matchmaking game. Nominate pairs you think would be great together!',
            icon: '💘',
        }
    ];

    const handleStartGame = async (gameType) => {
        if (!groupId) {
            alert('Enter a Group ID to start a game!');
            return;
        }
        setLoading(true);
        try {
            const payload = { game_type: gameType };

            if (gameType === 'skribbl') {
                const words = ['Bicycle', 'Pizza', 'Sunset', 'Robot', 'Penguin', 'Guitar', 'Volcano', 'Astronaut'];
                payload.secret_word = words[Math.floor(Math.random() * words.length)];
            }

            const response = await gameAPI.startGame(groupId, payload);
            navigate(`/games/${gameType}/${response.game_id}`);
        } catch (error) {
            console.error("Failed to start game:", error);
            alert("Could not start game. Make sure the Group ID is valid.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="lobby-container">
            <div className="lobby-header">
                <h1>ARCADE</h1>
                <p style={{ color: '#888', marginTop: '-10px' }}>Pick a game, enter your group ID, and let the chaos begin.</p>
            </div>

            <div className="lobby-group-input">
                <input
                    type="text"
                    placeholder="Enter Group ID"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    className="lobby-input"
                />
            </div>

            <div className="games-grid">
                {games.map(game => (
                    <div
                        key={game.id}
                        className={`game-card ${selectedGame === game.id ? 'selected' : ''}`}
                        onClick={() => setSelectedGame(game.id)}
                    >
                        <div className="game-image">
                            <span className="game-card-icon">{game.icon}</span>
                        </div>
                        <div className="game-info">
                            <h3>{game.title}</h3>
                            <p>{game.description}</p>
                            <button
                                className="play-btn"
                                onClick={(e) => { e.stopPropagation(); handleStartGame(game.id); }}
                                disabled={loading || !groupId}
                            >
                                {loading ? 'STARTING...' : 'PLAY'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GameLobby;
