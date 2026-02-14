import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import gameAPI from '../../services/gameAPI';
import groupAPI from '../../services/groupAPI';
import './MostLikelyTo.css'; // Assume css

const MostLikelyTo = () => {
    const { sessionId, groupId } = useParams(); // Helper note: sessionId here is actually gameId based on routes
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [votedUser, setVotedUser] = useState(null);
    const [results, setResults] = useState(null);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                // Fetch game details
                // sessionId is passed as gameId
                const gameData = await gameAPI.getGame(sessionId);
                setGame(gameData);

                // Fetch members
                if (gameData.group_id) {
                    const membersData = await groupAPI.getMembers(gameData.group_id);
                    setMembers(membersData);
                }
            } catch (error) {
                console.error("Init failed", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [sessionId]);

    const handleVote = async (targetUserId) => {
        try {
            // Need username for vote, assume member object has username
            const member = members.find(m => m.id === targetUserId);
            if (!member) return;

            await gameAPI.vote(sessionId, { voted_username: member.username });
            setVotedUser(targetUserId);

            // Fetch leaderboard/results
            const leaderboard = await gameAPI.getLeaderboard(sessionId);
            setResults(leaderboard);
        } catch (error) {
            console.error("Vote failed", error);
        }
    };

    if (loading) return <div>Loading Game...</div>;
    if (!game) return <div>Game Not Found</div>;

    return (
        <div className="game-container">
            <h1 className="game-title">MOST LIKELY TO...</h1>
            <div className="game-prompt-card">
                <h2>{game.prompt_text || "Be the main character?"}</h2>
            </div>

            {!votedUser ? (
                <div className="members-grid">
                    {members.map(member => (
                        <div key={member.id} className="member-card" onClick={() => handleVote(member.id)}>
                            <div className="member-pfp" style={{ backgroundImage: `url(${member.profile_picture || ''})` }}></div>
                            <span>{member.name || member.username}</span>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="results-view">
                    <h3>VOTE SUBMITTED!</h3>
                    <div className="leaderboard">
                        {results && Object.entries(results).map(([user, score]) => (
                            <div key={user} className="leaderboard-item">
                                <span>{user}</span>
                                <span>{score} votes</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MostLikelyTo;
