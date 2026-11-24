import { useReducedMotion as useOsReducedMotion } from 'motion/react'

/**
 * How the site treats a visitor's "reduce motion" setting (Windows "Show
 * animations" off, macOS and phone "Reduce motion" on).
 *
 * It used to switch almost every animation off, so on a PC with that setting
 * the site looked static. Now it is gentle rather than none, by request:
 *
 *   useReducedMotion()   for SMALL motion: fades, pop-ups, cards landing,
 *                        popups opening. Always false, so these always play.
 *   useSoftMotion()      true when the visitor asked for reduced motion, so
 *                        small motion can travel a shorter distance.
 *   motion/react's own   still used directly by the BIG motion: parallax,
 *   useReducedMotion     planes flying across the screen, the dive into the
 *                        nest. Those stay off for anyone who asked.
 */
export function useReducedMotion() {
  return false
}

export function useSoftMotion() {
  return Boolean(useOsReducedMotion())
}
