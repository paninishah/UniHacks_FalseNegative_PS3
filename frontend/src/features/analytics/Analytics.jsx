import React, { useEffect, useState } from 'react';
import analyticsAPI from '../../services/analyticsAPI';
import './Analytics.css'; // Assume css

const Analytics = () => {
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                // Hardcoded group 1 for demo
                const data = await analyticsAPI.getGroupAnalytics(1);
                setAnalytics(data);
            } catch (error) {
                console.error("Failed to load analytics", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    if (loading) return <div>Analyzing Group Dynamics...</div>;

    return (
        <div className="analytics-container">
            <h1>GROUP ANALYTICS 📊</h1>

            <div className="analytics-grid">
                <div className="card heat-card">
                    <h2>🔥 HEATMAP</h2>
                    <HeatmapCalendar data={analytics?.activity_heatmap || {}} />
                </div>

                <div className="card dna-card">
                    <h2>🧬 FRIENDSHIP DNA</h2>
                    <FriendshipDNA data={analytics?.friendship_dna || {}} />
                </div>

                <div className="card stats-card">
                    <h2>📈 VITALS</h2>
                    <GroupAnalytics stats={analytics || {}} />
                </div>
            </div>
        </div>
    );
};

const HeatmapCalendar = ({ data }) => {
    return (
        <div className="heatmap-container">
            {/* Visual placeholder for heatmap */}
            <div className="heatmap-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '5px' }}>
                {Array.from({ length: 28 }).map((_, i) => (
                    <div key={i} style={{
                        width: '20px',
                        height: '20px',
                        backgroundColor: Math.random() > 0.5 ? '#00ff88' : '#333',
                        borderRadius: '4px'
                    }}></div>
                ))}
            </div>
            <p style={{ fontSize: '0.8rem', color: '#888' }}>Activity over last 28 days</p>
        </div>
    );
};

const FriendshipDNA = ({ data }) => {
    return (
        <div className="dna-container">
            <div className="dna-visual">
                {/* Visual placeholder for graph */}
                <svg width="200" height="100">
                    <circle cx="50" cy="50" r="20" fill="#ff0055" />
                    <circle cx="150" cy="50" r="20" fill="#00ccff" />
                    <line x1="70" y1="50" x2="130" y2="50" stroke="white" strokeWidth="2" />
                </svg>
            </div>
            <p>Strongest Bond: You & The Squad</p>
        </div>
    );
};

const GroupAnalytics = ({ stats }) => {
    return (
        <div className="vitals-list">
            <div className="vital-item">
                <span>Total Messages:</span>
                <span>{stats.total_messages || 0}</span>
            </div>
            <div className="vital-item">
                <span>Active Members:</span>
                <span>{stats.active_members_count || 0}</span>
            </div>
            <div className="vital-item">
                <span>Busiest Day:</span>
                <span>Friday</span>
            </div>
        </div>
    );
};

export default Analytics;
