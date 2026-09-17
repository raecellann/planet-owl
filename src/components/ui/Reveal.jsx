import { motion, useReducedMotion } from 'motion/react'

const EASE = [0.16, 1, 0.3, 1]

/** Scroll-triggered entrance used by every section below the hero. */
export default function Reveal({
  children,
  as: Tag = 'div',
  y = 46,
  x = 0,
  scale = 1,
  delay = 0,
  duration = 0.8,
  once = true,
  // `onMount`: fades on a timer instead of on scroll intersection. For
  // content that can already be sitting in the viewport the instant it
  // mounts — like Top Secrets' first card, landed on directly by the nest
  // dive rather than scrolled to — `whileInView` fires (and finishes)
  // immediately, before the dive's own veil has lifted, so the fade is
  // never actually seen. A mount-timed fade plays on its own clock instead
  // of on visibility, so it can be delayed to land after the veil is gone.
  onMount = false,
  className = '',
  ...rest
}) {
  const reduce = useReducedMotion()
  const MotionTag = motion[Tag] ?? motion.div

  if (reduce) return <Tag className={className}>{children}</Tag>

  const trigger = onMount
    ? { animate: { opacity: 1, y: 0, x: 0, scale: 1 } }
    : {
        whileInView: { opacity: 1, y: 0, x: 0, scale: 1 },
        viewport: { once, margin: '-10% 0px -12% 0px' },
      }

  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y, x, scale }}
      transition={{ duration, delay, ease: EASE }}
      {...trigger}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}
