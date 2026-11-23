import { useEffect } from 'react'
import BlogLayout from './BlogLayout'
import { A } from '../lib/assets'
import Faq from '../components/Faq'

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
 * Which craft each plan reaches — the comparison table. Derived from `PLANS`
 * (each plan adds one craft), written out so the table can name the rows.
 */
const COMPARE = [
  { craft: 'Design', detail: 'Logos, brand identity, packaging, social graphics, UI/UX', from: 0 },
  { craft: 'Digital', detail: 'Video editing, 3D motion, content, social media ads, SEO', from: 1 },
  { craft: 'Develop', detail: 'Websites, web and mobile apps, e-commerce, CMS, maintenance', from: 2 },
  { craft: 'AI Tech', detail: 'AI assistants, chatbots, automation, custom software, analytics', from: 3 },
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

const Check = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" aria-hidden className={`size-5 shrink-0 ${className}`} fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
)

export default function Pricing() {
  useEffect(() => {
    document.title = 'Pricing — Planet Owl'
  }, [])

  return (
    <BlogLayout onBlog={false} newsletter={false} page={{ label: 'Pricing', href: '#/pricing' }}>
      <header className="bg-[linear-gradient(180deg,#cdd8f4_0%,#dfe7fa_45%,#ffffff_100%)] px-5 pb-12 pt-[clamp(8rem,12vw,10.5rem)] text-center sm:px-8">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-['Momo_Trust_Display'] text-[clamp(2rem,5vw,3.8rem)] font-normal leading-[1.08] text-plum-700">
            One Nest. Pick How Much of It You Need.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-ui text-lg leading-relaxed text-plum-800">
            Four monthly plans, each adding a craft to the one before it. Every plan starts with a
            free 2-week trial.
          </p>
        </div>
      </header>

      <section className="bg-white px-5 pb-12 sm:px-8">
        <ul className="mx-auto grid max-w-[1320px] gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {PLANS.map((p) => (
            <li
              key={p.name}
              className={`flex flex-col rounded-[1.75rem] p-7 ring-1 ${
                p.featured
                  ? 'bg-plum-800 text-white ring-plum-800 shadow-[0_30px_60px_-30px_rgba(54,14,57,0.7)]'
                  : 'bg-white text-plum-900 ring-plum-900/10 shadow-[0_30px_60px_-36px_rgba(54,14,57,0.45)]'
              }`}
            >
              {/* The owl on TOP of the card and large, by request — it was a
                  5rem figure tucked beside the plan's name. */}
              <img src={p.owl} alt="" aria-hidden loading="lazy" className="mx-auto h-44 w-auto object-contain sm:h-48" />
              <p
                className={`mt-6 self-start rounded-full px-3 py-1.5 font-ui text-xs font-bold uppercase tracking-wide ${
                  p.featured ? 'bg-gold-500 text-plum-900' : 'bg-plum-100 text-plum-800'
                }`}
              >
                {p.tag}
              </p>
              <h2 className={`mt-4 font-['Momo_Trust_Display'] text-3xl font-normal ${p.featured ? 'text-gold-500' : 'text-plum-700'}`}>
                {p.name}
              </h2>
              <p className="mt-4 font-ui">
                {p.from && <span className={`mr-1.5 text-sm ${p.featured ? 'text-gold-200' : 'text-plum-600'}`}>from</span>}
                <span className="text-[2.6rem] font-bold leading-none">{p.price}</span>
                <span className={`text-base ${p.featured ? 'text-gold-200' : 'text-plum-600'}`}>/mo</span>
              </p>
              <p className={`mt-3 min-h-[3.5rem] font-ui leading-snug ${p.featured ? 'text-gold-200' : 'text-plum-800'}`}>
                {p.line}
              </p>

              <a
                href="#/contact"
                className={`btn-type mt-6 inline-flex h-12 items-center justify-center rounded-full px-6 font-ui font-semibold no-underline transition-colors ${
                  p.featured
                    ? 'bg-gold-500 text-plum-900 shadow-[0_6px_0_-2px_var(--color-plum-950)] hover:bg-gold-400'
                    : 'bg-plum-800 text-white shadow-[0_6px_0_-2px_var(--color-plum-950)] hover:bg-plum-700'
                }`}
              >
                {p.from ? 'Let’s Talk' : 'Start Free Trial'}
              </a>

              <p className={`mt-7 font-ui text-sm font-bold ${p.featured ? 'text-white' : 'text-plum-900'}`}>{p.lead}</p>
              <ul className="mt-3 space-y-2.5">
                {p.items.map((item) => (
                  <li key={item} className={`flex items-start gap-2.5 font-ui ${p.featured ? 'text-gold-200' : 'text-plum-800'}`}>
                    <svg viewBox="0 0 24 24" aria-hidden className={`mt-0.5 size-5 shrink-0 ${p.featured ? 'text-gold-500' : 'text-teal-500'}`} fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round">
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

      {/* ---------------------------------------------------- compare -- */}
      <section className="bg-white px-5 pb-16 pt-6 sm:px-8">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="font-['Momo_Trust_Display'] text-[clamp(1.7rem,3.4vw,2.7rem)] font-normal leading-[1.1] text-plum-700">
            What Each Plan Covers
          </h2>
          <div className="mt-8 overflow-x-auto rounded-[1.5rem] ring-1 ring-plum-900/10">
            <table className="w-full min-w-[640px] border-collapse text-left font-ui">
              <thead>
                <tr className="bg-plum-800 text-white">
                  <th scope="col" className="px-6 py-4 text-sm font-bold uppercase tracking-wide">Craft</th>
                  {PLANS.map((p) => (
                    <th key={p.name} scope="col" className="px-4 py-4 text-center text-base font-bold">
                      {p.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {COMPARE.map((row, r) => (
                  <tr key={row.craft} className={r % 2 ? 'bg-plum-100/40' : 'bg-white'}>
                    <th scope="row" className="px-6 py-5 align-top">
                      <span className="block text-lg font-bold text-plum-900">{row.craft}</span>
                      <span className="mt-1 block text-sm font-normal leading-snug text-plum-800">{row.detail}</span>
                    </th>
                    {PLANS.map((p, i) => (
                      <td key={p.name} className="px-4 py-5 text-center align-middle">
                        {i >= row.from ? (
                          <>
                            <Check className="mx-auto text-teal-500" />
                            <span className="sr-only">Included</span>
                          </>
                        ) : (
                          <span className="text-plum-300" aria-label="Not included">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr className="bg-gold-200">
                  <th scope="row" className="px-6 py-5 text-lg font-bold text-plum-900">Monthly</th>
                  {PLANS.map((p) => (
                    <td key={p.name} className="px-4 py-5 text-center text-lg font-bold text-plum-900">
                      {p.from ? 'from ' : ''}
                      {p.price}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------- on every plan -- */}
      <section className="bg-plum-800 px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="font-['Momo_Trust_Display'] text-[clamp(1.7rem,3.4vw,2.7rem)] font-normal leading-[1.1] text-gold-500">
            Standard Issue on Every Plan
          </h2>
          <ul className="mt-10 grid gap-5 lg:grid-cols-3">
            {STANDARD.map((g) => (
              <li key={g.title} className="rounded-[1.5rem] bg-white p-7">
                <h3 className="font-ui text-xl font-bold text-plum-900">{g.title}</h3>
                <ul className="mt-4 space-y-3">
                  {g.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 font-ui leading-snug text-plum-800">
                      <Check className="mt-0.5 text-teal-500" />
                      {item}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------ how it works -- */}
      <section className="bg-white px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1320px]">
          <h2 className="font-['Momo_Trust_Display'] text-[clamp(1.7rem,3.4vw,2.7rem)] font-normal leading-[1.1] text-plum-700">
            How It Works
          </h2>
          <ol className="mt-10 grid gap-8 lg:grid-cols-3">
            {STEPS.map((st) => (
              <li key={st.n} className="border-t-4 border-gold-500 pt-6">
                <p className="font-['Momo_Trust_Display'] text-4xl leading-none text-teal-600">{st.n}</p>
                <h3 className="mt-3 font-ui text-xl font-bold text-plum-900">{st.title}</h3>
                <p className="mt-2 font-ui leading-relaxed text-plum-800">{st.copy}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* --------------------------------------------------------- FAQ -- */}
      <section className="bg-gold-200 px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1320px]">
          <Faq tone="light" askHref="#/contact" />
        </div>
      </section>

      <div className="bg-white pt-14" />

      {/* -------------------------------------------------- custom plan -- */}
      <section className="bg-white px-5 pb-10 sm:px-8">
        <div className="mx-auto grid max-w-[1320px] items-center gap-8 rounded-[1.75rem] bg-[#e7b248] p-8 sm:p-12 lg:grid-cols-[minmax(0,1fr)_auto]">
          <div>
            <p className="font-['Momo_Trust_Display'] text-[clamp(1.6rem,3.2vw,2.5rem)] leading-tight text-plum-900">
              Need something that does not fit a plan?
            </p>
            <p className="mt-3 max-w-2xl font-ui leading-relaxed text-plum-900/85">
              Tell us what you are building and we will put together one that does. Book a call or
              send us the details.
            </p>
          </div>
          <a
            href="#/contact"
            className="btn-type inline-flex h-12 items-center justify-center rounded-full bg-plum-800 px-7 font-ui font-semibold text-white no-underline shadow-[0_6px_0_-2px_var(--color-plum-950)] transition-colors hover:bg-plum-700"
          >
            Contact Us
          </a>
        </div>
      </section>
    </BlogLayout>
  )
}
