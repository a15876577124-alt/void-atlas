# Candidate validation — 2026-11-12

## Browser and visual checks

- Production build passed with the existing large Three.js chunk warning. No dependency or lockfile changes.
- 12/12 unit tests passed.
- 47/47 applicable browser tests passed; one mouse-only test skipped in the mobile project. All 42 pre-existing browser checks remain, plus five applicable worker/combined-input checks. Existing horizon depth assertions were not weakened.
- Tested desktop 1440×900 and mobile 390×844/DPR 2, plus 320×640 and 844×390 layouts. Mobile means Edge touch/viewport emulation, not a real phone.
- Checked all scenes in English and Chinese, pause/resume, drag, simultaneous mouse wheel and drag, touch orbit/pinch, keyboard camera/scene navigation, language changes preserving artwork, Contact/Field Notes, PNG export, quality budgets, reduced motion, Canvas selection/retry, missing WebGL, lost/restored contexts, worker failure and pending-worker cancellation. Repeated 45 scene changes and renderer retirement passed the resource-lifecycle checks. Console/resource checks in the suite reported no unexpected errors.
- First browser run exposed the paused-wheel redraw problem. Listening for OrbitControls camera changes fixed it. The final full run is green; the initial failure and trace are retained externally.
- Fixed screenshot comparisons use reduced motion before navigation, time 0, the default camera, deterministic data, balanced quality and 140 RAF ticks for damping. Desktop DPR 1; mobile device DPR 2 capped at 1.4. The original and candidate galaxy canvas PNGs are byte-identical at both sizes (SHA-256 recorded externally); UI composition differs intentionally.
- Reviewed desktop/mobile framing and horizon views from +79° to −79°. Side and underside near-disk light crosses the silhouette while far-disk light remains occluded. No topmost black billboard was introduced.
- The Impeccable detector's flat-type warning was a static-analysis false positive: CSS is imported through JavaScript. The browser has a ~95px display heading and 10px controls on desktop. The generic Arial body-font warning was left standing deliberately to preserve incumbent typography; no new font system was introduced. No check was suppressed. The comparison page's initially script-only image URLs were given explicit default sources and its hook passed.

## Performance

Environment: Windows, i9-13900HX, NVIDIA RTX 4060 Laptop GPU, Edge 157.0.4341.42 in headless mode, native ANGLE/D3D11 (no software-renderer flags). Local built files, fresh contexts, no network/CPU throttling. Two rounds reversed baseline/candidate order. Each scene had a 1.5-second settling period and a 3.2-second measurement window; roughly 768 rendered frames per window.

GPU times use `EXT_disjoint_timer_query_webgl2`, surrounding draw submission from the first draw to the end of the app's render callback, including cloud and main-scene draws. They are not whole-browser GPU time. RAF cadence is recorded separately. CPU submission figures hit the browser clock's 0.1ms resolution and are not useful as fine-grained performance claims.

| Conditions / scene | Baseline GPU P50, ms | Candidate GPU P50, ms |
| --- | ---: | ---: |
| Desktop balanced / galaxy | 0.205–0.209 | 0.15–0.17 |
| Desktop balanced / horizon | 0.214–0.217 | 0.16 |
| Desktop balanced / nebula | 0.186–0.191 | 0.19–0.20 |
| Desktop high / galaxy | 0.247–0.249 | 0.21 |
| Desktop high / horizon | 0.255–0.256 | 0.20 |
| Desktop high / nebula | 0.45 | 0.47 |
| Mobile emulation balanced / galaxy | 0.10 | 0.09 |
| Mobile emulation balanced / horizon | 0.11 | 0.09 |
| Mobile emulation balanced / nebula | 0.13 | 0.13 |

The nebula change is **not free**: high quality adds about 0.02ms GPU median on this device (roughly 5%). Its more open visual structure was retained for that small measured cost. Skipping unused disk shader branches reduces galaxy/horizon draw time. Two runs on one fast laptop do not establish low-end-device performance. Baseline round 2 had balanced-quality GPU P95 spikes up to 2.86ms; these are preserved in the raw data, not used to claim a candidate P95 improvement. RAF P95 stayed around 4.3ms for both versions on this 240Hz environment; this is not a phone FPS claim.

Loading result across six fresh contexts per version:

- Baseline longest main-thread task: **1,096–1,434ms**.
- Candidate longest task: **50–92ms** in two contexts; the other four recorded no task ≥50ms.
- Full WebGL readiness: baseline **1.19–1.59s**, candidate **1.27–1.35s**. There is no consistent full-readiness speedup; the improvement is responsive controls and Canvas while CPU data generation runs in the Worker. A blocked Worker returns to synchronous generation and therefore also returns its startup blocking cost.

Raw measurements, browser traces, fixed captures, scripts and short input recordings are outside the source checkout at `C:/Users/a1587/Documents/ChatGPT/个人作品制作 3/void-atlas-refinement-20261112`.

## Limits

Not tested: physical iOS/Android devices, Safari/Firefox, low-end GPU power/performance, cross-network production loading. No deployment or whole-site production acceptance is implied. The candidate is for the user's comparison and selection.
