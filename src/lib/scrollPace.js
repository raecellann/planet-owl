import { useAnimationControls, useReducedMotion, useSpring } from 'motion/react'

/**
 * How fast the visitor is scrolling, so the animations can keep up with them.
 *
 * Someone flicking down the page used to fly straight past things that only
 * play while they are on screen. Two tools here fix that:
 *
 *   scrollPace()   0 when still or reading slowly, up to 1 when flicking fast.
 *                  Entrances read it the moment they start and play quicker,
 *                  so they finish while the visitor can still see them.
 *
 *   useCatchUp()   For animations tied to the scroll position. The value
 *                  follows the scroll on a spring: at a reading pace it tracks
 *                  almost exactly, and after a fast flick it plays through to
 *                  where the page landed instead of jumping there.
 */
let lastY = 0
let lastT = 0
let speed = 0

if (typeof window !== 'undefined') {
  lastY = window.scrollY
  window.addEventListener(
    'scroll',
    () => {
      const now = performance.now()
      const y = window.scrollY
      const dt = Math.max(16, now - lastT)
      // Smoothed a little so one jumpy frame does not read as a flick.
      speed = speed * 0.4 + ((Math.abs(y - lastY) / dt) * 1000) * 0.6
      lastY = y
      lastT = now
    },
    { passive: true },
  )
}

/** 0 (still or slow) to 1 (about 3000px a second or faster). */
export function scrollPace() {
  if (typeof performance === 'undefined') return 0
  // Stopped scrolling a moment ago: treat as still.
  if (performance.now() - lastT > 220) return 0
  return Math.min(1, speed / 3000)
}

/** A scroll-linked value that eases after the scroll instead of jumping. */
export function useCatchUp(progress) {
  const reduce = useReducedMotion()
  const eased = useSpring(progress, { stiffness: 150, damping: 28, mass: 0.4, restDelta: 0.0005 })
  return reduce ? progress : eased
}

/**
 * A speed-aware stand-in for `whileInView` + `transition`. Spread the result
 * onto a motion element that keeps its own `initial` and `viewport`:
 *
 *   const enter = usePaceInView({ opacity: 1, y: 0 }, { duration: 0.8 })
 *   <motion.div initial={{ opacity: 0, y: 40 }} viewport={{ once: true }} {...enter} />
 */
export function usePaceInView(to, { duration = 0.8, delay = 0, ease = [0.16, 1, 0.3, 1] } = {}) {
  const controls = useAnimationControls()
  return {
    animate: controls,
    onViewportEnter: () => {
      const pace = scrollPace()
      controls.start({ ...to, transition: { duration: duration * (1 - 0.6 * pace), delay: delay * (1 - pace), ease } })
    },
  }
}
