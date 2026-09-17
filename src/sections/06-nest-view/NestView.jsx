import { useEffect, useRef } from 'react'
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from 'motion/react'
import { A } from '../../lib/assets'

/**
 * The cave plate's own proportions. `UpdatedCave.png` replaced the original
 * 3884x4378 export with a re-rendered 1057x1192 plate — same twig-nest
 * composition, taller opening — and the panel is cut to whichever plate is
 * current so the file lands whole and full-bleed. See the note on the panel
 * itself.
 */
const CAVE_RATIO = 'aspect-[1057/1192]'

/**
 * Where the cave's opening sits. Measured off `UpdatedCave.png`'s own alpha
 * channel: the hole runs 8.6-93.9% across and 31.3-75.8% down, centred on
 * (51.3%, 53.5%) — wider at the bottom than the original plate's hole, which
 * sat 31.9-68.9%.
 *
 * The panel is cut to the plate's own ratio, so the image is drawn 1:1 with
 * its box and the file's own percentages ARE the panel's percentages, at
 * every window shape.
 */
const HOLE = { x: '51.3%', y: '53.5%' }

/**
 * A soft border on all four sides of the city plate, so none of its own edges
 * can ever draw a line across the shot. The outer 7% vertically and 6%
 * horizontally dissolve; the middle is untouched.
 */
const FADE_EDGES =
  'linear-gradient(180deg,transparent 0%,#000 7%,#000 93%,transparent 100%),' +
  'linear-gradient(90deg,transparent 0%,#000 6%,#000 94%,transparent 100%)'

/** The three points every layer is keyed on: entering, framed, emerging. */
const BEATS = [0, 0.45, 1]

/**
 * The flight, as fractions of this section's own scroll rather than seconds.
 *
 * `useScroll` here runs `start end` -> `end start`: 0 when the section's top
 * reaches the bottom of the window, 1 when its bottom leaves the top. So the
 * numbers below are places on the page, and the whole sequence is scrubbed by
 * the visitor rather than played at them.
 *
 * The moves OVERLAP, deliberately. Run strictly one after another (the jet
 * finishing entirely before the camera started) the shot read as two separate
 * events with a seam between them; the plane grew, stopped, left, and only
 * then did anything else happen. The push now opens at 0.28, while he is
 * still coming at the camera, so the background is travelling with him and
 * his exit happens across a scene already in motion:
 *
 *   OWL    the jet comes at the camera and grows
 *   PUSH   the camera travels in toward the tower — starting WHILE he is
 *          still growing, so the two are one move rather than two
 *   OWL_GO he banks away left, clearing the frame the camera is entering
 *   CLOSE  a long cross-dissolve — 0.76 to 0.97, a fifth of the whole track.
 *          It overlaps the last of the push on purpose. Top Secrets sits
 *          BEHIND this frame, so the dissolve is the only stretch where its
 *          gold heading and the blurred tower are both on screen, and that
 *          double exposure is the effect: too short and the heading simply
 *          appears once the picture has gone, which is a cut with extra
 *          steps.
 *   REVEAL Top Secrets is mounted behind it (once — see `revealed`)
 *
 * `REVEAL_AT` (0.6) fires BEFORE the dissolve starts (0.82), not during it.
 * Top Secrets is mounted behind the pinned frame, so what the fade uncovers
 * is that section's own heading over the thinning tower — and it can only
 * uncover something that is already there. Mounted at 0.9, as it was, the
 * first third of the dissolve had nothing behind it and the shot faded toward
 * an empty screen before the heading arrived late into it.
 *
 * Mounting early costs nothing visible: the shot is still fully opaque at
 * 0.6, so the section goes into the page underneath a picture that completely
 * covers it.
 */
const OWL = [0.12, 0.38]
const OWL_GO = [0.38, 0.52]
/**
 * The push now FINISHES at 0.78, not 0.86.
 *
 * The arrival was landing on the same frame the hand-off began on: the pane
 * fills the window at the end of the travel and the cover reaches full
 * opacity there too, so the shot reached its destination and left it in the
 * same instant. Nothing was wrong with the geometry - there was simply no
 * dwell, and on anything but a slow scroll the filled doorway was never
 * actually on screen.
 *
 * Ending at 0.78 leaves the last fifth of the pin holding a solid, filled
 * frame before the panel lets go. The push itself is not slower, it is
 * earlier; every other layer keyed on PUSH moves up with it.
 */
const PUSH = [0.28, 0.78]
const CLOSE = [0.76, 0.97]
const REVEAL_AT = 0.6

export default function NestView({ onReveal }) {
  const reduce = useReducedMotion()

  /**
   * The flight out, driven by SCROLL rather than by a click.
   *
   * It used to be a one-shot timeline: click the plane, lock the page, play a
   * 6s sequence, jump-scroll to Top Secrets behind an opaque veil. That put
   * the whole reveal behind a control the visitor had to find, and it took the
   * page away from them while it ran. Now the section's own scroll progress IS
   * the timeline — the camera pushes into the window as you come down the
   * page, the dark closes over it, and Top Secrets is mounted underneath by
   * the time it clears.
   *
   * `onReveal` is still what mounts the next section (in `App`), and it still
   * only ever fires once: `revealed` latches, so scrolling back up cannot
   * un-mount a section that has already been disclosed.
   */
  /**
   * Measured over the PINNED TRAVEL, not the section's whole pass.
   *
   * `['start end', 'end start']` on the section runs 0 from the moment its top
   * appears at the bottom of the window to 1 when its bottom leaves the top —
   * which is a much longer stretch than the panel is actually held for. The
   * sequence was therefore still finishing after the sticky frame had let go,
   * so the last of the fade played while the frame was sliding away and you
   * caught the seam between it and Top Secrets below.
   *
   * `['start start', 'end end']` on the TRACK is exactly the pin: 0 the frame
   * the track's top meets the top of the window (where the panel locks), 1 the
   * frame its bottom meets the bottom (where it lets go). Everything from the
   * owl to the fade now happens inside that window, and by the time the frame
   * releases the screen has been solid `#140c0a` for the last few per cent —
   * the same colour as the section it hands to, so there is no seam left to
   * see.
   */
  const trackRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })
  const p = useSpring(scrollYProgress, { stiffness: 190, damping: 40, mass: 0.4 })

  const revealed = useRef(false)
  useEffect(
    () =>
      p.on('change', (v) => {
        if (v < REVEAL_AT || revealed.current) return
        revealed.current = true
        onReveal?.()
      }),
    [p, onReveal],
  )

  const at = (...frames) => (reduce ? frames.map(() => frames[1]) : frames)

  /** Where the camera has finished walking its target into the middle. */
  const PAN_ENDS = PUSH[0] + (PUSH[1] - PUSH[0]) * 0.6

  // --- the shot ------------------------------------------------------------
  // The push-in stays SHARP until the very end of its travel; the blur belongs
  // to the last of it, where the frame is already an abstract close-up. Same
  // shape the click version had, re-expressed against scroll.
  // The push ARRIVES at the pane now instead of merely aiming at it.
  //
  // `transformOrigin` has always been the marked rectangle on the glass
  // facade - 86x90px at x 2272-2358 of a 3951px plate - but the travel
  // stopped at 4.4x, where that pane still covers only 10.7% of the window.
  // The shot was pointed at a door it never reached.
  //
  // The pane is 2.42% of the box's width once `object-cover`'s crop is
  // accounted for, so 41x is the scale at which it exactly fills the frame.
  // 44 carries it just past, which matters for the hand-off: the pane is flat
  // dark, so the last of the push resolves to a full screen of #140c0a - the
  // exact value Top Secrets opens on. The dissolve then has nothing to show
  // an edge against, because by the time it runs there is no picture left in
  // frame, only the inside of the doorway.
  //
  // Four stops, not three. Apparent size goes as 1/distance, so an even
  // approach is nearly flat early and near-vertical at the end; spread evenly
  // the last stretch would crawl while the first raced.
  const cityScale = useTransform(
    p,
    [
      PUSH[0],
      PUSH[0] + (PUSH[1] - PUSH[0]) * 0.55,
      PUSH[0] + (PUSH[1] - PUSH[0]) * 0.82,
      PUSH[1],
    ],
    at(1, 2.6, 9, 60),
  )

  /**
   * The door has NO scale of its own, and that is the point.
   *
   * It was given one (6.2x) so the photograph would not have to be pushed as
   * far - a 3951px plate at 44x with a 14px blur is a lot of raster, and the
   * frame timing through the push was poor. But a rectangle growing under its
   * own transform does not read as a camera arriving at a door; it reads as a
   * square inflating on top of the picture, because it is moving in a way
   * nothing around it is. The eye catches the second motion immediately.
   *
   * So the push carries it, as it must: 41x is the scale at which the pane
   * (2.42% of the box once `object-cover`'s crop is accounted for) exactly
   * fills the frame, and the door simply grows with everything else. One
   * camera move, one motion.
   *
   * The cost is real and unresolved - see the blur below, which is the part
   * that was trimmed to pay for it.
   */


  // The blur earns its keep at this scale: 44x magnifies the plate's own
  // pixels about 17x, and while the pane itself is flat dark (nothing to
  // pixelate), its edges and the glass around it would crawl. Ramping it
  // through the last third hides that and reads as the lens losing the
  // surface as it arrives.
  const cityBlurPx = useTransform(p, [PUSH[0], PUSH[0] + (PUSH[1] - PUSH[0]) * 0.66, PUSH[1]], at(0, 0.5, 6))
  const cityFilter = useTransform(cityBlurPx, (v) => `blur(${v}px)`)

  // The pan, and it is what makes this a camera move rather than an
  // enlargement.
  //
  // Scaling about an origin holds THAT POINT still on screen — everything
  // grows away from it, but it never comes any closer to the middle of the
  // frame. So the pane stayed up and right where it started while the city
  // swelled around it, which reads as the picture inflating rather than the
  // view travelling toward something.
  //
  // The pane sits at 59.55% / 34.3% of the box, so sliding the box by the
  // difference between that and dead centre — -9.55% across, +15.7% down —
  // walks it into the middle of the frame as the push finishes. Percentages
  // in a Motion translate are of the element's OWN size and are applied
  // before the scale, so these are exactly the on-screen fractions they say.
  //
  // The pan finishes at 60% of the push, not at the end of it. Spread over the
  // whole travel, the pane is still drifting toward the middle at the exact
  // moment the shot is supposed to have arrived — so the last of the zoom
  // happens on a target that is still sliding. Centred early, the remaining
  // travel is a straight push into a pane that is already where it belongs.
  const cityX = useTransform(p, [PUSH[0], PAN_ENDS], at('0%', '-9.55%'))
  const cityY = useTransform(p, [PUSH[0], PAN_ENDS], at('0%', '15.7%'))

  // The cave comes forward too, but at a fraction of the city's rate: 1.35
  // against 4.4, about a thirtieth of the travel.
  //
  // Held perfectly still (as it was) the opening never changes size, so the
  // city appears to zoom BEHIND a fixed mask and the shot reads as a
  // photograph being enlarged in a window rather than a camera flying at
  // something. Given the city's own scale it becomes a wall of blurred bark
  // filling the screen, which is what it did when they last shared a
  // transform. A small push is the difference: the opening widens as you
  // approach it, the twig frame stays a frame, and the branch above never
  // gets passed.
  //
  // Scaled about the HOLE, not the plate's middle, so what grows is the
  // opening rather than the whole nest sliding off its own centre.
  // Back to 1.35, having tried 2.2.
  //
  // 2.2 was an attempt to make the background "follow" the push - at 1.35
  // against the city's 4.4 the opening barely moves, which can read as the
  // picture swelling inside a frame that stays put. But half the city's rate
  // is enough travel to make the BRANCH ITSELF read as moving, and a frame
  // that visibly slides is worse than one that sits still: the eye reads it
  // as the nest drifting rather than as the camera advancing, and it makes
  // the whole push look unsteady.
  //
  // So the small figure stands. The opening widening is not what sells this
  // shot - the city's own 4.4x is - and the frame's job is to stay a frame.
  const caveScale = useTransform(p, [PUSH[0], PUSH[1]], at(1, 1.35))

  /**
   * The last of the dive is a flat cover, because the door cannot do it alone.
   *
   * The synthetic pane is 1.8% x 2.75% of the city box, and the box is the
   * panel's width by 61% of its height - so at the push's 41x it opens out to
   * 74% of the frame's width and 69% of its height. It never closes over. The
   * plate stays visible AROUND it, which is what was still drawing lines at
   * the hand-off no matter how many of its own edges were masked.
   *
   * The push goes to 60x now, which IS the scale that closes it over - 108%
   * of the frame's width and 101% of its height - so the cover is no longer
   * doing the covering. It only cleans up the last sliver, and it waits until
   * 93% of the travel to do it.
   *
   * It used to start at 82%, and that was the bug behind "it only zooms in
   * this far": the flat colour was fading up over the final fifth of the
   * push, so the part of the zoom that actually arrives at the door was
   * happening behind it and never seen.
   *
   * It is invisible as a transition because there is nothing to transition
   * BETWEEN - the door it covers, the cover itself and Top Secrets' own
   * ground are all #140c0a. By the time the panel lets go, the window has
   * been solid section colour for a while.
   *
   * Driven by `scrollYProgress`, NOT by `p` — the one thing here that is.
   *
   * `p` is a spring, so it lags the scroll. Everything else in the dive wants
   * that: it is what makes the camera feel weighted. But the STICKY PIN
   * releases on the real scroll position, not on the spring, so on a fast
   * flick the panel slides away while the spring is still somewhere in the
   * middle of the push — and what slides away is a half-finished dissolve
   * with the plate's edges in it. That is the seam that only shows when you
   * scroll quickly.
   *
   * On the raw value the cover is fully opaque at exactly the scroll position
   * where the pin lets go, however fast that position is reached. The push
   * behind it can lag as much as it likes; it is covered by then.
   *
   * Three frames so reduced motion resolves to the FRAMED value (0) rather
   * than pinning the cover permanently on.
   */
  const coverOpacity = useTransform(
    scrollYProgress,
    // A fourth stop at 1 that HOLDS. Three stops ending at `PUSH[1]` left the
    // cover's value undefined-by-intent past the push, and measured it came
    // back down again - 0.91 just after the push and 0.002 by the end of the
    // pin, fading out exactly when it is most needed. Carrying the last value
    // explicitly to 1 makes the hold a stated thing rather than something
    // relied on from clamping behaviour.
    [PUSH[0], PUSH[0] + (PUSH[1] - PUSH[0]) * 0.88, PUSH[1], 1],
    at(0, 0, 1, 1),
  )

  // Where the PANEL sits in the pinned frame, and it moves during the push.
  //
  // At rest it is hung on the cave's opening (53.5% down the plate) — that is
  // what the visitor should be looking at while the owl is still in shot. But
  // the pane the camera flies at is higher up: the city box starts 23% down
  // the panel and stands 61% tall, and the pane is 34.3% down THAT, which
  // works out at 23 + 0.343 x 61 = 43.9% of the panel.
  //
  // Sliding from one to the other over the push ends with the pane itself in
  // the middle of the frame. Both figures are percentages of the PANEL, so
  // this holds at any window shape — which is the point. Fixed, the pane's
  // final position depended on how tall the window happened to be against a
  // panel of fixed ratio, so the shot framed up differently on every screen.
  const panelY = useTransform(p, [PUSH[0], PAN_ENDS], at('-53.5%', '-43.9%'))

  // The dark pane on the glass facade — the doorway — opening.
  //
  // The plate ships with that pane marked, and it is the whole mechanic: the
  // camera flies at one lit window, and the window is the way in. Drawn as a
  // real element rather than left painted into the picture, it can do what a
  // painted rectangle cannot — grow. It lives INSIDE the city box, so the
  // push-in carries it along and it stays locked to the building while the
  // building rushes toward camera; then its own scale takes over and it opens
  // out until it is the whole frame.
  //
  // 34, not the 70-odd it takes to cover the window outright — and up from
  // 26 only because the pane itself shrank, so it needs proportionally more
  // growth to reach the same size on screen. The pane no longer
  // has to BE the cover — the camera arrives at it, it opens to roughly the
  // size of the frame, and the fade below carries the rest. Growing a single
  // rectangle until it swallowed everything meant the last second of the shot
  // was a black shape expanding, which is a wipe; arriving somewhere and
  // dissolving is a cut.
  // The door does not open any more, and nothing grows.
  //
  // It has been a rectangle scaling to 26, then 34, then 120 — each pass
  // trying to make one painted shape swallow the frame, and each one reading
  // as a black square inflating over a photograph rather than as arrival.
  // The pane stays exactly what it is: a dark window on a building, the thing
  // the camera flies at. What ends the shot is the fade.

  // No heading painted into this transition any more.
  //
  // It existed to bridge a hard cut: the old sequence went fully dark, mounted
  // Top Secrets behind the dark, and jumped the page to it, so a copy of that
  // section's heading was faded in over the cover to carry the moment. There
  // is no cut left to bridge — the frame dissolves into the section's own
  // colour and the real heading is right there underneath — and every attempt
  // to time the copy's exit against the real one's arrival left the two on
  // screen together. Two identical headings is a worse fault than a plain
  // dissolve, and the plain dissolve is what the shot wanted anyway.

  // The fade into Top Secrets. An OPACITY ramp over the whole pinned frame,
  // not a shape growing across it: the pane's job ends once the camera has
  // arrived at it, and what takes the screen from there is the next section's
  // own dark coming up over the whole picture at once.
  //
  // It is the same `#140c0a` Top Secrets is painted in, and that section is
  // mounted behind this by `REVEAL_AT` (0.90) — so at full opacity the frame
  // is already showing what is underneath it in every respect but name, and
  // scrolling on simply carries you into it.
  // Full dark lands ON the pin's release (p = 1), not before it. Finishing
  // early left a stretch of held black at the end of the track — the shot was
  // over, the screen was blank, and Top Secrets still needed more scrolling to
  // arrive. Ending exactly where the frame lets go means the last frame of the
  // pin and the first frame of the next section are the same colour, so
  // scrolling on carries you straight into the heading rather than through a
  // pause first.
  // The shot DISSOLVES, and what is behind it is the next section itself.
  //
  // Every earlier version faded a dark rectangle IN over the top: the screen
  // went black, and Top Secrets turned up afterwards, further down the page.
  // Here the panel's own opacity goes to 0 while the section sits behind the
  // pinned frame (see `App`, which pulls it up by a viewport), so the city
  // and the cave thin out and the heading is simply there underneath — in
  // place, at full size, with nothing handed over.
  const shot = useTransform(p, [CLOSE[0], CLOSE[1]], at(1, 0))

  // The pilot, and he goes FIRST — the whole of `OWL` is his, with the city
  // sitting still behind him (`PUSH` does not start until 0.52). He grows
  // toward camera to 3.2x, holds that size for the moment it takes to read
  // him, then banks away left across `OWL_GO` and is gone before the camera
  // begins moving at all. Running the two together, as this did, meant the
  // plane was shrinking into a background that was itself rushing forward,
  // and neither move could be seen for the other.
  const owlFlyX = useTransform(p, [OWL[0], OWL[1], OWL_GO[1]], at('0%', '-6%', '-500%'))
  const owlFlyY = useTransform(p, [OWL[0], OWL[1], OWL_GO[1]], at('0%', '6%', '26%'))
  // He carries on GROWING as he leaves rather than easing back down. His
  // exit overlaps the start of the city's push (`OWL_GO` runs to 0.58,
  // `PUSH` opens at 0.52), and for those frames the two have to be doing the
  // same thing: a plane shrinking while the scene behind it rushes forward
  // reads as him falling away from the camera instead of the camera coming
  // through with him.
  const owlFlyScale = useTransform(p, [OWL[0], OWL[1], OWL_GO[1]], at(1, 3.2, 5))
  const owlFlyRotate = useTransform(p, [OWL[0], OWL[1], OWL_GO[1]], at(0, 3, 16))

  // --- branch · slowest ----------------------------------------------------
  const branchY = useTransform(p, BEATS, at('-34%', '-29%', '-24%'))
  const branchScale = useTransform(p, BEATS, at(1, 1.02, 1.06))

  // The cave and the city no longer transform. Both were being scaled and
  // slid to fake depth against a crop; the plate is drawn whole and in place
  // now, and moving it would only crop it again from the other direction.

  // --- owl · fastest -------------------------------------------------------
  // `y` is a percentage of the panel, and cutting the panel to the cave's ratio
  // took it from 792px tall to 1623 at 1440 wide — so the old 13/-15 pair, set
  // against the short panel, became a 211px swing where it had been 103 and
  // carried the plane up behind the navbar. Halved, so his travel across the
  // window is what it was. `x` is untouched: it resolves against the panel's
  // WIDTH, which has not changed.
  const owlX = useTransform(p, BEATS, at('-4%', '0%', '3%'))
  const owlY = useTransform(p, BEATS, at('6%', '0%', '-7%'))
  const owlScale = useTransform(p, BEATS, at(0.82, 1, 1.34))
  const owlRotate = useTransform(p, BEATS, at(-5, 0, 4))


  // The `tail*` transforms went with the hand-off branch they drove.

  return (
    /**
     * A PINNED section: a tall scroll track with the panel held in the window
     * while the visitor scrolls through it.
     *
     * This is the fix for the one problem every other pass kept running into.
     * The panel is cut to the cave plate's ratio, so at 1270 wide it stands
     * roughly 1430px tall — two and a half times an ordinary window. In normal
     * flow that means scrolling MOVES PAST the artwork: you get the twigs, then
     * the opening, then the floor, and the push-in plays on a box that has
     * already left the screen. Every complaint about the zoom "not happening"
     * or arriving as blurred bark was really the scroll walking down a picture
     * taller than the frame.
     *
     * Pinned, scroll no longer moves the picture at all — it drives the shot.
     * The track's height is what the sequence has to spend, and 200svh is
     * enough for the owl, the push and the pane's opening with nothing left
     * over. It was 260, which bought a stretch of black at the end where the
     * shot had finished and the next section had not yet been scrolled to.
     */
    <section
      id="nest-view"
      aria-label="Flying out of the nest"
      /**
       * This padding is the room the branch bleeds into, so it is measured
       * against the branch rather than picked.
       *
       * The plate is 1800x863, so its height is 0.4794 of whatever width it is
       * drawn at, and that width steps down per breakpoint (200 / 160 / 140 /
       * 130 / 125 per cent). It hangs off the track's top by `branchY`, whose
       * middle beat is -29% of its own height — so the reach above the track
       * is `width% x 0.4794 x 29%`, which is the first term in each value
       * below. The `2rem` on top of it is the gap itself.
       *
       * It does not read as a white band: the branch fills nearly all of it.
       * That is the point — it grows with the branch, so the clearance under
       * the wizard holds at every width.
       */
      className="relative z-10 w-full pt-[calc(27.8vw+2rem)] sm:pt-[calc(22.2vw+2rem)] lg:pt-[calc(19.5vw+2rem)] xl:pt-[calc(18.1vw+2rem)] 2xl:pt-[calc(17.4vw+2rem)]"
    >

      {/* The white only covers the branch's clearance, not the whole section.
          It used to be `bg-white` on the section itself, which painted behind
          the pinned frame too — and the frame has to be see-through at the end
          of the shot, because what is behind it is Top Secrets. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[calc(27.8vw+2rem)] bg-white sm:h-[calc(22.2vw+2rem)] lg:h-[calc(19.5vw+2rem)] xl:h-[calc(18.1vw+2rem)] 2xl:h-[calc(17.4vw+2rem)]"
      />

      <div ref={trackRef} className="relative h-[200svh]">

        {/* 4 · the branch, anchored to the TRACK's top and bleeding up into
            the section's padding above it.

            Three placements, and the difference matters. Inside the panel it
            was cropped away by the pin. Moved out to the section it was
            visible again but hanging off the section's own top edge, so its
            `branchY` of -29% reached straight up into the wizard standing in
            the section above. Here it hangs off the track, and the section
            carries top padding sized to exactly that reach — so the bleed
            lands in empty page, which is what the padding is FOR.

            `z-40` keeps it over the pinned frame for the moment they meet. */}
        <motion.div
          aria-hidden
          style={{ x: '-50%', y: branchY, scale: branchScale }}
          className="pointer-events-none absolute left-1/2 top-0 z-40 w-[200%] max-w-none origin-top select-none sm:w-[160%] lg:w-[140%] xl:w-[130%] 2xl:w-[125%]"
        >
          <img
            src={A.nest.branch}
            alt=""
            loading="lazy"
            decoding="async"
            className="w-full [mask-image:linear-gradient(180deg,#000_0%,#000_58%,transparent_92%)]"
          />
        </motion.div>
        <div className="sticky top-0 h-[100svh] w-full overflow-hidden">
          {/* Centred on the HOLE rather than on the panel's own middle: the
              opening sits 53.5% down the plate, and it is what the visitor
              has to be looking at for the whole sequence. The panel overflows
              the frame top and bottom and is clipped — the branch above and
              the nest floor below are off-screen while pinned, which is the
              price of holding the opening still. */}
          <motion.div
        // No `scale` here any more — this panel is the CAVE (plus the
        // branch above it), and it used to carry the same zoom the city
        // gets, which scaled the twig frame right along with the background
        // behind it. The cave is meant to stay put: it is the
        // window the camera is looking THROUGH, not part of the scene
        // being pushed into. `transformOrigin` is left set at the hole as
        // a statement of where this panel's centre of interest is, but
        // nothing animates off it any more — the zoom lives entirely on the
        // city layer inside, which has its own `scale` and its own
        // `transformOrigin` on the window in the tower.
        style={{ opacity: shot, x: '-50%', y: panelY, transformOrigin: `${HOLE.x} ${HOLE.y}` }}
        className={`absolute left-1/2 top-1/2 w-full bg-[#140c0a] ${CAVE_RATIO}`}
      >
        {/* INNER CLIPPED CONTAINER FOR BACKGROUNDS */}
        {/* The cave does NOT scale. It is the window the camera looks
            THROUGH, not part of the scene being travelled into — so the push
            lives on the city box inside, and the twig frame holds its size
            around it.

            It was briefly moved out here, onto the box holding both plates,
            so the frame would come at the camera too. At a 4.4x push that
            turned the nest into a wall of blurred branches filling the whole
            window — the zoom ran straight past the branch and out the other
            side of it, and what should have been a flight through an opening
            became a close-up of bark. */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          {/* 1 · the city, underneath — seen only through the cave's opening,
              which is a genuinely transparent hole in the plate above rather
              than a CSS clip.

              Sized to the OPENING, not to the panel. Covering the whole panel
              with a landscape 1.336 photo would crop it to a narrow vertical
              slice, throwing away the sky and the flanking buildings — the
              hole only runs 31.3-75.8% down `UpdatedCave.png`, so the photo
              never needs to fill the rest.

              This box runs 23-84%, which covers the (taller) new opening top
              and bottom with margin to spare. The sky, the domes and the trees
              on both flanks all land inside the opening.

              It carries the ONLY push-in left in this scene — the panel
              above used to scale the whole composed picture, cave and branch
              included, which zoomed the twig frame right along with the
              background it was meant to be a static window onto. That scale
              is gone; this box's own zoom is what makes the city specifically
              the thing rushing toward camera, while the cave stays exactly the
              size it always was. */}
          <motion.div
            style={{
              x: cityX,
              y: cityY,
              scale: cityScale,
              filter: cityFilter,
              transformOrigin: '59.55% 34.3%',
              // TWO gradients, intersected - see the note below. Inline
              // rather than in the class list because a two-stop mask plus
              // its composite mode and both `-webkit-` fallbacks is four
              // related declarations, and they are only correct together.
              maskImage: FADE_EDGES,
              WebkitMaskImage: FADE_EDGES,
              maskComposite: 'intersect',
              WebkitMaskComposite: 'source-in',
            }}
            // `transformOrigin` is the MARKED PANE on the glass facade — the
            // small rectangle the plate ships with, which is the thing the
            // whole section flies at. It runs x 2272-2358, y 792-882 of
            // 3951x2442: 86 by 90 pixels, centred at 58.6% / 34.3%.
            //
            // Not to be confused with the large dark region lower on the same
            // building — a 437x471 patch of shadowed glass, which is simply
            // part of the photograph. Measuring "the darkest rectangle" found
            // that one instead and produced a doorway five times too big.
            //
            // Converting x to the BOX's own percentages goes through
            // `object-cover`: this box is the panel's width by 61% of its
            // height, a ratio of 1.454 against the plate's 1.618, so cover
            // matches height and crops 10.1% off the width, half from each
            // side — (0.586 - 0.0505) / 0.899 = 59.55%. The y figure carries
            // over untouched.
            // The mask is what stops this box's own edges showing as a cut.
            // It is a rectangle with `overflow-hidden`, so ALL FOUR sides are
            // hard boundaries; at rest the cave's twigs cover them, but the
            // push scales the picture 4.4x and pans it, and an edge travels
            // out from under the frame that was hiding it. What reads on
            // screen is a straight line ruled across the shot — the one thing
            // a dissolve cannot have.
            //
            // It used to fade only the top and bottom, which left the LEFT
            // and RIGHT as live cuts: `inset-x-0` puts them on the window's
            // own edges, where they are invisible while the plate sits still,
            // but `cityX` pans during the push and that is enough to walk one
            // of them into frame. Two gradients now, one per axis, combined
            // with `mask-composite: intersect` so a pixel has to survive both
            // — which is what makes it a fade on all four sides rather than
            // two crossed bands. `source-in` is the same operation under the
            // older `-webkit-` spelling, for Safari.
            className="absolute inset-x-0 top-[23%] z-0 h-[61%] overflow-hidden"
          >
            <img
              src={A.nest.cityBlur}
              alt="A sunlit boulevard of domed buildings, seen through the opening in the tree"
              loading="lazy"
              decoding="async"
              className="size-full object-cover object-center"
            />

            {/* Our own copy of that block, laid exactly over it, because a
                painted rectangle cannot grow and this one has to open out
                into the next section.

                Same measurement as the origin above, put through the same
                crop: that put it at 58.3% / 32.4% and 2.42% wide. It is a
                quarter smaller than that here — 1.8% by 2.75% — because the
                marked rectangle on the plate is a little larger than the
                windows around it, and matching the mark exactly made a pane
                that no window on that facade could be. Shrunk about its own
                centre (59.5% / 34.3%), so it still sits on the same spot the
                camera is aimed at.

                Small is the point: it is one window on a building, and it
                only becomes anything larger by opening.

                `#140c0a` is Top Secrets' ground colour, so when it has opened
                out to fill the window it IS that section already on screen,
                rather than a black shape that then has to hand over to one. */}
            <motion.div
              aria-hidden
              // `rotate` on the same transform as the scale, not a class: the
              // facade is not square to the frame. Its glass bands run about
              // 12 degrees off horizontal, and a rectangle sitting bolt
              // upright on a tilted building is the single thing that gave
              // this away as pasted on rather than photographed.
              style={{ rotate: -12 }}
              // The rest is about edges. A pure flat fill with corners at
              // 90 degrees cannot sit in a soft, slightly out-of-focus plate;
              // `blur-[1.5px]` matches the picture's own focus (and grows with
              // the scale, so the pane keeps softening as it opens),
              // `rounded-[3px]` takes the corners off, and the gradient gives
              // it a top-to-bottom fall rather than one dead value — glass
              // this size in this light is never uniform.
              //
              // Both ends of that gradient are Top Secrets' own ground colour
              // or darker, so once it has opened out to fill the window it is
              // still that section's dark rather than a grey.
              className="absolute left-[58.6%] top-[32.9%] h-[2.75%] w-[1.8%] rounded-[3px] bg-[linear-gradient(160deg,#1b1109_0%,#140c0a_45%,#0b0603_100%)] blur-[1.5px]"
            />
          </motion.div>

          {/* No shade over the opening. There used to be a radial wash here —
              clear at the hole's centre, near-black at its edges, fading out
              as the section scrolled — to sit the city back inside the cave
              mouth. It is gone: the plate is a bright, fully lit photograph
              and the wash was reading as a dirty film over it rather than as
              depth. The cave's own alpha is what frames the picture now, and
              the picture is drawn as shot.
          */}

          {/* 3 · the cave — no `object-*`, because the box is the plate's own
              shape and the default `fill` draws it 1:1. */}
          <motion.div
            aria-hidden
            style={{ scale: caveScale, transformOrigin: `${HOLE.x} ${HOLE.y}` }}
            className="pointer-events-none absolute inset-0 z-20"
          >
            <img
              src={A.nest.cave}
              alt=""
              loading="lazy"
              decoding="async"
              className="size-full select-none"
            />
          </motion.div>
        </div>


        {/* 5 · the owl */}
        <motion.div
          style={{ x: owlX, y: owlY }}
          className="pointer-events-none absolute inset-0 z-40 select-none"
        >
          {/* A flat percentage of the panel, which is the whole point of cutting
              the panel to the plate's ratio: the composition is proportional
              now, so the plane scales with the opening it is flying through and
              one number holds at every window.

              It used to be `min(40vw,26rem,54svh)` — three caps, because none of
              them worked alone against a panel that was `88svh` tall while the
              plane was sized in `vw`. Those two measured different axes, so the
              `26rem` term won on a wide window and the `54svh` term had to be
              added to stop the plane swallowing the opening on a short one. The
              mismatch they were patching is gone; 30% lands him at the 416px the
              old caps resolved to at 1440, and unlike them it stays put relative
              to the hole instead of drifting between 22% and 40% of it. */}
          {/* No button. The dive was a control you had to find and press; it
              is the page's own scroll now, so the plane is just the plane.
              It banks away on the same curve the camera pushes in on —
              `x` carries him off to the left as the shot closes, which is
              what makes the opening he leaves behind the thing you are
              travelling into. */}
          <motion.div
            className="absolute w-[30%] -translate-x-1/2 -translate-y-1/2"
            style={{ left: HOLE.x, top: HOLE.y, x: owlFlyX, y: owlFlyY, scale: owlFlyScale, rotate: owlFlyRotate }}
          >
            {/* `A.owl.planeFly` — the pilot in flight with his gear down,
                his own plate rather than the portfolio's wider crop.
                NOT flipped. The old `owl-plane` export drew him nose-right
                and needed `scaleX(-1)` to face the way he flies; this plate
                already points left, so carrying that flip over turned him
                around and flew him out tail-first. */}
            <motion.img
              src={A.owl.planeFly}
              alt="A purple owl flying a green propeller plane out through the opening"
              loading="lazy"
              decoding="async"
              className="w-full drop-shadow-[0_26px_34px_rgba(0,0,0,0.5)]"
            />
          </motion.div>
        </motion.div>

        {/* Bottom Fade */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 h-[26svh] bg-[linear-gradient(180deg,rgba(20,12,10,0)_0%,rgba(20,12,10,0.55)_46%,#140c0a_100%)]" />

        {/* The cover — see `coverOpacity`. Above the bottom fade so it closes
            over that too, and a plain div so there is nothing here to raster:
            the whole job is one opacity on one flat colour. */}
        <motion.div
          aria-hidden
          style={{ opacity: coverOpacity }}
          className="pointer-events-none absolute inset-0 z-[55] bg-[#140c0a]"
        />
      </motion.div>



      </div>
      </div>
      {/* No hand-off branch. A flipped copy of `nest-branch` used to hang below
          the section on `translate-y-[68%]`, outside the panel and outside any
          clip, so its box floated in the open over whatever section followed.
          It was a crop of a plate taller than its own box, which meant both its
          edges were arbitrary rows of the picture rather than anything in the
          art — the top one had already needed a fade, then the bottom one, and
          it was still reading as a band of roots ruled across the ground behind
          it. The panel's own bottom fade closes the section without it. */}
    </section>
  )
}
