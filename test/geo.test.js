import { test } from 'node:test';
import assert from 'node:assert/strict';
import { haversine, formatDistance } from '../js/geo.js';

test('haversine: same point is 0', () => assert.equal(haversine(1, 2, 1, 2), 0));
test('haversine: ~111 km per degree of latitude', () => {
  assert.ok(Math.abs(haversine(0, 0, 1, 0) - 111_195) < 200);
});
test('formatDistance', () => {
  assert.equal(formatDistance(449), '450 m');
  assert.equal(formatDistance(1340), '1.3 km');
});
