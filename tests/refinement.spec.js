import { test, expect } from '@playwright/test';

const settle = page => page.evaluate(() => new Promise(resolve => {
  let n = 0; const tick = () => ++n === 140 ? resolve() : requestAnimationFrame(tick); requestAnimationFrame(tick);
}));
const frame = page => page.locator('#universe').evaluate(canvas => {
  const gl = canvas.getContext('webgl2'), pixels = new Uint8Array(canvas.width * canvas.height * 4);
  gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  let hash = 2166136261;
  for (let i = 0; i < pixels.length; i += 37) hash = Math.imul(hash ^ pixels[i], 16777619);
  return hash;
});

test('mouse orbit accepts wheel zoom before releasing the pointer', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Mouse-specific combination; touch pinch is covered by webgl.spec.js.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#horizon');
  await expect(page.locator('body')).toHaveAttribute('data-renderer', 'webgl');
  await page.locator('#quality').selectOption('balanced');
  await settle(page);
  const still = await frame(page);
  await page.mouse.move(1100, 500); await page.mouse.wheel(0, 200); await settle(page);
  expect(await frame(page)).not.toBe(still);
  await page.mouse.move(1100, 500); await page.mouse.down();
  await page.mouse.move(1000, 500, { steps: 12 }); await settle(page);
  const rotated = await frame(page);
  await page.mouse.wheel(0, -500); await settle(page);
  const close = await frame(page); expect(close).not.toBe(rotated);
  await page.mouse.wheel(0, 1000); await settle(page);
  expect(await frame(page)).not.toBe(close);
  await page.mouse.move(1100, 500, { steps: 12 }); await page.mouse.up(); await settle(page);
  const released = await frame(page);
  await page.mouse.wheel(0, -300); await settle(page);
  expect(await frame(page)).not.toBe(released);
});

test('volume preparation keeps controls available and respects a Canvas selection', async ({ page }) => {
  let release, requested;
  const gate = new Promise(resolve => { release = resolve; });
  const request = new Promise(resolve => { requested = resolve; });
  await page.route('**/*scene-data-worker*', async route => { requested(); await gate; await route.continue(); });
  await page.goto('/'); await request;
  await page.locator('#lang-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await page.locator('[data-scene="2"]').click();
  await page.locator('#about-open').click(); await page.locator('#lightweight').click();
  release();
  // Retry awaits the same completed volume, and the selected scene survives.
  await page.waitForTimeout(1800);
  await expect(page.locator('body')).toHaveAttribute('data-renderer', 'canvas');
  await page.locator('#retry').click();
  await expect(page.locator('body')).toHaveAttribute('data-renderer', 'webgl');
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'nebula');
});

test('unavailable workers retain the WebGL renderer through synchronous preparation', async ({ page }) => {
  await page.addInitScript(() => { window.Worker = class { constructor() { throw new Error('Workers blocked'); } }; });
  await page.goto('/#nebula');
  await expect(page.locator('body')).toHaveAttribute('data-renderer', 'webgl');
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'nebula');
});
