import { test, expect } from '@playwright/test';

async function signature(page) {
  return page.locator('canvas').evaluate(c => {
    // Repeated getImageData can move Chromium Canvas from GPU to CPU rasterization
    // and change antialiasing. Compare the real PNG export without changing backend.
    const data = c.toDataURL('image/png');
    let hash = 2166136261;
    for (let i = 0; i < data.length; i++) hash = Math.imul(hash ^ data.charCodeAt(i), 16777619) >>> 0;
    return hash;
  });
}
test('Canvas orbit, zoom and pointer release remain functional', async ({ page, context, isMobile }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?renderer=canvas');
  await expect(page.locator('body')).toHaveAttribute('data-renderer', 'canvas');
  const initial = await signature(page);
  if (isMobile) {
    const session = await context.newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 220, y: 450 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 290, y: 480 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(() => signature(page)).not.toBe(initial);
    const orbited = await signature(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 150, y: 460 }, { x: 240, y: 460 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 110, y: 460 }, { x: 280, y: 460 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(() => signature(page)).not.toBe(orbited);
    await session.detach();
  } else {
    await page.mouse.move(1100, 500); await page.mouse.down();
    await page.mouse.move(1200, 560, { steps: 6 }); await page.mouse.up();
    await expect.poll(() => signature(page)).not.toBe(initial);
    const orbited = await signature(page);
    await page.mouse.wheel(0, -300);
    await expect.poll(() => signature(page)).not.toBe(orbited);
    const zoomed = await signature(page);
    await page.mouse.move(1250, 620);
    await page.waitForTimeout(100);
    expect(await signature(page)).toBe(zoomed);
  }
  await page.getByRole('button', { name: 'Reset camera view' }).click();
  await expect.poll(() => signature(page)).toBe(initial);
});
