import React from 'react';
import { NavLink } from 'react-router-dom';
import fullLogo from '../assets/icons/converse_full.svg';
import starIcon from '../assets/icons/landing_star.svg';
import newsIcon from '../assets/icons/navbar/news.svg';
import groupsIcon from '../assets/icons/navbar/groups.svg';
import commsIcon from '../assets/icons/navbar/comms.svg';
import notifsIcon from '../assets/icons/navbar/notifs.svg';
import './Sidebar.css';

const Sidebar = () => {
    const navItems = [
        { path: '/feed', label: 'NEWSROOM', icon: newsIcon },
        { path: '/groups', label: 'NEWS BITES', icon: groupsIcon },
        { path: '/communities', label: 'COMMUNITIES', icon: commsIcon },
        { path: '/notifications', label: 'NOTIFICATIONS', icon: notifsIcon },
    ];

    return (
        <div className="sidebar">
            <div className="sidebar-logo">
                <img src={starIcon} alt="Converse Star" className="logo-icon" />
                <img src={fullLogo} alt="CONVERSE" className="logo-full" />
            </div>
            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => (isActive ? 'nav-item active' : 'nav-item')}
                    >
                        <div className="nav-icon-container">
                            <img src={item.icon} alt={item.label} className="nav-icon" />
                        </div>
                        <span className="nav-text">{item.label}</span>
                    </NavLink>
                ))}
            </nav>
            <div className="sidebar-footer">
                <NavLink to="/profile" className={({ isActive }) => (isActive ? 'user-profile active' : 'user-profile')}>
                    <div className="pfp-placeholder"></div>
                    <span className="user-name">User</span>
                </NavLink>
            </div>
        </div>
    );
};

export default Sidebar;
