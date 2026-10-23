# Lacuna — local integration handoff

This change implements the user-selected A / Lacuna identity in the real VOID ATLAS site. It does not alter scene rendering, particles, shaders, camera logic, routing semantics, hosting, or dependencies.

## Source and geometry

`masters/` contains four editable SVGs: symbol, horizontal lockup, micro icon and original outline wordmark. The selected A arc and glyph paths are preserved. The lockup changes the glyph scale from 0.8 to 0.72 and its origin to `(128,20)`; symbol origin is `(2,6)`, common vertical center 56, viewBox `693.92 × 112`. The 100 × 100 micro icon keeps the selected A geometry. No font files are needed or distributed.

The static inline SVG is in `index.html`, with independently grouped arcs and lettering. `public/favicon.svg` uses the micro geometry and adapts to the browser color scheme. Keep groups/classes intact when optimizing SVG. The complete mark is visible even without JavaScript.

## Behavior

- Entry: 1100ms total, once per tab session (`void-atlas-lacuna-entry-v1`). Starts at the full static mark, gently opens the arcs, then settles. Text luminance gently dips and returns, avoiding an initial full-to-hidden flash. No overlay or resource-loading delay.
- Click: 300ms; existing `setScene(0)` / `replaceState` navigation executes immediately. No camera reset, new history entry, refresh or delayed routing.
- Hover/focus: 180ms, ±2/±1 local SVG units. Pointer hover only on fine, hover-capable devices. Stable keyboard outline remains.
- Reduced motion: static final mark; focus and navigation remain functional. Storage unavailable: static entry. Animation API unavailable or throwing: complete static fallback.
- `visibilitychange`, media changes and `pagehide` cancel active animation. AbortController cleans listeners on ordinary page exit; BFCache entry cancels animation while keeping handlers available on return. No new timers, RAF loops, audio or external requests.
- Repeat activation cancels previous animation; completed/cancelled instances are removed. The standalone preview uses the same module and an explicit replay button.

CSS navigation widths are 194px desktop, 144px at ≤600px and 116px at ≤360px. The link target is 44px high. Preserve aspect ratio. Colors inherit the existing ivory/ink system.

## Local verification

Environment: Windows, Edge 155.0.4283.62, Node 24.22.0, Playwright 1.64.1, physical RTX 4060 Laptop GPU. Production build succeeds; 12 unit tests and all 42 E2E cases (32 existing + 10 branding) are exercised with the existing assertions and timeouts. The external test runner points the unchanged projects at the dedicated production preview and uses the installed Edge GPU; default SwiftShader and remote CI are not rerun in this task.

24 screenshot conditions cover 1440/768/390/320 widths × English/Chinese × all three scenes, plus separate ordinary/reduced-motion behavior checks. The narrowest English navigation has about 10.33px clearance. No logo clipping, overlap or horizontal overflow was observed. Contact, Field Notes, Canvas fallback, GPU loss/retry, camera controls, depth occlusion and volume quality tests remain included.

The complete evidence and final design delivery are kept outside production assets at:

`C:/Users/a1587/Documents/ChatGPT/个人作品制作 2/design/void-atlas-lacuna-final`

See its `DELIVERY.md`, `BRAND-GUIDELINES.md`, `FILE-INDEX.md`, screenshots, recordings and structured test/performance records. Source geometry masters are also retained here so a Git checkout preserves the final identity.

Known validation limits: real phones, Safari, Firefox, assistive-technology announcements and remote CI have not been tested. In this automation environment, switching real Edge tabs did not produce `document.hidden=true`; the hidden-state cancellation is validated by explicit visibility-event simulation, while real navigation away/back and BFCache-style lifecycle behavior are checked separately. Do not describe that simulation as a physical background-tab pass.

## Running and rollback

Use the feature worktree, not the main checkout:

```powershell
Set-Location D:/haorongli09/VOID-ATLAS-lacuna
npm run dev -- --port 4193 --strictPort
npm run build
npm run preview -- --port 4195 --strictPort
```

All servers bind to `127.0.0.1`. `node_modules` in this local worktree is a junction to the original checkout's installed dependencies; no dependency install or lockfile modification was performed. The normal package setup instructions still apply to a future separate machine.

The previous main commit is `01f6bd551c81fc5bd263757578451420dd76a61b`. The original checkout and its dist are unchanged. For immediate comparison, use that checkout; do not reset this worktree. If reverting the brand after later publication is authorized, create a normal `git revert` of the branding commit on the relevant branch, preserving history. Confirm clean status first and stop on unexpected conflicts.

This task creates only a local feature commit. Push, main merge and deployment require subsequent authorization. Before eventual release, review the feature diff against current main, rerun CI, verify production assets and check the unresolved browser/device coverage. Do not copy proposal pages, masters, screenshots, videos, fonts or the whole design directory into `public/`.
