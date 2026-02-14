import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const CommunityFeed = () => {
    const { communityId } = useParams();
    const navigate = useNavigate();

    return (
        <div style={{ padding: '20px', color: 'white' }}>
            <button onClick={() => navigate('/communities')}>← Back to Communities</button>
            <h1>Community Feed: {communityId}</h1>
            <p>Coming Soon...</p>
        </div>
    );
};

export default CommunityFeed;
