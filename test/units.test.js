import { test } from 'node:test';
import assert from 'node:assert/strict';
import { formatDistance, radiusOptions, usesMiles } from '../js/units.js';

test('usesMiles by locale region', () => {
  for (const l of ['en-US', 'en-GB', 'en', 'my-MM']) assert.equal(usesMiles(l), true, l);
  for (const l of ['en-IN', 'fr-FR', 'de', 'en-CA', 'en-AU', 'ja-JP']) assert.equal(usesMiles(l), false, l);
  assert.equal(usesMiles('not a locale'), false);
});

test('formatDistance metric', () => {
  assert.equal(formatDistance(449, { locale: 'en-US' }), '450 m');
  assert.equal(formatDistance(1340, { locale: 'en-US' }), '1.3 km');
});

test('formatDistance imperial', () => {
  assert.equal(formatDistance(100, { imperial: true, locale: 'en-US' }), '330 ft');
  assert.equal(formatDistance(1340, { imperial: true, locale: 'en-US' }), '0.8 mi');
});

test('radiusOptions: 5 sane choices in each system', () => {
  const metric = radiusOptions({ locale: 'en-US' });
  const imperial = radiusOptions({ imperial: true, locale: 'en-US' });
  assert.deepEqual(metric.map((o) => o.label), ['500 m', '1 km', '1.5 km', '3 km', '5 km']);
  assert.deepEqual(imperial.map((o) => o.label), ['0.25 mi', '0.5 mi', '1 mi', '2 mi', '3 mi']);
  assert.equal(imperial[2].metres, 1609);
});
