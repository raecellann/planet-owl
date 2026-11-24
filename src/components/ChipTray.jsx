import { motion } from 'motion/react'

/** Just the buttons, with no container round them. */
export const TRAY = 'inline-flex max-w-full flex-wrap items-center justify-center gap-2.5'

/** A round white button that sits in the tray, for icons. */
export const TRAY_ICON = 'btn-type grid size-10 place-items-center rounded-full bg-gold-500 text-plum-700 shadow-[0_6px_0_-2px_var(--color-plum-900),0_10px_16px_-10px_rgba(54,14,57,0.35)] transition-colors hover:bg-teal-500 hover:text-white'

/**
 * The same filter on every page: white chips, with one teal marker sliding to
 * whichever is chosen.
 */
export default function ChipTray({ items, value, onChange, layoutId, label, role = 'group', itemProps, className = '' }) {
  return (
    <div role={role} aria-label={label} className={`${TRAY} ${className}`}>
      {items.map((item) => {
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
      })}
    </div>
  )
}
