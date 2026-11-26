import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'motion/react'
import { useReducedMotion } from '../lib/motionPref'
import BlogLayout from './BlogLayout'
import { CONTACT_EMAIL, submitContact } from '../lib/signup'
import { A } from '../lib/assets'
import { DatePicker, TimePicker } from './BookingPickers'
import cloudImg from '../../assets/section 2/image 35 copy.png'

/**
 * The contact page, at `/contact` — a message form that can also book a call.
 *
 * Laid out after the reference the client sent: the ways to reach the studio
 * down the left, the form in a white card on the right, stacked on a phone.
 * The copy, colours and owl are Planet Owl's own.
 *
 * "Book directly" is the second half of the form: a date and a time. They are
 * a REQUEST — see `submitContact` — and the page says the studio confirms by
 * email, because nothing behind this form can hold a slot. If a calendar tool
 * is connected later, that block is the one to swap for its embed.
 *
 * Borrowing `BlogLayout` for the frame, like the privacy page does.
 */

/** Half-hour call slots across the working day. */
const SLOTS = Array.from({ length: 17 }, (_, i) => {
  const mins = 9 * 60 + i * 30
  const h = Math.floor(mins / 60)
  const m = mins % 60
  const label = `${((h + 11) % 12) + 1}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`
  return label
})

/**
 * The weather behind the page: the studio's own puff, five times over at five
 * different sizes, on white (both by request — the page opened on the blog's
 * lavender sky before).
 *
 * [left or right edge, top, width, opacity, mirrored]. Widths are `vw` with a
 * `rem` floor so the small ones do not vanish on a phone. They sit behind the
 * content (`z-0` under its `z-10`) and bleed off the sides, which the
 * wrapper's `overflow-hidden` trims, so none of them can widen the page.
 *
 * Kept OFF the text, by request. The first set had one puff drifting through
 * the contact details and another under the heading, which greyed the type.
 * Every one now hangs off an edge with at most a fifth of its width in the
 * margin beside the content column: the column is 1180px wide and centred,
 * so each cloud's inboard edge stops short of it (`calc(50% - 590px)` from
 * its own side), and the small centre one is gone. On windows narrower than
 * the column they are pushed almost entirely off screen rather than under
 * the words.
 */
const CLOUDS = [
  { side: 'left', at: 'min(-17vw, calc(50vw - 590px - 31vw))', top: '-1rem', w: 'max(14rem,32vw)', o: 0.55, flip: true },
  { side: 'left', at: 'min(-3vw, calc(50vw - 590px - 8vw))', top: '15rem', w: 'max(5rem,7vw)', o: 0.3, flip: false },
  { side: 'right', at: 'min(-5vw, calc(50vw - 590px - 11vw))', top: '21rem', w: 'max(7rem,11vw)', o: 0.4, flip: true },
  { side: 'right', at: 'min(-19vw, calc(50vw - 590px - 36vw))', top: '43rem', w: 'max(15rem,37vw)', o: 0.5, flip: false },
  { side: 'left', at: 'min(-9vw, calc(50vw - 590px - 17vw))', top: '61rem', w: 'max(9rem,17vw)', o: 0.38, flip: false },
]

/**
 * Calendly's confirm form for one requested slot, name and email filled in.
 * Used while Calendly's API is not connected: the request still goes in, and
 * this link (on the card and in the email) puts it on the calendar in one click.
 * `date` is yyyy-mm-dd and `time` like "2:30 PM", both in the visitor's own zone.
 */
const CALENDLY = 'https://calendly.com/planetowlstudio/30min'
function calendlyLink({ date, time, firstName, lastName, email }) {
  const m = String(time || '').match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (!date || !m) return ''
  const h = (Number(m[1]) % 12) + (m[3].toUpperCase() === 'PM' ? 12 : 0)
  const [y, mo, d] = date.split('-').map(Number)
  const at = new Date(y, mo - 1, d, h, Number(m[2]))
  if (Number.isNaN(at.getTime())) return ''
  const q = new URLSearchParams({ name: `${firstName || ''} ${lastName || ''}`.trim(), email: email || '' })
  return `${CALENDLY}/${at.toISOString().replace('.000Z', 'Z')}?${q}`
}

const EMPTY = {
  firstName: '',
  lastName: '',
  company: '',
  email: '',
  website: '',
  phone: '',
  date: '',
  time: '',
  message: '',
}

const FIELD =
  'mt-1.5 w-full rounded-xl border-2 border-plum-900/15 bg-white px-4 py-3 font-ui text-base text-plum-700 placeholder:text-plum-700/40 transition-colors focus:border-plum-700 focus:outline-none'

export default function Contact() {
  const [form, setForm] = useState(EMPTY)
  const [state, setState] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Planet Owl'
  }, [])

  // Today, in the visitor's own calendar, as the earliest bookable day.
  const today = useMemo(() => {
    const d = new Date()
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }, [])
  // Sent with the request so "2:00 PM" means something to whoever reads it.
  const timezone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || ''
    } catch {
      return ''
    }
  }, [])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  // Open times for the chosen day, straight from Calendly (see api/book.js).
  // `live` is false when Calendly is not connected yet: the form then offers
  // the fixed half-hour slots and sends a call REQUEST, as before.
  const [cal, setCal] = useState({ date: '', live: false, loading: false, slots: [] })
  useEffect(() => {
    if (!form.date) return undefined
    let gone = false
    setCal({ date: form.date, live: false, loading: true, slots: [] })
    fetch(`/api/book?date=${form.date}&tz=${encodeURIComponent(timezone || 'UTC')}`)
      .then((r) => (r.ok ? r.json() : Promise.reject(r.status)))
      .then((d) => !gone && setCal({ date: form.date, live: true, loading: false, slots: d.slots || [] }))
      .catch(() => !gone && setCal({ date: form.date, live: false, loading: false, slots: [] }))
    return () => {
      gone = true
    }
  }, [form.date, timezone])

  const slotLabel = (iso) =>
    new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', timeZone: timezone || undefined })
  const liveSlots = cal.live && cal.date === form.date ? cal.slots : null
  const timeOptions = liveSlots ? liveSlots.map(slotLabel) : SLOTS
  const pickedIso = liveSlots ? liveSlots.find((iso) => slotLabel(iso) === form.time) : null
  // Set once Calendly has taken the booking, so the card can say so.
  const [confirmed, setConfirmed] = useState(false)

  const onSubmit = async (e) => {
    e.preventDefault()
    if (state === 'sending') return
    setState('sending')
    setError('')
    try {
      if (form.date && pickedIso) {
        const res = await fetch('/api/book', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ ...form, start_time: pickedIso, timezone }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(data.error || 'We could not book the call just now. Please try again.')
        setConfirmed(true)
        // The studio inbox still hears about it, with everything they typed.
        submitContact({ ...form, timezone, booked: 'yes, on Calendly' }, { autoReply: false }).catch(() => {})
      } else {
        setConfirmed(false)
        await submitContact({ ...form, timezone: form.date ? timezone : '', calendlyLink: form.date ? calendlyLink(form) : '' })
      }
      setState('sent')
    } catch (err) {
      setError(err.message)
      setState('error')
    }
  }

  const booked = Boolean(form.date)

  // "Book a call" on the left: glide to the block, bring up a soft gold halo
  // so the eye lands there, and put the cursor in the date field.
  const bookingRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const goToBooking = (e) => {
    e.preventDefault()
    const box = bookingRef.current
    if (!box) return
    box.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
    setTimeout(() => {
      box.querySelector('button')?.focus({ preventScroll: true })
      if (reduceMotion) return
      // A soft gold halo that rises and settles once, while the fields lift
      // into place one after another.
      const ease = 'cubic-bezier(0.22, 1, 0.36, 1)'
      box.animate(
        [
          { boxShadow: '0 0 0 0 rgba(240,185,57,0), 0 0 0 0 rgba(54,14,57,0)' },
          { boxShadow: '0 0 0 2px rgba(240,185,57,0.9), 0 22px 46px -20px rgba(54,14,57,0.4)', offset: 0.35 },
          { boxShadow: '0 0 0 0 rgba(240,185,57,0), 0 0 0 0 rgba(54,14,57,0)' },
        ],
        { duration: 1900, easing: ease },
      )
      box.querySelectorAll('p, label').forEach((el, i) => {
        el.animate(
          [{ opacity: 0.35, transform: 'translateY(8px)' }, { opacity: 1, transform: 'translateY(0)' }],
          { duration: 700, delay: i * 90, easing: ease, fill: 'backwards' },
        )
      })
    }, reduceMotion ? 0 : 520)
  }

  return (
    <BlogLayout onBlog={false} newsletter={false} page={{ label: 'Contact', href: '/contact' }}>
      <div className="relative overflow-hidden bg-white px-5 pb-10 pt-[clamp(10rem,15vw,13.5rem)] sm:px-8">
        {CLOUDS.map((c, i) => (
          <img
            key={i}
            src={cloudImg}
            alt=""
            aria-hidden
            loading="lazy"
            style={{ [c.side]: c.at, top: c.top, width: c.w, opacity: c.o, transform: c.flip ? 'scaleX(-1)' : undefined }}
            className="pointer-events-none absolute z-0 max-w-none select-none"
          />
        ))}
        <div className="relative z-10 mx-auto max-w-[1180px]">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
            {/* ------------------------------------------- ways to reach us -- */}
            <div>
              <h1 className="font-['Momo_Trust_Display'] text-[clamp(2rem,4.6vw,3.6rem)] font-normal leading-[1.1] text-plum-700">
                Contact Us
              </h1>
              <ul className="mt-7 space-y-5 font-ui text-lg text-plum-700">
                <li className="flex items-center gap-4">
                  <Icon>
                    <path d="M3 6.5h18v11H3z" />
                    <path d="m3.5 7 8.5 6.5L20.5 7" />
                  </Icon>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-plum-700 no-underline hover:text-plum-700">
                    {CONTACT_EMAIL}
                  </a>
                </li>
                <li className="flex items-center gap-4">
                  <Icon>
                    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
                    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
                  </Icon>
                  <a href="#book" onClick={goToBooking} className="font-semibold text-plum-700 no-underline hover:text-plum-700">
                    Book a call
                  </a>
                </li>
                <li className="flex items-center gap-4">
                  <Icon>
                    <path d="M4 5.5h16v10H9l-5 4z" />
                  </Icon>
                  <span>Or leave a message in the form</span>
                </li>
                {/* The studio's own phone and address, as the client gave
                    them. (Earlier asks were for a made-up US address; those
                    were not used.) */}
                <li className="flex items-center gap-4">
                  {/* WhatsApp, by request: the same number, opening a chat. */}
                  <Icon>
                    <path d="M4 20l1.2-4.1A8.3 8.3 0 1 1 8.4 19L4 20z" />
                    <path d="M9.2 8.4c.2-.5.5-.5.8-.5h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.6l-.5.6c-.1.1-.2.3 0 .5.5.9 1.3 1.7 2.3 2.2.2.1.4.1.5 0l.6-.7c.2-.2.4-.2.6-.1l1.6.8c.2.1.3.2.3.4 0 .5-.3 1.3-.9 1.6-.6.3-1.6.4-3.4-.6-2-1.1-3.3-3.2-3.5-3.6-.2-.4-.8-1.6 0-3.3z" />
                  </Icon>
                  <a href="https://wa.me/639679812402" target="_blank" rel="noopener noreferrer" className="font-semibold text-plum-700 no-underline hover:text-plum-700">
                    0967 981 2402 <span className="font-normal">(WhatsApp)</span>
                  </a>
                </li>
                <li className="flex items-start gap-4">
                  <Icon>
                    <path d="M12 21s-6.5-5.6-6.5-10.5a6.5 6.5 0 0 1 13 0C18.5 15.4 12 21 12 21z" />
                    <circle cx="12" cy="10.5" r="2.3" />
                  </Icon>
                  <address className="not-italic leading-snug">
                    Purok Sampaguita 131B, Tangob,
                    <br />
                    Padre Garcia, Batangas, Philippines
                  </address>
                </li>
              </ul>

              <img
                src={A.owl.develop}
                alt=""
                aria-hidden
                loading="lazy"
                // Larger, by request — it was 17rem and looked lost in the column
                // under the contact details.
                className="mt-10 hidden w-[min(95%,27rem)] select-none [mask-image:linear-gradient(180deg,#000_95%,transparent_100%)] lg:block"
              />
            </div>

            {/* ------------------------------------------------------ the form -- */}
            <div className="rounded-[1.75rem] bg-white p-6 shadow-[0_30px_60px_-30px_rgba(54,14,57,0.5)] ring-1 ring-plum-900/5 sm:p-8">
              {state === 'sent' ? (
                <SentCard booked={booked} confirmed={confirmed} form={form} onAgain={() => { setForm(EMPTY); setConfirmed(false); setState('idle') }} />
              ) : (
                <form onSubmit={onSubmit} noValidate={false}>
                  <div className="grid gap-5 sm:grid-cols-2">
                    <Field label="First Name">
                      <input required autoComplete="given-name" value={form.firstName} onChange={set('firstName')} placeholder="Enter your first name" className={FIELD} />
                    </Field>
                    <Field label="Last Name">
                      <input autoComplete="family-name" value={form.lastName} onChange={set('lastName')} placeholder="Enter your last name" className={FIELD} />
                    </Field>
                  </div>
                  <Field label="Company Name" className="mt-5">
                    <input autoComplete="organization" value={form.company} onChange={set('company')} placeholder="Enter your company name" className={FIELD} />
                  </Field>
                  <Field label="Work Email" className="mt-5">
                    <input required type="email" autoComplete="email" value={form.email} onChange={set('email')} placeholder="Enter your work email" className={FIELD} />
                  </Field>
                  <div className="mt-5 grid gap-5 sm:grid-cols-2">
                    <Field label="Website">
                      <input inputMode="url" autoComplete="url" value={form.website} onChange={set('website')} placeholder="Enter your website" className={FIELD} />
                    </Field>
                    <Field label="Phone Number">
                      <input type="tel" autoComplete="tel" value={form.phone} onChange={set('phone')} placeholder="Enter your phone number" className={FIELD} />
                    </Field>
                  </div>

                  {/* The booking. Optional: leave the date empty and this is
                      a plain message. */}
                  <fieldset ref={bookingRef} id="book-a-call" className="mt-7 scroll-mt-32 rounded-2xl bg-gold-200 p-4 sm:p-5">
                    <legend className="sr-only">Book a call</legend>
                    <p className="font-ui text-base font-bold text-plum-700">Book a call</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Field label="Preferred Date">
                        <DatePicker min={today} value={form.date} onChange={(date) => setForm((f) => ({ ...f, date, time: '' }))} />
                      </Field>
                      <Field label="Preferred Time">
                        <TimePicker value={form.time} options={timeOptions} required={booked} onChange={(time) => setForm((f) => ({ ...f, time }))} />
                      </Field>
                    </div>
                    {booked && cal.date === form.date && (cal.loading || (liveSlots && !liveSlots.length)) && (
                      <p className="mt-3 font-ui text-sm text-plum-700">
                        {cal.loading ? 'Checking the open times…' : 'No open times that day. Try another one!'}
                      </p>
                    )}
                  </fieldset>

                  <Field label="Message (optional)" className="mt-6">
                    <textarea rows={5} value={form.message} onChange={set('message')} placeholder="Tell us about your project" className={`${FIELD} resize-none`} />
                  </Field>

                  {state === 'error' && (
                    <p role="alert" className="mt-4 font-ui text-sm font-semibold text-red-700">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={state === 'sending'}
                    className="btn-type mt-7 rounded-full bg-gold-500 px-8 py-3.5 font-ui text-base font-semibold text-plum-700 shadow-[0_6px_0_-2px_var(--color-plum-900),0_18px_30px_-16px_rgba(54,14,57,0.6)] transition-colors hover:bg-gold-400 disabled:cursor-wait disabled:opacity-70"
                  >
                    {state === 'sending' ? 'Sending…' : booked ? 'Book My Call' : 'Send Message'}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* The page's sign-off, UNDER the form — by request. It used to
              open the page; here it reads as the closing line once the form
              has been seen. */}
          <div className="mx-auto mt-20 max-w-3xl text-center sm:mt-24">
            <h2 className="font-['Momo_Trust_Display'] text-[clamp(1.9rem,4.2vw,3.2rem)] font-normal leading-[1.1] text-plum-700">
              Got a Project? Call in the Owls
            </h2>
            <p className="mx-auto mt-5 max-w-2xl font-ui text-lg leading-relaxed text-plum-700">
              Tell us what you are building, or pick a time and book a call. One of the flock will
              get back to you by email.
            </p>
          </div>
        </div>
      </div>
    </BlogLayout>
  )
}

function Field({ label, className = '', children }) {
  return (
    <label className={`block font-ui text-sm font-semibold text-plum-700 ${className}`}>
      {label}
      {children}
    </label>
  )
}

/** The teal line icons down the left column. */
function Icon({ children }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden
      className="size-8 shrink-0 text-teal-500"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  )
}

/** "Feb 3, 2026" from the form's yyyy-mm-dd. */
const prettyDate = (v) => {
  if (!v) return ''
  const [y, m, d] = v.split('-').map(Number)
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })
}

/**
 * What a visitor sees after sending the form: an owl pops up with a tick,
 * the booked slot is shown as a little ticket, and the next steps and two
 * ways onward are laid out, so it no longer ends on a line of plain text.
 */
function SentCard({ booked, confirmed, form, onAgain }) {
  const name = form.firstName || 'friend'
  const pop = { initial: { opacity: 0, y: 16, scale: 0.96 }, animate: { opacity: 1, y: 0, scale: 1 } }
  const steps = confirmed
    ? ['The invite and call link are in your inbox', "We chop it up on the call", 'Your free 2-week trial can start']
    : booked
    ? ['Lock it in on Calendly (one click)', 'The invite and call link land in your inbox', 'We chop it up, and your free 2-week trial can start']
    : ['We read every message ourselves', 'We reply by email', 'Your free 2-week trial can start']
  return (
    <div role="status" className="relative overflow-hidden py-4 text-center">
      {[{ x: '12%', y: '14%', c: 'bg-gold-500' }, { x: '84%', y: '10%', c: 'bg-teal-500' }, { x: '8%', y: '48%', c: 'bg-plum-300' }, { x: '90%', y: '44%', c: 'bg-gold-400' }, { x: '20%', y: '30%', c: 'bg-teal-400' }, { x: '78%', y: '28%', c: 'bg-plum-500' }].map((d, i) => (
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
        <img src={A.owl.digital} alt="" aria-hidden className="mx-auto h-36 w-auto drop-shadow-[0_16px_24px_rgba(36,5,31,0.3)] sm:h-44" />
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
      <motion.h3 {...pop} transition={{ duration: 0.5, delay: 0.15 }} className="mt-4 font-['Momo_Trust_Display'] text-3xl font-normal text-plum-700">
        {confirmed ? 'You’re on the calendar!' : booked ? 'Call requested!' : 'Message sent!'}
      </motion.h3>
      <motion.p {...pop} transition={{ duration: 0.5, delay: 0.22 }} className="mx-auto mt-2 max-w-sm font-ui leading-relaxed text-plum-700">
        {confirmed ? `Hoot hoot, ${name}! Your call is booked.` : `Thanks, ${name}. ${booked ? 'Your call request is in the nest.' : 'Your message is in the nest.'}`}
      </motion.p>

      {booked && (
        <motion.div {...pop} transition={{ duration: 0.5, delay: 0.3 }} className="mx-auto mt-5 flex max-w-xs items-stretch overflow-hidden rounded-2xl bg-gold-200 text-left ring-1 ring-plum-900/10">
          <span className="grid w-14 shrink-0 place-items-center bg-plum-800 text-gold-400">
            <svg viewBox="0 0 24 24" aria-hidden className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="5" width="17" height="15" rx="2.5" /><path d="M3.5 9.5h17M8 3v4M16 3v4" /></svg>
          </span>
          <span className="px-4 py-3 font-ui text-plum-700">
            <span className="block text-xs font-bold uppercase tracking-wide">{confirmed ? 'Booked slot' : 'Requested slot'}</span>
            <span className="block font-semibold">{prettyDate(form.date)}</span>
            {form.time && <span className="block text-sm">{form.time}</span>}
          </span>
        </motion.div>
      )}

      <motion.ol {...pop} transition={{ duration: 0.5, delay: 0.38 }} className="mx-auto mt-6 max-w-xs space-y-2 text-left">
        {steps.map((t, i) => (
          <li key={t} className="flex items-center gap-3 font-ui text-sm text-plum-700">
            <span className="grid size-7 shrink-0 place-items-center rounded-full bg-plum-800 font-bold text-gold-400">{i + 1}</span>
            {t}
          </li>
        ))}
      </motion.ol>

      {booked && !confirmed && calendlyLink(form) && (
        <motion.div {...pop} transition={{ duration: 0.5, delay: 0.42 }} className="mt-6">
          <p className="font-ui text-sm text-plum-700">Not on the calendar yet. One click puts it there:</p>
          <a
            href={calendlyLink(form)}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-type mt-2 inline-flex h-11 items-center rounded-full bg-teal-500 px-6 font-ui font-semibold text-white no-underline shadow-[0_5px_0_-1px_var(--color-plum-900)] hover:bg-teal-400"
          >
            Lock it in on Calendly →
          </a>
        </motion.div>
      )}

      <motion.div {...pop} transition={{ duration: 0.5, delay: 0.45 }} className="mt-7 flex flex-wrap justify-center gap-3">
        <a href="/pricing" className="btn-type inline-flex h-11 items-center rounded-full bg-gold-500 px-5 font-ui font-semibold text-plum-700 no-underline shadow-[0_5px_0_-1px_var(--color-plum-900)]">
          See Pricing
        </a>
        <a href="/" className="btn-type inline-flex h-11 items-center rounded-full bg-plum-800 px-5 font-ui font-semibold text-white no-underline shadow-[0_5px_0_-1px_var(--color-plum-950)]">
          Back to Home
        </a>
      </motion.div>
      <button type="button" onClick={onAgain} className="mt-4 font-ui text-sm font-semibold text-teal-600 underline">
        Send another
      </button>
    </div>
  )
}
