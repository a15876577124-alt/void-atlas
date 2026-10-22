# VOID ATLAS — Engineering Handoff (for Codex)

_Status verified 2026-10-22. Read this before touching anything._

## 0. Current State (verified)

| Item | Value |
|---|---|
| Stable version | `main` @ `1e649f9` — "Add bilingual interface and contact updates" |
| Local == Remote == Deployed | Yes — local HEAD, `origin/main`, and the live build assets are all `1e649f9` |
| Working tree | Clean — no uncommitted source changes; the only addition is this handoff document |
| This document | Committed as a **docs-only** commit on top of `1e649f9` — no code, shader, config, or dependency change |
| Live site | https://void-atlas.app.workbuddy.host/ (HTTPS, no login, serves the `1e649f9` build) |
| Secrets scan | Clean — no API keys/tokens/credentials in tracked files; no `.env`/keys/certs present |
| Build / tests (this session) | `npm run build` ✓ 2.94s · `npm run test:unit` ✓ 10/10 pass |

## 1. Repository

- URL: https://github.com/a15876577124-alt/void-atlas.git
- Branches:
  - `main` — **stable, deployed. This is the base for all work.**
  - `workbuddy/polish-v2` — rejected visual-polish experiment (V1–V4 + fix). **Do not merge without explicit user approval.** Its direction was rejected: global vignette/fog changes dimmed the image (fixed in `e03121d`, but the overall direction was still declined). Useful only as a record and as a lesson (see §7).
- Commit chain on `main`: `11e7afb` → `5631dc2` (WebGL + Canvas fallback) → `489294a` (Event Horizon depth fix) → `30b1215` (PR #1 merge) → `1e649f9` (Contact + i18n).

## 2. Paths & Environment

- Project root: `D:\haorongli09\VOID-ATLAS` (Git working tree; `core.autocrlf=input` is set locally — files are LF, do not "fix" line endings)
- Backups (outside the repo): `D:\haorongli09\_BACKUP\VOID-ATLAS-before-release`, `-before-i18n`, `-before-polish`
- Session artifacts (scripts/screenshots/logs) moved to `D:\work Buddy_work\2026-10-15-21-27-56\` — not part of the repo
- Runtime: Node >= 22.12.0 (`.nvmrc`; verified on v22.22.2), npm 10.x. No global installs required.
- Dependencies (pinned, do not upgrade without approval): `three@0.186.1`, `vite@8.3.4`, `@playwright/test@1.64.1`. `package-lock.json` is committed; installed `node_modules` matches the lock.
- Install quirk: on this machine `npm ci` trips a bulk-delete safety guard and can partially wipe `node_modules`. If a reinstall is ever needed, use incremental `npm install`. Currently unnecessary.

## 3. Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server at http://127.0.0.1:5173 |
| `npm run build` | Production build → `dist/` (`base: './'`, portable static output) |
| `npm run preview` | Serve the built `dist/` at http://127.0.0.1:4173 |
| `npm run test:unit` | `node --test tests/*.test.js` (particles, quality, i18n) — 10 tests |
| `npm run test:e2e` | Playwright specs (`tests/*.spec.js`) |
| `npm run measure` | `scripts/measure-performance.mjs` |

- E2E note: no Chromium is cached on this machine and downloads are blocked by policy. Verified workflow: drive the **system Edge** via Playwright `channel: 'msedge'` (see scripts in `D:\work Buddy_work\2026-10-15-21-27-56\*.cjs` for reference implementations).
- Deploy (done via WorkBuddy, not from Codex): rebuild `dist/`, then re-publish the same directory to the same app — **URL stays `https://void-atlas.app.workbuddy.host/`**.

## 4. Tech Stack & Architecture

- Vite 8.3.4 + Three.js 0.186.1, vanilla ES modules, no UI framework. ~1,830 lines of source.
- Rendering: custom GLSL shaders (`src/shaders.js`) over a shared particle system (`src/particles.js`), WebGL path (`src/webgl-renderer.js`) with a Canvas 2D fallback (`src/canvas-renderer.js`) and adaptive quality tiers (`src/quality.js`).
- Scenes (`src/scenes.js`, weight-driven): **Spiral Galaxy / Event Horizon / Cosmic Nebula**. Scene-specific visuals are isolated: the disk shader computes galaxy and horizon branches separately, and the clouds plane is nebula-only — so single-scene tweaks are possible without touching the others.
- Interaction (`src/pointer.js`): orbit drag, wheel/pinch zoom, touch, keyboard (1/2/3 scene select, R reset, Space pause).
- i18n (`src/i18n.js`): EN/中 table + `t()`, `localStorage['void-atlas-lang']`, default English, no IP/UA sniffing. UI text updates without rebuilding WebGL (`renderSceneCopy()` in `src/main.js`).
- Styling (`src/style.css`): dark cosmic editorial system — warm-white/gold accents, serif display, restrained layout.

## 5. Key Files

```
index.html                  entry, semantic structure, data-i18n hooks
src/main.js                 app bootstrap, scene switching, UI wiring (181 lines)
src/i18n.js                 en/zh translation table + language switching (226)
src/webgl-renderer.js       WebGL renderer, camera, view offset (174)
src/shaders.js              GLSL: particles / disk / clouds / rim (188)
src/particles.js            scene geometry data (43)
src/scenes.js               scene weights/definitions (10)
src/quality.js              adaptive quality tiers (27)
src/pointer.js              orbit/zoom/touch input (36)
src/canvas-renderer.js      Canvas 2D fallback (65)
src/style.css               design system (230)
vite.config.js              base './', single-page config
tests/                      unit (*.test.js) + e2e (*.spec.js: webgl, fallback, horizon-depth, canvas-controls)
docs/                       HORIZON_DEPTH.md, PERFORMANCE.md, verification logs, screenshots
```

## 6. Hard Constraints (do not violate)

1. **Event Horizon depth occlusion (`489294a`) is a verified fix — do not regress it** to a 2D billboard/foreground plane. Any renderer/shader change must re-verify with the multi-angle screenshots in `docs/screenshots/horizon-depth/`.
2. No dependency upgrades, no `npm audit fix --force`, no framework rewrites.
3. No rebuild-from-scratch; no large art overhaul without explicit approval.
4. Keep the deployed app identity — same URL. Redeploy = rebuild `dist/` + republish the same directory.
5. Never add secrets, personal data beyond the two public emails, or fabricated resume content to the site.

## 7. Lessons from the Rejected Polish Branch

`workbuddy/polish-v2` attempted: text-scrim vignette (V1), galaxy core/arm refinement (V2), nebula depth layers (V3), typography/mobile composition (V4). The user rejected it because the overall image became dimmer/grayer. Root causes: an oversized radial vignette (90% opacity over 132%×104%) and an additive fog layer that lifted the black field. If revisiting any global tonal change, validate with **quantitative A/B** (mean luminance, p95 highlight, pure-black ratio — method preserved in `D:\work Buddy_work\2026-10-15-21-27-56\ab\abc-report.json`), not by eye.

## 8. Known Issues / Unverified

- Real-device mobile WebGL unverified (headless environments fall back to the Canvas path — this is the designed graceful degradation, not a bug).
- China multi-region / multi-carrier network access unverified.
- `npm ci` bulk-delete guard quirk on this machine (§2).
- E2E suite requires system Edge locally; CI workflow exists (`.github/workflows/ci.yml`) but has not been exercised.

## 9. Candidate Next Steps (require user approval)

- Event Horizon accretion-edge glow refinement (deferred; high regression risk).
- Real-device mobile pass (touch feel, WebGL context, performance on low-end GPUs).
- Automated visual-regression baseline (pixel-metric A/B harness from §7).

## 10. Rollback

- `git checkout main` (already the active branch) — history is intact and linear on top of the original uploads.
- External snapshots: `D:\haorongli09\_BACKUP\` (pre-Contact, pre-i18n, pre-polish states).
- Remote `origin/main` mirrors the stable version; the deployed site is reproducible from it.
