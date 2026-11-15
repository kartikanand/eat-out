import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shuffle } from '../js/random.js';

test('shuffle keeps all items and does not mutate input', () => {
  const input = [1, 2, 3, 4, 5];
  const out = shuffle(input);
  assert.deepEqual([...out].sort(), input);
  assert.deepEqual(input, [1, 2, 3, 4, 5]);
});
test('shuffle is deterministic with a fixed rng', () => {
  assert.deepEqual(shuffle([1, 2, 3], () => 0), [2, 3, 1]);
});
