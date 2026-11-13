# Candidate validation — 2026-11-12

## Browser and visual checks

- Production build passed with the existing large Three.js chunk warning. No dependency or lockfile changes.
- 12/12 unit tests passed.
- Final round-two run: 47/47 applicable browser tests passed; one mouse-only test skipped in the mobile project. All 42 pre-existing checks remain, plus five applicable worker/combined-input checks. The combined-input test now checks that a wheel action changes the frame gradually, settles, shrinks the shadow for positive/down-wheel and enlarges it for negative/up-wheel while held. Existing horizon depth assertions were not weakened. Full evidence: `test-results-round2.json` and `test-results-round2/`.
- Tested desktop 1440×900 and mobile 390×844/DPR 2, plus 320×640 and 844×390 layouts. Mobile means Edge touch/viewport emulation, not a real phone.
- Checked all scenes in English and Chinese, pause/resume, drag, simultaneous mouse wheel and drag, touch orbit/pinch, keyboard camera/scene navigation, language changes preserving artwork, Contact/Field Notes, PNG export, quality budgets, reduced motion, Canvas selection/retry, missing WebGL, lost/restored contexts, worker failure and pending-worker cancellation. Repeated 45 scene changes and renderer retirement passed the resource-lifecycle checks. Console/resource checks in the suite reported no unexpected errors.
- The first round exposed paused-wheel redraw; the second corrected reversed held-wheel polarity and replaced abrupt dolly with an eased target. Final full tests are green; earlier results remain historical evidence rather than being overwritten.
- Fixed screenshot comparisons use reduced motion before navigation, time 0, the default camera, deterministic data, balanced quality and 140 RAF ticks for damping. Desktop DPR 1; mobile device DPR 2 capped at 1.4. Final captures are in `captures/round2-final/`; `captures/audit-current/` preserves the first round and `captures/copy-restored/` records the original-copy restoration checkpoint. Galaxy pixels now differ intentionally due to core attenuation and the arm color knot. The old first-round byte-identical claim does not apply to the final candidate.
- Reviewed desktop/mobile framing and horizon views from +79° to −79°. Side and underside near-disk light crosses the silhouette while far-disk light remains occluded. No topmost black billboard was introduced.
- The Impeccable stop-hook review confirmed two static-analysis false positives: the candidate renders headings at 95.04px/43px, while the review page renders 40px/19px headings over 13px paragraphs. The detector misses JavaScript-imported CSS and the review heading's clamp shorthand. Arial remains the incumbent control/body font, with Georgia display headings. Four rule/value/file-scoped exceptions are recorded through the CLI in the workspace's `.impeccable/config.json`, with reasons and browser evidence in external `font-review.json`. No whole-file or project-wide rule suppression was added; a repeat scan of the three named files returned no findings. The comparison page's initially script-only image URLs were given explicit default sources rather than ignored.

## Performance

Environment: Windows, i9-13900HX, NVIDIA RTX 4060 Laptop GPU, Edge 157.0.4341.46 in headless mode, native ANGLE/D3D11 (no software-renderer flags). Local built files, fresh contexts, no network/CPU throttling. Two rounds reversed baseline/candidate order. Each scene had a 1.5-second settling period and a 3.2-second measurement window; roughly 768 rendered frames per window. The final rendering code was used. No other browser captures or video recordings ran during this measurement. Raw data: `performance-round2.json`; the older `performance.json` belongs to the first round.

GPU times use `EXT_disjoint_timer_query_webgl2`, surrounding draw submission from the first draw to the end of the app's render callback, including cloud and main-scene draws. They are not whole-browser GPU time. RAF cadence is recorded separately. CPU submission figures hit the browser clock's 0.1ms resolution and are not useful as fine-grained performance claims.

| Conditions / scene | Baseline GPU P50, ms | Candidate GPU P50, ms |
| --- | ---: | ---: |
| Desktop balanced / galaxy | 0.208–0.210 | 0.167–0.169 |
| Desktop balanced / horizon | 0.215–0.217 | 0.200 |
| Desktop balanced / nebula | 0.187–0.193 | 0.474–0.477 |
| Desktop high / galaxy | 0.249–0.250 | 0.210 |
| Desktop high / horizon | 0.258 | 0.241–0.242 |
| Desktop high / nebula | 0.449–0.452 | 1.001–1.165 |
| Mobile emulation balanced / galaxy | 0.101–0.102 | 0.090 |
| Mobile emulation balanced / horizon | 0.106–0.108 | 0.101–0.103 |
| Mobile emulation balanced / nebula | 0.127–0.131 | 0.256–0.257 |

The extra nebula density lookup, more ray steps and larger render target have a material cost: about +0.28ms in balanced quality and +0.55–0.72ms in high quality, roughly 2.2–2.6 times baseline high-quality GPU time. The cloud-edge and star-depth separation was retained with this cost visible to the reviewer. The other scenes remain slightly below baseline draw cost. Two runs on one fast laptop do not establish low-end-device performance. Baseline balanced-quality GPU P95 spikes reached 3.14ms; candidate nebula high P95 was 1.32–1.63ms. Raw spikes are retained, not used to claim a broad P95 benefit. RAF P95 was approximately 4.3–4.7ms on this 240Hz environment; this is not a phone FPS claim.

Loading result across six fresh contexts per version:

- Baseline longest main-thread task: **1,081–1,477ms**.
- Candidate longest task: **131–521ms** in five contexts; the sixth recorded no task ≥50ms. Shader/renderer initialization still has a visible blocking cost; the earlier first-round sub-100ms figures are not a current upper bound.
- Full WebGL readiness: baseline **1.15–1.69s**, candidate **1.24–1.81s**. No full-readiness speedup is claimed. Canvas and controls remain available during Worker data generation; renderer initialization is still on the main thread. A blocked Worker returns to synchronous generation and also returns its startup blocking cost.

Raw measurements, browser traces, fixed captures, scripts and short input recordings are outside the source checkout at `C:/Users/a1587/Documents/ChatGPT/个人作品制作 3/void-atlas-refinement-20261112`.

## Video method

The revised review videos use 1440×900 H.264/yuv420p, 60 fps and 18 seconds per version. The browser renders a fresh PNG at each 1/60-second artwork step. Real pointer/wheel events follow a quintic eased trajectory, with about 2px maximum horizontal movement per frame; drag and zoom run together and return smoothly. PNG hashes count unique/consecutive duplicate frames before encoding. This is offline fixed-step capture, not an interpolation of the 25 fps recording and not proof of realtime 60 fps performance. The app's real-time behavior is covered separately by the browser and GPU checks above.

`video/*-60fps-evidence.json` records the actual frame counts, duplicates, input-step maximum and page errors. `video/playback-60fps-check.json` records normal-speed decoded/dropped frames and playback errors after complete playback. The approved original case-study video remains unchanged; these review videos do not replace it.

Both captures contain 1080 unique PNG frames, zero consecutive duplicates and a maximum horizontal pointer step of 1.9998px. FFprobe confirms H.264, 1440×900, 60/1 fps and 18.000 seconds. At normal-speed complete playback, both decoded all 1080 frames with no media/page error; the candidate reported one dropped frame (0.093%), baseline zero. This is the measured result, not a claim of zero drops on every device. Raw decoded frames at 9s and 15s were also inspected, avoiding native video controls/loading indicators in seek screenshots. The updated comparison page passed all 28 reference/device/scene/language combinations, had no resource errors or mobile overflow, and retained all six scene introductions while hiding the specifically rejected copy.

## Limits

Not tested: physical iOS/Android devices, Safari/Firefox, low-end GPU power/performance, cross-network production loading. No deployment or whole-site production acceptance is implied. The candidate is for the user's comparison and selection.
