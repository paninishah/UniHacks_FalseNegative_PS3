import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import './Interventions.css';
import { useAuth } from '../../../context/AuthContext';

const InterventionPage = () => {
    const { interventionId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [intervention, setIntervention] = useState(null);
    const [messages, setMessages] = useState([]); // Assuming messages are fetched separately or part of details
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchInterventionDetails();
    }, [interventionId]);

    const fetchInterventionDetails = async () => {
        try {
            const response = await api.get(ENDPOINTS.GROUPS.INTERVENTION_DETAILS(interventionId));
            setIntervention(response.data);
            // Assuming messages are included in detail view based on serializer
            if (response.data.messages) {
                setMessages(response.data.messages);
            }
        } catch (error) {
            console.error("Failed to fetch intervention", error);
        } finally {
            setLoading(false);
        }
    };

    const handlePostMessage = async (e) => {
        e.preventDefault();
        try {
            await api.post(ENDPOINTS.GROUPS.INTERVENTION_MESSAGES(interventionId), {
                content: newMessage
            });
            setNewMessage('');
            fetchInterventionDetails(); // Refresh
        } catch (error) {
            console.error("Failed to post message", error);
        }
    };

    if (loading) return <div className="loading-screen">LOADING INTERVENTION...</div>;
    if (!intervention) return <div className="error-screen">INTERVENTION NOT FOUND</div>;

    return (
        <div className="intervention-page">
            <button className="back-btn" onClick={() => navigate(-1)}>← Back</button>

            <div className="intervention-banner">
                <h1>INTERVENTION</h1>
                <h2>TARGET: {intervention.target}</h2>
                <div className="caution-tape">CAUTION: REAL TALK AHEAD</div>
            </div>

            <div className="intervention-content">
                <div className="intervention-info">
                    <h3>{intervention.title}</h3>
                    <p>Initiated by {intervention.created_by?.name || 'Unknown'}</p>
                </div>

                <div className="statements-list">
                    {messages.map(msg => (
                        <div key={msg.id} className="statement-card">
                            <div className="statement-author">
                                <div className="author-pfp" style={{ backgroundImage: `url(${msg.user?.profile_picture || ''})` }}></div>
                                <span>{msg.user?.name} says:</span>
                            </div>
                            <p className="statement-text">"{msg.content}"</p>
                        </div>
                    ))}
                </div>

                <form className="add-statement-form" onSubmit={handlePostMessage}>
                    <textarea
                        placeholder={`Add your piece to the intervention for ${intervention.target}...`}
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        required
                    />
                    <button type="submit">SUBMIT STATEMENT</button>
                </form>
            </div>
        </div>
    );
};

export default InterventionPage;
