# VOID ATLAS · portfolio case study draft

## Concept

An intimate observatory in the browser: three short encounters with scale, gravity and renewal. Instead of asking visitors to learn an interface, the piece invites them to pause, orbit, and keep a frame.

## My role

- Name / portfolio owner: **TODO**
- Personally authored design and engineering contributions: **TODO — distinguish your own work from AI-assisted work**
- Decisions you reviewed, revised and can explain in an interview: **TODO**
- Production time actually spent by you: **TODO**

Do not imply employment, clients, production traffic or personal authorship of generated code without supporting evidence.

## Starting point and scope

The initial artifact was a functional Canvas 2D study. The project subsequently developed into one deployable Vite/Three.js application with three scenes and an independent Canvas fallback. The approved V3 implementation is frozen at d38dc97. This description does not claim a personal development duration. Audio, external model loading and video export remain outside the delivered scope.

## Art and interaction

The galaxy uses champagne light and cooler spiral arms. The event horizon uses contrast, a hot disk and a dark circular silhouette. The nebula separates cyan and rose emission with soft dust lanes. Editorial typography, fine rules and restrained chapter tabs frame the live image. References and the original palette system are in [art direction](ART_DIRECTION.md).

Visitors can change scenes, drag a damped camera, pinch or scroll to zoom, freeze motion and export a clean PNG. Reduced motion and a Canvas compatibility path make the work available to more browsers and performance budgets.

## Engineering decisions

Three particle distributions occupy one BufferGeometry. GLSL interpolates the distributions and animates positions on the GPU; the JavaScript loop changes uniforms rather than rewriting thousands of positions. The horizon uses depth-tested ShaderMaterial surfaces. The V3 nebula ray-marches a procedural three-dimensional density texture into a reusable cloud render target and composites it with full-resolution stars. Bounded DPR and particle draw ranges can adapt to observed frame cadence without reallocating geometry. Context loss switches to a separate Canvas renderer, and restoration preserves the chosen chapter.

The nebula has genuine three-dimensional density and view-dependent integration, with finite resolution and approximate star attenuation; it is not a full scattering simulation. The horizon remains an artistic rather than relativistic simulation. Keeping those distinctions explicit is part of presenting the work honestly.

## Evidence

Current V3 evidence includes 12 unit tests, 32 E2E tests, matched-angle captures, bilingual layouts and physical RTX 4060 timing. See [V3 verification](docs/V3_ROUND2.md), [release instructions and screenshots](docs/RELEASE.md), and the latest GitHub Actions run for its independent status. Earlier [frame-cadence data](docs/PERFORMANCE.md) is historical software-renderer evidence. Mobile emulation is not a physical phone benchmark.

- Existing project URL: https://void-atlas.app.workbuddy.host/ — the V3 update is prepared but **not deployed** in this release task.
- Your own device/browser observations: **TODO**
- Personal reflection / what you would improve next: **TODO**
- Recruiter feedback, traffic or hiring outcomes: **TODO only if observed; otherwise omit**

## Disclosure

AI assisted the art direction, implementation, debugging, tests and documentation in this repository. All imagery in the application is generated procedurally; no paid asset, external model or runtime API is used. The portfolio owner should review the code and be able to explain the technical choices they present.
