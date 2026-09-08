import React, { useState } from 'react';
import api from '../api';

function Register({ onRegistered }) {
  const [formData, setFormData] = useState({ email: '', password: '', role: 'NGO' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/api/auth/register', formData);
      alert('✅ Registration successful! You can now log in.');
      onRegistered();
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed: server error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>📝 Create Account</h2>

      {error && <div className="message error">❌ {error}</div>}

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
        />
      </div>

      <div className="form-group">
        <label htmlFor="password">🔒 Password</label>
        <input
          id="password"
          name="password"
          type="password"
          placeholder="Create a strong password (min 8 characters)"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={8}
          autoComplete="new-password"
        />
      </div>

      <div className="form-group">
        <label htmlFor="role">👥 Role</label>
        <select id="role" name="role" value={formData.role} onChange={handleChange}>
          <option value="NGO">🏥 NGO (Non-Governmental Organization)</option>
          <option value="Admin">👨‍💼 Admin (Administrator)</option>
        </select>
      </div>

      <button
        type="submit"
        disabled={loading}
        aria-label={loading ? 'Creating account, please wait' : 'Create new account'}
      >
        {loading ? '🔄 Creating account...' : '📝 Create Account'}
      </button>
    </form>
  );
}

export default Register;
