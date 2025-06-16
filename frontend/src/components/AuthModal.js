import React, { useState } from 'react';
import axios from 'axios';

const AuthModal = ({ onLoginSuccess, onClose }) => {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      await axios.post('/api/users/register', { email, password });
      setError('Registration successful! Please log in.');
      setIsLoginView(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/users/login', { email, password });
      onLoginSuccess(res.data.token, email);
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="close-modal" onClick={onClose}>×</button>
        {isLoginView ? (
          <form onSubmit={handleLogin} className="auth-form">
            <h2>Login</h2>
            {error && <p className="api-response">{error}</p>}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Login</button>
            <p className="auth-toggle">Don't have an account? <span onClick={() => { setIsLoginView(false); setError(''); }}>Register</span></p>
          </form>
        ) : (
          <form onSubmit={handleRegister} className="auth-form">
            <h2>Register</h2>
            {error && <p className="api-response">{error}</p>}
            <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
            <button type="submit">Register</button>
            <p className="auth-toggle">Already have an account? <span onClick={() => { setIsLoginView(true); setError(''); }}>Login</span></p>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthModal;