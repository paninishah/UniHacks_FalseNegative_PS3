import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import './Groups.css';
import groupsIcon from '../../assets/icons/navbar/groups.svg';

const Groups = () => {
    const [groups, setGroups] = useState([]);
    const [myGroups, setMyGroups] = useState([]);
    const [viewMode, setViewMode] = useState('explore'); // 'explore' or 'mine'
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Create Group State
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroupData, setNewGroupData] = useState({ name: '', description: '', is_public: true });

    useEffect(() => {
        fetchGroups();
    }, [viewMode]);

    const fetchGroups = async () => {
        setLoading(true);
        try {
            if (viewMode === 'explore') {
                const response = await api.get(ENDPOINTS.GROUPS.LIST);
                setGroups(response.data);
            } else {
                const response = await api.get(ENDPOINTS.GROUPS.MINE);
                setMyGroups(response.data);
            }
        } catch (error) {
            console.error("Error fetching groups:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            await api.post(ENDPOINTS.GROUPS.LIST, newGroupData);
            setShowCreateModal(false);
            setNewGroupData({ name: '', description: '', is_public: true });
            setViewMode('mine'); // Switch to my groups to see new group
            fetchGroups(); // Refresh
        } catch (error) {
            console.error("Error creating group:", error);
            alert("Failed to create group.");
        }
    };

    const handleGroupClick = (groupId) => {
        navigate(`/groups/${groupId}`);
    };

    const displayGroups = viewMode === 'explore' ? groups : myGroups;

    return (
        <div className="groups-container">
            <div className="groups-header-bar">
                <div className="groups-tabs">
                    <button
                        className={`tab-btn ${viewMode === 'explore' ? 'active' : ''}`}
                        onClick={() => setViewMode('explore')}
                    >
                        EXPLORE GROUPS
                    </button>
                    <button
                        className={`tab-btn ${viewMode === 'mine' ? 'active' : ''}`}
                        onClick={() => setViewMode('mine')}
                    >
                        MY GROUPS
                    </button>
                </div>
                <button className="create-group-btn" onClick={() => setShowCreateModal(true)}>
                    + CREATE GROUP
                </button>
            </div>

            {loading ? (
                <div className="loading-spinner">Loading groups...</div>
            ) : (
                <div className="groups-grid">
                    {displayGroups.length === 0 ? (
                        <div className="no-groups">
                            {viewMode === 'explore' ? "No public groups found." : "You haven't joined any groups yet."}
                        </div>
                    ) : (
                        displayGroups.map(group => (
                            <div key={group.id} className="group-card" onClick={() => handleGroupClick(group.id)}>
                                <div className="group-card-header">
                                    <h3 className="group-name">{group.name}</h3>
                                    <span className="group-members">{group.member_count} members</span>
                                </div>
                                <p className="group-desc">{group.description || "No description provided."}</p>
                                <div className="group-footer">
                                    {group.is_member ? (
                                        <span className="member-badge">MEMBER</span>
                                    ) : (
                                        <span className="join-hint">Click to view</span>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h2>Create New Group</h2>
                        <form onSubmit={handleCreateGroup}>
                            <input
                                type="text"
                                placeholder="Group Name"
                                value={newGroupData.name}
                                onChange={(e) => setNewGroupData({ ...newGroupData, name: e.target.value })}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={newGroupData.description}
                                onChange={(e) => setNewGroupData({ ...newGroupData, description: e.target.value })}
                                required
                            />
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={newGroupData.is_public}
                                    onChange={(e) => setNewGroupData({ ...newGroupData, is_public: e.target.checked })}
                                />
                                Public Group
                            </label>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit" className="primary-btn">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Groups;
