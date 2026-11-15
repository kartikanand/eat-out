import { haversine } from './geo.js';

// Keyless public instances from https://wiki.openstreetmap.org/wiki/Overpass_API#Public_Overpass_API_instances
// Each one sees the user's approximate location, so only add mirrors you are happy to send that to.
export const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
];

const AMENITIES = ['restaurant', 'cafe', 'fast_food'];
const CACHE_TTL_MS = 10 * 60 * 1000;

export function buildQuery(lat, lon, radius) {
  // exact-match filters are much cheaper for Overpass than a regex
  const parts = AMENITIES.map((a) => `nwr["amenity"="${a}"]["name"](around:${radius},${lat},${lon});`);
  return `[out:json][timeout:20];(${parts.join('')});out center tags 200;`;
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
  if (!res.ok) throw new Error(`${new URL(endpoint).host} responded ${res.status}`);
  return res.json();
}

/** Query every mirror at once and use the first to answer; abort the rest. */
async function raceEndpoints(query, timeoutMs) {
  const controller = new AbortController();
  const signal = AbortSignal.any([controller.signal, AbortSignal.timeout(timeoutMs)]);
  try {
    return await Promise.any(ENDPOINTS.map((endpoint) => post(endpoint, query, signal)));
  } finally {
    controller.abort();
  }
}

export function readCache(key) {
  try {
    const hit = JSON.parse(sessionStorage.getItem(key));
    return hit && Date.now() - hit.at < CACHE_TTL_MS ? hit.data : null;
  } catch {
    return null;
  }
}

export function writeCache(key, data) {
  try {
    sessionStorage.setItem(key, JSON.stringify({ at: Date.now(), data }));
  } catch {
    /* storage unavailable or full: caching is optional */
  }
}

/** Fetch from whichever Overpass mirror answers first. Throws if none do. */
export async function fetchFromOverpass(origin, radius, { timeoutMs = 8_000 } = {}) {
  const json = await raceEndpoints(buildQuery(origin.lat, origin.lon, radius), timeoutMs);
  return parseElements(json, origin);
}
