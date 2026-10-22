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
