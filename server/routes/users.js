const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Clinic = require('../models/Clinic');
const verifyToken = require('../middleware/auth');
const requireAdmin = require('../middleware/requireAdmin');

const ROLES = ['NGO', 'Admin'];

// All routes here require an authenticated Admin.
router.use(verifyToken, requireAdmin);

// List users with a clinic count each.
router.get('/', async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ email: 1 }).lean();
    const counts = await Clinic.aggregate([
      { $match: { owner: { $ne: null } } },
      { $group: { _id: '$owner', count: { $sum: 1 } } },
    ]);
    const byOwner = new Map(counts.map((c) => [String(c._id), c.count]));
    res.json(
      users.map((u) => ({ ...u, clinicCount: byOwner.get(String(u._id)) || 0 })),
    );
  } catch (err) {
    console.error('List users error:', err);
    res.status(500).json({ error: 'Error listing users' });
  }
});

// Change a user's role.
router.put('/:id/role', async (req, res) => {
  try {
    const { role } = req.body || {};
    if (!ROLES.includes(role)) {
      return res.status(400).json({ error: `Role must be one of: ${ROLES.join(', ')}` });
    }
    if (String(req.params.id) === String(req.user.userId)) {
      return res.status(400).json({ error: 'You cannot change your own role.' });
    }
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select('-password');
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (err) {
    console.error('Update role error:', err);
    res.status(500).json({ error: 'Error updating role' });
  }
});

// Delete a user. Their clinics are kept but orphaned (owner cleared).
router.delete('/:id', async (req, res) => {
  try {
    if (String(req.params.id) === String(req.user.userId)) {
      return res.status(400).json({ error: 'You cannot delete your own account here.' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    await Clinic.updateMany({ owner: user._id }, { owner: null });
    res.json({ message: 'User deleted' });
  } catch (err) {
    console.error('Delete user error:', err);
    res.status(500).json({ error: 'Error deleting user' });
  }
});

module.exports = router;
