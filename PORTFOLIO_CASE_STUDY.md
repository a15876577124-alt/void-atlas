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

The initial artifact was a functional Canvas 2D study. The one-day production scope retained it, stabilized interaction, and produced one deployable Vite/Three.js application with three scenes. Audio, model loading, ray tracing and video export were excluded to protect the core experience.

## Art and interaction

The galaxy uses champagne light and cooler spiral arms. The event horizon uses contrast, a hot disk and a dark circular silhouette. The nebula separates cyan and rose emission with soft dust lanes. Editorial typography, fine rules and restrained chapter tabs frame the live image. References and the original palette system are in [art direction](ART_DIRECTION.md).

Visitors can change scenes, drag a damped camera, pinch or scroll to zoom, freeze motion and export a clean PNG. Reduced motion and a Canvas compatibility path make the work available to more browsers and performance budgets.

## Engineering decisions

Three particle distributions occupy one BufferGeometry. GLSL interpolates the distributions and animates positions on the GPU; the JavaScript loop changes uniforms rather than rewriting thousands of positions. The horizon and cloud treatments use procedural ShaderMaterial surfaces. Bounded DPR and particle draw ranges can adapt to observed frame cadence without reallocating geometry. Context loss switches to a separate Canvas renderer, and restoration preserves the chosen chapter.

The nebula is a layered visual approximation. The horizon is designed rather than physically simulated. Keeping those distinctions explicit is part of presenting the work honestly.

## Evidence

Local production-build tests and actual captured scenes are in [verification](docs/VERIFICATION.md). [Frame-cadence data](docs/PERFORMANCE.md) comes from software-rendered headless Chromium; it is not a physical phone benchmark. GitHub Actions is configured but remote CI execution and a public deployment are not claimed.

- Public project URL: **TODO after an authenticated deployment is validated**
- Your own device/browser observations: **TODO**
- Personal reflection / what you would improve next: **TODO**
- Recruiter feedback, traffic or hiring outcomes: **TODO only if observed; otherwise omit**

## Disclosure

AI assisted the art direction, implementation, debugging, tests and documentation in this repository. All imagery in the application is generated procedurally; no paid asset, external model or runtime API is used. The portfolio owner should review the code and be able to explain the technical choices they present.
