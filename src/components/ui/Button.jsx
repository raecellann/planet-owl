import { motion } from 'motion/react'
import { A } from '../../lib/assets'

// `btn-type` carries the font pair — Momo Trust Sans, snapping to Luckiest Guy
// while pressed. It replaces `font-display` here rather than sitting alongside
// it, since two font-family utilities on one element is a coin toss.
const base =
  'group relative inline-flex items-center gap-2.5 rounded-full btn-type font-semibold ' +
  'transition-colors duration-300 select-none'

/** The gold pill from the brand kit — the page's primary action. */
export function GoldButton({
  children,
  href = '#start',
  size = 'md',
  withOwl = false,
  // Overrides for the badge `withOwl` draws. Default to the flat brand mark
  // on its plum disc (`Nav`'s "Start a Project"), but the final CTA's "Book
  // a Discovery Flight" wants the PILOT's own face instead — a photograph,
  // not a flat mark, so it needs `cover` (crop to fill the circle) rather
  // than `contain` (which would letterbox a photo inside a plum ring), and a
  // white disc rather than plum, since the reference sits him on a light
  // badge, not a dark one.
  iconSrc,
  iconFit = 'contain',
  iconBg = 'bg-plum-700',
  // Set when `iconSrc` is a fully-composed badge (the plum disc already baked
  // in), not just the owl. Skips the `iconBg` wrapper — otherwise the composed
  // image lands inside a second plum disc and reads as a mark inset in a ring.
  iconAsBadge = false,
  // Renders an invisible copy of the label pre-set in Luckiest Guy (the wider
  // hover face) alongside the real one, so `.btn-type:hover`'s font swap can
  // fire without the pill resizing. The pill's resting width becomes the
  // WIDEST state's width, not the narrower Momo Trust Sans measurement — used
  // sparingly, only where the button sits in a row that a growth would shove.
  reserveHoverWidth = false,
  className = '',
  ...rest
}) {
  const sizing = size === 'lg' ? 'px-8 py-4 text-lg' : size === 'sm' ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'

  return (
    <motion.a
      href={href}
      // `--btn-ledge` is what `.btn-type:active` presses onto — the same
      // plum the resting ledge is drawn in, so the pill keeps its own colour
      // under the tap instead of every button on the page going flat plum.
      style={{ '--btn-ledge': 'var(--color-plum-900)' }}
      // 6px of ledge, matching the navbar's CTA — every hard shadow on the
      // site is now cut to that one depth so no two buttons sit at different
      // heights. It used to be 10px here, which read as a taller pill than
      // the identical one in the bar above it.
      // `active:bg-teal-500` is the press colour — #3f9f94, the same teal the
      // portfolio's selected chip uses. Only the FILL changes: the hard ledge
      // stays plum, so the button still presses onto the same shadow it rests
      // on rather than swapping two things at once.
      className={`${base} ${sizing} bg-gold-500 text-plum-900 shadow-[0_6px_0_-2px_var(--color-plum-900),0_22px_38px_-18px_rgba(20,12,10,0.7)] hover:bg-gold-400 active:bg-teal-500 ${className}`}
      whileHover={{ y: -3 }}
      whileTap={{ y: 2 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      // Forwarded, like `TealButton` already does. The flock cards pass
      // `draggable={false}`, and without it the browser's native drag grabs the
      // pointer and the carousel stops tracking half way through a swipe — a
      // prop this component was quietly dropping on the floor.
      {...rest}
    >
      {withOwl && iconAsBadge ? (
        <img src={iconSrc} alt="" className="size-7 shrink-0 rounded-full object-contain" />
      ) : withOwl && iconFit === 'cover' ? (
        // A `background-image` rather than an `<img>` with `object-fit`:
        // `cover` alone was only cropping to the container's own aspect
        // ratio, not zooming — on a photo where the subject's face is a
        // small corner of a much wider scene (the full plane, here), that
        // left most of the badge showing plane fuselage instead of his
        // face. `background-size`/`-position` give independent control over
        // the zoom AND the crop point, which `object-fit` does not.
        <span
          className="size-7 shrink-0 overflow-hidden rounded-full bg-white bg-[length:330%] bg-[position:15%_24%] bg-no-repeat"
          style={{ backgroundImage: `url(${iconSrc})` }}
        />
      ) : (
        withOwl && (
          <span className={`grid size-7 shrink-0 place-items-center overflow-hidden rounded-full ${iconBg}`}>
            <img src={iconSrc ?? A.mark} alt="" className="size-6 object-contain" />
          </span>
        )
      )}
      {reserveHoverWidth ? (
        <span className="relative inline-flex items-center justify-center">
          <span
            aria-hidden
            className="invisible font-[family-name:var(--font-pop)] font-normal"
          >
            {children}
          </span>
          <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap">
            {children}
          </span>
        </span>
      ) : (
        <span>{children}</span>
      )}
    </motion.a>
  )
}

/** The teal pill — used where gold would compete with the art behind it. */
export function TealButton({ children, href = '#start', size = 'md', className = '', ...rest }) {
  const sizing = size === 'lg' ? 'px-8 py-4 text-lg' : size === 'sm' ? 'px-4 py-2 text-sm' : 'px-6 py-3 text-base'

  return (
    <motion.a
      href={href}
      style={{ '--btn-ledge': 'var(--color-plum-900)' }}
      className={`${base} ${sizing} bg-teal-500 text-white shadow-[0_6px_0_-2px_var(--color-plum-900),0_22px_38px_-18px_rgba(15,49,45,0.7)] hover:bg-teal-400 ${className}`}
      whileHover={{ y: -3 }}
      whileTap={{ y: 2 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      {...rest}
    >
      <span>{children}</span>
    </motion.a>
  )
}

/** Quieter outline pill for secondary actions on light backgrounds. */
export function GhostButton({ children, href = '#', className = '' }) {
  return (
    <motion.a
      href={href}
      className={`${base} border-2 border-plum-700/25 px-6 py-3 text-base text-plum-700 hover:border-plum-700/60 hover:bg-white/60 ${className}`}
      whileHover={{ y: -3 }}
      whileTap={{ y: 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
    >
      {children}
      <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
        →
      </span>
    </motion.a>
  )
}
