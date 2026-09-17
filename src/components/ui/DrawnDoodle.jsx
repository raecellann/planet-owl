import { useEffect, useRef, useState } from 'react'
import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from 'motion/react'

/**
 * One of the hand-drawn marker doodles from `assets/container` — the hearts
 * beside the flock's cards, the sparkles beside the wizard — drawing itself
 * the first time it is seen.
 *
 * The plates are flat PNGs, not SVG paths, so there is no stroke to run a
 * `pathLength` animation along. What stands in for it is a CONIC mask: a
 * hard-edged wedge that opens from `from` degrees all the way round, so the
 * artwork is uncovered in the order a hand would lay it down rather than
 * fading in as a whole. On a closed outline that is close to indistinguishable
 * from a real stroke animation, because the shape only ever exists at the
 * sweep's leading edge anyway.
 *
 * `from` is where the pen starts, in CSS conic terms — 0deg is straight up and
 * it runs clockwise. A heart wants to start at the notch between its lobes
 * (0deg, the default), which sends the sweep down the right lobe, round the
 * point and back up the left one.
 *
 * The mask has to be rebuilt on every frame, which is why it is a
 * `useMotionTemplate` off a motion value rather than an animated CSS property:
 * Motion cannot tween two gradient STRINGS, but it can tween the number inside
 * one and re-render the string around it.
 *
 * `trail` is the same angle plus a few degrees, which is what puts a soft edge
 * on the wedge. Without it the leading edge is a dead-straight radial line and
 * the doodle reads as a pie chart filling up rather than a line being drawn.
 */
export default function DrawnDoodle({
  src,
  className = '',
  style,
  delay = 0,
  duration = 0.9,
  from = 0,
  /**
   * Keeps pulsing once drawn — the doodle's own glint, rather than a separate
   * sparkle graphic parked next to it.
   */
  twinkle = false,
}) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })

  /**
   * `pending` -> `drawing` -> `done`, and the mask exists ONLY in `drawing`.
   *
   * This is the important part of the component, and it is written this way
   * because the first version failed the wrong direction. The mask is what
   * makes the doodle appear at all, so anything that stopped the sweep from
   * running — an observer that never reported, a remount inside the
   * carousel's cloned-and-jumped track, a browser that would not take the
   * conic gradient — did not produce an unanimated doodle, it produced no
   * doodle. Here `done` drops the mask entirely (`none`), so the end state is
   * the plain picture and the effect is something layered on top of a thing
   * that is already visible rather than the only reason it is.
   */
  const [phase, setPhase] = useState(reduce ? 'done' : 'pending')

  const sweep = useMotionValue(0)
  const trail = useTransform(sweep, (d) => Math.min(360, d + 14))
  const mask = useMotionTemplate`conic-gradient(from ${from}deg at 50% 42%, #000 ${sweep}deg, transparent ${trail}deg)`

  useEffect(() => {
    if (reduce || phase !== 'pending') return undefined

    let controls
    const draw = () => {
      setPhase('drawing')
      controls = animate(sweep, 360, { delay, duration, ease: [0.4, 0, 0.2, 1] })
      controls.then(() => setPhase('done')).catch(() => {})
    }

    if (inView) {
      draw()
      return () => controls?.stop()
    }

    // Two ways out of `pending`, because the viewport trigger cannot be the
    // only one. The poll asks the element itself whether it is on screen, so
    // it draws properly for anything the observer missed; the deadline gives
    // up on the animation and shows the doodle anyway. Something further down
    // the page is unaffected by the poll (its rect is off screen) and only
    // ever loses the stroke, never the drawing.
    const poll = setInterval(() => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      if (r.width > 0 && r.bottom > 0 && r.top < window.innerHeight) {
        clearInterval(poll)
        draw()
      }
    }, 500)

    const deadline = setTimeout(() => {
      clearInterval(poll)
      setPhase('done')
    }, 2500)

    return () => {
      clearInterval(poll)
      clearTimeout(deadline)
      controls?.stop()
    }
  }, [inView, reduce, sweep, delay, duration, phase])

  return (
    <motion.img
      ref={ref}
      src={src}
      alt=""
      aria-hidden
      draggable={false}
      style={{
        ...style,
        // Held back until it is ready to draw, so the stroke is not spoiled
        // by a frame of the finished doodle first — but only ever by opacity,
        // which cannot leave it permanently missing the way the mask could.
        opacity: phase === 'pending' ? 0 : 1,
        ...(phase === 'drawing'
          ? { maskImage: mask, WebkitMaskImage: mask }
          : { maskImage: 'none', WebkitMaskImage: 'none' }),
      }}
      // A real glint, not a slow breath: down to 0.35 and back, with the
      // scale pulse widened to match, on a shorter cycle. The first pass
      // (0.55 / 1.09 over 2.8s) was subtle enough that a doodle carrying it
      // looked static beside one that was not — which is what led to a
      // separate sparkle graphic being parked next to the hearts to do the
      // job the hearts should be doing themselves.
      animate={
        twinkle && !reduce
          ? { opacity: [1, 0.35, 1], scale: [1, 1.16, 1] }
          : undefined
      }
      transition={
        twinkle && !reduce
          ? { duration: 2.1, repeat: Infinity, ease: 'easeInOut', delay: delay + duration }
          : undefined
      }
      className={`pointer-events-none select-none ${className}`}
    />
  )
}
