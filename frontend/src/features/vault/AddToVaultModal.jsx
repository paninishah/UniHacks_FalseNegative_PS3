import React, { useState, useEffect } from 'react';
import vaultAPI from '../../services/vaultAPI';
import './AddToVaultModal.css';

const AddToVaultModal = ({ isOpen, onClose, postId }) => {
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFolder, setSelectedFolder] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchFolders();
        }
    }, [isOpen]);

    const fetchFolders = async () => {
        setLoading(true);
        try {
            const data = await vaultAPI.getFolders();
            setFolders(data);
        } catch (error) {
            console.error("Failed to fetch folders", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!selectedFolder) return;
        setSaving(true);
        try {
            await vaultAPI.addItemToFolder({
                folder_id: selectedFolder,
                post_id: postId
            });
            alert("Saved to Vault!");
            onClose();
        } catch (error) {
            console.error("Failed to save", error);
            alert("Failed to save to vault.");
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="atv-modal" onClick={e => e.stopPropagation()}>
                <h2>SAVE TO VAULT</h2>

                {loading ? (
                    <div>Loading folders...</div>
                ) : (
                    <div className="folder-list">
                        {folders.length === 0 ? (
                            <div className="no-folders">
                                No folders found. Create one in your Vault first!
                            </div>
                        ) : (
                            folders.map(folder => (
                                <div
                                    key={folder.id}
                                    className={`folder-option ${selectedFolder === folder.id ? 'selected' : ''}`}
                                    onClick={() => setSelectedFolder(folder.id)}
                                >
                                    <span className="folder-icon">📁</span>
                                    <span className="folder-name">{folder.name}</span>
                                    <span className="folder-count">{folder.item_count} items</span>
                                </div>
                            ))
                        )}
                    </div>
                )}

                <div className="atv-actions">
                    <button className="modal-btn cancel" onClick={onClose}>CANCEL</button>
                    <button
                        className="modal-btn confirm"
                        onClick={handleSave}
                        disabled={!selectedFolder || saving}
                    >
                        {saving ? 'SAVING...' : 'SAVE'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddToVaultModal;
