const SESSION_KEY = 'void-atlas-lacuna-entry-v1';

// The complete mark is static HTML. Animation never owns visibility or routing.
export function initBrand(link) {
  const arcs = [...link.querySelectorAll('.brand-arc')];
  const letters = link.querySelector('.brand-letters');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const events = new AbortController();
  let active = [];

  function cancel() {
    active.forEach(animation => animation.cancel());
    active = [];
  }

  function play(entry = false) {
    cancel();
    if (reduced.matches || document.hidden || typeof arcs[0]?.animate !== 'function') return;
    try {
      const animations = arcs.map((arc, index) => {
        const sign = index ? 1 : -1;
        const rest = getComputedStyle(arc).transform;
        const frames = entry
          ? [{ transform: rest, opacity: 1, easing: 'ease-in-out' }, { transform: `translate(${sign * 12}px, ${sign * 8}px)`, opacity: .9, offset: .24, easing: 'cubic-bezier(.22,1,.36,1)' }, { transform: rest, opacity: 1 }]
          : [{ transform: rest }, { transform: `translate(${sign * 5}px, ${sign * 3}px)`, offset: .35 }, { transform: rest }];
        const animation = arc.animate(frames, { duration: entry ? 1040 : 300, delay: entry ? index * 60 : 0, easing: entry ? 'linear' : 'cubic-bezier(.22,1,.36,1)', fill: 'backwards' });
        active.push(animation);
        animation.finished.catch(() => {});
        return animation;
      });
      if (entry) {
        const animation = letters.animate([{ opacity: 1 }, { opacity: .72, offset: .25 }, { opacity: 1 }], { duration: 960, easing: 'ease-in-out' });
        active.push(animation);
        animation.finished.catch(() => {});
        animations.push(animation);
      }
      Promise.all(animations.map(animation => animation.finished.catch(() => {}))).then(() => {
        for (const animation of animations) {
          animation.cancel();
          active = active.filter(item => item !== animation);
        }
      });
    } catch {
      cancel(); // Failed or partially available WAAPI keeps the complete static SVG.
    }
  }

  link.addEventListener('click', () => play(), { signal: events.signal });
  document.addEventListener('visibilitychange', () => { if (document.hidden) cancel(); }, { signal: events.signal });
  reduced.addEventListener('change', () => { if (reduced.matches) cancel(); }, { signal: events.signal });
  const destroy = () => { cancel(); events.abort(); };
  window.addEventListener('pagehide', event => {
    cancel();
    if (!event.persisted) destroy();
  }, { signal: events.signal });

  try {
    const seen = sessionStorage.getItem(SESSION_KEY);
    sessionStorage.setItem(SESSION_KEY, 'seen');
    if (!seen) play(true);
  } catch { /* Without session storage, prefer the complete static entry state. */ }

  return { replay: () => play(true), destroy };
}
