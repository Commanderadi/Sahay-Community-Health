/**
 * Import Mumbai government hospitals into the Clinic collection.
 *
 * Two sources are merged:
 *   1. hospital_directory.csv  — the National Hospital Directory (all-India).
 *      We take only Mumbai rows tagged "Public/ Government", then drop the
 *      handful that are actually private (mis-coded in the source data).
 *   2. A curated seed of major BMC / state / central hospitals that the CSV
 *      omits entirely (KEM, Sion/LTMG, JJ, Nair, Cooper, ...).
 *
 * All records are inserted as legacy/ownerless clinics (owner: null), so an
 * Admin can edit or delete them from the UI. Existing clinics with the same
 * name + city are skipped (case-insensitive).
 *
 * Usage (from repo root or server/):
 *   node server/scripts/import-mumbai-hospitals.js            # dry run, prints plan
 *   node server/scripts/import-mumbai-hospitals.js --commit   # actually insert
 *
 * Needs server/.env (MONGO_URI). Standalone scripts don't get index.js's DNS
 * fallback, so we set public resolvers here too.
 */

const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1']);

const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const Clinic = require('../models/Clinic');

const CSV_PATH = path.join(__dirname, '..', '..', 'hospital_directory.csv');
const COMMIT = process.argv.includes('--commit');
const CITY = 'Mumbai';
const ADDED_BY = 'Govt hospital import (National Hospital Directory + curated)';

// ---------------------------------------------------------------------------
// Minimal RFC-4180-ish CSV parser: handles "quoted" fields with embedded
// commas, escaped "" quotes, and literal \n inside a field.
// ---------------------------------------------------------------------------
function parseCsv(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const c = text[i];

    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
      continue;
    }

    if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\r') {
      // ignore; \n handles the break
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else {
      field += c;
    }
  }
  if (field.length || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows;
}

function cleanStr(v) {
  if (v == null) return '';
  const s = String(v).replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
  return s === '0' || s.toUpperCase() === 'NA' ? '' : s;
}

function parseCoords(raw) {
  const s = cleanStr(raw);
  if (!s || /error/i.test(s)) return { lat: null, lng: null };
  const m = s.match(/(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)/);
  if (!m) return { lat: null, lng: null };
  const lat = Number(m[1]);
  const lng = Number(m[2]);
  // Mumbai is roughly 18.85-19.30 N, 72.75-73.05 E. Reject anything outside
  // a generous India-wide box (the source has a few rows geocoded to Japan).
  if (lat < 6 || lat > 37 || lng < 68 || lng > 98) return { lat: null, lng: null };
  return { lat, lng };
}

function firstPhone(...vals) {
  for (const v of vals) {
    const s = cleanStr(v);
    if (s && /\d/.test(s)) return s;
  }
  return 'Not listed';
}

// ---------------------------------------------------------------------------
// CSV extraction
// ---------------------------------------------------------------------------
// Private hospitals the source wrongly tags "Public/ Government" for Mumbai.
const CSV_EXCLUDE = [
  /hiranandani/i,
  /hinduja/i,
  /holy spirit/i,
  /holy family/i,
  /nanavati/i,
  /shri vaishnav seva samaj/i,
];

function fromCsv() {
  if (!fs.existsSync(CSV_PATH)) {
    console.warn(`! CSV not found at ${CSV_PATH} — skipping CSV source.`);
    return [];
  }
  const rows = parseCsv(fs.readFileSync(CSV_PATH, 'utf8'));
  const header = rows.shift().map((h) => h.trim());
  const idx = (name) => header.indexOf(name);

  const iName = idx('Hospital_Name');
  const iCat = idx('Hospital_Category');
  const iCare = idx('Hospital_Care_Type');
  const iDistrict = idx('District');
  const iAddr = idx('Address_Original_First_Line');
  const iPin = idx('Pincode');
  const iTel = idx('Telephone');
  const iMob = idx('Mobile_Number');
  const iEmg = idx('Emergency_Num');
  const iCoord = idx('Location_Coordinates');
  const iSpec = idx('Specialties');
  const iFac = idx('Facilities');

  const out = [];
  for (const r of rows) {
    const district = cleanStr(r[iDistrict]);
    const category = cleanStr(r[iCat]);
    if (!/mumbai/i.test(district)) continue;
    if (!/public\/?\s*government/i.test(category)) continue;

    const name = cleanStr(r[iName]).replace(/\s*[-,]\s*$/, '');
    if (!name) continue;
    if (CSV_EXCLUDE.some((re) => re.test(name))) continue;

    const pin = cleanStr(r[iPin]);
    const addrParts = [cleanStr(r[iAddr]), pin && `Mumbai ${pin}`].filter(Boolean);
    const services = [cleanStr(r[iSpec]), cleanStr(r[iFac]), cleanStr(r[iCare])]
      .filter(Boolean)
      .join(', ')
      .split(/[,;/]/)
      .map((s) => s.trim())
      .filter(Boolean);

    out.push({
      name,
      city: CITY,
      contact: firstPhone(r[iTel], r[iMob], r[iEmg]),
      address: addrParts.join(', '),
      services: Array.from(new Set(services)).slice(0, 30),
      hours: '',
      notes: 'Source: National Hospital Directory (data.gov.in), category "Public/ Government".',
      ...parseCoords(r[iCoord]),
    });
  }
  return out;
}

// ---------------------------------------------------------------------------
// Curated seed — major Mumbai government hospitals missing from the CSV.
// Coordinates are approximate (rooftop-level, from public map data).
// ---------------------------------------------------------------------------
const SEED = [
  {
    name: 'Seth G.S. Medical College & KEM Hospital',
    contact: '022-24107000',
    address: 'Acharya Donde Marg, Parel, Mumbai 400012',
    services: ['Tertiary care', 'Emergency', 'Trauma', 'Teaching hospital', 'All specialties'],
    notes: 'BMC-run municipal tertiary teaching hospital.',
    lat: 19.0025, lng: 72.8419,
  },
  {
    name: 'Lokmanya Tilak Municipal General Hospital (Sion Hospital)',
    contact: '022-24076381',
    address: 'Dr. Babasaheb Ambedkar Road, Sion West, Mumbai 400022',
    services: ['Tertiary care', 'Emergency', 'Trauma', 'Burns', 'Teaching hospital'],
    notes: 'BMC-run municipal tertiary teaching hospital (LTMGH).',
    lat: 19.0407, lng: 72.8624,
  },
  {
    name: 'BYL Nair Charitable Hospital & TN Medical College',
    contact: '022-23027000',
    address: 'Dr. A.L. Nair Road, Mumbai Central, Mumbai 400008',
    services: ['Tertiary care', 'Emergency', 'Teaching hospital', 'Dental college'],
    notes: 'BMC-run municipal tertiary teaching hospital.',
    lat: 18.9782, lng: 72.8215,
  },
  {
    name: 'Sir Jamshedjee Jeejeebhoy (JJ) Hospital & Grant Medical College',
    contact: '022-23735555',
    address: 'JJ Marg, Off J.J. Flyover, Nagpada, Mumbai 400008',
    services: ['Tertiary care', 'Emergency', 'Trauma', 'Teaching hospital', 'State referral'],
    notes: 'Maharashtra state government tertiary teaching hospital.',
    lat: 18.9633, lng: 72.8330,
  },
  {
    name: 'HBT Trauma Care Municipal Hospital (Cooper Hospital)',
    contact: '022-26207256',
    address: 'Bhaktivedanta Swami Marg, Juhu, Vile Parle West, Mumbai 400056',
    services: ['Tertiary care', 'Trauma', 'Emergency', 'Teaching hospital'],
    notes: 'BMC-run municipal hospital, attached to HBT Medical College.',
    lat: 19.1075, lng: 72.8380,
  },
  {
    name: 'Rajawadi Municipal General Hospital',
    contact: '022-25102035',
    address: 'Rajawadi, Ghatkopar East, Mumbai 400077',
    services: ['Secondary care', 'Emergency', 'Maternity', 'General medicine', 'Surgery'],
    notes: 'BMC peripheral hospital.',
    lat: 19.0836, lng: 72.9109,
  },
  {
    name: 'Dr. R.N. Cooper / Bhagwati Municipal General Hospital',
    contact: '022-28932461',
    address: 'S.V. Road, Borivali West, Mumbai 400103',
    services: ['Secondary care', 'Emergency', 'Maternity', 'General medicine'],
    notes: 'BMC peripheral hospital, Borivali.',
    lat: 19.2340, lng: 72.8567,
  },
  {
    name: 'Shatabdi Municipal Hospital, Govandi',
    contact: '022-25562530',
    address: 'Deonar, Govandi East, Mumbai 400043',
    services: ['Secondary care', 'Maternity', 'General medicine', 'Emergency'],
    notes: 'BMC peripheral hospital.',
    lat: 19.0546, lng: 72.9235,
  },
  {
    name: 'Shatabdi Municipal Hospital, Kandivali',
    contact: '022-28874372',
    address: 'Charkop, Kandivali West, Mumbai 400067',
    services: ['Secondary care', 'Maternity', 'General medicine'],
    notes: 'BMC peripheral hospital.',
    lat: 19.2094, lng: 72.8302,
  },
  {
    name: 'Kasturba Hospital for Infectious Diseases',
    contact: '022-23083901',
    address: 'Sane Guruji Marg, Chinchpokli, Mumbai 400011',
    services: ['Infectious diseases', 'Isolation ward', 'Fever OPD'],
    notes: 'BMC infectious-diseases referral hospital.',
    lat: 18.9857, lng: 72.8288,
  },
  {
    name: 'Nowrosjee Wadia Maternity Hospital',
    contact: '022-24146962',
    address: 'Acharya Donde Marg, Parel, Mumbai 400012',
    services: ['Maternity', 'Obstetrics', 'Gynaecology', 'Neonatology'],
    notes: 'Public maternity hospital, Parel (adjacent to KEM).',
    lat: 19.0016, lng: 72.8430,
  },
  {
    name: 'Bai Jerbai Wadia Hospital for Children',
    contact: '022-24146964',
    address: 'Acharya Donde Marg, Parel, Mumbai 400012',
    services: ['Paediatrics', 'Paediatric surgery', 'Neonatology', 'PICU'],
    notes: 'Public children’s hospital, Parel.',
    lat: 19.0020, lng: 72.8437,
  },
  {
    name: 'Cama & Albless Hospital',
    contact: '022-22611648',
    address: 'Mahapalika Marg, Fort, Mumbai 400001',
    services: ['Maternity', 'Gynaecology', 'Obstetrics'],
    notes: 'Maharashtra state government women’s & children’s hospital.',
    lat: 18.9388, lng: 72.8322,
  },
  {
    name: 'St. George Hospital',
    contact: '022-22620344',
    address: 'P. D’Mello Road, near CSMT, Fort, Mumbai 400001',
    services: ['Secondary care', 'Emergency', 'General medicine', 'Surgery'],
    notes: 'Maharashtra state government hospital (GGMC group).',
    lat: 18.9436, lng: 72.8378,
  },
  {
    name: 'Gokuldas Tejpal (GT) Hospital',
    contact: '022-22621465',
    address: 'Lokmanya Tilak Marg, Dhobi Talao, Mumbai 400001',
    services: ['Secondary care', 'General medicine', 'Surgery', 'Emergency'],
    notes: 'Maharashtra state government hospital (GGMC group).',
    lat: 18.9464, lng: 72.8300,
  },
  {
    name: 'Regional Mental Hospital, Thane (Central Mental Hospital)',
    contact: '022-25334422',
    address: 'L.B.S. Marg, Thane West 400601',
    services: ['Psychiatry', 'Mental health', 'De-addiction'],
    notes: 'Maharashtra state government psychiatric hospital serving Mumbai region.',
    lat: 19.1905, lng: 72.9760,
  },
  {
    name: 'Group of TB Hospitals, Sewri (GTB Hospital)',
    contact: '022-24157089',
    address: 'Sewri Cross Road, Sewri, Mumbai 400015',
    services: ['Tuberculosis', 'Chest medicine', 'DR-TB care'],
    notes: 'BMC tuberculosis referral hospital.',
    lat: 18.9967, lng: 72.8583,
  },
  {
    name: 'Municipal Eye Hospital / GT Eye Wing',
    contact: '022-22620102',
    address: 'Dhobi Talao, Mumbai 400002',
    services: ['Ophthalmology', 'Cataract surgery', 'Eye OPD'],
    notes: 'Public eye-care unit, South Mumbai.',
    lat: 18.9461, lng: 72.8296,
  },
  {
    name: 'ESIC Hospital, Worli',
    contact: '022-24932800',
    address: 'Ganpatrao Kadam Marg, Worli, Mumbai 400018',
    services: ['ESIC beneficiaries', 'General medicine', 'Surgery', 'Maternity', 'Emergency'],
    notes: 'Employees’ State Insurance Corporation hospital.',
    lat: 19.0000, lng: 72.8180,
  },
  {
    name: 'ESIC Hospital, Andheri (Marol)',
    contact: '022-28503915',
    address: 'Marol Maroshi Road, Andheri East, Mumbai 400059',
    services: ['ESIC beneficiaries', 'General medicine', 'Surgery', 'Emergency'],
    notes: 'Employees’ State Insurance Corporation hospital.',
    lat: 19.1163, lng: 72.8790,
  },
  {
    name: 'ESIC Hospital, Mulund',
    contact: '022-25631515',
    address: 'L.B.S. Marg, Mulund West, Mumbai 400080',
    services: ['ESIC beneficiaries', 'General medicine', 'Surgery'],
    notes: 'Employees’ State Insurance Corporation hospital.',
    lat: 19.1725, lng: 72.9430,
  },
  {
    name: 'ESIC Hospital, Kandivali',
    contact: '022-28687070',
    address: 'Ekta Nagar, Charkop, Kandivali West, Mumbai 400067',
    services: ['ESIC beneficiaries', 'General medicine', 'Emergency'],
    notes: 'Employees’ State Insurance Corporation hospital.',
    lat: 19.2110, lng: 72.8290,
  },
  {
    name: 'Central Railway Hospital, Byculla (Dr. B.R. Ambedkar Memorial Hospital)',
    contact: '022-23004083',
    address: 'Sant Savta Marg, Byculla East, Mumbai 400027',
    services: ['Railway beneficiaries', 'General medicine', 'Surgery', 'Emergency'],
    notes: 'Central Railway zonal hospital.',
    lat: 18.9770, lng: 72.8340,
  },
  {
    name: 'Western Railway Central Hospital, Jagjivan Ram Hospital, Mumbai Central',
    contact: '022-23071794',
    address: 'Maratha Mandir Marg, Mumbai Central, Mumbai 400008',
    services: ['Railway beneficiaries', 'Tertiary care', 'Emergency', 'Surgery'],
    notes: 'Western Railway zonal hospital.',
    lat: 18.9713, lng: 72.8206,
  },
  {
    name: 'INHS Asvini (Naval Hospital)',
    contact: '022-22151527',
    address: 'R.C. Church, Colaba, Mumbai 400005',
    services: ['Armed-forces beneficiaries', 'Tertiary care', 'Emergency'],
    notes: 'Indian Navy hospital, Colaba.',
    lat: 18.9067, lng: 72.8147,
  },
  {
    name: 'Tata Memorial Hospital',
    contact: '022-24177000',
    address: 'Dr. E Borges Road, Parel, Mumbai 400012',
    services: ['Cancer care', 'Oncology', 'Radiotherapy', 'Surgical oncology', 'Research'],
    notes: 'Government-aided (Dept. of Atomic Energy) national cancer centre.',
    lat: 19.0048, lng: 72.8404,
  },
  {
    name: 'Bhabha Municipal General Hospital, Bandra',
    contact: '022-26422541',
    address: 'S.V. Road, Bandra West, Mumbai 400050',
    services: ['Secondary care', 'Maternity', 'General medicine', 'Emergency'],
    notes: 'BMC peripheral hospital.',
    lat: 19.0556, lng: 72.8402,
  },
  {
    name: 'Bhabha Municipal General Hospital, Kurla',
    contact: '022-26501235',
    address: 'Swadeshi Mill Road, Kurla East, Mumbai 400070',
    services: ['Secondary care', 'Maternity', 'General medicine', 'Emergency'],
    notes: 'BMC peripheral hospital.',
    lat: 19.0662, lng: 72.8880,
  },
  {
    name: 'M.W. Desai Municipal General Hospital, Malad',
    contact: '022-28822076',
    address: 'S.V. Road, Malad West, Mumbai 400064',
    services: ['Secondary care', 'Maternity', 'General medicine'],
    notes: 'BMC peripheral hospital.',
    lat: 19.1860, lng: 72.8440,
  },
  {
    name: 'V.N. Desai Municipal General Hospital, Santacruz',
    contact: '022-26185858',
    address: '86, S.V. Road, Santacruz East, Mumbai 400055',
    services: ['Secondary care', 'Maternity', 'General medicine', 'Emergency'],
    notes: 'BMC peripheral hospital.',
    lat: 19.0810, lng: 72.8510,
  },
];

function fromSeed() {
  return SEED.map((s) => ({
    name: s.name,
    city: CITY,
    contact: s.contact || 'Not listed',
    address: s.address || '',
    services: (s.services || []).slice(0, 30),
    hours: s.hours || '',
    notes: s.notes || '',
    lat: s.lat ?? null,
    lng: s.lng ?? null,
  }));
}

// ---------------------------------------------------------------------------
// Merge, dedupe, insert
// ---------------------------------------------------------------------------
function normKey(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
}

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('MONGO_URI missing (server/.env). Aborting.');
    process.exit(1);
  }

  const csvRecords = fromCsv();
  const seedRecords = fromSeed();

  // Dedupe within the incoming set (seed wins over CSV on name clash).
  const byKey = new Map();
  for (const r of csvRecords) byKey.set(normKey(r.name), { ...r, _src: 'csv' });
  for (const r of seedRecords) byKey.set(normKey(r.name), { ...r, _src: 'seed' });
  const incoming = [...byKey.values()];

  await mongoose.connect(uri);
  console.log('MongoDB connected\n');

  const existing = await Clinic.find({ city: CITY }).select('name').lean();
  const existingKeys = new Set(existing.map((c) => normKey(c.name)));

  const toInsert = incoming.filter((r) => !existingKeys.has(normKey(r.name)));
  const skipped = incoming.filter((r) => existingKeys.has(normKey(r.name)));

  const withCoords = toInsert.filter((r) => r.lat != null && r.lng != null).length;

  console.log(`CSV govt rows (Mumbai, cleaned): ${csvRecords.length}`);
  console.log(`Curated seed:                    ${seedRecords.length}`);
  console.log(`After dedupe:                    ${incoming.length}`);
  console.log(`Already in DB (skipped):         ${skipped.length}`);
  console.log(`Will insert:                     ${toInsert.length}  (${withCoords} with coordinates)\n`);

  console.log('--- Will insert ---');
  for (const r of toInsert) {
    const geo = r.lat != null ? `(${r.lat}, ${r.lng})` : '(no coords)';
    console.log(`  [${r._src}] ${r.name}  ${geo}`);
  }
  if (skipped.length) {
    console.log('\n--- Skipped (already present) ---');
    for (const r of skipped) console.log(`  ${r.name}`);
  }

  if (!COMMIT) {
    console.log('\nDry run. Re-run with --commit to insert.');
    await mongoose.disconnect();
    return;
  }

  const docs = toInsert.map((r) => ({
    name: r.name,
    city: r.city,
    contact: r.contact,
    address: r.address,
    services: r.services,
    hours: r.hours,
    notes: r.notes,
    lat: r.lat,
    lng: r.lng,
    addedBy: ADDED_BY,
    owner: null,
    ownerEmail: '',
  }));

  const inserted = await Clinic.insertMany(docs, { ordered: false });
  console.log(`\nInserted ${inserted.length} clinics.`);
  await mongoose.disconnect();
}

main().catch(async (err) => {
  console.error(err);
  try {
    await mongoose.disconnect();
  } catch {}
  process.exit(1);
});
