import { useEffect, useRef, useState } from 'react'
import { motion } from 'motion/react'

/** Fired by every "Join the Flock" button, with the role in `detail`. */
export const APPLY_EVENT = 'planetowl:apply'

export function openApply(role) {
  window.dispatchEvent(new CustomEvent(APPLY_EVENT, { detail: { role } }))
}

const MAX_MB = 4

/**
 * The Join the Flock application. A native `<dialog>`, so focus is trapped and
 * Escape closes it. It posts to `/api/apply`, which keeps the resume in the
 * studio's private Blob store and drops a note in the inbox.
 */
export default function ApplyModal() {
  const ref = useRef(null)
  const [role, setRole] = useState('')
  const [state, setState] = useState('idle') // idle | sending | sent | error
  const [message, setMessage] = useState('')
  const [fileName, setFileName] = useState('')

  useEffect(() => {
    const open = (e) => {
      setRole(e.detail?.role || 'Other')
      setState('idle')
      setMessage('')
      setFileName('')
      ref.current?.showModal()
    }
    window.addEventListener(APPLY_EVENT, open)
    return () => window.removeEventListener(APPLY_EVENT, open)
  }, [])

  const onSubmit = async (e) => {
    e.preventDefault()
    if (state === 'sending') return
    const form = e.currentTarget
    const file = form.resume.files[0]
    if (!file) return fail('Please attach your resume.')
    if (file.size > MAX_MB * 1024 * 1024) return fail(`Please keep the resume under ${MAX_MB} MB.`)
    setState('sending')
    setMessage('')
    try {
      const res = await fetch('/api/apply', { method: 'POST', body: new FormData(form) })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
      setState('sent')
      setMessage('Thanks! Your application is in the nest. We will reply by email.')
      form.reset()
      setFileName('')
    } catch (err) {
      fail(err.message)
    }
  }

  const fail = (text) => {
    setState('error')
    setMessage(text)
  }

  const field =
    'mt-1.5 w-full rounded-2xl border-[3px] border-plum-900 bg-white px-4 py-3 font-ui text-base text-plum-700 placeholder:text-plum-700/55 focus:outline-none focus-visible:ring-4 focus-visible:ring-teal-500/50'
  const label = 'block font-ui text-sm font-bold text-plum-700'

  return (
    <dialog
      ref={ref}
      aria-labelledby="apply-title"
      onClick={(e) => {
        if (e.target === ref.current) ref.current.close()
      }}
      className="m-auto max-h-[92dvh] w-[min(34rem,calc(100vw-2rem))] overflow-y-auto rounded-[2rem] bg-gold-500 p-0 backdrop:bg-plum-950/70 backdrop:backdrop-blur-sm"
    >
      <div className="relative p-6 sm:p-9">
        <button
          type="button"
          onClick={() => ref.current.close()}
          aria-label="Close"
          className="absolute right-4 top-4 grid size-10 place-items-center rounded-full bg-white/60 text-xl text-plum-700 transition-colors hover:bg-white"
        >
          <span aria-hidden>✕</span>
        </button>
        <p className="font-ui text-sm font-bold uppercase tracking-wider text-plum-700">Join the Flock</p>
        <h2 id="apply-title" className="mt-1 pr-10 font-['Momo_Trust_Display'] text-[clamp(1.6rem,4vw,2.2rem)] font-normal leading-[1.1] text-plum-700">
          {role === 'Other' ? 'Tell us what you do' : role}
        </h2>

        {state === 'sent' ? (
          <div className="mt-6">
            <p role="status" className="font-ui text-lg leading-relaxed text-plum-700">{message}</p>
            <button
              type="button"
              onClick={() => ref.current.close()}
              className="btn-type mt-6 inline-flex h-12 items-center rounded-full bg-plum-800 px-6 font-ui font-semibold text-white shadow-[0_6px_0_-2px_var(--color-plum-950)] hover:bg-plum-700"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
            <input type="hidden" name="role" value={role} />
            {/* Left empty by people; bots fill it in. */}
            <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
            <label className={label}>
              Your name
              <input name="name" required autoComplete="name" className={field} />
            </label>
            <label className={label}>
              Email
              <input name="email" type="email" required autoComplete="email" inputMode="email" className={field} />
            </label>
            <div>
              <span className={label}>Resume</span>
              <label className="mt-1.5 flex cursor-pointer items-center justify-between gap-3 rounded-2xl border-[3px] border-dashed border-plum-900 bg-white/70 px-4 py-3 transition-colors hover:bg-white focus-within:ring-4 focus-within:ring-teal-500/50">
                <span className="min-w-0 truncate font-ui text-base text-plum-700">
                  {fileName || `PDF or Word, up to ${MAX_MB} MB`}
                </span>
                <span className="shrink-0 rounded-full bg-plum-800 px-4 py-1.5 font-ui text-sm font-semibold text-white">Choose file</span>
                <input
                  type="file"
                  name="resume"
                  required
                  accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                  onChange={(e) => setFileName(e.target.files[0]?.name || '')}
                  className="sr-only"
                />
              </label>
            </div>
            <label className={label}>
              Portfolio or LinkedIn <span className="font-semibold text-plum-700/70">(optional)</span>
              <input name="link" type="url" inputMode="url" placeholder="https://" className={field} />
            </label>
            <label className={label}>
              Anything else? <span className="font-semibold text-plum-700/70">(optional)</span>
              <textarea name="note" rows={3} className={`${field} resize-y`} />
            </label>
            <p className="font-ui text-xs leading-relaxed text-plum-700">
              We keep your resume privately and only use it to review your application. See our{' '}
              <a href="#/privacy" className="font-bold text-plum-700 underline">privacy page</a>.
            </p>
            <div className="flex flex-wrap items-center gap-4 pt-1">
              <motion.button
                type="submit"
                disabled={state === 'sending'}
                whileHover={{ y: -3 }}
                whileTap={{ y: 2 }}
                className="btn-type inline-flex h-12 items-center rounded-full bg-teal-500 px-7 font-ui font-semibold text-white shadow-[0_6px_0_-2px_var(--color-plum-900)] transition-colors hover:bg-teal-400 disabled:cursor-wait disabled:opacity-80"
              >
                {state === 'sending' ? 'Sending…' : 'Send Application'}
              </motion.button>
              <p aria-live="polite" className="font-ui text-sm font-semibold text-plum-800">
                {state === 'error' ? message : ''}
              </p>
            </div>
          </form>
        )}
      </div>
    </dialog>
  )
}
