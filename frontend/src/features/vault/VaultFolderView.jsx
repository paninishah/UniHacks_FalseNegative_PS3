import React, { useState, useEffect } from 'react';
import vaultAPI from '../../services/vaultAPI';
import './VaultFolderView.css';

const VaultFolderView = ({ folderId, onBack, currentUser }) => {
    const [folder, setFolder] = useState(null);
    const [items, setItems] = useState([]);
    const [isLocked, setIsLocked] = useState(true);
    const [accessKey, setAccessKey] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Initial fetch to get basic folder info (or check if owner)
        // For MVP, we'll try to unlock immediately if owner, or wait for key if not.
        const init = async () => {
            try {
                // If we had a specific "get info" endpoint that didn't require unlock, we'd use it.
                // But our 'unlock' endpoint handles owner bypass. So let's try unlocking with empty key first if owner.
                // Actually, let's just fetch basic info if we can, but we defined `VaultFolderDetail` for owner.
                // Let's rely on the user to enter key if it's not theirs, or auto-unlock if it is.

                // For safety in this component, let's just try to unlock with empty string.
                // The backend `VaultFolderUnlock` allows owner to bypass check.
                setLoading(true);
                const data = await vaultAPI.unlockFolder(folderId, '');
                // If success, it means we are owner or it has no key (not possible per model but logic-wise)
                setFolder(data.folder);
                setItems(data.items);
                setIsLocked(false);
            } catch (err) {
                // If 403, it means we need a key.
                if (err.response && err.response.status === 403) {
                    setIsLocked(true);
                    // Fetch basic info if possible logic missing, so we might just show "Locked Folder"
                } else {
                    console.error("Failed to load folder", err);
                }
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [folderId]);

    const handleUnlock = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const data = await vaultAPI.unlockFolder(folderId, accessKey);
            setFolder(data.folder);
            setItems(data.items);
            setIsLocked(false);
        } catch (err) {
            setError('Invalid Access Key');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !folder) return <div className="vault-loading">Decrypting...</div>;

    if (isLocked) {
        return (
            <div className="folder-lock-screen">
                <button className="back-btn" onClick={onBack}>← BACK</button>
                <div className="lock-content">
                    <div className="lock-icon">🔒</div>
                    <h2>LOCKED FOLDER</h2>
                    <p>Enter the access key to view contents.</p>
                    <form onSubmit={handleUnlock}>
                        <input
                            type="password"
                            className="vault-key-input"
                            placeholder="ACCESS KEY"
                            value={accessKey}
                            onChange={(e) => setAccessKey(e.target.value)}
                        />
                        {error && <div className="error-msg">{error}</div>}
                        <button type="submit" className="unlock-btn">UNLOCK</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="vault-folder-view">
            <div className="folder-header">
                <button className="back-btn" onClick={onBack}>← BACK</button>
                <h1>{folder?.name}</h1>
                <span className="item-count">{items.length} ITEMS</span>
            </div>

            <div className="vault-grid">
                {items.length === 0 ? (
                    <div className="empty-state">This folder is empty.</div>
                ) : (
                    items.map(item => (
                        <div key={item.id} className="vault-item">
                            {item.post_details ? (
                                <div className="vault-post-preview">
                                    {item.post_details.image_url ? (
                                        <div className="vp-image" style={{ backgroundImage: `url(${item.post_details.image_url})` }}></div>
                                    ) : (
                                        <div className="vp-text">{item.post_details.text_content}</div>
                                    )}
                                    <div className="vp-meta">
                                        Saved Post from @{item.post_details.user?.username || 'user'}
                                    </div>
                                </div>
                            ) : item.image ? (
                                <img src={item.image} alt="Vault Item" className="vault-img" />
                            ) : (
                                <div className="vault-text-item">{item.text_content}</div>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default VaultFolderView;
