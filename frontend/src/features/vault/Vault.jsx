import React, { useState } from 'react';
import './Vault.css';

const Vault = () => {
    const [activeTab, setActiveTab] = useState('capsules'); // 'capsules' | 'stash'
    const [isCapsuleModalOpen, setCapsuleModalOpen] = useState(false);
    const [isStashModalOpen, setStashModalOpen] = useState(false);
    const [generatedKey, setGeneratedKey] = useState(null);

    // Dummy Data
    const capsules = [
        { id: 1, title: 'Graduation Day', unlockDate: '2026-05-20', status: 'locked', content: 'Secret message...' },
        { id: 2, title: 'Freshman Year Recap', unlockDate: '2025-01-01', status: 'unlocked', content: 'What a wild year! Here are the photos...' },
        { id: 3, title: 'Prediction for 2030', unlockDate: '2030-12-31', status: 'locked', content: 'I bet cars fly by now.' }
    ];

    const stashItems = [
        { id: 1, title: 'Party Photos', key: 'KEY-8821', type: 'image', sharedWith: 2 },
        { id: 2, title: 'My Journal', key: 'KEY-1094', type: 'text', sharedWith: 0 },
        { id: 3, title: 'Secret Project', key: 'KEY-5523', type: 'code', sharedWith: 1 }
    ];

    const handleGenerateKey = () => {
        const randomKey = 'KEY-' + Math.floor(1000 + Math.random() * 9000);
        setGeneratedKey(randomKey);
    };

    const closeStashModal = () => {
        setStashModalOpen(false);
        setGeneratedKey(null);
    };

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
                <button
                    className={`vault-tab ${activeTab === 'stash' ? 'active' : ''}`}
                    onClick={() => setActiveTab('stash')}
                >
                    🔑 SECRET STASH
                </button>
            </div>

            {/* Content Area */}
            <div className="vault-content">
                {activeTab === 'capsules' && (
                    <div className="capsules-section">
                        <button className="add-btn" onClick={() => setCapsuleModalOpen(true)}>
                            + NEW CAPSULE
                        </button>
                        <div className="vault-grid">
                            {capsules.map(cap => (
                                <div key={cap.id} className={`vault-card ${cap.status}`}>
                                    <div className="card-icon">{cap.status === 'locked' ? '🔒' : '📦'}</div>
                                    <h3 className="card-title">{cap.title}</h3>
                                    <p className="card-date">Unlock: {cap.unlockDate}</p>
                                    {cap.status === 'unlocked' && <button className="open-btn">OPEN</button>}
                                    {cap.status === 'locked' && <span className="locked-msg">LOCKED</span>}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'stash' && (
                    <div className="stash-section">
                        <button className="add-btn" onClick={() => setStashModalOpen(true)}>
                            + ADD TO STASH
                        </button>
                        <div className="vault-grid">
                            {stashItems.map(item => (
                                <div key={item.id} className="vault-card stash-item">
                                    <div className="card-top-row">
                                        <div className="card-icon">📂</div>
                                        <span className="key-badge">{item.key}</span>
                                    </div>
                                    <h3 className="card-title">{item.title}</h3>
                                    <p className="card-info">{item.type.toUpperCase()} • Shared: {item.sharedWith}</p>
                                    <button className="open-btn">ACCESS</button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Create Capsule Modal */}
            {isCapsuleModalOpen && (
                <div className="modal-overlay" onClick={() => setCapsuleModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">BURY A CAPSULE</h2>
                        <input type="text" placeholder="Title (e.g., Graduation)" className="vault-input" />
                        <label className="input-label">UNLOCK DATE:</label>
                        <input type="date" className="vault-input" />
                        <textarea placeholder="Message to the future..." className="vault-textarea"></textarea>
                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={() => setCapsuleModalOpen(false)}>CANCEL</button>
                            <button className="modal-btn confirm">LOCK IT 🔒</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Add Stash Modal */}
            {isStashModalOpen && (
                <div className="modal-overlay" onClick={closeStashModal}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 className="modal-title">SECURE STORAGE</h2>
                        <input type="text" placeholder="Title (e.g., Party Pics)" className="vault-input" />
                        <div className="file-upload-box">
                            <span>DRAG & DROP OR CLICK TO UPLOAD</span>
                        </div>

                        {generatedKey ? (
                            <div className="key-display">
                                <p>ACCESS KEY GENERATED:</p>
                                <div className="the-key">{generatedKey}</div>
                                <p className="key-warning">Save this! You cannot recover it.</p>
                            </div>
                        ) : (
                            <button className="generate-btn" onClick={handleGenerateKey}>
                                GENERATE ENCRYPTION KEY 🔑
                            </button>
                        )}

                        <div className="modal-actions">
                            <button className="modal-btn cancel" onClick={closeStashModal}>CANCEL</button>
                            {generatedKey && <button className="modal-btn confirm">SAVE TO VAULT</button>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Vault;
