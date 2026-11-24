import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import BlogLayout from './BlogLayout'
import { A } from '../lib/assets'
import { WORK } from '../sections/02-portfolio/work'
import StackCards from '../components/StackCards'
import SectionBreak from '../components/SectionBreak'
import OwlBubble, { OWL_INTROS } from '../components/OwlBubble'
import owlBold from '../../assets/about-owls/bold.webp'
import owlFlock from '../../assets/about-owls/flock.webp'
import owlBrand from '../../assets/about-owls/brand.webp'
import owlHalo from '../../assets/about-owls/halo.webp'
import owlPlain from '../../assets/about-owls/plain.webp'
import owlTech from '../../assets/about-owls/tech.webp'

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

const VALUE_TONES = ['bg-gold-200', 'bg-[#e7b248]', 'bg-plum-100', 'bg-gold-500', 'bg-white', 'bg-teal-400']

/**
 * One value card in the side stack. Each slides in from the right over its
 * stretch of the scroll and settles a step lower and further right than the
 * one before, so the deck builds up as the reader scrolls.
 */
function ValueCard({ v, i, n, progress }) {
  const start = (i - 1) / n
  const end = i / n
  const x = useTransform(progress, [Math.max(0, start), end], i === 0 ? ['0%', '0%'] : ['120%', '0%'])
  const rotate = useTransform(progress, [Math.max(0, start), end], i === 0 ? [0, 0] : [6, 0])
  return (
    <motion.li
      style={{ x, rotate, top: `calc(var(--step) * ${i})`, left: `calc(var(--step) * ${i})`, width: `calc(100% - var(--step) * ${n - 1})`, zIndex: i + 1 }}
      className={`absolute grid origin-bottom-left items-center gap-4 rounded-[1.75rem] p-6 sm:grid-cols-[auto_minmax(0,1fr)] shadow-[0_24px_50px_-28px_rgba(20,4,22,0.7)] sm:gap-8 sm:p-9 ${VALUE_TONES[i % VALUE_TONES.length]}`}
    >
      <img src={v.owl} alt="" aria-hidden loading="lazy" className="h-20 w-auto max-w-[6rem] object-contain sm:h-44 sm:max-w-[11rem]" />
      <div>
        <p className="font-ui text-sm font-bold text-plum-700">{String(i + 1).padStart(2, '0')}</p>
        <h3 className="mt-1 font-['Momo_Trust_Display'] text-[clamp(1.4rem,2.6vw,2.2rem)] font-normal leading-[1.1] text-plum-700">{v.title}</h3>
        <p className="mt-3 max-w-md font-ui leading-relaxed text-plum-700 sm:text-lg">{v.copy}</p>
      </div>
    </motion.li>
  )
}

/** The values as a pinned stage: the cards deal in from the side on the scroll. */
function ValuesStack() {
  const reduce = useReducedMotion()
  const track = useRef(null)
  const { scrollYProgress } = useScroll({ target: track, offset: ['start start', 'end end'] })
  const heading = (
    <h2 className="font-['Momo_Trust_Display'] text-[clamp(1.7rem,3.4vw,2.7rem)] font-normal leading-[1.1] text-gold-500">
      What the Nest Runs On
    </h2>
  )

  if (reduce) {
    return (
      <div className="mx-auto max-w-[1180px]">
        {heading}
        <ul className="mt-10 space-y-5">
          {VALUES.map((v, i) => (
            <li key={v.title} className={`grid grid-cols-[auto_minmax(0,1fr)] items-center gap-5 rounded-[1.75rem] p-6 ${VALUE_TONES[i % VALUE_TONES.length]}`}>
              <img src={v.owl} alt="" aria-hidden loading="lazy" className="h-28 w-auto max-w-[7rem] object-contain" />
              <div>
                <h3 className="font-['Momo_Trust_Display'] text-2xl font-normal text-plum-700">{v.title}</h3>
                <p className="mt-2 font-ui leading-relaxed text-plum-700">{v.copy}</p>
              </div>
            </li>
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
          <ul className="relative mt-8 h-[min(24rem,58svh)] max-w-[52rem] [--step:0.45rem] sm:mt-10 sm:h-[min(26rem,52svh)] sm:[--step:0.9rem]">
            {VALUES.map((v, i) => (
              <ValueCard key={v.title} v={v} i={i} n={VALUES.length} progress={scrollYProgress} />
            ))}
          </ul>
        </div>
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
          A side stack, by request: pinned while the cards deal in from the
          right, one per stretch of scroll. */}
      <SectionBreak edge="top" />
      <section className="-my-px bg-plum-800 px-5 sm:px-8">
        <ValuesStack />
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
