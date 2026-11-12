import { createNebulaVolume } from './nebula-volume.js';
import { createParticleData } from './particles.js';
import { profiles } from './quality.js';

const volume = createNebulaVolume();
const particles = createParticleData(profiles.high.count);
postMessage({ volume, particles }, [volume.data.buffer, ...Object.values(particles).filter(ArrayBuffer.isView).map(value => value.buffer)]);
