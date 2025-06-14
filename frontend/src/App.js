import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  // State yönetimi: formlar için ayrı state'ler
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [trackingId, setTrackingId] = useState('');

  // Oturum ve mesajlar için state'ler
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [apiResponse, setApiResponse] = useState('');
  const [shipmentStatus, setShipmentStatus] = useState('');

  // --- API Fonksiyonları ---

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/users/register', { email: registerEmail, password: registerPassword });
      setApiResponse(`Registration successful for ${response.data.email}! Please log in.`);
      setShipmentStatus('');
    } catch (error) {
      setApiResponse(error.response?.data?.error || 'Registration failed.');
      setShipmentStatus('');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/users/login', { email: loginEmail, password: loginPassword });
      setToken(response.data.token);
      setUser(loginEmail);
      setApiResponse(''); // Başarılı girişte eski mesajları temizle
      setShipmentStatus('');
    } catch (error) {
      setApiResponse(error.response?.data?.error || 'Login failed.');
      setShipmentStatus('');
    }
  };

  const handleLogout = () => {
    setToken(null);
    setUser(null);
    setApiResponse('You have been logged out.');
    setShipmentStatus('');
  };

  const handleTrackShipment = async (e) => {
    e.preventDefault();
    if (!token) {
      setShipmentStatus('You must be logged in to track a shipment.');
      return;
    }
    try {
      const response = await axios.get(`/api/tracking/shipments/${trackingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setShipmentStatus(`Status for ${response.data.trackingId}: ${response.data.status} at ${response.data.location}`);
      setApiResponse('');
    } catch (error) {
      setShipmentStatus(error.response?.data?.error || 'Failed to track shipment.');
      setApiResponse('');
    }
  };

  // --- JSX (Arayüz) ---

  return (
    <div className="App">
      <div className="main-container">
        {/* Kullanıcı giriş yapmışsa, hoşgeldin mesajı ve çıkış butonu üstte görünür */}
        {token && (
          <div className="loggedIn-header">
            <span className="welcome-message">Welcome, {user}!</span>
            <button onClick={handleLogout} className="logout-button">Log Out</button>
          </div>
        )}
        
        <h1>Cargo Tracking System</h1>

        {/* API'den gelen genel mesajları gösteren alan */}
        {apiResponse && <p className="api-response">{apiResponse}</p>}

        {/* Kullanıcı giriş yapmamışsa Login/Register formlarını göster */}
        {!token ? (
          <div className="form-container">
            {/* Login Form */}
            <form onSubmit={handleLogin}>
              <h2>Login</h2>
              <input
                type="email"
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required
              />
              <button type="submit">Login</button>
            </form>

            {/* Register Form */}
            <form onSubmit={handleRegister}>
              <h2>Register</h2>
              <input
                type="email"
                placeholder="Email"
                value={registerEmail}
                onChange={(e) => setRegisterEmail(e.target.value)}
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={registerPassword}
                onChange={(e) => setRegisterPassword(e.target.value)}
                required
              />
              <button type="submit">Register</button>
            </form>
          </div>
        ) : (
          // Kullanıcı giriş yapmışsa Tracking formunu göster
          <div>
            <form onSubmit={handleTrackShipment}>
              <h2>Track Your Shipment</h2>
              <input
                type="text"
                placeholder="Enter a tracking number..."
                value={trackingId}
                onChange={(e) => setTrackingId(e.target.value)}
                required
              />
              <button type="submit">Track</button>
            </form>
            {/* Kargo durumunu gösteren alan */}
            {shipmentStatus && <p className="shipment-status">{shipmentStatus}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;