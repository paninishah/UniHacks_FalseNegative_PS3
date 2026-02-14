import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import gameAPI from '../../services/gameAPI';
import './Skribbl.css'; // Assume css

const Skribbl = () => {
    const { sessionId } = useParams(); // gameId
    const [game, setGame] = useState(null);
    const [guess, setGuess] = useState('');
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const init = async () => {
            try {
                const data = await gameAPI.getGame(sessionId);
                setGame(data);
            } catch (error) {
                console.error("Init failed", error);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [sessionId]);

    const handleGuess = async () => {
        try {
            const response = await gameAPI.guess(sessionId, { guess });
            if (response.correct) {
                setResult("CORRECT! 🎉");
            } else {
                setResult("WRONG! ❌");
            }
        } catch (error) {
            console.error("Guess failed", error);
            setResult("Error submitting guess");
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!game) return <div>Game Not Found</div>;

    return (
        <div className="game-container">
            <h1 className="game-title">SKRIBBL</h1>
            <div className="drawing-area">
                {/* Placeholder for drawing canvas */}
                <div className="canvas-placeholder">
                    <span>DRAWING... (Imagine a bicycle)</span>
                </div>
            </div>

            <div className="guess-controls">
                <input
                    type="text"
                    placeholder="Type your guess..."
                    value={guess}
                    onChange={(e) => setGuess(e.target.value)}
                    className="guess-input"
                />
                <button className="guess-btn" onClick={handleGuess}>GUESS</button>
            </div>
            {result && <div className="game-result">{result}</div>}
        </div>
    );
};

export default Skribbl;
