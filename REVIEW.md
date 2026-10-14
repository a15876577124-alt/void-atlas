# VOID ATLAS · review

## Baseline

The starting artifact was a single-file Canvas 2D prototype. It was actually served and rechecked before migration: 18 functional checks passed for scenes, motion, pointer orbit, zoom, PNG export, resize and responsive controls. It was not evidence of WebGL or production readiness.

Original findings: keyboard scene shortcuts were absent; reduced-motion initialization left a misleading PAUSE label; touch cancellation/pinch support was incomplete; there was no explicit performance control or WebGL recovery path; a favicon request returned 404.

The original artifact is retained unchanged at `public/prototype.html`. Its historical shortcomings remain in that archived study. The main application implements the production behavior described below.

## Addressed in the new app

| Priority | Finding | Result |
| --- | --- | --- |
| P0 | Preserve working scenes and export | Shared application controls with independent Canvas and WebGL renderers; original study retained |
| P0 | Motion preference and keyboard access | Accurate paused state, 1/2/3, arrows, Space, R, +/−; semantic controls, focus styling, live announcements |
| P0 | Mobile navigation and gestures | Equal scene tabs, touch-sized controls, pointer cleanup, orbit and pinch |
| P0 | Render failures | Capability check, visible compatibility message, Canvas fallback, automatic context restoration and manual retry |
| P1 | Three independent art treatments | Seeded spiral geometry/dust, hot accretion disk and dark silhouette, cyan/rose emission with a 3D star volume |
| P1 | Scene discontinuity | Continuous shared-geometry morph from the current interpolated state, including rapid scene changes |
| P1 | Unbounded rendering cost | Fixed buffers, draw ranges, capped DPR, frame-cadence governor, manual Light and Canvas options |
| P1 | Visual defects found during review | Replaced unreliable font glyphs with SVG; faded nebula billboard edges; adjusted short-landscape typography |
| P2 | Reproducibility | Exact dependency versions and lockfile; build, unit/browser tests and CI workflow |

## Delivery limits

- Real device/GPU performance, Safari/iOS, Firefox and color-managed display differences remain unverified. Mobile coverage is Chromium emulation.
- The largest Three.js chunk triggers Vite's 500 kB raw-size advisory. The WebGL renderer is lazy-loaded separately; see the measured build sizes in verification. No size warning is suppressed.
- The cloud GitHub API request is denied, and no static-host credentials are configured. A remote deployment or PR has not been fabricated.
- This is an artistic interpretation. No claim of physical black-hole lensing, ray-marched volume rendering or scientific fidelity.
- Final executed results and current-run evidence are recorded in [verification](docs/VERIFICATION.md).
