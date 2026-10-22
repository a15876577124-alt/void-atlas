# VOID ATLAS V3 independent audit

Baseline: 804163b (main and GitHub main verified on 2026-10-22).
Development branch: codex/visual-quality-v3. Full backup: D:/haorongli09/_BACKUP/VOID-ATLAS-before-codex-v3 (2,154 files, 143,245,102 bytes).
The prior responsive test fix is already committed separately. No rejected polish branch is merged or reused.

## Observed priorities

| Priority | Evidence | Decision |
|---|---|---|
| P0 | Light quality renders the untranslated token quality.light in both locales. | Use the quality identifier for localization; exercise all tiers. |
| P0 | Field Notes disappears at 320/360px, removing the guide and lightweight-mode entry. | Compact the header while preserving all three actions. |
| P1 | The story-rule text shares the line decoration's 32px width; translated orbit text shares the icon's 17px size. | Restrict those selectors to the decorative first child. |
| P1 | Galaxy dust forms nearly continuous, mechanically regular spiral ribbons; the disk has little thickness at side angles. | Compare two scene-specific distributions and dust treatments at unchanged particle budgets. |
| P1 | Nebula cloud plane follows the camera while the stars orbit, so cloud structure barely changes across orbit views. | Compare bounded spatial alternatives without a global fog lift or stacked transparency. |
| P1 | Horizon is already legible and depth-correct; regular radial disk lines can be evaluated locally. | Establish an extended depth test before any disk-shader experiment; retain the sphere and depth flags. |
| P2 | Automated checks do not exercise language persistence with an orbited/zoomed view or both dialogs on narrow screens. | Add focused interaction regressions. |
| P2 | Existing performance script records RAF cadence only. | Measure controlled same-browser cadence, draw calls and supported timer queries; distinguish software rendering and emulation. |
| P3 | More particles, blanket bloom, a new framework, global vignette/fog changes, and the rejected polish-v2 direction. | Not justified; retain the current identity, budgets and renderer. |

## Qualities to preserve

Warm editorial typography, dark negative space, distinct three-scene palettes, procedural assets without texture downloads, lazy WebGL loading, Canvas fallback, reduced-motion support, pause rendering avoidance, adaptive quality tiers, and the real depth-writing Event Horizon sphere.

## Baseline evidence

18 artwork captures cover all three scenes at initial, oblique, side, underside, near and far views. Fixed 1440x900, DPR 1, High, paused, Edge ANGLE SwiftShader. Evidence is outside the repository at C:/Users/a1587/Documents/ChatGPT/个人作品制作 2/void-atlas-v3-review/captures/baseline.
The active production distribution is preserved; all development builds and test artifacts use the external review directory. Physical mobile devices and discrete-GPU timings require separate validation.

## Stage 1: interface corrections

Fixed the quality label lookup, decorative span selectors, and narrow-screen Field Notes access. Added tests/interface.spec.js. Production build and 10 unit tests passed before interruption; the saved targeted E2E report confirms 6/6 passed (desktop and mobile emulation). Recovery rechecked GitHub main and backup connectivity, then captured eight UI screenshots and three artwork frames. All three initial artwork frames have identical luminance metrics to baseline. No scene source was changed in this stage.

Recovery on 2026-10-22 found no live project tests or servers; previews were restarted on loopback ports 4174/4175. Evidence remains outside the project.

## Stage 2: galaxy candidate selection

Before shader changes, the extended horizon test passed on desktop and emulated mobile across 79, 60, 30, 10, 0, -10, -60 and -79 degree elevations. Its near/far assertions remain unchanged.

A corrected arm handedness and fragmented dust with extra thickness. B additionally introduces correlated arm meanders, sparse branches, mild radial density variation and a small outer warp. Six fixed camera captures were made for each. B was selected for clearer coherent stellar/dust arms and greater side-view depth. The 76,000-particle horizon, nebula and seed arrays are byte-identical in both candidates. Budgets, background, core distribution, camera, exposure and other scenes remain unchanged.

Initial image: baseline mean luminance 16.509, dark fraction .8680; B 16.361, .8925. This is retained black space, not a global dimming layer. Software-renderer timer-query median: baseline 11.146 ms, A 11.212 ms, B 11.428 ms; all 3 draws/frame. Single controlled samples indicate a small cost, not a hardware FPS claim. Captures and performance JSON are in the external review directory.

Stage 2 acceptance: production build, 10/10 unit tests and 6/6 targeted desktop/mobile E2E passed. Horizon and nebula initial PNG SHA256 hashes match baseline exactly. Horizon A/B detail experiments were compared across six views; neither provides enough visible benefit to replace the existing depth-correct artwork.

## Stage 3: nebula experiments and decision

The camera-facing original, fixed warped surface A, direct 3D noise volume B/B2, closed shell C, cached 3D density D/D2, and half-resolution volume with full-resolution stars were compared in isolated builds. A exposes a sheet at low elevations; C stretches the texture and exposes a shell edge. B's initial excessive fog was rejected; B2 is better bounded but softer than the original. D2 opens density channels and improves spatial credibility, but still changes crisp wisps into softer clusters. The hybrid retains full-resolution stars and a 48-sample density integration; it does not yet surpass the original's clarity.

Fixed-condition software-renderer timer-query medians: baseline nebula 17.4-17.6 ms, B2 182.8 ms, C 17.8 ms, D 142.5 ms, hybrid 46.8 ms. These are SwiftShader measurements, not physical-GPU benchmarks. Hybrid initial dark fraction .6379 versus baseline .6446, mean luminance 38.85 versus 28.06. More complex rendering was evaluated for visual quality, not ruled out solely for cost.

After viewing the same-camera comparison, the user explicitly selected: retain the original wisps for this round; do not adopt the volume candidate. All nebula candidates remain outside the source tree.

The active-scene-only shader branch experiment produced identical initial artwork but no reliable performance gain, with repeat software measurements slower. It is not adopted.

Full E2E run: 26 existing/interface tests passed; 2 newly added resource tests initially counted stale JavaScript handles after context loss. The probe is corrected to inspect WebGL resource validity and wait for asynchronous context release, rather than treating missing individual delete calls as a leak.

## Final acceptance

The final production build, 10 unit tests and a unified 28/28 desktop/mobile-emulation E2E run passed. The 390px header was compacted after screenshot review; narrow-screen dialogs and all 36 layout states (six sizes, three scenes, two languages) were rechecked. Final artwork includes 18 actual captures. The eight-angle horizon gate, language pixel persistence, context restoration, pointer/pinch/keyboard controls and PNG export pass.

The 181-second dynamic soak made 12 scene transitions with 18 bufferData uploads throughout and no GL/page errors. Post-GC heap samples grew from 9,054,357 to 10,292,368 bytes; this short observation does not establish a long-term leak or a stable heap plateau. Separate tests verify GPU resource reuse over 45 switches, zero draws while paused, and invalidated resources after renderer/context retirement.

Final software-renderer measurements remain in performance/final-*.json and baseline-final-*.json. No general speedup is claimed. Physical devices/GPUs, Safari/Firefox and multi-hour endurance remain unverified.

GitHub main is still 804163b. All seven live static files match the stable dist and backup by SHA256; no deployment occurred. Original and retained previews bind only 127.0.0.1 on 4174 and 4175. The external compare.html provides three-scene/six-view before/after inspection; DELIVERY.zh-CN.md contains the full report. Original HANDOFF and dependencies remain unchanged.
