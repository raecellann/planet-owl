# Planet Owl

A scroll-driven, single-page landing site for **Planet Owl** — a fantasy/whimsical creative-studio
world. The hero is not a flat exported image: every element is its own DOM layer, so the composition
stays responsive and reacts to scroll and cursor.

---

## Stack

| Concern | Choice |
| --- | --- |
| Framework | React 19 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS 4 (CSS-first `@theme` config, no `tailwind.config.js`) |
| Animation | [`motion`](https://motion.dev) (Framer Motion 13) |
| Image pipeline | sharp, via `npm run assets` |
| Fonts | Fredoka (display) + Nunito (body) via Google Fonts; Momo Trust Sans + Luckiest Guy self-hosted |

---

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production bundle in dist/
npm run preview  # serve the built bundle
npm run assets   # re-derive public/assets from assets/
```

---

## Project layout

Each section owns a folder. Anything used by more than one section moves up into `src/components/`.

```
assets/                       raw design exports (source of truth, not shipped)
  homescreen/                 section 1
  section 2/  section 3/  …
public/assets/                web-ready output of `npm run assets`
scripts/
  optimize-assets.mjs         trim → resize → WebP
src/
  App.jsx                     the eight sections, in order
  index.css                   Tailwind v4 @theme: brand palette, fonts, keyframes
  lib/
    assets.js                 single source of truth for asset paths + nav links
    usePointerParallax.js     cursor-parallax motion values + fine-pointer check
  components/
    Nav.jsx                   fixed pill nav, mobile drawer
    Footer.jsx
    ui/
      Button.jsx              gold and ghost pills
      Reveal.jsx              scroll-triggered entrance
      Parallax.jsx            generic drift-through-viewport wrapper
      SectionHeading.jsx      shared eyebrow + title + intro
  sections/
    01-hero/                  Hero.jsx · Island.jsx · FloatingOwl.jsx
    02-portfolio/             Portfolio.jsx
    03-what-we-do/            WhatWeDo.jsx
    04-the-flock/             TheFlock.jsx
    05-nest-teaser/           NestTeaser.jsx
    06-top-secrets/           TopSecrets.jsx · NestFrame.jsx
    07-impact/                Impact.jsx
    08-final-cta/             FinalCTA.jsx
```

---

## The eight sections

One continuous scroll. The background walks from bright morning sky at the top to night at the
bottom, so the page reads as a single flight rather than eight stacked slides.

| # | Section | id | What it does |
| --- | --- | --- | --- |
| 1 | Hero | `#home` | One tall frame of two panels — no pin. See below. |
| 2 | Portfolio | `#portfolio` | "Ideas That Became Experiences" — gold chip capsule, a 1616×673 lead tile, two beneath, pilots bleeding off both edges. |
| 3 | What We Do | `#what-we-do` | One giant craft word at a time, its service list beside it, promise ribbon under. |
| 4 | The Flock | `#the-flock` | Careers, on the torn gold band. Open role, a candid, and the rest of the roles. |
| 5 | Nest Teaser | `#the-nest` | The door to the nest: falling feathers, the wizard, one gold button. |
| 6 | Top Secrets | `#top-secrets` | Inside the nest. Frame transition, secrets 01–03 in peepholes, partners, the quote. |
| 7 | Impact | `#impact` | Stats that count up when scrolled into view. |
| 8 | Final CTA | `#start` | The ask, under a night sky. Ends on its button — the sign-up band lives in the footer. |

The **footer** is section 9's gold band: `Vector.png`'s feathered top edge in normal flow over the
night sky (so the dark shows through its scallops), then a flat `#e7b248` body carrying the grounded
pilot, the sign-up pill, the `Planet Owl` lockup and the link row. Only the top `230px` of that
1920×863 plate ships — its bottom edge is feathered too, and the band has to run solid to the page's
end. Two things there are worth keeping in mind:

- **The lockup is live type, not `logo-alpha.png`.** That file is a 278px navbar crop and turns to
  mush at this size; only the owl is an image, cut from the composed export at lockup resolution.
  The two clamps are tuned so mark + wordmark fill the 1640 content column exactly.
- **The last row on the page cannot use `Reveal`'s default viewport.** It insets the trigger 12% up
  from the bottom, and scrolled fully down the link row sits at 858 of a 900 viewport — past the 792
  line, so it stayed at `opacity: 0` forever. It passes `viewport={{ margin: '0px' }}`. Anything you
  add inside the page's last 12% needs the same.

The colour walk is continuous — each section's gradient starts on the one above's last stop:
`#eef3fb → #dfe7fa → #cdd8f4 → #b3b1e8 → #8271bd → #452c5e → #33204a → #24051f`.

### Where the flow deviates from the reference, and why

Two blocks in the reference call for art the exports do not contain. Neither is stubbed:

| Reference asks for | What ships | Why |
| --- | --- | --- |
| A third careers photo | An "Also hatching" roles card | `Group 2087325405/406.png` are the same frame re-exported — 5 bytes differ across 2 MB. Only one candid exists. |
| `nest-frame-transition.png`, `brands-nest.png` | The gold band's alpha reused as a **mask**; the quote sits in a nest of feathers | Both shapes already exist in the bundle; see `NestFrame.jsx`. |

The three peepholes take flock owls rather than the named per-secret renders, which are not in `assets/`.

---

## Section 2 — the gallery's measurements

Laid out to the Figma frame. The content column is `1616` of the frame's `1920`, and every figure
below comes off that column:

```
heading block                        255
gap                                   64
chip bar                              76
gap                                   42
lead tile                  1616  x   673
gap                                   64
tile row     (787 + 42 + 787) x      466
gap                                   64
button                                79
                                  ------
                                 1782.77
```

The two gap sizes are not interchangeable: **64** separates the section's four blocks, **42** is the
tighter pair inside them — chips to lead tile, and tile to tile across the row. `787 + 42 + 787 =
1616` exactly, which is what makes the row line up with the lead tile above it.

- **The chip capsule** is markup, not the flat `Frame 2087325481` export, so the chips stay real
  buttons. Its three colours are already brand tokens and match the export exactly: capsule
  `gold-500` `#f0b939`, active chip `teal-500` `#3f9f94`, inactive chips white on `plum-700`.
- **The lead tile's play badge is painted into `work-lead.webp`.** Do not overlay a second one.
- **The lower pilot** is placed from the inspector: Figma puts it at `X -185, Y 3737` against a
  section origin of `X 142, Y 2381`, so `-327` and `+182` from the tile row's own top-left — over the
  row's `1616 × 466` that is `-20.2%` and `39.1%`. It runs off the left edge and past the row's
  bottom by design. The **upper** pilot is estimated from the design screenshot; only the lower one
  came with inspector figures.
- Both pilots are `hidden lg:block` — below that the layout is a single stacked column and the
  bleeds have nothing to bleed across.

---

## Section 1 — how the hero works

> **Motion is currently OFF.** `HERO_MOTION` at the top of `Hero.jsx` is set to `false` so the
> composition can be positioned against a static reference. Everything below is wired and keeps its
> values — flip that one constant to `true` to bring it all back.

The hero is read as **one tall frame of two panels** — which is how the design is drawn. Panel 1
carries the nav, the headline and the top of the island; panel 2 completes the island (plaza,
waterfall, rock base) and finishes the sky. Every layer is positioned against the section and travels
through it at its own rate; nothing runs on a timer.

### The section's height is `max(200svh, 122vw)`, not `200svh`

The composition is measured in `vw` and the section was a flat `200svh`. Those diverge on a
wide-but-short window: at 1366×768 the broom owl finished 17px past the section's end and at
1366×620 it finished 315px past, and the section's own `overflow-hidden` sliced it off mid-bird.
`122vw` is where the owl actually lands, plus air for the hand-off:

```
island top                                        34.25vw
+ 54% of the box height (92 / 1.059 = 86.87vw)  =  46.91vw
+ owl height (48% of box width x 760:575)       =  33.41vw
                                                  --------
owl bottom                                       114.57vw   + ~7vw clearance
```

Only `lg` needs it — below that the box is pinned to `svh` and already scales with the section.
Clearance from the owl's bottom to the section's end, measured: 682px at 390×844, 114px at 1366×620,
114px at 1366×768, 160px at 1440×900, 275px at 900×500, 555px at 768×1024, 107px at 1920×1080.

### There is no sticky stage, and that is deliberate

There used to be a `100svh` pinned stage holding the whole composition. Three things were wrong with
it once the design called for two panels:

- **The second panel could not show anything new.** The pin held the island exactly still while the
  page scrolled past, so panel 2 was the same frame as panel 1, fading out under the hand-off.
- **It cropped the sky.** The plate is `1920×2005` — taller than it is wide, rendering 1504px tall at
  1440. Inside a 900px stage roughly 40% of it never came into view: the cumulus bank below the dark
  framing clouds, and the fade to white, were simply never seen.
- **It cropped the island.** At the design's scale the island is ~87vw tall, taller than one panel on
  any normal laptop, so `overflow-hidden` cut it at precisely the seam panel 2 exists to get past.

The sky now spans the section's full height and needs no transform of its own — it scrolls at page
speed behind layers that do not, and *that* is the parallax. The old `y`/`scale` pair on it existed
only to disguise the crop, and the scale was cropping the plate further.

`overflow-hidden` moved from the stage onto the section: at 92vw plus the flock's overhang the
composition is wider than the viewport by design, and unclipped a phone picked up 168px of real
horizontal scroll.

Layer travel (all frozen while `HERO_MOTION` is off):

| Layer | Travel | Effect |
| --- | --- | --- |
| Sky plate | none — scrolls with the section | Its full height is walked top to bottom across the two panels. |
| Lavender bloom | fades `0.95 → 0.1` | Atmosphere drains as you leave. |
| Far cloud band | `+140px`, fades | Slower than the page. |
| **Island** | `−170px` by 60%, scale `1 → 0.9` | A gentle pull-back on top of its own scrolling. |
| Flock (8 owls) | island's rise + scale, `±44–78px` | Shares the island's transform, so it moves as one piece; the per-owl delta separates the layers. |
| Headline | `−200px`, fade + blur out | Clears the frame before panel 2. |
| **Broom owl** (foreground) | scale `1 → 1.3`, `+34px` | Runs *opposite* to everything else — the nearest layer flies toward the camera and grows. |
| Cloud curtain | `−60px`, scale `1 → 1.06` | Drifts only, pinned to the section's bottom. |
| Hand-off fade | static | On the **section's** bottom edge. It used to fade in on scroll progress inside the pin, which meant it never appeared at all while `HERO_MOTION` was off. |

### The cloud wisp has a hard right edge

`cloud-wisp.webp` is a crop and its cloud runs to the right edge of the file — max alpha 255 there
against 13–16 on the other three sides — so every copy ends on a ruled vertical cut. It went
unnoticed while the cloud layer sat under the hand-off's white wash; over open sky it reads as a pale
rectangle. `WISP_FADE` in `Hero.jsx` fades the last fifth of the **image**, not the layer: the edge
is a property of the asset, and a layer-level mask only reaches its own boundary, leaving a copy
sitting mid-layer untouched. Mirrored copies need no special case — `-scale-x-100` flips the mask
with the pixels, so the fade always lands on whichever side the cut is on.

### The owls are anchored to the island, not the window

`ISLAND_BOX` (top of `Hero.jsx`) is one class string shared by three layers: the island, the owl
ring at `z-20`, and the foreground broom owl at `z-40`. It is sized straight off the Figma frame,
which is 1920 wide:

```
lg+     top: max(34.25vw, 26rem)   width: 92vw                        the design's own mapping
below   top: 55svh                 width: min(165vw, 96svh * 1.059)   narrow-viewport fallback
        aspect-[1400/1322]                                            the render's own ratio
```

The `min()` on the fallback matters: `lg` is a width breakpoint, so a 900×500 window takes the
narrow branch, and `165vw` alone would have put a 1485px island in a 900px viewport. Capping it
against `svh` keeps it to 508px there without changing the phone case at all.

The inspector gives the island-and-flock **group** as `1875.29 × 1932.94` at `X 81, Y 574`, so the
group is 97.7% of the frame width and its top sits 29.9% of the frame width down. Two conversions
get from there to the numbers above, and both matter:

- The box is the **island**, not the group. The flock overhangs it, spanning −1% to 105% of the box —
  1.06× wider — so `97.7 / 1.06 = 92vw`.
- `34.25vw` is the group's `29.9vw` **plus** the `4.35vw` the highest owl (`pumpkin`, at `top-[-5%]`)
  rides above the island's own top edge.

Driving it from width rather than height is the change that fixed the scale: the old box derived from
`100svh` minus a headline reserve, which on a laptop resolved to about 42vw — under half the design.

The `vw` mapping only holds while the viewport is about as wide as the frame it came from. On a 390px
phone `34.25vw` is 134px, which puts the island through the headline and finishes the composition
inside panel 1, leaving panel 2 empty sky — hence the separate narrow-viewport pair. `max(…, 26rem)`
guards the low end of `lg` itself, where the raw figure is 351px and the headline has not finished.
The two agree from ~1214px up, so the design frame's own width is exact.

Measured clearance from the CTA button to the island's top: 88px at 390×844, 207px at 768×1024,
53px at 1024×768, 56px at 1440×900 — and zero horizontal overflow at all four.

Because the width comes from the ratio, the box lands *exactly* on the painted island with no
letterboxing — which is what lets every owl be placed as a percentage of the island (`left-[40%]`,
`top-[-2%]`, `w-[15%]`) instead of of the viewport. Resize the window and the flock scales and moves
as one piece with the island rather than drifting off to the corners.

Two more details make it feel alive:

- **Nested transforms.** Each owl stacks three transforms on three separate elements so none
  overwrite each other's `transform`: scroll parallax outside, cursor parallax in the middle, idle
  motion inside.
- **Two idle clocks.** The vertical bob sits on the image and the horizontal sway on its wrapper,
  running 1.6× slower. The combined path is a drifting figure-eight that never visibly repeats,
  which reads as flying — one shared clock just bobs straight up and down and looks static.
- **Cursor parallax.** On fine-pointer devices, layers shift a few pixels against the cursor,
  weighted by a per-owl `depth`. Touch devices skip it entirely.

`prefers-reduced-motion` collapses every range to a no-op and drops the idle loops.

Type and spacing are height-aware too — the headline sits at `calc(7.5rem + 2.5svh)`, which is the
nav pill's ~4.8rem plus a clear 2.5rem of air, and its size clamps on `min(3.7vw, 6svh)` so a short
window shrinks it instead of letting it collide with the island.

Measured nav-bottom to headline-top: 51px at 1440×900, 44px at 1440×620, 65px at 390×844.

What keeps the island off the type is now `ISLAND_BOX`'s own `top`, not a height reserve subtracted
from the island — so if you raise the headline's offset, check the clearance figures above rather
than assuming the island moves with it. It does not.

---

## Buttons change typeface on hover

Every button with text is `.btn-type` (in `index.css`): **Momo Trust Sans** at rest, snapping to
**Luckiest Guy** for as long as the pointer is over it, then back.

It is one class rather than `font-ui hover:font-pop` so the pair can never drift apart. Luckiest Guy
is a single-weight display face, so the rule pins `font-weight: 400` — without it the browser
synthesises a bold and smears stems that are already heavy. The swap widens the button by a couple of
px under the cursor, since Luckiest Guy runs wider than Momo at the same size — that is the effect,
not a reflow bug.

Icon-only buttons — the nav burger, the What We Do carousel arrows — deliberately skip it: they have
no text for the swap to act on.

### The two faces are self-hosted

`assets/fonts/` holds the raw `.ttf`; `src/fonts/` holds the `.woff2` the site actually loads. They
live under `src/` rather than `public/` so Vite fingerprints them and rewrites the `url()` in
`@font-face` against whatever base the site is deployed under — an absolute `/fonts/…` would break
anywhere other than a domain root.

| Face | Axis | ttf | woff2 |
| --- | --- | --- | --- |
| Momo Trust Sans | variable, `wght` 200–800 | 159 KB | **69 KB** |
| Luckiest Guy | static, 400 only | 72 KB | **26 KB** |

Conversion is a one-off, not part of `npm run assets` — it needs Python rather than the node/sharp
toolchain, and fonts change about never. To redo it after dropping new `.ttf` files in:

```bash
pip install fonttools brotli
python -c "
from fontTools.ttLib import TTFont
for src, out in [('assets/fonts/MomoTrustSans-VariableFont_wght.ttf', 'src/fonts/momo-trust-sans.woff2'),
                 ('assets/fonts/LuckiestGuy (1).ttf',                 'src/fonts/luckiest-guy.woff2')]:
    f = TTFont(src); f.flavor = 'woff2'; f.save(out)
"
```

---

## Assets

`npm run assets` reads `assets/` and writes `public/assets/`. It trims each cut-out to its content
box, caps the long edge, and encodes WebP — so the hero art went from **3.5 MB to 444 KB**, and all
art on the page now totals ~1.2 MB.

The mapping lives at the top of [`scripts/optimize-assets.mjs`](scripts/optimize-assets.mjs). Add a
line there when new art arrives; the script is idempotent, so re-running it is always safe.

Two things to know before adding an entry:

- **`trim` runs before `extract`.** So any entry with an `extract` box must also set `trim: false` —
  a trim first moves the very coordinates the crop is expressed in. (`promise-owl` failed exactly
  this way: trimming took the ribbon from 224px tall to 183 before a 224px extract was applied.)
- **New files appear without restarting the dev server.** They did not used to. `server.watch.ignored`
  was a bare `**/assets/**`, which also matched `public/assets/**`; since Vite caches the
  public-directory listing at boot and only refreshes it from watcher events, every file written by
  `npm run assets` while the server was up fell through to the SPA fallback and rendered as a broken
  image. The glob is now anchored to the repo-root `assets/` only.

### Section 1 sources are gone — its outputs are the originals now

`assets/homescreen/` was deleted once every file in it had been processed. The script still lists
those entries for provenance and simply logs `skip (source missing)` for each, so `npm run assets`
keeps working for sections 2–9. **The files in `public/assets` are now the only copies of the
section-1 art** — they cannot be regenerated at a different size or quality without re-exporting.

For the record, section 1's outputs were not all straight conversions:

| Output | How it was made |
| --- | --- |
| `sky.jpg` | **Stitched, not cropped.** `Frame 2087325460` had the headline baked into pixels at y 244–600, so the dark framing clouds above and the cloud bank below were joined with a 110px crossfade. |
| `logo.png` | Cropped out of the `Frame 21` navbar export — **so it carries that bar's opaque white plate.** Kept as the source of record; do not render it. |
| `logo-alpha.png` | `node scripts/make-logo-alpha.mjs` — border flood-fill knocking that plate out, feathering the rim so antialiasing survives and white *enclosed* by the mark does not. This is the one `A.logo` points at; the plate showed as a white rectangle on the gold band, and the footer's `brightness-0 invert` turned it into a solid white block. |
| `owl-mark.png` | Cropped from the same export, then the white background flood-filled to transparent. |
| `owl-tophat.png` | Survivor of the original `image 48.png`, before that filename was reused for the island render. |
| everything else | trim → resize → WebP. |

---

## Brand palette

Sampled directly from the supplied navbar export.

| Token | Hex | Use |
| --- | --- | --- |
| `plum-950` | `#24051f` | Footer, night sky |
| `plum-900` | `#360e39` | Body text |
| `plum-700` | `#562354` | Headlines, primary purple |
| `gold-500` | `#f0b939` | Primary CTA, accents |
| `gold-600` | `#c28e39` | CTA underside shadow |

Add or change tokens in the `@theme` block in `src/index.css` — Tailwind generates the matching
utilities automatically.

---

## Gotchas

- **Vite ignores `assets/`.** Watching it crashed the dev server with `EBUSY` whenever a new export
  was still being written. See `server.watch.ignored` in `vite.config.js`.
- **Chrome headless clamps windows to 500px wide.** Screenshots requested narrower than that are a
  crop of a 500px layout, which looks like a horizontal-overflow bug but is not one.
- **Headless screenshots catch the hero mid-entrance.** The headline, paragraph and CTA fade in on
  0.25/0.45/0.62s delays, and `--virtual-time-budget` does not reliably advance them, so captures
  often show them pale or missing. Add `--force-prefers-reduced-motion` to render the settled state.
