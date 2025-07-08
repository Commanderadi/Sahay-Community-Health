import React, { useState } from 'react';
import axios from 'axios';

function Register({ onRegistered }) {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    role: 'NGO'
  });

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auth/register', formData);
      alert('Registration successful. You can now log in.');
      onRegistered(); // switch to login
    } catch (err) {
  if (err.response && err.response.data && err.response.data.error) {
    alert(`Registration failed: ${err.response.data.error}`);
  } else {
    alert('Registration failed: Server error');
  }
}

  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
      <h2>Register</h2>
      <input
        name="email"
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
      /><br />
      <input
        name="password"
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={handleChange}
        required
      /><br />
      <select name="role" value={formData.role} onChange={handleChange}>
        <option value="NGO">NGO</option>
        <option value="Admin">Admin</option>
      </select><br />
      <button type="submit">Register</button>
    </form>
  );
}

export default Register;
