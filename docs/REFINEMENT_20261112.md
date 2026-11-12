# VOID ATLAS refinement — 2026-11-12

Candidate branch: `codex/visual-refinement-20261112`. Baseline: `4881b8e4e3a977a26d235c6e1c51337fa32d7bbc` on the original `main` checkout. No merge, push or production deployment is part of this work.

## Scope and decisions

- Removed the experiment/volume label, study line, fictional coordinates, repeated scene overlines, production captions, AI-assisted statement and the introductory About essay in both languages. The main scene headlines and Lacuna identity remain. Field Notes contains controls and render detail; Contact retains both actual mail addresses.
- Removed the full-screen decorative grain. Did not add a dimming mask, bloom, stock imagery or a new font/dependency.
- Reviewed all three scenes before editing. Retained the established galaxy particle distribution, warm core and two asymmetric arms.
- Event Horizon: tried warped periodic bands (A), broad noise ribbons (B), then finer, irregular advected filaments (C, selected). A resembled electrical ripples; B created heavy ring bands. C keeps the original fine scale with less uniform spacing and a restrained brightness asymmetry. The real depth-writing sphere and near/far disk relationships are unchanged. Inactive galaxy/horizon shader paths are skipped.
- Nebula: compared a directionally shaded two-sample volume (A) with selective emission from dense filaments (B, selected). A looked more solid and crowded. B removes low-density glow while retaining bright cloud knots, crisp stars and open gaps; it uses the original single density sample per ray step. The deterministic density volume and particle positions remain unchanged.
- Wheel zoom works while holding and moving the mouse. Camera change events also invalidate a paused frame: previously a wheel action after damping fully settled could change the camera without redrawing.
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
| [awesome](https://github.com/sindresorhus/awesome), [awesome-selfhosted](https://github.com/awesome-selfhosted/awesome-selfhosted) | Resource directories | No backend/self-hosted service is needed for this local rendering refinement. |

The retained Three.js license is in `public/THIRD_PARTY_LICENSES.txt`. Input zoom scaling follows the already installed OrbitControls scale, without modifying the dependency. Package and lockfile are unchanged.

## Reproduction and protection

Review folder: `C:/Users/a1587/Documents/ChatGPT/个人作品制作 3/void-atlas-refinement-20261112`.

Backup: `D:/haorongli09/_BACKUP/VOID-ATLAS-before-refinement-20261112`. Its working copy was checked against 113 source files by SHA-256; `repository.bundle` passed `git bundle verify`. It includes untracked handoff material. Dependencies are excluded and reproducible from the lockfile. The original checkout was not edited.

Run `node node_modules/vite/bin/vite.js --configLoader runner --host 127.0.0.1 --port 4211` from this worktree for development. The review folder holds separately built baseline/candidate files and a localhost static server. Its `start-previews.ps1` opens persistent local comparison endpoints.

The existing approved case-study video is unchanged. New videos are review recordings in the external folder only. To decline the candidate, use the untouched original main checkout or baseline preview; no revert/reset on main is necessary. Keep the branch/worktree until the candidate is reviewed.

Validation and measurements are recorded in `VALIDATION_20261112.md` after the final browser pass.
