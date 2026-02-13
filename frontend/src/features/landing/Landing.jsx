import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import landingBg from '../../assets/images/landing_bg.png';
import landingText from '../../assets/images/landing_text.png';
import landingStar from '../../assets/icons/landing_star.svg';
import landingArrow from '../../assets/icons/landing_arrow.svg';
import './Landing.css';

const Landing = () => {
  const navigate = useNavigate();
  const [isZooming, setIsZooming] = useState(false);

  useEffect(() => {
    let timer;
    if (isZooming) {
      // Wait for animation to cover screen before navigating
      timer = setTimeout(() => {
        navigate('/login');
      }, 2500); // 2.5s to match CSS transition
    }
    return () => clearTimeout(timer);
  }, [isZooming, navigate]);

  const handleMouseEnter = () => {
    setIsZooming(true);
  };

  const handleMouseLeave = () => {
    // Optional: If you want it to stop if they leave quickly. 
    // But user said "became larger till the black center fills width", 
    // implying a committed action or at least a visual effect that leads to login.
    // If we want to cancel on leave:
    setIsZooming(false);
  };

  return (
    <div className="landing-container">
      <div className="landing-bg" style={{ backgroundImage: `url(${landingBg})` }}></div>
      <div className="landing-overlay"></div>

      <div className="landing-content">
        <div className="title-container">
          <img src={landingText} alt="Converse" className="landing-text" />
          <img
            src={landingStar}
            alt=""
            className={`landing-star ${isZooming ? 'zooming' : ''}`}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          />
          <div className="arrow-container">
            <img src={landingArrow} alt="Click here" className="landing-arrow" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
