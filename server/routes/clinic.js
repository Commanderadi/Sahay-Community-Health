const express = require('express');
const router = express.Router();
const Clinic = require('../models/Clinic');
const verifyToken = require('../middleware/auth');

// Create clinic (protected)
router.post('/add', verifyToken, async (req, res) => {
  try {
    const newClinic = new Clinic(req.body);
    const saved = await newClinic.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ error: 'Error adding clinic' });
  }
});

// Get all clinics
router.get('/', async (req, res) => {
  try {
    const clinics = await Clinic.find().sort({ createdAt: -1 });
    res.json(clinics);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching clinics' });
  }
});

// Search clinics
router.get('/search', async (req, res) => {
  const { query } = req.query;
  try {
    const results = await Clinic.find({
      $or: [
        { name: new RegExp(query, 'i') },
        { city: new RegExp(query, 'i') }
      ]
    });
    res.json(results);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// Update clinic (protected)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updatedClinic = await Clinic.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.json(updatedClinic);
  } catch (err) {
    res.status(500).json({ error: 'Error updating clinic' });
  }
});

// Delete clinic (protected)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    await Clinic.findByIdAndDelete(req.params.id);
    res.json({ message: 'Clinic deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Error deleting clinic' });
  }
});

module.exports = router;
