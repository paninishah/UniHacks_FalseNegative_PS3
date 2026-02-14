import React, { useState, useEffect } from 'react';
import './Feed.css';
import client from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import feedAPI from '../../services/feedAPI';
import CreatePostModal from './CreatePostModal';
import CommentsModal from './CommentsModal';
import AddToVaultModal from '../vault/AddToVaultModal';

const Feed = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [activeCommentPostId, setActiveCommentPostId] = useState(null);
    const [vaultPostId, setVaultPostId] = useState(null);

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);

        if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `${diffInHours}h ago`;
        const diffInDays = Math.floor(diffInHours / 24);
        return `${diffInDays}d ago`;
    };

    const fetchFeed = async () => {
        setLoading(true);
        try {
            const data = await feedAPI.getFeed();
            const mappedPosts = data.map((post, index) => {
                const pfp = post.user?.profile_picture_url || post.user?.profile_picture || (post.user?.email ? `https://ui-avatars.com/api/?name=${post.user.name}&background=random` : '');

                return {
                    id: post.id,
                    user: {
                        name: post.user.name,
                        username: `@${post.user.username}`,
                        pfp: pfp
                    },
                    type: post.category, // Backend category matches frontend type mostly
                    content: post.text_content,
                    caption: post.caption,
                    headline: post.headline_generated,
                    imageUrl: post.image_url || post.image,
                    time: formatTimeAgo(post.created_at),
                    reactions: post.reactions,
                    comments: post.comments_count,
                    gridClass: index % 5 === 0 ? 'span-col-2' : '' // Simple grid logic for now
                };
            });
            setPosts(mappedPosts);
        } catch (error) {
            console.error("Failed to fetch feed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFeed();
    }, []);

    const handleReaction = async (postId, reactionType) => {
        try {
            await feedAPI.reactToPost(postId, reactionType);
            // Optimistic update or refetch? Refetch for accuracy for now.
            fetchFeed();
        } catch (error) {
            console.error("Failed to react", error);
        }
    };

    if (loading) return <div className="loading-screen">LOADING FEED...</div>;

    return (
        <div className="feed-container">
            <h1 className="feed-title">NEWSROOM</h1>

            {/* Create Post Input */}
            <div className="create-post-bar" onClick={() => setCreateModalOpen(true)}>
                <div className="cp-input-fake">
                    <span className="cp-placeholder">What's the tea today? ☕</span>
                </div>
                <div className="cp-actions">
                    <button className="cp-action-btn">📷</button>
                    <button className="cp-action-btn">🎤</button>
                </div>
            </div>

            {/* Create Post Modal */}
            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={() => {
                    fetchFeed();
                }}
            />

            {/* Bento Grid Feed */}
            <div className="feed-grid">
                {posts.map(post => (
                    <div key={post.id} className={`feed-post type-${post.type} ${post.gridClass || ''}`}>
                        {/* Post Header */}
                        <div className="post-header">
                            <div className="post-user-info">
                                <div className="post-pfp" style={{ backgroundImage: `url(${post.user.pfp})` }}></div>
                                <div className="post-meta">
                                    <span className="post-name">{post.user.name}</span>
                                    <span className="post-username">{post.user.username}</span>
                                </div>
                            </div>
                            <div className="post-badges">
                                <span className={`type-badge badge-${post.type}`}>{post.type.replace('_', ' ').toUpperCase()}</span>
                                <span className="post-time">{post.time}</span>
                            </div>
                        </div>

                        {/* Post Content */}
                        <div className="post-content">
                            {post.headline && <h3 className="post-headline">{post.headline}</h3>}
                            {(post.type === 'meme' || post.imageUrl) ? (
                                <div className="meme-content">
                                    <p className="post-text">{post.caption || post.content}</p>
                                    <div className="post-image-wrapper">
                                        <div className="post-image-placeholder" style={{ backgroundImage: `url(${post.imageUrl})`, backgroundSize: 'cover' }}></div>
                                    </div>
                                </div>
                            ) : (
                                <p className="post-text">{post.content}</p>
                            )}
                        </div>

                        {/* Actions & Footer pushed to bottom */}
                        <div className="post-bottom">
                            <div className="post-actions">
                                <button className="reaction-btn goat" onClick={() => handleReaction(post.id, 'GOAT')}>
                                    <span className="react-icon">🐐</span>
                                    <span className="react-count">{post.reactions.goat}</span>
                                </button>
                                <button className="reaction-btn clown" onClick={() => handleReaction(post.id, 'clown')}>
                                    <span className="react-icon">🤡</span>
                                    <span className="react-count">{post.reactions.clown}</span>
                                </button>
                                <button className="reaction-btn redflag" onClick={() => handleReaction(post.id, 'red_flag')}>
                                    <span className="react-icon">🚩</span>
                                    <span className="react-count">{post.reactions.redflag}</span>
                                </button>
                                <button className="reaction-btn iconic" onClick={() => handleReaction(post.id, 'iconic')}>
                                    <span className="react-icon">✨</span>
                                    <span className="react-count">{post.reactions.iconic}</span>
                                </button>
                            </div>

                            <div className="post-footer">
                                <button className="footer-btn" onClick={() => setActiveCommentPostId(post.id)}>💬 {post.comments}</button>
                                <button className="footer-btn" onClick={() => setVaultPostId(post.id)}>💾 SAVE</button>
                                <button className="footer-btn">↗</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            {/* Comments Modal */}
            <CommentsModal
                isOpen={!!activeCommentPostId}
                onClose={() => setActiveCommentPostId(null)}
                postId={activeCommentPostId}
            />

            {/* Add to Vault Modal */}
            <AddToVaultModal
                isOpen={!!vaultPostId}
                onClose={() => setVaultPostId(null)}
                postId={vaultPostId}
            />
        </div>
    );
};

export default Feed;
