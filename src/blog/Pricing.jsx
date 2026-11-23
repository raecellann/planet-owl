import { useEffect } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import BlogLayout from './BlogLayout'
import { A } from '../lib/assets'
import Faq from '../components/Faq'
import StackCards from '../components/StackCards'
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
    document.title = 'Pricing — Planet Owl'
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
              className={`flex flex-col rounded-[1.75rem] p-7 ring-1 ${p.featured ? 'bg-white text-plum-900 ring-[3px] ring-plum-700 shadow-[0_30px_60px_-30px_rgba(54,14,57,0.5)]' : 'bg-white text-plum-900 ring-plum-900/10 shadow-[0_30px_60px_-36px_rgba(54,14,57,0.45)]'}`}
            >
              {/* The owl on TOP of the card and large, by request — it was a
                  5rem figure tucked beside the plan's name. */}
              {/* The tag first, and gold on every card — by request. It sat
                  under the owl, and was lilac on three of the four. */}
              <p className="self-start rounded-full bg-gold-500 px-3 py-1.5 font-ui text-xs font-bold uppercase tracking-wide text-plum-900">
                {p.tag}
              </p>
              <img src={p.owl} alt="" aria-hidden loading="lazy" className="mx-auto mt-5 h-44 w-auto object-contain sm:h-48" />
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
                className={`btn-type mt-6 inline-flex h-12 items-center justify-center rounded-full px-6 font-ui font-semibold no-underline transition-colors ${p.featured ? 'bg-gold-500 text-plum-900 shadow-[0_6px_0_-2px_var(--color-plum-950)] hover:bg-gold-400' : 'bg-plum-800 text-white shadow-[0_6px_0_-2px_var(--color-plum-950)] hover:bg-plum-700'}`}
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
      <section className="bg-plum-800 px-5 pb-24 pt-20 sm:px-8 sm:pb-32 sm:pt-28">
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
            <motion.div variants={TILE} whileHover={reduce ? undefined : { y: -6 }} className="relative overflow-hidden rounded-[1.5rem] bg-teal-400 p-6 text-plum-900 md:row-span-2">
              <img src={A.owl.broom} alt="" aria-hidden loading="lazy" className="pointer-events-none absolute -right-4 bottom-1 w-[58%] max-w-[15rem] object-contain" />
              <h3 className="font-ui text-xl font-bold">Month by month.</h3>
              <p className="mt-2 font-ui leading-snug">One flat price on your plan, billed monthly.</p>
              <ol className="relative mt-6 space-y-4 pl-6">
                <motion.span
                  aria-hidden
                  variants={{ off: { scaleY: 0 }, on: { scaleY: 1, transition: { duration: 1.3, delay: 0.35, ease: 'easeInOut' } } }}
                  className="absolute bottom-2 left-[0.38rem] top-2 w-0.5 origin-top bg-plum-900/50"
                />
                {['Month 1', 'Month 2', 'Month 3', 'Month 4'].map((m, i) => (
                  <li key={m} className="relative font-ui font-semibold">
                    <motion.span
                      aria-hidden
                      variants={{ off: { scale: 0 }, on: { scale: 1, transition: { type: 'spring', stiffness: 420, damping: 18, delay: 0.35 + i * 0.36 } } }}
                      className="absolute -left-6 top-1 size-3.5 rounded-full bg-plum-800"
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
                className={`flex items-center justify-between gap-3 rounded-[1.5rem] p-6 text-plum-900 ${t.tone}`}
              >
                <div>
                  <h3 className="font-ui text-xl font-bold">{t.title}</h3>
                  <p className="mt-2 font-ui leading-snug">{t.copy}</p>
                </div>
                <img src={t.owl} alt="" aria-hidden loading="lazy" className="h-28 w-28 shrink-0 object-contain" />
              </motion.div>
            ))}
            <motion.div variants={TILE} whileHover={reduce ? undefined : { y: -6 }} className="rounded-[1.5rem] bg-gold-500 p-6 text-plum-900 md:col-span-3">
              <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="font-ui text-xl font-bold">Free 2-week trial.</h3>
                  <p className="mt-2 font-ui leading-snug">See how the nest handles your brand first.</p>
                </div>
                <img src={A.owl.pilot} alt="" aria-hidden loading="lazy" className="mx-auto h-28 w-auto object-contain" />
                <ol className="flex items-center gap-3 font-ui text-sm font-bold">
                  {['Try', 'Decide', 'Stay'].map((t, i) => (
                    <li key={t} className="flex items-center gap-3">
                      {i > 0 && (
                        <motion.span
                          aria-hidden
                          variants={{ off: { scaleX: 0 }, on: { scaleX: 1, transition: { duration: 0.4, delay: 0.5 + i * 0.5 } } }}
                          className="h-0.5 w-8 origin-left bg-plum-900/60"
                        />
                      )}
                      <motion.span
                        variants={{ off: { opacity: 0, scale: 0.7 }, on: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 380, damping: 20, delay: 0.55 + i * 0.5 } } }}
                        className="rounded-full bg-plum-800 px-4 py-2 text-white"
                      >
                        {t}
                      </motion.span>
                    </li>
                  ))}
                </ol>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------ how it works --
          A ROADMAP that draws itself, by request ("animated, like an
          explainer"). It was three still columns. Now a gold line runs
          through three numbered stops; when the section scrolls into view
          the line draws from the first stop to the last, and each stop and
          its text arrive as the line reaches them. Across from `lg` up,
          down the left edge below it. Once only — it does not replay on
          every pass. */}
      <section className="bg-white px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="font-['Momo_Trust_Display'] text-[clamp(1.7rem,3.4vw,2.7rem)] font-normal leading-[1.1] text-plum-700">
            How It Works
          </h2>
          <motion.ol
            initial={reduce ? false : 'off'}
            whileInView="on"
            viewport={{ once: true, margin: '-20% 0px' }}
            className="relative mt-12 grid gap-12 pl-14 lg:grid-cols-3 lg:gap-10 lg:pl-0 lg:pt-20"
          >
            {/* the road: vertical on phones, horizontal from `lg` */}
            <span aria-hidden className="absolute bottom-2 left-[1.375rem] top-2 w-1 rounded-full bg-plum-100 lg:bottom-auto lg:left-0 lg:right-0 lg:top-[1.625rem] lg:h-1 lg:w-auto" />
            <motion.span
              aria-hidden
              variants={{ off: { scaleX: 0, scaleY: 0 }, on: { scaleX: 1, scaleY: 1 } }}
              transition={{ duration: 1.8, ease: [0.4, 0, 0.2, 1] }}
              className="absolute bottom-2 left-[1.375rem] top-2 w-1 origin-top rounded-full bg-gold-500 lg:bottom-auto lg:left-0 lg:right-0 lg:top-[1.625rem] lg:h-1 lg:w-auto lg:origin-left"
            />
            {STEPS.map((st, i) => (
              <li key={st.n} className="relative">
                <motion.span
                  aria-hidden
                  variants={{ off: { scale: 0, opacity: 0 }, on: { scale: 1, opacity: 1 } }}
                  transition={{ type: 'spring', stiffness: 380, damping: 20, delay: 0.15 + i * 0.6 }}
                  className="absolute -left-14 top-0 grid size-12 place-items-center rounded-full bg-plum-800 font-ui text-base font-bold text-gold-500 shadow-[0_6px_0_-2px_var(--color-plum-950)] lg:-top-20 lg:left-0"
                >
                  {st.n}
                </motion.span>
                <motion.div
                  variants={{ off: { opacity: 0, y: 18 }, on: { opacity: 1, y: 0 } }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay: 0.3 + i * 0.6 }}
                >
                  <h3 className="font-ui text-2xl font-bold text-plum-900">{st.title}</h3>
                  <p className="mt-2 max-w-sm font-ui text-lg leading-relaxed text-plum-800">{st.copy}</p>
                </motion.div>
              </li>
            ))}
          </motion.ol>
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
