import { test, expect } from '@playwright/test';

const key = 'void-atlas-lacuna-entry-v1';
async function observe(page) {
  await page.addInitScript(() => {
    window.brandCalls = [];
    const animate = Element.prototype.animate;
    Element.prototype.animate = function (frames, options) {
      if (this.matches('.brand-arc, .brand-letters')) window.brandCalls.push(options.duration);
      return animate.call(this, frames, options);
    };
  });
}
async function settled(page) {
  await expect.poll(() => page.locator('.wordmark').evaluate(el => el.getAnimations({ subtree: true }).length)).toBe(0);
  expect(await page.locator('.brand-arc, .brand-letters').evaluateAll(els => els.every(el => getComputedStyle(el).opacity === '1'))).toBe(true);
}

test('entry is once per tab session and preserves deep links, language, history and refresh', async ({ page }) => {
  await observe(page);
  await page.goto('/?renderer=canvas#nebula');
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'nebula');
  expect(await page.evaluate(() => brandCalls.filter(ms => ms === 1040).length)).toBe(2);
  await settled(page);
  await page.locator('#lang-toggle').click();
  await expect(page.locator('.wordmark')).toHaveAccessibleName('VOID ATLAS — 螺旋星系');
  await page.locator('[data-scene="1"]').click();
  expect(await page.evaluate(() => brandCalls.filter(ms => ms === 1040).length)).toBe(2);
  await page.reload();
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'horizon');
  expect(await page.evaluate(() => brandCalls)).toEqual([]);
  await page.evaluate(() => { location.hash = 'nebula'; });
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'nebula');
  await page.goBack();
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'horizon');
  await page.goForward();
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'nebula');
  expect(await page.evaluate(() => brandCalls)).toEqual([]);
});

test('click navigates immediately, repeated activation stays bounded, keyboard and touch work', async ({ page, isMobile }) => {
  await observe(page);
  await page.goto('/?renderer=canvas#horizon');
  const before = await page.evaluate(() => ({ time: performance.timeOrigin, length: history.length }));
  const result = await page.evaluate(() => {
    const link = document.querySelector('.wordmark');
    for (let i = 0; i < 20; i++) link.click();
    return { scene: document.body.dataset.scene, hash: location.hash, animations: link.getAnimations({ subtree: true }).length };
  });
  expect(result).toEqual({ scene: 'galaxy', hash: '#galaxy', animations: 2 });
  await settled(page);
  if (isMobile) await page.locator('.wordmark').tap();
  else {
    await page.locator('.wordmark').hover();
    await expect.poll(() => page.locator('.brand-arc-upper').evaluate(el => getComputedStyle(el).transform)).not.toBe('none');
    await page.locator('.wordmark').click();
    await page.mouse.move(800, 400);
  }
  await settled(page);
  await page.locator('[data-scene="2"]').click();
  await page.locator('.wordmark').focus();
  await page.keyboard.press('Tab');
  await page.keyboard.press('Shift+Tab');
  await expect(page.locator('.wordmark')).toBeFocused();
  expect(await page.locator('.wordmark').evaluate(el => getComputedStyle(el).outlineStyle)).toBe('solid');
  await page.keyboard.press('Enter');
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'galaxy');
  await page.locator('#universe').focus();
  await settled(page);
  expect(await page.evaluate(() => ({ time: performance.timeOrigin, length: history.length }))).toEqual(before);
});

test('reduced motion, unavailable storage and missing or partially failed animation keep a complete mark', async ({ browser }, testInfo) => {
  for (const failure of ['reduce', 'storage', 'missing', 'partial']) {
    const context = await browser.newContext({ ...testInfo.project.use, reducedMotion: failure === 'reduce' ? 'reduce' : 'no-preference' });
    const page = await context.newPage(), errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.addInitScript(failure => {
      if (failure === 'storage') Object.defineProperty(window, 'sessionStorage', { get() { throw new Error('Unavailable storage'); } });
      if (failure === 'missing') SVGElement.prototype.animate = undefined;
      if (failure === 'partial') {
        const animate = Element.prototype.animate;
        Element.prototype.animate = function (...args) {
          if (this.matches('.brand-arc-lower')) throw new Error('Animation failed');
          return animate.apply(this, args);
        };
      }
    }, failure);
    await page.goto('/?renderer=canvas#nebula');
    await expect(page.locator('body')).toHaveAttribute('data-scene', 'nebula');
    await expect(page.locator('.wordmark')).toBeVisible();
    await settled(page);
    await expect(page.locator('.brand-logo path')).toHaveCount(11);
    await page.locator('.wordmark').evaluate(el => el.click());
    await expect(page.locator('body')).toHaveAttribute('data-scene', 'galaxy');
    await settled(page);
    expect(errors).toEqual([]);
    await context.close();
  }
});

test('motion interruption, page lifecycle and media changes leave no hidden or running logo', async ({ page }) => {
  await observe(page);
  await page.goto('/?renderer=canvas#nebula');
  await page.evaluate(() => document.querySelector('.wordmark').click());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await settled(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.evaluate(() => {
    document.querySelector('.wordmark').click();
    window.dispatchEvent(new PageTransitionEvent('pagehide', { persisted: true }));
    window.dispatchEvent(new PageTransitionEvent('pageshow', { persisted: true }));
  });
  await settled(page);
  const calls = await page.evaluate(() => brandCalls.length);
  await page.evaluate(() => document.querySelector('.wordmark').click());
  expect(await page.evaluate(() => brandCalls.length)).toBe(calls + 2);
  await settled(page);
  expect(await page.evaluate(key => sessionStorage.getItem(key), key)).toBe('seen');
});

test('static HTML logo and native link survive JavaScript disabled', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ ...testInfo.project.use, javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/#nebula');
  await expect(page.locator('.wordmark')).toBeVisible();
  await expect(page.locator('.brand-logo path')).toHaveCount(11);
  await expect(page.locator('.wordmark')).toHaveAttribute('href', '#galaxy');
  await context.close();
});
