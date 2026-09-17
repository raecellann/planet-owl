import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

/**
 * Drifts its children as they cross the viewport. Positive `distance` enters
 * low and exits high; a negative value inverts it so neighbouring items can
 * separate from one another.
 */
export default function Parallax({ children, distance = 60, className = '', style }) {
  const ref = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [distance, -distance])

  return (
    <motion.div ref={ref} style={{ y, ...style }} className={className}>
      {children}
    </motion.div>
  )
}
