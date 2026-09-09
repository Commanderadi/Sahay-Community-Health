/**
 * Remove the original demo/seed clinics from the Clinic collection.
 *
 * These are the 15 generic placeholder records (each was inserted twice) that
 * shipped as sample data — "Primary Care Clinic", "Rural Medical Center",
 * "Dental Care Center", etc. They're identified by their fake `addedBy` labels.
 *
 * Real data (the Mumbai govt hospital import, and any user-added clinic) is
 * left untouched.
 *
 * Usage (from server/):
 *   node scripts/remove-demo-clinics.js            # dry run
 *   node scripts/remove-demo-clinics.js --commit   # actually delete
 */

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Clinic = require('../models/Clinic');

const COMMIT = process.argv.includes('--commit');

// The demo seed used these as the `addedBy` free-text label.
const DEMO_ADDED_BY = [
  'Sahay Admin',
  'Health NGO',
  'Community Health Worker',
  "Women's Health NGO",
  'Child Health Foundation',
  'Emergency Response Team',
  'Mental Health NGO',
  'Dental Health Initiative',
  'Senior Care Foundation',
  'Public Health Department',
  'Maternal Health NGO',
  'Vision Care Foundation',
  'Rehabilitation NGO',
  'Traditional Medicine NGO',
  'Mobile Health Initiative',
];

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI missing (server/.env). Aborting.');
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log('MongoDB connected\n');

  const filter = { addedBy: { $in: DEMO_ADDED_BY }, owner: null };

  const matches = await Clinic.find(filter).select('name city addedBy').lean();
  const before = await Clinic.countDocuments();

  console.log(`Total clinics:        ${before}`);
  console.log(`Demo clinics matched: ${matches.length}\n`);
  console.log('--- Will delete ---');
  for (const c of matches) console.log(`  ${c.city} | ${c.name}  (addedBy: ${c.addedBy})`);

  if (!COMMIT) {
    console.log('\nDry run. Re-run with --commit to delete.');
    await mongoose.disconnect();
    return;
  }

  const res = await Clinic.deleteMany(filter);
  const after = await Clinic.countDocuments();
  console.log(`\nDeleted ${res.deletedCount}. Clinics now: ${after}.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
