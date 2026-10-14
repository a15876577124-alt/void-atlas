# VOID ATLAS · art direction

An intimate observatory, rather than a dashboard. A dark editorial spread whose main image happens to be alive.

## References and original interpretation

- NASA/ESA Hubble's [Pillars of Creation](https://science.nasa.gov/mission/hubble/science/explore-the-night-sky/hubble-messier-catalog/messier-16/): layered emission and dark dust silhouettes inform the nebula's depth. No imagery is downloaded or used.
- NASA's [black hole visualizations](https://science.nasa.gov/universe/black-holes/): a dark central silhouette, hot disk and thin photon ring inform the horizon study. This implementation is an artistic approximation, without ray tracing or relativistic accuracy.
- [ESO's Milky Way imagery](https://www.eso.org/public/images/): small, varied stellar points and warm/cool separation inform the galaxy palette. All distributions are generated from seeded random numbers.
- Historical celestial atlases, including [Bayer's Uranometria](https://en.wikipedia.org/wiki/Uranometria): restrained rules, chapter numerals and coordinate annotations inform the editorial framing. Coordinates reference familiar sky regions; they are not a live sky map.

These are directional references, not copied assets, code or layouts. No external font, texture, photograph, model or API is required at runtime.

## Visual system

- Ground: ink `#070b10`; text: paper `#ece9e2`; accent: champagne `#d6af84`.
- Galaxy: ivory core, champagne arms, desaturated ice-blue outer stars.
- Horizon: black silhouette; copper and amber accretion; near-white photon rim.
- Nebula: cyan emission and muted violet/pink clouds separated by dark dust.
- Typography: locally available Georgia for large, tightly set titles; Arial/Helvetica for quiet labels. No font service dependency.
- Desktop: text at the left, orbit centre to the right; thin full-width chapter navigation anchors the bottom.
- Mobile: story above the artwork, reachable controls above three equal scene tabs. Preserve drawing space rather than shrinking desktop text indiscriminately.

## Motion and access

Slow shader motion, approximately one-second scene morphs and damped orbiting. No camera autoplay or flashing. System reduced motion starts genuinely paused with the correct Resume label and instant scene changes. Use semantic buttons, pressed states, labelled quality selection, visible keyboard focus, keyboard scene/zoom/reset controls and a dismissible field guide. Export contains art only.

## One-day scope

Deliver three original procedural scenes with shared GPU geometry, bounded resolution and an independent Canvas path. Omit audio, video export, external assets, ray tracing and a large post-processing stack. Validate composition in Chromium at 1440×900 and 390×844; do not imply physical phone, Safari or iOS testing.
