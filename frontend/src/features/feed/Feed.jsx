import React, { useState } from 'react';
import './Feed.css';

const Feed = () => {
    // Dummy posts data with added 'gridClass' for Bento layout
    const [posts, setPosts] = useState([
        {
            id: 1,
            user: { name: 'Alex Chen', username: '@alexc', pfp: '' },
            type: 'casual',
            content: "Just submitted my final project! 🚀 Time to sleep for 3 days straight.",
            time: '2m ago',
            reactions: { goat: 5, clown: 0, redflag: 0, iconic: 2 },
            comments: 3,
            gridClass: '' // 1x1
        },
        {
            id: 4,
            user: { name: 'Mike Ross', username: '@miker', pfp: '' },
            type: 'meme',
            caption: "Me trying to debug my code at 3AM:",
            imageUrl: 'https://via.placeholder.com/600x600', // Square image for bento
            time: '3h ago',
            reactions: { goat: 20, clown: 2, redflag: 0, iconic: 5 },
            comments: 8,
            gridClass: 'span-row-2' // Tall
        },
        {
            id: 2,
            user: { name: 'Sarah Jenkins', username: '@sarahj', pfp: '' },
            type: 'roast',
            content: "If you think using light mode is a 'personality trait', please seek help immediately.",
            time: '15m ago',
            reactions: { goat: 12, clown: 1, redflag: 0, iconic: 8 },
            comments: 15,
            gridClass: ''
        },
        {
            id: 5,
            user: { name: 'Uni News Bot', username: '@uninews', pfp: '' },
            type: 'news-bite',
            content: "BREAKING: Library extends hours until 2AM for finals week! 📚🌙",
            time: '4h ago',
            reactions: { goat: 50, clown: 0, redflag: 0, iconic: 10 },
            comments: 42,
            gridClass: 'span-col-2' // Wide
        },
        {
            id: 3,
            user: { name: 'Campus Confessions', username: '@confess_bot', pfp: '' },
            type: 'confession',
            content: "I secretly love the dining hall pizza. Don't @ me.",
            time: '1h ago',
            reactions: { goat: 1, clown: 45, redflag: 12, iconic: 0 },
            comments: 20,
            gridClass: ''
        },
        {
            id: 6,
            user: { name: 'Jessica Lee', username: '@jesslee', pfp: '' },
            type: 'casual',
            content: "Anyone up for volleyball this weekend? 🏐",
            time: '5h ago',
            reactions: { goat: 3, clown: 0, redflag: 0, iconic: 0 },
            comments: 5,
            gridClass: ''
        },
        {
            id: 7,
            user: { name: 'David Kim', username: '@dkim', pfp: '' },
            type: 'meme',
            caption: "When the wifi drops during a zoom lecture:",
            imageUrl: 'https://via.placeholder.com/600x400',
            time: '6h ago',
            reactions: { goat: 15, clown: 5, redflag: 0, iconic: 2 },
            comments: 1,
            gridClass: 'span-col-2' // Wide meme
        },
        {
            id: 8,
            user: { name: 'Anon', username: '@anon', pfp: '' },
            type: 'roast',
            content: "People who stand in the middle of the hallway to text... why?",
            time: '7h ago',
            reactions: { goat: 30, clown: 0, redflag: 5, iconic: 0 },
            comments: 12,
            gridClass: ''
        }
    ]);

    const handleReaction = (postId, reactionType) => {
        console.log(`Reacted ${reactionType} to post ${postId}`);
    };

    return (
        <div className="feed-container">
            <h1 className="feed-title">NEWSROOM</h1>

            {/* Create Post Input */}
            <div className="create-post-bar">
                <div className="cp-input-fake">
                    <span className="cp-placeholder">What's the tea today? ☕</span>
                </div>
                <div className="cp-actions">
                    <button className="cp-action-btn">📷</button>
                    <button className="cp-action-btn">🎤</button>
                </div>
            </div>

            {/* Bento Grid Feed */}
            <div className="feed-grid">
                {posts.map(post => (
                    <div key={post.id} className={`feed-post type-${post.type} ${post.gridClass || ''}`}>
                        {/* Post Header */}
                        <div className="post-header">
                            <div className="post-user-info">
                                <div className="post-pfp"></div>
                                <div className="post-meta">
                                    <span className="post-name">{post.user.name}</span>
                                    <span className="post-username">{post.user.username}</span>
                                </div>
                            </div>
                            <div className="post-badges">
                                <span className={`type-badge badge-${post.type}`}>{post.type.replace('-', ' ').toUpperCase()}</span>
                                <span className="post-time">{post.time}</span>
                            </div>
                        </div>

                        {/* Post Content */}
                        <div className="post-content">
                            {post.type === 'meme' ? (
                                <div className="meme-content">
                                    <p className="post-text">{post.caption}</p>
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
                                <button className="reaction-btn goat" onClick={() => handleReaction(post.id, 'goat')}>
                                    <span className="react-icon">🐐</span>
                                    <span className="react-count">{post.reactions.goat}</span>
                                </button>
                                <button className="reaction-btn clown" onClick={() => handleReaction(post.id, 'clown')}>
                                    <span className="react-icon">🤡</span>
                                    <span className="react-count">{post.reactions.clown}</span>
                                </button>
                                <button className="reaction-btn redflag" onClick={() => handleReaction(post.id, 'redflag')}>
                                    <span className="react-icon">🚩</span>
                                    <span className="react-count">{post.reactions.redflag}</span>
                                </button>
                                <button className="reaction-btn iconic" onClick={() => handleReaction(post.id, 'iconic')}>
                                    <span className="react-icon">✨</span>
                                    <span className="react-count">{post.reactions.iconic}</span>
                                </button>
                            </div>

                            <div className="post-footer">
                                <button className="footer-btn">💬 {post.comments}</button>
                                <button className="footer-btn">↗</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Feed;
