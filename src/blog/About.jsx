import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import BlogLayout from './BlogLayout'
import { A } from '../lib/assets'
import { WORK } from '../sections/02-portfolio/work'

/**
 * The About page, at `#/about`.
 *
 * Written from the site's own words, by request ("gawa ka na lang") — there
 * was no About copy to work from. So every claim here is one the landing page
 * already makes: the description in `index.html`, the four crafts in What We
 * Do, the three promises in Top Secrets, the ribbon's "No guesswork". It
 * carries no dates, names or places — no founding year, team size or
 * satisfaction score — because none were supplied and an About page is the
 * last place to invent them.
 *
 * The NUMBERS it does carry are counted, not written: see `STATS`. The client
 * asked for figures like the reference's, and said to count them from the
 * portfolio, so each one is a tally of what `work.js` actually holds and
 * moves by itself when an album is added.
 *
 * Arranged after the reference the client sent: an opening statement, who we
 * are, what we do as a row of cards, how we work, and a closing ask.
 */
const CRAFTS = [
  {
    title: 'Design',
    owl: A.owl.vr,
    line: 'How your brand looks, moves and feels.',
    items: ['Logos & Brand Identity', 'Packaging & Collaterals', 'Video Editing', '3D Motion', 'Website', 'UI/UX'],
  },
  {
    title: 'Develop',
    owl: A.owl.develop,
    line: 'The products behind the picture.',
    items: ['Web & Mobile Development', 'Custom Software', 'E-commerce', 'Databases', 'Cloud', 'CMS', 'APIs', 'Maintenance & Optimization'],
  },
  {
    title: 'Digital',
    owl: A.owl.digital,
    line: 'Getting it in front of the right people.',
    items: ['Content Development', 'Social Media Ads', 'Social Listening', 'Digital Films', 'E-commerce', 'Digital Collectible', 'SEO'],
  },
  {
    title: 'AI Tech',
    owl: A.owl.ai,
    line: 'Making the work smarter and faster.',
    items: ['AI Assistants', 'Chatbots', 'Automation', 'Generative AI', 'Analytics', 'Integration'],
  },
]

/**
 * The figures band — every one counted from the portfolio data at build time.
 *
 *   projects     albums on the Portfolio section
 *   pieces       every image and film across those albums
 *   storefronts  the live stores linked from the Shopify album
 *   crafts       the four in What We Do
 *
 * Nothing here is a rounded-up or aspirational number. If a figure looks
 * small, the fix is more work in the portfolio, not a bigger number here.
 */
const STATS = [
  { value: WORK.length, label: 'Projects in our portfolio' },
  { value: WORK.reduce((n, w) => n + w.items.length, 0), label: 'Pieces of work on show' },
  {
    value: WORK.reduce((n, w) => n + w.items.filter((i) => i.link).length, 0),
    label: 'Live storefronts and sites linked',
  },
  { value: 4, label: 'Crafts under one roof' },
]

/** Counts up from zero the first time it scrolls into view. */
function CountUp({ to }) {
  const reduce = useReducedMotion()
  const [shown, setShown] = useState(reduce ? to : 0)
  return (
    <motion.span
      onViewportEnter={() => {
        if (reduce || shown === to) return
        const start = performance.now()
        const tick = (now) => {
          const p = Math.min(1, (now - start) / 1100)
          setShown(Math.round(to * (1 - (1 - p) ** 3)))
          if (p < 1) requestAnimationFrame(tick)
        }
        requestAnimationFrame(tick)
      }}
      viewport={{ once: true, margin: '-10% 0px' }}
    >
      {shown}
    </motion.span>
  )
}

const PROMISES = [
  {
    title: 'Make your brand impossible to ignore',
    copy: 'We blend bold design, storytelling, content and immersive experiences to turn attention into genuine connection — so people do not just notice your brand, they remember it.',
  },
  {
    title: 'Turn ambitious ideas into seamless products',
    copy: 'From websites and mobile apps to e-commerce platforms and custom software, we design and develop digital products that look exceptional, work beautifully and support real business goals.',
  },
  {
    title: 'Make technology work smarter',
    copy: 'We use AI, automation, analytics and intelligent systems to simplify complex work, improve customer experiences and help your business move faster.',
  },
]

export default function About() {
  const [craft, setCraft] = useState(0)
  const reduce = useReducedMotion()

  useEffect(() => {
    document.title = 'About — Planet Owl'
  }, [])

  return (
    <BlogLayout onBlog={false} newsletter={false} page={{ label: 'About', href: '#/about' }}>
      {/* ------------------------------------------------------ opening -- */}
      <header className="bg-[linear-gradient(180deg,#cdd8f4_0%,#dfe7fa_45%,#ffffff_100%)] px-5 pb-14 pt-[clamp(8rem,12vw,10.5rem)] sm:px-8">
        <div className="mx-auto max-w-[1180px]">
          <h1 className="max-w-4xl font-['Momo_Trust_Display'] text-[clamp(2rem,5vw,4rem)] font-normal leading-[1.08] text-plum-700">
            Creative Work, Handled by <span className="text-gold-600">a System of Geniuses</span>
          </h1>
        </div>
      </header>

      {/* --------------------------------------------------- who we are -- */}
      <section className="bg-white px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div>
            <h2 className="font-['Momo_Trust_Display'] text-[clamp(1.7rem,3.4vw,2.7rem)] font-normal leading-[1.1] text-plum-700">
              Who We Are
            </h2>
            <p className="mt-5 font-ui text-lg leading-relaxed text-plum-800">
              Planet Owl is a creative studio. We build identities, websites, apps, AI solutions and
              immersive experiences for brands that rise above the ordinary.
            </p>
            <p className="mt-4 font-ui text-lg leading-relaxed text-plum-800">
              We call the team the flock and the studio the nest. Design, development, digital and
              AI sit under one roof, so an idea does not have to be handed from one agency to the
              next to become real — it is shaped, built and refined in one place before it reaches
              you.
            </p>
          </div>
          <img
            src={A.flock.wide}
            alt="The Planet Owl flock at work"
            loading="lazy"
            className="w-full rounded-[1.75rem] object-cover shadow-[0_30px_60px_-30px_rgba(54,14,57,0.5)]"
          />
        </div>
      </section>

      {/* ------------------------------------------------------ figures -- */}
      <section className="bg-white px-5 pb-14 sm:px-8 sm:pb-20">
        <ul className="mx-auto grid max-w-[1180px] grid-cols-2 gap-x-6 gap-y-10 rounded-[1.75rem] bg-gold-200 p-8 sm:p-12 lg:grid-cols-4">
          {STATS.map((s) => (
            <li key={s.label}>
              <p className="font-['Momo_Trust_Display'] text-[clamp(2.6rem,6vw,4.5rem)] leading-none text-plum-700">
                <CountUp to={s.value} />
              </p>
              <p className="mt-3 font-ui font-semibold leading-snug text-plum-800">{s.label}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* --------------------------------------------------- what we do --
          INTERACTIVE, by request: four tabs, one per craft. Picking one
          brings up that craft's owl and everything it covers. It was four
          still cards. (The client offered made-up figures as the other way
          to fill this page; there are none here — see the note at the top.) */}
      <section className="bg-plum-800 px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="font-['Momo_Trust_Display'] text-[clamp(1.7rem,3.4vw,2.7rem)] font-normal leading-[1.1] text-gold-500">
            Four Crafts, One Nest
          </h2>
          <p className="mt-3 font-ui text-gold-200">Pick a craft to see what is inside it.</p>

          <div role="tablist" aria-label="Crafts" className="mt-8 flex flex-wrap gap-3">
            {CRAFTS.map((c, n) => (
              <button
                key={c.title}
                type="button"
                role="tab"
                id={`craft-tab-${n}`}
                aria-selected={n === craft}
                aria-controls="craft-panel"
                onClick={() => setCraft(n)}
                className={`btn-type rounded-full px-6 py-3 font-ui text-base font-semibold transition-colors ${
                  n === craft
                    ? 'bg-gold-500 text-plum-900 shadow-[0_6px_0_-2px_var(--color-plum-950)]'
                    : 'bg-white/10 text-white hover:bg-white/20'
                }`}
              >
                {c.title}
              </button>
            ))}
          </div>

          <div
            id="craft-panel"
            role="tabpanel"
            aria-labelledby={`craft-tab-${craft}`}
            className="mt-8 overflow-hidden rounded-[1.75rem] bg-white p-6 sm:p-10"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={CRAFTS[craft].title}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduce ? undefined : { opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="grid items-center gap-8 md:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] md:gap-12"
              >
                <img
                  src={CRAFTS[craft].owl}
                  alt=""
                  aria-hidden
                  className="mx-auto h-[min(60vw,18rem)] w-auto object-contain"
                />
                <div>
                  <h3 className="font-['Momo_Trust_Display'] text-[clamp(2rem,4.5vw,3.5rem)] font-normal leading-none text-plum-700">
                    {CRAFTS[craft].title}
                  </h3>
                  <p className="mt-3 font-ui text-lg text-plum-800">{CRAFTS[craft].line}</p>
                  <ul className="mt-6 flex flex-wrap gap-2.5">
                    {CRAFTS[craft].items.map((item) => (
                      <li
                        key={item}
                        className="rounded-full bg-plum-100 px-4 py-2 font-ui text-sm font-semibold text-plum-900"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- how we work -- */}
      <section className="bg-white px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="font-['Momo_Trust_Display'] text-[clamp(1.7rem,3.4vw,2.7rem)] font-normal leading-[1.1] text-plum-700">
            What We Are Here to Do
          </h2>
          <ul className="mt-10 grid gap-8 lg:grid-cols-3">
            {PROMISES.map((p, i) => (
              <li key={p.title} className="border-t-4 border-gold-500 pt-6">
                <p className="font-ui text-sm font-bold text-teal-600">0{i + 1}</p>
                <h3 className="mt-2 font-ui text-xl font-bold leading-snug text-plum-900">{p.title}</h3>
                <p className="mt-3 font-ui leading-relaxed text-plum-800">{p.copy}</p>
              </li>
            ))}
          </ul>

          <p className="mt-14 font-['Momo_Trust_Display'] text-[clamp(1.5rem,3vw,2.3rem)] leading-tight text-plum-700">
            <span className="text-teal-600">No</span> guesswork. <span className="text-teal-600">No</span>{' '}
            revisions. <span className="text-teal-600">No</span> changes.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------ the ask -- */}
      <section className="bg-white px-5 pb-10 sm:px-8">
        <div className="mx-auto max-w-[1180px] rounded-[1.75rem] bg-[#e7b248] p-8 sm:p-12">
          <p className="font-['Momo_Trust_Display'] text-[clamp(1.6rem,3.2vw,2.5rem)] leading-tight text-plum-900">
            But enough about us. Let’s talk about your idea.
          </p>
          <p className="mt-3 max-w-xl font-ui leading-relaxed text-plum-900/85">
            Bring us the ambitious one — the complex one that still feels just out of reach.
          </p>
          <a
            href="#/contact"
            className="btn-type mt-7 inline-flex h-12 items-center rounded-full bg-plum-800 px-6 font-ui font-semibold text-white no-underline shadow-[0_6px_0_-2px_var(--color-plum-950)] transition-colors hover:bg-plum-700"
          >
            Contact Us
          </a>
        </div>
      </section>
    </BlogLayout>
  )
}
