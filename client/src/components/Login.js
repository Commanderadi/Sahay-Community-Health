import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [formData, setFormData] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      const { token, role } = res.data;
      localStorage.setItem('token', token);
      localStorage.setItem('role', role);
      onLogin({ token, role });
    } catch (err) {
      alert('Invalid credentials');
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
      <h2>Login</h2>
      <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
      <br />
      <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
      <br />
      <button type="submit">Login</button>
    </form>
  );
}

export default Login;
