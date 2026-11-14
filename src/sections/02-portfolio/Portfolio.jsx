import { useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { A } from '../../lib/assets'
import Reveal from '../../components/ui/Reveal'
import { GoldButton } from '../../components/ui/Button'
import Album from './Album'
import { WORK } from './work'
/**
 * The whole-cloud plate. The previous export (`main page clouds/image 34 (2)`)
 * was cut down its own right edge — alpha averaged 134 there against 0 on the
 * other three sides — so every instance showed a straight vertical chop, and
 * masking the edge away only traded the cut for a fade. This one is complete:
 * measured, all four edges are at alpha 0, so it can be drawn as-is anywhere
 * without a mask and nothing to hide.
 */
import cloudImg from '../../../assets/section 2/image 35 copy.png'


/**
 * "All" first and active, as the design has its first chip: the whole gallery
 * is the resting state and every other chip narrows it to one craft.
 */
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'video', label: 'Video' },
  { id: 'graphic', label: 'Graphic' },
  { id: 'apps', label: 'Apps' },
  { id: '3d', label: '3D' },
  { id: 'website', label: 'Website' },
  { id: 'ai', label: 'AI' },
]

/**
 * The work itself lives in `work.js`, one entry per brand. A tile here is a
 * brand, not a single piece: pressing it opens that brand's album.
 *
 * Only the crafts there is work to show for get a chip, so a craft with
 * nothing tagged to it never leads to an empty gallery.
 */
const CHIPS = FILTERS.filter((f) => f.id === 'all' || WORK.some((w) => w.tags.includes(f.id)))

/** "5 pieces", set after the kind, only where there is more than one. */
const count = (work) => (work.items.length > 1 ? ` · ${work.items.length} pieces` : '')

function Caption({ work }) {
  return (
    <figcaption className="mt-3 px-1 text-left sm:mt-4">
      <span className="block text-[0.95rem] font-bold leading-snug text-plum-800 sm:text-base">
        {work.title}
      </span>
      <span className="block text-sm leading-snug text-plum-600">
        {work.kind}
        {count(work)}
      </span>
    </figcaption>
  )
}

/** The gold play disc, centred on a tile whose picture is a film's poster. */
function PlayMark() {
  return (
    <span className="pointer-events-none absolute inset-0 grid place-items-center">
      <img
        src={A.playBadge}
        alt=""
        className="size-12 drop-shadow-[0_8px_18px_rgba(36,5,31,0.55)] transition-transform duration-300 group-hover:scale-110 sm:size-14"
      />
    </span>
  )
}

/**
 * SECTION 2 — the gallery, straight after the hero hands off.
 *
 * Laid out to the Figma frame. The content column is 1616 of the frame's 1920,
 * and every measurement below comes off that column:
 *
 *   heading block                       255
 *   gap                                  64
 *   chip bar                             76
 *   gap                                  42
 *   lead tile                  1616 x   673
 *   gap                                  64
 *   tile row (787 + 42 + 787) x 466
 *   gap                                  64
 *   button                               79
 *                                     -----
 *                                    1782.77
 *
 * The two gap sizes are not interchangeable: 64 separates the section's four
 * blocks, 42 is the tighter pair inside them — chips to lead tile, and tile to
 * tile across the row. Note 787 + 42 + 787 = 1616 exactly, which is what makes
 * the row line up with the lead tile above it.
 */
export default function Portfolio() {
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState(false)
  // The brand whose album is open, or null.
  const [album, setAlbum] = useState(null)
  const shown = filter === 'all' ? WORK : WORK.filter((w) => w.tags.includes(filter))
  const lead = shown.find((w) => w.lead)
  const row = shown.filter((w) => w.wide)
  const rest = shown.filter((w) => !w.lead && !w.wide)
  // Under "All", the wall waits behind the button. Choosing a craft is asking
  // to see it, so any other chip opens the wall without a second click.
  const wallOpen = expanded || filter !== 'all'
  const reduce = useReducedMotion()

  // The row's cloud leaves to the left as the row is scrolled past: at rest
  // while the row is in the lower part of the window, gone by the time its
  // bottom edge has climbed to a third of the way down. Driven by
  // scroll position rather than played once, so scrolling back brings them
  // home again.
  const rowRef = useRef(null)
  const { scrollYProgress: rowPassed } = useScroll({
    target: rowRef,
    offset: ['start 0.4', 'end 0.3'],
  })
  const driftOpacity = useTransform(rowPassed, [0, 1], [1, 0])
  const cloudDrift = useTransform(rowPassed, [0, 1], ['0%', reduce ? '0%' : '-45%'])

  // The lead tile's plane makes its pass on the scroll. It holds on the
  // right-hand edge until the tile is centred in the window, then flies
  // right to left across the picture and out past the window's left edge,
  // gone by the time the tile's bottom reaches the top of the window. The
  // distance is in `vw` because it is the WINDOW it has to cross: its own
  // 40%-of-tile width plus the full window, whatever the tile's size.
  // Scroll back up and it flies home.
  const leadRef = useRef(null)
  const { scrollYProgress: leadPassed } = useScroll({
    target: leadRef,
    offset: ['center center', 'end start'],
  })
  const leadFlight = useTransform(leadPassed, [0, 1], ['0vw', reduce ? '0vw' : '-140vw'])

  // The row's plane does the same pass the other way. It faces right, so it
  // flies left to right: holding on the left edge until the row is centred,
  // then across both tiles and out past the window's right edge. It used to
  // drift left and fade with the cloud; the cloud still does.
  const { scrollYProgress: rowCentred } = useScroll({
    target: rowRef,
    offset: ['center center', 'end start'],
  })
  const rowFlight = useTransform(rowCentred, [0, 1], ['0vw', reduce ? '0vw' : '140vw'])

  return (
    <section
      id="portfolio"
      // `pt-20`/`sm:pt-28`. The hero hands off with its cloud curtain and the
      // island's underside still in frame, so the heading needs a beat of
      // clearance under them — but `sm:pt-44`, tried first, bought so much of
      // it that the gap became the feature.
      className="relative overflow-hidden bg-[linear-gradient(180deg,#eef3fb_0%,#e3ebfb_55%,#dfe7fa_100%)] pb-20 pt-10 sm:pb-32 sm:pt-28"
    >
      {/* 1616 of the frame's 1920 — the design's own content column */}
      <div className="mx-auto max-w-[1616px] px-5 sm:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <Reveal y={34}>
            <h2 className="font-ui text-[clamp(1.9rem,4.6vw,3.35rem)] font-bold leading-[1.08] text-plum-800">
              Ideas That Became
              <br className="hidden sm:block" /> Experiences
            </h2>
          </Reveal>
          <Reveal y={28} delay={0.1}>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-plum-600">
              <em className="not-italic font-semibold text-plum-700">
                “What if we tried something completely different?”
              </em>
              <br className="hidden sm:block" /> Explore the brands, products, worlds, and digital
              experiences we have helped bring to life.
            </p>
          </Reveal>
        </header>

        {/* ------------------------------------------------------- filters --
            The gold capsule from `Frame 2087325481`: white pills inside it,
            the active one teal. Built in markup rather than shipped as the
            flat export so the chips stay real buttons. */}
        <Reveal y={26} delay={0.16} className="mt-10 flex justify-center lg:mt-16">
          <div
            role="group"
            aria-label="Filter projects"
            /* The capsule gets the ledge too, in PLUM rather than in a darker
               shade of its own gold. The chips inside already press off a
               gold-600 ledge; giving the tray the same colour would have flowed
               the two together into one gold mass with no edge between them.
               Plum is the page's shadow colour — `rgba(54,14,57)` is what every
               soft drop on the site is cast in, and `.btn-type:active` presses
               onto `--color-plum-900` — so it separates the tray from the chips
               while still being the same lighting.

               8px, deeper than the chips' 4px, because the tray is the lower
               surface: it has the section's own ground beneath it rather than
               2.5rem of capsule padding. */
            className="inline-flex max-w-full flex-wrap items-center justify-center gap-1.5 rounded-[2.5rem] bg-gold-500 p-2 shadow-[0_8px_0_-2px_var(--color-plum-900),0_26px_44px_-20px_rgba(54,14,57,0.6)] sm:rounded-full sm:p-2.5"
          >
            {CHIPS.map((f) => {
              const active = f.id === filter
              return (
                <motion.button
                  key={f.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setFilter(f.id)}
                  whileTap={{ y: 2 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                  // Presses onto plum, like every other button on the page —
                  // see `.btn-type:active` in `index.css`.
                  style={{ '--btn-ledge': 'var(--color-plum-900)' }}
                  /* The page's button shadow: a hard plum ledge plus a soft
                     drop under it — the same pair `GoldButton` carries, cut to
                     the same 6px, so a chip sits at the same height as
                     everything else.

                     These already carried `btn-type`, which means
                     `.btn-type:active` was giving them the plum press ledge —
                     but with nothing at rest for it to press DOWN from, the
                     ledge appeared out of nowhere on the first click and
                     vanished again on release. The resting state was the half
                     that was missing, not the pressed one.

                     The press turns the chip GOLD — the arbitrary variant
                     reaches past the button to the `<span>` painting its
                     fill, because that fill is a separate layer (it has to
                     be: one shared element slides between chips rather than
                     each fading its own background). `active:` on the button
                     alone would never touch it. */
                  className={`btn-type relative rounded-full px-4 py-2 text-sm font-semibold transition-[color,box-shadow] duration-300 active:text-plum-900 [&:active>span:first-child]:bg-gold-500 sm:px-6 sm:py-2.5 ${
                    active
                      ? 'text-white shadow-[0_6px_0_-2px_var(--color-plum-900),0_10px_16px_-10px_rgba(54,14,57,0.55)]'
                      : 'text-plum-700 shadow-[0_6px_0_-2px_var(--color-plum-900),0_10px_16px_-10px_rgba(54,14,57,0.35)] hover:text-plum-900'
                  }`}
                >
                  {/* one shared element slides between chips instead of each
                      chip fading its own background in and out */}
                  <motion.span
                    layoutId={active ? 'portfolio-chip-active' : undefined}
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    className={`absolute inset-0 rounded-full ${active ? 'bg-teal-500' : 'bg-white'}`}
                  />
                  <span className="relative">{f.label}</span>
                </motion.button>
              )
            })}
          </div>
        </Reveal>

        {/* ------------------------------------------------------- gallery --
            Sized against THIS wrapper rather than the full-bleed section —
            it shares the content column's own 1616px cap, so a percentage
            here lands at the same fraction of the gallery at every viewport
            instead of ballooning on a wide window where the section itself
            runs edge to edge but the column stays capped. That mismatch is
            what first put the pilots and clouds at several hundred pixels
            wide, big enough to sit on top of the heading and the tiles
            instead of bleeding off the gallery's own corners the way the
            reference has them. */}
        {/* `aspect-[1616/673]` — the lead tile's own ratio — so this block has
            a HEIGHT of its own rather than borrowing one from its content.

            Everything decorating the tile is placed as a percentage of this
            box, and the tile itself lives inside an `AnimatePresence` with
            `mode="popLayout"`, which takes elements out of flow as they swap.
            While that happens the block has no content to be measured by, so
            a `top-[52%]` resolves against a box that is briefly a fraction of
            its real height and the planes and clouds jump to the top of the
            section. Stating the ratio makes the height independent of what
            the filter is doing to the contents. */}
        {/* The whole lead block, decorations included, is conditional on
            there BEING a lead tile. Filter to a craft the floating city is not
            tagged with and the tile disappears, but the two planes and three
            clouds hung off its corners did not — they carried on flying around
            an empty 1616x673 hole in the page. */}
        <div
          ref={leadRef}
          className={`relative z-20 mt-7 lg:mt-[2.625rem] ${lead ? 'aspect-[1616/673]' : ''}`}
        >
          {/* Two puffs of atmosphere, on two different footings.

              The bottom-left one bleeds into empty space BELOW the lead
              tile, so it can stay tucked behind at `z-0` and `opacity-50`
              and read as soft haze — there is no photo under it to be
              washed out against.

              The top-left one cannot. `-top-16` sits it mostly OVER the
              tile's own photo, and at `z-0` the figure's `z-10` painted over
              almost all of it — measured, genuinely invisible. `z-[15]`
              clears the tile while staying under the pilots' `z-20`, and it
              is drawn at full opacity: the same fade that reads as haze over
              this section's pale ground reads as a flat, washed-out smear
              over bright photography. */}
          {lead && (
            <>
          <img
            src={cloudImg}
            alt=""
            aria-hidden
            loading="lazy"
            className="pointer-events-none absolute -left-[17.2%] bottom-[-9%] z-0 w-[43%] select-none opacity-50"
          />
          <img
            src={cloudImg}
            alt=""
            aria-hidden
            loading="lazy"
            // Flipped — the export's own defined edge sits on ITS right,
            // wispy side trailing left, which read backwards at a LEFT
            // placement (defined edge facing in, toward the tile, wispy
            // side facing the true left corner). Mirrored, the defined edge
            // faces the corner instead.
            //
            // Sitting ON the corner, not inside the picture. `-top-16` is a
            // fixed 64px, which on a tile 673px tall left the cloud a long
            // way down the photograph, lying across the buildings like weather
            // inside the shot rather than atmosphere gathering at its edge.
            // `-top-[9%]` scales with the tile and lifts it onto the corner,
            // and `-left-[11%]` puts most of its body outside the frame so
            // what shows is a cloud passing the tile rather than one parked
            // on it.
            //
            // BEHIND the tile now (`z-0`), where it used to ride over it at
            // `z-[15]`. Over the placeholder photograph that read as weather
            // on the corner. The lead is a website capture now, and its
            // headline sits in exactly that corner, so the cloud was covering
            // the one line of the piece a visitor is meant to read. Behind,
            // the two fifths of it that hang outside the frame still show.
            style={{ transform: 'scaleX(-1)' }}
            className="pointer-events-none absolute -left-[16.8%] -top-[7%] z-0 w-[42%] select-none"
          />
          {/* No puff on the top-RIGHT corner. It was the upper-left one's
              counterpart, drawn on the same terms — but that corner is also
              where the top pilot banks in (`-top-28 -right-[13%]`, below),
              and the two occupy nearly the same box: at 1440 the cloud runs
              x 1010-1470 against the plane's 994-1582. The cloud sits at
              `z-[15]` and the pilot at `z-20`, so what it actually drew was
              a bank of haze hanging off his fuselage rather than atmosphere
              on the tile's corner. The left corner keeps its own, since
              nothing flies through it. */}

          {/* Two owl pilots bank in from opposite corners of the gallery,
              sized to match the pair on the "Join 1,000+ Owls" band in
              `TheFlock.jsx` (`w-[46-52%] max-w-[520-580px]`) rather than the
              small corner accent this started as.

              Where each one sits, read off the reference against its own
              block:

                lead plane   left edge at 72% of the tile, top at 52% of it,
                             running past the right edge and a little below
                row plane    left edge at -16%, top at 18% of the row
                corner cloud on the tile's top-left corner, mostly outside
                row cloud    on the row's bottom-right corner, mostly outside

              A piece that BLEEDS off an edge hangs out by a set fraction OF
              ITSELF, which is the rule that keeps the framing identical at
              any zoom: the clouds by two fifths of their own width, the row's
              plane by a quarter. So `w-[43%]` pairs with `-left-[17.2%]`,
              `w-[42%]` with `-left-[16.8%]`, `w-[40%]` with `-left-[16%]` — the
              offset is always derived from the width beside it rather than
              chosen separately. Change a width and the offset is one
              multiplication away; change it alone and the piece slides, since
              a width grows from its anchor rather than about its middle. An
              offset picked by eye looks right at one window and swallows the
              piece at another, because the two figures are then free to
              drift apart.

              The lead PLANE is the exception, and the exception is the
              interesting part: its right edge is pinned to the WINDOW, not to
              the tile.

              Read off the reference against the tile box it sits on (which
              checks out at 385x160 there, a ratio of 2.41 — the 1616/673 tile,
              so the box itself was read correctly): the plane runs from 78%
              of the tile across to 110%, top at 18% of the tile's height. The
              frame's own right edge in that reference is ALSO at 110%. That
              is not a coincidence to be rounded away; it is the composition.
              The plane flies off the right-hand side of the page, and the
              picture is of it just leaving.

              Those two facts cannot both be held by a fixed percentage,
              because the gap between the tile and the window is not a fixed
              share of anything. This column is `window - 64px` until it caps
              at 1616, so its side margin is 2.4% of the tile at 1334px and
              11.9% at 1920. Pin the plane 12% past the TILE and it sits on
              the window's edge at 1920 and a fifth of it is gone at 1334;
              pin it to the window and the edge it was drawn against is the
              edge it keeps, at every width.

              `min(calc((100% - 100vw) / 2 - 9%), -4%)` is that, in one line.
              The margin is `(100vw - 100%) / 2` — `100%` being the tile, this
              element's containing block — so negating it puts the plane's
              right edge on the window's, and the extra `- 9%` carries it on
              PAST that edge.

              That 9% is the difference between the plane reaching the edge
              and the plane leaving through it. With its right edge exactly on
              the window the cockpit sat at about 84% across; the reference
              has the owl itself almost ON the frame's edge, at around 93%,
              with the tail already gone. 9% of the tile is 22-24% of the
              plane's own width at every viewport (the plane being 40% of the
              tile), so a constant slice of it is off-frame whatever the
              window is doing — which is what keeps the picture the same one
              at every size rather than merely a similar one.

              The `-4%` floor is for very narrow windows, where the margin
              thins to almost nothing: it always clears the tile by at least a
              twenty-fifth of its width, so it always reads as flying past
              rather than parked on the corner.

              Size and height stay shares of the tile, and they are
              self-checking, which is why they can be trusted from a small
              reference: the export is 1.33:1 and the tile 2.40:1, so a
              40%-wide plane MUST be 72% of the tile's height. Placed at
              `top-[19%]` that puts its bottom at 91% — the reference reads
              18% and ~91%. Two independent measurements, one answer.

              And ONE share at every width, not a `sm:` pair. It used to be
              `w-[46%] sm:w-[37%]`, two different compositions with a jump
              between them at 640px, only one of which can be the
              reference's.

              NOTHING in this section is stated in pixels any more — not the
              planes, not the clouds, not their offsets. Every tile here is a
              fixed ratio, so the whole block's height is a function of its
              width; a `max-w-[540px]` cap or a `-bottom-20` offset holds
              still while everything around it grows, and that mismatch is
              what made the decorations drift out of place at one width and
              collide at another. Percentages of the same box the tiles are
              measured in cannot come apart from them.

              Both sit LOW, per the reference: one off the lead tile's
              bottom-left corner (hanging down into the row below it) and one
              off its bottom-right. The second used to fly across the tile's
              TOP corner, which put it up beside the chip bar and left the
              whole lower half of the composition to the first — in the
              reference the pair bracket the tile's bottom edge, one at each
              end, and the gap under the tile is where they both live.

              The right one is held at `-right-[3%]` (`-2%` from `sm`),
              not the `-13%`/`-11%` it carried. Those figures are percentages
              of the CONTENT COLUMN, and this section's column runs nearly to
              the window's own edges — so 13% of it put roughly a third of a
              580px plane outside the browser entirely, and what showed was a
              fuselage sliced off by the window rather than a plane flying
              past. Two per cent still bleeds him off the tile's corner, which
              is the effect, without reaching the edge of the screen. Sized
              down to match, since a plane that no longer hides a third of
              itself off-frame does not need to be as large to read. Bottom-left banks up into
              frame (the export's own orientation, no flip needed); top-right
              is mirrored so its nose banks down into frame instead of
              trailing off tail-first. `z-20` sits them above the lead
              figure's own `z-10`. */}
          {/* Wrapper and plane, as on the row below: the wrapper holds the
              position and is flown across by the scroll (`leadFlight`), and
              the plane inside it plays its one-time arrival, so the two
              motions do not fight over the same `x`. */}
          <motion.div
            style={{ right: 'min(calc((100% - 100vw) / 2 - 9%), -4%)', x: leadFlight }}
            className="pointer-events-none absolute top-[19%] z-20 w-[40%]"
          >
            <motion.img
              src={A.owl.plane}
              alt=""
              aria-hidden
              loading="lazy"
              draggable={false}
              style={{ scaleX: -1 }}
              initial={reduce ? false : { opacity: 0, x: 40, y: 22, rotate: 8 }}
              whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 1.1, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="owl-shadow block w-full select-none"
            />
          </motion.div>
            </>
          )}

          <AnimatePresence mode="popLayout">
            {lead && (
              <motion.figure
                key={lead.id}
                layout
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -12 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                // `z-10`: Motion's `scale`/`y`/`opacity` put a `transform` on
                // this figure, which starts a stacking context of its own —
                // so without an explicit z-index here, the row below (a later
                // DOM sibling, also transformed) painted over it regardless of
                // layout position. That buried the pilot hanging off this
                // tile's bottom edge behind the row's own tiles; only a
                // sliver showed through the gap between them.
                className="group relative z-10 m-0"
              >
                {/* A button, like every tile: it opens the brand's album,
                    and the live site is offered from inside it. */}
                <button
                  type="button"
                  onClick={() => setAlbum(lead)}
                  aria-label={`Open the ${lead.title} album`}
                  className="relative block w-full cursor-pointer overflow-hidden rounded-[1.75rem] text-left lg:rounded-[2rem]"
                >
                  <img
                    src={lead.cover.src}
                    alt={lead.alt}
                    loading="lazy"
                    className="aspect-[1616/673] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                  />

                  {/* The caption rides inside the picture here, where the row
                      and the wall set theirs underneath: this block's height
                      is fixed by its ratio and everything hung off it is
                      placed against that, so a line of text below the tile
                      would land in the gap the row is spaced by. Bottom-left
                      is the capture's own empty navy. */}
                  <figcaption className="absolute bottom-[4%] left-[2.5%] flex max-w-[80%] items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-plum-800 shadow-[0_10px_24px_-12px_rgba(54,14,57,0.6)] sm:px-4 sm:py-2 sm:text-sm">
                    <span className="truncate">
                      {lead.title}
                      <span className="font-normal text-plum-600">
                        {' '}
                        · {lead.kind}
                        {count(lead)}
                      </span>
                    </span>
                  </figcaption>
                </button>

                {/* The lead tile used to carry its OWN pilot here — a
                    separate plane that flew in from the right, held a beat
                    over this tile's bottom edge, then exited left and faded.
                    Removed: that hold landed it directly on top of the row's
                    OWN pilot below (which sits at the top of the observatory
                    tile, `top-[39.1%]`, and does not exit — it lands and
                    stays), so for the few seconds both were on screen this
                    read as two planes stacked on each other rather than one.
                    The row's pilot is the one that actually lands and
                    stays, so it is the one that survives. */}
              </motion.figure>
            )}
          </AnimatePresence>
        </div>

        {/* 787 + 42 + 787 = 1616, so the row lines up with the lead tile.

            A SIBLING of the lead block above, and that is load-bearing. This
            div used to sit INSIDE it, which quietly broke every percentage
            the lead tile's own decorations are placed with.

            `aspect-[1616/673]` states a box's PREFERRED height; content taller
            than that still wins. With the row nested in it the block measured
            1157px at 1920 rather than the 646 its ratio asks for — so the
            pilot's `top-[52%]` resolved to 602px instead of 336 and put him
            almost entirely BELOW the tile, flying over the row instead of
            across the island, and each cloud sat proportionally adrift too.
            Nothing was wrong with the figures; they were being measured
            against the wrong box. Out here the block is the lead tile and
            only the lead tile, and its ratio is free to set its height.

            The gap is unchanged: `mt-5 lg:mt-16` separated this from the
            figure before and separates it from the block that now contains
            just that figure. */}
        <div ref={rowRef} className="relative mt-5 lg:mt-16">
        {row.length > 0 && (
          <>
          {/* No puff on the row's top-left corner any more. It was placed
              clear of the pilot owl baked into the observatory photo —
              but that tile is drawn `scaleX(-1)` (see the link below),
              and the flip carried the baked pilot across to the side the
              puff was sitting on, landing it squarely over his head. */}

          {/* Bled off the row's RIGHT side, and it has to be: the lead
              tile's bottom-left pilot hangs down into this row, and on the
              left flank this puff landed square on his cockpit — a cloud
              pinned to a plane rather than passing behind one. The right
              corner is the only one nothing else flies through.

              And no `max-w` on any of these any more. A pixel ceiling is
              what made them look wrong at different zooms: past a certain
              tile size the cloud stops growing, so zoomed out it sits small
              against a big picture, while zoomed in — a narrower CSS
              viewport, where the percentage rules — it comes out large. A
              plain percentage keeps each one the same share of the picture
              at every zoom.

              Bled off the row's right side, over the skyline-run tile —
              and drawn as the same KIND of cloud as the ones on the lead
              tile's own corners above, which is what it was asked to
              match. It used to be `cloudPuffImg` (`image 35`) turned
              `rotate(180deg) scaleX(-1)` at `opacity-70`: a different,
              flatter plate from the rest of the section's clouds, upside
              down and faded, which over real photography read as grey
              haze smeared across the trees rather than as a cloud. Same
              export, size and full opacity as its counterparts now, and
              unflipped so the defined edge faces the right corner.

              Measured in the WINDOW, though, not in the row - the one puff
              here that is, which is why it carries a `style` where the lead
              tile's carry classes. A percentage keeps it a constant share of
              the ROW, and the row stops growing at 1616 while the window does
              not, so what actually reached the screen changed at every size:
              20.2% of the window at 1920 and FULLY INSIDE the frame, because
              the column's margin there is wide enough that a 10% overhang
              never gets to the edge - then 23.9% at 1440 and 23.5% at 1100
              with only ~17% of it showing, because there the margin is 32px
              and it hangs off. Complete at one zoom, half gone at the next.

              32vw wide with its right edge 12.8vw past the window puts exactly
              19.2vw of cloud on screen, always - a `vw` being a share of the
              viewport whatever the browser scales CSS pixels to. The `right`
              expression is the one the lead tile's plane uses: the row's side
              margin is `(100vw - 100%) / 2`, `100%` being the row and this
              element's own containing block, so negating it lands the right
              edge on the window's, and the further `- 9.6vw` carries it out
              by two fifths of its own width - the bleed these puffs are drawn
              to. `bottom` follows in the same unit, 2vw being what the old 7%
              of the row resolved to across the range, so the two cannot come
              apart either. */}
          <motion.img
            src={cloudImg}
            alt=""
            aria-hidden
            loading="lazy"
            style={{
              width: '32vw',
              right: 'calc((100% - 100vw) / 2 - 12.8vw)',
              bottom: '-2.6vw',
              // Leaves with the plane as the row is scrolled past.
              x: cloudDrift,
              opacity: driftOpacity,
            }}
            className="pointer-events-none absolute z-30 max-w-none select-none"
          />

          {/* The row's own pilot, over the first tile's left half — in the
              reference this is a SECOND plane belonging to this row, not
              the lead tile's one hanging down into it. Placed here, its
              percentages are of the row (a 787x466 pair, ratio 1.69) rather
              than of the lead tile (1616x673, ratio 2.40), which is why it
              could never sit right while it lived up there: the same
              figures mean different distances in boxes of different shapes.

              `z-30`, and written after the cloud so it paints over it. */}
          {/* Two elements for two motions that would otherwise fight over the
              same `x`: the wrapper holds the position and is flown across to
              the right by the scroll (`rowFlight`), and the plane inside it
              plays its one-time arrival. */}
          <motion.div
            style={{ x: rowFlight }}
            className="pointer-events-none absolute -left-[16%] top-[18%] z-30 w-[40%] sm:-left-[13.2%] sm:w-[33%]"
          >
            <motion.img
              src={A.owl.plane}
              alt=""
              aria-hidden
              loading="lazy"
              draggable={false}
              initial={reduce ? false : { opacity: 0, x: -40, y: 24, rotate: -8 }}
              whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              className="owl-shadow block w-full select-none"
            />
          </motion.div>
          </>
        )}

          {/* One tile CENTRES rather than sitting in the left half of a
              two-column grid with a hole beside it. Several filters leave a
              single piece in this row, and `sm:grid-cols-2` gave every one
              of them an empty cell the width of a tile. */}
          <motion.div
            layout
            className={`grid gap-5 lg:gap-[2.625rem] ${row.length > 1 ? 'sm:grid-cols-2' : 'sm:mx-auto sm:max-w-[calc(50%-1.3rem)]'}`}
          >
            <AnimatePresence mode="popLayout">
              {row.map((w) => (
                <motion.figure
                  key={w.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94, y: 24 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.94, y: -12 }}
                  transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                  className="m-0"
                >
                  <button
                    type="button"
                    onClick={() => setAlbum(w)}
                    aria-label={`Open the ${w.title} album`}
                    className="group relative block w-full cursor-pointer overflow-hidden rounded-[1.75rem] lg:rounded-[2rem]"
                  >
                    <img
                      src={w.cover.src}
                      alt={w.alt}
                      loading="lazy"
                      className="aspect-[787/466] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                    {w.film && <PlayMark />}
                  </button>
                  <Caption work={w} />
                </motion.figure>
              ))}
            </AnimatePresence>
          </motion.div>
        </div>

        {/* --------------------------------------------------------- wall --
            Every other brand, hung as a masonry: CSS columns, each tile at
            its picture's own shape. A fixed grid of squares cropped whatever
            was not square and left holes in its last row whenever the count
            did not divide by the column count; columns take any number of
            tiles of any shape and close up around them.

            Two columns on a phone, three from `sm`, four from `lg`. Each
            image states its width and height, so the columns are laid out
            at their final heights before a single picture has loaded and
            nothing jumps as they arrive. */}
        {wallOpen && rest.length > 0 && (
          <div
            id="portfolio-more"
            className="relative z-10 mt-8 columns-2 gap-x-4 sm:columns-3 sm:gap-x-5 lg:mt-16 lg:columns-4 lg:gap-x-[2.625rem]"
          >
            {rest.map((w, i) => (
              <motion.figure
                key={w.id}
                initial={reduce ? false : { opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: reduce ? 0 : Math.min(i, 8) * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className="m-0 mb-7 break-inside-avoid lg:mb-10"
              >
                <button
                  type="button"
                  onClick={() => setAlbum(w)}
                  aria-label={`Open the ${w.title} album`}
                  className="group relative block w-full cursor-pointer overflow-hidden rounded-2xl sm:rounded-[1.75rem]"
                >
                  <img
                    src={w.cover.thumb}
                    alt={w.alt}
                    width={w.cover.tw}
                    height={w.cover.th}
                    loading="lazy"
                    className="block h-auto w-full transition-transform duration-700 group-hover:scale-[1.03]"
                  />
                  {w.film && <PlayMark />}
                </button>
                <Caption work={w} />
              </motion.figure>
            ))}
          </div>
        )}

        {/* Only while there is something for it to do. With a craft chosen the
            wall is already open, so the button would have nothing to add. */}
        {filter === 'all' && (
          <Reveal delay={0.1} className="mt-10 flex justify-center lg:mt-16">
            <GoldButton
              href="#portfolio-more"
              role="button"
              aria-expanded={expanded}
              onClick={(e) => {
                e.preventDefault()
                setExpanded((v) => !v)
              }}
              className="h-[52px]"
            >
              {expanded ? 'Show fewer projects' : 'See more projects'}
            </GoldButton>
          </Reveal>
        )}
      </div>

      {/* Keyed by brand so each album mounts fresh, at the top, with no film
          left playing from the one before. */}
      {album && <Album key={album.id} work={album} onClose={() => setAlbum(null)} />}
    </section>
  )
}
