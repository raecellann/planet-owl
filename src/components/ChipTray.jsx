import { useEffect, useRef, useState } from 'react'
import { motion, useAnimationControls } from 'motion/react'

/** Just the buttons, with no container round them. */
export const TRAY = 'inline-flex max-w-full flex-wrap items-center justify-center gap-2.5'

/** A round white button that sits in the tray, for icons. */
export const TRAY_ICON = 'btn-type grid size-10 place-items-center rounded-full bg-gold-500 text-plum-700 shadow-[0_6px_0_-2px_var(--color-plum-900),0_10px_16px_-10px_rgba(54,14,57,0.35)] transition-colors hover:bg-teal-500 hover:text-white'

/**
 * The same filter on every page: white chips, with one teal marker sliding to
 * whichever is chosen.
 */
export default function ChipTray({ items, value, onChange, layoutId, label, role = 'group', itemProps, className = '', scroll = false }) {
  const rowRef = useRef(null)
  const [more, setMore] = useState(false)
  const nudge = useAnimationControls()
  useEffect(() => {
    const row = rowRef.current
    if (!scroll || !row) return undefined
    const read = () => setMore(row.scrollLeft + row.clientWidth < row.scrollWidth - 4)
    read()
    row.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', read)
    return () => {
      row.removeEventListener('scroll', read)
      window.removeEventListener('resize', read)
    }
  }, [scroll, items.length])

  const chips = (
    items.map((item) => {
        const on = item.id === value
        return (
          <motion.button
            key={item.id}
            type="button"
            {...(role === 'tablist' ? { role: 'tab', 'aria-selected': on } : { 'aria-pressed': on })}
            {...itemProps?.(item)}
            onClick={() => onChange(item.id)}
            whileTap={{ y: 2 }}
            transition={{ type: 'spring', stiffness: 420, damping: 24 }}
            style={{ '--btn-ledge': 'var(--color-plum-900)' }}
            className={`btn-type relative rounded-full px-3 py-1.5 font-ui text-[0.8rem] font-semibold shadow-[0_6px_0_-2px_var(--color-plum-900),0_10px_16px_-10px_rgba(54,14,57,0.45)] transition-[color,box-shadow] duration-300 active:text-plum-700 sm:px-6 sm:py-2.5 sm:text-sm [&:active>span:first-child]:bg-gold-500 ${
              on ? 'text-white' : 'text-plum-700 ring-1 ring-plum-900/15 hover:text-plum-800'
            }`}
          >
            <motion.span
              layoutId={on ? layoutId : undefined}
              transition={{ type: 'spring', stiffness: 380, damping: 32 }}
              className={`absolute inset-0 rounded-full ${on ? 'bg-teal-500' : 'bg-white'}`}
            />
            <span className="relative">{item.label}</span>
          </motion.button>
        )
      })
  )

  // One row that swipes sideways, with an arrow while more chips are hidden.
  if (scroll) {
    return (
      <div className={`relative w-full ${className}`}>
        <motion.div
          animate={nudge}
          ref={rowRef}
          role={role}
          aria-label={label}
          style={more ? { maskImage: 'linear-gradient(90deg,#000 0%,#000 62%,transparent 94%)', WebkitMaskImage: 'linear-gradient(90deg,#000 0%,#000 62%,transparent 94%)' } : undefined}
          className="flex snap-x gap-2.5 overflow-x-auto px-1 pb-3 pt-1 pr-14 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden [&>*]:shrink-0 [&>*]:snap-start"
        >
          {chips}
        </motion.div>
        {/* Always there. At the end of the row it stays put and the row gives
            a small bump against the edge, so it is clear there is no more. */}
        <motion.button
          type="button"
          aria-label={more ? 'Show more options' : 'End of the options'}
          onClick={() => {
            if (more) rowRef.current?.scrollBy({ left: rowRef.current.clientWidth * 0.6, behavior: 'smooth' })
            else nudge.start({ x: [0, -12, 0, -5, 0], transition: { duration: 0.45, ease: 'easeOut' } })
          }}
          whileTap={{ scale: 0.9 }}
          className={`absolute right-0 top-[calc(50%-0.25rem)] grid size-9 -translate-y-1/2 place-items-center rounded-full bg-gold-500 text-plum-700 shadow-[0_4px_0_-1px_var(--color-plum-900)] transition-opacity ${more ? '' : 'opacity-60'}`}
        >
          <svg viewBox="0 0 24 24" aria-hidden className="size-4" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </motion.button>
      </div>
    )
  }

  return (
    <div role={role} aria-label={label} className={`${TRAY} ${className}`}>
      {chips}
    </div>
  )
}
