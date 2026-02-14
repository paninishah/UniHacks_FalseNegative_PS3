import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Vault.css';
import vaultAPI from '../../services/vaultAPI';
import client from '../../api/client';
import VaultFolderView from './VaultFolderView';

const Vault = () => {
    const { userId } = useParams();
    const { user } = useAuth();

    // If userId is present and not same as current user, it's a visitor looking at someone else's vault
    const isVisitor = userId && user && parseInt(userId) !== user.id;
    const targetUserId = userId || (user ? user.id : null);

    const [activeTab, setActiveTab] = useState('folders'); // 'folders' | 'capsules'
    const [isCapsuleModalOpen, setCapsuleModalOpen] = useState(false);
    const [isFolderModalOpen, setFolderModalOpen] = useState(false);

    // Data state
    const [capsules, setCapsules] = useState([]);
    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(false);

    // View state
    const [viewingFolderId, setViewingFolderId] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'capsules') {
                if (!isVisitor) {
                    const data = await vaultAPI.getMyCapsules();
                    setCapsules(data);
                } else {
                    setCapsules([]); // Visitors can't see capsules for now (private/group only in MVP spec logic usually)
                }
            } else if (activeTab === 'folders') {
                if (isVisitor) {
                    const data = await vaultAPI.getUserFolders(targetUserId);
                    setFolders(data);
                } else {
                    const data = await vaultAPI.getFolders();
                    setFolders(data);
                }
            }
        } catch (error) {
            console.error("Failed to fetch vault data", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!viewingFolderId && targetUserId) {
            fetchData();
        }
    }, [activeTab, viewingFolderId, targetUserId]);

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            name: formData.get('name'),
            access_code: formData.get('access_code')
        };
        try {
            await vaultAPI.createFolder(data);
            setFolderModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Failed to create folder", error);
            alert("Could not create folder");
        }
    };

    // ... (rest of capsule logic like handleCreateCapsule)
    const handleCreateCapsule = async (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
            title: formData.get('title'),
            description: formData.get('description'),
            unlock_date: formData.get('unlock_date'),
            is_public: false, // Default
        };

        try {
            await vaultAPI.createCapsule(data);
            setCapsuleModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Failed to create capsule", error);
        }
    };

    const handleAnalyzeMusic = async (capsuleId) => {
        // ... (existing logic)
        try {
            alert("Analyzing musical vibe... 🎵");
            const result = await vaultAPI.analyzeMusic(capsuleId);
            alert(`Analysis Complete! Vibe: ${result.vibe}`);
            // fetchData(); // Removed to avoid reset
        } catch (error) {
            console.error("Analysis failed", error);
        }
    };

    // If viewing a folder, render that component instead
    if (viewingFolderId) {
        return <VaultFolderView folderId={viewingFolderId} onBack={() => setViewingFolderId(null)} />;
    }

    return (
        <div className="vault-container">
            <h1 className="vault-title">{isVisitor ? "SECRET VAULT" : "VAULT"}</h1>

            {/* Tabs */}
            <div className="vault-tabs">
                <button
                    className={`vault-tab ${activeTab === 'folders' ? 'active' : ''}`}
                    onClick={() => setActiveTab('folders')}
                >
                    📁 FOLDERS
                </button>
                {!isVisitor && (
                    <button
                        className={`vault-tab ${activeTab === 'capsules' ? 'active' : ''}`}
                        onClick={() => setActiveTab('capsules')}
                    >
                        ⏳ TIME CAPSULES
                    </button>
                )}
            </div>

            {/* Content Area */}
            <div className="vault-content">

                {/* FOLDERS TAB */}
                {activeTab === 'folders' && (
                    <div className="folders-section">
                        {!isVisitor && (
                            <button className="add-btn" onClick={() => setFolderModalOpen(true)}>
                                + NEW FOLDER
                            </button>
                        )}

                        {loading ? <div className="vault-loading">Loading folders...</div> : (
                            <div className="vault-grid">
                                {folders.length === 0 && <div className="empty-state">No folders found.</div>}
                                {folders.map(folder => (
                                    <div key={folder.id} className="vault-card folder-card" onClick={() => setViewingFolderId(folder.id)}>
                                        <div className="card-icon">📁</div>
                                        <h3 className="card-title">{folder.name}</h3>
                                        <p className="card-date">{folder.item_count} items</p>
                                        <div className="folder-key-hint">{isVisitor ? '🔒 Locked' : 'Key: ****'}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* CAPSULES TAB */}
                {activeTab === 'capsules' && !isVisitor && (
                    <div className="capsules-section">
                        <button className="add-btn" onClick={() => setCapsuleModalOpen(true)}>
                            + NEW CAPSULE
                        </button>
                        {loading ? <div>Loading...</div> : (
                            <div className="vault-grid">
                                {capsules.map(cap => (
                                    <div key={cap.id} className={`vault-card ${cap.is_unlocked ? 'unlocked' : 'locked'}`}>
                                        <div className="card-icon">{cap.is_unlocked ? '📦' : '🔒'}</div>
                                        <h3 className="card-title">{cap.title}</h3>
                                        <p className="card-date">Unlock: {new Date(cap.unlock_date).toLocaleDateString()}</p>

                                        {cap.music_analysis && (
                                            <div className="music-badge">🎵 {cap.music_analysis.vibe}</div>
                                        )}

                                        <div className="card-actions">
                                            {cap.is_unlocked ? (
                                                <button className="open-btn">OPEN</button>
                                            ) : (
                                                <span className="locked-msg">LOCKED</span>
                                            )}
                                            <button className="open-btn small" onClick={() => handleAnalyzeMusic(cap.id)}>
                                                🎶
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Create Folder Modal */}
            {isFolderModalOpen && (
                <div className="modal-overlay" onClick={() => setFolderModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">NEW SECRET FOLDER</h2>
                        <form onSubmit={handleCreateFolder}>
                            <input name="name" type="text" placeholder="Folder Name (e.g. Secret Stash)" className="vault-input" required />
                            <label className="input-label">ACCESS KEY (Required for others to view):</label>
                            <input name="access_code" type="text" placeholder="e.g. 1234 or swordfish" className="vault-input" required />
                            <div className="modal-actions">
                                <button type="button" className="modal-btn cancel" onClick={() => setFolderModalOpen(false)}>CANCEL</button>
                                <button type="submit" className="modal-btn confirm">CREATE 📁</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Capsule Modal */}
            {isCapsuleModalOpen && (
                <div className="modal-overlay" onClick={() => setCapsuleModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">BURY A CAPSULE</h2>
                        <form onSubmit={handleCreateCapsule}>
                            <input name="title" type="text" placeholder="Title (e.g., Graduation)" className="vault-input" required />
                            <label className="input-label">UNLOCK DATE:</label>
                            <input name="unlock_date" type="datetime-local" className="vault-input" required />
                            <textarea name="description" placeholder="Message to the future..." className="vault-textarea"></textarea>
                            <div className="modal-actions">
                                <button type="button" className="modal-btn cancel" onClick={() => setCapsuleModalOpen(false)}>CANCEL</button>
                                <button type="submit" className="modal-btn confirm">LOCK IT 🔒</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vault;
