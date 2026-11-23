import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import BlogLayout from './BlogLayout'
import { A } from '../lib/assets'
import Faq from '../components/Faq'
import StackCards from '../components/StackCards'
import SectionBreak from '../components/SectionBreak'
import cloudImg from '../../assets/section 2/image 35 copy.png'

/**
 * The pricing page, at `#/pricing`.
 *
 * The four plans, their names and their prices are the proposal the client
 * approved in chat ("g sa pricing"): the studio had no price list, so the
 * figures were set against what comparable subscription studios publish —
 * design-only services start around $600–$1,000 a month, the reference the
 * client sent runs $995 / $1,595 / $2,595 / from $3,995, and development
 * subscriptions run from about $800 to $5,000 and up.
 *
 * What each plan INCLUDES is the site's own list of crafts from What We Do,
 * split so each plan adds one craft to the one before it. The page states no
 * turnaround time, number of active requests, revision policy or guarantee:
 * the client was asked for those and has not set them, and a pricing page is
 * a promise. Add them to `PLANS` when they are decided.
 */
const PLANS = [
  {
    name: 'Hatchling',
    price: '$895',
    tag: 'Design',
    line: 'A design team for the brand you are getting off the ground.',
    lead: 'Design:',
    items: ['Logos & Brand Identity', 'Packaging & Collaterals', 'Social graphics', 'UI/UX'],
    owl: A.owl.vr,
  },
  {
    name: 'Flock',
    price: '$1,695',
    tag: 'Design + Digital',
    line: 'Design, plus the content and campaigns that put it to work.',
    lead: 'Everything in Hatchling, plus:',
    items: ['Video Editing', '3D Motion', 'Content Development', 'Social Media Ads', 'SEO'],
    owl: A.owl.digital,
  },
  {
    name: 'Nest',
    price: '$2,995',
    tag: 'Design + Digital + Develop',
    line: 'Add the builders: websites, apps and stores, designed and shipped.',
    lead: 'Everything in Flock, plus:',
    items: ['Websites', 'Web & Mobile Development', 'E-commerce', 'CMS', 'Maintenance & Optimization'],
    owl: A.owl.develop,
    featured: true,
  },
  {
    name: 'Parliament',
    price: '$4,495',
    from: true,
    tag: 'All four crafts',
    line: 'The whole nest, with AI and custom software, scoped to you.',
    lead: 'Everything in Nest, plus:',
    items: ['AI Assistants & Chatbots', 'Automation', 'Custom Software', 'Analytics & Integration', 'Custom scope'],
    owl: A.owl.ai,
  },
]

/**
 * "On every plan" — only things the site already says or that follow from how
 * the plans are built. No turnaround, revision count or guarantee: those have
 * not been set (see the note at the top).
 */
const STANDARD = [
  {
    title: 'The Team',
    items: ['The same flock on your brand, month to month', 'Design, digital, development and AI under one roof', 'One place to send every request'],
  },
  {
    title: 'The Work',
    items: ['No guesswork. No revisions. No changes.', 'Refined in the nest before it reaches you', 'Built around your brand, not a template'],
  },
  {
    title: 'The Plan',
    items: ['Billed monthly', 'Starts with a free 2-week trial', 'Move up a plan when you need another craft'],
  },
]

const STEPS = [
  { n: '01', title: 'Tell us what you need', copy: 'Leave your email or send the details on the contact page. Book a call if you would rather talk it through.' },
  { n: '02', title: 'Start your free 2 weeks', copy: 'We set you up on the plan that fits and get to work, so you can see how the nest handles your brand.' },
  { n: '03', title: 'Keep the flock on it', copy: 'Stay on the plan month to month, and step up to the next one when you need another craft.' },
]

/**
 * Try, Decide, Stay, on the scroll. The plane starts parked over "Try"; each
 * stretch of scroll flies it one stop right, uncovering the word it leaves and
 * hiding the next, until it clears "Stay" and leaves the tile.
 */
function PlaneSteps() {
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const { scrollYProgress: s } = useScroll({ target: ref, offset: ['start 92%', 'end 28%'] })
  const left = useTransform(s, [0, 0.14, 0.4, 0.68, 1], ['16.6%', '16.6%', '50%', '83.4%', '135%'])
  const tryOn = useTransform(s, [0.16, 0.28], [0, 1])
  const decideOn = useTransform(s, [0.42, 0.54], [0, 1])
  const stayOn = useTransform(s, [0.7, 0.82], [0, 1])
  const shown = [tryOn, decideOn, stayOn]
  const lineA = useTransform(s, [0.2, 0.4], [0, 1])
  const lineB = useTransform(s, [0.46, 0.68], [0, 1])

  return (
    <div ref={ref} className="relative h-28 w-full shrink-0 md:w-[27rem]">
      <span aria-hidden className="absolute left-[16.6%] top-1/2 h-0.5 w-[33.4%] -translate-y-1/2 overflow-hidden">
        <motion.span style={reduce ? undefined : { scaleX: lineA }} className="block h-full origin-left bg-plum-800" />
      </span>
      <span aria-hidden className="absolute left-1/2 top-1/2 h-0.5 w-[33.4%] -translate-y-1/2 overflow-hidden">
        <motion.span style={reduce ? undefined : { scaleX: lineB }} className="block h-full origin-left bg-plum-800" />
      </span>
      <ol className="relative grid h-full grid-cols-3 place-items-center font-ui text-sm font-bold">
        {['Try', 'Decide', 'Stay'].map((t, i) => (
          <motion.li key={t} style={reduce ? undefined : { opacity: shown[i] }} className="rounded-full bg-plum-800 px-4 py-2 text-white">
            {t}
          </motion.li>
        ))}
      </ol>
      {!reduce && (
        <motion.img
          src={A.owl.plane}
          alt=""
          aria-hidden
          loading="lazy"
          style={{ left, x: '-50%', y: '-50%' }}
          className="pointer-events-none absolute top-1/2 h-28 w-auto max-w-none"
        />
      )}
    </div>
  )
}

const STEP_ART = [A.owl.digital, A.owl.develop, A.owl.ai]

/**
 * The roadmap, as a pinned stage. The title, the three stops and the owl hold
 * still under the navbar while the scroll moves through the steps, so nothing
 * ever slides underneath the title.
 */
function HowItWorks() {
  const reduce = useReducedMotion()
  const track = useRef(null)
  const [active, setActive] = useState(0)

  useEffect(() => {
    const read = () => {
      const el = track.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const travel = r.height - window.innerHeight
      const p = travel > 0 ? Math.min(0.999, Math.max(0, -r.top / travel)) : 0
      setActive(Math.floor(p * STEPS.length))
    }
    read()
    window.addEventListener('scroll', read, { passive: true })
    window.addEventListener('resize', read)
    return () => {
      window.removeEventListener('scroll', read)
      window.removeEventListener('resize', read)
    }
  }, [])

  return (
    <div ref={track} className={reduce ? '' : 'h-[220svh]'}>
      <div className={`flex flex-col pb-6 pt-[calc(max(5.25rem,2.92vw+max(3.25rem,4.4vw))+1.75rem)] lg:pb-[16svh] ${reduce ? '' : 'sticky top-0 h-[100svh]'}`}>
        <div className="grid min-h-0 flex-1 grid-rows-[auto_minmax(0,1fr)] gap-4 lg:grid-cols-2 lg:grid-rows-1 lg:gap-16">
          {/* The title sits directly on top of the first stop. */}
          <div className="flex flex-col lg:justify-center">
          <h2 className="font-['Momo_Trust_Display'] text-[clamp(1.7rem,3.4vw,2.7rem)] font-normal leading-[1.1] text-plum-700">
            How It Hatches
          </h2>
          <ol className="mt-6 flex flex-col">
            {STEPS.map((st, i) => (
              <li key={st.n} className="relative min-h-16 pl-16 last:min-h-12">
                {i < STEPS.length - 1 && (
                  <span aria-hidden className={`absolute bottom-0 left-[1.4375rem] top-12 w-0.5 transition-colors duration-500 ${i < active ? 'bg-gold-500' : 'bg-plum-100'}`} />
                )}
                <span
                  aria-hidden
                  className={`absolute left-0 top-0 grid size-12 place-items-center rounded-full font-ui text-base font-bold transition-colors duration-300 ${
                    i <= active ? 'bg-plum-800 text-gold-500' : 'bg-plum-100 text-plum-700'
                  }`}
                >
                  {st.n}
                </span>
                <h3 className={`flex min-h-12 items-center font-ui text-xl font-bold transition-colors duration-300 lg:text-2xl ${i === active ? 'text-plum-900' : 'text-plum-900/45'}`}>
                  {st.title}
                </h3>
                <div className={`grid transition-[grid-template-rows,opacity] duration-500 ease-out ${i === active || reduce ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                  <p className="max-w-md overflow-hidden pb-4 font-ui leading-relaxed text-plum-800">{st.copy}</p>
                </div>
              </li>
            ))}
          </ol>
          </div>
          <div className="relative flex min-h-0 items-center justify-center">
            <AnimatePresence mode="wait" initial={false}>
              <motion.img
                key={active}
                src={STEP_ART[active]}
                alt=""
                aria-hidden
                initial={reduce ? false : { opacity: 0, y: 22, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduce ? undefined : { opacity: 0, y: -18, scale: 0.97 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="max-h-full w-auto max-w-full object-contain lg:max-h-[26rem]"
              />
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  )
}

const TILE = {
  off: { opacity: 0, y: 28, scale: 0.97 },
  on: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] } },
}

const TILES = [
  { title: 'One flock.', copy: 'Design, digital, development and AI under one roof.', tone: 'bg-white', owl: A.owl.crown },
  { title: 'Move up a plan.', copy: 'Need another craft? Step up to the next one.', tone: 'bg-white', owl: A.owl.astronaut },
  { title: 'Built for your brand.', copy: 'Refined in the nest before it reaches you.', tone: 'bg-white', owl: A.owl.flower },
  { title: 'Custom scope.', copy: 'Parliament is shaped around what you are building.', tone: 'bg-teal-400', owl: A.owl.tophat },
]

const Check = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={`size-5 shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)

export default function Pricing() {
  const reduce = useReducedMotion()

  useEffect(() => {
    document.title = 'Planet Owl'
  }, [])

  return (
    <BlogLayout onBlog={false} newsletter={false} page={{ label: 'Pricing', href: '#/pricing' }}>
      <header className="relative overflow-hidden bg-white px-5 pb-20 pt-[clamp(10rem,15vw,13.5rem)] text-center sm:px-8 sm:pb-24">
        <img src={cloudImg} alt="" aria-hidden style={{ left: 'min(-16vw, calc(50vw - 384px - 34vw))' }} className="pointer-events-none absolute top-[9%] w-[max(13rem,31vw)] max-w-none -scale-x-100 opacity-55" />
        <img src={cloudImg} alt="" aria-hidden style={{ right: 'min(-6vw, calc(50vw - 384px - 17vw))' }} className="pointer-events-none absolute top-[24%] w-[max(7rem,12vw)] max-w-none opacity-40" />
        <img src={cloudImg} alt="" aria-hidden style={{ right: 'min(-15vw, calc(50vw - 384px - 33vw))' }} className="pointer-events-none absolute bottom-[-12%] w-[max(12rem,27vw)] max-w-none opacity-45" />
        <img src={cloudImg} alt="" aria-hidden style={{ left: 'min(-4vw, calc(50vw - 384px - 12vw))' }} className="pointer-events-none absolute bottom-[8%] w-[max(5rem,8vw)] max-w-none opacity-30" />
        <div className="relative mx-auto max-w-3xl">
          <h1 className="font-['Momo_Trust_Display'] text-[clamp(2rem,5vw,3.8rem)] font-normal leading-[1.08] text-plum-700">
            One Nest. Pick How Much of It You Need.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-ui text-lg leading-relaxed text-plum-800">
            Four monthly plans, each adding a craft to the one before it. Every plan starts with a
            free 2-week trial.
          </p>
        </div>
      </header>

      <section className="relative z-10 bg-white px-5 pb-24 pt-2 sm:px-8 sm:pb-32">
        <ul className="mx-auto grid max-w-[1320px] gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((p) => (
            <li
              key={p.name}
              className={`group flex flex-col rounded-[1.75rem] p-7 ring-1 transition-[translate,box-shadow] duration-300 ease-out hover:-translate-y-2.5 hover:!shadow-[0_38px_60px_-26px_rgba(54,14,57,0.6)] motion-reduce:transition-none motion-reduce:hover:translate-y-0 ${p.featured ? 'bg-teal-600 text-white ring-teal-600 shadow-[0_30px_60px_-30px_rgba(54,14,57,0.5)] [&_.text-plum-600]:text-white [&_.text-plum-700]:text-white [&_.text-plum-800]:text-white [&_.text-plum-900]:text-white [&_.text-teal-500]:text-gold-400' : 'bg-white text-plum-900 ring-plum-900/10 shadow-[0_30px_60px_-36px_rgba(54,14,57,0.45)]'}`}
            >
              {/* The owl on TOP of the card and large, by request — it was a
                  5rem figure tucked beside the plan's name. */}
              {/* The tag first, and gold on every card — by request. It sat
                  under the owl, and was lilac on three of the four. */}
              <p className="self-start rounded-full bg-gold-500 px-3 py-1.5 font-ui text-xs font-bold uppercase tracking-wide !text-plum-900">
                {p.tag}
              </p>
              <img src={p.owl} alt="" aria-hidden loading="lazy" className="mx-auto mt-5 h-44 w-auto origin-bottom object-contain transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-3 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:transform-none sm:h-48" />
              <h2 className={`mt-5 font-['Momo_Trust_Display'] text-3xl font-normal text-plum-700`}>
                {p.name}
              </h2>
              <p className="mt-4 font-ui">
                {p.from && <span className={`mr-1.5 text-sm text-plum-600`}>from</span>}
                <span className="text-[2.6rem] font-bold leading-none">{p.price}</span>
                <span className={`text-base text-plum-600`}>/mo</span>
              </p>
              <p className={`mt-3 min-h-[3.5rem] font-ui leading-snug text-plum-800`}>
                {p.line}
              </p>

              <a
                href="#/contact"
                className={`btn-type mt-6 inline-flex h-12 items-center justify-center rounded-full px-6 font-ui font-semibold no-underline transition-colors ${p.featured ? 'bg-gold-500 !text-plum-900 shadow-[0_6px_0_-2px_var(--color-plum-950)] hover:bg-gold-400' : 'bg-plum-800 text-white shadow-[0_6px_0_-2px_var(--color-plum-950)] hover:bg-plum-700'}`}
              >
                {p.from ? 'Let’s Talk' : 'Start Free Trial'}
              </a>

              <p className={`mt-7 font-ui text-sm font-bold text-plum-900`}>{p.lead}</p>
              <ul className="mt-3 space-y-2.5">
                {p.items.map((item) => (
                  <li key={item} className={`flex items-start gap-2.5 font-ui text-plum-800`}>
                    <svg viewBox="0 0 24 24" aria-hidden className={`mt-0.5 size-5 shrink-0 text-teal-500`} fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12.5l4.5 4.5L19 7.5" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------------------------------------- on every plan --
          STACKED, by request ("stack sticky scrolling, so it won't be
          static"). Each panel is `position: sticky` and pins a little lower
          than the one before it, so as the page scrolls the next panel
          slides up and settles on top, leaving the previous one's top edge
          showing behind it — a deck being dealt rather than three boxes in
          a row.

          The offsets clear the fixed nav (8.5rem) and step by 1.75rem. The
          section must not clip (`overflow` stays visible) or the pinning
          stops working. (A plan-by-craft comparison table sat above this;
          it is gone, by request.) */}
      <SectionBreak edge="top" />
      <section className="-my-px bg-plum-800 px-5 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28">
        <div className="mx-auto max-w-[1320px]">
          <div>
            <StackCards
              heading="Standard Issue on Every Plan"
              headingClass="font-['Momo_Trust_Display'] text-[clamp(1.7rem,3.4vw,2.7rem)] font-normal leading-[1.1] text-gold-500"
              tones={['bg-white text-plum-800', 'bg-gold-200 text-plum-900', 'bg-[#e7b248] text-plum-900']}
              items={STANDARD.map((g) => ({
                title: g.title,
                body: (
                  <ul className="space-y-3">
                    {g.items.map((item) => (
                      <li key={item} className="flex items-start gap-3 font-ui text-lg leading-snug">
                        <Check className="mt-1 text-teal-600" />
                        {item}
                      </li>
                    ))}
                  </ul>
                ),
              }))}
            />
          </div>

          {/* The tile grid, laid out after the reference. Its wording is only
              what the studio has actually said. The reference's cancel-anytime,
              refund and no-fee promises are that company's terms, so none is
              repeated here until Planet Owl decides its own. */}
          <h2 className="mt-24 text-center font-['Momo_Trust_Display'] text-[clamp(1.9rem,4vw,3.2rem)] font-normal leading-[1.1] text-gold-500">
            Simple Plans. No Guesswork.
          </h2>
          {/* Tiles rise in one after another when the grid scrolls into view,
              then the two small diagrams inside them play. */}
          <motion.div
            initial={reduce ? false : 'off'}
            whileInView="on"
            viewport={{ once: true, margin: '-15% 0px' }}
            variants={{ on: { transition: { staggerChildren: 0.12 } } }}
            className="mt-10 grid gap-4 md:grid-cols-3"
          >
            <motion.div variants={TILE} whileHover={reduce ? undefined : { y: -6 }} className="group relative overflow-hidden rounded-[1.5rem] bg-teal-400 p-6 text-plum-900 md:row-span-2">
              <img src={A.owl.broom} alt="" aria-hidden loading="lazy" className="pointer-events-none absolute -right-4 bottom-1 w-[58%] max-w-[15rem] object-contain origin-bottom transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100" />
              <h3 className="font-ui text-xl font-bold">Month by month.</h3>
              <p className="mt-2 font-ui leading-snug">One flat price on your plan, billed monthly.</p>
              <ol className="relative mt-6 space-y-4 pl-6">
                <motion.span
                  aria-hidden
                  variants={{ off: { scaleY: 0 }, on: { scaleY: 1, transition: { duration: 1.3, delay: 0.35, ease: 'easeInOut' } } }}
                  className="absolute bottom-[0.6rem] left-[0.375rem] top-[0.6rem] w-0.5 origin-top bg-plum-800"
                />
                {['Month 1', 'Month 2', 'Month 3', 'Month 4'].map((m, i) => (
                  <li key={m} className="relative font-ui font-semibold">
                    <motion.span
                      aria-hidden
                      variants={{ off: { scale: 0 }, on: { scale: 1, transition: { type: 'spring', stiffness: 420, damping: 18, delay: 0.35 + i * 0.36 } } }}
                      className="absolute -left-6 top-1 z-10 size-3.5 rounded-full bg-plum-800"
                    />
                    {m}
                  </li>
                ))}
              </ol>
            </motion.div>
            {TILES.map((t) => (
              <motion.div
                key={t.title}
                variants={TILE}
                whileHover={reduce ? undefined : { y: -6 }}
                className={`group flex items-center justify-between gap-3 rounded-[1.5rem] p-6 text-plum-900 ${t.tone}`}
              >
                <div>
                  <h3 className="font-ui text-xl font-bold">{t.title}</h3>
                  <p className="mt-2 font-ui leading-snug">{t.copy}</p>
                </div>
                <img src={t.owl} alt="" aria-hidden loading="lazy" className="h-28 w-28 shrink-0 object-contain origin-bottom transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:rotate-0 motion-reduce:group-hover:scale-100" />
              </motion.div>
            ))}
            <motion.div variants={TILE} whileHover={reduce ? undefined : { y: -6 }} className="overflow-hidden rounded-[1.5rem] bg-gold-500 p-6 text-plum-900 md:col-span-3">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-ui text-xl font-bold">Free 2-week trial.</h3>
                  <p className="mt-2 font-ui leading-snug">See how the nest handles your brand first.</p>
                </div>
                <PlaneSteps />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      <SectionBreak edge="bottom" />

      {/* ------------------------------------------------ how it works --
          A ROADMAP that draws itself, by request ("animated, like an
          explainer"). It was three still columns. Now a gold line runs
          through three numbered stops; when the section scrolls into view
          the line draws from the first stop to the last, and each stop and
          its text arrive as the line reaches them. Across from `lg` up,
          down the left edge below it. Once only — it does not replay on
          every pass. */}
      <section className="bg-white px-5 sm:px-8">
        <div className="mx-auto max-w-[1320px]">
          <HowItWorks />
        </div>
      </section>

      {/* --------------------------------------------------------- FAQ -- */}
      {/* White with clouds off the edges, by request — it sat on a pale
          yellow band. The clouds stop short of the 1320px column, so they
          frame the questions rather than sitting under them. */}
      <section className="relative overflow-hidden bg-white px-5 py-14 sm:px-8 sm:py-20">
        <img src={cloudImg} alt="" aria-hidden loading="lazy" style={{ left: 'min(-15vw, calc(50vw - 660px - 27vw))' }} className="pointer-events-none absolute top-[-4%] w-[max(13rem,29vw)] max-w-none -scale-x-100 opacity-55" />
        <img src={cloudImg} alt="" aria-hidden loading="lazy" style={{ right: 'min(-10vw, calc(50vw - 660px - 20vw))' }} className="pointer-events-none absolute top-[47%] w-[max(7rem,10vw)] max-w-none opacity-35" />
        <img src={cloudImg} alt="" aria-hidden loading="lazy" style={{ right: 'min(-14vw, calc(50vw - 660px - 30vw))' }} className="pointer-events-none absolute bottom-[-6%] w-[max(13rem,28vw)] max-w-none opacity-45" />
        <img src={cloudImg} alt="" aria-hidden loading="lazy" style={{ left: 'min(-8vw, calc(50vw - 660px - 15vw))' }} className="pointer-events-none absolute bottom-[31%] w-[max(6rem,8vw)] max-w-none opacity-30" />
        <div className="relative mx-auto max-w-[1320px]">
          <Faq tone="light" askHref="#/contact" />
        </div>
      </section>

    </BlogLayout>
  )
}
