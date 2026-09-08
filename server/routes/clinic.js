const express = require('express');
const router = express.Router();
const Clinic = require('../models/Clinic');
const verifyToken = require('../middleware/auth');

// Escape user input before using it in a RegExp to avoid regex injection
// and catastrophic backtracking.
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Create clinic (protected)
router.post('/add', verifyToken, async (req, res) => {
  try {
    const { name, city, contact } = req.body || {};
    if (!name || !city || !contact) {
      return res.status(400).json({ error: 'Name, city and contact are required' });
    }

    const saved = await new Clinic({
      name: String(name).trim(),
      city: String(city).trim(),
      contact: String(contact).trim(),
      addedBy: req.body.addedBy ? String(req.body.addedBy).trim() : undefined,
    }).save();

    res.status(201).json(saved);
  } catch (err) {
    console.error('Add clinic error:', err);
    res.status(500).json({ error: 'Error adding clinic' });
  }
});

// Get all clinics
router.get('/', async (req, res) => {
  try {
    const clinics = await Clinic.find().sort({ createdAt: -1 });
    res.json(clinics);
  } catch (err) {
    console.error('Fetch clinics error:', err);
    res.status(500).json({ error: 'Error fetching clinics' });
  }
});

// Search clinics by name or city
router.get('/search', async (req, res) => {
  const { query } = req.query;
  if (!query || !String(query).trim()) {
    return res.status(400).json({ error: 'Search query is required' });
  }

  try {
    const pattern = new RegExp(escapeRegex(query.trim()), 'i');
    const results = await Clinic.find({
      $or: [{ name: pattern }, { city: pattern }],
    }).sort({ createdAt: -1 });
    res.json(results);
  } catch (err) {
    console.error('Search error:', err);
    res.status(500).json({ error: 'Search failed' });
  }
});

// Update clinic (protected)
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const updated = await Clinic.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ error: 'Clinic not found' });
    res.json(updated);
  } catch (err) {
    console.error('Update clinic error:', err);
    res.status(500).json({ error: 'Error updating clinic' });
  }
});

// Delete clinic (protected)
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await Clinic.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Clinic not found' });
    res.json({ message: 'Clinic deleted successfully' });
  } catch (err) {
    console.error('Delete clinic error:', err);
    res.status(500).json({ error: 'Error deleting clinic' });
  }
});

module.exports = router;
