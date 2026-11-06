import { useId, useState } from 'react'
import { motion } from 'motion/react'
import { submitSignup } from '../lib/signup'

/**
 * The sign-up pill — the input and the teal "Get Free 2-Week Trial" button
 * inside one bordered white capsule, as drawn in the section 9 export.
 *
 * Shared by the footer band and the "Start a Project" popup. `compact` is the
 * popup's sizing: the footer pill grows with the window (`vw` units, see the
 * notes below) because it spans the whole band, while the popup's sits inside
 * a card and wants a fixed, smaller height.
 *
 * Submission goes through `submitSignup` — see `src/lib/signup.js` for where
 * the email ends up.
 */
export default function SignupForm({ source = 'footer', compact = false, autoFocus = false, onSent, className = '' }) {
  const id = useId()
  const [email, setEmail] = useState('')
  // idle | sending | sent | error
  const [state, setState] = useState('idle')
  const [message, setMessage] = useState('')

  const onSubmit = async (e) => {
    e.preventDefault()
    if (state === 'sending') return
    setState('sending')
    setMessage('')
    try {
      const { via } = await submitSignup({ email, source })
      setState('sent')
      setMessage(
        via === 'mailto'
          ? 'Your mail app should have opened with the message ready — just hit send.'
          : `Thanks — we will be in touch at ${email.trim()}.`,
      )
      onSent?.(email.trim())
    } catch (err) {
      setState('error')
      setMessage(err?.message || 'Something went wrong. Please try again.')
    }
  }

  const pill = compact
    ? // Fixed height for the popup card: 64px pill, 48px button inside it.
      'min-h-[64px] flex-col gap-3 rounded-[2rem] p-1.5 sm:flex-row sm:items-center sm:rounded-full sm:p-2'
    : // The footer's own figures. Sized by ASPECT against the reference in `vw`
      // so the shape holds at every width; `max()` floors it for phones.
      'min-h-[76px] flex-col gap-4 rounded-[2.5rem] p-2 sm:min-h-[max(4.5rem,7.3vw)] sm:flex-row sm:items-center sm:rounded-full sm:p-[max(0.5rem,0.85vw)]'

  const input = compact
    ? 'px-5 py-2.5 text-base sm:px-6 sm:text-lg'
    : 'px-5 py-2.5 text-base sm:px-7 sm:py-3 sm:text-xl'

  const button = compact
    ? 'py-2 pl-5 pr-1.5 text-base sm:h-12 sm:py-0 sm:pl-6 sm:pr-1.5'
    : 'py-2 pl-6 pr-1.5 text-base sm:h-[max(3rem,5.6vw)] sm:py-0 sm:pl-[max(1.5rem,2.2vw)] sm:pr-[max(0.375rem,0.5vw)] sm:text-[max(0.95rem,1.3vw)]'

  const badge = compact ? 'size-9' : 'size-9 sm:size-[max(2.25rem,4.2vw)]'
  const arrow = compact ? 'size-5' : 'size-5 sm:size-[max(1.25rem,2.2vw)]'

  return (
    <div className={className}>
      <form
        onSubmit={onSubmit}
        noValidate
        className={`flex justify-center border-[3px] border-plum-900 bg-white shadow-[0_7px_0_0_var(--color-plum-900)] ${pill}`}
      >
        <label className="sr-only" htmlFor={id}>
          Email address
        </label>
        <input
          id={id}
          type="email"
          name="email"
          autoComplete="email"
          inputMode="email"
          required
          autoFocus={autoFocus}
          value={email}
          disabled={state === 'sending'}
          onChange={(e) => {
            setEmail(e.target.value)
            if (state !== 'idle') setState('idle')
          }}
          placeholder="Enter your email here!"
          aria-invalid={state === 'error' || undefined}
          aria-describedby={`${id}-status`}
          className={`min-w-0 flex-1 bg-transparent font-display font-semibold text-plum-900 placeholder:text-plum-900/70 focus:outline-none disabled:opacity-60 ${input}`}
        />
        <motion.button
          type="submit"
          disabled={state === 'sending'}
          whileHover={{ y: -3 }}
          whileTap={{ y: 2 }}
          transition={{ type: 'spring', stiffness: 420, damping: 24 }}
          style={{ '--btn-ledge': 'var(--color-plum-900)' }}
          className={`btn-type group inline-flex shrink-0 items-center justify-center gap-3 whitespace-nowrap rounded-full bg-teal-500 font-semibold text-white shadow-[0_6px_0_-2px_var(--color-plum-900)] transition-colors hover:bg-teal-400 disabled:cursor-wait disabled:opacity-80 ${button}`}
        >
          {state === 'sending' ? 'Sending…' : state === 'sent' ? 'Sent!' : 'Get Free 2-Week Trial'}
          <span
            className={`grid shrink-0 place-items-center rounded-full bg-gold-500 text-plum-900 shadow-[0_3px_0_0_var(--color-plum-900)] transition-transform duration-300 group-hover:translate-x-0.5 ${badge}`}
          >
            {state === 'sent' ? (
              <svg viewBox="0 0 24 24" className={arrow} fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12.5l4.5 4.5L19 7.5" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className={arrow} fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 12h15M13 6l6 6-6 6" />
              </svg>
            )}
          </span>
        </motion.button>
      </form>

      <p
        id={`${id}-status`}
        role="status"
        aria-live="polite"
        className={`mt-3 min-h-[1.25rem] px-2 font-display text-sm font-semibold transition-opacity duration-300 ${
          state === 'error' ? 'text-red-700' : 'text-plum-900'
        } ${message ? 'opacity-100' : 'opacity-0'}`}
      >
        {message || ' '}
      </p>
    </div>
  )
}
