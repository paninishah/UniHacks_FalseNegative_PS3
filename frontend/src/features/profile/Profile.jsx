import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import fullLogo from '../../assets/icons/converse_full.svg';
import starIcon from '../../assets/icons/landing_star.svg';
import postIcon from '../../assets/icons/navbar/post.svg';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('text'); // 'text' | 'image'

    // Dummy data for posts
    const posts = [
        {
            id: 1,
            type: 'text',
            content: "Just thinking about how crazy this semester has been. Anyone else drowning in assignments? 📚 #studentlife",
            date: '2h ago'
        },
        {
            id: 2,
            type: 'image',
            imageUrl: 'https://via.placeholder.com/400',
            caption: "Found this cool spot on campus today! Definitely coming back to study here.",
            date: '5h ago'
        },
        {
            id: 3,
            type: 'text',
            content: "Reminder: Join the hackathon group if you haven't! We need a few more frontend devs.",
            date: '1d ago'
        },
        {
            id: 4,
            type: 'image',
            imageUrl: 'https://via.placeholder.com/400',
            caption: "Late night coding sessions be like... ☕💻",
            date: '2d ago'
        }
    ];

    return (
        <div className="profile-container">
            {/* Banner Section */}
            <div className="profile-banner"></div>

            {/* Header Section */}
            <div className="profile-header">
                <div className="profile-pfp-container">
                    <div className="profile-pfp"></div>
                </div>

                <div className="profile-info">
                    <div className="profile-names">
                        <h1 className="profile-name">USER NAME</h1>
                        <p className="profile-username">@username</p>
                    </div>

                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-value">120</span>
                            <span className="stat-label">POSTS</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">450</span>
                            <span className="stat-label">FOLLOWERS</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">300</span>
                            <span className="stat-label">FOLLOWING</span>
                        </div>
                    </div>

                    <div className="profile-bio">
                        <p>Just a cool person hanging out in the Converse universe. 🌟</p>
                    </div>

                    <div className="profile-actions">
                        <button className="action-btn edit-btn">EDIT PROFILE</button>
                        <button className="action-btn vault-btn" onClick={() => navigate('/vault')}>
                            OPEN VAULT 🔒
                        </button>
                    </div>
                </div>
            </div>

            {/* Tabs (Single active tab for now) */}
            <div className="profile-tabs">
                <button className="tab-btn active">POSTS</button>
            </div>

            {/* Posts List */}
            <div className="profile-posts-list">
                {posts.map((post) => (
                    <div key={post.id} className={`post-item post-type-${post.type}`}>
                        {post.type === 'image' ? (
                            <>
                                <div className="post-image-container">
                                    <div className="post-image-placeholder"></div>
                                </div>
                                <div className="post-content-container">
                                    <p className="post-caption">{post.caption}</p>
                                    <span className="post-date">{post.date}</span>
                                </div>
                            </>
                        ) : (
                            <div className="post-text-container">
                                <p className="post-text">{post.content}</p>
                                <span className="post-date">{post.date}</span>
                            </div>
                        )}
                        <div className="post-divider"></div>
                    </div>
                ))}
            </div>

            {/* Create Post FAB */}
            <button
                className="create-post-fab"
                onClick={() => setCreateModalOpen(true)}
            >
                <img src={postIcon} alt="Post" className="fab-icon-img" />
            </button>

            {/* Create Post Modal */}
            {isCreateModalOpen && (
                <div className="modal-overlay" onClick={() => setCreateModalOpen(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h2 className="modal-title">CREATE POST</h2>

                        <div className="cp-tabs">
                            <button
                                className={`cp-tab ${activeTab === 'text' ? 'active' : ''}`}
                                onClick={() => setActiveTab('text')}
                            >
                                TEXT
                            </button>
                            <button
                                className={`cp-tab ${activeTab === 'image' ? 'active' : ''}`}
                                onClick={() => setActiveTab('image')}
                            >
                                IMAGE
                            </button>
                        </div>

                        <div className="modal-body">
                            {activeTab === 'text' ? (
                                <textarea placeholder="What's on your mind?" className="cp-textarea"></textarea>
                            ) : (
                                <div className="cp-image-section">
                                    <input type="text" placeholder="PASTE IMAGE URL" className="cp-input" />
                                    <div className="cp-divider">
                                        <span>OR</span>
                                    </div>
                                    <label className="cp-file-upload">
                                        UPLOAD IMAGE
                                        <input type="file" hidden />
                                    </label>
                                    <textarea placeholder="Add a caption..." className="cp-textarea caption"></textarea>
                                </div>
                            )}

                            <div className="modal-actions">
                                <button className="modal-btn cancel" onClick={() => setCreateModalOpen(false)}>CANCEL</button>
                                <button className="modal-btn post">POST</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
