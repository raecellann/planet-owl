import { useEffect, useState } from 'react'
import { useMotionValue, useSpring } from 'motion/react'

/** True only on devices with a real pointer — keeps touch devices cheap. */
export function useFinePointer() {
  const [fine, setFine] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(pointer: fine)')
    const sync = () => setFine(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return fine
}

/**
 * Normalised pointer position (-1 → 1 on both axes) relative to `ref`,
 * smoothed with a spring. Layers multiply these by their own depth so the
 * composition reacts to the cursor without any of them moving in lockstep.
 */
export function usePointerParallax(ref, enabled = true) {
  const x = useMotionValue(0)
  const y = useMotionValue(0)
  const sx = useSpring(x, { stiffness: 55, damping: 18, mass: 0.7 })
  const sy = useSpring(y, { stiffness: 55, damping: 18, mass: 0.7 })

  useEffect(() => {
    const el = ref.current
    if (!el || !enabled) return

    const onMove = (e) => {
      const r = el.getBoundingClientRect()
      x.set(((e.clientX - r.left) / r.width - 0.5) * 2)
      y.set(((e.clientY - r.top) / r.height - 0.5) * 2)
    }
    const onLeave = () => {
      x.set(0)
      y.set(0)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    el.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [ref, enabled, x, y])

  return { px: sx, py: sy }
}
