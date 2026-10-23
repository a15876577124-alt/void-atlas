import * as THREE from 'three';
import { createNebulaVolume } from './nebula-volume.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { createParticleData } from './particles.js';
import { profiles } from './quality.js';
import { particleVertex, particleFragment, planeVertex, diskFragment, cloudVertex, cloudFragment, horizonVertex, horizonFragment, rimFragment, lensFragment } from './shaders.js';

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
    uDiskView: { value: .44 }, uCloudSteps: { value: 48 },
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
  // The disk and particles share world origin and the XZ plane. The sphere's
  // depth splits both into near/far fragments, even while orbiting underneath.
  disk.material.depthTest = true;
  disk.renderOrder = -1;
  scene.add(disk);
  const volume = createNebulaVolume();
  const cloudTexture = new THREE.Data3DTexture(volume.data, volume.size, volume.size, volume.size);
  cloudTexture.format = THREE.RedFormat;
  cloudTexture.type = THREE.UnsignedByteType;
  cloudTexture.minFilter = cloudTexture.magFilter = THREE.LinearFilter;
  cloudTexture.needsUpdate = true;
  uniforms.uCloudVolume = { value: cloudTexture };
  const cloudGeometry = new THREE.BoxGeometry(13, 10, 9);
  const volumeCloud = new THREE.Mesh(cloudGeometry, new THREE.ShaderMaterial({
    uniforms, vertexShader: cloudVertex, fragmentShader: cloudFragment,
    transparent: true, depthWrite: false, depthTest: false,
    blending: THREE.AdditiveBlending, side: THREE.BackSide,
  }));
  const cloudScene = new THREE.Scene();
  cloudScene.add(volumeCloud);
  const cloudTarget = new THREE.WebGLRenderTarget(1, 1, { type: renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float') ? THREE.HalfFloatType : THREE.UnsignedByteType, depthBuffer: false });
  const compositeGeometry = new THREE.PlaneGeometry(2, 2);
  const clouds = new THREE.Mesh(compositeGeometry, new THREE.ShaderMaterial({
    uniforms: { cloudMap: { value: cloudTarget.texture } },
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=vec4(position.xy,1.,1.);}',
    fragmentShader: 'uniform sampler2D cloudMap; varying vec2 vUv; void main(){gl_FragColor=vec4(texture2D(cloudMap,vUv).rgb,1.);\n#include <tonemapping_fragment>\n#include <colorspace_fragment>\n}',
    transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
  }));
  clouds.frustumCulled = false;
  clouds.renderOrder = -2;
  scene.add(clouds);
  const horizonGeometry = new THREE.SphereGeometry(1.02, 96, 64);
  const horizon = new THREE.Mesh(horizonGeometry, new THREE.ShaderMaterial({
    uniforms, vertexShader: horizonVertex, fragmentShader: horizonFragment,
    depthWrite: true, depthTest: true,
  }));
  scene.add(horizon);
  const rim = new THREE.Mesh(horizonGeometry, new THREE.ShaderMaterial({
    uniforms, vertexShader: horizonVertex, fragmentShader: rimFragment,
    transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending,
  }));
  rim.scale.setScalar(1.065);
  rim.renderOrder = -3;
  scene.add(rim);
  // An apparent image of the far disk, not another occluding black billboard.
  // Its inner edge is hidden by the real sphere; near disk fragments draw over it.
  const lensGeometry = new THREE.PlaneGeometry(4, 4);
  const lens = new THREE.Mesh(lensGeometry, new THREE.ShaderMaterial({
    uniforms, vertexShader: planeVertex, fragmentShader: lensFragment,
    transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending,
  }));
  lens.renderOrder = -2;
  scene.add(lens);

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
    const cloudScale = { low: .4, balanced: .5, high: .75 }[currentQuality];
    cloudTarget.setSize(Math.max(1, Math.round(w * renderer.getPixelRatio() * cloudScale)), Math.max(1, Math.round(h * renderer.getPixelRatio() * cloudScale)));
    camera.aspect = w / h;
    camera.setViewOffset(w, h, -w * (mobile ? .04 : .145), -h * (mobile ? .07 : -.01), w, h);
    camera.updateProjectionMatrix();
    uniforms.uDpr.value = renderer.getPixelRatio();
    uniforms.uScale.value = Math.min(h / 900, 1.5);
    dirty = true;
  };
  const setQuality = value => {
    currentQuality = value;
    uniforms.uCloudSteps.value = { low: 32, balanced: 48, high: 72 }[value];
    geometry.setDrawRange(0, profiles[value].count);
    resize();
  };
  setQuality(quality);
  // Compile now; a shader failure must never be mistaken for a working scene.
  let shaderFailure = false;
  renderer.debug.onShaderError = () => { shaderFailure = true; };
  renderer.compile(scene, camera);
  renderer.compile(cloudScene, camera);
  if (shaderFailure) {
    dispose();
    throw new Error('A WebGL shader could not compile.');
  }
  function dispose() {
    controls.dispose();
    geometry.dispose(); material.dispose(); planeGeometry.dispose();
    disk.material.dispose(); clouds.material.dispose(); cloudGeometry.dispose(); cloudTexture.dispose(); volumeCloud.material.dispose(); cloudTarget.dispose(); compositeGeometry.dispose();
    horizonGeometry.dispose(); horizon.material.dispose(); rim.material.dispose();
    lensGeometry.dispose(); lens.material.dispose();
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
      horizon.visible = rim.visible = lens.visible = weights[1] > .001;

      uniforms.uDiskView.value = camera.position.y / camera.position.length();
      lens.quaternion.copy(camera.quaternion);
      lens.position.copy(camera.position).normalize().multiplyScalar(-.18);
      if (clouds.visible) {
        renderer.setRenderTarget(cloudTarget); renderer.setClearColor(0x000000, 0);
        renderer.render(cloudScene, camera);
        renderer.setRenderTarget(null); renderer.setClearColor('#070b10', 1);
      }
      renderer.render(scene, camera);
    },
  };
}
