# Measured frame cadence

Measured at `2026-10-14T16:28:08.492Z` using headless system Chromium 154, ANGLE **SwiftShader software rendering** on the cloud host.

Software rendering and mobile emulation on a shared cloud host. RAF cadence is diagnostic, not a claim about physical devices or GPU execution time.

One active scene at a time, Auto detail, 1.8-second scene settle followed by approximately four seconds of requestAnimationFrame sampling. Desktop viewport: 1440×900 at device scale 1. Mobile emulation: 390×844 at device scale 2, with the renderer DPR capped by the selected profile. Browser tests were not running concurrently.

| View | Scene | RAF cadence (fps) | p50 / p95 interval (ms) | Auto budget during sample |
| --- | --- | ---: | ---: | --- |
| desktop | Spiral Galaxy | 25.1 | 33.3 / 87.9 | balanced → low |
| desktop | Event Horizon | 28.7 | 31 / 70.7 | low → low |
| desktop | Cosmic Nebula | 21.2 | 43.9 / 89 | low → low |
| mobile-emulation | Spiral Galaxy | 40.9 | 21 / 45.4 | balanced → balanced |
| mobile-emulation | Event Horizon | 53 | 16.7 / 37.7 | balanced → low |
| mobile-emulation | Cosmic Nebula | 53.7 | 16.6 / 33.1 | low → low |

These figures are actual browser-frame cadence observations, **not GPU timer measurements, physical-phone benchmarks or a 60 FPS promise**. Software rendering on a shared machine can vary considerably. Samples that change detail include both budgets, so they cannot be treated as a comparison between fixed profiles.

Auto adaptation was observed reducing Balanced (42,000 points) to Light (18,000 points). The nebula costs more fragment work than the disk scenes on the desktop software renderer. Light reduces DPR as well as draw range; users can also choose the independent Canvas edition. A real GPU/device matrix remains future validation.

Reproduce: start `npm run preview -- --port 4174`, then run `npm run measure`. [Raw measurements](performance.json) include sample duration, frame count, the actual renderer string and ending telemetry.
