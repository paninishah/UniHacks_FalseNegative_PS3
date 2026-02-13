import React, { useState } from 'react';
import './Groups.css';
import gamesIcon from '../../assets/icons/navbar/games.svg';
import groupsIcon from '../../assets/icons/navbar/groups.svg'; // Using groups icon for chat as requested "groups.svg icon, in a purple box"

const Groups = () => {
    const [selectedGroup, setSelectedGroup] = useState('hackathon');
    const [isChatOpen, setChatOpen] = useState(false);
    const [isGamesOpen, setGamesOpen] = useState(false);

    const groups = [
        { id: 'hackathon', name: 'Hackathon Dream Team' },
        { id: 'dorm', name: 'Dorm 3B Crew' },
        { id: 'cs-class', name: 'CS 101 Study Group' }
    ];

    // Dummy posts for groups (Bento style)
    const posts = [
        {
            id: 1,
            user: { name: 'Sarah', username: '@sarahj' },
            type: 'news-bite',
            content: "WE WON THE HACKATHON GUYS!!! 🏆🎉",
            time: '1m ago',
            gridClass: 'span-row-2', // Tall announcement
            category: 'hackathon'
        },
        {
            id: 2,
            user: { name: 'Mike', username: '@miker' },
            type: 'meme',
            caption: "Live footage of us coding last night",
            imageUrl: 'https://via.placeholder.com/400',
            time: '20m ago',
            gridClass: '',
            category: 'hackathon'
        },
        {
            id: 3,
            user: { name: 'Alex', username: '@alexc' },
            type: 'casual',
            content: "Pizza is here! 🍕",
            time: '1h ago',
            gridClass: '',
            category: 'hackathon'
        },
        {
            id: 4,
            user: { name: 'Dorm Mom', username: '@jenny' },
            type: 'roast',
            content: "Whoever left their laundry in the dryer for 3 days... count your days.",
            time: '10m ago',
            gridClass: 'span-col-2',
            category: 'dorm'
        }
    ];

    const filteredPosts = posts.filter(p => p.category === selectedGroup || p.category === 'hackathon'); // Fallback for demo

    return (
        <div className="groups-container">
            {/* Header with Dropdown */}
            <div className="groups-header-bar">
                <div className="group-selector">
                    <label>CURRENT FEED:</label>
                    <select
                        value={selectedGroup}
                        onChange={(e) => setSelectedGroup(e.target.value)}
                        className="group-dropdown"
                    >
                        {groups.map(g => (
                            <option key={g.id} value={g.id}>{g.name.toUpperCase()}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Bento Feed */}
            <div className="groups-feed-grid">
                {filteredPosts.map(post => (
                    <div key={post.id} className={`group-post type-${post.type} ${post.gridClass || ''}`}>
                        <div className="post-header">
                            <span className="post-user">{post.user.name}</span>
                            <span className="post-time">{post.time}</span>
                        </div>
                        <div className="post-content">
                            {post.type === 'meme' ? (
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
                        <span>GROUP CHAT</span>
                        <button onClick={() => setChatOpen(false)}>×</button>
                    </div>
                    <div className="chat-body">
                        <div className="chat-message incoming">
                            <span className="msg-use">Alex:</span>
                            <span className="msg-text">Where are the designs?</span>
                        </div>
                        <div className="chat-message outgoing">
                            <span className="msg-text">Uploading now!</span>
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
                        <div className="game-item">Most Likely To</div>
                        <div className="game-item">Skribbl.io</div>
                        <div className="game-item">Trivia</div>
                    </div>
                </div>
            )}

            {/* FABs */}
            <div className="groups-fabs">
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

export default Groups;
