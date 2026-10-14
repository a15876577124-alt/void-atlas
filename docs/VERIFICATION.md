# Executed verification

Date: **2026-10-14**. These are local cloud-instance results, not deployment or real-device claims.

## Event Horizon depth repair

The subsequent depth repair passed **6 unit tests and 22 browser cases**, including new framebuffer occlusion checks for both mouse and native touch orbit. See the [full regression log](verification/horizon-full-suite.txt) and [angle-by-angle evidence](HORIZON_DEPTH.md). The original delivery results below remain historical evidence for the initial upgrade.

A final lens-only polish makes the brighter arc swap smoothly when the camera crosses the disk plane. Both affected browser cases were then rerun successfully, with an additional exactly edge-on drag/capture: [2 passed](verification/horizon-final.txt). That command rebuilt the final production artifact. No runtime/console/HTTP errors occurred in these checks; the existing large-chunk build advisory remains. The complete suite above preceded this small shader polish.

The sphere, disk and particle band now share a 3D center and use depth testing. Screenshots in `screenshots/horizon-depth/` show face-on, oblique, side and underside views; UI and palette were retained. Earlier `screenshots/horizon.png` and `horizon-mobile.png` document the original implementation, not this repair.

## Environment and reproduction

- Linux, Node 24.19.0, npm 11.9.0, system Chromium 154.0.8037.57.
- Vite 8.3.4, Three.js 0.186.1, Playwright Test 1.64.1; exact versions and artifact integrities in the lockfile.
- `npm ci --cache /workspace/.cache/npm` succeeded without changing the lockfile.
- `npm test` executed the unit tests and rebuilt/served `dist` for browser tests. Software WebGL was explicitly enabled with headless ANGLE SwiftShader.

## Original upgrade results

| Check | Executed result |
| --- | --- |
| Original prototype baseline, before migration | 18 functional checks passed |
| New Canvas vertical slice, before GPU integration | 4 browser cases and 4 initial unit tests passed |
| Final complete suite | **6 unit tests passed; 20 browser cases passed; 0 failed, 0 skipped** |
| Compatibility layout polish after the full run | **4 affected browser cases passed**, including added non-overlap assertions at 320×640, 390×844, 844×390 and 1440×900 across the projects |
| Final production build | Passed; actual static response and bundled Three.js license response checked |
| Static hosting at a subpath | Served the built directory through Python's static server at a nested path; WebGL, hash deep link, all scene buttons and a PNG download passed with no runtime/HTTP errors |
| Dependency audit | `npm audit --audit-level=high`: 0 vulnerabilities at execution time (also checked production-only dependencies) |
| Source hygiene | `git diff --check` passed; archived prototype compared byte-for-byte with the starting file |

The final CSS-only polish moved compatibility messages and the retry button above the mobile toolbar. The four affected compatibility/reduced-motion cases were rerun afterward; the unchanged WebGL interaction suite was not unnecessarily repeated. The raw [full-suite log](verification/full-suite.txt), [follow-up log](verification/compatibility.txt), [build log](verification/build.txt) and [prototype baseline](verification/prototype-baseline.json) preserve scope and outcomes. The archived prototype's favicon 404 is explicitly recorded; the new main app's tested routes have no such error.

## What the browser tests actually assert

- **Both projects:** 1440×900 desktop and 390×844 mobile emulation (DPR 2); additional 320×640 and 844×390 layouts.
- **Rendering:** an actual WebGL 2 renderer, illuminated framebuffer samples, three different image signatures, no browser JavaScript/console/HTTP errors on the tested main-app paths.
- **Export:** a real downloaded PNG with the correct signature and framebuffer dimensions.
- **Motion:** pause freezes the image; resume changes it; reduced motion starts paused with the correct label.
- **Input:** native mouse drag and wheel; Chromium CDP touch drag and two-finger pinch; camera reset; Canvas pointer release and exact reset-image equality; keyboard scene switching and modal Escape/focus return.
- **Transitions:** rapid scene changes while paused retain illuminated sampled intermediate frames and arrive at the selected chapter.
- **Reliability:** missing WebGL capability selects Canvas; `WEBGL_lose_context` triggers real context loss, preserves scene state in Canvas, and restoration creates a working WebGL renderer. Explicit lightweight selection and retry are also exercised.
- **Performance controls:** all three particle budgets render nonblank images; draw-buffer dimensions follow capped DPR; unit tests verify sustained-slow-frame adaptation without upgrades or reaction to hidden-tab gaps.

Canvas reset tests compare the PNG export path. Repeated `getImageData` caused Chromium to change raster backends and antialiasing, producing a false exact-image mismatch; diagnosis confirmed identical exported PNGs before and after reset. The final test retains exact image-signature equality rather than relaxing the assertion.

## Build and delivery

Original upgrade Vite output (decimal kB):

| Asset | Raw | Gzip |
| --- | ---: | ---: |
| HTML | 6.87 | 2.59 |
| CSS | 11.43 | 3.59 |
| Main application JS | 12.37 | 5.45 |
| Lazy WebGL / Three.js JS | 556.06 | 139.01 |

The largest chunk produces Vite's standard 500 kB advisory; it is not a build error and was not hidden. The main UI and independent Canvas path are in the smaller entry chunk. `dist/` also contains the untouched prototype, favicon and Three.js MIT notice.

Prepared outputs in this workspace:

- `/workspace/void-atlas/dist/` — runnable static production files.
- `/workspace/artifacts/void-atlas-production.zip` — production bundle.
- `/workspace/artifacts/void-atlas-source.zip` — source at the delivery commit.
- `/workspace/artifacts/void-atlas-review.bundle` — portable Git branch with its history.

Screenshots in [screenshots/](screenshots/) are unedited captures of the actual production app, using paused Balanced detail. [Performance data](PERFORMANCE.md) was measured separately with Auto and active animation, without the test suite running concurrently.

## Not executed / not claimed

- Physical phones, mobile GPU thermal behavior, Safari/iOS, Firefox, HDR/color calibration, or a guaranteed 60 FPS.
- Relativistic ray tracing or ray-marched cloud volumes.
- Remote GitHub Actions execution or a publicly deployed preview. Local test success and Git publishing do not establish those outcomes.
- Environment publication or restoration of this local branch in a new task. Updated installation and startup instructions were saved to the environment draft; saving the draft does not publish it or restart services.
