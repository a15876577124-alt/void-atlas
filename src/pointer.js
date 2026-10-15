export function createCanvasControls(canvas, view, invalidate) {
  const pointers = new Map();
  let lastDistance = 0;
  const distance = () => {
    const [a, b] = [...pointers.values()];
    return Math.hypot(a.x - b.x, a.y - b.y);
  };
  const down = e => {
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    canvas.setPointerCapture(e.pointerId);
    if (pointers.size === 2) lastDistance = distance();
  };
  const move = e => {
    const previous = pointers.get(e.pointerId);
    if (!previous) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.size === 1) {
      view.yaw += (e.clientX - previous.x) * .005;
      view.tilt = Math.max(-1.2, Math.min(1.2, view.tilt + (e.clientY - previous.y) * .005));
    } else if (pointers.size === 2) {
      const next = distance();
      if (lastDistance > 0) view.zoom = Math.max(.55, Math.min(2.6, view.zoom * next / lastDistance));
      lastDistance = next;
    }
    invalidate();
  };
  const up = e => { pointers.delete(e.pointerId); lastDistance = 0; };
  const wheel = e => {
    e.preventDefault();
    view.zoom = Math.max(.55, Math.min(2.6, view.zoom * Math.exp(-e.deltaY * .001)));
    invalidate();
  };
  const handlers = { pointerdown: down, pointermove: move, pointerup: up, pointercancel: up, lostpointercapture: up, wheel };
  for (const [name, fn] of Object.entries(handlers)) canvas.addEventListener(name, fn, name === 'wheel' ? { passive: false } : undefined);
  return () => { for (const [name, fn] of Object.entries(handlers)) canvas.removeEventListener(name, fn); };
}
