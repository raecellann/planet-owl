import { useCallback, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { A } from '../../lib/assets'
import Reveal from '../../components/ui/Reveal'
import cloudImg from '../../../assets/section 2/image 35 copy.png'
import ribbonImg from '../../../assets/container/Group 2087325444.png'

/**
 * Four crafts, each with its own owl. The owls are the point of the carousel —
 * clicking through swaps the giant word, the list AND the bird together.
 *
 * Why each craft carries a `scale` at all, now that three of them are 1.
 *
 * The owls are sized by HEIGHT, and the four plates are trimmed to their ink
 * (measured: 99.4-99.8% of each plate's height is drawing), so an equal height
 * IS an equal owl: in every plate the bird is the tallest thing in it, and
 * whatever it is holding sits beside or below it. That is what makes clicking
 * from one craft to the next feel like the same bird changing costume rather
 * than four differently-sized birds.
 *
 * An earlier pass scaled them to equal AREA instead — 0.91, 0.93, 0.82 —
 * which held their footprints level but made the actual owls different sizes,
 * shrinking the ones whose plates are wide because of what is next to them.
 * The AI slide is an owl AND a robot dog; equalising area punished the owl for
 * the dog's width.
 *
 * All four sit at 1 now. `Digital` used to carry 1.05, because it is the one
 * plate where something sits ON the owl rather than beside it — a rubber duck
 * on its head — so at an equal plate height its bird alone comes out a little
 * shorter than the rest. Equal PLATES is what reads as one size when you
 * click between the crafts, though, and the odd figure showed as a jump.
 */
const CRAFTS = [
  {
    title: 'Design',
    // See the note on `CRAFTS`, above.
    scale: 1,
    // left side bearing of the first glyph, in em — see the note on the <h2>
    bearing: 0.078,
    em: 3.3315,
    owl: A.owl.vr,
    alt: 'An owl in VR goggles polishing a silver owl trophy',
    items: [
      'Logos & Brand Identity',
      'Packaging & Collaterals',
      'Video Editing',
      '3D Motion',
      'Website',
      'UI/UX',
    ],
  },
  {
    title: 'Develop',
    // See the note on `CRAFTS`, above.
    scale: 1,
    bearing: 0.078,
    em: 3.985,
    owl: A.owl.develop,
    alt: 'An owl in a cap with a laptop and a coffee mug',
    items: [
      'Maintenance & Optimization',
      'Web & Mobile Development',
      'Custom Software',
      'E-commerce',
      'Databases',
      'Cloud',
      'CMS',
      'APIs',
    ],
  },
  {
    title: 'Digital',
    // 1, like the other three. It carried 1.05 because this is the one plate
    // with something sitting ON the owl rather than beside it - a rubber duck
    // on its head - so at an equal PLATE height its bird alone comes out a
    // little shorter than the rest, and the 5% was buying that back.
    //
    // Set flat by request: an equal plate height is what actually makes the
    // four read as one size when you click between them, and the odd one out
    // was visible as a jump. The cost is that this craft's owl is a few per
    // cent shorter than its neighbours, which is the trade the duck forces -
    // one of the two can be equal, not both.
    scale: 1,
    bearing: 0.078,
    em: 3.2758,
    owl: A.owl.digital,
    alt: 'An owl with a megaphone, a tablet and a satchel',
    items: [
      'Content Development',
      'Social Media Ads',
      'Social Listening',
      'Digital Films',
      'E-commerce',
      'Digital Collectible',
      'SEO',
    ],
  },
  {
    title: 'AI Tech',
    // See the note on `CRAFTS`, above.
    scale: 1,
    bearing: 0.0156,
    em: 3.5915,
    owl: A.owl.ai,
    alt: 'An owl in glasses beside a white robot dog',
    items: ['AI Assistants', 'Chatbots', 'Automation', 'Generative AI', 'Analytics', 'Integration'],
  },
]

/**
 * The owl rides after the SECOND phrase, not the first — `n === 1` where the
 * marquee renders it below. In the reference it sits between "No revisions."
 * and the phrase after it, so the run reads guesswork, revisions, owl, and
 * only then the last one.
 */
const PROMISE = ['No guesswork.', 'No revisions.', 'No changes.']

/**
 * The ribbon plate, cropped to the one span of it that tiles.
 *
 * `Group 2087325444.png` is 3241x224 and is NOT periodic: it is an export of
 * the marquee caught at a moment, and its two phrase groups are drawn at
 * different sizes (the owls' gold bands sit 1466px apart, then 1594px). Laid
 * end to end as-is, its trailing owl lands beside its leading owl and the
 * seam reads as two birds standing together — which is exactly what it did.
 *
 * So one span of it is used as the tile instead. The cuts are at x=184 and
 * x=1653, both of which fall inside fully transparent gutters in the artwork
 * (measured: the plate has empty columns at 158-211 and 1628-1679, the two
 * spaces that follow an owl), so neither edge crosses any ink. What is left
 * between them is one phrase group followed by one owl, and repeating THAT
 * gives phrases, owl, phrases, owl for as long as the track runs.
 *
 * Cropping in CSS rather than shipping a second PNG: the numbers below are
 * the whole derivation, they sit next to the reason for them, and there is no
 * near-duplicate 3241px asset to keep in step with the original.
 */
const RIBBON_TILE = { x: 184, w: 1469, h: 224, plate: 3241 }

/**
 * The woosh.
 *
 * A true push, not a crossfade: slides enter and leave from a FULL frame width
 * so the outgoing one is completely gone rather than sitting half-overlapped
 * with the incoming one — that overlap, plus a heavy blur and an opacity fade
 * on both, is what made the earlier version read as two things dissolving into
 * each other instead of one thing being swept aside.
 *
 * Opacity stays at 1 the whole way, and nothing softens either. There used to
 * be a 5px blur in transit for a speed streak — but a blurred word and list
 * sliding past reads as the content fading out rather than being pushed
 * aside, which is the one thing a push is meant not to look like. What sells
 * the speed is the travel and the 0.62s ease, not the softening.
 */
const SWEEP = { duration: 0.62, ease: [0.33, 0.9, 0.28, 1] }

const SLIDE = {
  enter: (d) => ({ x: d > 0 ? '104%' : '-104%', opacity: 1 }),
  center: { x: '0%', opacity: 1 },
  exit: (d) => ({ x: d > 0 ? '-104%' : '104%', opacity: 1 }),
}

/** SECTION 3 — what we do, one craft at a time. */
export default function WhatWeDo() {
  const [[i, dir], setSlide] = useState([0, 1])
  const [sweeping, setSweeping] = useState(false)
  const reduce = useReducedMotion()
  const craft = CRAFTS[i]

  const go = useCallback(
    (step) => {
      // One sweep at a time — a second click mid-flight leaves AnimatePresence
      // with two exiting slides and the layout stutters.
      if (sweeping) return
      setSweeping(true)
      setSlide(([prev]) => [(prev + step + CRAFTS.length) % CRAFTS.length, step])
    },
    [sweeping],
  )

  return (
    // White, per the design. The two thin gradients are the only colour here:
    // they close the seam onto the section above and the one below, which the
    // page's sky-to-night walk still needs to pass through.
    //
    // `pb-[11vw]`, and `vw` rather than the `pb-40` it was, because the thing
    // it has to clear is measured in `vw` now too. `TheFlock`'s pilot reaches
    // up out of its own section at `sm:-top-[20vw]`, so its reach grows with
    // the window; a fixed 160px cleared it at one width and not at another.
    // In the same unit the two scale together and the plane crosses the
    // ribbon by the same amount at every size, which is what the reference
    // draws. 11vw is also what closes the gap the reference shows between the
    // ribbon and the band below it - measured off it at about 11.4% of the
    // frame's width.
    //
    // The original note, which still explains why there is padding here at
    // all: this section carried NO bottom padding at all, so its box
    // ended exactly on the promise ribbon's own bottom edge (measured: 0px
    // between them, at every viewport width). `TheFlock`'s pilot plane sits
    // `top:-9rem` (-144px) off ITS OWN section's top edge — a flat px
    // reach, not a percentage, so it pulls the same 144px above the
    // boundary regardless of viewport — and with nothing there to absorb
    // it, that reach landed squarely on "No guesswork.", not on the empty
    // gap the plane's own comment describes crossing. Confirmed at 1440
    // (the file's own reference width) as well as every narrower size
    // tested: this was never a narrow-viewport bug specifically, the two
    // have always overlapped. 160px clears the measured ~150px reach with
    // a little to spare, and does it here — on the section the plane
    // reaches INTO — rather than by shortening that reach and undercutting
    // the "crossing the gold band" effect its own placement is built for.
    <section id="what-we-do" className="relative overflow-hidden bg-white pb-[11vw] pt-24 sm:pt-32">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[linear-gradient(180deg,#dfe7fa_0%,rgba(255,255,255,0)_100%)]" />

      {/* The puff, on the section's own right edge with exactly half of it
          showing.

          It hung under the carousel's arrows before, which made it a piece of
          that little control cluster rather than weather on the section, and
          it read as a grey smudge parked beside two buttons. Out here it
          belongs to the section.

          The half-off framing is arithmetic, not an eyeball: the plate is
          `46vw` wide and sits at `-right-[23vw]`, and 23 is half of 46 — so
          precisely half of it is outside the frame at every window size, and
          it stays half-out through any zoom. Both figures are `vw`, so the
          cloud and its own overhang scale together; a `%` offset would have
          been a share of the SECTION while the width was a share of the
          window, and the two would drift apart.

          It was 28vw/14vw, which put about 200px of cloud on screen at the
          reference width — small enough to read as a smudge rather than as
          weather. 46vw is two thirds up on that (about 330px showing at
          1440), and the pair has to move together: raising the width alone
          would have slid the plate inboard and put more than half of it in
          frame. It grows DOWNWARD from `top-[52%]`, which is why it can take
          this much without reaching the arrows or the services list above
          it; the section's own `overflow-hidden` takes care of the bottom. */}
      <img
        src={cloudImg}
        alt=""
        aria-hidden
        loading="lazy"
        className="pointer-events-none absolute -right-[29.7vw] top-[13.8vw] z-0 w-[46vw] max-w-none select-none opacity-60"
      />

      {/* Its counterpart on the LEFT flank, which the reference carries and
          this section did not — the pair is what makes the weather read as
          belonging to the whole section rather than as one puff parked in a
          corner.

          Same three figures as the one above, mirrored: `46vw` wide against a
          `23vw` overhang, so exactly half of it is outside the frame at every
          window size and zoom, and both numbers are the same unit as each
          other so they cannot drift apart.

          Read off the reference in `vw` against the SECTION's top, which is
          the only way to compare the two frames.

          It is SMALLER than its opposite and sits much lower: the reference
          shows it 0 to 19.4vw across and 34.2 to 53.7vw down - a low puff
          under the owls' feet, not weather up around the word. At the usual
          two-fifths bleed that visible 19.4vw is a 32vw plate at
          `-left-[13vw]`, and `top-[34vw]` lands the rest.

          An earlier pass had it at 46vw starting 6vw down, spreading it from
          -6 to 40vw across and up level with the type. That came from reading
          a small crop where the soft ground behind the owls was mistaken for
          this puff; on a larger one the two are plainly different things.

          `scaleX(-1)` for the same reason the hero's corner puffs carry it:
          this export's defined edge is on its RIGHT with the wispy side
          trailing left, which at a left-hand placement would face the crisp
          edge inward at the owls and the soft side out at the frame. Mirrored,
          the defined edge faces the corner it is bleeding off.

          `z-0` keeps it behind the owl (`z-10`) and the word, so it is
          atmosphere the composition stands in front of rather than a shape
          laid over it. */}
      <img
        src={cloudImg}
        alt=""
        aria-hidden
        loading="lazy"
        style={{ transform: 'scaleX(-1)' }}
        className="pointer-events-none absolute -left-[13vw] top-[34vw] z-0 w-[32vw] max-w-none select-none opacity-60"
      />

      {/* 1594 — the design's own content width. The inspector puts the title
          block at X 122 W 1232 and the services list at X 1439 W 277, so the
          content runs 122 to 1716 of the 1920 frame.

          It was `max-w-[1240px]`, narrowed on the theory that a wider column
          left "a dead gap" between the word and the list. The gap was never the
          column's fault — it was the 1.05fr/1fr split below giving the list
          nearly half the row when the design gives it a sixth. Fixing the split
          is what closes the hole, and the column can go back to the width the
          design actually draws it at. */}
      <div className="relative mx-auto max-w-[1594px] px-5 sm:px-8">
        <Reveal y={40}>
          <p className="-ml-[0.0156em] font-ui text-[clamp(1.3rem,4.17vw,5rem)] font-bold leading-[1.05] text-plum-700">
            What we do?
          </p>
        </Reveal>

        {/* -------------------------------------------------- the carousel --
            The whole slide travels as ONE element — giant word, owl and list
            together — so the sweep reads as content being pushed off rather
            than three things animating near each other.

            Slides stack absolutely inside a fixed-height rail. That is what
            keeps the layout still: the four crafts have different list lengths
            (Design 6, Develop 8), and in flow the section would grow and
            shrink under the sweep. The rail is sized for the longest.

            `blur` is only ever applied in transit and resolves to 0 at rest,
            so nothing sits permanently soft. */}
        {/* The rail has to hold the composition, and the composition is now
            width-driven while the rail was a flat `30rem`. On the design's
            frame the title block starts at Y 4893 and the owl bottoms out at
            5064 + 541 = 5605, so the piece stands 712px tall against a 1594
            content column — 44.7% of it. At 480px the owl was being cut off
            mid-body by this box's `overflow-hidden`.

            The four crafts used to need four different rail heights, because
            the owls were sized by WIDTH and their aspect ratios run from 0.877
            to 1.293 — so the craft that overflowed changed with the viewport
            and each fix only moved the problem to another slide. Sizing the
            owls by height instead gives them a common ground line and a common
            footprint, and one rail figure now holds for all four.

            `min(45vw,50rem)` did NOT clear every craft, and could not have:
            it measured the WINDOW while everything inside it measures the
            COLUMN, and those two stop tracking each other the moment the
            column caps at 1594. Every figure in the slide is a share of
            `min(1594px, 100vw - 4rem)` - the word is `C*0.742/em` at a 1.05
            line box, the owl `C*0.339*scale`, the owl's own `mt-[-13%]` a
            share of the track - so the stack is a fixed multiple of C, and
            the rail has to be measured the same way or the two drift apart.

            They drifted apart everywhere except the top end. Worked through
            per craft, the stack comes to 0.4394 of the column for Develop,
            0.4608 for AI Tech, 0.4778 for Design and 0.4987 for Digital -
            Digital being worst because it carries both the second-largest
            word and the only owl with a `scale` above 1. Against `45vw` that
            overflowed by 22px at 1100, 38px at 1440 and 49px at 1658, and
            since this box is `overflow-hidden` the overflow was the owl's
            feet being sliced off. Only at 1920, where the column has capped
            and the window has not, did the old figure have room.

            The base and `sm` figures come off the same arithmetic, against
            the owl's OWN sizing at those widths (`min(34vw,12.5rem)`, not the
            column share `lg` uses) AND against the word-proportional overlap
            (`-0.4515 x` the craft's font size). That second term is the one
            to watch: when the overlap stopped being a share of the track's
            width and became a share of the WORD, every figure here changed
            with it, and the rail was left clipping the owl's feet by a pixel
            at 390 and three at 768 - invisible in a still, obvious the moment
            anything moves.
            Re-derived, the stack needs 45vw at 390, 43 at 639, 38 at 768 and
            32 at 1023. `48vw` and `41vw` cover those with headroom.
            They were flat `42rem` and `38rem` - 672px of rail holding 214px
            of content at 390, which is where the huge empty gap under the
            services list on a phone came from. A fixed height cannot track a
            stack whose every part is a share of the viewport.

            0.5 of the column is the worst craft (0.4987) with the rounding as
            headroom. The arithmetic behind it is deliberately conservative -
            measured at 1440 the real stack is 0.4724 of the column against
            the formula's 0.4778, about 5% of slack - so this clears all four
            crafts at every width rather than the one it was checked at. */}
        <div className="relative mt-1 h-[max(12rem,48vw)] overflow-hidden sm:h-[max(19rem,41vw)] lg:-mt-[3%] lg:h-[calc(min(1594px,100vw-4rem)*0.41)]">
          <AnimatePresence initial={false} custom={dir} mode="popLayout">
            <motion.div
              key={craft.title}
              custom={dir}
              variants={reduce ? undefined : SLIDE}
              initial="enter"
              animate="center"
              exit="exit"
              transition={SWEEP}
              onAnimationComplete={() => setSweeping(false)}
              /* 1232fr / 277fr with a 5.33% gap — the inspector's own numbers.
                 Title block X 122 W 1232, list X 1439 W 277, so the gap between
                 them is 1439 - (122 + 1232) = 85, and 85 / 1594 = 5.33% of the
                 content width. The `fr` pair then splits what is left in the
                 same 1232:277 ratio, which lands the list's left edge on 1439
                 at any width.

                 It was `1.05fr 1fr`, which handed the list 47% of the row where
                 the design gives it 17%. That is what opened the "dead gap" the
                 old comment blamed on the column being too wide. */
              className="absolute inset-0 grid content-start gap-6 lg:grid-cols-[minmax(0,1232fr)_minmax(0,277fr)] lg:items-start lg:gap-[5.33%]"
            >
              {/* `--word` is the craft's own type size, published here so the
                  OWL can be placed against it. See its `marginTop`. */}
              <div
                className="relative"
                style={{
                  '--word': `clamp(2.5rem, calc(min(1594px, 100vw - 4rem) * 0.742 / ${craft.em}), 24rem)`,
                }}
              >
                {/* The word is the BACKDROP the owl stands on, not a heading
                    with a picture under it. The design runs the two as one
                    piece — the owl's head and shoulders crossing the lower half
                    of the letterforms — and at `mt-[-4%]` they were merely
                    adjacent, the owl's crown grazing the baseline. The word
                    takes `z-0` and the owl `z-10` so the overlap resolves the
                    right way round; without the pair the owl would sit behind
                    the letters, since it comes later in the DOM but the two
                    only differ once one of them is stacked. */}
                {/* Straight off the inspector: Momo Trust Display, Regular,
                    357.84px, letter-spacing 0%, line height Auto. 357.84 on the
                    1920 frame is 18.64vw, and the cap is 22.4rem so it stops
                    growing past the size the design draws.
                 *
                 * It was `font-display` (Fredoka) at `clamp(3rem,9.5vw,8rem)`,
                 * bold and `tracking-tight` — the wrong face, roughly half the
                 * size, and tightened when the design sets 0%. Half size is
                 * what left the hole between the owl and the services list: the
                 * word is meant to run 1186 of the 1594 column, about 74% of
                 * it, and at 9.5vw it was reaching barely 30%.
                 *
                 * `font-ui` is this project's Momo Trust Sans. The Display cut
                 * the inspector names is not in `src/fonts/` — if it is a
                 * separate file rather than an optical size of the same family,
                 * drop it in and this switches to it with one token. */}
                {/* Bold, not the inspector's "Regular". The panel names Momo
                    Trust DISPLAY, and this project only ships Momo Trust Sans —
                    a Display cut is a heavier drawing at the same nominal
                    weight, so Sans at Regular came out visibly thin against the
                    design. 700 on the family we have is the closest match to
                    what the design renders.
                 *
                 * Fill is #562354 from the inspector, which is `plum-700` — it
                 * was `plum-800`. */}
                <h2
                  /* Pulled left by the first glyph's own side bearing, so the
                     INK lines up with the label above rather than the boxes.
                     Both start at the container edge already — but a side
                     bearing scales with font size, so `D` at 0.078em on a 358px
                     word sat 28px in while `W` at 0.0156em on an 80px label sat
                     1.3px in. Measured, the two inked edges were 26.7px apart.
                     Per craft, because `A` in "AI Tech" is 0.0156em, not 0.078 —
                     one shared figure would over-pull that slide by 22px. */
                  style={{
                    marginLeft: `-${craft.bearing}em`,
                    fontSize: 'var(--word)',
                  }}
                  className="relative z-0 whitespace-nowrap font-ui font-bold leading-[1.05] tracking-normal text-plum-700"
                >
                  {craft.title}
                </h2>

                {/* Figma places the owl at X 0, hard against the 1920 frame's
                    left edge. It starts at the content column's edge here —
                    reaching outside a centred container for a gutter that
                    changes with the viewport is a lot of fragility to buy a
                    few dozen pixels.

                    The margin is a percentage of the container's WIDTH, not of
                    the word's height, so it has to be a figure that lands the
                    same overlap as the type scales — both are width-driven
                    (`9.5vw` type against a `%` margin), which is what keeps
                    them in step. */}
                {/* HEIGHT-driven, off the inspector's H 541 — 541 of the 1594
                    content column is 33.9% of it, tracked with a `calc` on the
                    column itself so it holds at every width.
                 *
                 * Sizing by the inspector's W 699 was wrong, and wrong in a way
                 * that only showed on three of the four slides. The four owls
                 * are trimmed cut-outs with their own aspect ratios — 1.057,
                 * 0.877, 1.011 and 1.293 — and the 699x541 box is 1.292, so it
                 * describes the AI owl and nothing else. Setting a shared WIDTH
                 * therefore gave each craft a different height: Develop, at
                 * 0.877, came out 41% taller than the design's box and ran
                 * straight out of the rail. Setting a shared HEIGHT gives them
                 * a common ground line, which is what the design actually has,
                 * and lets each keep its own width.
                 *
                 * X 142 against a content origin of 122 is 20px in, which is
                 * 1.6% of the track: hard against its left edge, which is where
                 * it already sat.

                    Flies in from the left on `initial`/`animate` rather than
                    `whileInView`: the slide is keyed by craft, so its children
                    remount on every change and the owl re-enters with each new
                    craft instead of only the first time the section is seen.

                    Timed to `SWEEP` now, the same duration and ease the slide
                    itself pushes in on, with the same in-transit blur — it
                    used to run its own slower, unblurred 0.85s fade a beat
                    behind the slide's 0.62s sweep, so the owl arrived late
                    and soft while everything else around it had already
                    snapped into place with a motion-blurred woosh. One clock
                    for both is what makes the owl read as part of that woosh
                    instead of a separate, gentler entrance trailing it. */}
                <motion.img
                  src={craft.owl}
                  alt={craft.alt}
                  loading="lazy"
                  key={craft.title}
                  initial={reduce ? false : { opacity: 0, x: -160 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={SWEEP}
                  /* No `owl-shadow`, and a fade on the last 5%.
                     All four craft plates are cut flat along the bottom of
                     their own ground shadow — measured, alpha is still 255 two
                     rows from the edge on every one of them. `owl-shadow` is a
                     CSS `drop-shadow`, which traces the alpha silhouette, so it
                     took that straight edge and drew a line under their feet.
                     Same fix as the wizard: drop the filter, since the art
                     already carries its own shadow, and fade the cut itself so
                     it does not read against the white. */
                  // The overlap is a share of the WORD, not of the track.
                  //
                  // It was `mt-[-13%]`, and a percentage margin resolves
                  // against the container's WIDTH - which is the same for all
                  // four crafts while their words are not. Measured, that
                  // gave a flat 121px of overlap against word blocks running
                  // 236px to 287px: 43% of Design, but 51% of Develop, whose
                  // type is the smallest of the four. The same owl ate half
                  // of one word and two fifths of another.
                  //
                  // `--word` is the craft's own font size, so -0.4515 of it
                  // is 43% of a 1.05 line box for every craft - Design's
                  // proportion, applied to all of them.
                  style={{ '--owl': craft.scale, marginTop: 'calc(var(--word) * -0.4515)' }}
                  className="relative z-10 h-[calc(min(34vw,12.5rem)*var(--owl))] w-auto max-w-none [mask-image:linear-gradient(180deg,#000_95%,transparent_100%)] lg:h-[calc(min(1594px,100vw-4rem)*0.25*var(--owl))]"
                />
              </div>

              {/* The inspector gives the list block as W 277 x H 186 for six
                  lines — 31px a line, so the type is about 22.5px at
                  `leading-snug` and there is NO extra space between the items.
                  `space-y-3`/`space-y-4` was adding a gap the design does not
                  have, and `2.1vw` set the type half again too large, which is
                  why it needed a column twice the width the design draws. */}
              {/* Fades in on every change, not just the first. The list is
                  inside the slide, which is keyed by craft, so it remounts
                  with each press — `initial`/`animate` therefore replay
                  rather than being a one-time entrance. The short delay lets
                  the sweep carry the block into place first, so the words
                  arrive AT the new position instead of travelling in
                  half-visible. */}
              <motion.ul
                key={craft.title}
                initial={reduce ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
                className="lg:pt-10"
              >
                {craft.items.map((item) => (
                  <li
                    key={item}
                    className="font-ui text-[clamp(0.95rem,1.17vw,1.4rem)] font-medium leading-snug text-plum-800"
                  >
                    {item}
                  </li>
                ))}
              </motion.ul>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ----------------------------------- the controls, outside the rail --
            They stay put while the slide sweeps past them. */}
        <Reveal y={30} delay={0.1}>
          {/* Placed by the SAME grid as the slide, not by a hand-computed
              margin. The inspector puts the arrows at X 1439 — the list's exact
              left edge — and `ml-[calc(52%+1.5rem)]` only ever approximated
              that: measured, it landed 10px right of the list. Repeating the
              track definition makes the two align by construction instead of by
              a figure that has to be re-derived every time the split changes.

              Gap 24 of the frame's 1594 content = 1.5%. No counter; the design
              has none, and each arrow names the craft it moves to.

              The negative top margin lifts the group off the foot of the rail
              and up under the services list, where the design puts it — the
              rail is sized for the OWL, which runs far below the list, so
              sitting after it in flow left the arrows stranded most of a screen
              lower. It is 62% of the rail's own height (`min(50vw,54rem)`), so
              the two stay locked as the rail scales.

              Lifted rather than moved into the slide's right column: the slide
              is inside `AnimatePresence` and keyed by craft, so controls placed
              there would sweep and re-mount on every press — the one thing the
              rail exists to keep them out of. */}
          {/* `relative z-20` is load-bearing, not decoration. The negative
              margin lifts this group back INTO the rail's box, and the rail's
              slide is `absolute inset-0` — a positioned element, so it paints
              over any static sibling that overlaps it. The arrows were visible
              but not clickable: every press landed on the slide instead.
              Positioning this group and stacking it above the slide is what
              makes the lift safe. */}
          {/* The matching `mb` is not decoration — it is what stops the lift
              eating the section's height. A negative top margin moves this
              group up AND shortens the flow by the same amount, so everything
              after it came up too: the promise ribbon, which is opaque white,
              rode up over the rail and covered the owl's legs. That looked
              exactly like the owl being cropped, and it is not — the owl is
              fully inside the rail; something was being drawn on top of it.
              Giving back the same distance below leaves the group lifted and
              the section the height it had. */}
          <div className="relative z-20 mt-2 grid gap-6 lg:-mt-[min(28vw,31rem)] lg:mb-[min(28vw,31rem)] lg:grid-cols-[minmax(0,1232fr)_minmax(0,277fr)] lg:gap-[5.33%]">
            <div className="hidden lg:block" />
            {/* `mt-12` (~half an inch) drops the pair lower against the rail
                without touching the lift math above — that negative margin is
                sized off the rail/owl and shifting it would move both. */}
            <div className="relative mt-12 flex items-center gap-[clamp(0.75rem,1.25vw,1.5rem)]">
              <Arrow
                label={`Previous craft, ${CRAFTS[(i - 1 + CRAFTS.length) % CRAFTS.length].title}`}
                onClick={() => go(-1)}
                disabled={sweeping}
              >
                <path d="M15 5l-7 7 7 7" />
              </Arrow>
              <Arrow
                label={`Next craft, ${CRAFTS[(i + 1) % CRAFTS.length].title}`}
                onClick={() => go(1)}
                disabled={sweeping}
              >
                <path d="M9 5l7 7-7 7" />
              </Arrow>
            </div>
          </div>
        </Reveal>
      </div>

      <PromiseRibbon reduce={reduce} />
    </section>
  )
}

/** The gold circular carousel control from the `Frame 2087325512` export. */
function Arrow({ children, label, onClick, disabled = false }) {
  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      whileHover={disabled ? undefined : { y: -3 }}
      whileTap={disabled ? undefined : { y: 2 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      // 72px on the design's 1920 frame = 3.75vw, against the flat `size-12`
      // (48px) this carried before. `--btn-ledge` keeps the press on gold
      // rather than the global plum.
      //
      // NO colour change on press. These are plain gold discs with an arrow
      // on them, and repainting the whole face is what made every attempt at
      // one read as a different button appearing rather than this one being
      // pushed: `teal-500` was reported as turning green, and so was
      // `gold-600` — reasonably, since #c28e39 is a desaturated olive gold
      // and reads green against the flat #f0b939 beside it. The press is the
      // 2px travel (`whileTap`) onto `btn-type`'s plum ledge, which is
      // movement rather than colour and cannot be mistaken for a different
      // control. Hover still lifts to `gold-400`, a lighter tint of the same
      // hue.
      style={{ '--btn-ledge': 'var(--color-plum-900)' }}
      className="btn-type grid size-[clamp(2.75rem,3.75vw,4.5rem)] place-items-center rounded-full bg-gold-500 text-plum-800 shadow-[0_6px_0_-2px_var(--color-plum-900),0_18px_30px_-16px_rgba(20,12,10,0.7)] transition-colors hover:bg-gold-400 disabled:cursor-not-allowed"
    >
      <svg viewBox="0 0 24 24" className="size-[42%]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
        {children}
      </svg>
    </motion.button>
  )
}

/**
 * The promise ribbon. It repeats rather than sitting still because the export
 * shows it mid-scroll — two copies, so the CSS marquee can translate exactly
 * -50% and loop without a seam.
 */
function PromiseRibbon({ reduce }) {
  return (
    <div
      role="img"
      aria-label={PROMISE.join(' ')}
      // No `border-y`. The hairlines above and below the ribbon were a real
      // border — `border-plum-700/10` — not a seam between two backgrounds, so
      // no amount of matching the colours either side would have removed them.
      //
      // And no `bg-white` either, which was doing the same damage by a
      // different route. The section is already white, so the fill painted
      // nothing you could see — except where the cloud on the right passes
      // behind this band. This div comes after that cloud in the DOM, so its
      // opaque rectangle went straight over it and cut a hard horizontal line
      // across the middle of the puff, which read as the cloud being clipped.
      // It was not clipped: measured, its box runs 215 to 615 with no
      // clipping ancestor anywhere near, and the asset's own edges are clean
      // (alpha 0 on all four sides). It was simply being painted over.
      // Transparent, the cloud passes behind the words the way the reference
      // has it.
      //
      // The mask is what stops a phrase reading as "cut off" rather than
      // "still scrolling" — `overflow-hidden` alone clips text with a hard
      // edge, so whatever word happens to be crossing the container's own
      // left/right boundary at any instant gets sliced mid-letter with no
      // transition. Fading the outer 8% of the band lets each phrase dissolve
      // into the white before it reaches the true clip edge, so nothing is
      // ever seen being cut — the same technique the hero's cloud wisps use
      // for the same reason.
      className="relative mt-[1.5vw] w-full overflow-hidden py-[0.9vw] [mask-image:linear-gradient(90deg,transparent_0%,#000_8%,#000_92%,transparent_100%)] sm:mt-[2vw]"
    >
      {/* The ribbon is a PLATE now, not type and owls assembled in the
          browser — `Group 2087325444.png`, the export's own strip, 3241x224.

          What that buys is the thing the old build could never quite get
          right: the spacing between a phrase and the owl after it, the gold
          band behind each bird, the exact weights and the teal/plum
          alternation are all drawn in the artwork rather than approximated by
          a `gap-8 sm:gap-12` and a pair of colour classes that had to be kept
          in step with the design by hand.

          `w-auto` off a height is what holds its 14.469:1 ratio: nothing here
          states a width, so the strip cannot be stretched by the track it
          sits in no matter how the window is sized. The height is the only
          figure, and it is read off the reference: the owl in the band stands
          about 9% of the frame's width there, against the 5.6% this was first
          built at — measured the other way, the cap height of "No chaos." is
          2.1% of the frame in the reference and was 1.4% here. Both readings
          land on the same correction, about 1.6x, which is the 8.8vw middle
          term below.

          EIGHT tiles, and -25% is still one clean jump because every tile is
          identical: a quarter of eight is two of them, so the wrap lands on
          the same pixels. Eight rather than four because the tile is only
          6.56:1 now, not the plate's 14.47:1 — about 530px at this height, so
          four of them would be a 2120px track and the loop would run out of
          ribbon on any window past about 1590px. Eight covers past 3180.

          The count matters because the seam is only invisible while the track
          still spans the window at the moment it resets: track width minus one
          jump is the widest window this can cover. */}
      <div
        className={`flex w-max items-center ${
          reduce ? '' : 'animate-marquee will-change-transform'
        }`}
      >
        {Array.from({ length: 8 }, (_, copy) => (
          /* The window onto one tile. `aspectRatio` off the crop's own
             figures turns the single height below into the right width, and
             `overflow-hidden` is what actually does the cropping.

             The plate inside is `h-full w-auto`, so its width follows its own
             14.469:1 ratio — which lands it at 3241/1469 = 220.6% of this
             box — and `left` slides it back by the crop's start. That -12.53%
             is 184/1469 of this box's width, which is the same distance as
             184/224 of its height: the offset is stated against the box so it
             needs no pixel figure and holds at every size. */
          <div
            key={copy}
            className="relative h-[clamp(5rem,11vw,10.5rem)] shrink-0 overflow-hidden"
            style={{ aspectRatio: `${RIBBON_TILE.w} / ${RIBBON_TILE.h}` }}
          >
            <img
              src={ribbonImg}
              alt=""
              aria-hidden
              loading="lazy"
              draggable={false}
              style={{ left: `${(-RIBBON_TILE.x / RIBBON_TILE.w) * 100}%` }}
              className="absolute top-0 h-full w-auto max-w-none select-none"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
