import { useRef, useState } from 'react'
import { useCatchUp, usePaceInView } from '../../lib/scrollPace'
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

function Caption({ work }) {
  return (
    <figcaption className="mt-3 truncate px-1 text-left text-[0.95rem] font-bold leading-snug text-plum-700 sm:mt-4 sm:text-base">
      {work.title}
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
  // Three across at most, everywhere. Under "All" the first two rows show and
  // the wall waits behind the button; a chosen craft is one wall.
  const row = filter === 'all' ? shown.slice(0, 6) : []
  const rest = filter === 'all' ? shown.slice(6) : shown
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
  const { scrollYProgress: leadPassed } = useScroll({
    target: rowRef,
    offset: ['center center', 'end start'],
  })
  const planeInA = usePaceInView({ opacity: 1, x: 0, y: 0, rotate: 0 }, { duration: 1.1, delay: 0.2 })
  const planeInB = usePaceInView({ opacity: 1, x: 0, y: 0, rotate: 0 }, { duration: 1.1, delay: 0.35 })
  const leadFlight = useTransform(useCatchUp(leadPassed), [0, 1], ['0vw', reduce ? '0vw' : '-140vw'])

  // The row's plane does the same pass the other way. It faces right, so it
  // flies left to right: holding on the left edge until the row is centred,
  // then across both tiles and out past the window's right edge. It used to
  // drift left and fade with the cloud; the cloud still does.
  const { scrollYProgress: rowCentred } = useScroll({
    target: rowRef,
    offset: ['center center', 'end start'],
  })
  const rowFlight = useTransform(useCatchUp(rowCentred), [0, 1], ['0vw', reduce ? '0vw' : '140vw'])

  return (
    <section
      id="portfolio"
      // `pt-20`/`sm:pt-28`. The hero hands off with its cloud curtain and the
      // island's underside still in frame, so the heading needs a beat of
      // clearance under them — but `sm:pt-44`, tried first, bought so much of
      // it that the gap became the feature.
      className="relative overflow-hidden bg-[linear-gradient(180deg,#eef3fb_0%,#e3ebfb_50%,#e9eefc_76%,#f6f8fe_90%,#ffffff_100%)] pb-20 pt-2 sm:pb-32 sm:pt-28"
    >
      {/* 1616 of the frame's 1920 — the design's own content column */}
      <div className="mx-auto max-w-[1616px] px-5 sm:px-8">
        <header className="mx-auto max-w-2xl text-center">
          <Reveal y={34}>
            <h2 className="font-ui text-[clamp(1.9rem,4.6vw,3.35rem)] font-bold leading-[1.08] text-plum-700">
              Ideas That Became
              <br className="hidden sm:block" /> Experiences
            </h2>
          </Reveal>
          <Reveal y={28} delay={0.1}>
            <p className="mt-5 text-[1.02rem] leading-relaxed text-plum-600 md:relative md:left-1/2 md:w-max md:-translate-x-1/2">
              <em className="not-italic font-semibold text-plum-700">
                “What if we tried something completely different?”
              </em>
              <br className="hidden sm:block" />{' '}
              <span className="md:whitespace-nowrap">
                Explore the brands, products, worlds, and digital experiences we have helped bring to life.
              </span>
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
            className="inline-flex max-w-[calc(100%-1.5rem)] flex-wrap items-center justify-center gap-2 rounded-[2.25rem] bg-gold-500 px-5 py-3.5 sm:max-w-full sm:gap-1.5 sm:rounded-[2.5rem] sm:p-2 shadow-[0_8px_0_-2px_var(--color-plum-900),0_26px_44px_-20px_rgba(54,14,57,0.6)] sm:rounded-full sm:p-2.5"
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
                  className={`btn-type relative rounded-full px-3 py-1.5 text-[0.8rem] font-semibold sm:px-4 sm:py-2 sm:text-sm transition-[color,box-shadow] duration-300 active:text-plum-700 [&:active>span:first-child]:bg-gold-500 sm:px-6 sm:py-2.5 ${
                    active
                      ? 'text-white shadow-[0_6px_0_-2px_var(--color-plum-900),0_10px_16px_-10px_rgba(54,14,57,0.55)]'
                      : 'text-plum-700 shadow-[0_6px_0_-2px_var(--color-plum-900),0_10px_16px_-10px_rgba(54,14,57,0.35)] hover:text-plum-800'
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
        <div ref={rowRef} className="relative z-20 mt-7 lg:mt-[2.625rem]">
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
            className="pointer-events-none absolute z-0 max-w-none select-none"
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
            className="pointer-events-none absolute -left-[12%] top-[71%] z-30 w-[36%] sm:-left-[15%] sm:top-[34%] sm:w-[20%]"
          >
            <motion.img
              src={A.owl.plane}
              alt=""
              aria-hidden
              loading="lazy"
              draggable={false}
              initial={reduce ? false : { opacity: 0, x: -40, y: 24, rotate: -8 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              {...planeInA}
              className="owl-shadow block w-full select-none"
            />
          </motion.div>
          {/* The second pilot, off the row's other side, flying the other way. */}
          <motion.div
            style={{ x: leadFlight }}
            className="pointer-events-none absolute -right-[12%] top-[2%] z-30 w-[36%] sm:-right-[15%] sm:-top-[8%] sm:w-[20%]"
          >
            <motion.img
              src={A.owl.plane}
              alt=""
              aria-hidden
              loading="lazy"
              draggable={false}
              style={{ scaleX: -1 }}
              initial={reduce ? false : { opacity: 0, x: 40, y: 22, rotate: 8 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              {...planeInB}
              className="owl-shadow block w-full select-none"
            />
          </motion.div>
          <img
            src={cloudImg}
            alt=""
            aria-hidden
            loading="lazy"
            className="pointer-events-none absolute -left-[11%] -top-[16%] z-0 hidden w-[28%] -scale-x-100 animate-cloud select-none motion-reduce:animate-none sm:block"
          />
          </>
        )}

          <motion.div
            layout
            className="relative z-10 grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:gap-[2.625rem]"
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
                      className={`aspect-[787/466] w-full object-cover transition-transform duration-700 group-hover:scale-[1.03] ${w.cover.h > w.cover.w ? 'object-[center_38%]' : ''}`}
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
            className="relative z-10 mt-8 columns-2 gap-x-4 sm:columns-3 sm:gap-x-5 lg:mt-12 lg:gap-x-[2.625rem]"
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
                    className={`block h-auto w-full transition-transform duration-700 group-hover:scale-[1.03] ${
                      // Every website capture is the same shape as the row above.
                      w.tags.includes('website') && w.cover.w > w.cover.h ? 'aspect-[787/466] object-cover object-top' : ''
                    }`}
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
