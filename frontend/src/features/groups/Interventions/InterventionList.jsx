import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../../api/client';
import { ENDPOINTS } from '../../../api/endpoints';
import './Interventions.css';

const InterventionList = ({ groupId, isMember }) => {
    const [interventions, setInterventions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateOpen, setCreateOpen] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newTarget, setNewTarget] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        if (groupId && isMember) {
            fetchInterventions();
        }
    }, [groupId, isMember]);

    const fetchInterventions = async () => {
        try {
            const response = await api.get(ENDPOINTS.GROUPS.INTERVENTIONS(groupId));
            setInterventions(response.data);
        } catch (error) {
            console.error("Failed to fetch interventions", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post(ENDPOINTS.GROUPS.INTERVENTIONS(groupId), {
                title: newTitle,
                target: newTarget
            });
            setCreateOpen(false);
            setNewTitle('');
            setNewTarget('');
            fetchInterventions();
        } catch (error) {
            console.error("Failed to create intervention", error);
        }
    };

    if (!isMember) return null;

    return (
        <div className="intervention-list-container">
            <div className="intervention-header">
                <h3>🚑 Interventions</h3>
                <button onClick={() => setCreateOpen(!isCreateOpen)} className="create-int-btn">
                    {isCreateOpen ? 'Cancel' : 'Host Intervention'}
                </button>
            </div>

            {isCreateOpen && (
                <form onSubmit={handleCreate} className="create-int-form">
                    <input
                        type="text"
                        placeholder="Title (e.g. Stop texting your ex)"
                        value={newTitle}
                        onChange={e => setNewTitle(e.target.value)}
                        required
                    />
                    <input
                        type="text"
                        placeholder="Target (e.g. Rahul)"
                        value={newTarget}
                        onChange={e => setNewTarget(e.target.value)}
                        required
                    />
                    <button type="submit">Start Intervention</button>
                </form>
            )}

            <div className="intervention-cards">
                {interventions.length === 0 ? (
                    <p className="no-int">No active interventions. Everyone is behaving (for now).</p>
                ) : (
                    interventions.map(int => (
                        <div key={int.id} className="intervention-card" onClick={() => navigate(`/groups/interventions/${int.id}`)}>
                            <div className="int-status">{int.status}</div>
                            <h4>{int.title}</h4>
                            <p>Target: {int.target}</p>
                            <span>{int.messages ? int.messages.length : 0} statements filed</span>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default InterventionList;
