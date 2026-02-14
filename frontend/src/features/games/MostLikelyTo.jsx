import React, { useState, useEffect, useRef } from 'react';
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

    // WebSocket Ref
    const wsRef = useRef(null);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                // Fetch game details
                const gameData = await gameAPI.getGame(sessionId);
                setGame(gameData);

                // Fetch members
                if (gameData.group_id) {
                    const membersData = await groupAPI.getMembers(gameData.group_id);
                    // API returns membership objects with nested user
                    setMembers(membersData.map(m => m.user || m));
                }

                // Connect WebSocket
                connectGameWebSocket(sessionId);
            } catch (error) {
                console.error("Init failed", error);
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
                // Someone voted
                // For now, maybe just show a toast or refresh leaderboard?
                // Or simplified: just re-fetch leaderboard if we assume backend aggregates
                // But for real-time feeling, let's just log it or show a notification
                console.log(`${data.user} voted!`);
                // Ideally update a "Votes: X/Y" counter
            }
        };
    };

    const handleVote = async (targetUserId) => {
        try {
            const member = members.find(m => m.id === targetUserId);
            if (!member || !wsRef.current) return;

            // Send vote via WS for real-time feel + API for persistence if needed
            // Actually, best to use API for persistence and WS for notification
            // But let's stick to API for action, WS for notification from backend
            await gameAPI.vote(sessionId, { voted_username: member.username });

            // Backend consumer should see the DB update? 
            // Actually, our consumer handles "vote" action from WS, BUT we usually call API.
            // Let's call API as before, but ALSO send WS message if we want immediate feedback?
            // Wait, the consumer `receive` method handles `vote` action and saves to DB. 
            // So we can just use WS to vote! 
            // But `gameAPI.vote` uses HTTP. Let's stick to HTTP for reliability, 
            // and the backend consumer should likely hook into DB signals or we just use WS for everything?
            // The instructions said "The ai needs to give it randomzied questions... everyone needs to have an option to vote".
            // Let's use the WS for voting to match the Skribbl pattern if possible.
            // BUT, I implemented `save_vote` in consumer. So I can use WS.

            wsRef.current.send(JSON.stringify({
                action: "vote",
                vote_for: member.username
            }));

            setVotedUser(targetUserId);

            // Fetch leaderboard/results
            // Give it a moment or wait for "game_finished" event
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
