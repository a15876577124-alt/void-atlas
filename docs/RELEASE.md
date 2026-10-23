# VOID ATLAS V3 — Release and WorkBuddy handoff

Date: 2026-10-23. The user approved the V3 visuals and authorized GitHub synchronization/merge. **This task does not authorize updating the live website.**

## Version contract

- Approved visual source: `d38dc97da34b1551f35868a3eaf77d6b73c0bb56`.
- Previous stable main: `804163b62cda9a9399c6b202168fac821b7bd0d3`.
- Preserved development branch: `codex/visual-quality-v3`.
- Release documentation and screenshots may add commits; `src/`, `public/`, entry HTML, dependencies and runtime configuration must remain identical to the approved visual source.
- The final main SHA and artifact hashes are recorded in the external `release-manifest.json`. That manifest is authoritative for the delivered build, without a self-referencing commit hash in this file.
- `docs/HANDOFF.md`, older verification and old screenshots are historical records, not current V3 status. They are preserved.

## Run and build

Use the existing working checkout at `D:\haorongli09\VOID-ATLAS`. No dependency install or upgrade is required there.

```powershell
Set-Location -LiteralPath 'D:\haorongli09\VOID-ATLAS'
npm run dev
# After stopping the dev server:
npm run build
npm run preview -- --host 127.0.0.1 --port 4181
```

Vite's default production output is `dist/`. In the Codex environment the equivalent build command used is `node .\node_modules\vite\bin\vite.js build --configLoader runner`; this avoids config-bundling permission issues and uses the same Vite config. A fresh independent checkout can use `npm ci`, but the existing Windows checkout has a documented reinstall safety-guard issue; do not reinstall merely to publish.

The production directory contains `index.html`, hashed JS/CSS assets, favicon, the retained prototype and third-party license file. Upload the **contents of `dist/`** with their relative directory layout. Hash-based scene navigation needs no SPA rewrite. JavaScript must be served with a JavaScript MIME type.

## Release validation

The frozen source previously passed 12 unit tests and 32 E2E tests on system Edge / RTX 4060. The Release task reruns Build, Unit and E2E before GitHub synchronization, then verifies the main production artifact. Exact logs, runtime metadata and results live in:

`C:\Users\a1587\Documents\ChatGPT\个人作品制作 2\void-atlas-release-20261023`

The external Playwright release config points at the isolated preflight build, uses system Edge, writes reports outside the repository, and binds only to `127.0.0.1`. Browser plugin not available; regular Playwright is used. The repository's default `npm test` builds `dist/` and uses SwiftShader; on Windows set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to the system Edge executable if running it. GitHub Actions uses its own Ubuntu/Chromium environment and runs tests only, not deployment.

## Screenshots and video

These six files reuse the final approved V3 captures. Desktop: 1440×900, DPR 1, High, paused. Mobile: 390×844 CSS viewport, DPR 2, Balanced; desktop-browser emulation rather than real-phone evidence.

| Scene | Desktop | Mobile |
| --- | --- | --- |
| Spiral Galaxy | [Desktop](screenshots/v3-final/galaxy-desktop.png) | [Mobile](screenshots/v3-final/galaxy-mobile.png) |
| Event Horizon | [Desktop](screenshots/v3-final/horizon-desktop.png) | [Mobile](screenshots/v3-final/horizon-mobile.png) |
| Cosmic Nebula | [Desktop](screenshots/v3-final/nebula-desktop.png) | [Mobile](screenshots/v3-final/nebula-mobile.png) |

Matched-angle originals/candidates/final captures and interactive comparison remain in the adjacent `void-atlas-v3-round2-review` directory. No standalone demonstration MP4/MOV/WebM was found in the project or V3 delivery directories. Playwright traces and PNGs are verification artifacts, not a demo video. No video recording or personal contribution claim is invented.

## Performance and compatibility limits

- Three.js 0.186.1, Vite 8.3.4, vanilla JavaScript ES modules, custom GLSL, WebGL 2 / Canvas 2D, Playwright Test 1.64.1. No framework or external runtime API.
- See [V3 report](V3_ROUND2.md) for physical RTX 4060 GPU timer data and quality tiers. Mobile viewports still run on the desktop GPU.
- First local WebGL readiness measured 1.20–1.29 seconds, including synchronous volume generation. Same-page retries reuse the CPU volume. Slow-CPU and public-network startup remain unverified.
- Real phones, Safari/Firefox, integrated GPUs and long thermal/endurance runs are not validated.
- Finite cloud resolution, approximate star attenuation and artistic horizon lensing are intentional implementation limits, not claimed physical simulation.
- Keep the existing large-bundle warning visible; it does not prevent building. Preserve Canvas fallback for unsupported/lost WebGL contexts.

## WorkBuddy deployment instructions — wait for separate approval

The original app is `https://void-atlas.app.workbuddy.host/`. The current Codex toolset has no WorkBuddy deployment connector or verified authenticated publisher for that app. Local WorkBuddy binding metadata does not prove deployment authority. No deployment attempt was used to test permission.

Once the user explicitly approves the live update, WorkBuddy should:

1. Open the **existing VOID ATLAS application** with the URL above. Do not create a replacement application or change the URL.
2. Read the external `release-manifest.json` and verify its main SHA against GitHub `main`. If the local checkout or remote has unexpected changes, stop instead of resetting or pulling over them.
3. Verify each listed SHA-256 and file size in `D:\haorongli09\VOID-ATLAS\dist\`, or extract the supplied production ZIP and verify it. Do not publish an old V3 preview, rejected polish branch or source root.
4. Preserve the existing live version/rollback snapshot using WorkBuddy's publishing controls. Keep all external backups.
5. Use WorkBuddy's authenticated **publish/re-publish existing application** operation and set the static publish directory to that verified `dist` directory. Upload its contents, including the complete `assets` directory, unchanged. No new install, visual tuning or site reconstruction is needed.
6. Validate the public HTTPS URL after publishing: root and `#galaxy`, `#horizon`, `#nebula`; EN/中; Field Notes/Contact; Orbit/Zoom/Pause/Reset; PNG export; explicit lightweight Canvas mode and WebGL retry. Check console and network for errors/404. Test at least one actual phone when available, labeling it separately from emulation.
7. Confirm that the active production assets match the manifest and report the deployed SHA, URL and validation result. If a blocking regression occurs, re-publish the preserved stable artifact/version and report it; do not improvise visual changes.

No verified WorkBuddy CLI command is available in this environment. The operation in step 5 must use WorkBuddy's own authenticated publisher; inventing a shell deploy command would be misleading. A directly pasteable Chinese handoff with the final SHA accompanies the external delivery.

## Version recovery without rewriting history

The release uses a normal merge into `main`, with the previous main as its first parent. Both the stable commit and the independent V3 branch remain reachable. To review old source without altering current work, create a separate checkout/worktree at `804163b`; never reset a dirty checkout.

If an authorized source rollback is needed later, first verify a clean tree and identify the V3 release merge from the manifest, then use:

```powershell
git switch main
git pull --ff-only origin main
git revert -m 1 <V3_RELEASE_MERGE_SHA>
# Review, build and test the resulting rollback before a normal push.
git push origin main
```

Stop if later changes cause conflicts. This creates a revert commit and preserves history; it does not force-push. Source rollback alone does not update the website: WorkBuddy must separately publish the corresponding verified stable build after authorization.

Stable full backup: `D:\haorongli09\_BACKUP\VOID-ATLAS-before-codex-v3` (804163b), plus the earlier WorkBuddy snapshots. The release task also preserves the pre-release `dist` under its own external artifact directory before generating production output. Do not overwrite these backups.
