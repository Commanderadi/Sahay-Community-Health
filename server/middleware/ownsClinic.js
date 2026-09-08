const Clinic = require('../models/Clinic');

// Must run after verifyToken. Allows the request through only if the caller
// is an Admin or the clinic's owner. Legacy clinics with no owner are
// editable by any authenticated user (so pre-ownership data isn't stranded).
const ownsClinic = async (req, res, next) => {
  try {
    const clinic = await Clinic.findById(req.params.id);
    if (!clinic) return res.status(404).json({ error: 'Clinic not found' });

    const isAdmin = req.user.role === 'Admin';
    const isOwner =
      clinic.owner && String(clinic.owner) === String(req.user.userId);
    const isLegacy = !clinic.owner;

    if (!isAdmin && !isOwner && !isLegacy) {
      return res
        .status(403)
        .json({ error: 'You can only modify clinics you added.' });
    }

    req.clinic = clinic;
    next();
  } catch (err) {
    console.error('Ownership check error:', err);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = ownsClinic;
