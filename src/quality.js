export const profiles = Object.freeze({
  low: { count: 18000, dpr: 1, label: 'Light' },
  balanced: { count: 42000, dpr: 1.4, label: 'Balanced' },
  high: { count: 76000, dpr: 1.75, label: 'High' },
});

export function initialQuality({ mobile = false, memory = 8, cores = 8 } = {}) {
  if (memory <= 2 || cores <= 2) return 'low';
  return mobile || memory < 8 || cores < 8 ? 'balanced' : 'high';
}

// Lower only: avoids repeated buffer allocation and oscillation during interaction.
export class QualityGovernor {
  constructor() { this.reset(); }
  reset() { this.elapsed = 0; this.frames = 0; this.warmup = 2; }
  sample(dt, quality) {
    if (dt <= 0 || dt > 1) return null;
    if (this.warmup > 0) { this.warmup -= dt; return null; }
    this.elapsed += dt;
    this.frames++;
    if (this.elapsed < 2.5) return null;
    const fps = this.frames / this.elapsed;
    this.reset();
    if (fps < 35 && quality !== 'low') return quality === 'high' ? 'balanced' : 'low';
    return null;
  }
}
