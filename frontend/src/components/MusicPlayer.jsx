import React from 'react';
import './MusicPlayer.css';

const MusicPlayer = ({ track, autoplay = false }) => {


    if (!track) return null;

    return (
        <div className="music-player" style={{ background: 'linear-gradient(45deg, #1e1e1e, #2a2a2a)', border: '1px solid #333' }}>
            <div className="album-art" style={{ backgroundImage: `url(${track.cover || track.album?.cover_medium})`, width: '60px', height: '60px' }}></div>
            <div className="track-info" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div className="track-title" style={{ fontSize: '1rem', marginBottom: '2px' }}>{track.title}</div>
                <div className="track-artist" style={{ fontSize: '0.8rem', color: '#aaa' }}>{track.artist?.name || track.artist}</div>
                <a href={track.link} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.7rem', color: '#1DB954', marginTop: '4px', textDecoration: 'none' }}>
                    Listen on Deezer ↗
                </a>
            </div>
        </div>
    );
};

export default MusicPlayer;
