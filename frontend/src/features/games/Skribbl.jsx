import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import gameAPI from '../../services/gameAPI';
import './Skribbl.css';

const Skribbl = () => {
    const { sessionId } = useParams();
    const [game, setGame] = useState(null);
    const [guess, setGuess] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isDrawing, setIsDrawing] = useState(false);
    const [penColor, setPenColor] = useState('#ffffff');
    const [penSize, setPenSize] = useState(5);
    const [winner, setWinner] = useState(null);

    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const wsRef = useRef(null);
    const lastPos = useRef({ x: 0, y: 0 });

    const COLORS = ['#ffffff', '#ff4444', '#44ff44', '#4488ff', '#ffff44', '#ff44ff', '#44ffff', '#ff8800'];

    useEffect(() => {
        const init = async () => {
            try {
                const data = await gameAPI.getGame(sessionId);
                setGame(data);
                connectGameWebSocket(sessionId);
            } catch (error) {
                console.error("Init failed:", error);
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
            // Size canvas to its container
            const wrapper = canvas.parentElement;
            canvas.width = Math.min(wrapper.clientWidth - 4, 800);
            canvas.height = Math.min(wrapper.clientHeight - 4, 600);
            const ctx = canvas.getContext('2d');
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.strokeStyle = penColor;
            ctx.lineWidth = penSize;
            // Fill with dark background
            ctx.fillStyle = '#111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctxRef.current = ctx;
        }
    }, [loading]);

    const connectGameWebSocket = (id) => {
        const token = localStorage.getItem('token');
        const wsUrl = `ws://localhost:8000/ws/game/${id}/?token=${token}`;
        wsRef.current = new WebSocket(wsUrl);

        wsRef.current.onopen = () => {
            console.log("Skribbl WS Connected");
            setMessages(prev => [...prev, { user: 'System', text: 'Connected to game!', type: 'system' }]);
        };

        wsRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.action === "draw") {
                drawOnCanvas(data.draw_data);
            } else if (data.action === "guess") {
                setMessages(prev => [...prev, { user: data.user, text: data.guess, type: 'guess' }]);
            }
        };

        wsRef.current.onerror = (e) => console.error("WS Error:", e);
    };

    const drawOnCanvas = ({ x, y, lastX, lastY, color, size }) => {
        if (!ctxRef.current) return;
        const ctx = ctxRef.current;
        ctx.beginPath();
        ctx.strokeStyle = color || "#ffffff";
        ctx.lineWidth = size || penSize;
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
            color: penColor,
            size: penSize,
        };

        drawOnCanvas(drawData);

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

    const clearCanvas = () => {
        if (!ctxRef.current || !canvasRef.current) return;
        const ctx = ctxRef.current;
        ctx.fillStyle = '#111';
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    };

    const handleGuess = async () => {
        if (!guess.trim()) return;
        try {
            const result = await gameAPI.guess(sessionId, { guess: guess.trim() });
            setMessages(prev => [...prev, { user: 'You', text: guess, type: 'guess' }]);

            if (result.correct) {
                setWinner(result.winner);
                setMessages(prev => [...prev, {
                    user: 'System',
                    text: `🎉 ${result.winner} guessed correctly!`,
                    type: 'system'
                }]);
            }
            setGuess('');
        } catch (error) {
            console.error("Guess failed:", error);
        }
    };

    if (loading) return <div className="game-container skribbl-container"><div className="loading-spinner">Loading Skribbl...</div></div>;
    if (!game) return <div className="game-container"><h2>Game Not Found</h2></div>;

    return (
        <div className="game-container skribbl-container">
            <h1 className="game-title">SKRIBBL</h1>
            {game.secret_word && (
                <div className="skribbl-word-hint">
                    Secret Word: <strong>{game.secret_word}</strong>
                    <span style={{ color: '#888', fontSize: '0.75rem', marginLeft: '10px' }}>
                        (Drawer sees this — guessers don't peek!)
                    </span>
                </div>
            )}

            {winner && (
                <div className="skribbl-winner-banner">
                    🎉 {winner} guessed it! The word was "{game.secret_word}"
                </div>
            )}

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
                    <div className="skribbl-tools">
                        <div className="color-picker">
                            {COLORS.map(c => (
                                <button
                                    key={c}
                                    className={`color-btn ${penColor === c ? 'active' : ''}`}
                                    style={{ background: c }}
                                    onClick={() => setPenColor(c)}
                                />
                            ))}
                        </div>
                        <div className="size-picker">
                            <input type="range" min="2" max="20" value={penSize}
                                onChange={(e) => setPenSize(Number(e.target.value))} />
                            <span style={{ color: '#888', fontSize: '0.75rem' }}>{penSize}px</span>
                        </div>
                        <button className="clear-btn" onClick={clearCanvas}>Clear</button>
                    </div>

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
                            disabled={!!winner}
                        />
                        <button onClick={handleGuess} disabled={!!winner}>SEND</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Skribbl;
