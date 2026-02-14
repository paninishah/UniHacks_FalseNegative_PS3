import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import gameAPI from '../../services/gameAPI';
import './Skribbl.css'; // Assume css

const Skribbl = () => {
    const { sessionId } = useParams(); // gameId
    const [game, setGame] = useState(null);
    const [guess, setGuess] = useState('');
    const [messages, setMessages] = useState([]); // Chat/Guesses
    const [loading, setLoading] = useState(true);
    const [isDrawing, setIsDrawing] = useState(false);

    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const wsRef = useRef(null);
    const lastPos = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const init = async () => {
            try {
                const data = await gameAPI.getGame(sessionId);
                setGame(data);
                connectGameWebSocket(sessionId);
            } catch (error) {
                console.error("Init failed", error);
            } finally {
                setLoading(false);
            }
        };
        init();

        return () => {
            if (wsRef.current) wsRef.current.close();
        };
    }, [sessionId]);

    useEffect(() => {
        if (!loading && canvasRef.current) {
            const canvas = canvasRef.current;
            canvas.width = 800;
            canvas.height = 600;
            const ctx = canvas.getContext('2d');
            ctx.lineCap = "round";
            ctx.strokeStyle = "white";
            ctx.lineWidth = 5;
            ctxRef.current = ctx;
        }
    }, [loading]);

    const connectGameWebSocket = (id) => {
        const token = localStorage.getItem('token');
        const wsUrl = `ws://localhost:8000/ws/game/${id}/?token=${token}`;
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => console.log("Skribbl WS Connected");

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.action === "draw") {
                drawOnCanvas(data.draw_data);
            } else if (data.action === "guess") {
                setMessages(prev => [...prev, { user: data.user, text: data.guess, type: 'guess' }]);
                // Check if correct locally? Or rely on backend response?
                // Backend broadcasts guess, but validation response (correct/incorrect) 
                // might need to be broadcasted too. 
                // For now, simpler: just show guesses.
            }
        };
    };

    const drawOnCanvas = ({ x, y, lastX, lastY, color }) => {
        if (!ctxRef.current) return;
        const ctx = ctxRef.current;
        ctx.beginPath();
        ctx.strokeStyle = color || "white";
        ctx.moveTo(lastX, lastY);
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.closePath();
    };

    const startDrawing = ({ nativeEvent }) => {
        const { offsetX, offsetY } = nativeEvent;
        setIsDrawing(true);
        lastPos.current = { x: offsetX, y: offsetY };
    };

    const draw = ({ nativeEvent }) => {
        if (!isDrawing) return;
        const { offsetX, offsetY } = nativeEvent;

        const drawData = {
            x: offsetX,
            y: offsetY,
            lastX: lastPos.current.x,
            lastY: lastPos.current.y,
            color: "white" // Dynamic later
        };

        // Draw locally
        drawOnCanvas(drawData);

        // Send to WS
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                action: "draw",
                draw_data: drawData
            }));
        }

        lastPos.current = { x: offsetX, y: offsetY };
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const handleGuess = async () => {
        if (!guess.trim()) return;
        try {
            // Send via API logic for scoring
            await gameAPI.guess(sessionId, { guess });

            // Also clean input
            setGuess('');
        } catch (error) {
            console.error("Guess failed", error);
        }
    };

    if (loading) return <div className="loading-spinner">Loading Skribbl...</div>;
    if (!game) return <div>Game Not Found</div>;

    return (
        <div className="game-container skribbl-container">
            <h1 className="game-title">SKRIBBL</h1>

            <div className="game-layout">
                <div className="canvas-wrapper">
                    <canvas
                        ref={canvasRef}
                        className="drawing-board"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseLeave={stopDrawing}
                    />
                </div>

                <div className="game-sidebar">
                    <div className="chat-area">
                        {messages.map((msg, i) => (
                            <div key={i} className={`game-msg ${msg.type}`}>
                                <strong>{msg.user}: </strong>{msg.text}
                            </div>
                        ))}
                    </div>
                    <div className="guess-controls">
                        <input
                            type="text"
                            placeholder="Type your guess..."
                            value={guess}
                            onChange={(e) => setGuess(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleGuess()}
                        />
                        <button onClick={handleGuess}>SEND</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Skribbl;
