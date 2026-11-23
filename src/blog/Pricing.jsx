import { useEffect } from 'react'
import BlogLayout from './BlogLayout'
import { A } from '../lib/assets'

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

export default function Pricing() {
  useEffect(() => {
    document.title = 'Pricing — Planet Owl'
  }, [])

  return (
    <BlogLayout onBlog={false} newsletter={false} page={{ label: 'Pricing', href: '#/pricing' }}>
      <header className="bg-[linear-gradient(180deg,#cdd8f4_0%,#dfe7fa_45%,#ffffff_100%)] px-5 pb-12 pt-[clamp(8rem,12vw,10.5rem)] text-center sm:px-8">
        <div className="mx-auto max-w-3xl">
          <p className="font-ui text-base font-bold text-teal-600">Pricing</p>
          <h1 className="mt-3 font-['Momo_Trust_Display'] text-[clamp(2rem,5vw,3.8rem)] font-normal leading-[1.08] text-plum-700">
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
              <p
                className={`self-start rounded-full px-3 py-1.5 font-ui text-xs font-bold uppercase tracking-wide ${
                  p.featured ? 'bg-gold-500 text-plum-900' : 'bg-plum-100 text-plum-800'
                }`}
              >
                {p.tag}
              </p>
              <div className="mt-5 flex items-end justify-between gap-3">
                <h2 className={`font-['Momo_Trust_Display'] text-3xl font-normal ${p.featured ? 'text-gold-500' : 'text-plum-700'}`}>
                  {p.name}
                </h2>
                <img src={p.owl} alt="" aria-hidden loading="lazy" className="h-20 w-auto object-contain" />
              </div>
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
