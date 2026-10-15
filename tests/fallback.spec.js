import { test, expect } from '@playwright/test';

test('Canvas edition retains scenes, motion, screenshot export and layout', async ({ page }, testInfo) => {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  await page.goto('/?renderer=canvas');
  await expect(page.locator('body')).toHaveAttribute('data-renderer', 'canvas');
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
  const image = () => page.locator('canvas').evaluate(c => c.toDataURL());
  await page.waitForTimeout(1100);
  const paused = await image();
  await page.waitForTimeout(150);
  expect(await image()).toBe(paused);
  await page.getByRole('button', { name: 'Resume motion', exact: true }).click();
  await expect.poll(image).not.toBe(paused);
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
  const pictures = [];
  for (const [id, name] of [['galaxy', 'Spiral Galaxy'], ['horizon', 'Event Horizon'], ['nebula', 'Cosmic Nebula']]) {
    await page.getByRole('button', { name: new RegExp(name) }).click();
    await expect(page.locator('body')).toHaveAttribute('data-scene', id);
    await page.waitForTimeout(1100);
    pictures.push(await image());
  }
  expect(new Set(pictures).size).toBe(3);
  const downloadEvent = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save frame as PNG' }).click();
  const download = await downloadEvent;
  expect(download.suggestedFilename()).toBe('void-atlas-nebula.png');
  expect(await download.failure()).toBeNull();
  await download.saveAs(testInfo.outputPath('canvas-export.png'));
  for (const control of await page.locator('.chapter, .tool, select, #about-open').all()) {
    const box = await control.boundingBox();
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(page.viewportSize().width + 1);
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(page.viewportSize().height + 1);
  }
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: testInfo.outputPath('canvas-layout.png') });
  for (const viewport of [page.viewportSize(), { width: 320, height: 640 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(viewport);
    const retry = await page.locator('#retry').boundingBox();
    const status = await page.locator('#render-status').boundingBox();
    expect(status.y + status.height).toBeLessThanOrEqual(retry.y);
    if (viewport.width <= 600) {
      const tools = await page.locator('.instrument-panel').boundingBox();
      expect(retry.y + retry.height).toBeLessThanOrEqual(tools.y);
    }
  }
  expect(errors).toEqual([]);
});

test('reduced motion and keyboard navigation are usable', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/?renderer=canvas#horizon');
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'horizon');
  await expect(page.getByRole('button', { name: 'Resume motion' })).toHaveAttribute('aria-pressed', 'true');
  const frame = await page.locator('canvas').evaluate(c => c.toDataURL());
  await page.waitForTimeout(200);
  expect(await page.locator('canvas').evaluate(c => c.toDataURL())).toBe(frame);
  await page.locator('canvas').focus();
  await page.keyboard.press('3');
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'nebula');
  await page.keyboard.press('ArrowRight');
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'galaxy');
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: 'Pause motion' })).toBeVisible();
  await page.getByRole('button', { name: 'Field notes' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('button', { name: 'Field notes' })).toBeFocused();
});
