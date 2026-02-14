import React, { useState, useEffect } from 'react';
import './Vault.css';
import vaultAPI from '../../services/vaultAPI';
import client from '../../api/client'; // for direct file upload if needed

const Vault = () => {
    const [activeTab, setActiveTab] = useState('capsules'); // 'capsules' | 'stash'
    const [isCapsuleModalOpen, setCapsuleModalOpen] = useState(false);
    const [isStashModalOpen, setStashModalOpen] = useState(false);
    const [generatedKey, setGeneratedKey] = useState(null);

    const [capsules, setCapsules] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCapsules = async () => {
        setLoading(true);
        try {
            const data = await vaultAPI.getMyCapsules();
            setCapsules(data);
        } catch (error) {
            console.error("Failed to fetch capsules", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCapsules();
    }, []);

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
            fetchCapsules();
        } catch (error) {
            console.error("Failed to create capsule", error);
        }
    };

    const handleAnalyzeMusic = async (capsuleId) => {
        try {
            alert("Analyzing musical vibe... 🎵");
            const result = await vaultAPI.analyzeMusic(capsuleId);
            alert(`Analysis Complete! Vibe: ${result.vibe}`);
            fetchCapsules(); // Refresh to show vibe
        } catch (error) {
            console.error("Analysis failed", error);
            alert("Failed to analyze music.");
        }
    };

    // Stash logic would go here (omitted for brevity but structured similarly)

    return (
        <div className="vault-container">
            <h1 className="vault-title">VAULT</h1>

            {/* Tabs */}
            <div className="vault-tabs">
                <button
                    className={`vault-tab ${activeTab === 'capsules' ? 'active' : ''}`}
                    onClick={() => setActiveTab('capsules')}
                >
                    ⏳ TIME CAPSULES
                </button>
            </div>

            {/* Content Area */}
            <div className="vault-content">
                {activeTab === 'capsules' && (
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
                                                🎶 ANALYZE
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

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
