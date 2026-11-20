import { useEffect, useState } from 'react'

/**
 * Live answer to a CSS media query, for the few places where a breakpoint has
 * to change something a class cannot reach — keyframes handed to Motion, a
 * transform origin, which of two animations is mounted.
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => typeof window !== 'undefined' && window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setMatches(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])
  return matches
}

/** Below Tailwind's `sm` (640px) — phones, where the base classes apply. */
export const PHONE = '(max-width: 639px)'
