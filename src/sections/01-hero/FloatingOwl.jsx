import { useState } from 'react'
import { motion, useReducedMotion, useTransform } from 'motion/react'

/**
 * One owl in the hero composition.
 *
 * Two nested transforms, deliberately — each on its own element so neither
 * overwrites the other's `transform`:
 *
 *  1. OUTER  scroll position       (parallax rise, drift, spin)
 *  2. INNER  cursor position       (pointer parallax, weighted by `depth`)
 *
 * There is NO idle loop. Each owl used to carry three of them — a vertical
 * bob, a horizontal sway on a wrapper of its own, and a slight "breathing"
 * scale, all running forever on their own clocks — so the flock drifted about
 * whether or not the page was being read. They are gone by request: the birds
 * hold their positions and the only thing that moves them is the visitor's own
 * scrolling.
 *
 * That is why `bob`, `sway`, `tilt`, `duration` and `delay` no longer exist as
 * props. They fed nothing else, and left in place they would have read as
 * settings that ought to do something. The scroll figures (`rise`, `drift`,
 * `spin`) and the cursor weight (`depth`) are the whole of an owl's movement
 * now — see `HERO_OWLS` in `Hero.jsx`.
 */
export default function FloatingOwl({
  progress,
  px,
  py,
  still = false,
  src,
  alt = '',
  className = '',
  rise = 0,
  drift = 0,
  spin = 0,
  depth = 0,
  interactive = true,
  shadow = true,
}) {
  const reduce = useReducedMotion()
  const frozen = still || reduce
  const [zoomed, setZoomed] = useState(false)
  const to = (from, target) => (frozen ? [from, from] : [from, target])

  const y = useTransform(progress, [0, 1], to(0, rise))
  const x = useTransform(progress, [0, 1], to(0, drift))
  const rotate = useTransform(progress, [0, 1], to(0, spin))

  // nearer owls (higher depth) react more to the cursor
  const mx = useTransform(px, (v) => v * depth)
  const my = useTransform(py, (v) => v * depth * 0.55)

  return (
    <motion.div style={{ y, x, rotate }} className={`layer pointer-events-none absolute ${className}`}>
      <motion.div style={{ x: mx, y: my }}>
        {/* The click-zoom stays on a layer of its own rather than on the image.
            Nothing else animates `scale` here any more, but keeping the two
            apart costs nothing and means the image is free for whatever it
            needs its own transform for.
            `pointer-events-auto` reopens clicking on just this owl; every
            wrapper above stays `pointer-events-none` so the rest of the flock
            keeps passing clicks through to whatever sits behind it.
            `zIndex` is a plain style, not part of `animate` — CSS z-index only
            accepts whole numbers, so animating it would just get rejected
            mid-interpolation; set directly it swaps the instant React
            re-renders, which is all a click needs. */}
        {/* `interactive` is how an owl gives the click back.

            It defaults to true, so every owl in `HERO_OWLS` behaves exactly as
            before; the foreground bird turns it off once its approach has
            grown it past the edges of the window, because at that size this
            one owl IS the viewport and a click anywhere on the screen would
            land on it rather than on the island underneath. Dropping
            `pointer-events-auto` is what actually does it — the layer above is
            already `pointer-events-none`, and this class was the descendant
            opting back in over the top of it.

            `zoomed && interactive` on the scale and the z-index too, not just
            on the handler: a bird clicked while it was still small must not
            stay held at 1.6x after it stops being clickable, or that zoom
            compounds with the approach and there is no longer any way to
            undo it. */}
        <motion.div
          onClick={interactive ? () => setZoomed((z) => !z) : undefined}
          animate={{ scale: zoomed && interactive ? 1.6 : 1 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          style={{ zIndex: zoomed && interactive ? 30 : 'auto' }}
          className={`relative ${interactive ? 'pointer-events-auto cursor-pointer' : ''}`}
        >
          {/* `owl-shadow` is `drop-shadow(0 24px 22px ...)`, and a filter
              inside a scaled layer scales with it — at the foreground bird's
              3.6x that is a 79px blur offset 86px down, which stops reading as
              a shadow and starts reading as a dark smear dragged across the
              island behind it. So an owl can turn it off; every owl in
              `HERO_OWLS` keeps it, because none of them ever gets near that
              size. */}
          <motion.img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            className={`w-full ${shadow ? 'owl-shadow' : ''}`}
          />
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
