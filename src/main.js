import './style.css';
import { scenes, sceneFromHash } from './scenes.js';
import { createCanvasRenderer } from './canvas-renderer.js';
import { initialQuality, profiles, QualityGovernor } from './quality.js';
import { t, initI18n, setLanguage, currentLang } from './i18n.js';

const $ = selector => document.querySelector(selector);
const reduce = matchMedia('(prefers-reduced-motion: reduce)');
const governor = new QualityGovernor();
const qualitySelect = $('#quality');
let scene = sceneFromHash(location.hash), paused = reduce.matches, elapsed = 0, previous = 0, engine;
let currentQuality = initialQuality({ mobile: matchMedia('(max-width:600px)').matches, memory: navigator.deviceMemory ?? 8, cores: navigator.hardwareConcurrency ?? 4 });
const weights = [0, 0, 0]; weights[scene] = 1;
let target = [...weights], startWeights = [...weights], transition = 1, toastTimer, currentStatusKey = '';

function toast(message) {
  $('#toast').textContent = message; $('#toast').classList.add('visible'); clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 3200);
}
function updateMotion() {
  $('#pause').setAttribute('aria-pressed', String(paused));
  $('#pause').setAttribute('aria-label', paused ? t('resume.aria') : t('pause.aria'));
  $('#motion-label').textContent = paused ? t('resume') : t('pause');
  $('#motion-icon').textContent = paused ? '▷' : 'Ⅱ';
  document.body.dataset.paused = String(paused);
}
function renderSceneCopy() {
  const data = scenes[scene];
  const id = data.id;
  $('#kicker').textContent = t(`scene.${id}.kicker`);
  $('#headline').innerHTML = t(`scene.${id}.title`);
  $('#description').innerHTML = t(`scene.${id}.description`);
  $('#scene-coordinate').textContent = data.coordinate;
}
function setScene(index, announce = true) {
  scene = (index + scenes.length) % scenes.length;
  const data = scenes[scene];
  startWeights = [...weights]; target = [0, 0, 0]; target[scene] = 1; transition = reduce.matches ? 1 : 0;
  if (transition === 1) weights.splice(0, 3, ...target);
  renderSceneCopy();
  document.querySelectorAll('.chapter').forEach((button, i) => { button.classList.toggle('active', i === scene); button.setAttribute('aria-pressed', String(i === scene)); });
  if (announce) $('#scene-announcement').textContent = t('scene.announce', { name: t(`scene.${data.id}.name`), overline: t(`scene.${data.id}.overline`) });
  if (announce && !reduce.matches) {
    $('#story').getAnimations().forEach(animation => animation.cancel());
    $('#story').animate([{ opacity: .6, transform: 'translateY(5px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 500, easing: 'ease-out' });
  }
  history.replaceState(null, '', `#${data.id}`); document.body.dataset.scene = data.id;
}
function setStatus(key) {
  currentStatusKey = key;
  $('#render-status').textContent = key ? t(key) : '';
}
function updateTelemetry() {
  if (!engine) return;
  const labelKey = engine.mode === 'webgl' ? currentQuality : 'low';
  const quality = t(`quality.${labelKey}`);
  $('#telemetry').textContent = `${engine.mode === 'webgl' ? 'WebGL' : 'Canvas'} / ${quality} / ${engine.count.toLocaleString('en-US')} ${t('telemetry.particles')}`;
  document.body.dataset.renderer = engine.mode; document.body.dataset.quality = currentQuality;
  qualitySelect.disabled = engine.mode === 'canvas';
}
function applyLanguage() {
  renderSceneCopy();
  updateMotion();
  updateTelemetry();
  setStatus(currentStatusKey);
  $('#lang-toggle').setAttribute('aria-label', t('lang.aria'));
}
function createFreshCanvas() {
  const previous = $('#universe'), canvas = previous.cloneNode(false);
  previous.replaceWith(canvas); return canvas;
}
function activateCanvas(statusKey = 'status.canvas') {
  engine?.dispose(); engine = createCanvasRenderer(createFreshCanvas());
  engine.render(elapsed, weights);
  setStatus(statusKey); updateTelemetry();
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
      activateCanvas('status.webglInterrupted');
      $('#retry').hidden = false;
    });
    canvas.addEventListener('webglcontextrestored', () => {
      if (generation === rendererGeneration && engine.mode === 'canvas') activateWebGL();
    }, { once: true });
    engine.render(elapsed, weights);
    setStatus('');
    $('#retry').hidden = true;
    governor.reset(); updateTelemetry();
  } catch (error) {
    console.warn('VOID ATLAS: using the Canvas edition.', error.message);
    activateCanvas('status.webglUnavailable');
    $('#retry').hidden = false;
  } finally {
    $('#retry').disabled = false;
  }
}
initI18n(applyLanguage);
activateCanvas('status.preparingWebGL');
if (new URLSearchParams(location.search).get('renderer') === 'canvas') {
  setStatus('status.canvas');
  $('#retry').hidden = false;
} else activateWebGL();
$('#retry').addEventListener('click', activateWebGL);

document.querySelectorAll('.chapter').forEach(button => button.addEventListener('click', () => setScene(Number(button.dataset.scene))));
$('.wordmark').addEventListener('click', e => { e.preventDefault(); setScene(0); });
addEventListener('hashchange', () => setScene(sceneFromHash(location.hash)));
$('#pause').addEventListener('click', () => { paused = !paused; updateMotion(); });
$('#reset').addEventListener('click', () => { engine.reset(); toast(t('toast.reset')); });
qualitySelect.addEventListener('change', () => {
  currentQuality = qualitySelect.value === 'auto' ? initialQuality({ mobile: innerWidth <= 600, memory: navigator.deviceMemory ?? 8, cores: navigator.hardwareConcurrency ?? 4 }) : qualitySelect.value;
  engine.setQuality(currentQuality); governor.reset(); updateTelemetry();
});
$('#about-open').addEventListener('click', () => $('#about').showModal());
$('#contact-open').addEventListener('click', () => $('#contact').showModal());
$('#lang-toggle').addEventListener('click', () => setLanguage(currentLang() === 'zh' ? 'en' : 'zh', applyLanguage));
$('#lightweight').addEventListener('click', () => {
  rendererGeneration++;
  activateCanvas('status.lightweight');
  $('#retry').hidden = false;
  $('#about').close();
});
$('#about').addEventListener('click', event => {
  if (event.target !== $('#about')) return;
  const r = event.target.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) event.target.close();
});
$('#contact').addEventListener('click', event => {
  if (event.target !== $('#contact')) return;
  const r = event.target.getBoundingClientRect();
  if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) event.target.close();
});
$('#shot').addEventListener('click', () => {
  engine.render(elapsed, weights);
  $('#universe').toBlob(blob => {
    if (!blob) { toast(t('toast.frameUnavailable')); return; }
    const url = URL.createObjectURL(blob), link = document.createElement('a');
    link.href = url; link.download = `void-atlas-${scenes[scene].id}.png`; link.click();
    setTimeout(() => URL.revokeObjectURL(url), 10000); toast(t('toast.frameSaved'));
  }, 'image/png');
});
addEventListener('keydown', event => {
  if (event.metaKey || event.ctrlKey || event.altKey || $('#about').open || $('#contact').open || ['SELECT', 'INPUT', 'TEXTAREA'].includes(event.target.tagName)) return;
  if (['1', '2', '3'].includes(event.key)) { event.preventDefault(); setScene(Number(event.key) - 1); }
  else if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); setScene(scene + (event.key === 'ArrowRight' ? 1 : -1)); }
  else if (event.code === 'Space' && !['BUTTON', 'A'].includes(event.target.tagName)) { event.preventDefault(); paused = !paused; updateMotion(); }
  else if (event.key.toLowerCase() === 'r') { engine.reset(); toast(t('toast.viewReset')); }
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
    if (lower) { currentQuality = lower; engine.setQuality(lower); updateTelemetry(); toast(t('toast.detailAdjusted', { q: t(`quality.${lower}`) })); }
  }
}
setScene(scene, false); updateMotion(); requestAnimationFrame(frame);
