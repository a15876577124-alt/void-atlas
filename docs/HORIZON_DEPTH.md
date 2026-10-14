# Event Horizon: spatial occlusion repair

The previous central silhouette used a camera-facing plane with `depthTest: false` and `renderOrder: 3`. The accretion surface also ignored depth. Orbiting tilted the disk while the black center was always composited over every particle, including the near side.

The replacement is a radius-1.02 `SphereGeometry` with an opaque, depth-writing `ShaderMaterial`. It shares world origin with the physical XZ disk and the existing particle volume. The opaque sphere writes depth before transparent emission; the disk now tests against that depth, as the particles already do. Near-side fragments closer to the camera survive, and far-side fragments behind the sphere fail. This distinction follows depth continuously rather than assigning fixed front/back halves, so it also works when orbiting underneath or changing azimuth.

The sphere's material supplies a thin photon rim. A slightly larger spherical shell supplies soft glow, drawn before the disk and particles. A separate additive apparent image of the far disk bends around the silhouette, fades toward face-on, and reverses its brighter arc when viewed from below. This optional lens image is camera-aligned and depth-tested; it has no opaque center and does not determine the disk's occlusion. It is an artistic approximation, not general-relativistic ray tracing.

During scene transitions, stable per-pixel coverage also fades the sphere's depth, avoiding a fully occluding sphere appearing as soon as the horizon weight becomes nonzero. Geometry is allocated once and disposed on renderer replacement. No new assets, dependencies, postprocessing targets or per-particle CPU work were added. UI, typography, palette, other scene designs and Canvas compatibility are unchanged.

## Actual orbit verification

`npx playwright test tests/horizon-depth.spec.js` passed in both desktop and mobile-emulation projects against a freshly built production artifact. The test uses real mouse drags and Chromium CDP touch drags, including azimuth changes, then waits for orbit damping to settle. Reduced motion freezes particle time and Balanced detail holds the budget at 42,000.

Angles below are elevation above the disk plane, reached by drag input; 90° would be exactly face-on and 0° exactly edge-on.

| View | Observation | Desktop screenshot | Mobile screenshot |
| --- | --- | --- | --- |
| More face-on, +60° | Broad disk surrounding the dark center; most near emission stays outside its silhouette. | [Front](screenshots/horizon-depth/desktop-front.png) | [Front](screenshots/horizon-depth/mobile-front.png) |
| Oblique, +30° | Disk foreshortens and near emission passes across the lower silhouette; the far disk disappears behind the upper hemisphere. | [Oblique](screenshots/horizon-depth/desktop-oblique.png) | [Oblique](screenshots/horizon-depth/mobile-oblique.png) |
| Side, +10° | A bright foreground strip crosses the lower central silhouette; the corresponding far-side strip is hidden, with a restrained arc above the rim. | [Side](screenshots/horizon-depth/desktop-side.png) | [Side](screenshots/horizon-depth/mobile-side.png) |
| Edge, 0° | The foreground particle band crosses the center; upper/lower lens arcs blend continuously while crossing the disk plane. | [Edge](screenshots/horizon-depth/desktop-edge.png) | [Edge](screenshots/horizon-depth/mobile-edge.png) |
| Underside, −10° | Foreground crossing and the stronger far-side lens arc reverse vertically. | [Underside](screenshots/horizon-depth/desktop-underside.png) | [Underside](screenshots/horizon-depth/mobile-underside.png) |

The regression test samples the actual WebGL framebuffer inside the projected sphere, away from the rim. At +10° and −10°, the near-side sample must contain bright disk fragments while the mirrored far-side sample stays dark. A black center composited over all particles fails this assertion. The more face-on core must remain dark. JavaScript, console and HTTP errors must be absent.

The full regression run passed 6 unit tests and 22 browser cases. After smoothing the lens arc's above/below blend, both affected cases passed again with the added 0° capture. See [the executed scope and logs](VERIFICATION.md).

Screenshots are unedited Playwright captures at 1440×900 desktop and 390×844 mobile emulation (DPR 2). Headless Chromium uses ANGLE SwiftShader. This does not establish physical-device or Safari behavior. The Canvas edition remains a separate simplified renderer and is not claimed to provide WebGL depth semantics.
