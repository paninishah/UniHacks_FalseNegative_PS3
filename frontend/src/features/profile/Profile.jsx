import authAPI from '../../services/authAPI';
import feedAPI from '../../services/feedAPI';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import CreatePostModal from '../feed/CreatePostModal';
import postIcon from '../../assets/icons/fab_post.svg';
import './Profile.css';

const Profile = () => {
    const { userId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();
    const isOwnProfile = !userId || (user && user.id === parseInt(userId));

    const [profileUser, setProfileUser] = useState(null);
    const [isFollowing, setIsFollowing] = useState(false);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState([]);

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

                // Fetch user posts
                const userPosts = await feedAPI.getUserPosts(isOwnProfile ? user.id : userId);
                setPosts(userPosts);
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
            // Verify if we need to update followers count locally
            setProfileUser(prev => ({
                ...prev,
                followers_count: isFollowing ? prev.followers_count - 1 : prev.followers_count + 1
            }));
        } catch (error) {
            console.error("Follow action failed", error);
        }
    };

    if (loading) return <div className="loading-screen">LOADING...</div>;
    if (!profileUser && isOwnProfile) return <div className="error-screen">FAILED TO LOAD PROFILE</div>;

    // Fallback for profileUser if other user fetch not implemented yet
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
                            <span className="stat-value">{displayUser.posts_count || 0}</span>
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
                                <button className="action-btn edit-btn">EDIT PROFILE</button>
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

            {/* Tabs (Single active tab for now) */}
            <div className="profile-tabs">
                <button className="tab-btn active">POSTS</button>
            </div>

            {/* Posts List */}
            <div className="profile-posts-list">
                {posts.length > 0 ? posts.map((post) => (
                    <div key={post.id} className={`post-item post-type-${post.type}`}>
                        {/* Existing Post Rendering Logic - keeping it for now until we have real data structure */}
                        {post.type === 'image' ? (
                            <>
                                <div className="post-image-container">
                                    {post.imageUrl && <img src={post.imageUrl} alt="Post" className="post-image" />}
                                </div>
                                <div className="post-content-container">
                                    <p className="post-caption">{post.caption}</p>
                                    <span className="post-date">{post.created_at}</span>
                                </div>
                            </>
                        ) : (
                            <div className="post-text-container">
                                <p className="post-text">{post.content}</p>
                                <span className="post-date">{post.created_at}</span>
                            </div>
                        )}
                        <div className="post-divider"></div>
                    </div>
                )) : (
                    <div className="no-posts">NO POSTS YET</div>
                )}
            </div>

            {/* Create Post FAB */}
            {isOwnProfile && (
                <button
                    className="create-post-fab"
                    onClick={() => setCreateModalOpen(true)}
                >
                    <img src={postIcon} alt="Post" className="fab-icon-img" />
                </button>
            )}

            {/* Create Post Modal */}
            <CreatePostModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={() => {
                    window.location.reload();
                }}
            />
        </div>
    );
};

export default Profile;
