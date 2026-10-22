// A deterministic density volume: evaluated once, then filtered in three dimensions.
let cachedVolume;
export function createNebulaVolume() {
  if (cachedVolume) return cachedVolume;
  const size = 128;
  const data = new Uint8Array(size ** 3);
  const mix = (a, b, t) => a + (b - a) * t;
  const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const hash = (x, y, z) => {
    let h = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(z, 1442695041);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
  };
  const noise = (x, y, z) => {
    const ix = Math.floor(x), iy = Math.floor(y), iz = Math.floor(z);
    const fx = smooth(0, 1, x - ix), fy = smooth(0, 1, y - iy), fz = smooth(0, 1, z - iz);
    return mix(mix(mix(hash(ix,iy,iz),hash(ix+1,iy,iz),fx),mix(hash(ix,iy+1,iz),hash(ix+1,iy+1,iz),fx),fy),
      mix(mix(hash(ix,iy,iz+1),hash(ix+1,iy,iz+1),fx),mix(hash(ix,iy+1,iz+1),hash(ix+1,iy+1,iz+1),fx),fy),fz);
  };
  const fbm = (x, y, z) => {
    let sum = 0, amp = .53;
    for (let i = 0; i < 4; i++) {
      sum += noise(x, y, z) * amp;
      const nextX = (x * .8 - z * .6) * 2.03 + 3.7;
      z = (x * .6 + z * .8) * 2.03 + 5.1; x = nextX; y = y * 2.03 + 1.9; amp *= .5;
    }
    return sum;
  };
  for (let z = 0; z < size; z++) for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    const px = (x / (size - 1) * 2 - 1), py = (y / (size - 1) * 2 - 1), pz = (z / (size - 1) * 2 - 1);
    const envelope = 1 - smooth(.45, 1, Math.hypot(px, py, pz));
    if (!envelope) continue;
    const qx = px * 2.4, qy = py * 1.8, qz = pz * 2.1;
    const w1 = fbm(qx, qy, qz), w2 = fbm(qx + 4.2, qy - 2.1, qz + 1.7);
    const f = fbm(qx * 2.1 + w1 * 2.8, qy * 2.1 + w2 * 2.8, qz * 2.1 + w1 * 1.6);
    const lane = fbm(qx * 1.6 - w2 * 1.8, qy * 1.6 - w1 * 1.8, qz * 1.6);
    const ridge = Math.pow(Math.max(0, 1 - Math.abs(f - .52) * 8), 3);
    const structure = ridge * smooth(.38, .64, lane);
    // Retain only coherent high-density filaments so integration leaves open channels.
    const detail = .82 + .36 * smooth(.25, .75, noise(qx * 18, qy * 18, qz * 18));
    const density = Math.pow(structure, 3) * envelope * 3.5 * detail;
    data[(z * size + y) * size + x] = Math.round(Math.min(1, density * 2.4) * 255);
  }
  cachedVolume = { data, size };
  return cachedVolume;
}
