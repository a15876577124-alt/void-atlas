import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createNebulaVolume } from '../src/nebula-volume.js';
import { createParticleData } from '../src/particles.js';

test('volume has bounded density, open space and an empty boundary', () => {
  const volume = createNebulaVolume(), { data, size } = volume;
  assert.equal(data.length, size ** 3);
  assert.ok(data instanceof Uint8Array);
  const occupied = data.reduce((n, value) => n + (value > 0), 0);
  assert.ok(occupied > 1000 && occupied < data.length / 2);
  for (let z = 0; z < size; z++) for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    if (x === 0 || y === 0 || z === 0 || x === size - 1 || y === size - 1 || z === size - 1) assert.equal(data[(z * size + y) * size + x], 0);
  }
  assert.equal(createNebulaVolume(), volume, 'renderer retries reuse the CPU volume');
});

test('lower quality retains the exact geometry prefix in every scene', () => {
  const high = createParticleData(76000);
  for (const count of [18000, 42000]) {
    const lower = createParticleData(count);
    for (const key of ['galaxy', 'horizon', 'nebula', 'seeds']) assert.deepEqual(lower[key], high[key].subarray(0, lower[key].length));
  }
});
