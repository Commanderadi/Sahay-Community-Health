import React, { useState } from 'react';
import axios from 'axios';

// API base URL - supports both Netlify functions and Render backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? (process.env.REACT_APP_USE_RENDER === 'true' 
        ? 'https://sahay-backend.onrender.com' 
        : '/.netlify/functions/api')
    : 'http://localhost:5000');

function Register({ onRegistered }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'NGO'
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await axios.post(`${API_BASE_URL}/api/auth/register`, formData);
      alert('✅ Registration successful! You can now log in.');
      onRegistered(); // switch to login
    } catch (err) {
      if (err.response && err.response.data && err.response.data.error) {
        alert(`❌ Registration failed: ${err.response.data.error}`);
      } else {
        alert('❌ Registration failed: Server error');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>📝 Create Account</h2>
      
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
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">🔒 Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Create a strong password"
          value={formData.password}
          onChange={handleChange}
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="role">👥 Role</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
        >
          <option value="NGO">🏥 NGO (Non-Governmental Organization)</option>
          <option value="Admin">👨‍💼 Admin (Administrator)</option>
        </select>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? '🔄 Creating account...' : '📝 Create Account'}
      </button>
    </form>
  );
}

export default Register;
