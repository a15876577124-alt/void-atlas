import { test, expect } from '@playwright/test';

test('language changes preserve the paused artwork and localize every quality tier', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#nebula');
  await expect(page.locator('body')).toHaveAttribute('data-renderer', 'webgl');
  await page.locator('#quality').selectOption('low');
  await expect(page.locator('#telemetry')).toContainText('WebGL / Light / 18,000');
  await page.locator('#universe').focus();
  await page.keyboard.press('+');
  await page.evaluate(() => new Promise(resolve => {
    let n = 0; const tick = () => ++n >= 100 ? resolve() : requestAnimationFrame(tick); requestAnimationFrame(tick);
  }));
  await page.evaluate(() => { window.originalCanvas = document.querySelector('#universe'); window.originalFrame = window.originalCanvas.toDataURL(); });
  await page.locator('#lang-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'zh-CN');
  await expect(page.locator('#telemetry')).toContainText('WebGL / 轻量 / 18,000');
  expect(await page.evaluate(() => document.querySelector('#universe') === window.originalCanvas && window.originalCanvas.toDataURL() === window.originalFrame)).toBe(true);
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'nebula');
  for (const [tier, label] of [['balanced', '均衡'], ['high', '高']]) {
    await page.locator('#quality').selectOption(tier);
    await expect(page.locator('#telemetry')).toContainText('WebGL / ' + label + ' /');
  }
  await page.locator('#lang-toggle').click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  await expect(page.locator('#telemetry')).toContainText('WebGL / High / 76,000');
});

test('Field Notes and Contact remain reachable in both languages on narrow screens', async ({ page }) => {
  await page.goto('/?renderer=canvas');
  for (const width of [390, 360, 320]) {
    await page.setViewportSize({ width, height: 844 });
    for (const lang of ['en', 'zh-CN']) {
      if (await page.locator('html').getAttribute('lang') !== lang) await page.locator('#lang-toggle').click();
      const buttons = page.locator('.masthead button');
      let previousRight = 0;
      for (const button of await buttons.all()) {
        await expect(button).toBeVisible();
        const box = await button.boundingBox();
        expect(box.x).toBeGreaterThanOrEqual(previousRight);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
        previousRight = box.x + box.width;
      }
      await page.locator('#about-open').click();
      await expect(page.locator('#about')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(page.locator('#about-open')).toBeFocused();
      await page.locator('#contact-open').click();
      await expect(page.locator('#contact')).toBeVisible();
      await expect(page.locator('#contact a[href^="mailto:"]')).toHaveCount(2);
      await page.keyboard.press('Escape');
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
});
