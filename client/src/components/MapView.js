import { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { MapPin } from 'lucide-react';
import Button from './ui/Button';

// Teardrop pin as a divIcon so we don't depend on Leaflet's image assets
// (which webpack mangles).
const pinIcon = L.divIcon({
  className: '',
  html: `<div style="
    width:26px;height:26px;border-radius:50% 50% 50% 0;
    background:#059669;transform:rotate(-45deg);
    border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.35);
  "></div>`,
  iconSize: [26, 26],
  iconAnchor: [13, 26],
  popupAnchor: [0, -24],
});

function FitBounds({ points }) {
  const map = useMap();
  useMemo(() => {
    if (points.length === 0) return;
    if (points.length === 1) {
      map.setView(points[0], 13);
    } else {
      map.fitBounds(points, { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
}

export default function MapView({ clinics, onOpen }) {
  const located = clinics.filter(
    (c) => typeof c.lat === 'number' && typeof c.lng === 'number',
  );
  const points = located.map((c) => [c.lat, c.lng]);
  const missing = clinics.length - located.length;

  if (located.length === 0) {
    return (
      <div className="card flex flex-col items-center gap-2 p-12 text-center">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800">
          <MapPin className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900 dark:text-white">
          No mapped clinics
        </h3>
        <p className="max-w-sm text-sm text-slate-500 dark:text-slate-400">
          None of the clinics in view have coordinates yet. Add latitude and
          longitude when editing a clinic to place it on the map.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="card overflow-hidden">
        <MapContainer
          center={points[0]}
          zoom={12}
          scrollWheelZoom
          style={{ height: '65vh', width: '100%' }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <FitBounds points={points} />
          {located.map((c) => (
            <Marker key={c._id} position={[c.lat, c.lng]} icon={pinIcon}>
              <Popup>
                <div className="space-y-1">
                  <p className="font-semibold text-slate-900">{c.name}</p>
                  <p className="text-slate-600">{c.city}</p>
                  <p className="text-slate-600">{c.contact}</p>
                  <Button size="sm" className="mt-1" onClick={() => onOpen(c)}>
                    View details
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      {missing > 0 && (
        <p className="text-xs text-slate-400">
          {missing} {missing === 1 ? 'clinic is' : 'clinics are'} not shown — no coordinates.
        </p>
      )}
    </div>
  );
}
