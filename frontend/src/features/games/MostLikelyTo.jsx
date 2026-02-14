import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gameAPI from '../../services/gameAPI';
import client from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import './MostLikelyTo.css';

const MostLikelyTo = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [votedUser, setVotedUser] = useState(null);
    const [results, setResults] = useState(null);
    const [voteCount, setVoteCount] = useState(0);

    const wsRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                const gameData = await gameAPI.getGame(sessionId);
                setGame(gameData);

                if (gameData.group_id) {
                    const res = await client.get(ENDPOINTS.GROUPS.MEMBERS(gameData.group_id));
                    const membersData = Array.isArray(res.data) ? res.data : (res.data.results || []);
                    setMembers(membersData.map(m => m.user || m));
                }

                connectGameWebSocket(sessionId);
            } catch (error) {
                console.error("Init failed:", error);
            } finally {
                setLoading(false);
            }
        };
        init();

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, [sessionId]);

    const connectGameWebSocket = (id) => {
        const token = localStorage.getItem('token');
        const wsUrl = `ws://localhost:8000/ws/game/${id}/?token=${token}`;
        wsRef.current = new WebSocket(wsUrl);
        wsRef.current.onopen = () => console.log("Game WS Connected");
        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.action === "vote") {
                setVoteCount(prev => prev + 1);
            }
        };
        wsRef.current.onerror = (e) => console.error("WS Error:", e);
    };

    const handleVote = async (member) => {
        try {
            await gameAPI.vote(sessionId, { voted_username: member.username });

            if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                wsRef.current.send(JSON.stringify({
                    action: "vote",
                    vote_for: member.username
                }));
            }

            setVotedUser(member.username);

            // Fetch leaderboard after voting
            const leaderboard = await gameAPI.getLeaderboard(sessionId);
            setResults(leaderboard); // This is an array of { username, score }
        } catch (error) {
            console.error("Vote failed:", error);
        }
    };

    const handleFinish = async () => {
        try {
            const result = await client.post(ENDPOINTS.GAMES.FINISH_MOST_LIKELY(sessionId));
            if (result.data.winner) {
                alert(`🏆 Winner: ${result.data.winner}!`);
                const leaderboard = await gameAPI.getLeaderboard(sessionId);
                setResults(leaderboard);
            }
        } catch (error) {
            console.error("Finish failed:", error);
        }
    };

    if (loading) return <div className="game-container"><div className="loading-spinner">Loading Game...</div></div>;
    if (!game) return <div className="game-container"><h2>Game Not Found</h2></div>;

    return (
        <div className="game-container">
            <h1 className="game-title">MOST LIKELY TO...</h1>
            <div className="prompt-card">
                <h2>{game.prompt_text || "Be the main character?"}</h2>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem' }}>
                    {voteCount} vote(s) submitted
                </p>
            </div>

            {!votedUser ? (
                <div className="players-grid">
                    {members.map(member => (
                        <div
                            key={member.id}
                            className="player-card"
                            onClick={() => handleVote(member)}
                        >
                            <div className="avatar" style={{
                                background: `hsl(${(member.id * 67) % 360}, 60%, 50%)`,
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '2rem', color: 'white'
                            }}>
                                {(member.name || member.username || '?').charAt(0).toUpperCase()}
                            </div>
                            <span className="player-name">{member.name || member.username}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="results-view" style={{ width: '100%', maxWidth: '500px' }}>
                    <h3 style={{ color: '#00ff88', marginBottom: '20px' }}>✅ You voted for {votedUser}!</h3>

                    <button className="next-button" onClick={handleFinish} style={{ marginBottom: '20px' }}>
                        FINISH GAME & REVEAL WINNER
                    </button>

                    {results && results.length > 0 && (
                        <div className="leaderboard" style={{
                            background: 'rgba(255,255,255,0.05)',
                            borderRadius: '12px', padding: '20px',
                            border: '1px solid rgba(255,255,255,0.1)'
                        }}>
                            <h4 style={{ marginBottom: '15px', color: '#FFD700' }}>🏆 Leaderboard</h4>
                            {results.map((entry, i) => (
                                <div key={entry.username} style={{
                                    display: 'flex', justifyContent: 'space-between',
                                    padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)',
                                    color: i === 0 ? '#00ff88' : '#ccc'
                                }}>
                                    <span>{i + 1}. {entry.username}</span>
                                    <span>{entry.score} pts</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MostLikelyTo;
