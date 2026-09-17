import { motion } from 'motion/react'
import { A } from '../../lib/assets'
import Reveal from '../../components/ui/Reveal'
import { GoldButton, TealButton } from '../../components/ui/Button'
import CardCarousel from './CardCarousel'
import DrawnDoodle from '../../components/ui/DrawnDoodle'
/** The two marker hearts the design draws over the card's top edge. */
import heartLg from '../../../assets/container/Highlight 9.png'
import heartSm from '../../../assets/container/Highlight 10.png'

/**
 * Every card is the same shape — photo, purple info bar, "Join the Flock" —
 * so nothing in the row can read as an empty box.
 *
 * The photographs repeat because only TWO exist: `assets/section 3` ships one
 * candid and one SEO frame (`Group 2087325405.png` and `...406.png` are the
 * same shot re-exported — 5 bytes differ across 2 MB). Drop more photos in and
 * they slot straight into this list.
 */

const CARDS = [
  {
    id: 'seo',
    role: 'SEO Specialist',
    note: 'Growth · Full-time',
    img: A.flock.wide,
    alt: 'A team member and an owl working together at a laptop',
    // The hearts belong to the PICTURE — beside the sitter and the owl — not
    // to the carousel. Flagged per card the same way `sparkles` is below, so
    // they travel with it as the row moves.
    //
    // `engineer` carries them too now: it runs the same `flock.wide` photo,
    // and having one copy marked up and the other bare read as the decoration
    // belonging to a slot rather than to the shot.
    hearts: true,
  },
  {
    id: 'motion',
    role: 'Motion Designer',
    note: 'Design · Full-time',
    img: A.flock.candid,
    alt: 'Two of the flock comparing notes over a laptop',
    sparkles: true,
  },
  {
    id: 'engineer',
    role: 'Full-stack Engineer',
    note: 'Build · Full-time',
    img: A.flock.wide,
    alt: 'A team member and an owl working together at a laptop',
    // Hearts here too, by request. It was the one card in the row carrying no
    // markup at all - `seo` has the hearts, `motion` and `ai` the sparkles -
    // which left a gap as the carousel came round. It shares `flock.wide`
    // with `seo`, so the same photo now gets the same treatment wherever it
    // appears rather than being marked up in one position and bare in
    // another.
    hearts: true,
  },
  {
    id: 'ai',
    role: 'AI Solutions Lead',
    note: 'AI Tech · Full-time',
    img: A.flock.candid,
    alt: 'Two of the flock comparing notes over a laptop',
    sparkles: true,
  },
]

/** SECTION 4 — careers, on the gold band, where the sky starts turning to dusk. */
export default function TheFlock() {
  return (
    <section
      id="the-flock"
      // White, not the lavender walk it used to carry. The gold plate only
      // covers the middle of this section, so that gradient was showing as a
      // purple strip above and below it — and both neighbours are white now,
      // which left this the only coloured band in the run.
      // `overflow-x-clip`, not `overflow-hidden`. The pilot has to reach UP
      // out of this section into the promise ribbon above it, which a plain
      // `overflow-hidden` forbade — but it still must not widen the page,
      // since both it and the gold plate deliberately run past the right
      // edge (measured: 266px of horizontal scroll the moment the clip came
      // off entirely). Clipping one axis buys both: horizontal bleed is cut,
      // vertical bleed is not.
      //
      // `clip` rather than `hidden` is load-bearing. Per spec, `overflow-x:
      // hidden` with `overflow-y: visible` computes the visible axis to
      // `auto` — so `overflow-x-hidden` here would silently re-clip the top
      // and put the pilot back inside. `clip` leaves the other axis alone.
      className="relative overflow-x-clip bg-white pb-28 pt-24 sm:pb-36 sm:pt-32"
    >
      {/* The gold band the cards sit on. Stretched rather than cropped: its top
          and bottom edges are torn into feathers, and `cover` would slice
          exactly those off — the shapes are organic enough that scaling the two
          axes independently does not read as distortion.
          Inset in rem, not per cent: the section is far taller on mobile, where
          a percentage put the torn edge straight through the heading. */}
      <div
        aria-hidden
        style={{ backgroundImage: `url(${A.goldPlate})` }}
        className="pointer-events-none absolute inset-x-[-2%] bottom-12 top-14 bg-[length:100%_100%] bg-no-repeat sm:bottom-14 sm:top-16"
      />

      {/* No pilot on the band's bottom-left scallop. It bled off the left edge
          by design, which meant it always read as a plane cut in half by the
          window rather than as one flying past. */}

      {/* The landing-screen pilot, crossing the white gap above the gold band
          rather than the band itself, where it would have fought the cards'
          own photography. Mirrored — `A.owl.front` faces right on its own
          plate, and pointed the other way its nose leads the direction it is
          travelling.

          Hung off the band's RIGHT shoulder with only a token bleed past the
          edge — `-4%` / `-3%` at `sm`, down from `-13%` / `-11%`. The old
          pair was measured as a fraction of the SECTION's width while the
          plane is sized as a fraction of it too, so at 1440 it put ~158px of
          a 580px plane outside the frame, and the fly-in below starts even
          further out again: the section is `overflow-x-clip`, so what the
          entrance actually showed was a plane being sliced down its length
          by the window edge and growing back out of it, rather than one
          flying in. Nearly all of it stays in frame now at every point in
          that flight.

          Lifted clear of the gold band, per the reference: there the plane
          flies ABOVE it, crossing the white gap and the promise ribbon in it,
          with daylight between its wheels and the band's torn top edge — not
          dipping into the gold the way `-top-36` had it.

          The two figures are that clearance worked back from the plate: it is
          NO `max-w` any more, and that removal is the point. This img's
          containing block is the section, which is the full window, so
          `w-[42%]` was already 42vw - and then a 580px ceiling sat on top of
          it and froze the plane solid: measured 580x380 at BOTH 1920 and
          1440, which is 30.2% of the window at one and 40.3% at the other.
          A pixel cap on a viewport-relative width is the one combination that
          cannot hold a composition together across zoom, because past the
          width where it bites the plane stops tracking the window entirely.
          At 28% with nothing capping it the plane is the same share of the
          screen at every width and every zoom level, which is what the
          reference shows.

          `right-[0vw]`, so the plane's own right edge lands ON the window's
          and the whole aircraft stays in frame. It was `-7vw`, pushed there
          to move it rightward, and that put its tail 94px past the edge at
          1340 - visibly sliced rather than bleeding. A decoration that leaves
          the frame reads as flying past; one that is cut through its middle
          reads as a rendering fault, and at this size the tail is most of it.

          28 rather than 42 because the reference draws this plane at about
          24vw against a ribbon 7.3vw tall - a ratio of a little over two -
          and this ribbon now stands 8.8vw, so the same ratio puts the plane
          near 28. `sm:-top-[20vw]` follows it into viewport units for the
          same reason a `-22rem` could not: a fixed reach is a different
          fraction of the screen at every size.

          667x437, so at `sm:w-[42%]` capped to 580px it stood 380 tall, and
          the band's own top edge sits at `top-16` (64px). Landing the plane's
          bottom ~40px above that edge puts its top at 24 - 380 = -356, hence
          `-22rem`. The base figure is the same sum at `w-[52%]` on a narrow
          window, where the plate is smaller and the band starts at `top-14`.

          Flies in on scroll: in from further right, nose down and banking,
          levelling out at its mark, rather than just appearing there.
          `scaleX` joins the `style` object rather than a `-scale-x-100`
          class since Motion writes the whole `transform` inline the moment
          ANY transform value animates — true here too, opacity alone still
          puts Motion in charge of the element's `transform`, and a
          class-based flip would be dropped the instant the fly-in runs. */}
      <motion.img
        src={A.owl.front}
        alt=""
        aria-hidden
        loading="lazy"
        draggable={false}
        style={{ scaleX: -1 }}
        initial={{ opacity: 0, x: 36, y: -30, rotate: 10 }}
        whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 1.1, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
        className="owl-shadow pointer-events-none absolute -top-[12.5rem] right-[-4%] z-10 w-[52%] select-none sm:-top-[20vw] sm:right-[0vw] sm:w-[28%]"
      />


      {/* `pt-32` drops the heading clear of the band's torn top edge — up
          from `pt-24`, which read as too close to it once the pilot above
          moved higher and left more open gold above the heading than below
          it. */}
      <div className="relative mx-auto max-w-6xl px-5 pt-32 sm:px-8">
        <Reveal y={36}>
          <h2 className="text-center font-ui text-[clamp(1.9rem,4.6vw,3.35rem)] font-bold leading-[1.08] text-plum-800">
            Join 1,000+ Owls
            <br className="hidden sm:block" /> Nesting With Us
          </h2>
        </Reveal>
      </div>

      {/* Full-bleed, deliberately outside the `max-w-6xl` column. Inside it the
          neighbours were being chopped off square at the container's edge; out
          here the row runs to the screen edges, so what trims them is the
          viewport itself and they simply carry on off-screen. */}
      <Reveal y={48} className="relative mt-12 w-full">
        <CardCarousel items={CARDS} label="Open roles at Planet Owl" renderItem={renderCard} />
      </Reveal>

      {/* The puff that reaches up into the ribbon, and every figure on it is
          `vw` now.

          It was `-top-[22.5rem] left-[-8%] w-[46%] max-w-[520px]` - a fixed
          rem for its reach, a share of the section for its position and a
          pixel ceiling on its width, so all three tracked different things
          and the composition came apart at any zoom. The ceiling is the worst
          of them: past the width where 46% exceeds 520px the cloud stopped
          growing entirely.

          It stays on the LEFT, bleeding off that edge - `left-[-8vw]`, the
          old `-8%` in the unit everything else here now uses.

          34vw, down from 46. At 46 it was 606px at 1318 and covered the
          first half of the ribbon, so "No chaos. No guesswork." read through
          a bank of grey instead of over a puff at the edge of it - the
          reference keeps it small enough that the words stay the subject.
          `-top` is 16.8vw: the height is a function of the width (1.495:1),
          so changing one moves the centre and the two have to be re-derived
          together rather than adjusted one at a time.

          22vw and level with the line, which is the third position this has
          been in and the one the other two were circling.
          At 46vw it crossed the band and greyed out the leading owl and the
          first words. Dropping it clear of the band fixed that but parked it
          in the white BELOW the ribbon, reading as a separate object rather
          than as weather on the line. The size was the real problem both
          times: at 22vw it is small enough to sit ON the line without
          covering anything, so it does not have to be moved out of the way.
          `-top-[24.8vw]` centres its 14.7vw height on the band's own middle. "Centred on
          No chaos. No guesswork." meant centred on the TEXT'S OWN LINE, not
          centred on the window; read the other way it put the puff in the
          middle of the band, which is not where it belongs. The vertical is
          what carries that: `-top-[31.5vw]` lifts it so its middle sits on
          the ribbon's middle instead of hanging below the words.

          `-top` and `w` are both `vw` so the reach scales with the window the
          way the pilot beside it already does. */}
      {/* A second pilot crossing the band's BOTTOM torn edge, into the white
          it hands off to next — the mirror of the one up top, on the LEFT
          shoulder this time rather than stacking both planes on the right.
          `A.owl.plane` (the side-angle cut), not `A.owl.front` again, so
          the two read as two different passes rather than one image
          repeated.

          Flies in now too, the mirror of the top pilot's own entrance:
          that one banks in from off the right, nose down and levelling out
          (`x:90,y:-30,rotate:10` → `0,0,0`); this one banks in from off the
          left, nose up (`x:-90,y:40,rotate:-10` → `0,0,0`), so the two read
          as arriving from opposite corners rather than one flying in while
          the other just fades in place. */}
      <motion.img
        src={A.owl.plane}
        alt=""
        aria-hidden
        loading="lazy"
        draggable={false}
        initial={{ opacity: 0, x: -90, y: 40, rotate: -10 }}
        whileInView={{ opacity: 1, x: 0, y: 0, rotate: 0 }}
        viewport={{ once: true, margin: '-10% 0px' }}
        transition={{ duration: 1.1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        // `-bottom-28`, down from `-bottom-16` — pushed an extra half inch
        // (48px, `-16`→`-28` on Tailwind's 4px scale) further below the
        // band, per direct feedback that it sat too high.
        className="owl-shadow pointer-events-none absolute -bottom-28 left-[-11%] z-10 w-[48%] max-w-[540px] select-none sm:left-[-9%] sm:w-[38%]"
      />
    </section>
  )
}

/**
 * Sits on top of the three sparkles already baked into `flock-candid` (see
 * the export note above `CARDS`), roughly over each one, so the twinkle
 * reads as those stars animating rather than as new ones appearing —
 * they cannot be animated in place since they are pixels in the one flat
 * photo, not separate layers. Only the two `sparkles: true` cards (the
 * ones actually shot on `flock-candid`) render these; the wide/SEO photo
 * has no baked stars to sit over.
 *
 * Percentages measured off `flock-candid.webp`'s own 822x614 canvas, so
 * they track the card at every breakpoint the carousel scales it to.
 */
const SPARKLES = [
  { left: '69.1%', top: '11.7%', size: '2.7%', delay: 0 },
  { left: '83.1%', top: '16%', size: '4.1%', delay: 0.6 },
  { left: '74.8%', top: '20.8%', size: '2.2%', delay: 1.2 },
]

function Sparkle({ left, top, size, delay }) {
  return (
    <motion.svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinejoin="round"
      aria-hidden
      className="pointer-events-none absolute text-plum-800"
      style={{ left, top, width: size, height: size }}
      animate={{ opacity: [0.25, 1, 0.25], scale: [0.7, 1, 0.7] }}
      transition={{ duration: 2.2, delay, repeat: Infinity, ease: 'easeInOut' }}
    >
      <path d="M12 3l1.6 5.4a2.5 2.5 0 0 0 1.7 1.7L21 12l-5.7 1.9a2.5 2.5 0 0 0-1.7 1.7L12 21l-1.9-5.4a2.5 2.5 0 0 0-1.7-1.7L3 12l5.4-1.9a2.5 2.5 0 0 0 1.7-1.7L12 3z" />
    </motion.svg>
  )
}

// No `overflow-hidden`, no `rounded-*`, and no box shadow on the figure — all
// three used to belong here and all three are wrong now that the exports ship
// whole. Each one is a rounded card with the sitter, the owl and the sparkles
// overhanging its top edge on transparency: a clip cut that overhang off
// (which is what lopped the sitter's head), the CSS rounding duplicated
// corners the alpha already has, and a box shadow drew a rectangle around the
// transparent overhang instead of following the card. The rounding now comes
// from the export itself and the shadow is a `drop-shadow` filter on the
// image, which follows the alpha silhouette.
function renderCard(card) {
  return (
    <figure className="relative m-0">
      {/* No forced aspect and no `object-cover` — the export is the card, so
          the natural image fills the width and nothing is cut.

          `draggable={false}` on the image and the pill: without it the
          browser's native drag hijacks the pointer and the carousel stops
          tracking half way through a swipe. */}
      <img
        src={card.img}
        alt={card.alt}
        loading="lazy"
        draggable={false}
        className="block w-full"
      />

      {card.sparkles && SPARKLES.map((s, i) => <Sparkle key={i} {...s} />)}

      {/* The pair of marker hearts, in the gold just above the card's top
          edge and right of the sitter's head, where the reference draws
          them. Percentages of the card's own box, like `SPARKLES` above, so
          they travel with this card and hold their spot at every width the
          carousel scales it to.

          They live in the plate's transparent OVERHANG — `flock-wide` only
          becomes opaque 27.2% of its height down, since the sitter and the
          owl bleed up out of the card — which is why a `top` of 14% puts
          them on the gold rather than on the photo. A previous pass placed
          them below that line, at 33%: correct markup, generated classes,
          both plates loading, and still nothing to see, because a 27px
          dark-purple outline on the sitter's dark hair is invisible. The
          reference puts them over the gold for the same reason.

          They draw themselves rather than fading in (see `DrawnDoodle`), the
          big one first and the small one a beat behind — the way a hand adds
          the second after finishing the first — then both keep blinking. The
          tilts are the reference's own: two hearts sitting bolt upright read
          as placed rather than drawn. */}
      {card.hearts && (
        <>
          <DrawnDoodle
            src={heartLg}
            delay={0.35}
            duration={0.85}
            twinkle
            style={{ rotate: -9 }}
            className="absolute left-[64%] top-[14%] w-[3.7%]"
          />
          <DrawnDoodle
            src={heartSm}
            delay={1.05}
            duration={0.6}
            twinkle
            style={{ rotate: 13 }}
            className="absolute left-[68.3%] top-[19%] w-[2.5%]"
          />
        </>
      )}

      {/* The caption sits ON the photo, not under it. It was a solid plum bar
          butted onto the image's straight bottom cut, which made every card two
          stacked blocks; the design runs the role and its button over the
          picture behind a scrim, so the card reads as one thing. The scrim
          opens fully transparent and only reaches strength behind the type, so
          it darkens what the words sit on without flattening the photo.

          `draggable={false}` on the image and the pill: without it the
          browser's native drag hijacks the pointer and the carousel stops
          tracking half way through a swipe. */}
      {/* The bottom corners are rounded HERE now, because the figure no
          longer clips. Measured off the exports' own alpha, the baked corner
          radius is 29px on an 822-wide card and 42px on a 1174-wide one —
          3.53% and 3.58% of width, so 3.55% covers both. A percentage
          `border-radius` would go elliptical on a box this short (it
          resolves against width and height separately), so the figure is
          restated in `vw` against each of the card widths the carousel sets
          below: 3.55% of 80/64/52/46vw. Without this the opaque foot of the
          scrim squared off the card's two bottom corners against the gold. */}
      <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-4 rounded-b-[2.84vw] bg-[linear-gradient(180deg,rgba(69,22,71,0)_0%,rgba(69,22,71,0.55)_38%,rgba(69,22,71,0.9)_100%)] px-6 pb-5 pt-14 sm:rounded-b-[2.27vw] lg:rounded-b-[1.85vw] xl:rounded-b-[1.63vw]">
        <span>
          <span className="block font-display text-lg font-semibold text-white sm:text-xl">
            {card.role}
          </span>
          <span className="text-sm text-plum-100/80">{card.note}</span>
        </span>
        {/* Teal, and "Join the Flock" — the card's own button in the design,
            not the page's gold primary. Gold is the site's one loud action
            (Start a Project, Build My World); a gold button inside every card
            of a carousel makes four of them shout at once, and none of them
            is the page's main action. */}
        <TealButton href="#start" draggable={false}>
          Join the Flock
        </TealButton>
      </figcaption>
    </figure>
  )
}
