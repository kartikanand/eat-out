import { haversine } from './geo.js';
import { safeUrl } from './overpass.js';

const ENDPOINT = 'https://nominatim.openstreetmap.org/search';
const EARTH_M_PER_DEG = 111_320;

/** Bounding box (left,top,right,bottom) around a point, as Nominatim's `viewbox` expects. */
export function viewbox({ lat, lon }, radius) {
  const dLat = radius / EARTH_M_PER_DEG;
  const dLon = radius / (EARTH_M_PER_DEG * Math.cos((lat * Math.PI) / 180));
  return [lon - dLon, lat + dLat, lon + dLon, lat - dLat].map((n) => n.toFixed(5)).join(',');
}

export function parseResults(results, origin, radius) {
  const out = [];
  for (const r of Array.isArray(results) ? results : []) {
    const lat = Number.parseFloat(r.lat);
    const lon = Number.parseFloat(r.lon);
    const tags = r.extratags ?? {};
    if (!r.name || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const distance = haversine(origin.lat, origin.lon, lat, lon);
    if (distance > radius) continue; // the bounding box is a square; trim the corners
    const a = r.address ?? {};
    out.push({
      id: `${r.osm_type}/${r.osm_id}`,
      name: r.name,
      kind: r.type,
      cuisines: tags.cuisine ? tags.cuisine.split(';').map((c) => c.replaceAll('_', ' ').trim()) : [],
      address:
        [[a.house_number, a.road].filter(Boolean).join(' '), a.suburb ?? a.city].filter(Boolean).join(', ') || null,
      phone: tags.phone ?? tags['contact:phone'] ?? null,
      website: safeUrl(tags.website ?? tags['contact:website']),
      openingHours: tags.opening_hours ?? null,
      lat,
      lon,
      distance,
    });
  }
  return out;
}

/** Fallback source: up to 40 restaurants inside the radius. */
export async function fetchFromNominatim(origin, radius, { timeoutMs = 10_000 } = {}) {
  const params = new URLSearchParams({
    q: 'restaurant',
    format: 'jsonv2',
    limit: '40',
    bounded: '1',
    viewbox: viewbox(origin, radius),
    extratags: '1',
    addressdetails: '1',
  });
  const res = await fetch(`${ENDPOINT}?${params}`, { signal: AbortSignal.timeout(timeoutMs) });
  if (!res.ok) throw new Error(`Nominatim responded ${res.status}`);
  return parseResults(await res.json(), origin, radius);
}
