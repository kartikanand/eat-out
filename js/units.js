const METRES_PER_MILE = 1609.344;
const METRES_PER_FOOT = 0.3048;

// Countries that still use miles for everyday distances (the UK uses miles on roads).
const MILE_REGIONS = new Set(['US', 'GB', 'LR', 'MM']);

/** True if the locale's region (e.g. "en-US") uses miles. A bare "en" is treated as US. */
export function usesMiles(locale = globalThis.navigator?.language ?? 'en-US') {
  try {
    return MILE_REGIONS.has(new Intl.Locale(locale).maximize().region);
  } catch {
    return false;
  }
}

function unit(value, unitName, locale, maximumFractionDigits = 0) {
  return new Intl.NumberFormat(locale, {
    style: 'unit',
    unit: unitName,
    unitDisplay: 'short',
    maximumFractionDigits,
  }).format(value);
}

/** "450 m" / "1.3 km", or "400 ft" / "0.8 mi" when `imperial`. */
export function formatDistance(metres, { imperial = false, locale } = {}) {
  if (imperial) {
    const miles = metres / METRES_PER_MILE;
    return miles < 0.1
      ? unit(Math.round(metres / METRES_PER_FOOT / 10) * 10, 'foot', locale)
      : unit(miles, 'mile', locale, 1);
  }
  return metres < 1000
    ? unit(Math.round(metres / 10) * 10, 'meter', locale)
    : unit(metres / 1000, 'kilometer', locale, 1);
}

/** Search-radius choices as [{ metres, label }], in the user's units. */
export function radiusOptions({ imperial = false, locale } = {}) {
  return imperial
    ? [0.25, 0.5, 1, 2, 3].map((mi) => ({ metres: Math.round(mi * METRES_PER_MILE), label: unit(mi, 'mile', locale, 2) }))
    : [500, 1000, 1500, 3000, 5000].map((m) => ({
        metres: m,
        label: m < 1000 ? unit(m, 'meter', locale) : unit(m / 1000, 'kilometer', locale, 1),
      }));
}
