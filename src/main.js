import './style.css';
import { scenes, sceneFromHash } from './scenes.js';
import { createCanvasRenderer } from './canvas-renderer.js';
import { initialQuality, profiles, QualityGovernor } from './quality.js';

const $ = selector => document.querySelector(selector);
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const governor = new QualityGovernor();
const qualitySelect = $('#quality');
let scene = sceneFromHash(location.hash), paused = reduce.matches, elapsed = 0, previous = 0, engine;
let currentQuality = initialQuality({ mobile: matchMedia('(max-width:600px)').matches, memory: navigator.deviceMemory ?? 8, cores: navigator.hardwareConcurrency ?? 4 });
const weights = [0, 0, 0]; weights[scene] = 1;
let target = [...weights], startWeights = [...weights], transition = 1, toastTimer;

function toast(message) {
  $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3200);
}
function updateMotion() {
  $('#pause').setAttribute('aria-pressed', String(paused));
  $('#pause').setAttribute('aria-label', paused ? 'Resume motion' : 'Pause motion');
  $('#motion-label').textContent = paused ? 'Resume' : 'Pause';
  $('#motion-icon').textContent = paused ? '▷' : 'Ⅱ';
  document.body.dataset.paused = String(paused);
}
function setScene(index, announce = true) {
  scene = (index + scenes.length) % scenes.length;
  const data = scenes[scene];
  startWeights = [...weights]; target = [0, 0, 0]; target[scene] = 1; transition = reduce.matches ? 1 : 0;
  if (transition === 1) weights.splice(0, 3, ...target);
  $('#kicker').textContent = data.kicker; $('#headline').innerHTML = data.title;
  $('#description').innerHTML = data.description; $('#scene-coordinate').textContent = data.coordinate;
  document.querySelectorAll('.chapter').forEach((button, i) => { button.classList.toggle('active', i === scene); button.setAttribute('aria-pressed', String(i === scene)); });
  if (announce) $('#scene-announcement').textContent = `${data.name}. ${data.kicker.split('/')[1].trim()}.`;
  if (announce && !reduce.matches) {
    $('#story').getAnimations().forEach(animation => animation.cancel());
    $('#story').animate([{ opacity: .6, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 500, easing: 'ease-out' });
  }
  history.replaceState(null, '', `#${data.id}`); document.body.dataset.scene = data.id;
}
function updateTelemetry() {
  const quality = engine.mode === 'webgl' ? profiles[currentQuality].label : 'Light';
  $('#telemetry').textContent = `${engine.mode === 'webgl' ? 'WebGL' : 'Canvas'} / ${quality} / ${engine.count.toLocaleString('en-US')} particles`;
  document.body.dataset.renderer = engine.mode; document.body.dataset.quality = currentQuality;
  qualitySelect.disabled = engine.mode === 'canvas';
}
function createFreshCanvas() {
  const previous = $('#universe'), canvas = previous.cloneNode(false);
  previous.replaceWith(canvas); return canvas;
}
function activateCanvas(message = 'Canvas edition · a lighter way to explore') {
  engine?.dispose(); engine = createCanvasRenderer(createFreshCanvas());
  engine.render(elapsed, weights);
  $('#render-status').textContent = message; updateTelemetry();
}
let rendererGeneration = 0;
async function activateWebGL() {
  const generation = ++rendererGeneration;
  $('#retry').disabled = true;
  try {
    const { createWebGLRenderer } = await import('./webgl-renderer.js');
    if (generation !== rendererGeneration) return;
    const previousCanvas = $('#universe'), canvas = previousCanvas.cloneNode(false);
    const nextEngine = createWebGLRenderer(canvas, currentQuality);
    engine.dispose(); previousCanvas.replaceWith(canvas); engine = nextEngine;
    canvas.addEventListener('webglcontextlost', event => {
      event.preventDefault();
      if (canvas !== $('#universe')) return;
      activateCanvas('WebGL was interrupted. The Canvas edition is keeping your place.');
      $('#retry').hidden = false;
    });
    canvas.addEventListener('webglcontextrestored', () => {
      if (generation === rendererGeneration && engine.mode === 'canvas') activateWebGL();
    }, { once: true });
    engine.render(elapsed, weights);
    $('#render-status').textContent = '';
    $('#retry').hidden = true;
    governor.reset(); updateTelemetry();
  } catch (error) {
    console.warn('VOID ATLAS: using the Canvas edition.', error.message);
    activateCanvas('WebGL is unavailable. You can still explore the Canvas edition.');
    $('#retry').hidden = false;
  } finally {
    $('#retry').disabled = false;
  }
}
activateCanvas('Preparing the WebGL edition…');
if (new URLSearchParams(location.search).get('renderer') === 'canvas') {
  $('#render-status').textContent = 'Canvas edition · a lighter way to explore';
  $('#retry').hidden = false;
} else activateWebGL();
$('#retry').addEventListener('click', activateWebGL);

document.querySelectorAll('.chapter').forEach(button => button.addEventListener('click', () => setScene(Number(button.dataset.scene))));
$('.wordmark').addEventListener('click', e => { e.preventDefault(); setScene(0); });
addEventListener('hashchange', () => setScene(sceneFromHash(location.hash)));
$('#pause').addEventListener('click', () => { paused = !paused; updateMotion(); });
$('#reset').addEventListener('click', () => { engine.reset(); toast('Back to where we began.'); });
qualitySelect.addEventListener('change', () => {
  currentQuality = qualitySelect.value === 'auto' ? initialQuality({ mobile: innerWidth <= 600, memory: navigator.deviceMemory ?? 8, cores: navigator.hardwareConcurrency ?? 4 }) : qualitySelect.value;
  engine.setQuality(currentQuality); governor.reset(); updateTelemetry();
});
$('#about-open').addEventListener('click', () => $('#about').showModal());
$('#lightweight').addEventListener('click', () => {
  rendererGeneration++;
  activateCanvas('Lightweight edition · less detail, the same sense of wonder');
  $('#retry').hidden = false;
  $('#about').close();
});
$('#about').addEventListener('click', event => {
  if (event.target !== $('#about')) return;
  const r = event.target.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) event.target.close();
});
$('#shot').addEventListener('click', () => {
  engine.render(elapsed, weights);
  $('#universe').toBlob(blob => {
    if (!blob) { toast('Frame unavailable. Please try again.'); return; }
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = `void-atlas-${scenes[scene].id}.png`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000); toast('A small piece of the universe, saved.');
  }, 'image/png');
});
addEventListener('keydown', event => {
  if (event.metaKey || event.ctrlKey || event.altKey || $('#about').open || ['SELECT', 'INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
  if (['1', '2', '3'].includes(event.key)) { event.preventDefault(); setScene(Number(event.key) - 1); }
  else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); setScene(scene + (event.key === 'ArrowRight' ? 1 : -1)); }
  else if (event.code === 'Space' && !['BUTTON', 'A'].includes(event.target.tagName)) { event.preventDefault(); paused = !paused; updateMotion(); }
  else if (event.key.toLowerCase() === 'r') { engine.reset(); toast('View reset.'); }
  else if (['+', '=', '-', '_'].includes(event.key)) { event.preventDefault(); engine.zoom(['+', '='].includes(event.key) ? 1.15 : 1 / 1.15); }
});
reduce.addEventListener('change', () => { if (reduce.matches) { paused = true; transition = 1; weights.splice(0, 3, ...target); } updateMotion(); });
addEventListener('resize', () => engine.resize());
document.addEventListener('visibilitychange', () => { previous = 0; governor.reset(); });
function frame(now) {
  requestAnimationFrame(frame);
  const rawDt = previous ? (now - previous) / 1000 : 0;
  const dt = Math.min(rawDt, .1); previous = now;
  if (document.hidden) return;
  if (!paused) elapsed += dt;
  if (transition < 1) {
    transition = Math.min(1, transition + dt / .95);
    const ease = transition * transition * (3 - 2 * transition);
    for (let i = 0; i < 3; i++) weights[i] = startWeights[i] + (target[i] - startWeights[i]) * ease;
  }
  engine.render(elapsed, weights);
  if (engine.mode === 'webgl' && !paused && qualitySelect.value === 'auto') {
    const lower = governor.sample(rawDt, currentQuality);
    if (lower) { currentQuality = lower; engine.setQuality(lower); updateTelemetry(); toast(`Detail adjusted to ${profiles[lower].label.toLowerCase()} for a smoother journey.`); }
  }
}
setScene(scene, false); updateMotion(); requestAnimationFrame(frame);
