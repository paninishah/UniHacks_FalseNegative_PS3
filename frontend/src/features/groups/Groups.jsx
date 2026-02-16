import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import './Groups.css';
import InterventionList from './Interventions/InterventionList';
import MusicPlayer from '../../components/MusicPlayer';

const Groups = () => {
    const navigate = useNavigate();
    const { groupId } = useParams();
    const { user: currentUser } = useAuth();

    // Data State
    const [myGroups, setMyGroups] = useState([]);
    const [publicGroups, setPublicGroups] = useState([]);
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [posts, setPosts] = useState([]);
    const [chatMessages, setChatMessages] = useState([]);
    const [participants, setParticipants] = useState([]); // Online users

    // UI State
    const [rightInfoTab, setRightInfoTab] = useState('chat'); // 'chat' or 'games'
    const [loading, setLoading] = useState(true);
    const [loadingPosts, setLoadingPosts] = useState(false);


    // Like State & Music
    const [musicVibe, setMusicVibe] = useState(null);
    const [analyzingMusic, setAnalyzingMusic] = useState(false);

    const handleGenerateMusic = async () => {
        if (!selectedGroup) return;
        setAnalyzingMusic(true);
        // Collect text
        const sampleTexts = [selectedGroup.name, selectedGroup.description];
        posts.slice(0, 5).forEach(p => sampleTexts.push(p.text_content));

        try {
            const keywords = sampleTexts.join(" ").split(" ").slice(0, 5);
            const result = await api.post(ENDPOINTS.MUSIC.ANALYZE, { songs: keywords });
            setMusicVibe(result.data);
        } catch (error) {
            console.error("Music analysis failed", error);
        } finally {
            setAnalyzingMusic(false);
        }
    };

    // Inputs
    const [newPostContent, setNewPostContent] = useState('');
    const [chatInput, setChatInput] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newGroupData, setNewGroupData] = useState({ name: '', description: '', is_public: true });

    // Chat WebSocket Ref
    const wsRef = useRef(null);

    // Initial Fetch
    useEffect(() => {
        fetchInitialData();
        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, []);

    // When selected group changes
    useEffect(() => {
        if (selectedGroup) {
            fetchGroupPosts(selectedGroup.id);
            fetchChatMessages(selectedGroup.id);

            // Connect to WebSocket
            connectChatWebSocket(selectedGroup.id);
        } else {
            setPosts([]);
            setChatMessages([]);
            setParticipants([]);
            if (wsRef.current) {
                wsRef.current.close();
                wsRef.current = null;
            }
        }
    }, [selectedGroup]);

    const connectChatWebSocket = (groupId) => {
        if (wsRef.current) {
            wsRef.current.close();
        }

        const token = localStorage.getItem('token');
        const wsUrl = `ws://localhost:8000/ws/chat/${groupId}/?token=${token}`;
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
            console.log("Chat WebSocket Connected");
        };

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);

            if (data.type === 'chat_message' || !data.type) {
                // Normalize WS message to match REST shape
                const normalized = {
                    id: Date.now(), // temp unique key
                    content: data.message,
                    user: { id: data.user_id, username: data.user },
                    created_at: data.timestamp
                };
                setChatMessages(prev => [...prev, normalized]);
            } else if (data.type === 'user_joined') {
                setParticipants(prev => {
                    if (prev.find(p => p.id === data.user.id)) return prev;
                    return [...prev, data.user];
                });
            } else if (data.type === 'user_left') {
                setParticipants(prev => prev.filter(p => p.id !== data.user_id));
            } else if (data.type === 'presence_list') {
                setParticipants(data.users);
            }
        };

        wsRef.current.onclose = (e) => {
            console.log("Chat WebSocket Disconnected", e.code, e.reason);
            setParticipants([]);

            // If closed cleanly or auth failure, don't spam reconnect
            // 4003 is our custom "Auth Failed" code (if we used it, but here likely 1000 or 1006)
            if (e.code === 4003) {
                alert("Chat Authentication Failed. Please login again.");
            }
        };

        wsRef.current.onerror = (err) => {
            console.error("WebSocket Error:", err);
            // Don't act here, let onclose handle it
        };
    };

    const fetchInitialData = async (keepSelection = false) => {
        if (!keepSelection) setLoading(true);
        try {
            const [myRes, pubRes] = await Promise.all([
                api.get(ENDPOINTS.GROUPS.MY),
                api.get(ENDPOINTS.GROUPS.LIST)
            ]);
            setMyGroups(myRes.data);
            setPublicGroups(pubRes.data);

            if (myRes.data.length > 0 && !selectedGroup && !keepSelection) {
                setSelectedGroup(myRes.data[0]);
            }
        } catch (error) {
            console.error("Error fetching groups data:", error);
        } finally {
            if (!keepSelection) setLoading(false);
        }
    };

    const fetchGroupPosts = async (id) => {
        setLoadingPosts(true);
        try {
            const res = await api.get(ENDPOINTS.SOCIAL.GROUP_FEED(id));
            setPosts(res.data);
        } catch (error) {
            console.error("Error fetching group posts:", error);
        } finally {
            setLoadingPosts(false);
        }
    };

    const fetchChatMessages = async (id) => {
        try {
            const res = await api.get(ENDPOINTS.GROUPS.MESSAGES(id));
            setChatMessages(res.data);
        } catch (error) {
            console.error("Failed to fetch messages", error);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim() || !selectedGroup) return;

        try {
            await api.post(ENDPOINTS.SOCIAL.CREATE, {
                text_content: newPostContent,
                group: selectedGroup.id,
                category: 'news_bite',
                post_type: 'text',
                visibility: 'group'
            });
            setNewPostContent('');
            fetchGroupPosts(selectedGroup.id);
        } catch (error) {
            console.error("Error creating post:", error.response?.data || error);
            alert(`Failed to post: ${JSON.stringify(error.response?.data || error.message)}`);
        }
    };

    const handleSendChat = async (e) => {
        e.preventDefault();
        if (!chatInput.trim() || !selectedGroup || !wsRef.current) return;

        if (wsRef.current.readyState !== WebSocket.OPEN) {
            console.warn("WebSocket not open. Reconnecting...");
            connectChatWebSocket(selectedGroup.id);
            // Optionally queue message or alert user
            return;
        }

        // Send via WebSocket
        try {
            wsRef.current.send(JSON.stringify({
                message: chatInput
            }));
            setChatInput('');
        } catch (error) {
            console.error("Error sending chat via WS:", error);
        }
    };

    const handleJoinGroup = async (group) => {
        if (!window.confirm(`Join ${group.name}?`)) return;
        try {
            await api.post(ENDPOINTS.GROUPS.JOIN(group.id));
            const updatedGroup = { ...group, is_member: true, member_count: group.member_count + 1 };
            setMyGroups(prev => [updatedGroup, ...prev]);
            setSelectedGroup(updatedGroup);
            fetchInitialData();
        } catch (error) {
            console.error("Error joining group:", error);
        }
    };

    const handleCreateGroup = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post(ENDPOINTS.GROUPS.LIST, newGroupData);
            setShowCreateModal(false);
            setNewGroupData({ name: '', description: '', is_public: true });
            alert("Group created and saved! ✅");

            // Immediate feedback: Set the new group as selected
            const newGroup = res.data;
            // Optimistically add to myGroups locally to ensure it appears instantly
            setMyGroups(prev => [newGroup, ...prev]);
            setSelectedGroup(newGroup);

            // Refresh data in background, but keep our new selection
            fetchInitialData(true);

        } catch (error) {
            console.error("Error creating group:", error);
            alert(`Failed to create group: ${JSON.stringify(error.response?.data || error.message)}`);
        }
    };

    const handleGameClick = async (gameLabel) => {
        if (!selectedGroup) return;

        const typeMap = {
            'Most Likely To': 'most_likely_to',
            'Skribbl': 'skribbl',
            'Cupid': 'cupid'
        };
        const gameType = typeMap[gameLabel];
        if (!gameType) return;

        try {
            const res = await api.post(ENDPOINTS.GAMES.START(selectedGroup.id), {
                game_type: gameType
            });
            navigate(`/games/${gameType}/${res.data.game_id}`);
        } catch (error) {
            console.error("Failed to start game:", error);
            alert("Could not start game session. Please try again.");
        }
    };

    if (loading) return <div className="loading-spinner">Loading Newsbites...</div>;

    return (
        <div className="groups-layout">
            <div className="groups-sidebar">
                <div className="sidebar-header">
                    <h2>NEWSROOM</h2>
                    <button className="create-group-btn-sidebar" onClick={() => setShowCreateModal(true)} title="Create Group">+</button>
                </div>

                <div className="sidebar-section-title">My Groups</div>
                <div className="groups-list-sidebar">
                    {myGroups.map(g => (
                        <div
                            key={g.id}
                            className={`group-item-sidebar ${selectedGroup?.id === g.id ? 'active' : ''}`}
                            onClick={() => setSelectedGroup(g)}
                        >
                            <div className="group-icon-small">{g.name.substring(0, 2).toUpperCase()}</div>
                            <span className="group-name-sidebar">{g.name}</span>
                        </div>
                    ))}
                    {myGroups.length === 0 && <div className="no-groups-sidebar">No groups joined yet.</div>}
                </div>

                <div className="sidebar-section-title">Explore</div>
                <button className="tab-btn" onClick={() => setSelectedGroup(null)} style={{ textAlign: 'left', paddingLeft: '0' }}>
                    🔍 Browse All Groups
                </button>
            </div>

            <div className="groups-main">
                {selectedGroup ? (
                    <>
                        <div className="groups-main-header">
                            <div className="group-header-info">
                                <h1>
                                    {selectedGroup.name}
                                    {!selectedGroup.is_public && <span className="header-private-tag">PRIVATE</span>}
                                </h1>
                                <p className="group-header-desc">{selectedGroup.description} • {selectedGroup.member_count} Members</p>

                                {/* Music Vibe Section - INJECTED FOR DASHBOARD */}
                                <div className="group-music-section" style={{ marginTop: '15px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                                    {!musicVibe ? (
                                        <button onClick={handleGenerateMusic} disabled={analyzingMusic} style={{ background: 'linear-gradient(45deg, #1DB954, #191414)', border: 'none', color: 'white', padding: '10px 20px', borderRadius: '10px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', width: '100%', marginBottom: '10px', opacity: 0.9, transition: 'opacity 0.2s' }}>
                                            {analyzingMusic ? "Analyzing... 🎧" : "🎵 GET GROUP VIBE"}
                                        </button>
                                    ) : (
                                        <div className="music-vibe-display">
                                            <div style={{ marginBottom: '10px' }}>
                                                <span style={{ color: '#aaa', fontSize: '0.8rem' }}>VIBE CHECK:</span>
                                                <span style={{ marginLeft: '8px', color: '#1DB954', fontWeight: 'bold', textTransform: 'uppercase' }}>{musicVibe.vibe}</span>
                                            </div>
                                            <MusicPlayer track={musicVibe.anthem} />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="groups-scroll-area">
                            <InterventionList groupId={selectedGroup.id} isMember={true} />

                            <div className="create-post-simple">
                                <form onSubmit={handleCreatePost}>
                                    <textarea
                                        placeholder={`What's the tea in ${selectedGroup.name}?`}
                                        value={newPostContent}
                                        onChange={e => setNewPostContent(e.target.value)}
                                        rows="2"
                                    />
                                    <div className="create-post-actions">
                                        <button type="submit" className="post-btn-small">Publish Newsbite</button>
                                    </div>
                                </form>
                            </div>

                            <div className="newsbites-feed">
                                {posts.map((post, index) => (
                                    <div key={post.id} className="feed-post type-news_bite">
                                        <div className="post-header">
                                            <div className="post-user-info">
                                                <div className="post-pfp" style={{ backgroundImage: `url(${post.user?.profile_picture || ''})` }}></div>
                                                <div className="post-meta">
                                                    <span className="post-name">{post.user?.name}</span>
                                                    <span className="post-time">{new Date(post.created_at).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            {post.headline_generated && <span className="post-headline">{post.headline_generated}</span>}
                                        </div>
                                        <p className="post-text">{post.text_content}</p>
                                    </div>
                                ))}
                                {posts.length === 0 && <p style={{ textAlign: 'center', color: '#666', marginTop: '50px' }}>No newsbites yet. Be the first!</p>}
                            </div>
                        </div>
                    </>
                ) : (
                    <>
                        <div className="groups-main-header">
                            <div className="group-header-info">
                                <h1>Explore Groups</h1>
                                <p className="group-header-desc">Find your circle.</p>
                            </div>
                        </div>
                        <div className="groups-scroll-area">
                            <div className="explore-grid">
                                {publicGroups.map(g => (
                                    <div key={g.id} className="explore-card" onClick={() => handleJoinGroup(g)}>
                                        <div>
                                            <h3>{g.name}</h3>
                                            <p>{g.description}</p>
                                        </div>
                                        <div className="explore-card-footer">
                                            <span>{g.member_count} members</span>
                                            <span style={{ color: 'var(--color-green)' }}>Click to Join</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>

            <div className="groups-right-panel">
                {selectedGroup ? (
                    <>
                        <div className="right-panel-tabs">
                            <button
                                className={`panel-tab ${rightInfoTab === 'chat' ? 'active' : ''}`}
                                onClick={() => setRightInfoTab('chat')}
                            >
                                💬 CHAT
                            </button>
                            <button
                                className={`panel-tab ${rightInfoTab === 'games' ? 'active' : ''}`}
                                onClick={() => setRightInfoTab('games')}
                            >
                                🎮 ARCADE
                            </button>
                        </div>

                        <div className="right-panel-content">
                            {rightInfoTab === 'chat' ? (
                                <div className="chat-container">
                                    <div className="chat-header-status" style={{ padding: '5px 10px', fontSize: '0.75rem', color: '#666', borderBottom: '1px solid #333', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div className="chat-participants-list">
                                            {participants.map(p => (
                                                <span key={p.id} className="online-user-dot" title={p.username} style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: '#1DB954', marginRight: '5px' }}></span>
                                            ))}
                                            <span style={{ marginLeft: '5px' }}>{participants.length} Active</span>
                                        </div>
                                        <div className={`connection-status ${!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN ? 'offline' : 'online'}`} style={{ color: !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN ? 'orange' : '#1DB954' }}>
                                            {!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN ? 'Connecting... 🟠' : 'Live 🟢'}
                                        </div>
                                    </div>

                                    <div className="chat-messages-area" style={{ height: 'calc(100% - 90px)' }}>
                                        {chatMessages.length === 0 && <div style={{ textAlign: 'center', color: '#444', marginTop: '20px' }}>No messages yet.<br />Start the convo!</div>}
                                        {chatMessages.map(msg => (
                                            <div key={msg.id} className={`chat-bubble ${msg.user?.id === currentUser?.id ? 'mine' : 'theirs'}`}>
                                                <span className="chat-user">{msg.user?.username}</span>
                                                {msg.content}
                                            </div>
                                        ))}
                                    </div>
                                    <form className="chat-input-wrapper" onSubmit={handleSendChat}>
                                        <input
                                            type="text"
                                            placeholder="Message..."
                                            value={chatInput}
                                            onChange={e => setChatInput(e.target.value)}
                                        />
                                        <button type="submit" className="chat-send-btn">➤</button>
                                    </form>
                                </div>
                            ) : (
                                <div className="arcade-list">
                                    <div className="arcade-card" onClick={() => handleGameClick('Most Likely To')}>
                                        <div className="arcade-icon">🎭</div>
                                        <div className="arcade-info">
                                            <h4>Most Likely To</h4>
                                            <p>Vote on your friends.</p>
                                        </div>
                                    </div>
                                    <div className="arcade-card" onClick={() => handleGameClick('Skribbl')}>
                                        <div className="arcade-icon">✏️</div>
                                        <div className="arcade-info">
                                            <h4>Skribbl</h4>
                                            <p>Draw and guess.</p>
                                        </div>
                                    </div>
                                    <div className="arcade-card" onClick={() => handleGameClick('Cupid')}>
                                        <div className="arcade-icon">💘</div>
                                        <div className="arcade-info">
                                            <h4>Cupid</h4>
                                            <p>Ship your friends.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </>
                ) : (
                    <>
                        <div className="right-panel-tabs" style={{ opacity: 0.5, pointerEvents: 'none' }}>
                            <button className="panel-tab active">💬 CHAT</button>
                            <button className="panel-tab">🎮 ARCADE</button>
                        </div>
                        <div className="right-panel-placeholder" style={{ justifyContent: 'flex-start', paddingTop: '50px' }}>
                            <div style={{ fontSize: '3rem', marginBottom: '20px' }}>👈</div>
                            <h3>Join a Group</h3>
                            <p style={{ marginBottom: '20px' }}>Select a group from the left or join one to unlock Chat and Arcade games.</p>
                            <div className="arcade-list" style={{ opacity: 0.3, pointerEvents: 'none', width: '100%' }}>
                                <div className="arcade-card">
                                    <div className="arcade-icon">🎭</div>
                                    <div className="arcade-info"><h4>Most Likely To</h4></div>
                                </div>
                                <div className="arcade-card">
                                    <div className="arcade-icon">✏️</div>
                                    <div className="arcade-info"><h4>Skribbl</h4></div>
                                </div>
                                <div className="arcade-card">
                                    <div className="arcade-icon">💘</div>
                                    <div className="arcade-info"><h4>Cupid</h4></div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Create Group Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="create-post-modal">
                        <h3>Create New Group</h3>
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
                                rows="3"
                            />
                            <label className="checkbox-label" style={{ display: 'flex', gap: '10px', color: '#ccc', marginBottom: '15px' }}>
                                <input
                                    type="checkbox"
                                    checked={newGroupData.is_public}
                                    onChange={(e) => setNewGroupData({ ...newGroupData, is_public: e.target.checked })}
                                />
                                Public Group
                            </label>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                                <button type="submit">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Groups;
