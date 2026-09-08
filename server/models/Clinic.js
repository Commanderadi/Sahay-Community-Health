const mongoose = require('mongoose');

const ClinicSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    contact: { type: String, required: true, trim: true },

    // Optional richer details.
    address: { type: String, trim: true, default: '' },
    services: { type: [String], default: [] },
    hours: { type: String, trim: true, default: '' },
    notes: { type: String, trim: true, default: '' },
    lat: { type: Number, default: null },
    lng: { type: Number, default: null },

    // Free-text label kept for backwards compatibility / display.
    addedBy: { type: String, trim: true },
    // Ownership: who created it. Used to gate edit/delete.
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    ownerEmail: { type: String, trim: true, default: '' },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Clinic', ClinicSchema);
