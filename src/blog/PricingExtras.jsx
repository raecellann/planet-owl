import { useState } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import ChipTray from '../components/ChipTray'

const RIVALS = [
  { id: 'freelancers', label: 'Freelancers' },
  { id: 'agency', label: 'Agencies' },
  { id: 'inhouse', label: 'In-House' },
]

/**
 * Only what Planet Owl already says about itself. The other columns describe
 * the usual setup, and the note under the table says so. Cancellation, revision
 * and refund promises stay out until the studio has decided its terms.
 */
const ROWS = [
  { label: 'Design, digital, development and AI under one roof', freelancers: false, agency: true, inhouse: false },
  { label: 'One flat monthly price', freelancers: false, agency: false, inhouse: true },
  { label: 'Free 2-week trial', freelancers: false, agency: false, inhouse: false },
  { label: 'The same team on your brand', freelancers: false, agency: true, inhouse: true },
  { label: 'One place to send every request', freelancers: false, agency: true, inhouse: true },
  { label: 'Move up a plan as you grow', freelancers: false, agency: false, inhouse: false },
  { label: 'No hiring or onboarding', freelancers: true, agency: true, inhouse: false },
]

function Mark({ on, strong, delay, reduce }) {
  return (
    <motion.span
      aria-hidden
      variants={reduce ? undefined : { off: { scale: 0 }, on: { scale: 1, transition: { type: 'spring', stiffness: 460, damping: 17, delay } } }}
      className={`grid size-7 place-items-center rounded-full transition-transform duration-300 group-hover/row:scale-125 ${
        on ? (strong ? 'bg-gold-500 text-plum-800' : 'bg-teal-500 text-white') : strong ? 'bg-white/15 text-white/50' : 'bg-plum-100 text-plum-300'
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {on ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M7 7l10 10M17 7 7 17" />}
      </svg>
    </motion.span>
  )
}

/** Planet Owl against the usual options. Pick one to compare it head to head. */
export function CompareTable() {
  const reduce = useReducedMotion()
  const [rival, setRival] = useState('freelancers')
  const name = RIVALS.find((r) => r.id === rival).label
  const owlScore = ROWS.length
  const rivalScore = ROWS.filter((r) => r[rival]).length
  const cols = 'grid-cols-[minmax(0,1fr)_4.75rem_4.75rem] md:grid-cols-[minmax(0,1fr)_8rem_repeat(3,7rem)]'

  return (
    <div className="mt-24">
      <h2 className="text-center font-['Momo_Trust_Display'] text-[clamp(1.9rem,4vw,3.2rem)] font-normal leading-[1.1] text-gold-500">
        More Creativity
      </h2>
      <p className="mt-3 text-center font-ui text-gold-500">Pick who to compare us with.</p>
      <div className="mt-6 flex justify-center">
        <ChipTray label="Compare Planet Owl with" layoutId="compare-chip-active" items={RIVALS} value={rival} onChange={setRival} />
      </div>

      <motion.div
        initial={reduce ? false : 'off'}
        whileInView="on"
        viewport={{ once: true, margin: '-12% 0px' }}
        className="relative mt-8 overflow-hidden rounded-[1.75rem] bg-white p-3 sm:p-5"
      >
        <div role="table" aria-label={`Planet Owl compared with ${name}`}>
          <div role="row" className={`grid items-stretch gap-x-1.5 ${cols}`}>
            <span role="columnheader"><span className="sr-only">What you get</span></span>
            <span role="columnheader" className="grid place-items-center rounded-t-2xl bg-plum-800 px-1 py-3 text-center font-ui text-xs font-bold text-gold-400 sm:text-sm">Planet Owl</span>
            {RIVALS.map((r) => (
              <button
                key={r.id}
                type="button"
                role="columnheader"
                onClick={() => setRival(r.id)}
                className={`place-items-center rounded-t-2xl px-1 py-3 text-center font-ui text-xs font-bold transition-colors sm:text-sm ${
                  r.id === rival ? 'grid bg-teal-500 text-white' : 'hidden bg-plum-100 text-plum-700 hover:bg-plum-300/60 md:grid'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
          {ROWS.map((row, i) => (
            <div key={row.label} role="row" className={`group/row grid items-stretch gap-x-1.5 transition-colors hover:bg-gold-200 ${cols}`}>
              <span role="rowheader" className="flex items-center py-3 pl-2 pr-2 font-ui text-sm font-semibold leading-snug text-plum-700 sm:text-base">{row.label}</span>
              <span role="cell" className="grid place-items-center bg-plum-800 py-2.5">
                <span className="sr-only">Yes</span>
                <Mark on strong reduce={reduce} delay={0.1 + i * 0.07} />
              </span>
              {RIVALS.map((r) => (
                <span
                  key={r.id}
                  role="cell"
                  className={`place-items-center py-2.5 transition-colors ${r.id === rival ? 'grid bg-teal-400/15' : 'hidden bg-plum-100/45 md:grid'}`}
                >
                  <span className="sr-only">{row[r.id] ? 'Usually' : 'Usually not'}</span>
                  <Mark on={row[r.id]} reduce={reduce} delay={0.16 + i * 0.07} />
                </span>
              ))}
            </div>
          ))}
          <div role="row" className={`grid items-stretch gap-x-1.5 ${cols}`}>
            <span role="rowheader" className="flex items-center py-3 pl-2 font-ui text-sm font-bold text-plum-700 sm:text-base">Score</span>
            <span role="cell" className="grid place-items-center rounded-b-2xl bg-plum-800 py-3 font-ui font-bold text-gold-400">{owlScore}/{ROWS.length}</span>
            {RIVALS.map((r) => (
              <span key={r.id} role="cell" className={`place-items-center rounded-b-2xl py-3 font-ui font-bold text-plum-700 ${r.id === rival ? 'grid bg-teal-400/15' : 'hidden bg-plum-100/45 md:grid'}`}>
                {r.id === rival ? rivalScore : ROWS.filter((x) => x[r.id]).length}/{ROWS.length}
              </span>
            ))}
          </div>
        </div>
        <p className="mt-3 px-2 font-ui text-xs text-plum-600">Other columns show the usual setup. Individual freelancers, agencies and teams vary.</p>
      </motion.div>
    </div>
  )
}

const KIT = [
  { title: 'The Brief', icon: 'M5 4h10l4 4v12H5zM14 4v5h5M8 13h8M8 17h6', items: ['Send the details or book a call', 'One place for every request', 'Plain words are all we need'] },
  { title: 'The Build', icon: 'M4 8h16v11H4zM9 8V5h6v3M4 13h16', items: ['Design, digital, development and AI', 'Refined in the nest before it reaches you', 'Built around your brand, not a template'] },
  { title: 'The Trial', icon: 'M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.5 6.6 19.5l1.2-6L3.3 9.3l6.1-.7z', items: ['Free for your first 2 weeks', 'See how the nest handles your brand', 'Decide once you have seen the work'] },
  { title: 'The Plan', icon: 'M4 5h16v14H4zM4 10h16M9 3v4M15 3v4', items: ['One flat monthly price', 'Billed month by month', 'Move up when you need another craft'] },
]

/** What each stage comes with, under the roadmap. */
export function NestKit() {
  const reduce = useReducedMotion()
  return (
    <div className="pb-6 pt-4">
      <h2 className="text-center font-['Momo_Trust_Display'] text-[clamp(1.7rem,3.4vw,2.7rem)] font-normal leading-[1.1] text-plum-700">
        Packed for Every Flight
      </h2>
      <motion.ul
        initial={reduce ? false : 'off'}
        whileInView="on"
        viewport={{ once: true, margin: '-10% 0px' }}
        variants={{ on: { transition: { staggerChildren: 0.1 } } }}
        className="mt-8 grid gap-4 md:grid-cols-2"
      >
        {KIT.map((k) => (
          <motion.li
            key={k.title}
            variants={reduce ? undefined : { off: { opacity: 0, y: 26 }, on: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } } }}
            whileHover={reduce ? undefined : { y: -6 }}
            className="group rounded-[1.5rem] bg-gold-200 p-6 transition-shadow duration-300 hover:shadow-[0_24px_40px_-24px_rgba(54,14,57,0.55)] sm:p-7"
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="font-['Momo_Trust_Display'] text-2xl font-normal text-plum-700">{k.title}</h3>
              <span className="grid size-12 shrink-0 place-items-center rounded-xl bg-plum-800 text-gold-400 transition-transform duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] group-hover:-rotate-6 group-hover:scale-110">
                <svg viewBox="0 0 24 24" aria-hidden className="size-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={k.icon} /></svg>
              </span>
            </div>
            <ul className="mt-5 space-y-3">
              {k.items.map((item) => (
                <li key={item} className="flex items-start gap-3 font-ui leading-snug text-plum-700">
                  <svg viewBox="0 0 24 24" aria-hidden className="mt-0.5 size-5 shrink-0 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                  {item}
                </li>
              ))}
            </ul>
          </motion.li>
        ))}
      </motion.ul>
    </div>
  )
}
