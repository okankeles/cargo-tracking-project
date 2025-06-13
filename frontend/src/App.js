// frontend/src/App.js
import React, { useState } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const testPublicEndpoint = async () => {
    try {
      setError('');
      // NGINX Gateway'imiz sayesinde, sanki aynı sunucudaymış gibi istek atıyoruz.
      const response = await axios.get('/api/tracking/public');
      setMessage(response.data.message);
    } catch (err) {
      setError('Failed to fetch from public endpoint.');
      setMessage('');
    }
  };

  const testPrivateEndpoint = async () => {
    // Bu kısım şimdilik token olmadan denenecek ve hata vermesi beklenir.
    try {
      setError('');
      const response = await axios.get('/api/tracking/shipments/XYZ123');
      setMessage(response.data.message);
    } catch (err) {
      setError('Access Denied! As expected, token is required.');
      setMessage('');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Cargo Tracking System</h1>
        <div className="button-container">
          <button onClick={testPublicEndpoint}>Test Public Endpoint</button>
          <button onClick={testPrivateEndpoint}>Test Private Endpoint (No Token)</button>
        </div>
        {message && <p className="success-message">{message}</p>}
        {error && <p className="error-message">{error}</p>}
      </header>
    </div>
  );
}

export default App;