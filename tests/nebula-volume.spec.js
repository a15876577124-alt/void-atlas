import { test, expect } from '@playwright/test';

async function frame(page, saveReference = false) {
  return page.locator('#universe').evaluate((canvas, saveReference) => {
    const gl = canvas.getContext('webgl2'), bytes = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, bytes);
    let hash = 2166136261, bright = 0;
    for (let i = 0; i < bytes.length; i += 92) {
      hash = Math.imul(hash ^ bytes[i] ^ (bytes[i + 1] << 8), 16777619) >>> 0;
      if (bytes[i] + bytes[i + 1] + bytes[i + 2] > 160) bright++;
    }
    if (saveReference) window.nebulaReference = bytes;
    let difference = 0, maxDifference = 0;
    if (window.nebulaReference) for (let i = 0; i < bytes.length; i++) {
      if (i % 4 === 3) continue;
      const delta = Math.abs(bytes[i] - window.nebulaReference[i]);
      difference += delta; maxDifference = Math.max(maxDifference, delta);
    }
    return { hash, bright, error: gl.getError(), meanDifference: difference / (bytes.length * .75), maxDifference };
  }, saveReference);
}

for (const floatTargets of [true, false]) {
  test(`volume renders and responds at all budgets (${floatTargets ? 'float target' : 'RGBA8 compatibility'})`, async ({ page, context, isMobile }) => {
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('response', r => { if (r.status() >= 400) errors.push(`${r.status()} ${r.url()}`); });
    await page.addInitScript(floatTargets => {
      window.volumeUploads = [];
      const proto = WebGL2RenderingContext.prototype;
      const storage = proto.texStorage3D;
      proto.texStorage3D = function (target, levels, format, width, height, depth) {
        window.volumeUploads.push({ width, height, depth });
        return storage.call(this, target, levels, format, width, height, depth);
      };
      if (!floatTargets) {
        const extension = proto.getExtension;
        proto.getExtension = function (name) {
          return ['EXT_color_buffer_float', 'EXT_color_buffer_half_float'].includes(name) ? null : extension.call(this, name);
        };
      }
    }, floatTargets);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/#nebula');
    await expect(page.locator('body')).toHaveAttribute('data-renderer', 'webgl');
    await expect(page.locator('body')).toHaveAttribute('data-scene', 'nebula');
    const settle = () => page.evaluate(() => new Promise(resolve => { let n = 0; const tick = () => ++n === 140 ? resolve() : requestAnimationFrame(tick); requestAnimationFrame(tick); }));
    for (const quality of ['high', 'balanced', 'low']) {
      await page.locator('#quality').selectOption(quality); await settle();
      const paused = await frame(page);
      expect(paused.bright).toBeGreaterThan(80);
      expect(paused.error).toBe(0);
      await page.waitForTimeout(150);
      expect((await frame(page)).hash).toBe(paused.hash);
    }
    expect(await page.evaluate(() => window.volumeUploads.some(v => v.width > 64 && v.height > 64 && v.depth > 64))).toBe(true);
    const before = (await frame(page, true)).hash;
    if (isMobile) {
      const session = await context.newCDPSession(page);
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x: 200, y: 450 }] });
      await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: 290, y: 510 }] });
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
      await session.detach();
    } else {
      await page.mouse.move(1100, 450); await page.mouse.down();
      await page.mouse.move(1250, 580, { steps: 12 }); await page.mouse.up();
    }
    await settle();
    expect((await frame(page)).hash).not.toBe(before);
    await page.locator('#reset').click(); await settle();
    // OrbitControls roundoff changes isolated channels; RGBA8 target quantization
    // is amplified by tone mapping. Keep a strict whole-frame error bound.
    const reset = await frame(page);
    expect(reset.meanDifference).toBeLessThan(.01);
    expect(reset.maxDifference).toBeLessThanOrEqual(floatTargets ? 2 : 8);
    await page.locator('#universe').focus(); await page.keyboard.press('+'); await settle();
    expect((await frame(page)).hash).not.toBe(before);
    await page.locator('#pause').click();
    const still = (await frame(page)).hash;
    await expect.poll(async () => (await frame(page)).hash).not.toBe(still);
    expect(errors).toEqual([]);
  });
}
