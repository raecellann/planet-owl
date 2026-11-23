import { useEffect, useMemo, useState } from 'react'
import BlogLayout from './BlogLayout'
import { CONTACT_EMAIL, submitContact } from '../lib/signup'
import { A } from '../lib/assets'

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
    document.title = 'Contact — Planet Owl'
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

  return (
    <BlogLayout onBlog={false} newsletter={false}>
      <div className="bg-[linear-gradient(180deg,#cdd8f4_0%,#dfe7fa_38%,#ffffff_100%)] px-5 pb-16 pt-[clamp(8rem,12vw,10.5rem)] sm:px-8">
        <div className="mx-auto max-w-[1180px]">
          <h1 className="font-['Momo_Trust_Display'] text-[clamp(2rem,4.6vw,3.6rem)] font-normal leading-[1.1] text-plum-700">
            Got a Project? Call in the Owls
          </h1>
          <p className="mt-5 max-w-2xl font-ui text-lg leading-relaxed text-plum-800">
            Tell us what you are building, or pick a time and book a call. One of the flock will get
            back to you by email.
          </p>

          <div className="mt-12 grid gap-10 lg:mt-16 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] lg:gap-16">
            {/* ------------------------------------------- ways to reach us -- */}
            <div>
              <h2 className="font-['Momo_Trust_Display'] text-[clamp(1.7rem,3.2vw,2.6rem)] font-normal leading-[1.1] text-plum-700">
                Contact Us
              </h2>
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
                  <a href="#book" onClick={(e) => { e.preventDefault(); document.getElementById('book-a-call')?.scrollIntoView({ behavior: 'smooth', block: 'center' }) }} className="font-semibold text-plum-900 no-underline hover:text-plum-700">
                    Book a call
                  </a>
                </li>
                <li className="flex items-center gap-4">
                  <Icon>
                    <path d="M4 5.5h16v10H9l-5 4z" />
                  </Icon>
                  <span>Or leave a message in the form</span>
                </li>
              </ul>

              <img
                src={A.owl.develop}
                alt=""
                aria-hidden
                loading="lazy"
                className="mt-10 hidden w-[min(62%,17rem)] select-none [mask-image:linear-gradient(180deg,#000_95%,transparent_100%)] lg:block"
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
                  <fieldset id="book-a-call" className="mt-7 rounded-2xl bg-gold-200 p-4 sm:p-5">
                    <legend className="sr-only">Book a call</legend>
                    <p className="font-ui text-base font-bold text-plum-900">Book a call (optional)</p>
                    <p className="mt-1 font-ui text-sm leading-relaxed text-plum-800">
                      Pick a day and time that suits you{timezone ? `, in your own time (${timezone})` : ''}. We will confirm by email.
                    </p>
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
