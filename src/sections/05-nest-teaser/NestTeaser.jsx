import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { A } from '../../lib/assets'
import Reveal from '../../components/ui/Reveal'
import { GoldButton } from '../../components/ui/Button'
import DrawnDoodle from '../../components/ui/DrawnDoodle'
/** The hand-drawn sparkle cluster the design hangs off the wizard's hat. */
import sparkleImg from '../../../assets/container/Group 2087325404.png'

/**
 * Where each feather sits and how it turns. Kept to the outer flanks so they
 * frame the wizard instead of crossing him or the type.
 *
 * [left %, top %, height vw, height cap rem, seconds per full turn, direction]
 *
 * Every one of these has to keep its whole CIRCLE inside the section, not just
 * its resting box. A feather that turns sweeps a disc as wide as its own
 * length, so its centre needs to sit at least half that length from all four
 * edges — and the section is `overflow-hidden`, so anything that does not gets
 * sliced part-way through the turn. The first pass was placed by where the
 * feathers looked right at rest (`left: -2%`, `top: -6%`, up to 45vw long) and
 * they were cut on every rotation.
 *
 * Arrangement taken off the design. At 33% zoom the frame's 1920 maps to about
 * 634 screenshot pixels, so screen coordinates times 3.03 give frame position:
 * the five sit at roughly 11%, 18%, 90%, 80% and 76% across, two down the left
 * flank and three down the right, with the large one high on the right.
 *
 * Sizes follow the same reading EXCEPT the large one, which the design draws at
 * about 43vw. That cannot turn a full circle here: at 1920 a 43vw feather is
 * 826px long, so the disc it sweeps is 1020px across against a section whose
 * floor is 58rem — 928. It would be sliced at the top and bottom of every
 * rotation no matter where it sat.
 *
 * It is 24vw now rather than 30. Two turning feathers overlap whenever the gap
 * between their centres is less than the sum of their radii, and at 30vw the
 * big one on the right swept a 534px disc whose centre sat 152px from its
 * neighbour's — the two crossed on most of the cycle. Bringing it to 24vw is
 * what makes an arrangement possible where NO pair can touch, at any point in
 * any rotation: every centre-to-centre distance below exceeds the two radii
 * added together.
 *
 * Re-cut once the plate stopped being trimmed. Untrimmed, `feather-3` is 0.726
 * wide-to-tall instead of 0.357, so each box is twice as wide and the disc it
 * sweeps — hypot(w,h) — grew with it.
 *
 * Each height carries a `rem` cap as well as a `vw` figure, and that pair is
 * what keeps them inside the section on a wide window. The section's height
 * floor is `58rem`, so past about 1440 it stops growing while a `vw` feather
 * keeps going — at 1920 the second one swept a 498px disc from a centre 787px
 * down a 928px section and was cut by 107px, and the fifth by 33. The caps are
 * each feather's own length at 1440, which is where the section stops.
 */
/**
 * The swept-disc rule above binds on the VERTICAL axis only, now that two of
 * these are placed off the design's own frame edges.
 *
 * Top and bottom still have to clear, because those edges cut against the
 * white sections either side and a feather sliced there reads as a rendering
 * fault. Left and right no longer do: the section is full-bleed, so its side
 * edges ARE the viewport's, and a feather passing off the side of the screen
 * is just a feather leaving frame. The design places both of these hanging
 * off the edge on purpose (X 1492 of 1920 for the large one, X -167 for the
 * small one), so holding them a half-diagonal inboard would be correcting the
 * layout rather than the bug.
 *
 * Vertical clearance is still checked: the large one at 34vw sweeps a 283px
 * radius from a centre 8% down a 58rem section — 303px, so it clears the top
 * by 20px at the section's shortest.
 */
const FEATHERS = [
  // Read off the full-section reference (the one that shows the heading, the
  // button, the wizard and the ground all at once) rather than a crop, so the
  // vertical figures are against the section rather than against whatever the
  // crop happened to include. In that frame the section runs from just under
  // the gold band above it to where the foliage of the next one starts.
  //
  // Four on the flanks, two a side, plus one small one low and right — the
  // arrangement frames the wizard rather than crossing him.
  //
  // Reference reading (centre x / centre y as % of the section, long axis as
  // % of its width — which is what a `vw` height is):
  //    7.7 / 43.3 / 26      17.6 / 70.7 / 19
  //   87.9 / 39.0 / 22      93.9 / 65.7 / 17.5
  //   72.8 / 84.0 /  9.5
  //
  // Stored as the element's top-left corner, so each is that centre pulled
  // back by half its own box (the plate is 0.726 wide to tall, and the
  // vertical half-box is worked at this file's 1440x900 reference).
  //
  // The cap is a share of THE SECTION, not a `rem`.
  //
  // It has to be a cap of some kind: a feather taller than the section is
  // sliced on every rotation. But in `rem` it was a fixed pixel ceiling -
  // each feather's length at 1440 - so past that width they simply stopped
  // growing while everything around them carried on. Zoom out and the
  // feathers shrank against the page.
  //
  // This section is `h-[100svh]`, so a percentage of it tracks the window and
  // still cannot let a feather outgrow the box it turns inside. Each figure
  // is the old `rem` re-expressed at this file's 1440x900 reference (23.4rem
  // = 374px = 41.6% of 900), so nothing moves at that size and everything
  // keeps scaling past it.
  //
  // [left %, top %, height vw, height cap as % of the section, seconds, dir]
  // Every height is 1.35x what it was. The ceiling is 1.56, and it is a hard
  // one: a turning feather sweeps a disc half its own DIAGONAL in radius
  // (0.618 x its height for this 0.726 plate), and past that the section's
  // `overflow-hidden` slices it part-way through the rotation. Feather 2
  // binds, with its centre 70.7% down and only 29.3% of the section below it.
  // 1.35 leaves margin on all five.
  // THREE, not five - one per flank plus the small one low and right.
  //
  // This is a geometric limit, not a taste call. A turning feather sweeps a
  // disc of radius 0.618 x its height, so two on the same flank can only
  // avoid touching if their radii sum to less than half the section's height
  // (each also has to clear its own edge). At the size these are now drawn,
  // the left pair summed to 541px against a 450px budget and the right pair
  // to 474 - they overlapped by 257px and 219px through most of the cycle.
  //
  // Two per flank caps out around 1.12x, which is barely larger than they
  // started. One per flank clears the current 1.35x with room over: the
  // nearest pair left is 3-5, 460px apart against 378px of radii.
  [-1.7, 22.5, 35.1, 56.2, 34, 1],
  [79.9, 21.4, 29.7, 47.5, 46, -1],
  [69.4, 76.4, 12.8, 20.5, 26, -1],
]

/**
 * SECTION 5 — the door to the nest, with the wizard guarding it.
 *
 * Sized to the viewport rather than to its own content: `100svh` with a floor
 * of `44rem` so it cannot collapse on a very short window. Everything inside
 * is placed as a fraction of that height, which is what keeps the composition
 * in the Figma's proportions instead of the section growing to fit whatever
 * the type happens to measure.
 *
 * The top inset clears the navbar, which is a fixed `4.22vw` bar `124`px tall
 * on the design's 1920 frame — hence the `svh`/`rem` pair rather than a flat
 * padding: on a short window the `svh` term pulls the block up, on a tall one
 * the `rem` floor stops it drifting into the middle of nowhere.
 *
 * The wizard is sized by HEIGHT (`46svh`) so he scales with the viewport and
 * keeps his whole body in frame — the thing that was cropping him before was
 * being sized in `rem` against a section whose height came from padding.
 */
export default function NestTeaser() {
  const reduce = useReducedMotion()
  const [hovered, setHovered] = useState(false)

  return (
    <section
      id="the-nest"
      // 46rem floor now, down from 58. That figure was raised to give the
      // wizard room to draw at full size, but it also set how much EMPTY page
      // this section occupies on an ordinary window — the type sits at the
      // top, the owl at the floor, and everything between them was a gap that
      // grew with the number. The wizard is capped by `max-h-full` against
      // whatever the type leaves behind, so a shorter section makes him a
      // little smaller rather than cropping him, which is the cheaper price.
      //
      // The message block's own top inset comes down with it — the old
      // `clamp(7.5rem,11svh,9.5rem)` was measured against the taller section.
      //
      // (Historical: 52rem, up from 42. The wizard is sized by width off the Figma
      // (44.9vw) but capped by `max-h-full` against the column the type leaves
      // behind, and on anything but a tall window that cap was the binding
      // term — the section was 100svh, the message block took roughly 300 of
      // it, and the owl was left drawing at about two thirds of the width the
      // design asks for. Height is the only lever that makes him bigger; width
      // was never what was holding him back.
      //
      // The old note here said 42 rather than 44 so the section never stood
      // taller than a 700px window. That was written when this section had to
      // fit on one screen with nothing to show; it is a full-height
      // illustration now, and a little scroll on a short window is the cheaper
      // price than an owl at two thirds scale on every window.)
      //
      // `overflow-x-clip`, not `overflow-hidden` — the same swap TheFlock.jsx
      // already makes for the same reason.
      //
      // It was put here for the falling feather, which landed low enough that
      // its own footprint reached past this section's floor and a plain
      // `overflow-hidden` sliced it. That feather is gone, but the swap
      // stays: the wizard's own sparkles sit off the top of his hat, and
      // clipping one axis rather than both is the safer default for a
      // full-bleed section whose contents are deliberately allowed to hang
      // over its edges. The turning feathers are unaffected either way —
      // they carry their own dedicated `overflow-hidden` wrapper (`z-10`,
      // below), which is what their swept-disc containment was built
      // against. `overflow-x-clip` still stops the page from widening, the
      // one thing dropping `overflow-hidden` outright would have risked.
      className="relative flex h-[100svh] min-h-[46rem] w-full flex-col overflow-x-clip bg-white"
    >
      {/* No seam gradient here any more — The Flock above ends on white now,
          so a lavender fade would be inventing a colour neither section has. */}

      {/* ------------------------------------------------------ feathers --
          One asset — `image 77 5.png`, which ships as `feather-3` — placed one
          at a time rather than scattered by a loop over four different cut-outs.

          They turn rather than fall — they stay where they are put and rotate
          a full circle on a linear clock, which reads as a feather turning in
          the air rather than dropping through the frame.

          Directions alternate so they do not all wheel the same way, and the
          periods are all different so the group never syncs up. Sizes and
          placement are on the FEATHERS table above.

          One of these used to FALL instead — a `FallingFeather` component
          that wafted down the section on a nine-second curve and settled on
          a painted shadow by the wizard's feet, on its own `z-30` layer so it
          landed in front of him. It is gone by request, and with it the
          shadow, the landing maths and the whole one-shot animation shape
          that could not be expressed by the six numbers every row here
          shares. */}
      {/* The LAYER stays `pointer-events-none` so it never swallows a click
          meant for anything behind it, and each feather opts back in for
          itself. That is what makes them hoverable at all — as it was, the
          pointer passed straight through the whole layer, so nothing in here
          could respond to it.

          They sit at `z-10` under the content's `z-20`, so the button and the
          wizard still take their own pointer first; a feather only answers
          where there is nothing else to. */}
      {!reduce && (
        <div aria-hidden className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
          {FEATHERS.map(([left, top, vw, cap, secs, dir], i) => (
            <motion.img
              key={i}
              src={A.feathers[2]}
              alt=""
              loading="lazy"
              decoding="async"
              className="pointer-events-auto absolute w-auto cursor-pointer saturate-100 transition-[filter,transform] duration-300 hover:saturate-[1.75]"
              style={{ left: `${left}%`, top: `${top}%`, height: `min(${vw}vw, ${cap}%)` }}
              animate={{ rotate: 360 * dir }}
              transition={{ duration: secs, repeat: Infinity, ease: 'linear' }}
            />
          ))}
        </div>
      )}

      {/* The lavender bloom that used to sit behind the wizard is gone. It was
          a 46rem circle pinned to `bottom-0` and pushed a third of its height
          PAST it, so two thirds of it lay outside the section — and the section
          is `overflow-hidden`, which cut the circle off along the bottom edge.
          What showed was not a soft bloom but a tinted block ending on a hard
          horizontal line exactly where the white below began. */}

      {/* ---------------------------------------------------- the message -- */}
      {/* The nav is fixed and bottoms out around 110px at 1440. The old
          `clamp(7rem,13svh,10rem)` resolved to 117 there — the heading's first
          line landed ON the pill's edge with nothing to spare. */}
      {/* Every gap in this block now carries a CEILING, and the top inset came
          down with the navbar.

          The wizard below is capped by `max-h-full` against whatever column
          this block leaves behind, so every pixel spent here is a pixel off
          him. That is fine while the window is a normal shape and bites when
          it is short - which is exactly what browser zoom does: zooming IN
          shrinks the CSS viewport, so the `vw` gaps shrink with it but the
          `rem` and `px` parts (this margin's floor, the button's 52px) do
          not, and their share of a smaller box grows. The owl is what gives.
          Capping the gaps stops them taking more than their share, and the
          top inset drops from a 4.5rem floor to 3.25rem because the navbar
          itself is shorter now (63px at 1440, down from 80).

          The svh term is 11 rather than 14, and the ceiling 9.5rem rather than
          11. Every pixel this block takes off the top is a pixel off the owl's
          height cap below it; the 7.5rem floor is the part that actually clears
          the navbar, and that is untouched. */}
      <div className="relative z-20 mx-auto mt-[clamp(3.25rem,7.5svh,5.5rem)] w-full max-w-4xl px-5 text-center sm:px-8">
        <Reveal y={36}>
          {/* `max-w-4xl` above and a smaller cap here, and the pair of them
              is one fix for one bug: the heading was rendering in THREE lines
              where the reference has two.
              The `<br>` below is explicit, so the third line was not it - the
              FIRST line was wrapping on its own. At `3.35rem` bold, "Still
              scrolling... So you really" measures about 800px, and
              `max-w-3xl` minus `px-8` left it 704px to sit in. Any
              window wide enough to reach the cap broke it.
              A wider box plus a smaller cap clears it with room to spare, and
              the smaller cap is closer to the reference anyway - measured
              there, the heading's cap height is about 1.9% of the frame's
              width against the 2.8% this was drawing. */}
          <h2 className="font-ui text-[clamp(1.6rem,3.4vw,2.9rem)] font-bold leading-[1.12] text-plum-800">
            Still scrolling… So you really
            <br className="hidden sm:block" /> wanna know our magic?
          </h2>
        </Reveal>

        <Reveal y={28} delay={0.1}>
          <p className="mx-auto mt-[min(3.5vw,2.25rem)] max-w-xl text-[clamp(0.85rem,1.1vw,1.02rem)] leading-relaxed text-plum-700/85">
            If you have made it this far, you must be genuinely curious — because our greatest
            secrets have always hatched inside the nest.
          </p>
        </Reveal>

        <Reveal y={24} delay={0.18} className="mt-[min(1.1vw,0.75rem)]">
          {/* Points at the nest view — Top Secrets, which this used to open,
              is out of the flow, and a button aimed at a section that is not
              rendered simply does nothing when clicked. */}
          <GoldButton href="#nest-view" className="h-[52px]">Enter the secret Nest</GoldButton>
        </Reveal>
      </div>

      {/* ------------------------------------------------------ the wizard --
          Takes the whole remaining column and stands on its floor, so he fills
          the space the type leaves rather than being pinned to a padding
          value. `max-h-full` is the guard: on a short window he shrinks to fit
          instead of pushing out through the bottom of the section. */}
      {/* `max-h-full` measures against THIS column, so its padding is the only
          thing deciding how big the wizard can get — `h-[58svh]` never lands
          on its own, it is always clamped to what is left here. `pt-3` is the
          minimum that still keeps him off the button on a short window, and
          the bottom is down from 5% to 2% for the same reason: every pixel of
          padding is a pixel off the owl. */}
      <div className="relative z-20 flex min-h-0 flex-1 items-end justify-center pb-[0.5%] pt-[min(4vw,2.5rem)]">
        <motion.div
          onPointerEnter={() => setHovered(true)}
          onPointerLeave={() => setHovered(false)}
          // `x` is a PERCENTAGE, not a flat pixel nudge — a CSS transform
          // percentage resolves against the element's OWN box, and this
          // box's width tracks the owl's (44.9vw, sized below), so `-2.475%`
          // shifts him left by the same fraction of his own width at every
          // viewport, not the same fixed 16px. A flat `x: -16` looked right
          // at whichever width it was tuned at, but the owl's rendered
          // width changes with the viewport while a flat px offset does
          // not — so the nudge was a shrinking fraction of him on a wide
          // window and a growing one on a narrow window, reading as the
          // whole figure drifting left/right on resize even though nothing
          // about his OWN position was actually changing. `-2.475%` is
          // that same `-16px`, expressed as a share of his own measured
          // width at this file's 1440px reference (646.5px) instead of an
          // absolute distance.
          initial={reduce ? false : { opacity: 0, y: 50, x: '-2.475%' }}
          whileInView={{ opacity: 1, y: 0, x: '-2.475%' }}
          viewport={{ once: true, margin: '-12% 0px' }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          // `h-full` is what makes `max-h-full` on the owl below actually mean
          // something. Its own parent aligns with `items-end`, not `stretch`,
          // so without an explicit height here this box sizes to its CONTENT
          // (the images) rather than to the space the flex column left for it
          // — and a percentage `max-height` on a child is ignored entirely
          // when its containing block's own height isn't definite. The owl
          // was rendering at `width: 44.9vw` with no real height cap at all,
          // free to grow past the space above it and overlap the headline.
          className="relative flex h-full items-end justify-center"
        >
          {/* Resting image dictating normal layout flow and sizing */}
          <img
            src={A.owl.wizardLg}
            alt="A wizard owl raising a glowing wand"
            loading="lazy"
            decoding="async"
            // Held at full opacity ALWAYS. It used to fade to 0 as the hover
            // plate faded in, and cross-fading two opacities in opposite
            // directions means both sit at 0.5 halfway through - two
            // semi-transparent copies of almost the same drawing, stacked.
            // Everywhere their ink overlaps it composites twice, so the owl
            // visibly darkens and saturates through the middle of the
            // transition and settles back at the end.
            //
            // Only the plate ON TOP needs to move. It is opaque where it has
            // ink, so at full opacity it covers this one completely, and on
            // the way there the two simply dissolve into each other with
            // nothing showing through to the background.
            className="h-auto max-h-full w-[44.9vw] max-w-[86vw] object-contain [mask-image:linear-gradient(180deg,#000_96%,transparent_100%)]"
          />
          {/* The design's sparkle cluster, off the top right of the wizard's
              hat, turned -14.14° as Figma has it.

              The box below is what makes the placement exact, and it has to
              be built around `object-contain`. The wizard's own `<img>` box
              is `w-[44.9vw]` capped by `max-h-full`, and on any ordinary
              window that cap is what binds — so the DRAWN picture is
              letterboxed inside a box both wider and taller than it, centred
              on both axes rather than filling it. Percentages taken against
              that box (or against this flex wrapper, whose height is the
              whole remaining column) therefore measure empty space, which is
              what threw the first pass up above his hat and out to his right.

              `h-full` + `aspect-[760/859]`, centred, reconstructs the drawn
              rectangle instead: the picture fills the height, its width
              follows from the plate's own ratio, and `object-contain` centres
              it exactly where this box sits. Percentages inside are then
              percentages OF THE PLATE. (On a viewport tall enough that width
              binds instead, this drifts — that shape does not occur here,
              where the column is always the shorter axis.)

              The figures are read off the reference against the wizard's INK
              rather than his file — he carries transparent margin on every
              side (measured: ink runs x 10-714, y 32-822 of 760x859) — and
              then converted back into plate percentages. In the reference the
              group starts 71.4% across his ink, is 38.8% of its width, and
              its top edge sits a whisker ABOVE his hat tip, which comes out
              here as 67.5% / 35.9% / 1%.

              It draws itself and then keeps glinting (`twinkle`), which is
              the one thing a sparkle has to do that a heart does not. */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-1/2 z-10 aspect-[760/859] h-full -translate-x-1/2"
          >
            <DrawnDoodle
              src={sparkleImg}
              delay={0.9}
              duration={1.1}
              twinkle
              style={{ rotate: -14.14 }}
              className="absolute left-[67.5%] top-[1%] w-[35.9%]"
            />
          </div>

          {/* Hover image stacked absolutely over the resting image to avoid layout jumps */}
          <img
            src={A.owl.wizardHover}
            alt=""
            aria-hidden
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 h-auto max-h-full w-[44.9vw] max-w-[86vw] object-contain [mask-image:linear-gradient(180deg,#000_96%,transparent_100%)] transition-opacity duration-200 ${
              hovered ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          />
        </motion.div>
      </div>
    </section>
  )
}
