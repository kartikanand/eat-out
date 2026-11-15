import { fetchFromNominatim } from './nominatim.js';
import { fetchFromOverpass, readCache, writeCache } from './overpass.js';

/**
 * Nearby places: Overpass first (more complete), Nominatim if every Overpass
 * mirror is down or slow. Public Overpass servers are often overloaded.
 */
export async function findPlaces(origin, radius) {
  // ~100 m grid so small GPS jitter still hits the cache
  const key = `eatout:${origin.lat.toFixed(3)},${origin.lon.toFixed(3)},${radius}`;
  const cached = readCache(key);
  if (cached) return cached;

  let places;
  try {
    places = await fetchFromOverpass(origin, radius);
  } catch {
    try {
      places = await fetchFromNominatim(origin, radius);
    } catch {
      throw new Error('The restaurant data service is not responding right now. Please try again in a moment.');
    }
  }
  writeCache(key, places);
  return places;
}
