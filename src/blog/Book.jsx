import { useEffect, useMemo, useState } from 'react'
import { motion } from 'motion/react'
import BlogLayout from './BlogLayout'
import { A } from '../lib/assets'
import { personalize } from '../lib/industry'

/**
 * The booking page, at `/book`: Planet Owl's own page for the studio's
 * Calendly calendar. Visitors land here from the link in the "Start a
 * Project" auto-reply email (`?email=` is filled in for them).
 *
 * Two columns, as first built (restored by request), with the content inside
 * the card centred and sized to fit. The booking is our own three-step flow (day, time, details) by request too: Calendly's
 * embed lists every slot in one long column. The flow reads Calendly's real
 * open times and books through `api/book.js`, so Calendly still holds the
 * slot and emails the invite, call link and reminder.
 *
 * Until `CALENDLY_TOKEN` is set the API answers 503. The same steps still run
 * ('link' mode): the times are every half hour round the clock (the studio's
 * Calendly is open 24 hours, by request), and the last step opens Calendly's
 * own confirm form for that exact slot, name and email already filled in, so
 * the visitor only presses "Schedule Event". The welcome email goes out
 * through Make once Calendly says the booking is made.
 */
const MAKE_WEBHOOK = import.meta.env.VITE_MAKE_WEBHOOK?.trim() || 'https://hook.us2.make.com/bcxw8cpn0glfqlnfdzlwfmq7a8cq7k9s'

/** Every half hour from an hour from now, for DAYS_AHEAD days. */
function openSlots() {
  const t = new Date(Date.now() + 60 * 60 * 1000)
  t.setSeconds(0, 0)
  t.setMinutes(t.getMinutes() < 30 ? 30 : 60)
  const end = Date.now() + DAYS_AHEAD * 24 * 3600 * 1000
  const out = []
  for (let x = t.getTime(); x < end; x += 30 * 60 * 1000) out.push(new Date(x).toISOString())
  return out
}
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
  // null while we find out whether Calendly's API is connected: 'native' if
  // it is (book through api/book.js), 'link' if not (confirm on Calendly).
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
      .catch(() => {
        if (gone) return
        setSlots(openSlots())
        setMode('link')
      })
    return () => {
      gone = true
    }
  }, [timezone])

  return (
    <BlogLayout onBlog={false} newsletter={false} page={{ label: 'Book a Call', href: '/book' }}>
      <div className="relative overflow-hidden bg-white px-5 pb-20 pt-[clamp(9rem,14vw,12rem)] sm:px-8">
        {/* The earlier two-column layout, by request ("okay na ung design ng
            before"): what the call is on the left, the calendar on the right,
            the two lined up at the top and the card sized to its contents. */}
        <div className="relative z-10 mx-auto grid max-w-[1120px] gap-10 lg:grid-cols-[minmax(0,0.6fr)_minmax(0,1.4fr)] lg:items-stretch lg:gap-14">
          <div>
            <h1 className="font-['Momo_Trust_Display'] text-[clamp(1.9rem,2.7vw,2.5rem)] font-normal leading-[1.1] text-plum-700">
              Hoot hoot! Let’s Chop It Up
            </h1>
            <p className="mt-4 max-w-md font-ui text-lg leading-relaxed text-plum-700">
              Sooo, what’s eating up your team’s time? Grab a spot and we’ll do the legwork. 🦉
            </p>
            <ol className="mt-6 max-w-md space-y-3">
              {INTRO_STEPS.map((t, i) => (
                <li key={t} className="flex items-center gap-3 font-ui text-base text-plum-700">
                  <span className="grid size-8 shrink-0 place-items-center rounded-full bg-plum-800 font-bold text-gold-400">{i + 1}</span>
                  {t}
                </li>
              ))}
            </ol>
            <img
              src={A.owl.develop}
              alt=""
              aria-hidden
              loading="lazy"
              className="mt-8 hidden w-[min(80%,20rem)] select-none [mask-image:linear-gradient(180deg,#000_95%,transparent_100%)] lg:block"
            />
          </div>

          {/* As tall as the column beside it so its bottom lines up with the
              owl, by request; the header bar is back, by request too. */}
          <div className="flex flex-col overflow-hidden rounded-[1.75rem] bg-white shadow-[0_30px_60px_-30px_rgba(54,14,57,0.5)] ring-1 ring-plum-900/5">
            <div className="flex items-center gap-3 bg-plum-800 px-6 py-4">
              <img src={A.owl.digital} alt="" aria-hidden className="h-10 w-auto" />
              <div className="font-ui text-white">
                <p className="text-xs font-bold uppercase tracking-wide text-gold-400">Planet Owl Studio</p>
                <p className="font-semibold">30 min call with the flock</p>
              </div>
            </div>
            {mode === null && <p className="px-6 py-16 text-center font-ui text-plum-700">Checking the calendar…</p>}
            {mode && <div className="flex flex-1 flex-col">{<Flow slots={slots} timezone={timezone} email={email} link={mode === 'link'} />}</div>}
          </div>
        </div>
      </div>
    </BlogLayout>
  )
}

const INTRO_STEPS = [
  'Grab a day and time that works for y’all',
  'The invite and call link land in your inbox',
  'We chop it up, and your free 2-week trial can start',
]

/* ------------------------------------------------------------ our flow -- */

const FIELD =
  'mt-1.5 w-full rounded-xl border-2 border-plum-900/15 bg-white px-4 py-3 font-ui text-base text-plum-700 placeholder:text-plum-700/40 focus:border-plum-700 focus:outline-none'

function Flow({ slots, timezone, email: presetEmail, link }) {
  const [day, setDay] = useState('')
  const [slot, setSlot] = useState('')
  const [month, setMonth] = useState(() => ({ y: new Date().getFullYear(), m: new Date().getMonth() }))
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

  // The first day with open times is picked for you, so times show at once.
  const activeDay = day || days.map(isoDay).find((d) => (byDay[d] || []).length) || ''
  const timeLabel = (iso) => new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: timezone })

  const longDay = (ymd) => {
    const [y, m, d] = ymd.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  }

  // The welcome email, once Calendly has the booking ('link' mode; in
  // 'native' mode api/book.js sends it).
  const welcome = () => {
    try {
      const at = new Date(slot)
      const label = (o) => at.toLocaleString('en-US', { timeZone: timezone, ...o })
      const body = new URLSearchParams({
        kind: 'booked',
        email: form.email.trim(),
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        date: label({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
        time: label({ hour: 'numeric', minute: '2-digit' }),
        timezone,
        source: 'booking page',
        ...personalize({ email: form.email }),
      })
      if (MAKE_WEBHOOK !== 'off') fetch(MAKE_WEBHOOK, { method: 'POST', body, keepalive: true }).catch(() => {})
    } catch {
      /* best effort */
    }
  }

  useEffect(() => {
    if (state !== 'confirm') return undefined
    const onMessage = (e) => {
      if (e.origin !== 'https://calendly.com') return
      if (e.data?.event === 'calendly.event_scheduled') {
        welcome()
        setState('done')
      }
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state])

  const book = async (e) => {
    e.preventDefault()
    if (state === 'sending') return
    if (link) {
      setState('confirm')
      return
    }
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

  if (state === 'done')
    return (
      <Booked
        name={form.firstName.trim()}
        day={longDay(activeDay)}
        time={timeLabel(slot)}
        onAgain={() => {
          setSlot('')
          setDay('')
          setState('idle')
        }}
      />
    )
  if (state === 'confirm')
    return (
      <Confirm
        slot={slot}
        name={`${form.firstName} ${form.lastName}`.trim()}
        email={form.email.trim()}
        when={`${longDay(activeDay)} · ${timeLabel(slot)} · 30 min`}
        onBack={() => setState('idle')}
      />
    )

  const anyOpen = Object.keys(byDay).length > 0
  if (!anyOpen)
    return (
      <p className="px-6 py-12 text-center font-ui text-plum-700">
        No open spots in the next four weeks. Email{' '}
        <a href="mailto:hello@planetowl.studio" className="font-semibold text-teal-600">hello@planetowl.studio</a> and we’ll
        sort a time.
      </p>
    )

  // Screen 2, as on Calendly: the details, with a way back to the calendar.
  if (slot)
    return (
      <form onSubmit={book} className="flex flex-1 flex-col px-5 py-6 sm:px-8 sm:py-7">
        <button type="button" onClick={() => setSlot('')} className="flex w-fit items-center gap-1.5 font-ui text-sm font-semibold text-plum-700">
          <span aria-hidden className="grid size-9 place-items-center rounded-full bg-teal-500/10 font-ui text-xl font-bold text-teal-700">‹</span>
          Back
        </button>
        <div className="my-auto grid items-center gap-6 pt-5 md:grid-cols-[minmax(0,1fr)_minmax(0,0.7fr)]">
        <div>
        <p className="font-ui text-xl font-bold text-plum-700">Enter your details</p>
        <p className="mt-2 w-fit rounded-full bg-gold-200 px-4 py-1.5 font-ui text-sm font-semibold text-plum-700">
          {longDay(activeDay)} · {timeLabel(slot)} · 30 min
        </p>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="block font-ui text-sm font-semibold text-plum-700">
            First name
            <input required autoFocus autoComplete="given-name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={FIELD} />
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
        <button
          type="submit"
          disabled={state === 'sending'}
          className="btn-type mt-6 w-full rounded-full bg-gold-500 px-8 py-3.5 font-ui text-base font-semibold text-plum-700 shadow-[0_6px_0_-2px_var(--color-plum-900)] transition-colors hover:bg-gold-400 disabled:cursor-wait disabled:opacity-70"
        >
          {state === 'sending' ? 'Booking…' : link ? 'Continue' : 'Schedule My Call'}
        </button>
        </div>
        {/* Swoop keeps the empty side company, by request ("add image"). */}
        <img src={A.owl.broom} alt="" aria-hidden className="mx-auto hidden w-full max-w-[15rem] select-none drop-shadow-[0_18px_26px_rgba(36,5,31,0.25)] md:block" />
        </div>
      </form>
    )

  /*
   * Screen 1, laid out like Calendly's own flow but the other way round, by
   * request: the month calendar on the right, that day's times on the left.
   * On a phone the calendar comes first and the times follow under it.
   */
  const times = byDay[activeDay] || []
  return (
    <div className="grid flex-1 gap-6 px-5 py-6 sm:px-7 sm:py-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-8">
      <div className="order-2 flex min-h-0 flex-col md:order-1">
        <p className="font-ui text-lg font-bold text-plum-700">Select a time</p>
        <p className="mt-0.5 font-ui text-sm text-plum-700/75">{activeDay ? longDay(activeDay) : ''}</p>
        <div className="mt-3 max-h-[19.5rem] space-y-2 overflow-y-auto pr-1 [scrollbar-width:thin] lg:max-h-none lg:min-h-0 lg:flex-1 lg:basis-0">
          {times.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSlot(s)}
              className="w-full rounded-xl border-2 border-teal-500/50 py-2.5 font-ui text-sm font-bold text-teal-700 transition-colors hover:border-teal-500 hover:bg-teal-500 hover:text-white"
            >
              {timeLabel(s)}
            </button>
          ))}
        </div>
      </div>

      <div className="order-1 flex flex-col md:order-2">
        <p className="font-ui text-lg font-bold text-plum-700">Select a day</p>
        <MonthGrid month={month} setMonth={setMonth} activeDay={activeDay} byDay={byDay} onPick={(ymd) => setDay(ymd)} />
        <p className="mt-3 font-ui lg:mt-auto lg:pt-3 text-xs text-plum-700/70">Times shown in your time zone: {timezone.replace(/_/g, ' ')}</p>
      </div>
    </div>
  )
}

const WEEKDAYS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

/** A month at a time, open days marked like Calendly's: a soft teal circle. */
function MonthGrid({ month, setMonth, activeDay, byDay, onPick }) {
  const first = new Date(month.y, month.m, 1)
  const lead = first.getDay()
  const count = new Date(month.y, month.m + 1, 0).getDate()
  const cells = [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)]
  const now = new Date()
  const last = new Date(now.getFullYear(), now.getMonth(), now.getDate() + DAYS_AHEAD)
  const canBack = month.y > now.getFullYear() || (month.y === now.getFullYear() && month.m > now.getMonth())
  const canNext = new Date(month.y, month.m + 1, 1) <= last
  const step = (by) =>
    setMonth(({ y, m }) => {
      const d = new Date(y, m + by, 1)
      return { y: d.getFullYear(), m: d.getMonth() }
    })
  return (
    <div className="mt-3">
      <div className="flex items-center justify-between">
        <button type="button" aria-label="Previous month" disabled={!canBack} onClick={() => step(-1)} className="grid size-9 place-items-center rounded-full font-ui text-xl font-bold text-plum-700 transition-colors hover:bg-gold-200 disabled:opacity-25">
          ‹
        </button>
        <p className="font-ui font-semibold text-plum-700">{first.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
        <button type="button" aria-label="Next month" disabled={!canNext} onClick={() => step(1)} className="grid size-9 place-items-center rounded-full bg-teal-500/10 font-ui text-xl font-bold text-teal-700 transition-colors hover:bg-teal-500/20 disabled:bg-transparent disabled:opacity-25">
          ›
        </button>
      </div>
      <div className="mt-2 grid grid-cols-7 text-center font-ui text-[0.65rem] font-semibold text-plum-700/60">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-1.5">{w}</span>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-1.5 text-center lg:gap-y-2.5">
        {cells.map((d, i) => {
          if (!d) return <span key={`e${i}`} />
          const ymd = isoDay(new Date(month.y, month.m, d))
          const open = (byDay[ymd] || []).length > 0
          const on = ymd === activeDay
          return (
            <span key={ymd} className="grid place-items-center">
              <button
                type="button"
                disabled={!open}
                aria-pressed={on}
                onClick={() => onPick(ymd)}
                className={`grid size-10 place-items-center rounded-full font-ui text-sm transition-colors sm:size-11 lg:size-12 lg:text-base ${
                  on ? 'bg-plum-800 font-bold text-gold-400' : open ? 'bg-teal-500/10 font-bold text-teal-700 hover:bg-teal-500/25' : 'text-plum-700/30'
                }`}
              >
                {d}
              </button>
            </span>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------- confirm on Calendly ('link') -- */

/**
 * Calendly's own confirm form for the one slot picked, with the name and
 * email already in, so the visitor only presses "Schedule Event". Calendly
 * then holds the slot and sends the invite, the Google Meet link and the
 * reminder.
 */
function Confirm({ slot, name, email, when, onBack }) {
  const [height, setHeight] = useState(620)
  useEffect(() => {
    const onMessage = (e) => {
      if (e.origin !== 'https://calendly.com' || e.data?.event !== 'calendly.page_height') return
      const h = parseInt(e.data.payload?.height, 10)
      if (h > 300) setHeight(h)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [])
  const src = `${CALENDLY}/${new Date(slot).toISOString().replace('.000Z', 'Z')}?${new URLSearchParams({
    name,
    email,
    embed_domain: window.location.hostname,
    embed_type: 'Inline',
    hide_gdpr_banner: '1',
    hide_event_type_details: '1',
    hide_landing_page_details: '1',
    background_color: 'ffffff',
    text_color: '562354',
    primary_color: '3f9f94',
  })}`
  return (
    <div className="px-5 pt-6 sm:px-8">
      <button type="button" onClick={onBack} className="flex items-center gap-1.5 font-ui text-sm font-semibold text-plum-700">
        <span aria-hidden className="grid size-9 place-items-center rounded-full bg-teal-500/10 font-ui text-xl font-bold text-teal-700">‹</span>
        Back
      </button>
      <iframe title="Confirm your call with Planet Owl" src={src} style={{ height }} className="mt-2 block w-full border-0" />
    </div>
  )
}

/* ------------------------------------------------------------ booked -- */

function Booked({ name, day, time, onAgain }) {
  const pop = { initial: { opacity: 0, y: 16, scale: 0.96 }, animate: { opacity: 1, y: 0, scale: 1 } }
  const steps = ['The invite and call link are in your inbox', 'We chop it up on the call', 'Your free 2-week trial can start']
  // The same card as the contact page's, confetti and all, by request.
  return (
    <div role="status" className="relative my-auto overflow-hidden px-6 py-10 text-center">
      {[{ x: '12%', y: '10%', c: 'bg-gold-500' }, { x: '86%', y: '8%', c: 'bg-teal-500' }, { x: '8%', y: '44%', c: 'bg-plum-300' }, { x: '91%', y: '40%', c: 'bg-gold-400' }, { x: '20%', y: '24%', c: 'bg-teal-400' }, { x: '78%', y: '24%', c: 'bg-plum-500' }].map((d, i) => (
        <motion.span
          key={i}
          aria-hidden
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 1], scale: [0, 1.2, 1], y: [0, -8, 0] }}
          transition={{ duration: 0.7, delay: 0.25 + i * 0.06 }}
          style={{ left: d.x, top: d.y }}
          className={`absolute size-2.5 rounded-full ${d.c}`}
        />
      ))}
      <motion.div {...pop} transition={{ type: 'spring', stiffness: 220, damping: 16 }} className="relative mx-auto w-fit">
        <img src={A.owl.digital} alt="" aria-hidden className="mx-auto h-36 w-auto drop-shadow-[0_16px_24px_rgba(36,5,31,0.3)] sm:h-40" />
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
      <motion.p {...pop} transition={{ duration: 0.5, delay: 0.22 }} className="mx-auto mt-2 max-w-sm font-ui leading-relaxed text-plum-700">
        Hoot hoot{name ? `, ${name}` : ''}! Your call is booked.
      </motion.p>
      <motion.div {...pop} transition={{ duration: 0.5, delay: 0.3 }} className="mx-auto mt-5 flex max-w-xs items-stretch overflow-hidden rounded-2xl bg-gold-200 text-left ring-1 ring-plum-900/10">
        <span className="grid w-14 shrink-0 place-items-center bg-plum-800 text-gold-400">
          <svg viewBox="0 0 24 24" aria-hidden className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></svg>
        </span>
        <span className="px-4 py-3 font-ui text-plum-700">
          <span className="block text-xs font-bold uppercase tracking-wide">Booked slot</span>
          <span className="block font-semibold">{day}</span>
          <span className="block text-sm">{time} · 30 min</span>
        </span>
      </motion.div>
      <motion.ol {...pop} transition={{ duration: 0.5, delay: 0.38 }} className="mx-auto mt-6 max-w-xs space-y-2 text-left">
        {steps.map((t, i) => (
          <li key={t} className="flex items-center gap-3 font-ui text-sm text-plum-700">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-plum-800 font-bold text-gold-400">{i + 1}</span>
            {t}
          </li>
        ))}
      </motion.ol>
      <motion.div {...pop} transition={{ duration: 0.5, delay: 0.45 }} className="mt-7 flex flex-wrap justify-center gap-3">
        <a href="/pricing" className="btn-type inline-flex h-11 items-center rounded-full bg-gold-500 px-5 font-ui font-semibold text-plum-700 no-underline shadow-[0_5px_0_-1px_var(--color-plum-900)]">
          See Pricing
        </a>
        <button type="button" onClick={onAgain} className="btn-type inline-flex h-11 items-center rounded-full bg-plum-800 px-5 font-ui font-semibold text-white shadow-[0_5px_0_-1px_var(--color-plum-950)]">
          Book another
        </button>
      </motion.div>
    </div>
  )
}
