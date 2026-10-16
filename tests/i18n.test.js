import { test } from 'node:test';
import assert from 'node:assert/strict';
import { translations } from '../src/i18n.js';

const en = translations.en;
const zh = translations.zh;

test('en and zh share the exact same key set', () => {
  assert.deepEqual(Object.keys(zh).sort(), Object.keys(en).sort());
});

test('all translation values are non-empty (except en scene.*.nameZh)', () => {
  for (const key of Object.keys(en)) {
    const isEnEmptyNameZh = key.startsWith('scene.') && key.endsWith('.nameZh');
    if (isEnEmptyNameZh) {
      assert.equal(typeof en[key], 'string', `${key} should be a string in en`);
      assert.ok(zh[key].length > 0, `${key} should be non-empty in zh`);
      continue;
    }
    assert.ok(en[key].length > 0, `${key} should be non-empty in en`);
    assert.ok(zh[key].length > 0, `${key} should be non-empty in zh`);
  }
});

test('placeholder markers are consistent across en and zh', () => {
  assert.ok(en['toast.detailAdjusted'].includes('{q}'));
  assert.ok(zh['toast.detailAdjusted'].includes('{q}'));
  assert.ok(en['scene.announce'].includes('{name}'));
  assert.ok(en['scene.announce'].includes('{overline}'));
  assert.ok(zh['scene.announce'].includes('{name}'));
  assert.ok(zh['scene.announce'].includes('{overline}'));
});

test('brand and technical terms stay untranslated in zh', () => {
  assert.ok(zh['doc.title'].includes('VOID ATLAS'));
  assert.ok(zh['about.p2'].includes('Three.js'));
  assert.ok(zh['retry'].includes('WebGL'));
});
