import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createParticleData } from './particles.js';
import { profiles } from './quality.js';
import { particleVertex, particleFragment, planeVertex, diskFragment, cloudFragment, photonFragment } from './shaders.js';

export function createWebGLRenderer(canvas, quality) {
  // Test before constructing Three's renderer so unsupported browsers fail quietly.
  const context = canvas.getContext('webgl2', { alpha: false, antialias: false, preserveDrawingBuffer: true });
  if (!context) throw new Error('WebGL 2 is not available.');
  const renderer = new THREE.WebGLRenderer({ canvas, context, antialias: false, alpha: false, preserveDrawingBuffer: true });
  renderer.setClearColor('#070b10', 1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(46, 1, .1, 180);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.dampingFactor = .1;
  controls.rotateSpeed = .45;
  controls.zoomSpeed = .65;
  controls.minDistance = 5.5;
  controls.maxDistance = 22;
  controls.minPolarAngle = .18;
  controls.maxPolarAngle = Math.PI - .18;
  camera.position.set(0, innerWidth <= 600 ? 8.2 : 5.3, innerWidth <= 600 ? 17.5 : 10.8);
  controls.update(); controls.saveState();
  const uniforms = {
    uTime: { value: 0 }, uDpr: { value: 1 }, uScale: { value: 1 },
    uWeights: { value: new THREE.Vector3(1, 0, 0) },
  };
  const data = createParticleData(profiles.high.count);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(data.galaxy, 3));
  geometry.setAttribute('aHorizon', new THREE.BufferAttribute(data.horizon, 3));
  geometry.setAttribute('aNebula', new THREE.BufferAttribute(data.nebula, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(data.seeds, 4));
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
  const material = new THREE.ShaderMaterial({
    uniforms, vertexShader: particleVertex, fragmentShader: particleFragment,
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const particles = new THREE.Points(geometry, material);
  scene.add(particles);
  const planeGeometry = new THREE.PlaneGeometry(14, 14);
  const makePlane = fragmentShader => new THREE.Mesh(planeGeometry, new THREE.ShaderMaterial({
    uniforms, vertexShader: planeVertex, fragmentShader, transparent: true,
    depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  }));
  const disk = makePlane(diskFragment);
  disk.rotation.x = -Math.PI / 2;
  disk.renderOrder = -1;
  scene.add(disk);
  const clouds = makePlane(cloudFragment);
  clouds.scale.set(1, .75, 1);
  clouds.renderOrder = -2;
  scene.add(clouds);
  const photon = makePlane(photonFragment);
  photon.scale.setScalar(2.3 / 14 * 2);
  photon.material.blending = THREE.NormalBlending;
  photon.renderOrder = 3;
  scene.add(photon);

  // A separate fixed star field adds depth without any texture requests.
  const starsGeometry = new THREE.BufferGeometry();
  const stars = new Float32Array(1000 * 3), starColors = new Float32Array(1000 * 3);
  for (let i = 0; i < 1000; i++) {
    const a = i * 2.399963, y = 1 - (i + .5) / 500, r = Math.sqrt(1 - y * y);
    stars.set([Math.cos(a) * r * 60, y * 60, Math.sin(a) * r * 60], i * 3);
    const light = .17 + (i % 11) / 40;
    starColors.set([light * .9, light, light * 1.05], i * 3);
  }
  starsGeometry.setAttribute('position', new THREE.BufferAttribute(stars, 3));
  starsGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
  const starsMaterial = new THREE.PointsMaterial({ size: .06, vertexColors: true, transparent: true, opacity: .7, depthWrite: false });
  scene.add(new THREE.Points(starsGeometry, starsMaterial));

  let currentQuality = quality, dirty = true, lastTime = -1, previousMobile = innerWidth <= 600;
  const lastWeights = new THREE.Vector3(-1, -1, -1);
  const resize = () => {
    const w = innerWidth, h = innerHeight, mobile = w <= 600;
    if (mobile !== previousMobile) {
      const distance = Math.max(controls.minDistance, Math.min(controls.maxDistance, camera.position.length() * (mobile ? 1.6 : 1 / 1.6)));
      camera.position.normalize().multiplyScalar(distance);
      previousMobile = mobile;
    }
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, profiles[currentQuality].dpr));
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.setViewOffset(w, h, -w * (mobile ? .04 : .145), -h * (mobile ? .07 : -.01), w, h);
    camera.updateProjectionMatrix();
    uniforms.uDpr.value = renderer.getPixelRatio();
    uniforms.uScale.value = Math.min(h / 900, 1.5);
    dirty = true;
  };
  const setQuality = value => {
    currentQuality = value;
    geometry.setDrawRange(0, profiles[value].count);
    resize();
  };
  setQuality(quality);
  // Compile now; a shader failure must never be mistaken for a working scene.
  let shaderFailure = false;
  renderer.debug.onShaderError = () => { shaderFailure = true; };
  renderer.compile(scene, camera);
  if (shaderFailure) {
    dispose();
    throw new Error('A WebGL shader could not compile.');
  }
  function dispose() {
    controls.dispose();
    geometry.dispose(); material.dispose(); planeGeometry.dispose();
    disk.material.dispose(); clouds.material.dispose(); photon.material.dispose();
    starsGeometry.dispose(); starsMaterial.dispose(); renderer.dispose();
    // Release healthy, retired contexts; leave lost ones restorable by the browser.
    if (!context.isContextLost()) renderer.forceContextLoss();
  }
  return {
    mode: 'webgl',
    get count() { return profiles[currentQuality].count; },
    resize, setQuality, dispose,
    reset() {
      controls.reset();
      camera.position.set(0, innerWidth <= 600 ? 8.2 : 5.3, innerWidth <= 600 ? 17.5 : 10.8);
      controls.target.set(0, 0, 0); controls.update(); dirty = true;
    },
    zoom(factor) {
      const distance = Math.max(controls.minDistance, Math.min(controls.maxDistance, camera.position.distanceTo(controls.target) / factor));
      camera.position.sub(controls.target).normalize().multiplyScalar(distance).add(controls.target); controls.update();
      dirty = true;
    },
    render(time, weights) {
      const changed = controls.update();
      const nextWeights = uniforms.uWeights.value.set(...weights);
      if (!dirty && !changed && time === lastTime && nextWeights.equals(lastWeights)) return;
      dirty = false; lastTime = time; lastWeights.copy(nextWeights);
      uniforms.uTime.value = time;
      disk.visible = weights[0] + weights[1] > .001;
      clouds.visible = weights[2] > .001;
      photon.visible = weights[1] > .001;
      clouds.quaternion.copy(camera.quaternion);
      clouds.position.copy(camera.position).normalize().multiplyScalar(-2);
      photon.quaternion.copy(camera.quaternion);
      renderer.render(scene, camera);
    },
  };
}
