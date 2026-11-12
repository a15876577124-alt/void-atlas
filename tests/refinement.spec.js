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
const shadowRadius = page => page.locator('#universe').evaluate(canvas => {
  const gl = canvas.getContext('webgl2'), pixels = new Uint8Array(canvas.width * canvas.height * 4);
  gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  const x = Math.round(canvas.width * .645), y = Math.round(canvas.height * .51);
  for (let radius = 0; radius < canvas.width / 4; radius++) {
    const i = (y * canvas.width + x + radius) * 4;
    if (pixels[i] + pixels[i + 1] + pixels[i + 2] > 80) return radius;
  }
  throw new Error('The event horizon edge was not found.');
});

test('mouse orbit accepts wheel zoom before releasing the pointer', async ({ page, isMobile }) => {
  test.skip(isMobile, 'Mouse-specific combination; touch pinch is covered by webgl.spec.js.');
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#horizon');
  await expect(page.locator('body')).toHaveAttribute('data-renderer', 'webgl');
  await page.locator('#quality').selectOption('balanced');
  await settle(page);
  const still = await frame(page);
  const originalRadius = await shadowRadius(page);
  await page.mouse.move(1100, 500); await page.mouse.wheel(0, 200);
  await page.waitForTimeout(60);
  const moving = await frame(page); expect(moving).not.toBe(still);
  await settle(page);
  const settled = await frame(page); expect(settled).not.toBe(moving);
  expect(await shadowRadius(page), 'scrolling down zooms out').toBeLessThan(originalRadius);
  await page.waitForTimeout(150); expect(await frame(page)).toBe(settled);
  await page.mouse.move(1100, 500); await page.mouse.down();
  await page.mouse.move(1000, 500, { steps: 12 }); await settle(page);
  const rotated = await frame(page);
  const rotatedRadius = await shadowRadius(page);
  await page.mouse.wheel(0, -500); await settle(page);
  const close = await frame(page); expect(close).not.toBe(rotated);
  expect(await shadowRadius(page), 'scrolling up zooms in during a drag').toBeGreaterThan(rotatedRadius);
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
