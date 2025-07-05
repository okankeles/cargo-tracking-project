import React from 'react';
import logo from '../logo-dhl-style.png';
import { FaGlobe, FaUserCircle, FaChevronDown } from 'react-icons/fa';

// Yeni prop'ları alıyoruz: currentLang, onChangeLang
const Navbar = ({ user, onLoginClick, onLogoutClick, currentLang, onChangeLang }) => {
  
  const handleLanguageChange = (e, lang) => {
    e.preventDefault(); // Sayfanın en üstüne atlamasını engelle
    onChangeLang(lang);
  };

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
            {/* 'active-lang' sınıfını dinamik olarak ata ve onClick olayını yönet */}
            <a href="#en" 
               className={currentLang === 'en' ? 'active-lang' : ''} 
               onClick={(e) => handleLanguageChange(e, 'en')}>EN</a>
            <a href="#tr" 
               className={currentLang === 'tr' ? 'active-lang' : ''} 
               onClick={(e) => handleLanguageChange(e, 'tr')}>TR</a>
          </div>
        </div>
        <div className="portal-login">
          {user ? (
            <div className="user-info">
              <span>Welcome, {user}!</span>
              <button onClick={onLogoutClick} className="logout-btn-dhl">Log Out</button>
            </div>
          ) : (
            <div onClick={onLoginClick} className="portal-login-minimal" title="Login / Register">
              <FaUserCircle className="user-icon" />
              <FaChevronDown className="user-icon-arrow" />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;