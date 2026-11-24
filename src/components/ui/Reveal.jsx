import { motion, useAnimationControls, useReducedMotion } from 'motion/react'
import { scrollPace } from '../../lib/scrollPace'

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
  const controls = useAnimationControls()
  const MotionTag = motion[Tag] ?? motion.div

  if (reduce) return <Tag className={className}>{children}</Tag>

  const shown = { opacity: 1, y: 0, x: 0, scale: 1 }

  if (onMount) {
    return (
      <MotionTag
        className={className}
        initial={{ opacity: 0, y, x, scale }}
        animate={shown}
        transition={{ duration, delay, ease: EASE }}
        {...rest}
      >
        {children}
      </MotionTag>
    )
  }

  // Speed-aware: the entrance reads how fast the page is moving as it starts.
  // A fast scroller gets a quicker, undelayed entrance, so it has finished
  // while they can still see it instead of playing after they have gone by.
  return (
    <MotionTag
      className={className}
      initial={{ opacity: 0, y, x, scale }}
      animate={controls}
      viewport={{ once, margin: '-10% 0px -12% 0px' }}
      onViewportEnter={() => {
        const pace = scrollPace()
        controls.start({ ...shown, transition: { duration: duration * (1 - 0.6 * pace), delay: delay * (1 - pace), ease: EASE } })
      }}
      onViewportLeave={() => {
        if (!once) controls.set({ opacity: 0, y, x, scale })
      }}
      {...rest}
    >
      {children}
    </MotionTag>
  )
}
