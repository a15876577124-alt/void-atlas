import { chromium } from '@playwright/test';
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';

// Measures browser frame cadence, not GPU execution time or physical-device FPS.
const baseURL = process.argv[2] || 'http://127.0.0.1:4174';
const browser = await chromium.launch({
  executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH || (existsSync('/usr/bin/chromium') ? '/usr/bin/chromium' : undefined),
  args: ['--use-angle=swiftshader', '--enable-webgl', '--enable-unsafe-swiftshader'],
});
const results = [];
try {
  for (const [device, viewport, dpr, mobile] of [
    ['desktop', { width: 1440, height: 900 }, 1, false],
    ['mobile-emulation', { width: 390, height: 844 }, 2, true],
  ]) {
    const context = await browser.newContext({ viewport, deviceScaleFactor: dpr, isMobile: mobile, hasTouch: mobile });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto(baseURL);
    await page.waitForFunction(() => document.body.dataset.renderer === 'webgl');
    for (const name of ['Spiral Galaxy', 'Event Horizon', 'Cosmic Nebula']) {
      await page.getByRole('button', { name: new RegExp(name) }).click();
      await page.waitForTimeout(1800);
      const metrics = await page.evaluate(() => new Promise(resolve => {
        const intervals = [], start = performance.now();
        const startQuality = document.body.dataset.quality;
        let previous = start;
        function sample() {
          const now = performance.now();
          intervals.push(now - previous); previous = now;
          if (now - start < 4000) return requestAnimationFrame(sample);
          const sorted = [...intervals].sort((a, b) => a - b);
          const gl = document.querySelector('canvas').getContext('webgl2');
          const extension = gl.getExtension('WEBGL_debug_renderer_info');
          resolve({
            frames: intervals.length,
            durationMs: Math.round(now - start),
            frameCadenceFps: Number((intervals.length * 1000 / (now - start)).toFixed(1)),
            p50FrameMs: Number(sorted[Math.floor(sorted.length * .5)].toFixed(1)),
            p95FrameMs: Number(sorted[Math.floor(sorted.length * .95)].toFixed(1)),
            startQuality, endQuality: document.body.dataset.quality,
            telemetry: document.querySelector('#telemetry').textContent,
            renderer: extension ? gl.getParameter(extension.UNMASKED_RENDERER_WEBGL) : gl.getParameter(gl.RENDERER),
          });
        }
        requestAnimationFrame(sample);
      }));
      const row = { device, scene: name, viewport, ...metrics };
      results.push(row);
      console.log(JSON.stringify(row));
    }
    if (errors.length) throw new Error(errors.join('\n'));
    await context.close();
  }
} finally {
  await browser.close();
}
await mkdir('docs', { recursive: true });
await writeFile('docs/performance.json', JSON.stringify({ measuredAt: new Date().toISOString(), browser: 'System Chromium, headless ANGLE SwiftShader', note: 'Software rendering and mobile emulation on a shared cloud host. RAF cadence is diagnostic, not a claim about physical devices or GPU execution time.', results }, null, 2) + '\n');
