// Seeded geometry: generated once, never rewritten per animation frame.
export function createParticleData(count, seed = 2311) {
  const galaxy = new Float32Array(count * 3);
  const horizon = new Float32Array(count * 3);
  const nebula = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4);
  let state = seed >>> 0;
  const random = () => { state = (Math.imul(state, 1664525) + 1013904223) >>> 0; return (state + 1) / 4294967297; };
  const normal = () => Math.sqrt(-2 * Math.log(random())) * Math.cos(Math.PI * 2 * random());
  for (let i = 0; i < count; i++) {
    const t = i * 3, s = i * 4;
    const r = Math.pow(random(), .72) * 5.3;
    const core = random() < .13;
    const arm = i % 4;
    const a = arm * Math.PI / 2 + r * 1.14 + normal() * (.09 + r * .035);
    const diffuse = random() < .14;
    const angle = diffuse ? random() * Math.PI * 2 : a;
    if (core) {
      const cr = Math.pow(random(), 1.7) * .95, phi = random() * Math.PI * 2, cosTheta = random() * 2 - 1;
      galaxy[t] = cr * Math.sqrt(1 - cosTheta * cosTheta) * Math.cos(phi);
      galaxy[t + 1] = cr * cosTheta * .48;
      galaxy[t + 2] = cr * Math.sqrt(1 - cosTheta * cosTheta) * Math.sin(phi);
    } else {
      // Correlated arm irregularity preserves the seeded stream of the other scenes.
      const warp = .08 * Math.sin(r * 2.1) + .035 * Math.sin(r * 5.2);
      const radius = r + .13 * Math.sin(r * 4.4 + arm * .9) * (r / 5.3);
      const branch = !diffuse && i % 7 === 0 ? .16 * Math.sin(r * 1.6) : 0;
      galaxy[t] = Math.cos(angle + warp + branch) * radius;
      galaxy[t + 1] = normal() * (.055 + (1 - r / 5.3) * .17);
      galaxy[t + 1] += Math.sin(angle * 2. + r) * .06 * (r / 5.3) ** 2;
      galaxy[t + 2] = Math.sin(angle + warp + branch) * radius;
    }
    const ha = random() * Math.PI * 2, hr = 1.15 + Math.pow(random(), 1.8) * 4;
    horizon[t] = Math.cos(ha) * hr;
    horizon[t + 1] = normal() * .035 * hr;
    horizon[t + 2] = Math.sin(ha) * hr;

    const na = random() * Math.PI * 2, nr = Math.pow(random(), .5);
    const band = random() > .5 ? 1 : -1;
    nebula[t] = Math.cos(na) * 3.1 * nr + normal() * .65;
    nebula[t + 1] = Math.sin(na * 1.5) * 1.4 * nr + band * .35 + normal() * .4;
    nebula[t + 2] = Math.sin(na) * 2.4 * nr + normal() * .8;
    seeds[s] = random(); seeds[s + 1] = random();
    seeds[s + 2] = .28 + Math.pow(random(), 3) * 1.15;
    seeds[s + 3] = random();
  }
  return { galaxy, horizon, nebula, seeds };
}
