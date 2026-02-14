import React, { useState } from 'react';
import client from '../../api/client';
import { ENDPOINTS } from '../../api/endpoints';
import './CreatePostModal.css';

const CreatePostModal = ({ isOpen, onClose, onSuccess }) => {
    const [step, setStep] = useState(1); // 1: Type Selection, 2: Content
    const [postType, setPostType] = useState('text'); // 'text' | 'image'
    const [category, setCategory] = useState('casual');
    const [textContent, setTextContent] = useState('');
    const [caption, setCaption] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    if (!isOpen) return null;

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async () => {
        setLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('post_type', postType);
        formData.append('category', category);
        formData.append('visibility', 'public'); // Default for now

        if (postType === 'text') {
            formData.append('text_content', textContent);
        } else {
            if (imageFile) {
                formData.append('image', imageFile);
            }
            formData.append('caption', caption);
        }

        try {
            await client.post(ENDPOINTS.SOCIAL.CREATE, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            onSuccess();
            onClose();
            // Reset state
            setStep(1);
            setTextContent('');
            setCaption('');
            setImageFile(null);
            setPreviewUrl(null);
        } catch (err) {
            console.error("Failed to create post", err);
            setError("Failed to post. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className="modal-title">CREATE POST</h2>
                    <button className="close-btn" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {error && <div className="error-message">{error}</div>}

                    {/* Category Selection */}
                    <div className="form-group">
                        <label>VIBE</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value)} className="cp-select">
                            <option value="casual">Casual</option>
                            <option value="meme">Meme</option>
                            <option value="roast">Roast</option>
                            <option value="confession">Confession</option>
                            <option value="joke">Joke</option>
                            <option value="news_bite">News Bite</option>
                        </select>
                    </div>

                    {/* Type Toggle */}
                    <div className="type-toggle">
                        <button
                            className={`type-btn ${postType === 'text' ? 'active' : ''}`}
                            onClick={() => setPostType('text')}
                        >
                            TEXT
                        </button>
                        <button
                            className={`type-btn ${postType === 'image' ? 'active' : ''}`}
                            onClick={() => setPostType('image')}
                        >
                            IMAGE
                        </button>
                    </div>

                    {/* Content Input */}
                    {postType === 'text' ? (
                        <textarea
                            placeholder="What's on your mind?"
                            className="cp-textarea"
                            value={textContent}
                            onChange={(e) => setTextContent(e.target.value)}
                        ></textarea>
                    ) : (
                        <div className="image-upload-container">
                            {previewUrl ? (
                                <div className="image-preview" style={{ backgroundImage: `url(${previewUrl})` }}>
                                    <button className="remove-image-btn" onClick={() => {
                                        setImageFile(null);
                                        setPreviewUrl(null);
                                    }}>×</button>
                                </div>
                            ) : (
                                <label className="image-upload-label">
                                    <span>CLICK TO UPLOAD</span>
                                    <input type="file" accept="image/*" onChange={handleImageChange} hidden />
                                </label>
                            )}
                            <input
                                type="text"
                                placeholder="Add a caption..."
                                className="cp-input"
                                value={caption}
                                onChange={(e) => setCaption(e.target.value)}
                            />
                        </div>
                    )}
                </div>

                <div className="modal-footer">
                    <button className="modal-btn cancel" onClick={onClose}>CANCEL</button>
                    <button className="modal-btn submit" onClick={handleSubmit} disabled={loading}>
                        {loading ? 'POSTING...' : 'POST'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreatePostModal;
