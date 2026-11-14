import { createPortal } from 'react-dom'
import { useEffect, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { A } from '../lib/assets'
import SignupForm from './SignupForm'

/**
 * The gold splat the popup's content sits on — a ragged, feathered blob like
 * the footer band's torn edge, drawn once as an SVG path so it scales to any
 * card width without an image export.
 *
 * Built from a ring of points around an ellipse: every other point is pushed
 * out into a soft bump and the ones between are pulled in and sharpened, which
 * is what reads as torn paper rather than as a cloud. The jitter is seeded so
 * the shape is identical on every render.
 */
const SPLAT = (() => {
  const W = 1000
  const H = 640
  const cx = W / 2
  const cy = H / 2
  // A superellipse (rounded rectangle), not an ellipse: the content inside is
  // a rectangle, and an ellipse leaves its corners uncovered on a phone.
  const rx = 468
  const ry = 292
  const N = 56
  const EXP = 2 / 3.4
  let seed = 7
  const rand = () => {
    seed = (seed * 9301 + 49297) % 233280
    return seed / 233280
  }
  const at = (t, k) => {
    const c = Math.cos(t)
    const s = Math.sin(t)
    return [cx + Math.sign(c) * Math.abs(c) ** EXP * rx * k, cy + Math.sign(s) * Math.abs(s) ** EXP * ry * k]
  }
  const pts = []
  for (let i = 0; i < N; i++) {
    const t = (i / N) * Math.PI * 2
    const out = i % 2 === 0
    const k = out ? 1 + rand() * 0.03 : 0.9 + rand() * 0.05
    pts.push(at(t, k))
  }
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`
  for (let i = 0; i < N; i++) {
    const b = pts[(i + 1) % N]
    // bumps curve out, notches are a straight cut back in
    if (i % 2 === 0) {
      const [qx, qy] = at(((i + 0.5) / N) * Math.PI * 2, 1.06)
      d += ` Q${qx.toFixed(1)},${qy.toFixed(1)} ${b[0].toFixed(1)},${b[1].toFixed(1)}`
    } else {
      d += ` L${b[0].toFixed(1)},${b[1].toFixed(1)}`
    }
  }
  return { d: d + ' Z', W, H }
})()

/**
 * "Start a Project" — the popup behind the navbar's gold pill.
 *
 * The pilot and his plane stand on top of a gold splat that carries the same
 * heading and sign-up pill as the footer band, on a dimmed, blurred page.
 * Closes on the × button, on the backdrop, and on Escape; while open the page
 * behind it cannot scroll (`.is-modal` in `index.css`, the same mechanism the
 * intro's gate uses).
 */
export default function StartProjectModal({ open, onClose }) {
  const reduce = useReducedMotion()
  const closeRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined
    const root = document.documentElement
    root.classList.add('is-modal')
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', onKey)
    return () => {
      root.classList.remove('is-modal')
      window.removeEventListener('keydown', onKey)
    }
  }, [open, onClose])

  // Portalled to <body> so a parent's transform or stacking context (the
  // final CTA section renders one of these too) cannot trap the fixed overlay.
  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          key="start-project"
          role="dialog"
          aria-modal="true"
          aria-labelledby="start-project-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: reduce ? 0 : 0.25 }}
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-[rgba(12,4,12,0.78)] px-4 py-6 backdrop-blur-sm sm:px-8"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose?.()
          }}
        >
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 28, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduce ? undefined : { opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="relative my-auto w-full max-w-[min(92vw,900px)]"
          >
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="absolute right-1 top-1 z-30 grid size-11 place-items-center rounded-full bg-white text-plum-900 shadow-[0_4px_0_0_var(--color-plum-900)] transition-colors hover:bg-gold-200 sm:right-0 sm:top-0 sm:size-12"
            >
              <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            </button>

            {/* The pilot stands ON the splat: his feet land about a fifth of
                the way down it, so the image is pulled down over the splat's
                top edge with a negative margin and layered above it. */}
            <motion.img
              src={A.owl.ground}
              alt="A pilot owl standing beside a green propeller plane"
              width={1564}
              height={890}
              initial={reduce ? false : { opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="relative z-20 mx-auto -mb-[16%] block h-auto w-[72%] max-w-none select-none drop-shadow-[0_18px_22px_rgba(0,0,0,0.45)] sm:w-[62%] sm:-mb-[14%]"
            />

            <div className="relative z-10">
              <svg
                aria-hidden
                viewBox={`0 0 ${SPLAT.W} ${SPLAT.H}`}
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
              >
                <path d={SPLAT.d} fill="#e7b248" />
              </svg>

              <div className="relative px-[11%] pb-[16%] pt-[24%] sm:px-[11%] sm:pb-[12%] sm:pt-[19%]">
                <h2
                  id="start-project-title"
                  className="font-ui text-[clamp(1.5rem,4.2vw,2.6rem)] font-bold leading-[1.12] text-plum-900"
                >
                  Let’s Make Something
                  <br /> Brilliantly Strange!
                </h2>

                <SignupForm source="start-a-project popup" compact autoFocus className="mt-5 sm:mt-7" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
