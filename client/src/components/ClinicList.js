import React from 'react';
import axios from 'axios';

function ClinicList({ clinics, onDelete, role, setMessage }) {
  const handleDelete = (id) => {
    axios.delete(`http://localhost:5000/api/clinics/${id}`)
      .then(() => {
        setMessage("✅ Clinic deleted.");
        onDelete();
      })
      .catch(() => setMessage("❌ Failed to delete."));
  };

  return (
    <div>
      <h3>Clinic List</h3>
      {clinics.map((cl, index) => (
        <div key={index} className="clinic-card">
          <p><strong>{cl.name}</strong> – {cl.city}</p>
          <p>📞 {cl.contact} | 🧾 Added by: {cl.addedBy}</p>
          {role !== 'Visitor' && (
            <button onClick={() => handleDelete(cl._id)}>Delete</button>
          )}
        </div>
      ))}
    </div>
  );
}

export default ClinicList;
