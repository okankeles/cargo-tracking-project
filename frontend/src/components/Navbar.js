import React from 'react';
import logo from '../logo.png';

const Navbar = ({ user, onLoginClick, onLogoutClick }) => {
  return (
    <nav className="navbar">
      <img src={logo} alt="MS-Cargo Logo" className="navbar-logo" />
      <div className="navbar-user-section">
        {user ? (
          <>
            <span className="navbar-welcome">Welcome, {user}!</span>
            <button onClick={onLogoutClick} className="navbar-logout">Log Out</button>
          </>
        ) : (
          <span className="navbar-profile-icon" onClick={onLoginClick} title="Login / Register">
            👤
          </span>
        )}
      </div>
    </nav>
  );
};

export default Navbar;