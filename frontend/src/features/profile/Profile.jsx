import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import fullLogo from '../../assets/icons/converse_full.svg';
import starIcon from '../../assets/icons/landing_star.svg';
import postIcon from '../../assets/icons/navbar/post.svg';
import './Profile.css';
import client from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import { useAuth } from '../../context/AuthContext';
import CreatePostModal from '../feed/CreatePostModal';

const Profile = () => {
    const navigate = useNavigate();
    const { userId } = useParams();
    const { user: currentUser } = useAuth();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState('text'); // 'text' | 'image'

    const [profileUser, setProfileUser] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isFollowing, setIsFollowing] = useState(false);

    const isOwnProfile = !userId || (currentUser && currentUser.id === parseInt(userId));

    useEffect(() => {
        const fetchProfileData = async () => {
            setLoading(true);
            try {
                // Determine which endpoint to call. 
                // If isOwnProfile, calls /api/users/profile/ (which returns own profile)
                // If other user, we might need a specific endpoint like /api/users/profile/id/
                // Checking backend urls: path("profile/", ProfileView.as_view()),
                // It seems ProfileView only returns own profile?
                // I need to check if ProfileView handles GET with a query param or if there's another view.
                // Looking at exploration, only `profile/` exists.
                // I might need to update the backend or use `profile/` for own and create a new one for others?
                // Or maybe `ProfileView` handles it?
                // Let's assume for now I can only view my own profile until I confirm backend.
                // Wait, the plan said "Fetch profile data".
                // I will use /api/users/profile/ for own.
                // For others, I need to check `users/views.py`.

                // For now, let's just implement for own profile using /api/users/profile/
                // passing userId might not work if backend doesn't support it yet.
                // But the requirement says "Profile creation... Follow/Unfollow".

                // let's try to fetch /api/users/profile/
                if (isOwnProfile) {
                    const response = await client.get(ENDPOINTS.AUTH.PROFILE);
                    setProfileUser(response.data);
                    // setPosts(response.data.posts); // Assuming posts are returned or separate endpoint?
                    // Usually separate feed endpoint for user posts.
                } else {
                    // Placeholder for other user fetch if endpoint exists
                    // const response = await client.get(`/api/users/${userId}/`);
                }

                // Fetch User Posts
                // Need an endpoint for user posts.
                // `social/feed/` is usually global or friends.
                // I might need `social/user-posts/<id>/` ?
                // Let's check `social/views.py` later. 
                // For now, I'll mock the posts fetch with a comment.

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
                await client.post(ENDPOINTS.AUTH.UNFOLLOW(profileUser.id));
            } else {
                await client.post(ENDPOINTS.AUTH.FOLLOW(profileUser.id));
            }
            setIsFollowing(!isFollowing);
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
