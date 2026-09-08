import React, { useState } from 'react';
import api from '../api';

function AddClinic({ onClinicAdded, setMessage }) {
  const [form, setForm] = useState({ name: '', city: '', contact: '', addedBy: '' });
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.city || !form.contact) {
      setMessage('❌ Name, city and contact are required.');
      return;
    }

    setSubmitting(true);
    api.post('/api/clinics/add', form)
      .then(() => {
        setMessage('✅ Clinic added successfully.');
        setForm({ name: '', city: '', contact: '', addedBy: '' });
        onClinicAdded();
      })
      .catch((err) => setMessage(`❌ ${err.response?.data?.error || 'Failed to add clinic.'}`))
      .finally(() => setSubmitting(false));
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
        />
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
        />
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
        />
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
        />
      </div>

      <button type="submit" disabled={submitting} aria-label="Add new clinic to the database">
        {submitting ? '🔄 Adding...' : '➕ Add Clinic'}
      </button>
    </form>
  );
}

export default AddClinic;
