import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useReducedMotion } from '../lib/motionPref'
import { A } from '../lib/assets'
import owlMoon from '../../assets/about-owls/moon.webp'

/** Fired by every "Join the Flock" button, with the role in `detail`. */
export const APPLY_EVENT = 'planetowl:apply'

export function openApply(role) {
  window.dispatchEvent(new CustomEvent(APPLY_EVENT, { detail: { role } }))
}

const MAX_MB = 4
const ROLES = [
  { id: 'SEO Specialist', owl: A.owl.digital },
  { id: 'Motion Designer', owl: A.owl.vr },
  { id: 'Full-stack Engineer', owl: A.owl.develop },
  { id: 'AI Solutions Lead', owl: A.owl.ai },
  { id: 'Other', owl: owlMoon },
]
const OK_TYPES = /\.(pdf|docx?)$/i

const sizeLabel = (bytes) => (bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`)

/**
 * The Join the Flock application. A native `<dialog>`, so focus is trapped and
 * Escape closes it. The role can be switched inside it, a bar fills as the
 * required fields are done, and the resume can be dropped straight onto the
 * drop zone. It posts to `/api/apply`, which keeps the resume in the studio's
 * private Blob store and drops a note in the inbox.
 */
export default function ApplyModal() {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const fileRef = useRef(null)
  const [role, setRole] = useState('Other')
  const [state, setState] = useState('idle') // idle | sending | sent | error
  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [file, setFile] = useState(null)
  const [dragging, setDragging] = useState(false)

  useEffect(() => {
    const open = (e) => {
      setRole(ROLES.some((r) => r.id === e.detail?.role) ? e.detail.role : 'Other')
      setState('idle')
      setMessage('')
      ref.current?.showModal()
    }
    window.addEventListener(APPLY_EVENT, open)
    return () => window.removeEventListener(APPLY_EVENT, open)
  }, [])

  const fail = (text) => {
    setState('error')
    setMessage(text)
  }

  const pick = (f) => {
    if (!f) return
    if (!OK_TYPES.test(f.name)) return fail('Please send the resume as a PDF or Word file.')
    if (f.size > MAX_MB * 1024 * 1024) return fail(`Please keep the resume under ${MAX_MB} MB.`)
    setFile(f)
    if (state === 'error') {
      setState('idle')
      setMessage('')
    }
  }

  const done = [name.trim(), /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()), file].filter(Boolean).length
  const owl = ROLES.find((r) => r.id === role)?.owl ?? owlMoon

  const onSubmit = async (e) => {
    e.preventDefault()
    if (state === 'sending') return
    if (!name.trim()) return fail('Please add your name.')
    if (!file) return fail('Please attach your resume.')
    const body = new FormData(e.currentTarget)
    body.set('role', role)
    body.set('resume', file)
    setState('sending')
    setMessage('')
    try {
      const res = await fetch('/api/apply', { method: 'POST', body })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'Something went wrong. Please try again.')
      setState('sent')
      setName('')
      setEmail('')
      setFile(null)
    } catch (err) {
      fail(err.message)
    }
  }

  const field =
    'mt-1.5 w-full rounded-2xl border-[3px] border-plum-900 bg-white px-4 py-3 font-ui text-base text-plum-700 placeholder:text-plum-700/55 transition-shadow focus:outline-none focus:shadow-[0_5px_0_0_var(--color-plum-900)] focus-visible:ring-4 focus-visible:ring-teal-500/40'
  const label = 'block font-ui text-sm font-bold text-plum-700'

  return (
    <dialog
      ref={ref}
      aria-labelledby="apply-title"
      onClick={(e) => {
        if (e.target === ref.current) ref.current.close()
      }}
      className="m-auto max-h-[94dvh] w-[min(36rem,calc(100vw-1.5rem))] apply-scroll overflow-y-auto overflow-x-hidden rounded-[2rem] bg-gold-500 p-0 backdrop:bg-plum-950/70 backdrop:backdrop-blur-sm"
    >
      <div className="relative p-6 sm:p-9">
        <button
          type="button"
          onClick={() => ref.current.close()}
          aria-label="Close"
          className="absolute right-4 top-4 z-10 grid size-10 place-items-center rounded-full bg-white/60 text-xl text-plum-700 transition-[background-color,rotate] duration-300 hover:rotate-90 hover:bg-white"
        >
          <span aria-hidden>✕</span>
        </button>

        <div className="flex items-end gap-4 pr-10">
          <AnimatePresence mode="wait" initial={false}>
            <motion.img
              key={owl}
              src={owl}
              alt=""
              aria-hidden
              initial={reduce ? false : { y: 24, opacity: 0, rotate: -12 }}
              animate={reduce ? undefined : { y: [0, -6, 0], opacity: 1, rotate: 0 }}
              exit={reduce ? undefined : { y: 18, opacity: 0, rotate: 10, transition: { duration: 0.18 } }}
              transition={{ y: { duration: 2.4, repeat: Infinity, ease: 'easeInOut' }, default: { type: 'spring', stiffness: 260, damping: 18 } }}
              className="h-20 w-auto shrink-0 object-contain sm:h-24"
            />
          </AnimatePresence>
          <div className="min-w-0 pb-1">
            <p className="font-ui text-sm font-bold uppercase tracking-wider text-plum-700">Join the Flock</p>
            <h2 id="apply-title" className="font-['Momo_Trust_Display'] text-[clamp(1.5rem,4vw,2.1rem)] font-normal leading-[1.1] text-plum-700">
              {state === 'sent' ? 'Welcome to the nest!' : role === 'Other' ? 'Tell us what you do' : role}
            </h2>
          </div>
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {state === 'sent' ? (
            <motion.div
              key="sent"
              initial={reduce ? false : { opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-6 text-center"
            >
              <motion.svg
                viewBox="0 0 52 52"
                aria-hidden
                className="mx-auto size-20 text-teal-600"
                initial={reduce ? false : { rotate: -90 }}
                animate={{ rotate: 0 }}
                transition={{ type: 'spring', stiffness: 160, damping: 12 }}
              >
                <circle cx="26" cy="26" r="24" fill="white" />
                <motion.path
                  d="M15 27l7 7 15-16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  initial={reduce ? false : { pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.25 }}
                />
              </motion.svg>
              <p role="status" className="mt-4 font-ui text-lg leading-relaxed text-plum-700">
                Thanks! Your application is in the nest. We will reply by email.
              </p>
              <button
                type="button"
                onClick={() => ref.current.close()}
                className="btn-type mt-6 inline-flex h-12 items-center rounded-full bg-plum-800 px-7 font-ui font-semibold text-white shadow-[0_6px_0_-2px_var(--color-plum-950)] hover:bg-plum-700"
              >
                Done
              </button>
            </motion.div>
          ) : (
            <motion.form key="form" onSubmit={onSubmit} noValidate exit={reduce ? undefined : { opacity: 0, y: -10 }} className="mt-5 space-y-4">
              {/* The role, switchable here. */}
              <div role="radiogroup" aria-label="Role" className="flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    role="radio"
                    aria-checked={role === r.id}
                    onClick={() => setRole(r.id)}
                    className={`relative rounded-full px-3.5 py-1.5 font-ui text-sm font-semibold transition-colors ${role === r.id ? 'text-white' : 'bg-white/60 text-plum-700 hover:bg-white'}`}
                  >
                    {role === r.id && (
                      <motion.span layoutId="apply-role" className="absolute inset-0 rounded-full bg-plum-800" transition={{ type: 'spring', stiffness: 420, damping: 32 }} />
                    )}
                    <span className="relative">{r.id}</span>
                  </button>
                ))}
              </div>

              <input type="text" name="company" tabIndex={-1} autoComplete="off" aria-hidden className="hidden" />
              <div className="grid gap-4 sm:grid-cols-2">
                <label className={label}>
                  Your name
                  <input name="name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
                </label>
                <label className={label}>
                  Email
                  <input name="email" type="email" required autoComplete="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
                </label>
              </div>

              <div>
                <span className={label}>Resume</span>
                <motion.label
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setDragging(false)
                    pick(e.dataTransfer.files[0])
                  }}
                  animate={reduce ? undefined : { scale: dragging ? 1.03 : 1, rotate: dragging ? -1 : 0 }}
                  className={`mt-1.5 flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-[3px] border-dashed border-plum-900 px-4 py-5 text-center transition-colors focus-within:ring-4 focus-within:ring-teal-500/40 ${dragging ? 'bg-white' : 'bg-white/60 hover:bg-white'}`}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => pick(e.target.files[0])}
                    className="sr-only"
                  />
                  <AnimatePresence mode="wait" initial={false}>
                    {file ? (
                      <motion.span
                        key="file"
                        initial={reduce ? false : { y: 10, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={reduce ? undefined : { y: -10, opacity: 0 }}
                        className="flex w-full items-center gap-3 text-left"
                      >
                        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-plum-800 font-ui text-xs font-bold uppercase text-gold-400">
                          {file.name.split('.').pop()}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-ui font-semibold text-plum-700">{file.name}</span>
                          <span className="font-ui text-xs text-plum-700">{sizeLabel(file.size)}</span>
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault()
                            setFile(null)
                            if (fileRef.current) fileRef.current.value = ''
                          }}
                          aria-label="Remove resume"
                          className="grid size-8 shrink-0 place-items-center rounded-full bg-plum-100 text-plum-700 hover:bg-plum-300/60"
                        >
                          <span aria-hidden>✕</span>
                        </button>
                      </motion.span>
                    ) : (
                      <motion.span key="empty" initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduce ? undefined : { opacity: 0 }}>
                        <motion.svg
                          viewBox="0 0 24 24"
                          aria-hidden
                          className="mx-auto size-8 text-plum-700"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          animate={reduce ? undefined : { y: dragging ? -6 : [0, -3, 0] }}
                          transition={dragging ? { duration: 0.2 } : { duration: 1.6, repeat: Infinity }}
                        >
                          <path d="M12 16V4M7 9l5-5 5 5M5 20h14" />
                        </motion.svg>
                        <span className="mt-1 block font-ui font-semibold text-plum-700">
                          {dragging ? 'Drop it in the nest' : 'Drop your resume here or tap to choose'}
                        </span>
                        <span className="font-ui text-xs text-plum-700">PDF or Word, up to {MAX_MB} MB</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.label>
              </div>

              <label className={label}>
                Portfolio or LinkedIn <span className="font-semibold text-plum-700/70">(optional)</span>
                <input name="link" type="url" inputMode="url" placeholder="https://" className={field} />
              </label>
              <p className="font-ui text-xs leading-relaxed text-plum-700">
                We keep your resume privately and only use it to review your application. See our{' '}
                <a href="/privacy" className="font-bold text-plum-700 underline">privacy page</a>.
              </p>
              <div className="flex flex-wrap items-center gap-4 pt-1">
                <motion.button
                  type="submit"
                  disabled={state === 'sending'}
                  whileHover={reduce ? undefined : { y: -3 }}
                  whileTap={reduce ? undefined : { y: 2 }}
                  animate={reduce || done < 3 ? undefined : { scale: [1, 1.05, 1] }}
                  transition={{ scale: { duration: 1.2, repeat: Infinity } }}
                  className="btn-type inline-flex h-12 items-center rounded-full bg-teal-500 px-7 font-ui font-semibold text-white shadow-[0_6px_0_-2px_var(--color-plum-900)] transition-colors hover:bg-teal-400 disabled:cursor-wait disabled:opacity-80"
                >
                  {state === 'sending' ? 'Sending…' : 'Send Application'}
                </motion.button>
                <p aria-live="polite" className="font-ui text-sm font-semibold text-plum-800">
                  {state === 'error' ? message : ''}
                </p>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </dialog>
  )
}
