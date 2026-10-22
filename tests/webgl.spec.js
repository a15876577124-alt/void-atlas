import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';

async function pixels(page) {
  return page.locator('#universe').evaluate(canvas => {
    const gl = canvas.getContext('webgl2');
    const data = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, data);
    let hash = 2166136261, bright = 0;
    for (let i = 0; i < data.length; i += 4 * 23) {
      hash = Math.imul(hash ^ data[i], 16777619) >>> 0;
      hash = Math.imul(hash ^ data[i + 1], 16777619) >>> 0;
      if (data[i] + data[i + 1] + data[i + 2] > 160) bright++;
    }
    return { hash, bright, width: canvas.width, height: canvas.height };
  });
}
async function settle(page) {
  await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
}
async function start(page, reduced = true) {
  if (reduced) await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-renderer', 'webgl', { timeout: 30000 });
  await page.getByRole('combobox', { name: 'Render quality' }).selectOption('low');
  await settle(page);
}
function trackErrors(page) {
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
  return errors;
}

test('GPU renders distinct nonblank scenes and a valid PNG export', async ({ page }, testInfo) => {
  const errors = trackErrors(page);
  await start(page);
  const hashes = [];
  for (const [id, name] of [['galaxy', 'Spiral Galaxy'], ['horizon', 'Event Horizon'], ['nebula', 'Cosmic Nebula']]) {
    await page.getByRole('button', { name: new RegExp(name) }).click();
    await settle(page);
    await expect(page).toHaveURL(new RegExp(`#${id}$`));
    await expect(page.getByRole('button', { name: new RegExp(name) })).toHaveAttribute('aria-pressed', 'true');
    const frame = await pixels(page);
    expect(frame.bright, `${name} must contain illuminated artwork`).toBeGreaterThan(80);
    hashes.push(frame.hash);
    await page.screenshot({ path: testInfo.outputPath(`${id}.png`) });
  }
  expect(new Set(hashes).size).toBe(3);
  const event = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Save frame as PNG' }).click();
  const download = await event;
  expect(download.suggestedFilename()).toBe('void-atlas-nebula.png');
  const path = testInfo.outputPath('artwork.png');
  await download.saveAs(path);
  const png = await readFile(path);
  expect(png.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a');
  const frame = await pixels(page);
  expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([frame.width, frame.height]);
  expect(png.length).toBeGreaterThan(10000);
  expect(errors).toEqual([]);
});

test('motion, orbit, wheel or pinch zoom, and camera reset work', async ({ page, context, isMobile }) => {
  const errors = trackErrors(page);
  await start(page, false);
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
  await settle(page);
  const paused = (await pixels(page)).hash;
  await page.waitForTimeout(150);
  expect((await pixels(page)).hash).toBe(paused);
  await page.getByRole('button', { name: 'Resume motion', exact: true }).click();
  await expect.poll(async () => (await pixels(page)).hash).not.toBe(paused);
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
  await settle(page);
  const before = (await pixels(page)).hash;
  if (isMobile) {
    const session = await context.newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 220, y: 450 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 290, y: 480 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await settle(page);
    const orbited = (await pixels(page)).hash;
    expect(orbited).not.toBe(before);
    await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 150, y: 460 }, { x: 240, y: 460 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 110, y: 460 }, { x: 280, y: 460 }] });
    await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(async () => (await pixels(page)).hash).not.toBe(orbited);
    await session.detach();
  } else {
    await page.mouse.move(1100, 500); await page.mouse.down();
    await page.mouse.move(1200, 560, { steps: 6 }); await page.mouse.up();
    await expect.poll(async () => (await pixels(page)).hash).not.toBe(before);
    const orbited = (await pixels(page)).hash;
    await page.mouse.wheel(0, -300);
    await expect.poll(async () => (await pixels(page)).hash).not.toBe(orbited);
  }
  const changed = (await pixels(page)).hash;
  await page.getByRole('button', { name: 'Reset camera view' }).click();
  await expect.poll(async () => (await pixels(page)).hash).not.toBe(changed);
  expect(errors).toEqual([]);
});

test('rapid scene changes transition through illuminated frames while paused', async ({ page }) => {
  await start(page, false);
  await page.getByRole('button', { name: 'Pause motion', exact: true }).click();
  const hashes = [(await pixels(page)).hash];
  await page.getByRole('button', { name: /Event Horizon/ }).click();
  await page.waitForTimeout(250);
  let frame = await pixels(page); hashes.push(frame.hash); expect(frame.bright).toBeGreaterThan(80);
  await page.getByRole('button', { name: /Cosmic Nebula/ }).click();
  for (let i = 0; i < 3; i++) {
    await page.waitForTimeout(350);
    frame = await pixels(page); hashes.push(frame.hash); expect(frame.bright).toBeGreaterThan(80);
  }
  expect(new Set(hashes).size).toBeGreaterThan(2);
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'nebula');
  await expect(page.getByRole('button', { name: 'Resume motion' })).toBeVisible();
});

test('WebGL loss falls back without losing scene state, then restores', async ({ page }) => {
  const errors = trackErrors(page);
  await start(page);
  await page.getByRole('button', { name: /Event Horizon/ }).click();
  await page.evaluate(() => {
    window.lostGL = document.querySelector('canvas').getContext('webgl2').getExtension('WEBGL_lose_context');
    if (!window.lostGL) throw new Error('Test renderer lacks the context-loss extension');
    window.lostGL.loseContext();
  });
  await expect(page.locator('body')).toHaveAttribute('data-renderer', 'canvas');
  await expect(page.locator('#render-status')).toContainText('interrupted');
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'horizon');
  await page.getByRole('button', { name: /Cosmic Nebula/ }).click();
  await expect(page.getByRole('button', { name: /Cosmic Nebula/ })).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => window.lostGL.restoreContext());
  await expect(page.locator('body')).toHaveAttribute('data-renderer', 'webgl', { timeout: 30000 });
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'nebula');
  await settle(page);
  expect((await pixels(page)).bright).toBeGreaterThan(80);
  expect(errors).toEqual([]);
});

test('unsupported WebGL uses the working Canvas edition with an honest message', async ({ page }) => {
  const errors = trackErrors(page);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      return type === 'webgl2' ? null : original.call(this, type, ...args);
    };
  });
  await page.goto('/');
  await expect(page.locator('body')).toHaveAttribute('data-renderer', 'canvas');
  await expect(page.locator('#render-status')).toContainText('WebGL is unavailable');
  await page.getByRole('button', { name: /Cosmic Nebula/ }).click();
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'nebula');
  await expect(page.getByRole('button', { name: 'Try WebGL again' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('detail budgets and responsive layouts remain usable', async ({ page }, testInfo) => {
  const errors = trackErrors(page);
  await start(page);
  for (const [value, count] of [['high', '76,000'], ['balanced', '42,000'], ['low', '18,000']]) {
    await page.getByRole('combobox', { name: 'Render quality' }).selectOption(value);
    await expect(page.locator('#telemetry')).toContainText(count);
    await settle(page);
    expect((await pixels(page)).bright).toBeGreaterThan(80);
  }
  for (const viewport of [{ width: 320, height: 640 }, { width: 844, height: 390 }, { width: 1440, height: 900 }]) {
    await page.setViewportSize(viewport);
    await settle(page);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (const control of await page.locator('.chapter, .tool, select, #about-open:visible').all()) {
      const box = await control.boundingBox();
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(viewport.width + 1);
      expect(box.y).toBeGreaterThanOrEqual(0);
      expect(box.y + box.height).toBeLessThanOrEqual(viewport.height + 1);
    }
    const metrics = await page.evaluate(() => ({ width: document.querySelector('canvas').width, height: document.querySelector('canvas').height, dpr: Math.min(devicePixelRatio, 1) }));
    expect(metrics.width).toBe(Math.floor(viewport.width * metrics.dpr));
    expect(metrics.height).toBe(Math.floor(viewport.height * metrics.dpr));
    await page.screenshot({ path: testInfo.outputPath(`layout-${viewport.width}.png`) });
  }
  expect(errors).toEqual([]);
});

test('lightweight edition and explicit WebGL retry preserve the chosen scene', async ({ page }) => {
  const errors = trackErrors(page);
  await start(page);
  await page.getByRole('button', { name: /Cosmic Nebula/ }).click();
  await page.getByRole('button', { name: 'Field notes' }).click();
  await page.getByRole('button', { name: 'Use the lightweight edition' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-renderer', 'canvas');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('combobox', { name: 'Render quality' })).toBeDisabled();
  await page.getByRole('button', { name: 'Try WebGL again' }).click();
  await expect(page.locator('body')).toHaveAttribute('data-renderer', 'webgl', { timeout: 30000 });
  await expect(page.locator('body')).toHaveAttribute('data-scene', 'nebula');
  expect(errors).toEqual([]);
});
