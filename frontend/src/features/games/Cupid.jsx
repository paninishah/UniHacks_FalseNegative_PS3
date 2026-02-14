import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import client from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import './Cupid.css';

const Cupid = () => {
    const { sessionId } = useParams();
    const navigate = useNavigate();
    const [game, setGame] = useState(null);
    const [members, setMembers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [nominations, setNominations] = useState([]);
    const [selectedA, setSelectedA] = useState(null);
    const [selectedB, setSelectedB] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [results, setResults] = useState(null);

    useEffect(() => {
        const init = async () => {
            try {
                const gameRes = await client.get(ENDPOINTS.GAMES.DETAILS(sessionId));
                setGame(gameRes.data);

                if (gameRes.data.group_id) {
                    const membersRes = await client.get(ENDPOINTS.GROUPS.MEMBERS(gameRes.data.group_id));
                    const membersData = Array.isArray(membersRes.data) ? membersRes.data : (membersRes.data.results || []);
                    setMembers(membersData.map(m => m.user || m));
                }
            } catch (error) {
                console.error("Init failed:", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [sessionId]);

    const handleSelectMember = (member) => {
        if (!selectedA) {
            setSelectedA(member);
        } else if (selectedA.id === member.id) {
            setSelectedA(null);
        } else if (!selectedB) {
            setSelectedB(member);
        } else if (selectedB.id === member.id) {
            setSelectedB(null);
        } else {
            setSelectedB(member);
        }
    };

    const handleSubmitNomination = async () => {
        if (!selectedA || !selectedB) return;

        const nomination = {
            user_a: selectedA.username,
            user_b: selectedB.username,
        };

        try {
            await client.post(ENDPOINTS.GAMES.VOTE(sessionId), {
                voted_username: `${selectedA.username}+${selectedB.username}`
            });

            setNominations(prev => [...prev, nomination]);
            setSelectedA(null);
            setSelectedB(null);
            setSubmitted(true);
        } catch (error) {
            console.error("Nomination failed:", error);
        }
    };

    const handleFinish = async () => {
        try {
            const result = await client.post(ENDPOINTS.GAMES.FINISH_MOST_LIKELY(sessionId));
            if (result.data.winner) {
                const parts = result.data.winner.split('+');
                setResults({ user_a: parts[0], user_b: parts[1] || '?' });
            }
        } catch (error) {
            console.error("Finish failed:", error);
        }
    };

    if (loading) return <div className="cupid-container"><div className="loading-spinner">Loading Cupid...</div></div>;
    if (!game) return <div className="cupid-container"><h2>Game Not Found</h2></div>;

    return (
        <div className="cupid-container">
            <div className="cupid-header">
                <span className="cupid-icon">💘</span>
                <h1>CUPID</h1>
                <p className="cupid-subtitle">Anonymously match two people you think belong together</p>
            </div>

            {results ? (
                <div className="cupid-result-card">
                    <div className="cupid-match-reveal">
                        <span className="match-emoji">💕</span>
                        <h2>THE MATCH</h2>
                        <div className="match-pair">
                            <div className="match-person">
                                <div className="match-avatar" style={{ background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)' }}>
                                    {results.user_a?.charAt(0).toUpperCase()}
                                </div>
                                <span>{results.user_a}</span>
                            </div>
                            <span className="match-heart">❤️</span>
                            <div className="match-person">
                                <div className="match-avatar" style={{ background: 'linear-gradient(135deg, #a18cd1, #fbc2eb)' }}>
                                    {results.user_b?.charAt(0).toUpperCase()}
                                </div>
                                <span>{results.user_b}</span>
                            </div>
                        </div>
                    </div>
                </div>
            ) : !submitted ? (
                <>
                    <div className="cupid-instruction">
                        <p>Select <strong>two people</strong> to nominate as a match:</p>
                    </div>
                    <div className="cupid-selection">
                        {selectedA && selectedB && (
                            <div className="cupid-preview">
                                <span>{selectedA.name || selectedA.username}</span>
                                <span className="cupid-heart">💕</span>
                                <span>{selectedB.name || selectedB.username}</span>
                            </div>
                        )}
                    </div>

                    <div className="cupid-members-grid">
                        {members.map(member => {
                            const isA = selectedA?.id === member.id;
                            const isB = selectedB?.id === member.id;
                            return (
                                <div
                                    key={member.id}
                                    className={`cupid-card ${isA ? 'selected-a' : ''} ${isB ? 'selected-b' : ''}`}
                                    onClick={() => handleSelectMember(member)}
                                >
                                    <div className="cupid-avatar" style={{
                                        background: `hsl(${(member.id * 67) % 360}, 60%, 50%)`,
                                    }}>
                                        {(member.name || member.username || '?').charAt(0).toUpperCase()}
                                    </div>
                                    <span>{member.name || member.username}</span>
                                    {isA && <div className="selection-badge">A</div>}
                                    {isB && <div className="selection-badge badge-b">B</div>}
                                </div>
                            );
                        })}
                    </div>

                    {selectedA && selectedB && (
                        <button className="cupid-submit-btn" onClick={handleSubmitNomination}>
                            💘 SUBMIT MATCH
                        </button>
                    )}
                </>
            ) : (
                <div className="cupid-submitted">
                    <h3>✅ Nomination Submitted!</h3>
                    <p>Waiting for others to vote...</p>
                    <button className="cupid-finish-btn" onClick={handleFinish}>
                        REVEAL TOP MATCH
                    </button>
                </div>
            )}
        </div>
    );
};

export default Cupid;
