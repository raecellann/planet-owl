import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { A } from '../lib/assets'

/**
 * Who each owl is. These are the studio's mascots, one per kind of work, so
 * the names are characters rather than real staff.
 */
export const OWL_INTROS = {
  [A.owl.tophat]: { name: 'Monty', does: 'I shape logos and brand identities, so your brand looks sharp in any room.' },
  [A.owl.crown]: { name: 'Regina', does: 'I rule UI/UX. If a button is hard to find, I will hear about it.' },
  [A.owl.flower]: { name: 'Flora', does: 'I grow your content and social media, one post at a time.' },
  [A.owl.pumpkin]: { name: 'Jack', does: 'I edit the videos and digital films, and I carve out everything you do not need.' },
  [A.owl.flame]: { name: 'Blaze', does: 'I do the motion graphics and 3D. If it moves, I probably lit the fuse.' },
  [A.owl.astronaut]: { name: 'Astro', does: 'I run AI and automation, so the boring work launches itself.' },
  [A.owl.wizard]: { name: 'Merlin', does: 'I build the websites, apps and stores. Some call it code. I call it magic.' },
  [A.owl.float]: { name: 'Puddles', does: 'I look after SEO, so people can find you without paddling around.' },
  [A.owl.broom]: { name: 'Swoop', does: 'I fly between the flock and keep your project moving. Tell me what you need.' },
}

/**
 * The speech bubble. Rendered on <body> and fixed to the screen because the
 * owls sit inside rotated, scaled layers that would tilt and stretch anything
 * placed in them. `open` is { src, rect } for the owl that was clicked.
 */
export default function OwlBubble({ open, onClose }) {
  const reduce = useReducedMotion()
  const box = useRef(null)
  const [pos, setPos] = useState({ left: 0, top: 0 })
  const intro = open && OWL_INTROS[open.src]

  useLayoutEffect(() => {
    if (!open || !box.current) return
    const { rect } = open
    const b = box.current.getBoundingClientRect()
    const gap = 12
    const roomRight = window.innerWidth - rect.right
    const left = roomRight > b.width + gap ? rect.right + gap : rect.left - b.width - gap
    const top = rect.top + rect.height / 2 - b.height / 2
    setPos({
      left: Math.max(12, Math.min(window.innerWidth - b.width - 12, left)),
      top: Math.max(96, Math.min(window.innerHeight - b.height - 12, top)),
    })
  }, [open])

  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('click', onClose)
    document.addEventListener('keydown', onKey)
    window.addEventListener('scroll', onClose, { passive: true })
    return () => {
      document.removeEventListener('click', onClose)
      document.removeEventListener('keydown', onKey)
      window.removeEventListener('scroll', onClose)
    }
  }, [open, onClose])

  return createPortal(
    <AnimatePresence>
      {intro && (
        <motion.div
          key={open.src}
          ref={box}
          role="status"
          onClick={(e) => e.stopPropagation()}
          initial={reduce ? false : { opacity: 0, y: 10, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.92 }}
          transition={{ type: 'spring', stiffness: 420, damping: 26 }}
          style={{ left: pos.left, top: pos.top }}
          className="fixed z-[70] w-[min(18rem,calc(100vw-1.5rem))] rounded-2xl border-2 border-plum-700 bg-white p-4 text-left shadow-[0_18px_34px_-16px_rgba(54,14,57,0.65)]"
        >
          <p className="font-['Momo_Trust_Display'] text-lg leading-tight text-plum-700">Hoot! I am {intro.name}.</p>
          <p className="mt-1 font-ui text-sm leading-snug text-plum-800">{intro.does}</p>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
