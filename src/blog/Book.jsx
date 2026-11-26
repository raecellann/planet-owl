import { useEffect, useState } from 'react'
import { motion } from 'motion/react'
import BlogLayout from './BlogLayout'
import { A } from '../lib/assets'

/**
 * The booking page, at `/book`: Planet Owl's own page around the studio's
 * Calendly calendar. Visitors land here after leaving their email in the
 * "Start a Project" popup (`?email=` is passed on to Calendly so they do not
 * type it twice). The main site's contact form books through api/book.js
 * instead, without leaving the page.
 *
 * Calendly does the real work, holding the slot, sending the invite with the
 * call link and the reminders. Everything around it is ours. The colour
 * params on the iframe only take effect on a paid Calendly plan; on the free
 * plan they are ignored and the calendar keeps Calendly's own blue.
 *
 * Calendly posts messages to the page that embeds it: `calendly.page_height`
 * sizes the frame so it never scrolls inside itself, and
 * `calendly.event_scheduled` swaps the calendar for our own "you're booked"
 * card.
 */
const CALENDLY = 'https://calendly.com/planetowlstudio/30min'

const STEPS = [
  'Grab a day and time that works for y’all',
  'The invite and call link land in your inbox',
  'We chop it up, and your free 2-week trial can start',
]

export default function Book() {
  const [booked, setBooked] = useState(false)
  const [height, setHeight] = useState(700)

  useEffect(() => {
    document.title = 'Planet Owl'
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

  const email = new URLSearchParams(window.location.search).get('email') || ''
  const src = `${CALENDLY}?${new URLSearchParams({
    ...(email ? { email } : {}),
    embed_domain: window.location.hostname,
    embed_type: 'Inline',
    hide_gdpr_banner: '1',
    hide_event_type_details: '1',
    background_color: 'ffffff',
    text_color: '562354',
    primary_color: '3f9f94',
  })}`

  return (
    <BlogLayout onBlog={false} newsletter={false} page={{ label: 'Book a Call', href: '/book' }}>
      <div className="relative overflow-hidden bg-white px-5 pb-16 pt-[clamp(10rem,15vw,13.5rem)] sm:px-8">
        <div className="relative z-10 mx-auto grid max-w-[1180px] gap-10 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:gap-14">
          {/* --------------------------------------------- what the call is -- */}
          <div>
            <p className="font-ui text-sm font-bold uppercase tracking-[0.18em] text-teal-600">30-minute call</p>
            <h1 className="mt-2 font-['Momo_Trust_Display'] text-[clamp(2rem,4.6vw,3.6rem)] font-normal leading-[1.1] text-plum-700">
              Hoot hoot! Let’s Chop It Up
            </h1>
            <p className="mt-5 max-w-md font-ui text-lg leading-relaxed text-plum-700">
              Sooo, what’s eating up your team’s time? Tell us on a quick 30-min call and we’ll find
              the best spot to start. We do the legwork, y’all just show up. 🦉
            </p>
            <ol className="mt-7 max-w-md space-y-3">
              {STEPS.map((t, i) => (
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
              className="mt-10 hidden w-[min(90%,24rem)] select-none [mask-image:linear-gradient(180deg,#000_95%,transparent_100%)] lg:block"
            />
          </div>

          {/* -------------------------------------------------- the calendar -- */}
          <div className="overflow-hidden rounded-[1.75rem] bg-white shadow-[0_30px_60px_-30px_rgba(54,14,57,0.5)] ring-1 ring-plum-900/5">
            <div className="flex items-center gap-3 bg-plum-800 px-6 py-4">
              <img src={A.owl.digital} alt="" aria-hidden className="h-10 w-auto" />
              <div className="font-ui text-white">
                <p className="text-xs font-bold uppercase tracking-wide text-gold-400">Planet Owl Studio</p>
                <p className="font-semibold">30 min call with the flock</p>
              </div>
            </div>
            {booked ? (
              <Booked />
            ) : (
              <iframe
                title="Pick a time for your call with Planet Owl"
                src={src}
                style={{ height }}
                className="block w-full border-0 transition-[height] duration-300"
              />
            )}
          </div>
        </div>
      </div>
    </BlogLayout>
  )
}

/** Shown in place of the calendar once Calendly says the call is booked. */
function Booked() {
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
      <motion.p {...pop} transition={{ duration: 0.5, delay: 0.22 }} className="mx-auto mt-2 max-w-sm font-ui leading-relaxed text-plum-700">
        Your call is booked. The invite with the call link is on its way to your inbox. See you in the nest! 🦉
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
