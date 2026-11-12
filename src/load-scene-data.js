import { createNebulaVolume } from './nebula-volume.js';
import { createParticleData } from './particles.js';
import { profiles } from './quality.js';

let pendingData;
export function loadSceneData() {
  pendingData ??= new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./scene-data-worker.js', import.meta.url), { type: 'module' });
    worker.onmessage = ({ data }) => { worker.terminate(); resolve(data); };
    worker.onerror = event => { event.preventDefault(); worker.terminate(); reject(new Error('Scene worker unavailable.')); };
  }).catch(() => ({ volume: createNebulaVolume(), particles: createParticleData(profiles.high.count) }));
  return pendingData;
}
