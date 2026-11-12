# VOID ATLAS refinement — 2026-11-12

Candidate branch: `codex/visual-refinement-20261112`. Baseline: `4881b8e4e3a977a26d235c6e1c51337fa32d7bbc` on the original `main` checkout. No merge, push or production deployment is part of this work.

## Scope and decisions

- Restored the original six bilingual scene introductions, Contact purpose heading and desktop contact context in commit `19db825`, after the user rejected removing all descriptions. Then edited the introductions sentence by sentence: the galaxy retains its opening line and describes the arms; horizon describes curved light and near/far visibility; nebula describes cloud colors, stars and dark gaps. All three retain two sentences. The display headlines, Lacuna identity and two real mail addresses remain.
- The specifically rejected study line, experiment/volume label, AI-assisted/production statement and introductory About essay stay removed in both languages. Repeated scene overlines, invented coordinates and redundant production captions stay removed. This is selective editing, not a general ban on description. Field Notes keeps usable controls and quality information.
- Removed the full-screen decorative grain. Did not add a dimming mask, bloom, stock imagery or a new font/dependency.
- Galaxy: retained particle positions, warm core and asymmetric arms. Reduced central particle opacity to retain detail in the bright core and added a restrained rose knot along an existing arm. The final canvas is intentionally no longer byte-identical to the baseline.
- Event Horizon: the first round's fine bands still read as regular concentric rings. The new trials increased light separation (D/E), then replaced the linear radial shear with logarithmic shear (F, selected). Broad turbulent streams and finer filaments now have varied width, an uneven outer edge and stronger brightness variation. A taller far-side arc separates from the near disk. The real depth-writing sphere and near/far disk relationships are unchanged. This is an artistic image, not relativistic ray tracing or a physically validated Doppler model.
- Nebula: the first round's selective emission remained too soft. This round compares stronger edge light (D, rejected for white/foamy edges) against reduced edge light (E, retained in F). A second nearby density sample estimates exposed cloud edges. Balanced/high ray steps increase from 48/72 to 64/96; target scales increase from .5/.75 to .65/.85. Low remains 32 steps at .4 scale. Stars behind clouds attenuate more, with a .22 floor; foreground stars remain crisp. The deterministic 128³ volume and star positions are unchanged. The GPU cost increase is measured and reported.
- Wheel zoom now eases toward a bounded target distance using elapsed time, including while holding and moving the mouse. Down-wheel zooms out; up-wheel zooms in. Camera changes keep paused artwork redrawing until motion settles. Native OrbitControls retains Ctrl-wheel pinch handling; keyboard zoom uses the same smooth target. Reset and desktop/mobile framing synchronize the target. Existing touch controls remain; a physical trackpad was not tested.
- Deterministic particle and volume generation runs in a short-lived module Worker and transfers typed arrays. The initial Canvas remains interactive during preparation. Worker failure falls back to the existing synchronous generators; a stale preparation cannot override a later Canvas choice. The result is cached for retries.

## Reference review and adoption

All reference captures and interaction notes are in the external review folder. No third-party visual assets or demo code were copied into the candidate.

| Reference | Actually reviewed | Decision |
| --- | --- | --- |
| [Three.js volume cloud](https://threejs.org/examples/webgl_volume_cloud.html), [source](https://github.com/mrdoob/three.js/blob/dev/examples/webgl_volume_cloud.html), [MIT license](https://github.com/mrdoob/three.js/blob/dev/LICENSE) | Live orbit/zoom and the density/shading loop | Compared directional density lighting locally, rejected its solid-cloud appearance for this work. Kept the existing density-volume method. |
| [Bruno Simon WebGL Black Hole](https://webgl-black-hole.vercel.app/), [repository](https://github.com/brunosimon/webgl-black-hole) | Live orbit/zoom; warm/cool brightness hierarchy and curved light bands | Visual reference only. No root license appeared in the inspected repository listing; no code or assets adopted. No full-screen lensing or RGB-shift pipeline added. |
| [Anthony Ellis galaxy](https://anthonyellis.dev/demos/galaxy.html), [author's implementation notes](https://anthonyellis.dev/projects/galaxy/) | Live orbit and zoom; close zoom overwhelmed the view with bright sprites in this session | Retained VOID ATLAS's restrained particle scale and camera bounds. Independent deterministic worker implementation, using only this project's existing generators. No source/assets adopted. |
| [100,000 Stars](https://stars.chromeexperiments.com/), [Google making-of](https://web.dev/case-studies/100000stars) | Read the original case study; live demo stayed at “Fetching stellar data” in this session | Historical reference only; not claimed as a successful live experience. No image-plane galaxy or astronomical data imported. |
| [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing), [bloom demo](https://pmndrs.github.io/postprocessing/public/demo/#bloom), [zlib license](https://github.com/pmndrs/postprocessing/blob/main/LICENSE.md) | Live demo, README's color-management, precision and pass-cost guidance; license | Did not add a composer or bloom. Existing star highlights are readable, and broader glow would reduce separation. The demo's assets have separate licenses and were not reused. |
| [ashima/webgl-noise](https://github.com/ashima/webgl-noise), [README](https://github.com/ashima/webgl-noise/blob/master/README), [MIT license](https://github.com/ashima/webgl-noise/blob/master/LICENSE) | Implementation approach and ALU/texture tradeoff; maintainer points to `stegu/webgl-noise` | Existing fBm suffices; no replacement noise library. |
| [NASA black-hole visualization](https://www.nasa.gov/universe/nasa-visualization-shows-a-black-holes-warped-world/) | Primary explanation of turbulent disk lanes, far-side warped light and brightness asymmetry | Used to evaluate the overly regular ring pattern and separation of near/far light. No image or code copied; the candidate does not claim scientific simulation. |
| [NASA Webb Pillars of Creation](https://science.nasa.gov/missions/webb/nasas-webb-takes-star-filled-portrait-of-pillars-of-creation/) | Primary image/explanation of semi-transparent gas, dark dust and stars outside the dense pillars | Used to evaluate cloud-edge contrast and foreground/background star separation. No image or data imported. |
| [awesome](https://github.com/sindresorhus/awesome), [awesome-selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted) | Resource directories | No backend/self-hosted service is needed for this local rendering refinement. |

The retained Three.js license is in `public/THIRD_PARTY_LICENSES.txt`. Input zoom scaling follows the already installed OrbitControls scale, without modifying the dependency. Package and lockfile are unchanged.

## Reproduction and protection

Review folder: `C:/Users/a1587/Documents/ChatGPT/个人作品制作 3/void-atlas-refinement-20261112`.

Backup: `D:/haorongli09/_BACKUP/VOID-ATLAS-before-refinement-20261112`. Its working copy was checked against 113 source files by SHA-256; `repository.bundle` passed `git bundle verify`. It includes untracked handoff material. Dependencies are excluded and reproducible from the lockfile. The original checkout was not edited.

Run `node node_modules/vite/bin/vite.js --configLoader runner --host 127.0.0.1 --port 4211` from this worktree for development. The review folder holds separately built baseline/candidate files and a localhost static server. Its `start-previews.ps1` opens persistent local comparison endpoints.

The existing approved case-study video is unchanged. The review now uses fresh 18-second, 60 fps captures with a continuous eased pointer/wheel trajectory. A new browser frame is rendered at every 1/60 second of artwork time; this is offline capture, not duplication/interpolation of the old 25 fps recording and not evidence of hardware runtime FPS. The previous review videos remain historical files. To decline the candidate, use the untouched original main checkout or baseline preview; no revert/reset on main is necessary. Keep the branch/worktree until the candidate is reviewed.

Validation and measurements are recorded in `VALIDATION_20261112.md` after the final browser pass.
