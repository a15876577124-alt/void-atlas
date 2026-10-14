# Codex Cloud — production tasks

Repository: void-atlas (connect an accessible GitHub repository in a published Codex Cloud environment).

**Read README.md and WORK_BRIEF.md first. Existing index.html is a Canvas 2D demonstration, not a Three.js build.**

## P0: stable artifact (must complete first)
- Ensure all scene buttons, pointer drag, scroll zoom, pause, screenshot, resizing work.
- Add keyboard scene controls (1/2/3), accessible names/focus styling, touch-friendly navigation.
- Add clear reduced-motion controls and a visible performance fallback for low-powered devices.
- Verify runtime/build console contains no errors. Document test evidence.

## P1: WebGL production version (only after P0 stable)
- Migrate to Vite + Three.js with particle BufferGeometry, GPU ShaderMaterial, and orbital camera. Keep a Canvas 2D fallback for WebGL failures.
- Three independently designed scenes: spiral galaxy with arms, event horizon with ring/disc, volumetric-inspired colored nebula. Scene transitions should be smooth without a blank frame.
- Favor GPU vertex animation over thousands of JS draw calls; cap device pixel ratio and select particle count by performance/device capability.
- Implement resize, context lost/recovery, pointer/touch orbit, zoom, pause/resume, reduced motion, graceful error messaging, and screenshots where supported.
- Keep cinematic typography, minimal interface, readable mobile layout and no external paid assets.

## P2: tests and delivery
- Run npm install, npm run build and tests; add Playwright smoke tests for initial render, switching scenes, controls, mobile layout and screenshots where practical.
- Check 390px/mobile and 1440px/desktop; do not claim Safari/iOS verification without actual device or emulator coverage.
- Update README with dependency versions, run/build commands and exact verification. Deploy only where authenticated credentials/permissions allow; otherwise document steps.
- Commit changes to a working branch and prepare a reviewable PR; do not overwrite the initial prototype without a clear migration.

## Definition of done
- At least one stable deployed or locally runnable artifact with three distinct scenes, real interactions and honest verification details.
- No build errors, no obvious UI overflows, no mandatory paid service, and no invented features or benchmark figures.
