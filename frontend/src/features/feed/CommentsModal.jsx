import React, { useState, useEffect } from 'react';
import client from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import './CommentsModal.css';

const CommentsModal = ({ isOpen, onClose, postId }) => {
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (isOpen && postId) {
            fetchComments();
        }
    }, [isOpen, postId]);

    const fetchComments = async () => {
        setLoading(true);
        try {
            const response = await client.get(ENDPOINTS.SOCIAL.COMMENTS(postId));
            setComments(response.data);
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim()) return;

        setSubmitting(true);
        try {
            await client.post(ENDPOINTS.SOCIAL.COMMENT, {
                post: postId,
                text: newComment
            });
            setNewComment('');
            fetchComments(); // Refresh list
        } catch (error) {
            console.error("Failed to post comment", error);
        } finally {
            setSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content comments-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">COMMENTS</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="comments-body">
                    {loading ? (
                        <div className="comments-loading">Loading...</div>
                    ) : comments.length > 0 ? (
                        <div className="comments-list">
                            {comments.map((comment) => (
                                <div key={comment.id} className="comment-item">
                                    <div className="comment-avatar"></div> {/* add pfp if available */}
                                    <div className="comment-content-wrapper">
                                        <div className="comment-header">
                                            <span className="comment-author">User {comment.user}</span> {/* backend sends user ID currently in CommentSerializer? Need nested user in CommentSerializer too! */}
                                            <span className="comment-time">{new Date(comment.created_at).toLocaleDateString()}</span>
                                        </div>
                                        <p className="comment-text">{comment.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="no-comments">No tea spilled yet. Be the first! ☕</div>
                    )}
                </div>

                <form className="comment-form" onSubmit={handleSubmit}>
                    <input
                        type="text"
                        className="comment-input"
                        placeholder="Add a comment..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        disabled={submitting}
                    />
                    <button type="submit" className="comment-submit-btn" disabled={submitting || !newComment.trim()}>
                        ➔
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CommentsModal;
