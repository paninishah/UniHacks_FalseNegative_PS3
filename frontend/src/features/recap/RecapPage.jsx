import React, { useState, useEffect } from 'react';
import recapAPI from '../../services/recapAPI';
import './RecapPage.css'; // Assume css

const RecapPage = () => {
    const [recap, setRecap] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);

    const fetchRecap = async () => {
        setLoading(true);
        try {
            // Assume we want recap for a specific group or current user context?
            // API expects group_id?
            // Let's assume user context or pass random group ID '1' for demo if generic.
            // recapAPI.getLatestRecap(groupId)
            // Lets assume groupId = 1 for now or fetch from user's groups.
            // Better: "Generate Recap" button allows inputting group ID or selecting.
            // For this page, let's try safely fetching or showing a "Select Group" state.
            // We'll hardcode group 1 for the demo integration success.
            const data = await recapAPI.getLatestRecap(1);
            setRecap(data);
        } catch (error) {
            console.error("No recap found", error);
        } finally {
            setLoading(false);
        }
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            await recapAPI.generateRecap(1);
            fetchRecap();
        } catch (error) {
            console.error("Generation failed", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecap();
    }, []);

    if (loading) return <div className="recap-loading">LOADING MEMORIES...</div>;

    if (!recap) {
        return (
            <div className="recap-empty">
                <h1>NO RECAP AVAILABLE</h1>
                <button className="generate-btn" onClick={handleGenerate}>GENERATE SEASON RECAP 🎬</button>
            </div>
        );
    }

    // Story Slides Logic
    const slides = [
        {
            type: 'intro',
            content: <h1>SEASON RECAP 2026</h1>,
            bg: 'black'
        },
        {
            type: 'stats',
            content: (
                <div>
                    <h2>TOP VIBES</h2>
                    <p>Posts: {recap.total_posts || 0}</p>
                    <p>Reactions: {recap.total_reactions || 0}</p>
                </div>
            ),
            bg: '#1a1a1a'
        },
        {
            type: 'photos',
            content: (
                <div>
                    <h2>TOP MEMORIES</h2>
                    {/* Placeholder for photos array from recap data */}
                    <div className="photo-grid">
                        <div className="photo-placeholder">📸</div>
                        <div className="photo-placeholder">📸</div>
                    </div>
                </div>
            ),
            bg: '#2a2a2a'
        },
        {
            type: 'outro',
            content: <h1>SEE YOU NEXT SEASON! 👋</h1>,
            bg: 'black'
        }
    ];

    const nextSlide = () => {
        if (currentSlide < slides.length - 1) setCurrentSlide(currentSlide + 1);
    };

    const prevSlide = () => {
        if (currentSlide > 0) setCurrentSlide(currentSlide - 1);
    };

    return (
        <div className="recap-container" style={{ backgroundColor: slides[currentSlide].bg }}>
            <div className="story-content">
                {slides[currentSlide].content}
            </div>

            <div className="story-controls">
                <button onClick={prevSlide} disabled={currentSlide === 0}>⬅</button>
                <button onClick={nextSlide} disabled={currentSlide === slides.length - 1}>➡</button>
            </div>
            <div className="story-progress">
                {slides.map((_, idx) => (
                    <div key={idx} className={`progress-bar ${idx === currentSlide ? 'active' : ''}`}></div>
                ))}
            </div>
        </div>
    );
};

export default RecapPage;
