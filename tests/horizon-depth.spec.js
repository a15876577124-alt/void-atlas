import { test, expect } from '@playwright/test';

// Read the production framebuffer, without exposing renderer state or replacing
// materials. Near/far samples sit inside the projected event horizon, away from
// its emissive rim: a topmost black billboard fails the near-side assertion.
async function sampleOcclusion(page, underside) {
  return page.locator('#universe').evaluate((canvas, underside) => {
    const gl = canvas.getContext('webgl2');
    const data = new Uint8Array(canvas.width * canvas.height * 4);
    gl.readPixels(0, 0, canvas.width, canvas.height, gl.RGBA, gl.UNSIGNED_BYTE, data);
    const mobile = innerWidth <= 600;
    const distance = mobile ? Math.hypot(8.2, 17.5) : Math.hypot(5.3, 10.8);
    const radius = canvas.height / (2 * Math.tan(23 * Math.PI / 180)) * 1.02 / Math.sqrt(distance ** 2 - 1.02 ** 2);
    const cx = canvas.width * (mobile ? .54 : .645);
    const cy = canvas.height * (mobile ? .57 : .49);
    const sample = sign => {
      let total = 0, bright = 0, count = 0;
      for (let y = .25 * radius; y <= .6 * radius; y++) {
        for (let x = -.3 * radius; x <= .3 * radius; x++) {
          const px = Math.round(cx + x), py = Math.round(cy + y * sign);
          const i = ((canvas.height - 1 - py) * canvas.width + px) * 4;
          const value = (data[i] + data[i + 1] + data[i + 2]) / 3;
          total += value; bright += value > 25 ? 1 : 0; count++;
        }
      }
      return { mean: total / count, brightFraction: bright / count };
    };
    return { near: sample(underside ? -1 : 1), far: sample(underside ? 1 : -1) };
  }, underside);
}

test('event horizon occludes the far disk while the near disk crosses in front at side angles', async ({ page, context, isMobile }, testInfo) => {
  // CI software rendering needs more time for all eight 140-frame damping waits.
  if (process.env.CI) test.setTimeout(180000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  page.on('response', response => { if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`); });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/#horizon');
  await expect(page.locator('body')).toHaveAttribute('data-renderer', 'webgl', { timeout: 30000 });
  await page.getByRole('combobox', { name: 'Render quality' }).selectOption('balanced');
  const viewport = page.viewportSize();
  const session = isMobile ? await context.newCDPSession(page) : null;
  let elevation = Math.atan2(isMobile ? 8.2 : 5.3, isMobile ? 17.5 : 10.8);
  const samples = [];
  for (const [name, degrees] of [['top', 79], ['front', 60], ['oblique', 30], ['side', 10], ['edge', 0], ['underside', -10], ['below', -60], ['bottom', -79]]) {
    const target = degrees * Math.PI / 180;
    const dy = (target - elevation) * viewport.height / (2 * Math.PI * .45);
    const x = isMobile ? 260 : 1120, y = isMobile ? 445 : 450;
    if (session) {
      await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y }] });
      for (let step = 1; step <= 12; step++) {
        await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x: x + 30 * step / 12, y: y + dy * step / 12 }] });
      }
      await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    } else {
      await page.mouse.move(x, y); await page.mouse.down();
      await page.mouse.move(x + 30, y + dy, { steps: 12 }); await page.mouse.up();
    }
    // Damping advances per RAF, so wait frames instead of assuming hardware FPS.
    await page.evaluate(() => new Promise(resolve => {
      let frames = 0;
      const tick = () => ++frames >= 140 ? resolve() : requestAnimationFrame(tick);
      requestAnimationFrame(tick);
    }));
    elevation = target;
    const occlusion = await sampleOcclusion(page, degrees < 0);
    samples.push({ name, elevationDegrees: degrees, ...occlusion });
    await page.screenshot({ path: testInfo.outputPath(`horizon-${name}.png`) });
    if (['top', 'front', 'below', 'bottom'].includes(name)) {
      expect(occlusion.near.mean, `${name}: face-on core remains dark`).toBeLessThan(15);
    }
    if (name === 'side' || name === 'underside') {
      expect(occlusion.near.brightFraction, `${name}: near disk must cross the black silhouette`).toBeGreaterThan(.12);
      expect(occlusion.near.mean).toBeGreaterThan(25);
      expect(occlusion.far.brightFraction, `${name}: far disk must be hidden by the sphere`).toBeLessThan(.02);
      expect(occlusion.far.mean).toBeLessThan(8);
    }
  }
  await testInfo.attach('horizon-occlusion.json', { body: JSON.stringify(samples, null, 2), contentType: 'application/json' });
  await session?.detach();
  expect(errors).toEqual([]);
});
