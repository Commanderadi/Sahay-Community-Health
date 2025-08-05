import React, { useState } from 'react';
import axios from 'axios';

// API base URL - supports both Netlify functions and Render backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? (process.env.REACT_APP_USE_RENDER === 'true' 
        ? 'https://sahay-backend.onrender.com' 
        : '/.netlify/functions/api')
    : 'http://localhost:5000');

function AddClinic({ onClinicAdded, setMessage }) {
  const [form, setForm] = useState({ name: '', city: '', contact: '', addedBy: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.city || !form.contact) {
      setMessage("❌ All fields are required.");
      return;
    }

    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    axios.post(`${API_BASE_URL}/api/clinics/add`, form, { headers })
      .then(() => {
        setMessage("✅ Clinic added successfully.");
        setForm({ name: '', city: '', contact: '', addedBy: '' });
        onClinicAdded();
      })
      .catch(() => setMessage("❌ Failed to add clinic."));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>➕ Add New Clinic</h3>
      
      <div className="form-group">
        <label htmlFor="name">🏥 Clinic Name *</label>
        <input
          id="name"
          name="name"
          type="text"
          placeholder="Enter clinic name"
          value={form.name}
          onChange={handleChange}
          required
          autoComplete="organization"
          aria-describedby="name-help"
        />
        <div id="name-help" className="sr-only">Enter the name of the healthcare clinic</div>
      </div>

      <div className="form-group">
        <label htmlFor="city">📍 City *</label>
        <input
          id="city"
          name="city"
          type="text"
          placeholder="Enter city name"
          value={form.city}
          onChange={handleChange}
          required
          autoComplete="address-level2"
          aria-describedby="city-help"
        />
        <div id="city-help" className="sr-only">Enter the city where the clinic is located</div>
      </div>

      <div className="form-group">
        <label htmlFor="contact">📞 Contact Information *</label>
        <input
          id="contact"
          name="contact"
          type="text"
          placeholder="Phone number or email"
          value={form.contact}
          onChange={handleChange}
          required
          autoComplete="tel"
          aria-describedby="contact-help"
        />
        <div id="contact-help" className="sr-only">Enter phone number or email for clinic contact</div>
      </div>

      <div className="form-group">
        <label htmlFor="addedBy">👤 Added By</label>
        <input
          id="addedBy"
          name="addedBy"
          type="text"
          placeholder="Your name or organization"
          value={form.addedBy}
          onChange={handleChange}
          autoComplete="name"
          aria-describedby="addedBy-help"
        />
        <div id="addedBy-help" className="sr-only">Enter your name or organization name</div>
      </div>

      <button 
        type="submit"
        aria-label="Add new clinic to the database"
      >
        ➕ Add Clinic
      </button>
    </form>
  );
}

export default AddClinic;
