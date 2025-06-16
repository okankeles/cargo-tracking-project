import React, { useState, useEffect } from 'react';
import './App.css';
import Navbar from './components/Navbar';
import AuthModal from './components/AuthModal';
import TrackShipment from './components/TrackShipment';

function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(localStorage.getItem('user'));
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      localStorage.setItem('user', user);
    } else {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }, [token, user]);

  const handleLoginSuccess = (newToken, email) => {
    setToken(newToken);
    setUser(email);
    setIsModalOpen(false);
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <>
      <Navbar
        user={user}
        onLoginClick={() => setIsModalOpen(true)}
        onLogoutClick={handleLogout}
      />
      <main className="main-content">
        <TrackShipment token={token} />
      </main>
      {isModalOpen && !token && (
        <AuthModal
          onLoginSuccess={handleLoginSuccess}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}

export default App;