import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import BlogLayout from './BlogLayout'
import { A } from '../lib/assets'
import { WORK } from '../sections/02-portfolio/work'
import StackCards from '../components/StackCards'
import SectionBreak from '../components/SectionBreak'
import OwlBubble, { OWL_INTROS } from '../components/OwlBubble'

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

const STAT_OWLS = [A.owl.flower, A.owl.crown, A.owl.tophat, A.owl.astronaut]

/**
 * One figure, out of its box. Pointing at it recounts the number, lifts it,
 * draws a gold line under it and brings an owl up beside it. It links to the
 * work it counts.
 */
function StatTile({ stat, owl }) {
  const [run, setRun] = useState(0)
  return (
    <li>
      <a
        href="#portfolio"
        onPointerEnter={() => setRun((r) => r + 1)}
        className="group relative block py-2 no-underline transition-transform duration-300 ease-out hover:-translate-y-1.5 focus-visible:-translate-y-1.5 motion-reduce:transform-none"
      >
        <img
          src={owl}
          alt=""
          aria-hidden
          loading="lazy"
          className="pointer-events-none absolute right-0 top-0 h-16 w-auto origin-bottom translate-y-3 scale-75 opacity-0 transition-[translate,scale,opacity,rotate] duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:translate-y-0 group-hover:-rotate-6 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:scale-100 group-focus-visible:opacity-100 sm:h-20"
        />
        <p className="font-['Momo_Trust_Display'] text-[clamp(2.6rem,6vw,4.5rem)] leading-none text-plum-700 transition-colors duration-300 group-hover:text-teal-600">
          <CountUp key={run} to={stat.value} />
        </p>
        <span aria-hidden className="mt-3 block h-1 w-full origin-left scale-x-[0.18] rounded-full bg-gold-500 transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100" />
        <p className="mt-3 font-ui font-semibold leading-snug text-plum-700">{stat.label}</p>
      </a>
    </li>
  )
}

/** The flock around the island: the hero's own owls, at different depths. */
const TEAM = [
  { src: A.owl.tophat, x: 2, y: 10, w: 21 },
  { src: A.owl.crown, x: 25, y: 0, w: 19 },
  { src: A.owl.flower, x: 72, y: 3, w: 22 },
  { src: A.owl.pumpkin, x: 0, y: 47, w: 20 },
  { src: A.owl.flame, x: 79, y: 40, w: 20 },
  { src: A.owl.astronaut, x: 17, y: 66, w: 22 },
  { src: A.owl.wizard, x: 50, y: 45, w: 38 },
]



const PROMISES = [
  {
    title: 'Make your brand impossible to ignore',
    copy: 'We blend bold design, storytelling, content and immersive experiences to turn attention into genuine connection, so people do not just notice your brand, they remember it.',
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
  const [owl, setOwl] = useState(null)

  const closeOwl = useCallback(() => setOwl(null), [])
  const reduce = useReducedMotion()

  useEffect(() => {
    document.title = 'Planet Owl'
  }, [])

  return (
    <BlogLayout onBlog={false} newsletter={false} page={{ label: 'About', href: '#/about' }}>
      {/* --------------------------------------------------- who we are -- */}
      <section className="bg-white px-5 pb-14 pt-[clamp(10rem,15vw,13.5rem)] sm:px-8 sm:pb-20">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div>
            <h1 className="font-['Momo_Trust_Display'] text-[clamp(2rem,4.6vw,3.6rem)] font-normal leading-[1.08] text-plum-700">
              Meet the Owls Behind the Work
            </h1>
            <p className="mt-5 font-ui text-lg leading-relaxed text-plum-700">
              Planet Owl is a creative studio. We build identities, websites, apps, AI solutions and
              immersive experiences for brands that rise above the ordinary.
            </p>
            <p className="mt-4 font-ui text-lg leading-relaxed text-plum-700">
              We call the team the flock and the studio the nest. Design, development, digital and
              AI sit under one roof, so an idea does not have to be handed from one agency to the
              next to become real. It is shaped, built and refined in one place before it reaches
              you.
            </p>
          </div>
          {/* The whole team on the studio's island, as on the hero. */}
          <div className="relative mx-auto aspect-[1/0.92] w-full max-w-[38rem]">
            <img src={A.island} alt="" loading="lazy" className="absolute bottom-[3%] left-[10%] w-[80%]" />
            {TEAM.map((o) => (
              <button
                key={o.src}
                type="button"
                aria-expanded={owl?.src === o.src}
                aria-label={`Say hello to ${OWL_INTROS[o.src].name}`}
                onClick={(e) => {
                  e.stopPropagation()
                  setOwl(owl?.src === o.src ? null : { src: o.src, rect: e.currentTarget.getBoundingClientRect() })
                }}
                style={{ left: `${o.x}%`, top: `${o.y}%`, width: `${o.w}%` }}
                className={`absolute cursor-pointer rounded-full transition-transform duration-300 hover:-translate-y-2 ${owl?.src === o.src ? 'z-10 scale-110' : ''}`}
              >
                <img src={o.src} alt="" loading="lazy" className="block w-full" />
              </button>
            ))}
            <OwlBubble open={owl} onClose={closeOwl} />
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------ figures -- */}
      <section className="bg-white px-5 pb-14 sm:px-8 sm:pb-20">
        <ul className="mx-auto grid max-w-[1180px] grid-cols-2 gap-x-6 gap-y-10 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <StatTile key={s.label} stat={s} owl={STAT_OWLS[i % STAT_OWLS.length]} />
          ))}
        </ul>
      </section>

      {/* --------------------------------------------------- what we do --
          INTERACTIVE, by request: four tabs, one per craft. Picking one
          brings up that craft's owl and everything it covers. It was four
          still cards. (The client offered made-up figures as the other way
          to fill this page; there are none here — see the note at the top.) */}
      <SectionBreak edge="top" />
      <section className="-my-px bg-plum-800 px-5 py-14 sm:px-8 sm:py-20">
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
                    ? 'bg-gold-500 text-plum-700 shadow-[0_6px_0_-2px_var(--color-plum-950)]'
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
                  <p className="mt-3 font-ui text-lg text-plum-700">{CRAFTS[craft].line}</p>
                  <ul className="mt-6 flex flex-wrap gap-2.5">
                    {CRAFTS[craft].items.map((item) => (
                      <li
                        key={item}
                        className="rounded-full bg-plum-100 px-4 py-2 font-ui text-sm font-semibold text-plum-700"
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
      <SectionBreak edge="bottom" />

      {/* -------------------------------------------------- how we work -- */}
      <section className="bg-white px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1180px]">
          <div>
            <StackCards
              heading="What We Are Here to Do"
              headingClass="font-['Momo_Trust_Display'] text-[clamp(1.7rem,3.4vw,2.7rem)] font-normal leading-[1.1] text-plum-700"
              tones={['bg-gold-200 text-plum-700', 'bg-[#e7b248] text-plum-700', 'bg-plum-800 text-gold-200']}
              items={PROMISES.map((p) => ({
                title: p.title,
                body: <p className="max-w-3xl font-ui text-lg leading-relaxed">{p.copy}</p>,
              }))}
            />
          </div>

        </div>
      </section>

    </BlogLayout>
  )
}
