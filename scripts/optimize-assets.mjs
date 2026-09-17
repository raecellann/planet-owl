/**
 * Turns the raw exports in `assets/` into web-ready files in `public/assets/`.
 *
 *   npm run assets
 *
 * Re-run it whenever new art lands. It is idempotent — every output is derived
 * only from the source file, so nothing drifts.
 */
import { mkdir, readdir, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SRC = join(ROOT, 'assets')
const OUT = join(ROOT, 'public', 'assets')

/** Cut-outs: trim transparent margins, cap the long edge, ship as WebP. */
const CUTOUTS = {
  'homescreen/image 48.png': { name: 'island', width: 1400 },
  'homescreen/84bbb1c3-5811-4667-9733-2c2f860a13c0 3 (2).png': { name: 'owl-broom', width: 760 },
  'homescreen/image 62.png': { name: 'owl-pilot', width: 600 },
  'homescreen/image 51.png': { name: 'owl-flower', width: 560 },
  'homescreen/image 50.png': { name: 'owl-crown', width: 440 },
  'homescreen/image 49 (1).png': { name: 'owl-wizard', width: 420 },
  'homescreen/image 49.png': { name: 'owl-pumpkin', width: 300 },
  'homescreen/image 52.png': { name: 'owl-flame', width: 260 },
  'homescreen/image 54.png': { name: 'owl-astronaut', width: 250 },
  'homescreen/image 56.png': { name: 'owl-float', width: 200 },
  // trimming this one keeps a tall column of near-invisible haze, which makes it
  // impossible to size predictably — take the dense body explicitly instead
  'homescreen/image 63.png': {
    name: 'cloud-wisp',
    width: 900,
    trim: false,
    extract: { left: 286, top: 398, width: 611, height: 729 },
  },

  // --- section 2 · portfolio -----------------------------------------------
  // Already-composed tiles with their rounded corners painted in, and fully
  // opaque — trimming has nothing to remove and would only risk a 1px shave.
  'section 2/Frame 2087325478.png': { name: 'work-observatory', width: 1100, trim: false },
  'section 2/Frame 2087325479.png': { name: 'work-street', width: 1100, trim: false },
  // The lead tile, 1616x673 — the gallery's full content width. Its play badge
  // is painted into the export, so the markup must not add a second one.
  // Re-exported into `assets/container/` on 2026-08-18; the `section 2/` copy
  // is the older source this replaced.
  'container/Frame 2087325473.png': { name: 'work-lead', width: 1616, trim: false },
  // The play badge that rides the cursor across the lead tile. It used to be
  // painted into the tile export itself, which is why it could not be made to
  // move; this re-export drops it, and it ships as its own 45x45 cut-out
  // instead. Shipped at native size — the source is only 45px square, so
  // asking for more would just upscale it.
  'container/Frame 9.png': { name: 'play-badge', width: 45, trim: false },
  // The Maserati testimonial that opens off the marker on the nest plate.
  // Ships as one composed card — photo, quote, stars and the attribution are
  // all painted into it, where they used to be built in the DOM. `trim:
  // false` keeps the transparent margin the card's own drop shadow needs.
  'container/Frame 2087325531 (2).png': { name: 'nest-testimonial', width: 649, trim: false },
  // Wider crop of the pilot than `owl-pilot` (788 vs 603 across the same 591
  // height) — it keeps the far wingtip, which the portfolio overlay needs
  // because it bleeds off the edge of the layout.
  //
  // `trim: false` — the comment above always claimed this ships at the
  // source's own 591 height, but without it the default trim was cropping
  // to 516, cutting the front wheel in half and losing the rear one
  // entirely. The source canvas is already a tight cut-out (788x591 native,
  // matching the resize target exactly), so there is no transparent margin
  // for a trim to usefully remove — it was only ever cutting into the
  // undercarriage, not excess padding.
  'section 2/image 62 (1).png': { name: 'owl-plane', width: 788, trim: false },

  // The landing screen's cloud. Cropped to its top 860px — the export
  // degrades into semi-transparent grey mush from around row 850 and is dirty
  // below that. 1020 was too generous: the cut landed inside the mush and the
  // crop's own bottom edge showed as a ruled line across the sky. The
  // remaining hard edge is dissolved in CSS by `PUFF_FADE` in `Intro.jsx`.
  'section 2/image 35.png': {
    name: 'cloud-puff',
    width: 1400,
    extract: { left: 0, top: 0, width: 2033, height: 860 },
    trim: false,
  },
  // The same cloud UNCROPPED, at its native 1.495 — which is the ratio the
  // Figma places these at (3356x2178 = 1.541), where the 860px crop is 2.365
  // and far too squat to fill the frame the way the design does. Everything
  // below row 1100 is already transparent (max alpha 3-8), so the only bad
  // region is the 850-1100 band of semi-transparent grey, and `CLOUD_FADE`
  // takes that out in CSS.
  'section 2/image 35.png#full': { name: 'cloud-big', width: 1600, trim: false },

  // --- the landing screen's cloudscape -------------------------------------
  // Two bank cut-outs, each filling one corner and running off its own edges,
  // which is why they are placed at several times the frame's width: only the
  // dense middle is ever meant to be inside it. `trim: false` — trimming would
  // pull the content box in and every position below is measured against the
  // full frame.
  'main page clouds/image 37.png': { name: 'cloud-a', width: 1625, trim: false },
  'main page clouds/image 33.png': { name: 'cloud-b', width: 1753, trim: false },

  // --- section 3 · what we do + the flock ----------------------------------
  // One owl per craft in the What We Do carousel. Figma places these at X 0 —
  // flush to the frame's left edge — at W 694, which is 36% of the 1920 frame.
  'section 3/image 73.png': { name: 'owl-vr', width: 700 },
  'section 3/image 73 (3).png': { name: 'owl-develop', width: 700 },
  'section 3/image 73 (1).png': { name: 'owl-digital', width: 700 },
  'section 3/image 73 (2).png': { name: 'owl-ai', width: 700 },
  // Both flock cards re-exported into `assets/container/` on 2026-08-18, at
  // the same canvas sizes as the pair they replace (822x614 and 1174x815).
  //
  // Shipped WHOLE — no `extract`, and that is the point. Each export is a
  // rounded card with the sitter, the owl and the sparkles deliberately
  // overhanging its top edge on transparency. Cropping to the card (rows
  // 199-612 here) is what cut the sitter's head off. The overhang is the
  // design, so it stays, and `TheFlock.jsx` no longer clips the figure —
  // the rounded corners come from the export's own alpha rather than from a
  // CSS `overflow-hidden`.
  //
  // `trim: false` matters even with no crop: a trim would pull the canvas in
  // to the alpha bbox, and since the overhang reaches higher on one export
  // than the other, the two cards would end up different shapes.
  'container/Group 2087325408 (1).png': {
    name: 'flock-candid',
    width: 900,
    trim: false,
  },
  // The gold band the careers cards sit on. Its top and bottom edges are torn
  // into feathers, so the section gradient shows through above and below it.
  'section 3/Group 2087325433.png': { name: 'gold-plate', width: 1600 },
  // Whole too, for the same reason as its pair above. The export this
  // replaced needed cropping twice over — 128px off each side to force its
  // card to the candid's ratio, and its bottom cut away because it baked a
  // caption bar and a teal "Join the Flock" pill into the picture at y
  // 690-765, which would have rendered the caption twice, once in pixels and
  // once in markup. This one carries neither problem: its card sits at
  // 1174x592 (1.983) against the candid's 822x414 (1.986), close enough that
  // the two read as one shape, and it has no baked caption.
  'container/Group 2087325408 (2).png': {
    name: 'flock-wide',
    width: 1200,
    trim: false,
  },
  // The owl badge out of the promise ribbon; the words are set in the DOM.
  'section 3/Group 39926.png': {
    name: 'promise-owl',
    width: 220,
    trim: false,
    extract: { left: 1000, top: 0, width: 192, height: 224 },
  },

  // --- section 9 · the footer band -----------------------------------------
  // The pilot on the ground beside the plane. 1572 is the width the Figma
  // inspector places it at (X 223 of the 1920 frame, so 81.9% across).
  'section 9/image 58 1.png': { name: 'owl-plane-ground', width: 1572 },
  // Just the TOP of `Vector.png`: the band's feathered edge. The lowest point
  // of that edge is y=170 and the shape covers all 1920 columns, so 230 takes
  // the whole profile plus ~60px of solid gold to butt the flat body onto.
  // Shipped as an edge rather than the whole 863px plate because the plate's
  // bottom is feathered too, and the footer has to run solid to the page end.
  'section 9/Vector.png': {
    name: 'footer-edge',
    width: 1920,
    trim: false,
    extract: { left: 0, top: 0, width: 1920, height: 230 },
  },
  // The brand owl at lockup size, cut from the composed footer export — the
  // navbar's `owl-mark.png` is far too small to set this big.
  'section 9/Frame 2087325540.png': {
    name: 'owl-mark-lg',
    width: 294,
    trim: false,
    extract: { left: 13, top: 562, width: 294, height: 259 },
  },
  // The full lockup — owl, ring and "Planet Owl" wordmark — as one flat
  // export, replacing what the footer used to set as live type plus this
  // frame's neighbour (`...540.png`, the owl alone). 1641x312 native.
  'section 9/Frame 2087325539.png': { name: 'footer-lockup', width: 1640, trim: false },

  // --- section 5 · the flight out through the tree --------------------------
  // Four planes that are composed in the DOM, never in the export: branch over
  // the top, cave around the opening, city behind it, owl through the middle.
  // They are deliberately NOT pre-combined — each one has to move at its own
  // rate for the scene to read as depth rather than as one flat picture.
  //
  // The cave is the composition's geometry. Its opening is a genuinely
  // transparent hole spanning roughly 8.6-93.9% across and 31.3-75.8% down,
  // centred on (51.3%, 53.5%). Everything else is placed against those
  // numbers, and `NestView.jsx` restates them, so NO trim: a trim would crop
  // the outer nest and shift every one of them. The hole is also what masks
  // the city — there is no CSS clip anywhere in the section, the city simply
  // sits behind and shows through, which is the only way to get the ragged
  // twig edge to register exactly.
  //
  // Back to the original `cave.png` export — `UpdatedCave.png` (same
  // twig-nest composition, taller opening at 75.8% down against this one's
  // 68.9-69.5%) is no longer used. Native 3884x4378, same ~0.887 ratio
  // `UpdatedCave.png` shared, so `CAVE_RATIO` in `NestView.jsx` still holds;
  // its `HOLE`/gloom percentages were tuned for the taller opening and may
  // want re-checking against this one's own alpha bounds.
  'section 5/cave.png': { name: 'nest-cave', width: 1920, trim: false },
  // The two mid-dive stills the click-through-the-opening transition
  // crossfades across before landing on Top Secrets: first a close, blurred
  // pass of the city beyond the opening, then a blurred pull-in on the vine
  // frame with "Secrets" already lit gold — which is what lets the second
  // still hand off to Top Secrets' own heading without a hard cut. Both are
  // full-bleed composed stills, not cut-outs, hence `trim: false`.
  'section 5/Frame 2087325568.png': { name: 'nest-dive-city', width: 1920, trim: false },
  'section 5/Frame 2087325541.png': { name: 'nest-dive-secrets', width: 1920, trim: false },
  // The city, cut out of its letterbox. The export pads a ~3554x2665 photo into
  // a 3764x4758 canvas with transparent bands above and below; the crop is held
  // a few pixels inside the alpha bounds (x 53-3606, y 1293-3957) so no feather
  // survives into a file that is used as an opaque backdrop.
  'section 5/city.png': {
    name: 'nest-city',
    width: 1800,
    trim: false,
    extract: { left: 56, top: 1296, width: 3548, height: 2656 },
  },
  // The branch canopy. Content occupies y 127-1034 of the 1920x1833 canvas and
  // the bottom 44% is empty, so this one DOES trim: the section positions it by
  // its own height, and 800 rows of nothing would put the vines 40% higher than
  // the numbers say. Trimmed it is 1920x908 (2.115), full-bleed across.
  // The backdrop for the flight out: the same boulevard with the motion blur
  // already baked into the plate, so it carries the speed the old one needed a
  // CSS filter for.
  //
  // Shipped AS EXPORTED, marked pane and all. That pane — the pale rectangle
  // on the glass facade at x 2272-2358, y 792-882 of 3951x2442 — is not a
  // stray: it is the doorway the whole section flies at, and `NestView` draws
  // its own dark over exactly those coordinates so the thing can open. Patch
  // it out of the plate and the section loses the mark it is aiming for.
  'container/Frame 2087325572.png': {
    name: 'nest-city-blur',
    width: 2200,
    trim: false,
  },
  // The pilot in flight, gear down — the nest view's own plane, kept separate
  // from `owl-plane` because that one is also the portfolio's and the flock's.
  'container/image 77 (2).png': { name: 'owl-plane-fly', width: 1000 },
  'section 5/branch.png': { name: 'nest-branch', width: 1800 },
  // The pilot who flies out through the opening. Trims to 972x514 (1.891).
  'section 5/owl.png': { name: 'nest-owl', width: 900 },
  // The landing screen's plane. Its old source, `image 77 (1).png`, was
  // retired when section 5 was re-cut into the four planes above and this ran
  // without a recipe for a while — the built webp just shipped as committed.
  // `image 78 (1).png` (`section 3/`) is the replacement: the old crop cut the
  // far wingtip off, this one has both wings whole.
  'section 3/image 78 (1).png': { name: 'owl-plane-front', width: 900 },

  // --- section 6 · top secrets ---------------------------------------------
  // One render per secret, and each one is the secret: the film crew for
  // attention, the headset and holograms for products, the robots and consoles
  // for the clever machinery. `TopSecrets.jsx` used to draw a CSS peephole and
  // drop a flock owl into it, because these were not in the bundle.
  //
  // `trim: false` on all three. They are fully opaque — the nest hole is
  // PAINTED on a near-black ground (#100600 in every corner) rather than cut
  // out — so there is no transparent margin to remove and a trim would only
  // risk shaving the rim. That near-black is also why they can sit straight on
  // the section without a mask: it is within a few channel steps of the nest
  // brown either side of them.
  //
  // Section 7 holds the same three files re-exported (`image 80 1`, `(1)`,
  // `(2)`) at identical dimensions, so only one set is worth shipping.
  // The nest full of brand work that closes the section — 1920x2559, portrait.
  // `trim: false`: it is a composed plate with its own dark surround, and the
  // vignette at its edges is exactly the kind of low-alpha falloff a trim eats.
  'section 6/Group 2087325437 (1).png': { name: 'nest-brands', width: 1400, trim: false },
  'section 6/image 80 1 (3).png': { name: 'secret-attention', width: 900, trim: false },
  'section 6/image 80 1 (4).png': { name: 'secret-products', width: 900, trim: false },
  'section 6/image 80 1 (5).png': { name: 'secret-tech', width: 900, trim: false },
  // The hanging vine canopy that frames the section. Content starts 3.2% down
  // and the plate is 69% opaque, so it trims — but the section positions it by
  // its own height, so it is taken whole and placed on the full frame instead.
  'section 6/e738aa49-29b5-4060-85b8-cc8ff8026891 1 1.png': {
    name: 'nest-vines',
    width: 1600,
    trim: false,
  },
  // The section's own heading plate — "Top Secrets" already set in gold,
  // hung off a short vine — replacing the CSS-drawn `<h2>`. `Group
  // 2087325445.png` replaces the original `b6600d44...` export: that one was
  // vine-only (the gold "Top Secrets" used to be a separate DOM `<h2>`
  // overlaid on top of it), and this one has the words baked directly into
  // the plate instead, on its own 2209x842 canvas. A transparent cutout —
  // `hasAlpha` confirms it — so it drops straight onto the section's dark
  // ground with no mask needed, and DOES trim: content already touches both
  // side edges, so a trim only tightens the empty margin above/below.
  'section 7/Group 2087325445.png': {
    name: 'top-secrets-heading',
    width: 2200,
  },
  // The vine that runs between consecutive secrets, distinct from the
  // heading's own vine above (`top-secrets-heading` — a different export,
  // different curve). A transparent cutout on its native 1255x627 canvas —
  // `hasAlpha` confirms it, so no `trim: false`/`keyWhite` workaround needed,
  // trims cleanly like the heading vine does.
  'section 7/b5e57911-ae1b-418b-82e6-15bd2099292c 1 (1).png': {
    name: 'secrets-vine',
    width: 1600,
  },

  // --- section 4 · the secret nest teaser ----------------------------------
  // The wizard guarding the nest. `owl-wand.png` replaces `image 63.png` as the
  // source; same output name, so nothing downstream moves. It is a 1920x1080
  // frame with the bird small inside it — the cut-out is only x 468-1308,
  // y 42-1046 — so the trim is doing real work here, taking it to 841x1005
  // (0.837) before the resize. Without it the `width: 760` would be sizing the
  // empty canvas and the owl would ship at well under half the intended scale.
  // Padded on the RIGHT so the owl's BODY lands on the canvas centre. The
  // wand he holds reaches out to his left, so a tight cut-out puts the body
  // 2.50% right of the plate's middle — and the section centres the plate, not
  // the bird, so he read as sitting off to one side. Widening the canvas moves
  // the centre without touching the scale: height is what binds under
  // `object-contain`, so the owl renders exactly as big as before.
  // Both poses re-exported together into `assets/hover image/` at 862x974 —
  // identical canvases, tight cut-outs on both, nothing to extract or pad to
  // reconcile. That replaces the old pair's mismatched-canvas problem (the
  // resting plate and the hover plate used to come from two differently
  // cropped exports and needed hand-measured `extract`/`extend` math to land
  // on the same apparent size) — same width, same treatment, and they are
  // already the same owl at the same scale.
  //
  // `trim: false` on BOTH, and it is the whole point. The two exports share
  // one 862x974 canvas with the owl registered identically inside it — which
  // is what makes the stacked hover swap line up with no measuring at all.
  // Trimming destroys exactly that: it cuts each plate back to its own alpha
  // bbox, and those differ (811x898 against 860x974, because the glowing wand
  // and its cast light reach further out on the hover pose), so the two ship
  // at different heights and the owl jumps on hover. Left untrimmed they
  // both resolve to 760x859 and the swap is pixel-registered.
  //
  // `keyWhite` on the hover plate only, and it is the second half of the same
  // fix. The resting export ships as a true cut-out (51% of it is transparent)
  // but the hover export is a full-bleed render on an opaque WHITE field — 0%
  // transparent. Stacked, that meant hovering cross-faded an opaque white
  // rectangle in over the owl, and for the 200ms of the fade the whole bird
  // washed out to white. That flash is what read as the swap glitching; the
  // two poses themselves were already pixel-registered. Keying the field out
  // makes both plates cut-outs, so the fade now crosses owl-to-owl with the
  // page showing through both.
  'hover image/image 63 (1).png': { name: 'owl-wizard-lg', width: 760, trim: false },
  'hover image/Group 2087325417 (1).png': {
    name: 'owl-wizard-hover',
    width: 760,
    trim: false,
    keyWhite: true,
  },
  // `trim: false` on all four, and it matters. A feather is mostly soft wispy
  // barb with very low alpha, and `trim` decides where the content ends by
  // comparing against the corner pixel — so it reads those barbs as background
  // and cuts them off, leaving only the dense middle of the shaft.
  //
  // `image 77 5.png` is the clearest case: 690x951 with an alpha bbox of
  // 517x764, but trimmed it shipped at 256x718 — a ratio of 0.357 against the
  // plate's own 0.726. Half the feather's width was gone, quill included, and
  // the result read as a cropped image rather than a feather.
  //
  // Untrimmed they carry transparent margin, which costs nothing here: the
  // section places them by their box and they are sized off the frame.
  'section 4/image 77 3.png': { name: 'feather-1', width: 300, trim: false },
  'section 4/image 77 1.png': { name: 'feather-2', width: 320, trim: false },
  'section 4/image 77 5.png': { name: 'feather-3', width: 320, trim: false },
  'section 4/feather 7.png': { name: 'feather-4', width: 240, trim: false },
}

const kb = (n) => `${Math.round(n / 1024)} KB`

/**
 * Turns a flat white studio background transparent.
 *
 * A flood fill inwards from the four edges, NOT a global "every white pixel
 * goes clear" — that distinction is the whole reason this exists. The wizard
 * carries white *inside* his silhouette (the cream stars on the hat, the
 * glass in his spectacles, the lit end of the wand), and a global key would
 * punch holes straight through all three. Only white that is reachable from
 * the border without crossing the subject is background.
 *
 * The soft contact shadow under his feet survives, because it is grey rather
 * than near-white and so stops the fill. It reads correctly anyway: the
 * section behind him is white, so grey-on-transparent and grey-on-white
 * render identically.
 */
async function keyOutWhiteField(pipe, threshold = 238) {
  const { data, info } = await pipe.ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const { width, height, channels } = info
  const bg = new Uint8Array(width * height)
  const stack = []

  const visit = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return
    const p = y * width + x
    if (bg[p]) return
    const i = p * channels
    if (data[i] < threshold || data[i + 1] < threshold || data[i + 2] < threshold) return
    bg[p] = 1
    stack.push(p)
  }

  for (let x = 0; x < width; x++) { visit(x, 0); visit(x, height - 1) }
  for (let y = 0; y < height; y++) { visit(0, y); visit(width - 1, y) }
  while (stack.length) {
    const p = stack.pop()
    const x = p % width
    const y = (p - x) / width
    visit(x + 1, y); visit(x - 1, y); visit(x, y + 1); visit(x, y - 1)
  }

  for (let p = 0; p < width * height; p++) if (bg[p]) data[p * channels + 3] = 0
  return sharp(data, { raw: { width, height, channels } })
}

async function build(rel, { name, width, trim = true, extract, extend, keyWhite = false }) {
  // A key may carry a `#tag` so one source can produce more than one output —
  // `cloud-puff` and `cloud-big` are the same file cropped two different ways.
  // The tag is for uniqueness in this object only and never reaches the disk.
  const from = join(SRC, rel.split('#')[0])
  try {
    await stat(from)
  } catch {
    console.log(`  skip   ${name.padEnd(16)} (source missing: ${rel})`)
    return
  }

  let pipe = sharp(from)
  if (extract) pipe = pipe.extract(extract)
  if (trim) pipe = pipe.trim({ threshold: 1 })
  // `extend` pads AFTER the crop. It exists so two plates of the same subject
  // can be made to sit at the same scale: `object-contain` fits by RATIO, so
  // what decides how big a subject looks is the fraction of its canvas it
  // fills — resizing the file changes neither.
  if (extend) pipe = pipe.extend(extend)
  // Last, so it keys the composed frame rather than a crop that is about to
  // be padded back out with opaque pixels.
  if (keyWhite) pipe = await keyOutWhiteField(pipe)

  const to = join(OUT, `${name}.webp`)
  const info = await pipe
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 88, effort: 6 })
    .toFile(to)

  const before = (await stat(from)).size
  console.log(
    `  ok     ${name.padEnd(16)} ${info.width}x${info.height}  ${kb(before)} -> ${kb(info.size)}`,
  )
}

async function main() {
  await mkdir(OUT, { recursive: true })
  console.log('\nOptimising cut-outs -> public/assets\n')
  for (const [rel, opts] of Object.entries(CUTOUTS)) await build(rel, opts)

  const kept = (await readdir(OUT)).filter((f) => /\.(png|jpg)$/.test(f))
  console.log(`\nLeft as-is: ${kept.join(', ')}\n`)
}

main().catch((err) => {
  console.error(err)
  process.exitCode = 1
})
