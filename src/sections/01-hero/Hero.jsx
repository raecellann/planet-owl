import { useCallback, useRef, useState } from 'react'
import {
  motion,
  useMotionTemplate,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from 'motion/react'
import { A } from '../../lib/assets'
import Island from './Island'
import FloatingOwl from './FloatingOwl'
import { GoldButton } from '../../components/ui/Button'
import { useFinePointer, usePointerParallax } from '../../lib/usePointerParallax'

/**
 * Scroll and cursor parallax enabled. There is no idle flight any more — see
 * the note on `HERO_OWLS`.
 */
const HERO_MOTION = true

/**
 * The island's box, shared by the island itself and by both owl layers.
 *
 * Every width here is 15% up on what it was, which is what "make the island
 * bigger" costs: the owls are positioned and sized as percentages OF THIS BOX,
 * so growing it grows the whole composition together and none of their
 * placements have to be re-derived. It is allowed past `100vw` now — the
 * sticky wrapper clips, and an island whose edges run off the sides of the
 * window reads as bigger than one politely fitted inside them.
 */
const ISLAND_BOX =
  'absolute left-1/2 aspect-[1400/1322] ' +
  'top-[74svh] sm:top-[70svh] w-[min(207vw,calc(115svh_*_1.059))] ' +
  'lg:top-[clamp(34rem,40vw,38rem)] lg:w-[min(115vw,calc(104svh_*_1.059))]'

// Height for the full sticky scroll sequence
const HERO_HEIGHT = 'h-[300svh] lg:h-[300svh]'

/**
 * How far a click into the island pushes in. 2.6 is about as far as the plate
 * carries — it is a 1400px-wide render drawn at roughly the window's width, so
 * past this the buildings and the road start showing their own pixels.
 */
const ISLAND_ZOOM = 2.6

const WISP_FADE = '[mask-image:linear-gradient(90deg,#000_0%,#000_74%,transparent_99%)]'

/**
 * Each owl's own flight, which is now entirely a function of SCROLL.
 *
 * `rise` and `drift` are how far it travels across the sticky hero from the
 * top of the section to the bottom, in pixels; `spin` is the degrees it turns
 * over the same distance; `depth` is how strongly it answers the cursor
 * (nearer birds move more). Between them they are the whole of an owl's
 * movement.
 *
 * Every `w-[..]` is 72% of what it was, measured against the reference: the
 * flock is drawn there at roughly 15-19% of the island's width and this was
 * carrying 19-26%, about 40% oversized, which is what made the birds crowd
 * the building and read as badly placed rather than merely large.
 *
 * Each `left` and `top` moved with the width so every owl's CENTRE stayed
 * exactly where it was - the arrangement is the reference's, only the scale
 * was wrong. A width grows from its anchor rather than about its middle, so
 * shrinking one alone would have slid the whole flock right and down. The
 * `top` correction carries the box's own 1.059 ratio, since a width is a
 * share of the box's width and a top is a share of its height.
 *
 * (Historically: every width had been a third larger than the pass before,
 * and each `left` came back by half of that growth — a width grows to the RIGHT
 * from its anchor, so raising it alone would have slid the whole flock
 * sideways rather than just enlarging it. Tops are untouched: they grow
 * downward by a few per cent, which the composition has room for.
 *
 * There is deliberately no idle animation left. Each entry used to carry a
 * `bob`/`sway`/`tilt` trio plus a `duration` and `delay` that drove three
 * forever-loops per bird, so the flock drifted about on its own; the birds
 * hold still now and move only as the page is scrolled. See the note on
 * `FloatingOwl` for what came out.
 */
const HERO_OWLS = [
  // --- the arc across the top ----------------------------------------------
  {
    src: A.owl.tophat,
    alt: 'Owl in a top hat with a cane',
    className: 'left-[40.5%] top-[0.9%] w-[14%]',
    rise: -78, spin: 14, depth: 30,
  },
  {
    src: A.owl.pumpkin,
    alt: 'Owl wearing a pumpkin hat',
    className: 'left-[65.5%] top-[-2.1%] w-[14%]',
    rise: 44, spin: -14, depth: 18,
  },
  {
    src: A.owl.wizard,
    alt: 'Owl wizard with a star hat and wand',
    className: 'left-[17.6%] top-[3.9%] w-[18.7%]',
    rise: -68, drift: -24, spin: -7, depth: 28,
  },
  {
    src: A.owl.crown,
    alt: 'Owl wearing a golden crown',
    className: 'left-[84.7%] top-[4%] w-[19.7%]',
    rise: -58, drift: 34, spin: 10, depth: 24,
  },

  // --- the big one on the left flank ---------------------------------------
  {
    src: A.owl.flower,
    alt: 'Owl in a flower crown and scarf',
    className: 'left-[-0.3%] top-[23.2%] w-[20.6%]',
    rise: -50, drift: -30, spin: -9, depth: 22,
  },

  // --- the small ones flying low, in front of the island itself -------------
  {
    src: A.owl.flame,
    alt: 'Owl with a flaming crest',
    className: 'left-[15.4%] top-[54.3%] w-[11.2%]',
    rise: 50, spin: 12, depth: 16,
  },
  {
    src: A.owl.astronaut,
    alt: 'Owl in a space helmet',
    className: 'left-[40.4%] top-[61.7%] w-[8.4%]',
    rise: 62, drift: -16, spin: -10, depth: 8,
  },
  {
    src: A.owl.float,
    alt: 'Owl drifting on a duck float in the pond',
    className: 'left-[26.3%] top-[62.2%] w-[8.4%]',
    rise: 0, drift: 4, spin: 2, depth: 3,
  },
]

export default function Hero() {
  const sectionRef = useRef(null)
  const reduce = useReducedMotion()
  const frozen = reduce || !HERO_MOTION
  const fine = useFinePointer()
  const { px, py } = usePointerParallax(sectionRef, fine && !frozen)

  /**
   * Click a part of the island and the view pushes into THAT part; click again
   * and it settles back.
   *
   * What makes it land on the spot clicked rather than on the middle is the
   * transform origin: the click is stored as a percentage of the plate, and
   * scaling about that point holds it still on screen while everything else
   * grows away from it. Storing a percentage rather than the pixel position is
   * what keeps it correct if the window is resized, or as the hero's own
   * scroll scale carries on changing underneath.
   *
   * The rect is only ever read while zoomed OUT, which is why it can be taken
   * straight from `getBoundingClientRect` despite the parallax and scroll
   * transforms on the layers above: at rest those are the identity, and on the
   * way back out the click does not need a position at all.
   */
  const [zoom, setZoom] = useState(null)
  const toggleZoom = useCallback((e) => {
    // Read the geometry HERE, not inside the updater below: a state updater
    // runs during the next render, by which time React has cleared
    // `currentTarget` off the event and the rect could not be taken at all.
    const r = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - r.left) / r.width) * 100
    const y = ((e.clientY - r.top) / r.height) * 100
    // The same point twice, in two coordinate systems. `x`/`y` are percentages
    // of the ISLAND's own box, which is what the island and owl layers scale
    // about; `vx`/`vy` are percentages of the WINDOW, for the sky and cloud
    // layers, which are full-bleed and do not share that box. One pair used
    // for both would have pushed the background toward a different point than
    // the one the camera is actually flying at.
    const vx = (e.clientX / window.innerWidth) * 100
    const vy = (e.clientY / window.innerHeight) * 100
    setZoom((current) => (current ? null : { x, y, vx, vy }))
  }, [])

  /**
   * Spread onto the island layer AND both owl layers, so one click moves all
   * three as one camera push rather than zooming the ground out from under
   * the birds. They share `ISLAND_BOX`, so the same origin percentages
   * address the same point in each.
   *
   * `absolute inset-0` because the owls are positioned against their layer's
   * own box (`left-[40%] top-[-2%]` and so on) — a wrapper that did not fill
   * that box would re-base every one of them.
   */
  const zoomLayer = {
    className: 'absolute inset-0',
    style: { transformOrigin: zoom ? `${zoom.x}% ${zoom.y}%` : '50% 50%' },
    animate: { scale: zoom ? ISLAND_ZOOM : 1 },
    transition: frozen ? { duration: 0 } : { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  }

  /**
   * The same push, for the sky and the clouds behind the island — so the whole
   * view moves rather than the island growing against a background pinned flat
   * behind it.
   *
   * It takes a THIRD of the island's travel, not all of it. Two objects at
   * different distances do not move equally when a camera pushes in; the far
   * one moves less, and that difference is the only thing telling the eye they
   * are at different distances at all. Matched exactly, the sky would come
   * forward with the island and the scene would flatten into a poster being
   * enlarged.
   */
  const zoomBg = {
    style: { transformOrigin: zoom ? `${zoom.vx}% ${zoom.vy}%` : '50% 50%' },
    animate: { scale: zoom ? 1 + (ISLAND_ZOOM - 1) * 0.34 : 1 },
    transition: frozen ? { duration: 0 } : { duration: 0.85, ease: [0.16, 1, 0.3, 1] },
  }

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  
  const p = useSpring(scrollYProgress, { stiffness: 220, damping: 38, mass: 0.35 })

  const to = (...frames) => (frozen ? frames.map(() => frames[0]) : frames)

  // ---- Layer transforms ----
  const glowOpacity = useTransform(p, [0, 1], to(0.95, 0.1))

  // 260px, up from 80. The hero is three viewports of scroll, and 80px spread
  // over that distance is about a pixel of movement per 35 of scrolling —
  // present in the code, invisible on the screen, which is why the clouds read
  // as painted onto the sky. The far band drifts DOWN as the island climbs,
  // so the two are moving against each other rather than together.
  const farCloudY = useTransform(p, [0, 1], to(0, 260))
  const farCloudX = useTransform(p, [0, 1], to(0, -40))
  const farCloudOpacity = useTransform(p, [0, 1], to(0.75, 0.25))

  // The SKY PLATE — the photographed cloudscape behind everything, not the
  // cut-out wisps — travelling on scroll.
  //
  // Stated as a percentage of the plate's own height rather than in pixels,
  // because the plate is deliberately taller than the window it sits in (see
  // its `h-[136%]` below). That surplus is the whole trick: an image that
  // exactly fills its frame has nowhere to travel to, so moving it either does
  // nothing visible or drags a hard edge into view. It had 70px of travel
  // inside a box it filled exactly, which is why it read as pinned.
  //
  // -32% of a 152%-tall plate is 48.6% of the window — nearly half a screen
  // of travel, which is what it takes for a cloudscape this soft to read as
  // moving at all. Still inside the 52% of slack the taller plate provides,
  // so no edge can appear at the bottom, and the swell to 1.18 keeps that
  // margin growing rather than shrinking on the way up.
  const skyY = useTransform(p, [0, 1], to('0%', '-32%'))
  const skyScale = useTransform(p, [0, 1], to(1, 1.18))

  // FIXED: Increased scale to 1.5 to fit the screen, and massive pull-up (-110vh) to clear the mist completely.
  const islandYNum = useTransform(p, [0, 0.5, 1], to(0, -45, -110))
  const islandY = useMotionTemplate`${islandYNum}vh`
  const islandScale = useTransform(p, [0, 0.5, 1], to(0.75, 1.1, 1.5))
  const islandRotate = useTransform(p, [0, 1], to(0, -1.2))
  
  const islandMx = useTransform(px, (v) => v * 18)
  const islandMy = useTransform(py, (v) => v * 10)

  // Text fades out faster to clear the screen
  const textY = useTransform(p, [0, 0.3], to(0, -60))
  const textOpacity = useTransform(p, [0, 0.25], to(1, 0))
  const textBlur = useTransform(p, [0, 0.3], to(0, 7))
  const textFilter = useMotionTemplate`blur(${textBlur}px)`

  /**
   * The broom owl's approach — it flies straight at the camera and past it.
   *
   * `P_BROOM` is shared by every curve below so they stay one movement: the
   * same beats, different quantities. At rest the bird is BELOW the fold (the
   * island box hangs a long way past the bottom of the window, and this owl
   * sits 54% down that box); it climbs into frame through the first third
   * while the headline fades, and from there the flight is almost entirely
   * SIZE.
   *
   * That is what makes it read as an approach rather than a departure. A bird
   * coming at you barely moves across your field of view, it just gets
   * bigger — and it gets bigger faster the closer it is, because apparent
   * size goes as 1/distance. So an even approach is a curve that is nearly
   * flat at the start and near-vertical at the end, which is why the scale is
   * back-loaded: it gains 0.15x over the first third and 2.2x over the last
   * fifth.
   */
  const P_BROOM = [0, 0.35, 0.6, 0.73, 0.85, 1]

  /**
   * Four beats: climb in, hold the whole bird, zoom at the camera, leave.
   *
   * The ceiling in the middle is the point of the first half.
   *
   * 1.75 is the largest this owl can be drawn and still fit ENTIRELY inside
   * the window. Worked from its own box: the plate is 48% of an island box
   * that is `min(115vw, 104svh * 1.059)` wide, which at 1440x900 makes the
   * bird 476 x 357 at scale 1, sitting with its centre at 978px (the box is
   * centred on the window and the owl sits 76% along it).
   *
   * The figure is NOT 476 x scale, and that is the part worth writing down.
   * This owl carries a 9 degree `spin`, and a rotated rectangle covers more
   * of the screen than its own width: `w*cos(t) + h*sin(t)`. At the hold that
   * is 507 per unit of scale rather than 476, six per cent wider. Sized off
   * the unrotated width the peak came out at 1.9 and the bird's wing crossed
   * the right-hand edge by about 46px - the rotation had quietly eaten the
   * margin. At 1.75 the real, rotated box is 890 x 704 and spans 533 to 1423
   * of 1440, 98 to 802 of 900: inside on both axes with nothing touching an
   * edge. 1.85 is already through the side.
   *
   * Then it stops being a ceiling. Once the hold has done its job - p=0.6 to
   * 0.73, flat scale, flat everything, the one still thing in the hero - the
   * bird comes AT the lens: 1.75 to 3 over the next fifth, which puts a
   * 1551px box across a 1440px window. Being cropped is the whole idea by
   * then; it has already been seen whole, so filling the frame reads as the
   * owl arriving rather than as the owl not fitting.
   *
   * And 3 rather than the 4.6 this used to run to, because at 4.6 there was
   * no way out of the frame except dissolving. At 3 there is.
   *
   * It used to run to 4.6, which is why the whole bird was never actually
   * seen: by the time it was big enough to read it was wider than the frame,
   * so what you got was a head and two wing roots.
   *
   * The ceiling also means no sideways correction is needed to make it fit.
   * Bringing a 2.4x owl into frame would have meant pulling it left, back
   * toward the middle - the exact move that read wrong before.
   */
  const broomScale = useTransform(p, P_BROOM, to(0.8, 1.15, 1.75, 1.75, 3, 3.5))

  /**
   * Vertical travel, ending far past the window rather than easing to a stop.
   *
   * -90vh at p=0.55 is not a round number: it is what lands the owl's centre
   * on the middle of the window. Its resting centre is 1261px down (the box
   * top plus 73.2% of the box height) and the middle of a 900px window is
   * 450, so the lift is 811px - and because the box is sized in `svh` on
   * every breakpoint, that same -90vh lands mid-window at 1280x800 and
   * 1920x1080 too rather than only at the size it was measured on.
   *
   * Then it holds: -90 to -92 between p=0.55 and p=0.7, with the scale flat
   * at 1.9 across the same span. That pause is the beat where the whole bird
   * is on screen and still. Nothing else in the hero holds still, which is
   * what makes it read as the owl arriving rather than passing through.
   */
  const broomYNum = useTransform(p, P_BROOM, to(2, -30, -90, -92, -105, -180))
  const broomY = useMotionTemplate`${broomYNum}vh`

  /**
   * And then it leaves - by flying, not by fading.
   *
   * There is no opacity curve on this owl any more. It used to dissolve over
   * the last eighth of the hero because at 4.6x it covered the window and had
   * no way out; a fade is what you reach for when the thing cannot physically
   * leave the frame. At 1.9 it can, so it does: `x` goes from nothing through
   * the hold to 40 over the last third, and since this rides a wrapper INSIDE
   * the layer's own scale that is 40 x 2.3 = 92vw of actual travel. Together
   * with the -160vh the bird is clear of the window by about p=0.93, and the
   * sticky wrapper's `overflow-hidden` takes it from there - which also means
   * no invisible hitbox is left behind, the thing the fade needed a
   * `visibility` gate to clean up after.
   *
   * The whole schedule sits LATER than it did. It used to reach -45vh by
   * p=0.28 and be holding whole-body by 0.48, which put the bird up in the
   * frame while the island was still arriving - too early, and too much of
   * the hero spent with it already there. It now climbs to only -30vh by
   * p=0.35 (its top still near the bottom edge of the window) and does not
   * settle into the hold until 0.6. The exit moved with it, so the departure
   * still has the last quarter to play out in.
   *
   * Held at zero for the WHOLE hold, not just up to the start of it. It had a 0-to-2 ramp across that span, which sounds like
   * nothing and is not: 2 x the 1.75 scale is 3.5vw, and with the bird
   * already sitting 1423 into a 1440 window that 23px put its wing back
   * through the right-hand edge in the middle of the very beat that exists to
   * show the whole bird. Nothing moves between 0.55 and 0.7 now.
   *
   * So: it arrives, it sits, it goes.
   */
  const broomXNum = useTransform(p, P_BROOM, to(0, 0, 0, 0, 4, 40))
  const broomX = useMotionTemplate`${broomXNum}vw`

  /**
   * Past 1.8x this owl stops being clickable and drops its shadow.
   *
   * Clicks, because at the top of its approach one bird covers most of the
   * window and `FloatingOwl` re-opens `pointer-events-auto` on itself for its
   * click-zoom - a descendant opting back in beats the layer's
   * `pointer-events-none` - so every click meant for the island behind it
   * would land here instead.
   *
   * The shadow, because `owl-shadow` is a `drop-shadow` and a filter inside a
   * scaled layer scales with it: at 1.9x that is a 42px blur offset 46px
   * down, which stops reading as a shadow and starts smearing across the
   * island behind the bird.
   *
   * A threshold rather than a continuous value, so this re-renders twice
   * across the whole hero - React bails out on an unchanged `useState` value
   * - instead of on every scroll frame.
   */
  const [broomHuge, setBroomHuge] = useState(false)
  useMotionValueEvent(broomScale, 'change', (v) => setBroomHuge(v > 1.8))

  // -150, up from -30, and a bigger swell with it. This band is the nearest
  // thing in the scene, so it should have the LARGEST travel of anything —
  // it had the smallest.
  const nearCloudY = useTransform(p, [0, 1], to(0, -150))
  const nearCloudScale = useTransform(p, [0, 1], to(1, 1.28))

  return (
    <section id="home" ref={sectionRef} className={`relative ${HERO_HEIGHT}`}>
      
      {/* Sticky container locks the view during scroll */}
      <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
        
        {/* 1 · Sky Background */}
        <div className="absolute inset-x-0 top-0 h-full overflow-hidden">
          {/* Two transforms, two elements. The zoom drives `scale` through an
              `animate` prop while the scroll drives it through a motion value
              in `style`, and one element cannot hold both — whichever Motion
              settles on, the other silently stops working. Nesting composes
              them instead: the wrapper takes the click-zoom, the image takes
              the scroll parallax. */}
          <motion.div {...zoomBg} className="h-full w-full">
            {/* `h-[152%]` with `origin-top`: the extra 52% is the room the
                parallax runs through, hanging below the window where it is
                never seen except as the plate slides up past it. The taller
                the plate, the further it can travel before an edge shows —
                surplus height is the budget the whole effect spends. */}
            <motion.img
              src={A.sky}
              alt=""
              className="h-[152%] w-full origin-top object-cover object-top"
              fetchPriority="high"
              style={{ y: skyY, scale: skyScale }}
            />
          </motion.div>
        </div>

        <div className="pointer-events-none absolute inset-x-0 top-0 z-[5] h-[22svh] bg-[linear-gradient(180deg,rgba(86,35,84,0.16)_0%,rgba(86,35,84,0.05)_45%,rgba(86,35,84,0)_100%)]" />

        {/* Lavender bloom */}
        <motion.div
          style={{ opacity: glowOpacity }}
          className="pointer-events-none absolute left-1/2 top-[100svh] z-[6] h-[86vmax] w-[86vmax] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,rgba(197,166,232,0.5)_0%,rgba(197,166,232,0.16)_38%,rgba(197,166,232,0)_66%)] lg:top-[77.7vw]"
        />

        {/* 2 · Far Cloud Band */}
        <motion.div
          style={{ y: farCloudY, x: farCloudX, opacity: farCloudOpacity, ...zoomBg.style }}
          animate={zoomBg.animate}
          transition={zoomBg.transition}
          className="layer pointer-events-none absolute inset-x-0 top-[22svh] z-[8]"
        >
          <img src={A.cloud} alt="" className={`absolute -left-[16%] top-0 w-[40%] -scale-x-100 blur-[3px] ${WISP_FADE}`} />
          <img src={A.cloud} alt="" className={`absolute -right-[18%] top-[6%] w-[44%] blur-[4px] ${WISP_FADE}`} />
        </motion.div>

        {/* 3 · Headline
            `pointer-events-none` on this wrapper — it never carried it, and
            being a full-width, top-anchored box at `z-30` (above the flock's
            own `z-20`), it sat as an invisible hitbox over whatever owl
            happened to overlap its column: `tophat` and `pumpkin`, both
            positioned near the horizontal centre where this box's own
            `max-w-4xl` content sits, took the click meant for the owl
            underneath instead of ever reaching it. Fading via `opacity`
            doesn't help either — CSS opacity alone never disables pointer
            events, so even scrolled past and invisible this box was still
            capturing clicks. Re-opened on the button's own wrapper below,
            the one thing in here that actually needs to be clickable. */}
        <motion.div
          style={{ y: textY, opacity: textOpacity, filter: textFilter }}
          className="pointer-events-none absolute inset-x-0 top-0 z-30 flex justify-center px-6 pt-[13rem] sm:pt-[calc(2.92vw+12.25rem)]"
        >
          <div className="flex w-full max-w-4xl flex-col items-center text-center">
            <motion.h1
              initial={frozen ? false : { opacity: 0, y: 34 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="text-shadow-soft font-['Momo_Trust_Display'] text-[clamp(1.9rem,4.6vw,3.35rem)] font-normal leading-[1.1] text-plum-700"
            >
              Your Creative Work, Handled by a System of Geniuses.
            </motion.h1>

            <motion.p
              initial={frozen ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
              className="text-shadow-soft mt-[min(1rem,1.8svh)] max-w-xl font-ui text-[clamp(0.85rem,min(1.1vw,1.8svh),1.05rem)] font-normal leading-relaxed text-plum-600"
            >
              Every design is refined before it reaches you — so you get
              <br />
              faster output, cleaner results, and zero chaos.
            </motion.p>

            {/* `pointer-events-auto`, and it is load-bearing. The headline
                block above is `pointer-events-none` (see its own note — it is
                a full-width box at `z-30` that was swallowing clicks meant
                for the owls behind it), and that inheritance reaches this
                button too. The old note there claimed the events were
                "re-opened on the button's own wrapper below"; they were not,
                so this button had no hover and no click of its own — the
                pointer went straight through it to whatever sat behind,
                which since the island became clickable means a press here
                zoomed the island instead of following the link.

                `relative z-[60]` on top of that. `pointer-events-auto` only
                helps if nothing is sitting ON the button, and this hero
                stacks eight layers over each other — the cloud curtain
                (`z-[34]`), the foreground owl (`z-40`), the hand-off gradient
                (`z-[45]`) — several of which cover the middle of the screen
                where this sits. They all carry `pointer-events-none`, but one
                that ever loses it silently takes the hover with it, and the
                symptom (a button that looks right and does nothing) gives no
                clue which. Above all of them, that cannot happen. */}
            <motion.div
              initial={frozen ? false : { opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.62, ease: [0.16, 1, 0.3, 1] }}
              className="pointer-events-auto relative z-[60] mt-[min(1.25rem,2.2svh)]"
            >
              <GoldButton href="#what-we-do" className="h-[52px]">
                Peek Inside the Nest
              </GoldButton>
            </motion.div>
          </div>
        </motion.div>

        {/* 4 · The Island */}
        <motion.div
          style={{ x: '-50%', y: islandY, scale: islandScale, rotate: islandRotate }}
          className={`layer z-10 ${ISLAND_BOX}`}
        >
          {/* The zoom sits HERE, directly under the layer box, rather than on
              the picture inside — and the owl layers below carry the very
              same wrapper. All three layers share `ISLAND_BOX`, so one set of
              origin percentages means the same point in all of them, and the
              flock scales with the ground it is flying over instead of
              hanging in front of a magnified island at its own size.

              It is a separate transform from the scroll scale on the layer
              above, which is what lets the two coexist: the hero carries on
              rising and scaling with the scroll while this holds its own
              push-in about the point that was clicked. */}
          <motion.div {...zoomLayer}>
            <motion.div style={{ x: islandMx, y: islandMy }}>
              {/* A real button, not a div with a click handler: this is the
                  only way into the zoom, so it has to be reachable from the
                  keyboard and announce what it does. `block w-full` keeps it
                  the same box the plain `<img>` was. It no longer carries the
                  transform itself — it is just the hit area now. */}
              <motion.button
                type="button"
                onClick={toggleZoom}
                aria-pressed={Boolean(zoom)}
                aria-label={zoom ? 'Zoom back out of the island' : 'Zoom in on part of the island'}
                className={`block w-full ${zoom ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              >
                <Island className="h-auto w-full" />
              </motion.button>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* 5 · The Flock around the Island */}
        <motion.div
          style={{ x: '-50%', y: islandY, scale: islandScale }}
          className={`layer pointer-events-none z-20 ${ISLAND_BOX}`}
        >
          <motion.div {...zoomLayer}>
            {HERO_OWLS.map((owl) => (
              <FloatingOwl key={owl.src} progress={p} px={px} py={py} still={frozen} {...owl} />
            ))}
          </motion.div>
        </motion.div>

        {/* 6 · Foreground Owl — flies straight at the camera and past it.

            `transformOrigin` is the whole difference between an approach and
            a slide. Left at its default this layer scales about the CENTRE OF
            THE ISLAND BOX, and the owl sits well below and right of that
            point — so growing it also throws it down and to the right, which
            at 4.6x is most of a screen of sideways travel the flight never
            asked for. Anchored on the owl's own centre, scale does nothing
            but scale, and the bird grows where it already is.

            The figures are that owl's box read off its own classes below, and
            they hold at every breakpoint because all three are ratios of a
            box whose aspect is fixed: x is `left 52% + half of width 48%`;
            y is `top 54% + half of height`, the height being
            `48% × (box aspect 1.059) ÷ (image aspect 1.323)` = 38.4% of the
            box. */}
        <motion.div
          style={{
            x: '-50%',
            y: broomY,
            scale: broomScale,
            transformOrigin: '76% 73.2%',
          }}
          className={`layer pointer-events-none z-40 ${ISLAND_BOX}`}
        >
          <motion.div {...zoomLayer}>
            {/* `absolute inset-0` for the same reason `zoomLayer` carries it:
                a transform makes this the containing block for the owl's own
                `left-[52%] top-[54%]`, and a wrapper that did not fill the
                layer box would re-base it against nothing. */}
            <motion.div
              style={{ x: broomX }}
              className="absolute inset-0"
            >
              {/* `rise` and `drift` stay at zero: the whole flight lives on
                  the layers above, and these would have been a second, linear
                  copy of it pulling against the keyframed one.

                  `spin` is small now. It was 22 when the bird left sideways
                  and had a turn to bank into; something flying straight down
                  the lens has nothing to bank into, and a big roll on an
                  approach just reads as the picture being rotated.

                  `depth` came down from 42 for the same reason the scale
                  curve had to change — cursor parallax is applied inside the
                  layer's scale, so it is multiplied by it, and at the old
                  weight a 4.6x owl swam half a screen with the mouse. 24 puts
                  the screen-space movement back to about what it was. */}
              <FloatingOwl
                progress={p}
                px={px}
                py={py}
                still={frozen}
                src={A.owl.broom}
                alt="Owl riding a broomstick"
                className="left-[52%] top-[54%] w-[48%]"
                rise={0}
                drift={0}
                spin={9}
                depth={24}
                interactive={!broomHuge}
                shadow={!broomHuge}
              />
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Foreground Cloud Curtain — three cut-outs, along the bottom edge.

            A fourth used to sit centred under the waterfall, to give the fall
            something to pour into. It is gone: it was tall enough to reach up
            over the island's own underside, so what it actually covered was
            the rock and the hanging vines — the fall gained a landing and the
            island lost its silhouette. */}
        <motion.div
          style={{ y: nearCloudY, scale: nearCloudScale }}
          className="layer pointer-events-none absolute inset-x-0 bottom-0 z-[34] h-[52svh] origin-bottom"
        >
          <img src={A.cloud} alt="" className={`absolute -left-[9%] top-[14%] w-[44%] -scale-x-100 opacity-95 ${WISP_FADE}`} />
          <img src={A.cloud} alt="" className={`absolute left-[27%] top-[30%] w-[38%] opacity-80 ${WISP_FADE}`} />
          <img src={A.cloud} alt="" className={`absolute -right-[11%] top-[10%] w-[46%] opacity-95 ${WISP_FADE}`} />
        </motion.div>

        {/* Hand-off transition gradient */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[45] h-[22svh] bg-[linear-gradient(180deg,rgba(238,243,251,0)_0%,rgba(238,243,251,0.72)_55%,#eef3fb_100%)]" />
      
      </div>
    </section>
  )
}