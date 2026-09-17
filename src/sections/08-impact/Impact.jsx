import { useEffect, useRef } from 'react'
import { animate, useInView, useMotionValue, useTransform, motion } from 'motion/react'
import Reveal from '../../components/ui/Reveal'
import SectionHeading from '../../components/ui/SectionHeading'

const STATS = [
  { value: 140, suffix: '+', label: 'Projects launched', note: 'across 14 countries' },
  { value: 12, suffix: ' yrs', label: 'Average senior experience', note: 'per team member' },
  { value: 3.4, suffix: '×', label: 'Median lift in conversion', note: 'after a rebuild', decimals: 1 },
  { value: 96, suffix: '%', label: 'Clients who come back', note: 'for a second flight' },
]

function Counter({ value, suffix = '', decimals = 0 }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-25% 0px -25% 0px' })
  const mv = useMotionValue(0)
  const text = useTransform(mv, (v) =>
    decimals ? v.toFixed(decimals) : Math.round(v).toLocaleString(),
  )

  useEffect(() => {
    if (!inView) return
    const controls = animate(mv, value, { duration: 1.7, ease: [0.16, 1, 0.3, 1] })
    return () => controls.stop()
  }, [inView, value, mv])

  return (
    <span ref={ref} className="tabular-nums">
      <motion.span>{text}</motion.span>
      {suffix}
    </span>
  )
}

/** SECTION 7 — proof, in numbers, carrying the nest's dark into the night. */
export default function Impact() {
  return (
    <section
      id="impact"
      className="relative overflow-hidden bg-[linear-gradient(180deg,#33204a_0%,#311e46_55%,#33204a_100%)] py-24 sm:py-32"
    >
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0)_100%)]" />

      <div className="relative mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          tone="light"
          eyebrow="Impact"
          title="The numbers behind the feathers"
          copy="Pretty is the baseline. These are the outcomes clients actually renew for."
        />

        <dl className="mt-16 grid grid-cols-2 gap-x-6 gap-y-12 lg:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} y={38}>
              <div className="border-l-2 border-gold-500/50 pl-5">
                <dd className="font-ui text-[clamp(2.25rem,5vw,3.5rem)] font-semibold leading-none text-gold-400">
                  <Counter value={s.value} suffix={s.suffix} decimals={s.decimals} />
                </dd>
                <dt className="mt-3 font-ui text-base font-semibold text-white">{s.label}</dt>
                <p className="mt-1 text-sm text-plum-100/70">{s.note}</p>
              </div>
            </Reveal>
          ))}
        </dl>
      </div>
    </section>
  )
}
