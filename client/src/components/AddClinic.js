import React, { useState } from 'react';
import axios from 'axios';

function AddClinic({ onClinicAdded, setMessage }) {
  const [form, setForm] = useState({ name: '', city: '', contact: '', addedBy: '' });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.city || !form.contact) {
      setMessage("❌ All fields are required.");
      return;
    }

    axios.post('http://localhost:5000/api/clinics/add', form)
      .then(() => {
        setMessage("✅ Clinic added successfully.");
        setForm({ name: '', city: '', contact: '', addedBy: '' });
        onClinicAdded();
      })
      .catch(() => setMessage("❌ Failed to add clinic."));
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Add Clinic</h3>
      <input name="name" placeholder="Clinic Name" value={form.name} onChange={handleChange} />
      <input name="city" placeholder="City" value={form.city} onChange={handleChange} />
      <input name="contact" placeholder="Contact" value={form.contact} onChange={handleChange} />
      <input name="addedBy" placeholder="Added By" value={form.addedBy} onChange={handleChange} />
      <button type="submit">Add Clinic</button>
    </form>
  );
}

export default AddClinic;
