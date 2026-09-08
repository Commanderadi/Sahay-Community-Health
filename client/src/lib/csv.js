// Minimal CSV export. Quotes every field and escapes embedded quotes.
const CELL = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;

export function clinicsToCsv(clinics) {
  const headers = ['Name', 'City', 'Contact', 'Address', 'Services', 'Hours', 'Notes', 'Lat', 'Lng', 'Added by', 'Added'];
  const rows = clinics.map((c) => [
    c.name,
    c.city,
    c.contact,
    c.address || '',
    (c.services || []).join('; '),
    c.hours || '',
    c.notes || '',
    c.lat ?? '',
    c.lng ?? '',
    c.addedBy || c.ownerEmail || '',
    c.createdAt ? new Date(c.createdAt).toISOString().slice(0, 10) : '',
  ]);
  return [headers, ...rows].map((r) => r.map(CELL).join(',')).join('\r\n');
}

export function downloadCsv(filename, csv) {
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
