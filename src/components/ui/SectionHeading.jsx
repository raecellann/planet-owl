import Reveal from './Reveal'

/** Shared eyebrow + title + intro block so every section shares one rhythm. */
export default function SectionHeading({ eyebrow, title, copy, tone = 'dark', align = 'center' }) {
  const light = tone === 'light'
  const centered = align === 'center'

  return (
    <header className={centered ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      <Reveal y={26}>
        <span
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 font-ui text-xs font-semibold uppercase tracking-[0.2em] ${
            light ? 'bg-white/12 text-gold-400' : 'bg-plum-700/10 text-plum-700'
          }`}
        >
          <span className="size-1.5 rounded-full bg-gold-500" />
          {eyebrow}
        </span>
      </Reveal>

      <Reveal y={34} delay={0.08}>
        <h2
          className={`mt-5 font-ui text-[clamp(1.9rem,4.6vw,3.35rem)] font-semibold leading-[1.1] ${
            light ? 'text-white' : 'text-plum-800'
          }`}
        >
          {title}
        </h2>
      </Reveal>

      {copy && (
        <Reveal y={28} delay={0.16}>
          <p
            className={`mt-4 text-[0.98rem] leading-relaxed ${
              light ? 'text-plum-100/80' : 'text-plum-600'
            } ${centered ? 'mx-auto' : ''}`}
          >
            {copy}
          </p>
        </Reveal>
      )}
    </header>
  )
}
