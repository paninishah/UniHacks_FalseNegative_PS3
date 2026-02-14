import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import { ENDPOINTS } from '../../api/endpoints';
import './Groups.css';

const GroupDetails = () => {
    const { groupId } = useParams();
    const navigate = useNavigate();
    const [group, setGroup] = useState(null);
    const [loading, setLoading] = useState(true);
    const [joining, setJoining] = useState(false);

    // Feed state
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [posting, setPosting] = useState(false);

    useEffect(() => {
        if (groupId) {
            fetchGroupData();
        }
    }, [groupId]);

    const fetchGroupData = async () => {
        setLoading(true);
        try {
            const groupRes = await api.get(ENDPOINTS.GROUPS.DETAILS(groupId));
            setGroup(groupRes.data);

            if (groupRes.data.is_member) {
                const postsRes = await api.get(ENDPOINTS.SOCIAL.GROUP_FEED(groupId));
                setPosts(postsRes.data);
            }
        } catch (error) {
            console.error("Error fetching group data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleJoinLeave = async () => {
        if (!group) return;
        setJoining(true);
        try {
            if (group.is_member) {
                await api.post(ENDPOINTS.GROUPS.LEAVE(groupId));
                setGroup(prev => ({ ...prev, is_member: false, member_count: prev.member_count - 1 }));
                setPosts([]); // Clear posts on leave
            } else {
                await api.post(ENDPOINTS.GROUPS.JOIN(groupId));
                setGroup(prev => ({ ...prev, is_member: true, member_count: prev.member_count + 1 }));
                // Fetch posts after joining
                const postsRes = await api.get(ENDPOINTS.SOCIAL.GROUP_FEED(groupId));
                setPosts(postsRes.data);
            }
        } catch (error) {
            console.error("Error joining/leaving group:", error);
        } finally {
            setJoining(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim()) return;

        setPosting(true);
        try {
            const postData = {
                text_content: newPostContent,
                group: groupId
            };
            await api.post(ENDPOINTS.SOCIAL.CREATE, postData);
            setNewPostContent('');
            // Refresh feed
            const postsRes = await api.get(ENDPOINTS.SOCIAL.GROUP_FEED(groupId));
            setPosts(postsRes.data);
        } catch (error) {
            console.error("Error creating post:", error);
        } finally {
            setPosting(false);
        }
    };

    // Chat state
    const [isChatOpen, setChatOpen] = useState(false);
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [chatLoading, setChatLoading] = useState(false);

    useEffect(() => {
        let interval;
        if (isChatOpen && groupId) {
            fetchChatMessages();
            interval = setInterval(fetchChatMessages, 5000); // Poll every 5s
        }
        return () => clearInterval(interval);
    }, [isChatOpen, groupId]);

    const fetchChatMessages = async () => {
        try {
            const response = await api.get(ENDPOINTS.GROUPS.MESSAGES(groupId));
            setChatMessages(response.data);
        } catch (error) {
            console.error("Error fetching chat messages:", error);
        }
    };

    const handleSendChat = async (e) => {
        e.preventDefault();
        if (!chatInput.trim()) return;

        try {
            await api.post(ENDPOINTS.GROUPS.MESSAGES(groupId), { content: chatInput });
            setChatInput('');
            fetchChatMessages();
        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    if (loading) return <div className="loading-spinner">Loading group...</div>;
    if (!group) return <div className="error-msg">Group not found.</div>;

    return (
        <div className="groups-container">
            <div className="group-details-header">
                <button className="back-btn" onClick={() => navigate('/groups')}>
                    ← Back
                </button>
                <div className="group-info">
                    <h1>{group.name}</h1>
                    <p>{group.description}</p>
                    <div className="group-stats">
                        <span>{group.member_count} Members</span>
                        <span>•</span>
                        <span>{group.is_public ? "Public Group" : "Private Group"}</span>
                    </div>
                    <button
                        className={`join-btn ${group.is_member ? 'active' : ''}`}
                        onClick={handleJoinLeave}
                        disabled={joining}
                    >
                        {joining ? "Processing..." : (group.is_member ? "LEAVE GROUP" : "JOIN GROUP")}
                    </button>
                    {group.is_member && (
                        <button
                            className="chat-btn"
                            onClick={() => setChatOpen(!isChatOpen)}
                            style={{ marginLeft: '10px', backgroundColor: '#ffd700', color: 'black' }}
                        >
                            {isChatOpen ? 'CLOSE CHAT' : 'OPEN CHAT'}
                        </button>
                    )}
                </div>
            </div>

            <div className="group-content-area">
                {group.is_member ? (
                    <div className="group-feed">
                        {/* Feed UI */}
                        <div className="create-post-card">
                            <form onSubmit={handleCreatePost}>
                                <textarea
                                    placeholder={`What's on your mind for ${group.name}?`}
                                    value={newPostContent}
                                    onChange={(e) => setNewPostContent(e.target.value)}
                                    rows="3"
                                />
                                <div className="post-actions">
                                    <button type="submit" disabled={posting || !newPostContent.trim()}>
                                        {posting ? 'Posting...' : 'Post'}
                                    </button>
                                </div>
                            </form>
                        </div>

                        <div className="posts-list">
                            {posts.length === 0 ? (
                                <p className="no-posts">No posts yet. Be the first!</p>
                            ) : (
                                posts.map(post => (
                                    <div key={post.id} className="post-card">
                                        <div className="post-header">
                                            <span className="post-author">{post.user?.name || post.user?.username || 'Unknown User'}</span>
                                            <span className="post-time">{new Date(post.created_at).toLocaleString()}</span>
                                        </div>
                                        <div className="post-body">
                                            {post.headline_generated && <h3>{post.headline_generated}</h3>}
                                            <p>{post.text_content}</p>
                                        </div>
                                        <div className="post-footer">
                                            <span>{post.reactions ? Object.values(post.reactions).reduce((a, b) => a + b, 0) : 0} Reactions</span>
                                            <span>{post.comments_count || 0} Comments</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                ) : (
                    <div className="locked-content">
                        <p>Join this group to see posts and interact with members.</p>
                    </div>
                )}
            </div>

            {/* Chat Drawer */}
            {isChatOpen && (
                <div className="chat-drawer">
                    <div className="chat-header">
                        <h3>{group.name} Chat</h3>
                        <button onClick={() => setChatOpen(false)}>×</button>
                    </div>
                    <div className="chat-messages">
                        {chatMessages.length === 0 ? (
                            <p className="no-messages">No messages yet.</p>
                        ) : (
                            chatMessages.map(msg => (
                                <div key={msg.id} className="chat-msg">
                                    <strong>{msg.user?.name || msg.user?.username}: </strong>
                                    <span>{msg.content}</span>
                                </div>
                            ))
                        )}
                    </div>
                    <form className="chat-input-area" onSubmit={handleSendChat}>
                        <input
                            type="text"
                            placeholder="Type a message..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                        />
                        <button type="submit">Send</button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default GroupDetails;
