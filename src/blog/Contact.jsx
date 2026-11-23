import { useEffect, useMemo, useRef, useState } from 'react'
import { useReducedMotion } from 'motion/react'
import BlogLayout from './BlogLayout'
import { CONTACT_EMAIL, submitContact } from '../lib/signup'
import { A } from '../lib/assets'
import cloudImg from '../../assets/section 2/image 35 copy.png'

/**
 * The contact page, at `#/contact` — a message form that can also book a call.
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
  'mt-1.5 w-full rounded-xl border-2 border-plum-900/15 bg-white px-4 py-3 font-ui text-base text-plum-900 placeholder:text-plum-900/40 transition-colors focus:border-plum-700 focus:outline-none'

export default function Contact() {
  const [form, setForm] = useState(EMPTY)
  const [state, setState] = useState('idle') // idle | sending | sent | error
  const [error, setError] = useState('')

  useEffect(() => {
    document.title = 'Contact | Planet Owl'
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

  const onSubmit = async (e) => {
    e.preventDefault()
    if (state === 'sending') return
    setState('sending')
    setError('')
    try {
      await submitContact({ ...form, timezone: form.date ? timezone : '' })
      setState('sent')
    } catch (err) {
      setError(err.message)
      setState('error')
    }
  }

  const booked = Boolean(form.date)

  // "Book a call" on the left: glide to the block, pulse a purple ring round
  // it so the eye lands there, and put the cursor in the date field.
  const bookingRef = useRef(null)
  const reduceMotion = useReducedMotion()
  const goToBooking = (e) => {
    e.preventDefault()
    const box = bookingRef.current
    if (!box) return
    box.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' })
    setTimeout(() => {
      box.querySelector('input')?.focus({ preventScroll: true })
      const ring = (a) => `0 0 0 5px rgba(86, 35, 84, ${a})`
      box.animate(
        [
          { boxShadow: ring(0), transform: 'scale(1)' },
          { boxShadow: ring(0.85), transform: reduceMotion ? 'scale(1)' : 'scale(1.025)' },
          { boxShadow: ring(0.15), transform: 'scale(1)' },
          { boxShadow: ring(0.85), transform: reduceMotion ? 'scale(1)' : 'scale(1.025)' },
          { boxShadow: ring(0), transform: 'scale(1)' },
        ],
        { duration: 1600, easing: 'ease-in-out' },
      )
    }, reduceMotion ? 0 : 520)
  }

  return (
    <BlogLayout onBlog={false} newsletter={false} page={{ label: 'Contact', href: '#/contact' }}>
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
              <ul className="mt-7 space-y-5 font-ui text-lg text-plum-900">
                <li className="flex items-center gap-4">
                  <Icon>
                    <path d="M3 6.5h18v11H3z" />
                    <path d="m3.5 7 8.5 6.5L20.5 7" />
                  </Icon>
                  <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-plum-900 no-underline hover:text-plum-700">
                    {CONTACT_EMAIL}
                  </a>
                </li>
                <li className="flex items-center gap-4">
                  <Icon>
                    <rect x="3.5" y="5" width="17" height="15" rx="2.5" />
                    <path d="M3.5 9.5h17M8 3v4M16 3v4" />
                  </Icon>
                  <a href="#book" onClick={goToBooking} className="font-semibold text-plum-900 no-underline hover:text-plum-700">
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
                  <Icon>
                    <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 0 0 6 6l1.5-2 4 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5z" />
                  </Icon>
                  <a href="tel:+639679812402" className="font-semibold text-plum-900 no-underline hover:text-plum-700">
                    0967 981 2402
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
                <div role="status" className="py-10 text-center">
                  <h3 className="font-['Momo_Trust_Display'] text-3xl font-normal text-plum-700">
                    {booked ? 'Call requested!' : 'Message sent!'}
                  </h3>
                  <p className="mx-auto mt-4 max-w-sm font-ui leading-relaxed text-plum-800">
                    {booked
                      ? `Thanks, ${form.firstName || 'friend'}. We have your request for ${form.date}${form.time ? ` at ${form.time}` : ''} and will confirm it by email.`
                      : `Thanks, ${form.firstName || 'friend'}. We will get back to you by email.`}
                  </p>
                  <button
                    type="button"
                    onClick={() => { setForm(EMPTY); setState('idle') }}
                    className="mt-7 font-ui font-semibold text-teal-600 underline"
                  >
                    Send another
                  </button>
                </div>
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
                    <p className="font-ui text-base font-bold text-plum-900">Book a call (optional)</p>
                    <div className="mt-4 grid gap-4 sm:grid-cols-2">
                      <Field label="Preferred Date">
                        <input type="date" min={today} value={form.date} onChange={set('date')} className={FIELD} />
                      </Field>
                      <Field label="Preferred Time">
                        <select value={form.time} onChange={set('time')} required={booked} className={FIELD}>
                          <option value="">Choose a time</option>
                          {SLOTS.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </Field>
                    </div>
                  </fieldset>

                  <Field label="Message" className="mt-6">
                    <textarea rows={5} value={form.message} onChange={set('message')} placeholder="Tell us about your project" className={`${FIELD} resize-y`} />
                  </Field>

                  {state === 'error' && (
                    <p role="alert" className="mt-4 font-ui text-sm font-semibold text-red-700">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={state === 'sending'}
                    className="btn-type mt-7 rounded-full bg-gold-500 px-8 py-3.5 font-ui text-base font-semibold text-plum-900 shadow-[0_6px_0_-2px_var(--color-plum-900),0_18px_30px_-16px_rgba(54,14,57,0.6)] transition-colors hover:bg-gold-400 disabled:cursor-wait disabled:opacity-70"
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
            <p className="mx-auto mt-5 max-w-2xl font-ui text-lg leading-relaxed text-plum-800">
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
    <label className={`block font-ui text-sm font-semibold text-plum-900 ${className}`}>
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
