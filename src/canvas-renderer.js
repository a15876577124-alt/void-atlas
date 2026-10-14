import { createCanvasControls } from './pointer.js';

// Independent rendering path, also used after WebGL context loss.
export function createCanvasRenderer(canvas) {
  const ctx = canvas.getContext('2d', { alpha: false });
  if (!ctx) throw new Error('Canvas 2D is unavailable in this browser.');
  let w = 1, h = 1, dirty = true, lastTime = -1;
  const lastWeights = [-1, -1, -1];
  const view = { yaw: .15, tilt: -.6, zoom: 1 };
  const removeControls = createCanvasControls(canvas, view, () => { dirty = true; });
  const count = matchMedia('(max-width:600px)').matches ? 1800 : 3800;
  const random = (i, s) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
  const points = Array.from({ length: count }, (_, i) => ({
    r: Math.sqrt(random(i, 2)),
    a: (i % 4) * Math.PI / 2 + Math.sqrt(random(i, 2)) * 7.8 + (random(i, 3) - .5) * .75,
    seed: random(i, 4), size: .4 + random(i, 5) * 1.3,
  }));
  const resize = () => {
    w = innerWidth; h = innerHeight;
    const dpr = Math.min(devicePixelRatio || 1, 1.5);
    canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    dirty = true;
  };
  resize();
  return {
    mode: 'canvas', count, resize,
    setQuality() {},
    reset() { view.yaw = .15; view.tilt = -.6; view.zoom = 1; dirty = true; },
    zoom(factor) { view.zoom = Math.max(.55, Math.min(2.6, view.zoom * factor)); dirty = true; },
    render(time, weights) {
      if (!dirty && time === lastTime && weights.every((v, i) => v === lastWeights[i])) return;
      dirty = false; lastTime = time; lastWeights.splice(0, 3, ...weights);
      ctx.fillStyle = '#070b10'; ctx.fillRect(0, 0, w, h);
      const mobile = w <= 600, cx = w * (mobile ? .55 : .66), cy = h * (mobile ? .55 : .5);
      const scale = Math.min(w / (mobile ? 650 : 1300), h / 900) * view.zoom;
      const glow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * .6);
      glow.addColorStop(0, `rgba(${Math.round(90 + weights[1] * 40)},${Math.round(85 - weights[1] * 30)},${Math.round(80 + weights[2] * 70)},.18)`);
      glow.addColorStop(1, '#070b1000');
      ctx.fillStyle = glow; ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'screen';
      for (const p of points) {
        const a = p.a + time * .025, rad = p.r * 490;
        const g = [Math.cos(a) * rad, (p.seed - .5) * 50 * (1 - p.r), Math.sin(a) * rad];
        const ha = a + time * .03 / (p.r + .3), hr = 100 + p.r * p.r * 360;
        const e = [Math.cos(ha) * hr, (p.seed - .5) * 15, Math.sin(ha) * hr];
        const n = [Math.cos(a) * rad + Math.sin(a * 3) * 90, Math.sin(a * 2 + p.seed * 5) * 140, Math.sin(a) * rad];
        const pos = g.map((v, k) => v * weights[0] + e[k] * weights[1] + n[k] * weights[2]);
        const x = pos[0] * Math.cos(view.yaw) - pos[2] * Math.sin(view.yaw);
        const z = pos[0] * Math.sin(view.yaw) + pos[2] * Math.cos(view.yaw);
        const y = pos[1] * Math.cos(view.tilt) - z * Math.sin(view.tilt);
        const depth = pos[1] * Math.sin(view.tilt) + z * Math.cos(view.tilt), persp = 950 / (950 + depth);
        ctx.globalAlpha = .3 + p.seed * .65;
        ctx.fillStyle = weights[2] > .5 ? (p.seed > .5 ? '#df9fbb' : '#70b9ca') : weights[1] > .5 ? (p.seed > .4 ? '#f0bc85' : '#bc7858') : (p.seed > .35 ? '#d7cdc0' : '#91b6c8');
        ctx.beginPath(); ctx.arc(cx + x * scale * persp, cy + y * scale * persp, Math.max(.3, p.size * scale * persp), 0, Math.PI * 2); ctx.fill();
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over';
      if (weights[1] > .01) {
        ctx.globalAlpha = weights[1]; ctx.beginPath(); ctx.arc(cx, cy, 58 * scale, 0, Math.PI * 2);
        ctx.fillStyle = '#030509'; ctx.fill(); ctx.strokeStyle = '#ebbe8d'; ctx.lineWidth = 1.5 * scale; ctx.stroke(); ctx.globalAlpha = 1;
      }
    },
    dispose() { removeControls(); },
  };
}
