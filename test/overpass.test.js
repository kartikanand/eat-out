import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseElements, safeUrl, buildQuery } from '../js/overpass.js';

const origin = { lat: 12.97, lon: 77.59 };

test('parseElements handles nodes, ways with center, dedupes, drops unnamed', () => {
  const json = { elements: [
    { type: 'node', id: 1, lat: 12.971, lon: 77.591, tags: { name: 'A', amenity: 'cafe', cuisine: 'south_indian;coffee_shop', website: 'a.example' } },
    { type: 'way', id: 2, center: { lat: 12.98, lon: 77.6 }, tags: { name: 'B', amenity: 'restaurant', 'addr:street': 'MG Road', 'addr:housenumber': '5' } },
    { type: 'node', id: 1, lat: 12.971, lon: 77.591, tags: { name: 'A' } },
    { type: 'node', id: 3, lat: 1, lon: 1, tags: { amenity: 'cafe' } },
  ] };
  const out = parseElements(json, origin);
  assert.equal(out.length, 2);
  assert.deepEqual(out[0].cuisines, ['south indian', 'coffee shop']);
  assert.equal(out[0].website, 'https://a.example/');
  assert.equal(out[1].address, '5 MG Road');
  assert.ok(out[0].distance > 0);
});

test('safeUrl rejects non-http schemes', () => {
  assert.equal(safeUrl('javascript:alert(1)'), null);
  assert.equal(safeUrl('https://ok.example'), 'https://ok.example/');
  assert.equal(safeUrl(undefined), null);
});

test('buildQuery embeds radius and coords', () => {
  assert.match(buildQuery(1, 2, 300), /around:300,1,2/);
});
