import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { A, nestSrcSet } from '../../lib/assets'
import Reveal from '../../components/ui/Reveal'
import { PHONE, useMediaQuery } from '../../lib/useMediaQuery'
import CursorPlayBadge, { useCursorPlayBadge } from '../../components/ui/CursorPlayBadge'

/**
 * The vine plate is CUT along its own right edge.
 *
 * Measured on `secrets-vine.webp` (1211x335): its top, bottom and left edges
 * are clean - max alpha 2, no inked pixels - while the last column still
 * carries 65 pixels of near-opaque art at alpha 235. The export simply ends
 * mid-branch.
 *
 * Unmasked that is a straight, hard line, and because every vine here is
 * drawn `rotate(90deg)` it lands as a HORIZONTAL rule across the background -
 * which is what reads as the overlay not being smooth. A mask is the only
 * thing that fixes it at the source: `overflow-hidden` and opacity both still
 * clip a hard edge, they just clip it somewhere else.
 *
 * It fades in the element's own coordinate space, before the rotation, so
 * `90deg` here always means "along the branch" no matter which way the
 * instance is turned. The first 86% is untouched, so only the cut dissolves
 * and none of the drawn vine is lost.
 */
/**
 * The heading plate's own four edges, dissolved.
 *
 * It is a composed export dropped straight onto the section, so its
 * rectangle is a real boundary in the picture - and during the nest dive it
 * sits over a blurred plate that is still moving, which is exactly when a
 * straight edge is most visible.
 */
const FADE_PLATE =
  'linear-gradient(180deg,transparent 0%,#000 4%,#000 96%,transparent 100%),' +
  'linear-gradient(90deg,transparent 0%,#000 4%,#000 96%,transparent 100%)'

const VINE_FADE =
  '[mask-image:linear-gradient(90deg,#000_0%,#000_86%,transparent_100%)]'

/**
 * Where the vines go, read off the Figma frame (2087325440, 1920 wide).
 *
 * The frame has exactly three, all the same blurred layer:
 *
 *   - a long one across the join of 01 and 02, on the right
 *   - a shorter one across the join of 02 and 03, on the right
 *   - one standing up the left edge beside 02
 *
 * Keyed by the secret each is drawn WITH: `top` is measured from that
 * secret's own top edge (a join sits half a row-gap above it), or as a share
 * of its height for the one that stands beside it.
 *
 * `left` is the centre of the layer's bounding box as a share of the frame.
 * `width` is the layer's width times 0.798 — `secrets-vine.webp` is that same
 * layer exported and trimmed, 1211px of the layer's 1518.
 * `matrix` is the layer's own transform from the file, so the two that are
 * mirrored as well as turned come out mirrored here too.
 */
const VINES = {
  1: [
    { left: '75.9vw', top: 'calc(-1.25rem + 0.9vw)', width: '63.1vw', matrix: '-1, 0.016, -0.016, -1' },
    { left: '4.8vw', top: '80%', width: '34vw', matrix: '0.48, 0.877, 0.877, -0.48', desktopOnly: true },
  ],
  2: [{ left: '81.4vw', top: 'calc(-1.25rem + 1.4vw)', width: '42.2vw', matrix: '-0.983, -0.185, -0.185, 0.983' }],
}

/**
 * The design's own render per secret, from `assets/section 6`. Each one IS the
 * secret rather than an illustration of it — the film crew for attention, the
 * headset and holograms for products, the robots and consoles for the clever
 * machinery.
 */
const SECRETS = [
  {
    n: '01',
    title: ['Make Your Brand', 'Impossible to Ignore'],
    copy: 'We blend bold design, storytelling, content and immersive experiences to turn attention into genuine connection, so people do not just notice your brand, they remember it.',
    art: A.secrets.attention,
    alt: 'An owl in a nest hung with film lights, cameras and a boom, mid-shoot',
    glow: false,
  },
  {
    n: '02',
    title: ['Turn Ambitious Ideas', 'Into Seamless Products'],
    copy: 'From websites and mobile apps to e-commerce platforms and custom software, we design and develop digital products that look exceptional, work beautifully and support real business goals.',
    art: A.secrets.products,
    alt: 'An owl in a headset reaching into a ring of glowing interface panels',
    // No halo. It was the only one of the three carrying the gold bloom
    // behind it, which read as a ring round this picture alone.
    glow: false,
  },
  {
    n: '03',
    title: ['Make Technology', 'Work Smarter'],
    copy: 'We use AI, automation, analytics and intelligent systems to simplify complex work, improve customer experiences and help your business move faster.',
    art: A.secrets.tech,
    alt: 'An owl at a bank of consoles with small robots working alongside it',
    glow: false,
  },
]


/**
 * One brand in the nest: a dot on the artwork, and the card it opens.
 *
 * The dot is a real `<button>` with a spoken label, since it is the only way
 * to reach the quote. The card is `absolute` against the same plate the dot is
 * placed on, anchored just below and right of it, and scales up out of its own
 * top-left corner so it reads as coming OUT of the dot rather than appearing
 * beside it.
 *
 * `plate` reviews render a composed export (photograph, quote and attribution
 * baked into one image, with the cursor-following play badge over it). The
 * rest are built in markup — there is no export for them, and inventing one
 * would mean a placeholder photograph of a person who does not exist.
 */
function NestHotspot({ review, open, onToggle, play }) {
  const { id, x, y, quote, brand, label, plate } = review

  return (
    <>
      <button
        type="button"
        onClick={() => onToggle(open ? null : id)}
        aria-expanded={open}
        aria-controls={`nest-review-${id}`}
        style={{ left: x, top: y }}
        // NO ring, and no fill. The mark is already in the artwork — the
        // plate has its own grey dot painted at each of these points — so
        // this button is purely the hit area over it. It used to draw a white
        // halo around that dot at rest, brighter on hover and brighter again
        // while open, which put a second, larger circle around a circle that
        // was already there and read as an outer shell rather than as the dot
        // being interactive.
        //
        // `focus-visible` is the one state that still draws: a keyboard user
        // has no pointer to aim with and no other way to tell which dot they
        // are on, and that ring never appears for a mouse. `cursor-pointer`
        // carries the affordance for everyone else.
        className="absolute grid size-9 -translate-x-1/2 -translate-y-1/2 cursor-pointer place-items-center rounded-full transition-all duration-200 focus-visible:ring-2 focus-visible:ring-white/85 sm:size-10"
      >
        {/* The pulse, by request — the dots read as paint rather than as
            something to press. Two rings leave the painted dot half a cycle
            apart and fade as they grow, with a small solid core breathing
            over the dot itself, so the mark is always visibly live. The
            old objection to a ring here was to a STATIC halo, a second
            circle parked round the first; these never rest at any size.
            Stopped while the card is open — the dot has done its job.

            SLOW, and with no edge anywhere in the loop. Each ring used to
            start at 65% opacity and run 1.8s, so every time it wrapped it
            jumped from nothing straight back to a bright disc on the dot — a
            blink at the end of each pulse, three dots at once. Now a ring
            starts invisible, swells in over the first quarter of its run and
            fades out over the rest, so the wrap happens while it is at zero
            and cannot be seen. 3.6s a cycle, the two rings half a cycle
            apart, and `initial` holds the delayed one at zero rather than
            parked as a solid dot until its turn comes. */}
        {!open && (
          <>
            {[0, 1.8].map((delay) => (
              <motion.span
                key={delay}
                aria-hidden
                className="pointer-events-none absolute size-[38%] rounded-full bg-white"
                initial={{ scale: 1, opacity: 0 }}
                animate={{ scale: [1, 3.2], opacity: [0, 0.45, 0] }}
                transition={{
                  duration: 3.6,
                  delay,
                  repeat: Infinity,
                  ease: 'easeOut',
                  opacity: { duration: 3.6, delay, repeat: Infinity, ease: 'easeInOut', times: [0, 0.25, 1] },
                }}
              />
            ))}
            <motion.span
              aria-hidden
              className="pointer-events-none absolute size-[38%] rounded-full bg-white shadow-[0_0_10px_2px_rgba(255,255,255,0.6)]"
              animate={{ scale: [1, 1.15, 1], opacity: [0.85, 1, 0.85] }}
              transition={{ duration: 3.6, repeat: Infinity, ease: 'easeInOut' }}
            />
          </>
        )}
        <span className="sr-only font-ui">{open ? `Hide ${label}` : `Read ${label}`}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.figure
            key={id}
            id={`nest-review-${id}`}
            initial={{ opacity: 0, scale: 0.35 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.35 }}
            transition={{ duration: 0.34, ease: [0.16, 1, 0.3, 1] }}
            style={{
              transformOrigin: 'top left',
              // Capped so the card's right edge stays inside the plate. The
              // second term is the furthest left the card can start and
              // still fit — the plate's width less the card's own (the same
              // `max(15rem,32%)` as the class below) and a small gutter. On a
              // phone the Maserati dot sits past half way across and the
              // 15rem card ran ~60px off the right of the screen, where the
              // section's `overflow-hidden` cut it; Nike's did the same at
              // every width.
              left: `min(calc(${x} + 0.5rem), calc(100% - max(15rem, 32%) - 0.75rem))`,
              top: `calc(${y} + 0.75rem)`,
            }}
            {...(plate ? play.handlers : {})}
            // A share of the PLATE with a floor, not a percentage under a
            // pixel ceiling.
            //
            // `min(24rem,78%)` looks like it scales and does not: 78% of the
            // plate is 1062px at 1361, so the 384px ceiling won at every
            // desktop width and the card came out a flat 384px - measured,
            // 28.2% of the nest at 1361 and 20.0% at 1920. Same card, two
            // different sizes against the artwork it is pinned to, which is
            // what changed every time the page was zoomed.
            //
            // `max()` instead of `min()` inverts that: 32% governs wherever
            // the plate is wide enough, so the card holds one share of the
            // nest at every width, and the 15rem floor only takes over on
            // phones, where 32% of the plate would be too narrow to set a
            // quote in. A floor cannot freeze it the way a ceiling did.
            className="absolute z-30 m-0 w-[max(15rem,32%)]"
          >
            {plate ? (
              <>
                <img
                  src={A.nestTestimonial}
                  alt="Rated 5 out of 5. “They approached design the same way we approach racing every detail engineered for performance and elegance.” Cyril Blais, CEO, Maserati Formula E"
                  loading="lazy"
                  draggable={false}
                  className="block w-full select-none drop-shadow-[0_20px_36px_rgba(0,0,0,0.55)]"
                />
                <CursorPlayBadge {...play} size={30} />
              </>
            ) : (
              <div className="rounded-2xl bg-white px-4 py-3.5 drop-shadow-[0_20px_36px_rgba(0,0,0,0.55)]">
                {/* Just the comment. No thumbnail, no avatar, no attributed
                    person.
                    
                    The Maserati card is a composed export with a real
                    interview still and a real named speaker in it. There is
                    no such material for the other four, and the previous pass
                    filled the same shape by cropping the artwork for a
                    "photo" and inventing a name to sit under it — which is
                    presenting made-up people as customers. A quote and a
                    rating, with only the brand named, says exactly as much as
                    is actually known. */}
                <blockquote className="font-ui text-sm leading-relaxed text-plum-800">
                  “{quote}”
                </blockquote>

                <div aria-hidden className="mt-2.5 flex gap-0.5 text-gold-500">
                  {[0, 1, 2, 3, 4].map((n) => (
                    <svg key={n} viewBox="0 0 20 20" className="size-3.5 fill-current">
                      <path d="M10 1.6l2.5 5.4 5.9.7-4.4 4 1.2 5.8L10 14.6l-5.2 2.9L6 11.7l-4.4-4 5.9-.7z" />
                    </svg>
                  ))}
                </div>

                <figcaption className="mt-2.5 border-t border-plum-900/10 pt-2.5 font-display text-sm font-semibold text-plum-900">
                  {brand}
                </figcaption>
              </div>
            )}
          </motion.figure>
        )}
      </AnimatePresence>
    </>
  )
}

/**
 * The brands in the nest, and what each one says when you open it.
 *
 * Positions are percentages of the `nest-brands` plate, so they ride with it
 * at any width — and they are MEASURED off the plate, not read off a
 * screenshot.
 *
 * The plate has the dots painted into it. Detecting them (small, round,
 * evenly bright patches, 10-11px across on the 1400x1866 file) finds five,
 * one of which lands at 51.6% / 70.0% — exactly where the single hotspot this
 * section shipped with was hardcoded, which is what confirms the rest are the
 * same marks. Eyeballed positions had each of the other four out by one to
 * three per cent, and at this size that is enough to draw our dot BESIDE the
 * painted one rather than on it: two circles per brand, neither aligned.
 *
 * Every quote here is PLACEHOLDER copy — invented, and deliberately
 * unattributed: a brand, a rating and a comment, with no name or face put to
 * it. The Maserati card is the exception and renders as an image instead,
 * because it is a real composed export with a real interview still and a real
 * named speaker in it.
 */
const NEST_REVIEWS = [
  {
    id: 'maserati',
    x: '51.6%',
    y: '70%',
    brand: 'Maserati Formula E',
    label: 'the Maserati Formula E testimonial',
    plate: true,
  },
  {
    id: 'jollibee',
    x: '19.9%',
    y: '58.9%',
    brand: 'Jollibee',
    label: 'the Jollibee testimonial',
    quote: 'They understood the brand before we finished explaining it, and then showed us a version of it we had not thought of.',
  },
  {
    id: 'cartier',
    x: '58.4%',
    y: '49.4%',
    brand: 'Cartier',
    label: 'the Cartier testimonial',
    quote: 'Restraint is the hardest thing to ask for. They gave us work that knows exactly when to stop.',
  },
  {
    id: 'makita',
    x: '69.9%',
    y: '50.8%',
    brand: 'Makita',
    label: 'the Makita testimonial',
    quote: 'We build tools that have to work every single time. They approached the site the same way.',
  },
  {
    id: 'nike',
    x: '80.7%',
    y: '52.7%',
    brand: 'Nike',
    label: 'the Nike testimonial',
    quote: 'Fast, sharp, and never precious about an idea. The work moved as quickly as we needed it to.',
  },
]

/** SECTION 6 — inside the nest. */
export default function TopSecrets() {
  // Shared with `Quote` below via props (plain function components, not
  // `forwardRef`, so the ref travels as a named prop rather than the JSX
  // `ref` attribute) — it is what lets `Quote` measure its pull-up against
  // the COPY's own position, and watch for the COPY coming into view rather
  // than its own, much lower, natural one. See the note on `Quote`.
  const copyRef = useRef(null)

  return (
    <section
      id="top-secrets"
      className="relative overflow-hidden bg-[linear-gradient(180deg,rgba(20,12,10,0)_0%,#140c0a_5%,#110701_12%,#110701_90%,#140c0a_100%)] pb-2 pt-[clamp(5rem,9vw,8rem)] sm:pb-32"
    >
      {/* The heading is now the composed render from Figma (Group 2087325445.png)
          which has the text baked in with the vine wrapping around it.
          Since the DOM <h2> is gone, this image now carries the alt text.

          Kept OUTSIDE the `max-w-6xl px-5 sm:px-8` column below rather than
          `w-full` inside it — the vine already reaches almost to the edges
          of its own source image, so the gap the design flagged was never
          in the asset, it was this section's own content column boxing a
          full-bleed graphic down to 1152px-plus-padding and leaving the
          section's dark background showing on both sides. `w-full` on a
          direct child of the section (no wrapping max-width) lets the vine's
          own ends land on the section's true edges instead.

          `<Reveal onMount>`, not scroll-triggered — this section is landed
          on directly by the nest dive rather than scrolled to, so a
          `whileInView` trigger would fire (and finish) before anyone ever
          sees it. `delay={0.5}`, matching the veil's own hold (see
          `NestView.jsx`'s `dive`) — the veil stays fully opaque for 0.5s
          after this mounts before it starts lifting, so a short `0.1s`
          delay finished this fade entirely BEHIND that cover: the heading
          was already sitting still at full opacity by the time there was
          anything to see, and the veil dissolving in front of a static
          image is not the same thing as the heading fading in. Delaying to
          match the hold means the fade actually plays out as the veil
          clears, so what the visitor sees is the heading fading into place. */}
      {/* `y={0}`, no rise. The dive paints this same plate into its own
          overlay and fades it up over the blurred city before the dark
          finishes closing (see `NestView`'s veil), then lifts the veil to
          hand over to this one. That hand-off only works if the two sit in
          exactly the same place — a 34px rise here would slide this out
          from under the copy still being shown on top of it. */}
      <Reveal y={0} delay={1.3} onMount className="relative">
        <img
          src={A.secrets.heading}
          alt="Top Secrets"
          loading="eager"
          fetchPriority="high"
          decoding="async"
          // The plate is `w-full` and its own top and bottom land INSIDE the
          // window during the hand-off - measured, top at 261 and bottom at
          // 565 of a 900px frame while the dive is still dissolving. It also
          // carries ink right up to its top row (alpha 117), so that boundary
          // is a real edge in the artwork, not padding. Against the blurred
          // plate behind it that drew as a straight rule across the shot.
          //
          // Faded over the outer 4% on each side, the edge has nowhere to
          // draw itself. The middle 92% is untouched, so none of the gold is
          // softened.
          style={{
            maskImage: FADE_PLATE,
            WebkitMaskImage: FADE_PLATE,
            maskComposite: 'intersect',
            WebkitMaskComposite: 'source-in',
          }}
          className="w-full"
        />
      </Reveal>


      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 lg:max-w-none lg:px-0">
        {/* ------------------------------------------------- the secrets -- */}
        {/* On desktop the run of secrets is pinned to the heading's own
            lettering rather than to a fixed-width column. The plate is
            full-bleed, and in its 2071px file the gold "Top Secrets" spans
            x = 189 → 1833, i.e. 9.1% → 88.5% of the width. A `max-w-6xl`
            column stayed 1152px wide while the heading kept growing, so above
            ~1920px the cards sat well inside the title. Padding in `vw` makes
            the column the same share of the window the lettering is. */}
        <div className="mt-10 space-y-8 sm:mt-14 sm:space-y-10 lg:pl-[9.1vw] lg:pr-[11.5vw]">
          {SECRETS.map((s, i) => {
            const flipped = i % 2 === 1
            const landed = i === 0
            
            return (
              <div key={s.n} className="relative">
                {/* The vines, placed from the Figma frame (2087325440) rather
                    than by eye. See `VINES` for where each figure comes from.

                    The strip is the full window wide and as tall as this
                    secret, so a vine can be pinned in window widths across
                    and against this secret's own top or height down. From
                    `lg` the column is inset 9.1vw on the left, so the strip
                    is pulled back by exactly that; below it the column is
                    centred and the strip centres with it.

                    BEHIND the pictures now, by request. In the frame the
                    vines are the last layers in the group — soft foreground
                    growth crossing the nests' edges — and that is how they
                    were built, at `z-20`. In practice one of them ran straight
                    across the foot of a nest and read as something blocking
                    it. At `z-0`, with the secret itself lifted to `z-10`
                    below, each vine passes behind the nest and the copy and
                    only shows in the dark either side of them. */}
                {VINES[i] && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-y-0 left-1/2 z-0 w-screen -translate-x-1/2 lg:left-[-9.1vw] lg:translate-x-0"
                  >
                    {VINES[i].map((v) => (
                      <img
                        key={v.matrix}
                        src={A.secrets.vine}
                        alt=""
                        loading="lazy"
                        style={{
                          left: v.left,
                          top: v.top,
                          width: v.width,
                          transform: `translate(-50%, -50%) matrix(${v.matrix}, 0, 0)`,
                        }}
                        className={`absolute max-w-none ${v.desktopOnly ? 'hidden lg:block' : ''} ${VINE_FADE}`}
                      />
                    ))}
                  </div>
                )}

                {/* The PICTURE always gets the wide track. The split used to
                    be a fixed `1fr 1.5fr`, and the flipped secret (02) swaps
                    its two children with `order` — so its picture landed in
                    the narrow `1fr` column and drew at two thirds the size of
                    the other two. Mirroring the tracks along with the order
                    keeps all three pictures the same size. */}
                <article
                  className={`relative z-10 grid items-center gap-10 lg:gap-[4vw] ${flipped ? 'lg:grid-cols-[1.5fr_1fr]' : 'lg:grid-cols-[1fr_1.5fr]'}`}
                >
                <Reveal
                  y={44}
                  {...(landed ? { onMount: true, delay: 0.5 } : {})}
                  className={`sm:pl-12 sm:pr-4 lg:px-0 ${flipped ? 'lg:order-2' : ''}`}
                >
                  <span className="font-ui text-[clamp(2.5rem,5vw,8rem)] font-bold leading-none text-gold-500">
                    {s.n}
                  </span>
                  <h3 className="mt-2 font-ui text-[clamp(1.45rem,2.6vw,4.25rem)] font-bold leading-[1.15] text-gold-500">
                    {s.title[0]}
                    <br className="hidden sm:block" /> {s.title[1]}
                  </h3>
                  <p className="mt-4 max-w-[34em] font-ui text-[clamp(1rem,1.1vw,1.75rem)] leading-relaxed text-gold-500">{s.copy}</p>
                </Reveal>

                <Reveal
                  y={44}
                  delay={landed ? 0.65 : 0.1}
                  {...(landed ? { onMount: true } : {})}
                  className={flipped ? 'lg:order-1' : ''}
                >
                  <Peephole src={s.art} alt={s.alt} glow={s.glow} eager={landed} />
                </Reveal>
                </article>
              </div>
            )
          })}
        </div>

        {/* ------------------------------------------------- the partners -- */}
        <Partners copyRef={copyRef} />

      </div>
      <Quote copyRef={copyRef} />
    </section>
  )
}

/**
 * The closing copy. No curtain image of its own — it is hidden by the
 * NEXT image down, `Quote`'s `nest-brands` plate, which starts pulled up
 * over this text and slides down to its own resting place once the text is
 * in view (see the note on `Quote`). `copyRef`, passed down from
 * `TopSecrets`, is what `Quote` measures and watches.
 */
function Partners({ copyRef }) {
  return (
    <div className="relative mx-auto mt-24 max-w-2xl sm:mt-32">
      <div ref={copyRef} className="text-center">
        <h3 className="font-ui text-[clamp(1.5rem,3.4vw,2.5rem)] font-bold leading-[1.15] text-gold-500">
          The real secret? Wise brands
          <br className="hidden sm:block" /> find wise partners.
        </h3>
        <p className="mx-auto mt-4 font-ui leading-relaxed text-gold-500">
          We have partnered with ambitious startups, growing businesses, global brands and teams
          determined to make something better than “good enough”.
        </p>
      </div>
    </div>
  )
}

function Peephole({ src, alt, glow, eager }) {
  return (
    <div className="relative mx-auto w-full max-w-[37rem] lg:max-w-none">
      {glow && (
        <div className="pointer-events-none absolute inset-[-12%] rounded-full bg-[radial-gradient(circle,rgba(240,185,57,0.22)_0%,rgba(240,185,57,0)_66%)]" />
      )}
      <img
        src={src}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        fetchPriority={eager ? 'high' : undefined}
        decoding="async"
        className="relative w-full [mask-image:radial-gradient(ellipse_closest-side_at_50%_50%,#000_72%,transparent_96%)]"
      />
    </div>
  )
}

/**
 * This plate is what hides the "wise partners" copy above it, not a
 * separate curtain image — it starts pulled UP over `Partners`' text
 * (`copyRef`) and slides down into its own normal resting spot on a timer
 * once the copy is in view, uncovering the words as it settles into place.
 *
 * `z-20` on the wrapper is load-bearing: `Partners` sits inside the
 * section's `relative z-10` content column, and this component is a
 * SIBLING of that column rather than a child of it, so without its own
 * higher stacking order the pulled-up plate would paint BEHIND that
 * column's z-10 — visible, but under the text it is meant to cover.
 *
 * The pull distance is MEASURED (`pullUp`, from this image's own resting
 * top down to the copy's top) rather than a guessed figure — the gap
 * between the two depends on how many lines the copy wraps to, which
 * changes with viewport width, so a fixed number would drift out of sync
 * at some width or other.
 *
 * The slide PLAYS ITSELF once the copy is in view; it is not driven by
 * scroll position. Both scroll-mapped versions of this had the same two
 * problems in practice. The reveal was only ever partly through by the
 * time anyone was actually reading — the plate's travel was spent on the
 * approach, not on the arrival — and pushing the window later to fix that
 * just moved the trade: it then needed a much deeper pull-up to still be
 * covering when the reveal began, and a deeper pull-up reaches up past
 * this copy entirely and hides the secret above it. A timed slide
 * separates the two: the pull-up only has to cover THIS block, and how
 * long the visitor sees it covered is set by a delay rather than by how
 * fast they happen to scroll.
 *
 * The scroll is tracked on the COPY, not on this image — the image's own
 * natural position sits well below the copy (the whole point of pulling it
 * up), so measuring IT would map the reveal to arrival at the image's resting
 * spot, further down the page, rather than at the text.
 *
 * `pullUp` is re-measured on every layout change, not read once. The three
 * secret cards above this, and the "Top Secrets" heading plate above
 * those, are all still-loading images at the moment this mounts — each
 * one finishing pushes the copy (and this image's own resting spot)
 * further down the page than a single measurement taken a frame after
 * mount would catch. Measured once too early, the plate only pulled up
 * far enough to cover roughly the bottom of the copy — the second line of
 * the heading and the paragraph, with the first line left exposed above
 * it. A `ResizeObserver` on `document.body` re-runs the measurement on
 * every reflow those late images cause, so `pullUp` keeps growing to match
 * as the page settles into its true height, and the plate ends up tall
 * enough to actually cover the whole copy block rather than a "line"
 * sliced across the middle of it.
 */
function Quote({ copyRef }) {
  // Which card is showing, by id — one at a time, so opening a second closes
  // the first rather than littering the nest with cards.
  const [open, setOpen] = useState(null)
  const play = useCursorPlayBadge()
  const reduce = useReducedMotion()
  const imgRef = useRef(null)
  // `pullUp`/`reveal`/`ready` live as MOTION VALUES, not React state, and
  // `imgY` below reads them through the array form of `useTransform`. They
  // used to be one `reveal` object from `useState`, read inside the
  // transform by closing over it — but a single-input `useTransform` only
  // re-runs its function when that ONE input changes; it has no way to know
  // that the function's OTHER captured variable was replaced by a
  // re-render, so once wired up it kept reading whatever that variable was
  // at the first subscription — `null`, before the very first measurement
  // had a chance to land. Measured directly (`transform: none` on the plate
  // at every scroll position, immediately after a dive-landing): the plate
  // sat at its resting spot from frame one and never covered the copy at
  // all, which is what read as the reveal animation having disappeared.
  // Motion values sidestep this because `.get()` always reads the CURRENT
  // value regardless of when the closure was created, and listing them as
  // inputs is what makes Motion re-run the transform when they change — so
  // the plate snaps to its measured pulled-up start the moment measurement
  // finishes instead of staying parked at 0.
  const pullUpMV = useMotionValue(0)
  const revealMV = useMotionValue(0)
  const readyMV = useMotionValue(0)
  // The one piece of readiness that has to be React state as well: the
  // slide's own effect is what waits on it, and an effect cannot depend on
  // a motion value changing.
  const [measured, setMeasured] = useState(false)

  const imgY = useTransform(
    [revealMV, pullUpMV, readyMV],
    ([e, pullUp, ready]) => (ready ? -pullUp * (1 - e) : 0),
  )

  // Driven by SCROLL, not by a timer.
  //
  // It has been both. A timed version (hold, then slide) played itself once
  // the copy came into view, which meant the reveal happened AT the visitor
  // rather than under their control — and if they arrived mid-animation, or
  // scrolled back up, the branch had already gone and the copy was simply
  // sitting there uncovered.
  //
  // Mapped to scroll, the branch is over the words for as long as the words
  // are low on the screen, and comes off as they rise: covered while the
  // copy's top is still in the bottom 15% of the window, clear by the time it
  // reaches a third of the way up. Scrubbing back up puts it back.
  const phone = useMediaQuery(PHONE)
  const { scrollYProgress: copyProgress } = useScroll({
    target: copyRef,
    // Lifts sooner on a phone, where the copy fills more of the screen.
    offset: phone ? ['start 0.98', 'start 0.66'] : ['start 0.85', 'start 0.35'],
  })
  useEffect(
    () =>
      copyProgress.on('change', (v) => {
        if (!measured) return
        revealMV.set(reduce ? 1 : v)
      }),
    [copyProgress, measured, reduce, revealMV],
  )

  useEffect(() => {
    if (reduce) return undefined

    const measure = () => {
      const copy = copyRef.current
      const img = imgRef.current
      if (!copy || !img) return
      // `getBoundingClientRect` reads the RENDERED position — which already
      // has this plate's own `imgY` translate applied, since that is what
      // moves it on screen. Measuring it as-is is self-referential: the
      // very first correct measurement pulls the plate up, which moves
      // `img`'s rendered top down toward `copy`'s by exactly the amount
      // just measured, so the very next remeasure (the `ResizeObserver`
      // fires again almost immediately, as further images below finish
      // loading) reads a near-zero gap and overwrites the correct value
      // with it — collapsing the pull-up it had only just set. Subtracting
      // the transform CURRENTLY applied (`imgY.get()`) before computing
      // the gap undoes that shift first, so every measurement reads the
      // plate's true, untransformed layout position regardless of how
      // many times it has already been measured and moved.
      const untransformedTop = img.getBoundingClientRect().top - imgY.get()
      // Plus the sparse band at the top of the plate. Aligning the plate's
      // own top EDGE with the copy's top puts the heading's first line under
      // the part of the picture that is mostly sky — the foliage does not
      // reach full opacity until 15% down (the same figure the background
      // gradient above is cut to) — so the words showed through the gaps
      // between the leaves. Landing that dense row on the copy's top is all
      // the cover this needs and no more: an earlier pass added the copy's
      // own height again as slack for a scroll-driven reveal, which reached
      // far enough up the page to hide the third secret's paragraph as well.
      // The reveal is timed now, so the hold comes from its delay rather
      // than from over-covering.
      const dense = img.offsetHeight * 0.15
      const pullUp = Math.max(0, untransformedTop - copy.getBoundingClientRect().top + dense)
      pullUpMV.set(pullUp)
      // Flipped on the first measurement and left alone after: it is what
      // lets `imgY` start applying the pull-up, and what releases the slide
      // effect above to run.
      if (!readyMV.get()) {
        readyMV.set(1)
        setMeasured(true)
      }
    }

    const raf = requestAnimationFrame(measure)
    const ro = new ResizeObserver(() => requestAnimationFrame(measure))
    ro.observe(document.body)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [reduce, copyRef, pullUpMV, readyMV, imgY])

  return (
    // A NEGATIVE top margin, where this used to carry `mt-24`/`sm:mt-28`.
    // That positive gap was set when the plate was believed to run "fully
    // opaque right up to its top edge" — it does not: the file's own alpha
    // is 0% at row 0 and only reaches 98% by 12% down, so roughly an eighth
    // of the picture is empty sky that already spaces the foliage off
    // whatever sits above it. The two stacked, and the run of dead ground
    // between the copy and the first leaves was the result. `-6%` claws back
    // part of that band, and being a percentage it resolves against the
    // column's width — the same thing the plate's own height scales with —
    // so the gap holds its proportions at every viewport instead of a fixed
    // `rem` shrinking against a growing image.
    // `onMount`, and `y={0}`. Both halves of the default `Reveal` were
    // fighting what this plate is for. It is a CURTAIN: it starts pulled up
    // over `Partners`' copy and slides down to uncover it, so it has to be
    // opaque and in place BEFORE the copy is ever on screen. A `whileInView`
    // trigger measures this element's own layout box, which sits far below
    // the copy (that is the whole reason it is pulled up) — so the fade only
    // fired once that lower box entered the viewport, by which time the
    // visitor had already scrolled onto fully exposed text and what they saw
    // was the branch arriving late rather than lifting off. The `y={48}`
    // entrance translate is dropped for the same reason: it lands on the same
    // element as `imgY`'s own pull-up and would shift the curtain out of the
    // position the measurement just put it in.
    <Reveal y={0} delay={0.1} onMount className="relative z-20 mx-auto mt-4 w-full sm:-mt-[6%]">
      {/* Everything that belongs ON the plate — the image, its hotspot
          button and the testimonial it opens — moves as ONE rigid unit via
          `imgY`, not just the `<img>` alone. The button and figure are
          positioned as percentages of THIS box, so if only the image
          slid, the hotspot would stay screen-fixed while the art moved
          underneath it — on-spot only once the slide finishes, adrift the
          rest of the time.

          The ground behind the plate is a GRADIENT, not the flat
          `bg-[#110701]` it used to be. Something opaque has to sit back
          there — `nest-brands` is a real photographic cutout with genuine
          low-alpha gaps between its leaves, and while it is pulled up over
          `Partners`' copy those gaps let the text bleed straight through —
          but a flat fill paints the plate's whole rectangle, including the
          transparent sky above the foliage. What covered the copy was
          therefore a brown block ending on a dead-straight horizontal line,
          not the branches.

          Measured off the file's own alpha, the foliage silhouette runs 0%
          opaque at row 0, 17% at 5%, 57% at 8% and 98% by 12% — so the
          gradient stays transparent through the sparse top, and only
          reaches solid at 15%, where the leaves are dense enough to hide
          what is behind them on their own. The cut is the branch's own
          edge now. */}
      <motion.div
        ref={imgRef}
        style={{ y: imgY }}
        className="relative bg-[linear-gradient(180deg,rgba(17,7,1,0)_0%,rgba(17,7,1,0)_7%,#110701_15%,#110701_74%,rgba(17,7,1,0)_100%)]"
      >
        {/* No top fade on the mask. It used to run `transparent_0%` →
            `#000_12%` so the vines emerged out of the dark rather than
            snapping on — but that is the exact range the plate's own alpha
            already fades over (see the note above), so it was a second fade
            stacked on the first, thinning the leaves that are supposed to
            be doing the covering. */}
        <img
          {...nestSrcSet(A.nest.brands, 1400)}
          alt="A nest holding a Maserati Formula 1 car, Cartier watches, a Makita drill, Nike trainers and buckets of fried chicken"
          loading="lazy"
          decoding="async"
          className="w-full [mask-image:linear-gradient(180deg,#000_0%,#000_78%,transparent_100%)]"
        />

        {NEST_REVIEWS.map((r) => (
          <NestHotspot key={r.id} review={r} open={open === r.id} onToggle={setOpen} play={play} />
        ))}
      </motion.div>
    </Reveal>
  )
}