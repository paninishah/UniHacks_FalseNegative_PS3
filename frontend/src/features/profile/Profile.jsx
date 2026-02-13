import React from 'react';
import { useNavigate } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
    const navigate = useNavigate();

    return (
        <div className="profile-container">
            {/* Banner Section */}
            <div className="profile-banner"></div>

            {/* Header Section (PFP, Info, Actions) */}
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

            {/* Content Tabs */}
            <div className="profile-tabs">
                <button className="tab-btn active">POSTS</button>
                <button className="tab-btn">TAGGED</button>
            </div>

            {/* Post Grid */}
            <div className="profile-grid">
                {[...Array(9)].map((_, index) => (
                    <div key={index} className="grid-item">
                        {/* Placeholder for post image */}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Profile;
