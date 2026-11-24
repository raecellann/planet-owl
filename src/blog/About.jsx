import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useMotionValue, useMotionValueEvent, useScroll, useSpring, useTransform, useVelocity } from 'motion/react'
import { useReducedMotion, useSoftMotion } from '../lib/motionPref'
import BlogLayout from './BlogLayout'
import { A } from '../lib/assets'
import { WORK } from '../sections/02-portfolio/work'
import { PHONE, useMediaQuery } from '../lib/useMediaQuery'
import { useCatchUp } from '../lib/scrollPace'
import SectionBreak from '../components/SectionBreak'
import OwlBubble, { OWL_INTROS } from '../components/OwlBubble'
import owlBold from '../../assets/about-owls/bold.webp'
import owlFlock from '../../assets/about-owls/flock.webp'
import owlBrand from '../../assets/about-owls/brand.webp'
import owlHalo from '../../assets/about-owls/halo.webp'
import owlPlain from '../../assets/about-owls/plain.webp'
import owlTech from '../../assets/about-owls/tech.webp'
import owlHelmet from '../../assets/about-owls/helmet.webp'
import owlMoon from '../../assets/about-owls/moon.webp'

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
/**
 * How the studio works, as values, which is what an agency's About page usually
 * carries. Each line restates something the site already says. No guarantees,
 * turnaround times or revision terms belong here until the studio sets them.
 */
const VALUES = [
  { title: 'Bold Over Safe', owl: owlBold, copy: 'We make work for brands that want to rise above the ordinary and be remembered.' },
  { title: 'One Flock, One Roof', owl: owlFlock, copy: 'Design, development, digital and AI sit together, so your idea never gets passed between agencies.' },
  { title: 'Your Brand, Never a Template', owl: owlBrand, copy: 'Everything we make starts with who you are and is built around your brand.' },
  { title: 'Refined in the Nest', owl: owlHalo, copy: 'Work is shaped, built and polished in one place before it reaches you.' },
  { title: 'Plain Words Welcome', owl: owlPlain, copy: 'Tell us what you need the way you would say it. Working out the rest is our job.' },
  { title: 'Tech With a Purpose', owl: owlTech, copy: 'We use AI and automation where they simplify real work and help your business move faster.' },
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

const STAT_OWLS = [A.owl.flower, owlHelmet, A.owl.tophat, owlMoon]

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
  { src: A.owl.flower, x: 72, y: 3, w: 22 },
  { src: A.owl.pumpkin, x: 0, y: 47, w: 20 },
  { src: A.owl.flame, x: 79, y: 40, w: 20 },
  { src: A.owl.wizard, x: 50, y: 45, w: 38 },
]



// Each about the same length, by request, so every card is the same size and
// its button sits at the same height.
const PROMISES = [
  {
    title: 'Make your brand impossible to ignore',
    copy: 'Bold design, storytelling and immersive experiences that turn attention into a brand people remember.',
  },
  {
    title: 'Turn ambitious ideas into seamless products',
    copy: 'Websites, apps, stores and custom software that look exceptional and work beautifully.',
  },
  {
    title: 'Make technology work smarter',
    copy: 'AI, automation and analytics that simplify complex work and help your business move faster.',
  },
  {
    title: 'Keep every craft under one roof',
    copy: 'Design, development, digital and AI in one nest, so your idea is shaped and built in one place.',
  },
  {
    title: 'Let you try the nest first',
    copy: 'Every plan starts with a free 2-week trial, so you see how the flock handles your brand first.',
  },
]

const VALUE_TONES = ['bg-gold-200', 'bg-[#e7b248]', 'bg-plum-100', 'bg-gold-500', 'bg-white', 'bg-teal-400']

/**
 * Where each card lands: across and down the stage (0 to 1) and its tilt. Two
 * loose rows of three, so the pile still looks tossed but every card can be
 * read once it lands.
 */
const SCATTER = [
  { fx: 0.0, fy: 0.02, rot: -6 },
  { fx: 0.5, fy: 0.08, rot: 4 },
  { fx: 1.0, fy: 0.0, rot: -3 },
  { fx: 0.06, fy: 0.98, rot: 5 },
  { fx: 0.52, fy: 0.92, rot: -5 },
  { fx: 0.96, fy: 1.0, rot: 7 },
]

/** A jolt of tilt from how fast the page is scrolling, eased by a spring. */
function useScrollKick() {
  const { scrollY } = useScroll()
  const speed = useVelocity(scrollY)
  const smooth = useSpring(speed, { stiffness: 160, damping: 30, mass: 0.6 })
  const tilt = useSoftMotion() ? 0 : 3.5
  return useTransform(smooth, [-3000, 0, 3000], [-tilt, 0, tilt], { clamp: true })
}

function CardFace({ v }) {
  return (
    <>
      <div className="flex items-center gap-4">
        <img src={v.owl} alt="" aria-hidden loading="lazy" className="h-16 w-auto max-w-[5rem] object-contain sm:h-20 sm:max-w-[6rem]" />
        <h3 className="font-['Momo_Trust_Display'] text-[clamp(1.25rem,1.8vw,1.6rem)] font-normal leading-[1.1] text-plum-700">{v.title}</h3>
      </div>
      <p className="mt-3 font-ui text-sm leading-relaxed text-plum-700 sm:text-base">{v.copy}</p>
    </>
  )
}

/**
 * One value card on the wide stage. Over its stretch of the scroll it flies in
 * from alternate sides and lands at its own spot and angle; any quick scroll
 * after that gives it a jolt of tilt, like a sticker catching the air.
 */
function ValueCard({ v, i, n, progress, kick }) {
  const spot = SCATTER[i % SCATTER.length]
  // Reduced motion asked for: a short slide in rather than a throw across the screen.
  const travel = useSoftMotion() ? 24 : 110
  const from = i % 2 ? 1 : -1
  const range = [i / (n + 0.5), (i + 0.85) / (n + 0.5)]
  const x = useTransform(progress, range, [`${from * travel}vw`, '0vw'])
  const y = useTransform(progress, range, ['-18svh', '0svh'])
  const land = useTransform(progress, range, [spot.rot + from * 28, spot.rot])
  const rotate = useTransform(() => land.get() + kick.get() * (i % 2 ? -1 : 1))
  return (
    <motion.li
      style={{ x, y, rotate, left: `${spot.fx * 100}%`, top: `${spot.fy * 100}%`, translate: `-${spot.fx * 100}% -${spot.fy * 100}%`, zIndex: i + 1 }}
      className={`absolute w-[31%] rounded-[1.5rem] p-6 shadow-[0_24px_50px_-24px_rgba(20,4,22,0.75)] ${VALUE_TONES[i % VALUE_TONES.length]}`}
    >
      <CardFace v={v} />
    </motion.li>
  )
}

/**
 * On a phone: one loose column, each card tossed in as it scrolls into view.
 * The `li` stays in place and watches the viewport; only the card inside it
 * flies in. (Watching the card itself never fired: parked off to the side,
 * it is never "in view", so the cards never appeared.)
 */
function PhoneValueCard({ v, i, kick }) {
  const travel = useSoftMotion() ? 24 : 110
  const from = i % 2 ? 1 : -1
  const rot = SCATTER[i % SCATTER.length].rot
  // Half the desktop tilt, so a turned card's corners stay on screen.
  const rotate = useTransform(kick, (k) => rot * 0.5 + k * (i % 2 ? -1 : 1))
  return (
    <motion.li initial="off" whileInView="on" viewport={{ once: true, amount: 0.3 }} className={`w-[84%] ${i % 2 ? 'ml-auto mr-1' : 'ml-1'}`}>
      <motion.div
        variants={{ off: { x: `${from * travel}vw`, opacity: 0 }, on: { x: 0, opacity: 1 } }}
        transition={{ type: 'spring', stiffness: 120, damping: 16 }}
        style={{ rotate }}
        className={`rounded-[1.5rem] p-5 shadow-[0_24px_50px_-24px_rgba(20,4,22,0.75)] ${VALUE_TONES[i % VALUE_TONES.length]}`}
      >
        <CardFace v={v} />
      </motion.div>
    </motion.li>
  )
}

/** The values, tossed in like stickers on the scroll. */
function ValuesStack() {
  const reduce = useReducedMotion()
  const phone = useMediaQuery(PHONE)
  const kick = useScrollKick()
  const track = useRef(null)
  const { scrollYProgress: rawProgress } = useScroll({ target: track, offset: ['start start', 'end end'] })
  const scrollYProgress = useCatchUp(rawProgress)
  const heading = (
    <h2 className="text-center font-['Momo_Trust_Display'] text-[clamp(1.7rem,3.4vw,2.7rem)] font-normal leading-[1.1] text-gold-500">
      What the Nest Runs On
    </h2>
  )

  if (reduce) {
    return (
      <div className="mx-auto max-w-[1180px] py-14">
        {heading}
        <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {VALUES.map((v, i) => (
            <li key={v.title} className={`rounded-[1.5rem] p-6 ${VALUE_TONES[i % VALUE_TONES.length]}`}>
              <CardFace v={v} />
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (phone) {
    return (
      <div className="overflow-x-clip py-14">
        {heading}
        <ul className="mt-10 space-y-6">
          {VALUES.map((v, i) => (
            <PhoneValueCard key={v.title} v={v} i={i} kick={kick} />
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div ref={track} style={{ height: `${VALUES.length * 55 + 45}svh` }} className="relative">
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden pt-24">
        <div className="mx-auto w-full max-w-[1180px]">
          {heading}
          <ul className="relative mx-auto mt-10 h-[min(36rem,66svh)] w-full">
            {VALUES.map((v, i) => (
              <ValueCard key={v.title} v={v} i={i} n={VALUES.length} progress={scrollYProgress} kick={kick} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

/** Where each promise sends the reader next. */
const PROMISE_CTAS = [
  { label: 'Start a Project', href: '#/contact' },
  { label: 'See Pricing', href: '#/pricing' },
  { label: 'Book a Call', href: '#/contact' },
  { label: 'See Pricing', href: '#/pricing' },
  { label: 'Start Free Trial', href: '#/contact' },
]
const PROMISE_TONES = ['bg-gold-200', 'bg-[#e7b248]', 'bg-plum-800', 'bg-teal-400', 'bg-plum-100']
/** One icon per promise, in place of its number. */
const PROMISE_ICONS = [
  // a megaphone: a brand people notice
  'M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1ZM15 8.5a4 4 0 0 1 0 7M18 6a7.5 7.5 0 0 1 0 12',
  // a screen with code: products that work
  'M3 5h18v12H3zM8 21h8M12 17v4M9.5 9 7.5 11l2 2M14.5 9l2 2-2 2',
  // a chip: smarter technology
  'M7 7h10v10H7zM10 10h4v4h-4zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4',
  // a house: every craft under one roof
  'M3 11 12 4l9 7M5 10v10h14V10M10 20v-5h4v5',
  // a paper plane: try the nest first
  'M21 3 3 10.5l7 2.5 2.5 7L21 3ZM10 13l4.5-4.5',
]

/**
 * One promise on the curved track. `k` is its place on the arc as the page
 * scrolls: 0 is the centre, where it stands up straight; either side it tips
 * down along the curve and fades as it leaves.
 */
function PromiseCard({ p, i, progress, spread, drop }) {
  const n = PROMISES.length
  // One full turn of the track over the scroll. Each card's place wraps round,
  // so both sides of the arc stay full; it jumps ends only while faded out.
  const k = useTransform(progress, (t) => {
    const raw = t * n - i
    return ((((raw + n / 2) % n) + n) % n) - n / 2
  })
  const x = useTransform(k, (v) => `calc(-50% + ${v * spread}%)`)
  const y = useTransform(k, (v) => Math.abs(v) * drop)
  const rotate = useTransform(k, (v) => v * 9)
  const scale = useTransform(k, (v) => 1 - Math.min(Math.abs(v), 2) * 0.1)
  // The centre card is the one to read; its neighbours step back so they
  // frame it rather than compete with it.
  const opacity = useTransform(k, (v) => {
    const a = Math.abs(v)
    const fade = Math.max(0, Math.min(1, (2.45 - a) * 3))
    return fade * (a < 1 ? 1 - a * 0.78 : 0.22)
  })
  const zIndex = useTransform(k, (v) => Math.round(10 - Math.abs(v) * 3))
  const dark = PROMISE_TONES[i] === 'bg-plum-800'
  return (
    <motion.li
      style={{ x, y, rotate, scale, opacity, zIndex }}
      className={`absolute left-1/2 top-0 flex h-[21rem] w-[min(30rem,84%)] origin-bottom flex-col rounded-[1.75rem] p-6 pb-7 shadow-[0_30px_60px_-30px_rgba(20,4,22,0.55)] sm:h-[22rem] sm:p-9 ${PROMISE_TONES[i]}`}
    >
      <span aria-hidden className={`grid size-12 shrink-0 place-items-center rounded-xl bg-plum-800 text-gold-400 ${dark ? 'ring-2 ring-gold-400/60' : ''}`}>
        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d={PROMISE_ICONS[i]} /></svg>
      </span>
      <h3 className={`mt-3 font-['Momo_Trust_Display'] text-[clamp(1.4rem,2.4vw,1.9rem)] font-normal leading-[1.12] ${dark ? 'text-gold-200' : 'text-plum-700'}`}>{p.title}</h3>
      <p className={`mb-6 mt-3 font-ui text-sm leading-relaxed sm:mt-4 sm:text-base ${dark ? 'text-gold-200' : 'text-plum-700'}`}>{p.copy}</p>
      <a
        href={PROMISE_CTAS[i].href}
        className={`btn-type mt-auto inline-flex h-12 w-fit shrink-0 items-center rounded-full px-6 font-ui font-semibold no-underline shadow-[0_6px_0_-2px_var(--color-plum-950)] transition-colors ${dark ? 'bg-gold-500 text-plum-700 hover:bg-gold-400' : 'bg-plum-800 text-white hover:bg-plum-700'}`}
      >
        {PROMISE_CTAS[i].label}
      </a>
    </motion.li>
  )
}

/**
 * The three promises on a curved track, driven by the scroll, not a timer.
 * The section holds still while the cards travel right along the arc, each
 * standing up as it passes the centre.
 */
function PromiseArc() {
  const reduce = useReducedMotion()
  const phone = useMediaQuery(PHONE)
  const track = useRef(null)
  // Desktop pins the section and turns the cards through the pin. Phones do
  // not pin (a pinned screen leaves too much white above and below the
  // cards, by feedback): the cards turn as the section scrolls past instead.
  const { scrollYProgress: pinned } = useScroll({ target: track, offset: ['start start', 'end end'] })
  const { scrollYProgress: passing } = useScroll({ target: track, offset: ['start 75%', 'end 25%'] })
  const rawProgress = phone ? passing : pinned
  // Snapped to a whole card, so wherever the scroll stops one card is always
  // dead centre; the spring carries the track from one card to the next.
  const snapped = useMotionValue(0)
  useMotionValueEvent(rawProgress, 'change', (v) => snapped.set(Math.round(v * PROMISES.length) / PROMISES.length))
  const scrollYProgress = useSpring(snapped, { stiffness: 140, damping: 22, mass: 0.5 })
  const heading = (
    <h2 className="text-center font-['Momo_Trust_Display'] text-[clamp(1.7rem,3.4vw,2.7rem)] font-normal leading-[1.1] text-plum-700">
      What We Are Here to Do
    </h2>
  )

  if (reduce) {
    return (
      <div className="mx-auto max-w-[1180px] py-14">
        {heading}
        <ul className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PROMISES.map((p, i) => (
            <li key={p.title} className={`flex flex-col rounded-[1.75rem] p-7 ${PROMISE_TONES[i]} ${PROMISE_TONES[i] === 'bg-plum-800' ? 'text-gold-200' : 'text-plum-700'}`}>
              <h3 className="font-['Momo_Trust_Display'] text-2xl font-normal">{p.title}</h3>
              <p className="mt-3 font-ui leading-relaxed">{p.copy}</p>
              <a href={PROMISE_CTAS[i].href} className="btn-type mt-6 inline-flex h-12 w-fit items-center rounded-full bg-gold-500 px-6 font-ui font-semibold text-plum-700 no-underline">
                {PROMISE_CTAS[i].label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div ref={track} className="relative py-12 sm:h-[420svh] sm:py-0">
      <div className="-mx-5 flex flex-col justify-center overflow-hidden sm:sticky sm:top-0 sm:-mx-8 sm:h-[100svh] sm:pt-20">
        {heading}
        <ul className="relative mx-auto mt-5 h-[22.5rem] w-full sm:mt-10 sm:h-[28rem]">
          {PROMISES.map((p, i) => (
            <PromiseCard key={p.title} p={p} i={i} progress={scrollYProgress} spread={phone ? 108 : 112} drop={phone ? 30 : 44} />
          ))}
        </ul>
      </div>
    </div>
  )
}

export default function About() {
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

      {/* ------------------------------------------------------- values --
          Scattered cards, by request: pinned while each card is tossed in
          from a side and lands at its own spot and tilt. */}
      <SectionBreak edge="top" />
      <section className="-my-px bg-plum-800 px-5 sm:px-8">
        <ValuesStack />
      </section>
      <SectionBreak edge="bottom" />

      {/* -------------------------------------------------- how we work -- */}
      <section className="overflow-x-clip bg-white px-5 sm:px-8">
        <PromiseArc />
      </section>

    </BlogLayout>
  )
}
