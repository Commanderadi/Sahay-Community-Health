const mongoose = require('mongoose');

const ClinicSchema = new mongoose.Schema({
  name: String,
  city: String,
  contact: String,
  addedBy: String
}, { timestamps: true });

module.exports = mongoose.model('Clinic', ClinicSchema);
