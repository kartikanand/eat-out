import { haversine } from './geo.js';

export const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];

const AMENITIES = 'restaurant|cafe|fast_food';
const CACHE_TTL_MS = 10 * 60 * 1000;

export function buildQuery(lat, lon, radius) {
  return `[out:json][timeout:25];nwr["amenity"~"^(${AMENITIES})$"]["name"](around:${radius},${lat},${lon});out center tags 200;`;
}

/** Only allow http(s) links; OSM data is user-contributed and untrusted. */
export function safeUrl(value) {
  if (!value) return null;
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`);
    return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
  } catch {
    return null;
  }
}

function formatAddress(tags) {
  const street = [tags['addr:housenumber'], tags['addr:street']].filter(Boolean).join(' ');
  return [street, tags['addr:suburb'] ?? tags['addr:city']].filter(Boolean).join(', ') || null;
}

/** Turn a raw Overpass response into a flat list of restaurants with distance from `origin`. */
export function parseElements(json, origin) {
  const seen = new Set();
  const results = [];
  for (const el of json?.elements ?? []) {
    const tags = el.tags ?? {};
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (!tags.name || lat == null || lon == null) continue;
    const id = `${el.type}/${el.id}`;
    if (seen.has(id)) continue;
    seen.add(id);
    results.push({
      id,
      name: tags.name,
      kind: tags.amenity,
      cuisines: tags.cuisine ? tags.cuisine.split(';').map((c) => c.replaceAll('_', ' ').trim()) : [],
      address: formatAddress(tags),
      phone: tags.phone ?? tags['contact:phone'] ?? null,
      website: safeUrl(tags.website ?? tags['contact:website']),
      openingHours: tags.opening_hours ?? null,
      lat,
      lon,
      distance: haversine(origin.lat, origin.lon, lat, lon),
    });
  }
  return results;
}

async function post(endpoint, query, signal) {
  const res = await fetch(endpoint, {
    method: 'POST',
    body: new URLSearchParams({ data: query }),
    signal,
  });
  if (!res.ok) throw new Error(`Overpass responded ${res.status}`);
  return res.json();
}

function readCache(key) {
  try {
    const hit = JSON.parse(sessionStorage.getItem(key));
    return hit && Date.now() - hit.at < CACHE_TTL_MS ? hit.data : null;
  } catch {
    return null;
  }
}

function writeCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* storage unavailable or full: caching is optional */
  }
}

/** Fetch nearby restaurants, trying each mirror in turn. */
export async function fetchRestaurants(origin, radius = 1500, { timeoutMs = 20_000 } = {}) {
  // ~100 m grid so small GPS jitter still hits the cache
  const key = `eatout:${origin.lat.toFixed(3)},${origin.lon.toFixed(3)},${radius}`;
  const cached = readCache(key);
  if (cached) return parseElements(cached, origin);

  const query = buildQuery(origin.lat, origin.lon, radius);
  let lastError;
  for (const endpoint of ENDPOINTS) {
    try {
      const json = await post(endpoint, query, AbortSignal.timeout(timeoutMs));
      writeCache(key, json);
      return parseElements(json, origin);
    } catch (err) {
      lastError = err;
    }
  }
  throw new Error(`Could not load restaurants (${lastError?.message ?? 'unknown error'}).`);
}
