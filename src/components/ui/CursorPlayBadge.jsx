import { useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'motion/react'
import { A } from '../../lib/assets'

/**
 * The gold play badge that rides the cursor across a picture.
 *
 * Split into a hook and a component because the two halves have to live on
 * different elements: the pointer handlers belong on the container being
 * tracked (so the badge only follows inside it), while the badge itself is
 * painted as that container's child.
 *
 *   const play = useCursorPlayBadge()
 *   <a {...play.handlers}> <img/> <CursorPlayBadge {...play} /> </a>
 *
 * Offsets are stored relative to the container's OWN centre rather than to
 * the page, because the badge sits at `left-1/2 top-1/2` — so 0,0 is already
 * the middle and the resting state needs no special case. Leaving just sets
 * them back to 0 and the badge glides home.
 */
export function useCursorPlayBadge({ stiffness = 260, damping = 26, mass = 0.6 } = {}) {
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const spring = { stiffness, damping, mass }
  // Sprung rather than followed exactly: at 1:1 the badge is welded to the
  // pointer and reads as a cursor swap, which is not what this is. The lag is
  // what makes it read as an object being carried along inside the frame.
  const bx = useSpring(x, spring)
  const by = useSpring(y, spring)
  const [live, setLive] = useState(false)

  const handlers = {
    onPointerEnter: () => setLive(true),
    onPointerMove: (e) => {
      if (reduce) return
      const r = e.currentTarget.getBoundingClientRect()
      x.set(e.clientX - r.left - r.width / 2)
      y.set(e.clientY - r.top - r.height / 2)
    },
    onPointerLeave: () => {
      setLive(false)
      x.set(0)
      y.set(0)
    },
  }

  return { handlers, live, bx, by }
}

/** `size` is the badge's rendered width in px; it is square. */
export default function CursorPlayBadge({ bx, by, live, size = 44, className = '' }) {
  return (
    <motion.img
      src={A.playBadge}
      alt=""
      aria-hidden
      loading="lazy"
      draggable={false}
      style={{
        x: bx,
        y: by,
        width: size,
        // Centred by NEGATIVE MARGINS, not by `-translate-x-1/2`. Motion
        // writes the whole `transform` inline to animate `x`/`y`, and an
        // inline transform beats a utility class — so translate-based
        // centring would be dropped the moment the badge moved and it would
        // hang off its own top-left corner instead of its middle. Margins sit
        // outside `transform` entirely, so the two never contend.
        marginLeft: -size / 2,
        marginTop: -size / 2,
      }}
      animate={{ opacity: live ? 1 : 0.85, scale: live ? 1.12 : 1 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={`pointer-events-none absolute left-1/2 top-1/2 z-10 select-none drop-shadow-[0_6px_14px_rgba(20,12,10,0.45)] ${className}`}
    />
  )
}
