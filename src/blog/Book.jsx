import { useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import BlogLayout from './BlogLayout'
import { A } from '../lib/assets'

/**
 * The booking page, at `/book`: Planet Owl's own page for the studio's
 * Calendly calendar. Visitors land here from the link in the "Start a
 * Project" auto-reply email (`?email=` is filled in for them).
 *
 * Centred, one column, by request ("put it in the middle"). The booking is
 * our own three-step flow (day, time, details) by request too: Calendly's
 * embed lists every slot in one long column. The flow reads Calendly's real
 * open times and books through `api/book.js`, so Calendly still holds the
 * slot and emails the invite, call link and reminder.
 *
 * Until `CALENDLY_TOKEN` is set the API answers 503, and the page falls back
 * to the Calendly embed so booking keeps working either way.
 */
const CALENDLY = 'https://calendly.com/planetowlstudio/30min'
const DAYS_AHEAD = 28

const pad = (n) => String(n).padStart(2, '0')
const isoDay = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`

export default function Book() {
  const email = useMemo(() => new URLSearchParams(window.location.search).get('email') || '', [])
  const timezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
    } catch {
      return 'UTC'
    }
  }, [])
  // null while we find out whether our own flow can run, then 'native' or 'embed'.
  const [mode, setMode] = useState(null)
  const [slots, setSlots] = useState([]) // ISO start times, next DAYS_AHEAD days

  useEffect(() => {
    document.title = 'Planet Owl'
    let gone = false
    const today = new Date()
    const weeks = Array.from({ length: DAYS_AHEAD / 7 }, (_, i) => {
      const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() + i * 7)
      return fetch(`/api/book?date=${isoDay(d)}&days=7&tz=${encodeURIComponent(timezone)}`).then((r) =>
        r.ok ? r.json() : Promise.reject(r.status),
      )
    })
    Promise.all(weeks)
      .then((all) => {
        if (gone) return
        setSlots([...new Set(all.flatMap((w) => w.slots || []))].sort())
        setMode('native')
      })
      .catch(() => !gone && setMode('embed'))
    return () => {
      gone = true
    }
  }, [timezone])

  return (
    <BlogLayout onBlog={false} newsletter={false} page={{ label: 'Book a Call', href: '/book' }}>
      <div className="relative overflow-hidden bg-white px-5 pb-20 pt-[clamp(9rem,14vw,12rem)] sm:px-8">
        <div className="relative z-10 mx-auto max-w-[760px] text-center">
          <p className="font-ui text-sm font-bold uppercase tracking-[0.18em] text-teal-600">30-minute call</p>
          <h1 className="mt-2 font-['Momo_Trust_Display'] text-[clamp(2rem,4.6vw,3.4rem)] font-normal leading-[1.1] text-plum-700">
            Hoot hoot! Let’s Chop It Up
          </h1>
          <p className="mx-auto mt-4 max-w-xl font-ui text-lg leading-relaxed text-plum-700">
            Sooo, what’s eating up your team’s time? Grab a spot and we’ll find the best place to start. We do the
            legwork, y’all just show up. 🦉
          </p>
        </div>

        <div className="relative z-10 mx-auto mt-10 max-w-[760px] overflow-hidden rounded-[1.75rem] bg-white text-left shadow-[0_30px_60px_-30px_rgba(54,14,57,0.5)] ring-1 ring-plum-900/5">
          <div className="flex items-center gap-3 bg-plum-800 px-6 py-4">
            <img src={A.owl.digital} alt="" aria-hidden className="h-10 w-auto" />
            <div className="font-ui text-white">
              <p className="text-xs font-bold uppercase tracking-wide text-gold-400">Planet Owl Studio</p>
              <p className="font-semibold">30 min call with the flock</p>
            </div>
          </div>
          {mode === null && <p className="px-6 py-16 text-center font-ui text-plum-700">Checking the calendar…</p>}
          {mode === 'native' && <Flow slots={slots} timezone={timezone} email={email} />}
          {mode === 'embed' && <Embed email={email} />}
        </div>
      </div>
    </BlogLayout>
  )
}

/* ------------------------------------------------------------ our flow -- */

const STEP_LABELS = ['Day', 'Time', 'Details']
const FIELD =
  'mt-1.5 w-full rounded-xl border-2 border-plum-900/15 bg-white px-4 py-3 font-ui text-base text-plum-700 placeholder:text-plum-700/40 focus:border-plum-700 focus:outline-none'

function Flow({ slots, timezone, email: presetEmail }) {
  const [step, setStep] = useState(0)
  const [day, setDay] = useState('')
  const [slot, setSlot] = useState('')
  const [form, setForm] = useState({ firstName: '', lastName: '', email: presetEmail })
  const [state, setState] = useState('idle') // idle | sending | done | error
  const [error, setError] = useState('')

  const byDay = useMemo(() => {
    const m = {}
    for (const s of slots) (m[new Date(s).toLocaleDateString('en-CA', { timeZone: timezone })] ||= []).push(s)
    return m
  }, [slots, timezone])

  const days = useMemo(() => {
    const t = new Date()
    return Array.from({ length: DAYS_AHEAD }, (_, i) => new Date(t.getFullYear(), t.getMonth(), t.getDate() + i))
  }, [])

  const timeLabel = (iso) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: timezone })
  const groups = useMemo(() => {
    const hourOf = (iso) => Number(new Date(iso).toLocaleString('en-US', { hour: 'numeric', hour12: false, timeZone: timezone })) % 24
    const list = byDay[day] || []
    return [
      ['Morning', list.filter((s) => hourOf(s) < 12)],
      ['Afternoon', list.filter((s) => hourOf(s) >= 12 && hourOf(s) < 17)],
      ['Evening', list.filter((s) => hourOf(s) >= 17)],
    ].filter(([, l]) => l.length)
  }, [byDay, day, timezone])

  const longDay = (ymd) => {
    const [y, m, d] = ymd.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  const book = async (e) => {
    e.preventDefault()
    if (state === 'sending') return
    setState('sending')
    setError('')
    try {
      const res = await fetch('/api/book', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ...form, start_time: slot, timezone }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data.error || 'We could not book the call just now. Please try again.')
      setState('done')
    } catch (err) {
      setError(err.message)
      setState('error')
    }
  }

  if (state === 'done') return <Booked when={`${longDay(day)} at ${timeLabel(slot)}`} />

  const anyOpen = Object.keys(byDay).length > 0

  return (
    <div className="px-5 py-6 sm:px-8 sm:py-8">
      {/* Where you are: three steps, each one tappable once reached. */}
      <ol className="flex items-center justify-center gap-2 font-ui text-sm">
        {STEP_LABELS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <button
              type="button"
              disabled={i > step}
              onClick={() => setStep(i)}
              className={`flex items-center gap-2 rounded-full px-3 py-1.5 font-semibold transition-colors ${
                i === step ? 'bg-plum-800 text-gold-400' : i < step ? 'bg-gold-200 text-plum-700 hover:bg-gold-400/60' : 'bg-plum-900/5 text-plum-700/50'
              }`}
            >
              <span className="grid size-5 place-items-center rounded-full bg-white/20 text-xs">{i + 1}</span>
              {label}
            </button>
            {i < STEP_LABELS.length - 1 && <span aria-hidden className="h-px w-5 bg-plum-900/15 sm:w-8" />}
          </li>
        ))}
      </ol>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
          className="mt-7"
        >
          {step === 0 && (
            <div>
              <h2 className="text-center font-ui text-xl font-bold text-plum-700">Pick a day</h2>
              {!anyOpen ? (
                <p className="mt-4 text-center font-ui text-plum-700">
                  No open spots in the next four weeks. Email{' '}
                  <a href="mailto:hello@planetowl.studio" className="font-semibold text-teal-600">hello@planetowl.studio</a> and
                  we’ll sort a time.
                </p>
              ) : (
                <div className="mt-5 grid grid-cols-4 gap-2 sm:grid-cols-7">
                  {days.map((d) => {
                    const ymd = isoDay(d)
                    const open = (byDay[ymd] || []).length
                    return (
                      <button
                        key={ymd}
                        type="button"
                        disabled={!open}
                        onClick={() => {
                          setDay(ymd)
                          setSlot('')
                          setStep(1)
                        }}
                        className={`flex flex-col items-center rounded-2xl border-2 px-1 py-2.5 font-ui transition-colors ${
                          open
                            ? ymd === day
                              ? 'border-plum-800 bg-plum-800 text-gold-400'
                              : 'border-teal-500/40 bg-white text-plum-700 hover:border-teal-500 hover:bg-teal-500/10'
                            : 'cursor-not-allowed border-transparent bg-plum-900/[0.03] text-plum-700/30'
                        }`}
                      >
                        <span className="text-[0.7rem] font-semibold uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                        <span className="text-lg font-bold leading-tight">{d.getDate()}</span>
                        <span className="text-[0.7rem]">{d.toLocaleDateString('en-US', { month: 'short' })}</span>
                      </button>
                    )
                  })}
                </div>
              )}
              <p className="mt-4 text-center font-ui text-xs text-plum-700/70">Times shown in your time zone: {timezone.replace(/_/g, ' ')}</p>
            </div>
          )}

          {step === 1 && (
            <div>
              <h2 className="text-center font-ui text-xl font-bold text-plum-700">Pick a time</h2>
              <p className="mt-1 text-center font-ui text-plum-700">{longDay(day)}</p>
              <div className="mt-5 space-y-5">
                {groups.map(([name, list]) => (
                  <div key={name}>
                    <p className="font-ui text-xs font-bold uppercase tracking-wide text-plum-700/70">{name}</p>
                    <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-5">
                      {list.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => {
                            setSlot(s)
                            setStep(2)
                          }}
                          className={`rounded-xl border-2 py-2.5 font-ui text-sm font-semibold transition-colors ${
                            s === slot ? 'border-plum-800 bg-plum-800 text-gold-400' : 'border-teal-500/40 text-plum-700 hover:border-teal-500 hover:bg-teal-500/10'
                          }`}
                        >
                          {timeLabel(s)}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <form onSubmit={book}>
              <h2 className="text-center font-ui text-xl font-bold text-plum-700">Almost there</h2>
              <p className="mx-auto mt-3 w-fit rounded-full bg-gold-200 px-4 py-1.5 text-center font-ui text-sm font-semibold text-plum-700">
                {longDay(day)} · {timeLabel(slot)} · 30 min
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <label className="block font-ui text-sm font-semibold text-plum-700">
                  First name
                  <input required autoComplete="given-name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={FIELD} />
                </label>
                <label className="block font-ui text-sm font-semibold text-plum-700">
                  Last name
                  <input autoComplete="family-name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={FIELD} />
                </label>
              </div>
              <label className="mt-4 block font-ui text-sm font-semibold text-plum-700">
                Email
                <input required type="email" autoComplete="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={FIELD} />
              </label>
              {state === 'error' && (
                <p role="alert" className="mt-4 font-ui text-sm font-semibold text-red-700">
                  {error}
                </p>
              )}
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="submit"
                  disabled={state === 'sending'}
                  className="btn-type rounded-full bg-gold-500 px-8 py-3.5 font-ui text-base font-semibold text-plum-700 shadow-[0_6px_0_-2px_var(--color-plum-900)] transition-colors hover:bg-gold-400 disabled:cursor-wait disabled:opacity-70"
                >
                  {state === 'sending' ? 'Booking…' : 'Book My Call'}
                </button>
                <button type="button" onClick={() => setStep(1)} className="font-ui text-sm font-semibold text-teal-600 underline">
                  Change time
                </button>
              </div>
            </form>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

/* -------------------------------------------------- Calendly fallback -- */

function Embed({ email }) {
  const [booked, setBooked] = useState(false)
  const [height, setHeight] = useState(680)

  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== 'https://calendly.com') return
      const kind = e.data?.event
      if (kind === 'calendly.page_height') {
        const h = parseInt(e.data.payload?.height, 10)
        if (h > 300) setHeight(h)
      }
      if (kind === 'calendly.event_scheduled') setBooked(true)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])

  if (booked) return <Booked />

  const src = `${CALENDLY}?${new URLSearchParams({
    ...(email ? { email } : {}),
    embed_domain: window.location.hostname,
    embed_type: 'Inline',
    hide_gdpr_banner: '1',
    hide_event_type_details: '1',
    hide_landing_page_details: '1',
    background_color: 'ffffff',
    text_color: '562354',
    primary_color: '3f9f94',
  })}`
  return <iframe title="Pick a time for your call with Planet Owl" src={src} style={{ height }} className="block w-full border-0" />
}

/* ------------------------------------------------------------ booked -- */

function Booked({ when }) {
  const pop = { initial: { opacity: 0, y: 16, scale: 0.96 }, animate: { opacity: 1, y: 0, scale: 1 } }
  return (
    <div role="status" className="px-6 py-12 text-center">
      <motion.div {...pop} transition={{ type: 'spring', stiffness: 220, damping: 16 }} className="relative mx-auto w-fit">
        <img src={A.owl.digital} alt="" aria-hidden className="mx-auto h-40 w-auto drop-shadow-[0_16px_24px_rgba(36,5,31,0.3)]" />
        <motion.span
          aria-hidden
          initial={{ scale: 0, rotate: -40 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 14, delay: 0.35 }}
          className="absolute -right-2 bottom-3 grid size-12 place-items-center rounded-full bg-teal-500 text-white shadow-[0_6px_0_-2px_var(--color-plum-900)]"
        >
          <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
        </motion.span>
      </motion.div>
      <motion.h2 {...pop} transition={{ duration: 0.5, delay: 0.15 }} className="mt-4 font-['Momo_Trust_Display'] text-3xl font-normal text-plum-700">
        You’re on the calendar!
      </motion.h2>
      {when && (
        <motion.p {...pop} transition={{ duration: 0.5, delay: 0.2 }} className="mx-auto mt-3 w-fit rounded-full bg-gold-200 px-4 py-1.5 font-ui text-sm font-semibold text-plum-700">
          {when}
        </motion.p>
      )}
      <motion.p {...pop} transition={{ duration: 0.5, delay: 0.25 }} className="mx-auto mt-3 max-w-sm font-ui leading-relaxed text-plum-700">
        Your call is booked. The invite with the call link is on its way to your inbox, and we’ll send a reminder the day
        before. See you in the nest! 🦉
      </motion.p>
      <motion.div {...pop} transition={{ duration: 0.5, delay: 0.3 }} className="mt-7 flex flex-wrap justify-center gap-3">
        <a href="/pricing" className="btn-type inline-flex h-11 items-center rounded-full bg-gold-500 px-5 font-ui font-semibold text-plum-700 no-underline shadow-[0_5px_0_-1px_var(--color-plum-900)]">
          See Pricing
        </a>
        <a href="/" className="btn-type inline-flex h-11 items-center rounded-full bg-plum-800 px-5 font-ui font-semibold text-white no-underline shadow-[0_5px_0_-1px_var(--color-plum-950)]">
          Back to Home
        </a>
      </motion.div>
    </div>
  )
}
