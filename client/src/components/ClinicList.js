import React from 'react';
import axios from 'axios';

// API base URL - supports both Netlify functions and Render backend
const API_BASE_URL = process.env.REACT_APP_API_URL || 
  (process.env.NODE_ENV === 'production' 
    ? (process.env.REACT_APP_USE_RENDER === 'true' 
        ? 'https://sahay-backend.onrender.com' 
        : '/.netlify/functions/api')
    : 'http://localhost:5000');

function ClinicList({ clinics, onDelete, role, setMessage }) {
  const handleDelete = (id) => {
    const token = localStorage.getItem('token');
    const headers = { Authorization: `Bearer ${token}` };

    axios.delete(`${API_BASE_URL}/api/clinics/${id}`, { headers })
      .then(() => {
        setMessage("✅ Clinic deleted successfully.");
        onDelete();
      })
      .catch(() => setMessage("❌ Failed to delete clinic."));
  };

  if (clinics.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: '#4a5568' }}>
        <h3>🏥 No Clinics Found</h3>
        <p>No clinics have been added yet. Be the first to add a clinic!</p>
      </div>
    );
  }

  return (
    <div>
      <h3>🏥 Clinic Directory ({clinics.length} clinics)</h3>
      {clinics.map((clinic, index) => (
        <div key={clinic._id || index} className="clinic-card">
          <h4>🏥 {clinic.name}</h4>
          <div className="clinic-info">
            <div>
              <p><span className="icon">📍</span> <strong>City:</strong> {clinic.city}</p>
              <p><span className="icon">📞</span> <strong>Contact:</strong> {clinic.contact}</p>
            </div>
            <div>
              <p><span className="icon">👤</span> <strong>Added by:</strong> {clinic.addedBy || 'Unknown'}</p>
              <p><span className="icon">📅</span> <strong>Added:</strong> {new Date(clinic.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          {role !== 'Visitor' && (
            <div className="clinic-actions">
              <button 
                className="danger" 
                onClick={() => handleDelete(clinic._id)}
                aria-label={`Delete clinic: ${clinic.name}`}
              >
                🗑️ Delete Clinic
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default ClinicList;
