const express = require('express');
const router = express.Router();
const Clinic = require('../models/Clinic');
const verifyToken = require('../middleware/auth');
const ownsClinic = require('../middleware/ownsClinic');

// Escape user input before using it in a RegExp to avoid regex injection
// and catastrophic backtracking.
const escapeRegex = (str) => String(str).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Whitelist the fields a client is allowed to set, and coerce their types.
function sanitizeBody(body = {}) {
  const out = {};
  const str = (v) => (v == null ? '' : String(v).trim());

  if ('name' in body) out.name = str(body.name);
  if ('city' in body) out.city = str(body.city);
  if ('contact' in body) out.contact = str(body.contact);
  if ('address' in body) out.address = str(body.address);
  if ('hours' in body) out.hours = str(body.hours);
  if ('notes' in body) out.notes = str(body.notes);
  if ('addedBy' in body) out.addedBy = str(body.addedBy);

  if ('services' in body) {
    const list = Array.isArray(body.services)
      ? body.services
      : str(body.services).split(',');
    out.services = list.map((s) => String(s).trim()).filter(Boolean).slice(0, 30);
  }

  if ('lat' in body) {
    const n = Number(body.lat);
    out.lat = Number.isFinite(n) && n >= -90 && n <= 90 ? n : null;
  }
  if ('lng' in body) {
    const n = Number(body.lng);
    out.lng = Number.isFinite(n) && n >= -180 && n <= 180 ? n : null;
  }

  return out;
}

// Create clinic (protected)
router.post('/add', verifyToken, async (req, res) => {
  try {
    const data = sanitizeBody(req.body);
    if (!data.name || !data.city || !data.contact) {
      return res.status(400).json({ error: 'Name, city and contact are required' });
    }

    const saved = await new Clinic({
      ...data,
      addedBy: data.addedBy || req.user.email || undefined,
      owner: req.user.userId,
      ownerEmail: req.user.email || '',
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

// Get one clinic
router.get('/:id', async (req, res) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });
    res.json(clinic);
  } catch (err) {
    console.error('Fetch clinic error:', err);
    res.status(500).json({ error: 'Error fetching clinic' });
  }
});

// Update clinic (protected + ownership)
router.put('/:id', verifyToken, ownsClinic, async (req, res) => {
  try {
    const data = sanitizeBody(req.body);
    Object.assign(req.clinic, data);
    const updated = await req.clinic.save();
    res.json(updated);
  } catch (err) {
    console.error('Update clinic error:', err);
    res.status(500).json({ error: 'Error updating clinic' });
  }
});

// Delete clinic (protected + ownership)
router.delete('/:id', verifyToken, ownsClinic, async (req, res) => {
  try {
    await req.clinic.deleteOne();
    res.json({ message: 'Clinic deleted successfully' });
  } catch (err) {
    console.error('Delete clinic error:', err);
    res.status(500).json({ error: 'Error deleting clinic' });
  }
});

module.exports = router;
