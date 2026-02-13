import React, { useState } from 'react';
import './Communities.css';
import gamesIcon from '../../assets/icons/navbar/games.svg';
import groupsIcon from '../../assets/icons/navbar/groups.svg'; // Using groups icon for chat 

const Communities = () => {
    const [selectedCommunity, setSelectedCommunity] = useState('popverse');
    const [isChatOpen, setChatOpen] = useState(false);
    const [isGamesOpen, setGamesOpen] = useState(false);

    const communities = [
        { id: 'popverse', name: 'PopVerse General' },
        { id: 'photography', name: 'Photography Club' },
        { id: 'gaming', name: 'Uni Gamers' },
        { id: 'confessions', name: 'Public Confessions' }
    ];

    // Dummy posts for communities
    const posts = [
        {
            id: 1,
            user: { name: 'Admin', username: '@admin' },
            type: 'news-bite',
            content: "Welcome to the PopVerse! 🌍 Connect with everyone here.",
            time: '2h ago',
            gridClass: 'span-col-2',
            category: 'popverse'
        },
        {
            id: 2,
            user: { name: 'Lens Queen', username: '@photo_girl' },
            type: 'image',
            caption: "Golden hour on the quad today. 📸",
            imageUrl: 'https://via.placeholder.com/500',
            time: '3h ago',
            gridClass: 'span-row-2',
            category: 'photography'
        },
        {
            id: 3,
            user: { name: 'PixelPush', username: '@gamer123' },
            type: 'meme',
            caption: "My GPU when I try to render 4k:",
            imageUrl: 'https://via.placeholder.com/400',
            time: '30m ago',
            gridClass: '',
            category: 'gaming'
        },
        {
            id: 4,
            user: { name: 'Anon', username: '@anon' },
            type: 'confession',
            content: "I actually like the 8am classes. Said no one ever.",
            time: '5m ago',
            gridClass: '',
            category: 'confessions'
        },
        {
            id: 5,
            user: { name: 'Campus Events', username: '@events' },
            type: 'casual',
            content: "Open Mic Night this Friday! 🎤 Don't miss out.",
            time: '1d ago',
            gridClass: 'span-col-2',
            category: 'popverse'
        }
    ];

    const filteredPosts = posts.filter(p => p.category === selectedCommunity || p.category === 'popverse');

    return (
        <div className="communities-container">
            {/* Header with Dropdown */}
            <div className="communities-header-bar">
                <div className="community-selector">
                    <label>COMMUNITY:</label>
                    <select
                        value={selectedCommunity}
                        onChange={(e) => setSelectedCommunity(e.target.value)}
                        className="community-dropdown"
                    >
                        {communities.map(c => (
                            <option key={c.id} value={c.id}>{c.name.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Bento Feed */}
            <div className="communities-feed-grid">
                {filteredPosts.map(post => (
                    <div key={post.id} className={`community-post type-${post.type || 'casual'} ${post.gridClass || ''}`}>
                        <div className="post-header">
                            <span className="post-user">{post.user.name}</span>
                            <span className="post-time">{post.time}</span>
                        </div>
                        <div className="post-content">
                            {post.type === 'meme' || post.type === 'image' ? (
                                <>
                                    <p>{post.caption}</p>
                                    <div className="post-img" style={{ backgroundImage: `url(${post.imageUrl})` }}></div>
                                </>
                            ) : (
                                <p className="post-text">{post.content}</p>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Chat Popup */}
            {isChatOpen && (
                <div className="chat-popup">
                    <div className="chat-header">
                        <span>COMMUNITY CHAT</span>
                        <button onClick={() => setChatOpen(false)}>×</button>
                    </div>
                    <div className="chat-body">
                        <div className="chat-message incoming">
                            <span className="msg-use">NewUser:</span>
                            <span className="msg-text">Is this the official chat?</span>
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
                        <div className="game-item">Community Trivia</div>
                        <div className="game-item">Leaderboard</div>
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
