# Upgrade VOID ATLAS to a procedural Three.js artwork

The main experience was a single-file Canvas 2D study. This change provides a Vite production build with three distinct GPU scenes, shared BufferGeometry, ShaderMaterial animation, continuous scene morphing and an orbit camera. It retains the original study at `public/prototype.html` and an independent Canvas renderer for unsupported or interrupted WebGL.

The interface adds responsive editorial typography, native touch/pinch and keyboard controls, accurate reduced-motion behavior, PNG export, bounded detail profiles and frame-cadence adaptation. Includes setup instructions, art direction, review notes, a portfolio draft, real screenshots and a CI workflow.

Event Horizon uses a depth-writing sphere at the same world center as its accretion disk and particle volume. Near-side disk fragments cross in front of the sphere, while far-side fragments are occluded. A subtle view-dependent far-disk lens image follows inclination. This replaces the black billboard that previously covered all particles at every camera angle. Actual mouse/touch drags and screenshots at +60°, +30°, +10° and −10° demonstrate the spatial relationship in `docs/HORIZON_DEPTH.md`.

Validation: locked dependency installation and production build passed; after the depth repair, 6 Node unit tests and 22 desktop/mobile-emulation browser cases passed. The tests exercise actual framebuffer output and near/far occlusion, downloads, gestures, transitions and context loss/recovery. Headless SwiftShader measurements and limitations from the initial upgrade are recorded in `docs/PERFORMANCE.md`; see `docs/VERIFICATION.md` for exact scope and follow-up checks.

Known limits: physical devices, Safari/iOS and remote CI remain unverified. Vite reports the standard large-chunk advisory for the lazy Three.js renderer. Lensing is an artistic approximation. Public deployment is not claimed.
