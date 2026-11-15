import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseResults, viewbox } from '../js/nominatim.js';

const origin = { lat: 12.97, lon: 77.59 };

test('parseResults maps fields, trims outside radius, drops unnamed', () => {
  const rows = [
    { osm_type: 'node', osm_id: 1, lat: '12.971', lon: '77.591', type: 'restaurant', name: 'A',
      address: { house_number: '5', road: 'MG Road', suburb: 'Shivajinagar' },
      extratags: { cuisine: 'south_indian', website: 'javascript:alert(1)', opening_hours: 'Mo-Su 09:00-22:00' } },
    { osm_type: 'node', osm_id: 2, lat: '13.5', lon: '77.59', type: 'restaurant', name: 'Far' },
    { osm_type: 'node', osm_id: 3, lat: '12.971', lon: '77.591', type: 'restaurant' },
  ];
  const out = parseResults(rows, origin, 1500);
  assert.equal(out.length, 1);
  assert.equal(out[0].address, '5 MG Road, Shivajinagar');
  assert.deepEqual(out[0].cuisines, ['south indian']);
  assert.equal(out[0].website, null);
});

test('parseResults tolerates garbage', () => assert.deepEqual(parseResults(null, origin, 1), []));

test('viewbox is left,top,right,bottom around the point', () => {
  const [l, t, r, b] = viewbox(origin, 1000).split(',').map(Number);
  assert.ok(l < origin.lon && r > origin.lon && t > origin.lat && b < origin.lat);
});
