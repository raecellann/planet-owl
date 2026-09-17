import { motion, useReducedMotion } from 'motion/react'
import { A } from '../../lib/assets'
import Reveal from '../../components/ui/Reveal'
import { GoldButton } from '../../components/ui/Button'

// Fixed positions so the sky never reshuffles between renders.
const STARS = [
  [6, 18, 2], [14, 62, 1.4], [22, 30, 1.8], [31, 74, 1.2], [38, 14, 2.2],
  [47, 48, 1.3], [55, 22, 1.7], [63, 68, 1.5], [71, 36, 2], [79, 12, 1.4],
  [86, 58, 1.8], [93, 28, 1.3], [11, 88, 1.6], [43, 84, 1.4], [68, 90, 1.7],
  [88, 80, 1.5], [27, 52, 1.2], [58, 8, 1.5],
]

/**
 * SECTION 8 — the ask, under a night sky.
 *
 * The gold sign-up band that used to close this section has moved into
 * `Footer.jsx`, which is where the section 9 design puts it: the ask ends on
 * its button against the dark, and the footer's feathered edge opens directly
 * underneath. The pilot went with it — the design has one plane, on the ground
 * in the footer, not a second one flying here.
 */
export default function FinalCTA() {
  const reduce = useReducedMotion()

  return (
    // Pulled UP under the nest so the two overlap rather than abut, and its
    // first 16% is transparent so the roots above show straight through it.
    // The night therefore rises into the scene while the nest is still on
    // screen, instead of replacing it on a line. `pt` absorbs the negative
    // margin so the content itself sits exactly where it did.
    //
    // The ground is the BRANCH's own colour and holds it the whole way down.
    // `nest-branch.webp` averages #2c230e across its opaque pixels and #0e0a06
    // across its darkest quarter, which is what the nest panel's #140c0a was
    // sampled from — so carrying that one value through is what makes the two
    // sections read as the same place rather than as two backgrounds meeting.
    //
    // It used to ramp #180d0b -> #0c0409 -> #000000 and lift to #0c0210 at the
    // very end. Sunk to black by three quarters down, it was no longer the
    // nest's colour by the time the eye got there, and the plum accent below
    // was landing on black rather than on brown — which is where the visible
    // purple band came from.
    //
    // Still opens transparent for the roots, and now lands ON the footer's
    // #24051f rather than near it. The last stop used to be #1b0817 — a lift
    // "toward" the plum that stopped 9 steps of red and 8 of blue short, so the
    // footer's own background began on a visible line and read as a purple band
    // appearing behind the gold scallops. Ending on the exact value, ramped
    // over the last 18%, makes the two one continuous ground and leaves the
    // plum showing through the feathered edge as the night it is meant to be
    // rather than as a new colour arriving.
    <section
      id="start"
      className="relative z-0 -mt-[22svh] overflow-hidden bg-[linear-gradient(180deg,rgba(20,12,10,0)_0%,#140c0a_15%,#140c0a_82%,#1c0819_93%,#24051f_100%)] pb-24 pt-[calc(6rem+22svh)] sm:pb-32 sm:pt-[calc(8rem+22svh)]"
    >
      {/* ---------------------------------------------------- the depth --
          A bloom behind the headline that falls off to nothing, in the BRANCH's
          own warm tone (#2c230e, its mean opaque colour) rather than in plum.
          Under it, a wide brown haze low down keeps the ground an environment
          instead of a flat field.

          The bloom was plum — rgba(54,14,57) at 0.72 — and that was the purple
          band. This box starts at `top-[20svh]`, which is a HARD edge, and the
          radial is centred at 26% of it with a 42% half-height, so it is not
          near zero at its own top: it opened at roughly a sixth of full strength
          on the very first row and ruled a crisp purple line across the section.
          Sitting on the branch's colour instead, the same edge has nothing left
          to reveal — the bloom and the ground are the same hue, so it reads as
          light rather than as a change of background.

          Held in its own box starting below the overlap rather than in the
          section's `background`, because a radial centred high enough to sit
          behind the headline reaches into the first 22svh, and that band has
          to stay genuinely transparent for the nest's roots to hang through
          it. Painting the accents here leaves that lip untouched.

          The mask is what dissolves `top-[20svh]` itself. Matching the bloom to
          the ground took the edge from obvious to faint, but it was still a
          measurable 3.5-channel step in a single row — the box simply begins
          there, and no colour choice removes a boundary that the layout is
          drawing. Fading its first 16% turns the start of the box into a ramp,
          so there is no row where anything switches on.

          The BOTTOM fade is what lets the section reach the footer's colour.
          This box runs to `bottom-0`, and its lower haze — a warm
          rgba(135,103,103) ellipse centred at 92% — was painting over the last
          stretch of the section's own ramp. Measured a pixel above the
          boundary the ground came out #1c130b against the footer's #24051f: 20
          steps of blue apart, which is the purple line. The gradient underneath
          was never the problem — it is smooth to 0.73 of a channel step — it
          was being covered before it got there. Fading the haze out over the
          last 22% hands the final ramp back to the background. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 top-[20svh] bg-[radial-gradient(ellipse_76%_42%_at_50%_26%,rgba(44,35,14,0.60)_0%,rgba(44,35,14,0.26)_44%,rgba(44,35,14,0)_74%),radial-gradient(ellipse_96%_44%_at_50%_92%,rgba(135,103,103,0.18)_0%,rgba(135,103,103,0.06)_50%,rgba(135,103,103,0)_78%)] [mask-image:linear-gradient(180deg,transparent_0%,#000_16%,#000_78%,transparent_100%)]"
      />

      {/* stars */}
      <div className="pointer-events-none absolute inset-0">
        {STARS.map(([left, top, size], i) => (
          <motion.span
            key={`${left}-${top}`}
            className="absolute rounded-full bg-white"
            style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
            animate={reduce ? undefined : { opacity: [0.25, 1, 0.25] }}
            transition={{ duration: 3 + (i % 5), repeat: Infinity, ease: 'easeInOut', delay: i * 0.24 }}
          />
        ))}
      </div>

      <div className="relative mx-auto max-w-3xl px-5 text-center sm:px-8">
        <Reveal y={40}>
          <h2 className="font-ui text-[clamp(1.9rem,4.6vw,3.35rem)] font-bold leading-[1.1] text-gold-500">
            Ready to Build Something the
            <br className="hidden sm:block" /> Internet Has Not Seen Yet?
          </h2>
        </Reveal>
        <Reveal y={30} delay={0.1}>
          {/* Yellow, and in the same face as everything else here. It was
              `umber-300`, a muted warm grey — chosen back when the only job was
              getting the lavender cast off this section. `gold-400` is a step
              lighter than the heading's `gold-500`, so the two read as a pair
              rather than as one flat block of the same colour. */}
          <p className="mx-auto mt-5 max-w-xl font-ui leading-relaxed text-gold-400">
            Bring us the ambitious idea — the complex one that still feels just out of reach. We will
            help shape it, build it, and turn it into something real.
          </p>
        </Reveal>
        <Reveal y={24} delay={0.18} className="mt-9">
          {/* `Frame 10.png`'s own badge — the pilot's face, not the flat
              brand mark `withOwl` draws by default elsewhere (the nav's
              "Start a Project"). White disc, and `iconFit="cover"` to crop
              into his face rather than letterbox the whole plane inside the
              circle. */}
          <GoldButton
            href="mailto:hello@planetowl.studio"
            withOwl
            iconSrc={A.owl.pilot}
            iconFit="cover"
            className="h-[52px]"
          >
            Book a Discovery Flight
          </GoldButton>
        </Reveal>
      </div>
    </section>
  )
}
