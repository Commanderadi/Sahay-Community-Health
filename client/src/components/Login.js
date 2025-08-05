import React, { useState } from 'react';
import axios from 'axios';

// API base URL - supports both Netlify functions and Render backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? (process.env.REACT_APP_USE_RENDER === 'true' 
        ? 'https://sahay-backend.onrender.com' 
        : '/.netlify/functions/api')
    : 'http://localhost:5000');

function Login({ onLogin }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await axios.post(`${API_BASE_URL}/api/auth/login`, formData);
      const { token, role } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      onLogin({ token, role });
    } catch (err) {
      alert('❌ Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>🔐 Login to Sahay</h2>
      
      <div className="form-group">
        <label htmlFor="email">📧 Email Address</label>
        <input
          id="email"
          name="email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={handleChange}
          required
          autoComplete="email"
          aria-describedby="email-help"
        />
        <div id="email-help" className="sr-only">Enter your registered email address</div>
      </div>

      <div className="form-group">
        <label htmlFor="password">🔒 Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Enter your password"
          value={formData.password}
          onChange={handleChange}
          required
          autoComplete="current-password"
          aria-describedby="password-help"
        />
        <div id="password-help" className="sr-only">Enter your account password</div>
      </div>

      <button 
        type="submit" 
        disabled={loading}
        aria-label={loading ? 'Logging in, please wait' : 'Login to your account'}
      >
        {loading ? '🔄 Logging in...' : '🔐 Login'}
      </button>
    </form>
  );
}

export default Login;
