import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useReducedMotion } from '../lib/motionPref'
import ChipTray from '../components/ChipTray'

const RIVALS = [
  { id: 'freelancers', label: 'Freelancers' },
  { id: 'agency', label: 'Marketing Agencies' },
  { id: 'inhouse', label: 'In-House Designer' },
  { id: 'subs', label: 'Other Subscriptions' },
]

/**
 * Planet Owl's own version of the benefits list. Cancel anytime, fast
 * turnaround, unlimited revisions and a satisfaction guarantee are left out on
 * purpose: the studio has not set those terms. Add them here once it has.
 */
const ROWS = [
  { label: 'Flexible Flight Plans', freelancers: true, agency: false, inhouse: false, subs: true },
  { label: 'Room to Scale', freelancers: false, agency: true, inhouse: false, subs: true },
  { label: 'A Dedicated Flock', freelancers: false, agency: true, inhouse: true, subs: false },
  { label: 'Creative Direction From the Nest', freelancers: false, agency: true, inhouse: false, subs: false },
  { label: 'One Flat Monthly Rate', freelancers: false, agency: false, inhouse: true, subs: true },
  { label: 'One Nest for Every Request', freelancers: false, agency: true, inhouse: true, subs: true },
  { label: 'A Real Owl to Talk To', freelancers: true, agency: true, inhouse: true, subs: false },
  { label: 'Free 2-Week Test Flight', freelancers: false, agency: false, inhouse: false, subs: false },
]

function Mark({ on, owl, delay, reduce }) {
  return (
    <motion.span
      aria-hidden
      variants={reduce ? undefined : { off: { scale: 0 }, on: { scale: 1, transition: { type: 'spring', stiffness: 460, damping: 17, delay } } }}
      className={`grid size-7 place-items-center rounded-full transition-transform duration-300 group-hover/row:scale-125 ${
        owl ? 'bg-plum-800 text-gold-400' : on ? 'bg-teal-500 text-white' : 'bg-white/10 text-white/40'
      }`}
    >
      <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        {on ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M7 7l10 10M17 7 7 17" />}
      </svg>
    </motion.span>
  )
}

/** Planet Owl against the usual options, set straight on the section. */
export function CompareTable() {
  const reduce = useReducedMotion()
  const [hot, setHot] = useState(null)
  // Phones show one usual option at a time beside Planet Owl.
  const [rival, setRival] = useState(RIVALS[0].id)
  const rivalLabel = RIVALS.find((r) => r.id === rival).label
  const cols = 'grid-cols-[9.5rem_6rem_repeat(4,6.5rem)] md:grid-cols-[minmax(0,1fr)_8rem_repeat(4,7.5rem)]'
  const rivalCell = (id) => `grid place-items-center transition-colors duration-200 ${hot === id ? 'bg-white/10' : ''}`
  const label = 'sticky left-0 z-10 flex items-center bg-plum-800 pr-3 font-ui'

  return (
    <div>
      <h2 className="text-center font-['Momo_Trust_Display'] text-[clamp(1.9rem,4vw,3.2rem)] font-normal leading-[1.1] text-gold-500">
        Why Brands Nest With Us
      </h2>

      <motion.div
        initial={reduce ? false : 'off'}
        whileInView="on"
        viewport={{ once: true, margin: '-12% 0px' }}
        onMouseLeave={() => setHot(null)}
        className="relative mt-10 hidden overflow-x-auto md:block"
      >
        <div role="table" aria-label="Planet Owl compared with the usual options" className="min-w-max md:min-w-0">
          <div role="row" className={`grid items-stretch ${cols}`}>
            <span role="columnheader" className={label}><span className="sr-only">What you get</span></span>
            <span role="columnheader" className="grid place-items-center rounded-t-2xl bg-gold-500 px-2 py-4 text-center font-ui text-sm font-bold text-plum-700">Planet Owl</span>
            {RIVALS.map((r) => (
              <span key={r.id} role="columnheader" onMouseEnter={() => setHot(r.id)} className={`${rivalCell(r.id)} rounded-t-2xl px-2 py-4 text-center font-ui text-sm font-bold leading-tight text-white`}>
                {r.label}
              </span>
            ))}
          </div>
          {ROWS.map((row, i) => (
            <div key={row.label} role="row" className={`group/row grid items-stretch border-t border-white/10 ${cols}`}>
              <span role="rowheader" className={`${label} py-3 text-sm font-semibold leading-snug text-white transition-colors group-hover/row:text-gold-400 sm:text-base`}>{row.label}</span>
              <span role="cell" className={`grid place-items-center bg-gold-500 py-3 ${i === ROWS.length - 1 ? 'rounded-b-2xl' : ''}`}>
                <span className="sr-only">Yes</span>
                <Mark on owl reduce={reduce} delay={0.1 + i * 0.06} />
              </span>
              {RIVALS.map((r) => (
                <span key={r.id} role="cell" onMouseEnter={() => setHot(r.id)} className={`${rivalCell(r.id)} py-3 ${i === ROWS.length - 1 ? 'rounded-b-2xl' : ''}`}>
                  <span className="sr-only">{row[r.id] ? 'Usually' : 'Usually not'}</span>
                  <Mark on={row[r.id]} reduce={reduce} delay={0.16 + i * 0.06} />
                </span>
              ))}
            </div>
          ))}
        </div>
      </motion.div>

      {/* Phones: still a table, two columns wide. The chips pick which usual
          option sits beside Planet Owl, so nothing needs a sideways swipe. */}
      <div className="mt-8 md:hidden">
        <ChipTray
          label="Compare Planet Owl with"
          scroll
          layoutId="compare-chip-active"
          items={RIVALS.map((r) => ({ id: r.id, label: r.label }))}
          value={rival}
          onChange={setRival}
        />
        <div role="table" aria-label={`Planet Owl compared with ${rivalLabel}`} className="mt-6">
          <div role="row" className="grid grid-cols-[minmax(0,1fr)_5.25rem_5.25rem] gap-x-1.5">
            <span role="columnheader"><span className="sr-only">What you get</span></span>
            <span role="columnheader" className="grid place-items-center rounded-t-2xl bg-gold-500 px-1 py-3 text-center font-ui text-xs font-bold text-plum-700">Planet Owl</span>
            <span role="columnheader" className="relative grid place-items-center overflow-hidden rounded-t-2xl bg-white/10 px-1 py-3 text-center font-ui text-xs font-bold leading-tight text-white">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={rival}
                  initial={reduce ? false : { y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={reduce ? undefined : { y: -14, opacity: 0 }}
                  transition={{ duration: 0.25 }}
                >
                  {rivalLabel}
                </motion.span>
              </AnimatePresence>
            </span>
          </div>
          {ROWS.map((row, i) => (
            <div key={row.label} role="row" className="grid grid-cols-[minmax(0,1fr)_5.25rem_5.25rem] gap-x-1.5 border-t border-white/10">
              <span role="rowheader" className="flex items-center py-3 pr-2 font-ui text-sm font-semibold leading-snug text-white">{row.label}</span>
              <span role="cell" className={`grid place-items-center bg-gold-500 py-3 ${i === ROWS.length - 1 ? 'rounded-b-2xl' : ''}`}>
                <span className="sr-only">Yes</span>
                <span aria-hidden className="grid size-7 place-items-center rounded-full bg-plum-800 text-gold-400">
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
                </span>
              </span>
              <span role="cell" className={`grid place-items-center bg-white/10 py-3 ${i === ROWS.length - 1 ? 'rounded-b-2xl' : ''}`}>
                <span className="sr-only">{row[rival] ? 'Usually' : 'Usually not'}</span>
                <motion.span
                  key={rival + row.label}
                  aria-hidden
                  initial={reduce ? false : { scale: 0, rotate: -30 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 460, damping: 18, delay: i * 0.03 }}
                  className={`grid size-7 place-items-center rounded-full ${row[rival] ? 'bg-teal-500 text-white' : 'bg-white/10 text-white/50'}`}
                >
                  <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    {row[rival] ? <path d="M5 12.5l4.5 4.5L19 7.5" /> : <path d="M7 7l10 10M17 7 7 17" />}
                  </svg>
                </motion.span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
