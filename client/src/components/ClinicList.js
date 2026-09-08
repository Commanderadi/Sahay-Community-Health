import React from 'react';
import api from '../api';

function ClinicList({ clinics, onDelete, setMessage }) {
  const handleDelete = (id) => {
    if (!window.confirm('Delete this clinic? This cannot be undone.')) return;

    api.delete(`/api/clinics/${id}`)
      .then(() => {
        setMessage('✅ Clinic deleted successfully.');
        onDelete();
      })
      .catch((err) => setMessage(`❌ ${err.response?.data?.error || 'Failed to delete clinic.'}`));
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
              <p><span className="icon">📅</span> <strong>Added:</strong> {clinic.createdAt ? new Date(clinic.createdAt).toLocaleDateString() : '—'}</p>
            </div>
          </div>
          <div className="clinic-actions">
            <button
              className="danger"
              onClick={() => handleDelete(clinic._id)}
              aria-label={`Delete clinic: ${clinic.name}`}
            >
              🗑️ Delete Clinic
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ClinicList;
