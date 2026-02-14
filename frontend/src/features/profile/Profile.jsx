import authAPI from '../../services/authAPI';
import feedAPI from '../../services/feedAPI';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Profile.css';

const Profile = () => {
    const { userId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const isOwnProfile = !userId || (user && user.id === parseInt(userId));

    const [profileUser, setProfileUser] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);

    // Edit Profile state
    const [isEditOpen, setEditOpen] = useState(false);
    const [editName, setEditName] = useState('');
    const [editBio, setEditBio] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                let data;
                if (isOwnProfile) {
                    data = await authAPI.getProfile();
                } else {
                    data = await authAPI.getPublicProfile(userId);
                }
                setProfileUser(data);
                setIsFollowing(data.is_following);

                const userPosts = await feedAPI.getUserPosts(isOwnProfile ? user.id : userId);
                setPosts(Array.isArray(userPosts) ? userPosts : []);
            } catch (error) {
                console.error("Failed to fetch profile", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProfileData();
    }, [userId, isOwnProfile]);

    const handleFollow = async () => {
        if (!profileUser) return;
        try {
            if (isFollowing) {
                await authAPI.unfollowUser(profileUser.id);
            } else {
                await authAPI.followUser(profileUser.id);
            }
            setIsFollowing(!isFollowing);
            setProfileUser(prev => ({
                ...prev,
                followers_count: isFollowing ? prev.followers_count - 1 : prev.followers_count + 1
            }));
        } catch (error) {
            console.error("Follow action failed", error);
        }
    };

    const openEditModal = () => {
        setEditName(profileUser?.name || profileUser?.username || '');
        setEditBio(profileUser?.bio || '');
        setEditOpen(true);
    };

    const handleSaveProfile = async () => {
        setSaving(true);
        try {
            const updated = await authAPI.updateProfile({ name: editName, bio: editBio });
            setProfileUser(prev => ({ ...prev, ...updated }));
            setEditOpen(false);
        } catch (error) {
            console.error("Save profile failed", error);
            alert("Could not save profile. Try again.");
        } finally {
            setSaving(false);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        const d = new Date(dateStr);
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const getCategoryBadge = (category) => {
        const map = {
            meme: { label: 'MEME', color: '#00ff88' },
            roast: { label: 'ROAST', color: '#ff4444' },
            confession: { label: 'CONFESSION', color: '#a18cd1' },
            joke: { label: 'JOKE', color: '#FFD700' },
            inside_joke: { label: 'INSIDE JOKE', color: '#ff8800' },
            casual: { label: 'CASUAL', color: '#888' },
            news_bite: { label: 'NEWS BITE', color: '#00cbff' },
        };
        return map[category] || { label: category?.toUpperCase() || '', color: '#888' };
    };

    if (loading) return <div className="loading-screen">LOADING...</div>;
    if (!profileUser && isOwnProfile) return <div className="error-screen">FAILED TO LOAD PROFILE</div>;

    const displayUser = profileUser || { username: 'Unknown', name: 'Unknown' };

    return (
        <div className="profile-container">
            {/* Banner Section */}
            <div className="profile-banner"></div>

            {/* Header Section */}
            <div className="profile-header">
                <div className="profile-pfp-container">
                    <div className="profile-pfp" style={{ backgroundImage: `url(${displayUser.profile_picture || ''})` }}></div>
                </div>

                <div className="profile-info">
                    <div className="profile-names">
                        <h1 className="profile-name">{displayUser.name || displayUser.username}</h1>
                        <p className="profile-username">@{displayUser.username}</p>
                    </div>

                    <div className="profile-stats">
                        <div className="stat-item">
                            <span className="stat-value">{displayUser.posts_count || posts.length || 0}</span>
                            <span className="stat-label">POSTS</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{displayUser.followers_count || 0}</span>
                            <span className="stat-label">FOLLOWERS</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-value">{displayUser.following_count || 0}</span>
                            <span className="stat-label">FOLLOWING</span>
                        </div>
                    </div>

                    <div className="profile-bio">
                        <p>{displayUser.bio || "No bio yet."}</p>
                    </div>

                    <div className="profile-actions">
                        {isOwnProfile ? (
                            <>
                                <button className="action-btn edit-btn" onClick={openEditModal}>EDIT PROFILE</button>
                                <button className="action-btn vault-btn" onClick={() => navigate('/vault')}>
                                    OPEN VAULT 🔒
                                </button>
                            </>
                        ) : (
                            <button className="action-btn follow-btn" onClick={handleFollow}>
                                {isFollowing ? 'UNFOLLOW' : 'FOLLOW'}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="profile-tabs">
                <button className="tab-btn active">POSTS</button>
            </div>

            {/* Posts List — Tumblr-style rows */}
            <div className="profile-posts-list">
                {posts.length > 0 ? posts.map((post) => {
                    const isImage = post.post_type === 'image' && post.image;
                    const badge = getCategoryBadge(post.category);

                    return (
                        <div key={post.id} className={`profile-post-row ${isImage ? 'image-row' : 'text-row'}`}>
                            {isImage ? (
                                <>
                                    <div className="post-img-side">
                                        <img src={post.image} alt="Post" className="post-full-image" />
                                    </div>
                                    <div className="post-caption-side">
                                        <span className="post-category-badge" style={{ color: badge.color, borderColor: badge.color }}>
                                            {badge.label}
                                        </span>
                                        <p className="post-caption-text">{post.caption || post.text_content || ''}</p>
                                        <div className="post-meta-row">
                                            <span className="post-date">{formatDate(post.created_at)}</span>
                                            {post.reactions && (
                                                <span className="post-reactions-mini">
                                                    {post.reactions.goat > 0 && `🐐${post.reactions.goat} `}
                                                    {post.reactions.iconic > 0 && `✨${post.reactions.iconic} `}
                                                    {post.reactions.clown > 0 && `🤡${post.reactions.clown}`}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="post-text-full">
                                    <span className="post-category-badge" style={{ color: badge.color, borderColor: badge.color }}>
                                        {badge.label}
                                    </span>
                                    <p className="post-body">{post.text_content || ''}</p>
                                    {post.headline_generated && (
                                        <p className="post-headline">{post.headline_generated}</p>
                                    )}
                                    <div className="post-meta-row">
                                        <span className="post-date">{formatDate(post.created_at)}</span>
                                        {post.reactions && (
                                            <span className="post-reactions-mini">
                                                {post.reactions.goat > 0 && `🐐${post.reactions.goat} `}
                                                {post.reactions.iconic > 0 && `✨${post.reactions.iconic} `}
                                                {post.reactions.clown > 0 && `🤡${post.reactions.clown}`}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                }) : (
                    <div className="no-posts">NO POSTS YET</div>
                )}
            </div>

            {/* Edit Profile Modal */}
            {isEditOpen && (
                <div className="modal-overlay" onClick={() => setEditOpen(false)}>
                    <div className="edit-modal" onClick={(e) => e.stopPropagation()}>
                        <h2 className="edit-modal-title">EDIT PROFILE</h2>
                        <div className="edit-field">
                            <label>Display Name</label>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                placeholder="Your display name"
                                className="edit-input"
                            />
                        </div>
                        <div className="edit-field">
                            <label>Bio</label>
                            <textarea
                                value={editBio}
                                onChange={(e) => setEditBio(e.target.value)}
                                placeholder="Tell people about yourself..."
                                className="edit-textarea"
                                rows={4}
                            />
                        </div>
                        <div className="edit-actions">
                            <button className="modal-btn cancel" onClick={() => setEditOpen(false)}>CANCEL</button>
                            <button className="modal-btn save" onClick={handleSaveProfile} disabled={saving}>
                                {saving ? 'SAVING...' : 'SAVE'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Profile;
