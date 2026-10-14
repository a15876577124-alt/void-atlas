import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createParticleData } from '../src/particles.js';

test('geometry is deterministic, finite and bounded at every budget', () => {
  for (const count of [18000, 42000, 76000]) {
    const data = createParticleData(count);
    for (const name of ['galaxy', 'horizon', 'nebula']) {
      assert.equal(data[name].length, count * 3);
      assert.ok(data[name].every(n => Number.isFinite(n) && Math.abs(n) < 12));
    }
    for (let i = 0; i < count; i++) {
      assert.ok(Math.hypot(data.horizon[i * 3], data.horizon[i * 3 + 2]) >= 1.14, 'accretion particles must leave a central hole');
    }
  }
  assert.deepEqual(createParticleData(20, 42), createParticleData(20, 42));
  assert.notDeepEqual(createParticleData(20, 42).galaxy, createParticleData(20, 43).galaxy);
});
