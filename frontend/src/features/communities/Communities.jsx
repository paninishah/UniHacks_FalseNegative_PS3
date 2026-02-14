import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Communities.css';
import api from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import gamesIcon from '../../assets/icons/navbar/games.svg';
import groupsIcon from '../../assets/icons/navbar/groups.svg';

const Communities = () => {
    const navigate = useNavigate();
    const [selectedCommunity, setSelectedCommunity] = useState(null);
    const [communities, setCommunities] = useState([]);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isChatOpen, setChatOpen] = useState(false);
    const [isGamesOpen, setGamesOpen] = useState(false);

    // Create Community State
    const [isCreateCommunityModalOpen, setCreateCommunityModalOpen] = useState(false);
    const [newCommunityName, setNewCommunityName] = useState('');
    const [newCommunityDesc, setNewCommunityDesc] = useState('');

    // Post creation state
    const [isPostModalOpen, setPostModalOpen] = useState(false);
    const [newPostContent, setNewPostContent] = useState('');
    const [newPostTitle, setNewPostTitle] = useState('');
    const [newPostType, setNewPostType] = useState('casual');

    useEffect(() => {
        fetchCommunities();
    }, []);

    useEffect(() => {
        if (selectedCommunity) {
            fetchPosts(selectedCommunity.id);
        }
    }, [selectedCommunity]);

    const fetchCommunities = async () => {
        try {
            const response = await api.get(ENDPOINTS.COMMUNITIES.LIST);
            setCommunities(response.data);
            if (response.data.length > 0 && !selectedCommunity) {
                setSelectedCommunity(response.data[0]);
            }
        } catch (error) {
            console.error("Error fetching communities:", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPosts = async (communityId) => {
        try {
            const response = await api.get(ENDPOINTS.COMMUNITIES.POSTS(communityId));
            setPosts(response.data);
        } catch (error) {
            console.error("Error fetching community posts:", error);
        }
    };

    const handleCreateCommunity = async (e) => {
        e.preventDefault();
        try {
            await api.post(ENDPOINTS.COMMUNITIES.CREATE, {
                name: newCommunityName,
                description: newCommunityDesc
            });
            setCreateCommunityModalOpen(false);
            setNewCommunityName('');
            setNewCommunityDesc('');
            fetchCommunities(); // Refresh list
        } catch (error) {
            console.error("Error creating community:", error);
            alert("Failed to create community. Name might be taken.");
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim() || !selectedCommunity) return;

        try {
            await api.post(ENDPOINTS.COMMUNITIES.POSTS(selectedCommunity.id), {
                title: newPostTitle,
                content: newPostContent,
                post_type: newPostType
            });
            setPostModalOpen(false);
            setNewPostContent('');
            setNewPostTitle('');
            fetchPosts(selectedCommunity.id);
        } catch (error) {
            console.error("Error creating post:", error);
        }
    };

    const handleJoinCommunity = async () => {
        if (!selectedCommunity) return;
        try {
            await api.post(ENDPOINTS.COMMUNITIES.JOIN(selectedCommunity.id));
            fetchCommunities(); // Refresh to update is_member status
            // Optimistic update
            setSelectedCommunity(prev => ({ ...prev, is_member: true, member_count: prev.member_count + 1 }));
        } catch (error) {
            console.error("Error joining community:", error);
            alert("Failed to join community.");
        }
    };

    const handleLeaveCommunity = async () => {
        if (!selectedCommunity) return;
        if (!window.confirm(`Are you sure you want to leave #${selectedCommunity.name}?`)) return;
        try {
            await api.post(ENDPOINTS.COMMUNITIES.LEAVE(selectedCommunity.id));
            fetchCommunities(); // Refresh
            // Optimistic update
            setSelectedCommunity(prev => ({ ...prev, is_member: false, member_count: prev.member_count - 1 }));
        } catch (error) {
            console.error("Error leaving community:", error);
            alert("Failed to leave community.");
        }
    };

    if (loading) return <div className="loading-spinner">Loading communities...</div>;

    return (
        <div className="communities-layout">
            {/* LEFT SIDEBAR - REDDIT STYLE */}
            <div className="communities-sidebar">
                <div className="sidebar-header">
                    <h2>COMMUNITIES</h2>
                    <button className="create-community-btn" onClick={() => setCreateCommunityModalOpen(true)}>
                        +
                    </button>
                </div>
                <div className="community-list">
                    {communities.map(c => (
                        <div
                            key={c.id}
                            className={`community-item ${selectedCommunity?.id === c.id ? 'active' : ''}`}
                            onClick={() => setSelectedCommunity(c)}
                        >
                            <span className="community-icon">#</span>
                            <span className="community-name">{c.name}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="communities-main">
                {selectedCommunity ? (
                    <>
                        <div className="community-header-banner" style={{ backgroundImage: `url(${selectedCommunity.banner || ''})` }}>
                            <div className="banner-content">
                                <h1>#{selectedCommunity.name}</h1>
                                <p>{selectedCommunity.description}</p>
                                <p className="member-count">{selectedCommunity.member_count} Members</p>
                            </div>
                            <div className="banner-actions">
                                {selectedCommunity.is_member ? (
                                    <button className="leave-btn" onClick={handleLeaveCommunity}>Joined</button>
                                ) : (
                                    <button className="join-btn" onClick={handleJoinCommunity}>Join</button>
                                )}
                                <button className="create-post-btn-header" onClick={() => setPostModalOpen(true)}>
                                    + POST
                                </button>
                            </div>
                        </div>

                        <div className="communities-feed-grid">
                            {posts.length === 0 ? (
                                <div className="no-posts">
                                    <p>No posts yet in #{selectedCommunity.name}. Be the first!</p>
                                </div>
                            ) : (
                                posts.map((post, index) => (
                                    <div key={post.id} className={`community-post type-${post.post_type || 'casual'} ${index % 5 === 0 ? 'span-col-2' : ''}`}>
                                        <div className="post-header">
                                            <span className="post-user">{post.user?.name || post.user?.username}</span>
                                            <span className="post-time">{new Date(post.created_at).toLocaleString()}</span>
                                        </div>
                                        <div className="post-content">
                                            {post.title && <h3 className="post-title">{post.title}</h3>}
                                            {post.image ? (
                                                <>
                                                    <p>{post.content}</p>
                                                    <div className="post-img" style={{ backgroundImage: `url(${post.image})` }}></div>
                                                </>
                                            ) : (
                                                <p className="post-text">{post.content}</p>
                                            )}
                                        </div>
                                        <div className="post-type-badge">{post.post_type}</div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                ) : (
                    <div className="select-community-prompt">
                        <p>Select a community to view posts</p>
                    </div>
                )}
            </div>

            {/* Create Post Modal */}
            {isPostModalOpen && (
                <div className="modal-overlay">
                    <div className="create-post-modal">
                        <h3>Post to #{selectedCommunity?.name}</h3>
                        <form onSubmit={handleCreatePost}>
                            <input
                                type="text"
                                placeholder="Title (optional)"
                                value={newPostTitle}
                                onChange={(e) => setNewPostTitle(e.target.value)}
                            />
                            <textarea
                                placeholder="What's strictly confidental? (jk)"
                                value={newPostContent}
                                onChange={(e) => setNewPostContent(e.target.value)}
                                rows="4"
                            />
                            <select value={newPostType} onChange={(e) => setNewPostType(e.target.value)}>
                                <option value="casual">Casual</option>
                                <option value="meme">Meme</option>
                                <option value="roast">Roast</option>
                                <option value="confession">Confession</option>
                                <option value="news_bite">News Bite</option>
                            </select>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setPostModalOpen(false)}>Cancel</button>
                                <button type="submit">Post</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Community Modal */}
            {isCreateCommunityModalOpen && (
                <div className="modal-overlay">
                    <div className="create-post-modal">
                        <h3>Create a Community</h3>
                        <form onSubmit={handleCreateCommunity}>
                            <input
                                type="text"
                                placeholder="Community Name (e.g. Gamers)"
                                value={newCommunityName}
                                onChange={(e) => setNewCommunityName(e.target.value)}
                                required
                            />
                            <textarea
                                placeholder="Description"
                                value={newCommunityDesc}
                                onChange={(e) => setNewCommunityDesc(e.target.value)}
                                rows="3"
                            />
                            <div className="modal-actions">
                                <button type="button" onClick={() => setCreateCommunityModalOpen(false)}>Cancel</button>
                                <button type="submit">Create</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Chat Popup */}
            {isChatOpen && (
                <div className="chat-popup">
                    <div className="chat-header">
                        <span>COMMUNITY CHAT</span>
                        <button onClick={() => setChatOpen(false)}>×</button>
                    </div>
                    <div className="chat-body">
                        <div className="chat-message incoming">
                            <span className="msg-use">System:</span>
                            <span className="msg-text">Welcome to {selectedCommunity?.name} chat!</span>
                        </div>
                    </div>
                    <div className="chat-input">
                        <input type="text" placeholder="Type a message..." />
                    </div>
                </div>
            )}

            {/* Games Popup */}
            {isGamesOpen && (
                <div className="games-popup">
                    <div className="games-header">
                        <span>ARCADE</span>
                        <button onClick={() => setGamesOpen(false)}>×</button>
                    </div>
                    <div className="games-list">
                        {[{ label: 'Most Likely To', type: 'most_likely_to', icon: '🎯' }, { label: 'Skribbl', type: 'skribbl', icon: '🎨' }, { label: 'Cupid', type: 'cupid', icon: '💘' }].map(g => (
                            <div key={g.type} className="game-item" onClick={async () => {
                                if (!selectedCommunity) { alert('Select a community first'); return; }
                                try {
                                    const payload = { game_type: g.type };
                                    if (g.type === 'skribbl') {
                                        const words = ['Bicycle', 'Pizza', 'Sunset', 'Robot', 'Penguin', 'Guitar'];
                                        payload.secret_word = words[Math.floor(Math.random() * words.length)];
                                    }
                                    const res = await api.post(ENDPOINTS.GAMES.START(selectedCommunity.id), payload);
                                    navigate(`/games/${g.type}/${res.data.game_id}`);
                                } catch (e) {
                                    console.error('Failed to start game:', e);
                                    alert('Could not start game. Try again.');
                                }
                            }}>
                                <span style={{ marginRight: '8px' }}>{g.icon}</span>{g.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* FABs */}
            <div className="communities-fabs">
                {/* Games FAB (Yellow) */}
                <button
                    className="fab-games"
                    onClick={() => setGamesOpen(!isGamesOpen)}
                >
                    <img src={gamesIcon} alt="Games" />
                </button>

                {/* Chat FAB (Purple) */}
                <button
                    className="fab-chat"
                    onClick={() => setChatOpen(!isChatOpen)}
                >
                    <img src={groupsIcon} alt="Chat" />
                </button>
            </div>
        </div>
    );
};

export default Communities;
