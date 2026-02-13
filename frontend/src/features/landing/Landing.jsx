import React from 'react';
import landingBg from '../../assets/images/landing_bg.png';
import landingText from '../../assets/images/landing_text.png';
import landingStar from '../../assets/icons/landing_star.svg';
import landingArrow from '../../assets/icons/landing_arrow.svg';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-container">
      <div className="landing-bg" style={{ backgroundImage: `url(${landingBg})` }}></div>
      <div className="landing-overlay"></div>
      
      <div className="landing-content">
        <div className="title-container">
          <img src={landingText} alt="Converse" className="landing-text" />
          <img src={landingStar} alt="" className="landing-star" />
          <div className="arrow-container">
            <img src={landingArrow} alt="Click here" className="landing-arrow" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
