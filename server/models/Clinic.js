const mongoose = require('mongoose');

const ClinicSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  city: { type: String, required: true, trim: true },
  contact: { type: String, required: true, trim: true },
  addedBy: { type: String, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Clinic', ClinicSchema);
