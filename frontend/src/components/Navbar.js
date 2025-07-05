// frontend/src/components/Navbar.js

import React from 'react';
import logo from '../logo-dhl-style.png'; // Yeni logomuzu import ediyoruz
import { FaGlobe, FaUserCircle } from 'react-icons/fa'; // Dil ve profil ikonları

const Navbar = ({ user, onLoginClick, onLogoutClick }) => {
  return (
    <nav className="navbar-dhl">
      <div className="navbar-left">
        <img src={logo} alt="MS-Cargo Logo" className="navbar-logo-dhl" />
        <a href="#track" className="nav-link active">Track</a>
        <a href="#ship" className="nav-link">Ship</a>
        <a href="#logistics" className="nav-link">Enterprise Logistics Services</a>
        <a href="#customer" className="nav-link">Customer Service</a>
      </div>
      <div className="navbar-right">
        <a href="#find" className="nav-link-right">Find a Location</a>
        <a href="#search" className="nav-link-right">Search</a>
        <div className="language-selector">
          <FaGlobe className="globe-icon" />
          <span>Turkey</span>
          <div className="language-options">
            <a href="#en">EN</a>
            <a href="#tr" className="active-lang">TR</a>
          </div>
        </div>
        <div className="portal-login">
          {user ? (
            <div className="user-info">
              <span>Welcome, {user}!</span>
              <button onClick={onLogoutClick} className="logout-btn-dhl">Log Out</button>
            </div>
          ) : (
            <div onClick={onLoginClick} className="login-trigger">
              <FaUserCircle className="user-icon" />
              <span>Customer Portal Logins</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;