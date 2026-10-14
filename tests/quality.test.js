import { test } from 'node:test';
import assert from 'node:assert/strict';
import { initialQuality, profiles, QualityGovernor } from '../src/quality.js';
import { sceneFromHash } from '../src/scenes.js';

test('initial budgets respect small devices and scale monotonically', () => {
  assert.equal(initialQuality({ mobile: true }), 'balanced');
  assert.equal(initialQuality({ memory: 2 }), 'low');
  assert.equal(initialQuality({ cores: 2 }), 'low');
  assert.equal(initialQuality({}), 'high');
  assert.ok(profiles.low.count < profiles.balanced.count && profiles.balanced.count < profiles.high.count);
});
test('governor reduces sustained slow rendering and never oscillates upward', () => {
  const governor = new QualityGovernor();
  const decisions = [];
  for (let i = 0; i < 150; i++) { const result = governor.sample(1 / 20, 'high'); if (result) decisions.push(result); }
  assert.ok(decisions.includes('balanced'));
  for (let i = 0; i < 400; i++) assert.equal(governor.sample(1 / 60, 'low'), null);
});
test('hidden-tab gaps and warm-up do not lower quality', () => {
  const governor = new QualityGovernor();
  for (let i = 0; i < 500; i++) assert.equal(governor.sample(2, 'high'), null);
  for (let i = 0; i < 100; i++) assert.equal(governor.sample(1 / 60, 'high'), null);
});
test('very slow continuous rendering still triggers a lower budget', () => {
  const governor = new QualityGovernor();
  const decisions = Array.from({ length: 25 }, () => governor.sample(.4, 'balanced'));
  assert.ok(decisions.includes('low'));
});
test('deep links select real scenes and unknown hashes remain usable', () => {
  assert.equal(sceneFromHash('#horizon'), 1);
  assert.equal(sceneFromHash('#nebula'), 2);
  assert.equal(sceneFromHash('#missing'), 0);
});
