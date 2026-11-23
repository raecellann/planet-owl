import { useEffect, useRef, useState } from 'react'

/** Where a topic's heading lands when its link is pressed: mid-screen, a little high. */
const LANDING = 0.38

/** The reading line the "current topic" highlight is taken from, just under `LANDING`. */
export const TOPIC_WATCH = '-40% 0px -55% 0px'

export function jumpToTopic(id) {
  const section = document.getElementById(`topic-${id}`)
  if (!section) return
  const heading = section.querySelector('h2') ?? section
  const top = heading.getBoundingClientRect().top + window.scrollY - window.innerHeight * LANDING
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  window.scrollTo({ top: Math.max(0, top), behavior: calm ? 'auto' : 'smooth' })
}

/**
 * The side navigation, on a phone: a strip pinned under the navbar. It follows
 * the reader, sliding the current topic to its centre.
 */
export function MobileTopicBar({ topics, active, label }) {
  const stripRef = useRef(null)
  const [top, setTop] = useState(84)

  useEffect(() => {
    const read = () => {
      const bar = document.querySelector('header nav')
      if (bar) setTop(Math.round(bar.getBoundingClientRect().bottom) + 8)
    }
    read()
    window.addEventListener('resize', read)
    return () => window.removeEventListener('resize', read)
  }, [])

  useEffect(() => {
    const strip = stripRef.current
    const chip = strip?.querySelector('[aria-current="true"]')
    if (!chip) return
    strip.scrollTo({ left: chip.offsetLeft - (strip.clientWidth - chip.offsetWidth) / 2, behavior: 'smooth' })
  }, [active])

  return (
    <nav aria-label={label} style={{ top }} className="sticky z-30 mt-6 bg-white/95 py-2 backdrop-blur lg:hidden">
      <div ref={stripRef} className="relative flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] sm:px-8 [&::-webkit-scrollbar]:hidden">
        {topics.map((t) => (
          <button
            key={t.id}
            type="button"
            aria-current={active === t.id ? 'true' : undefined}
            onClick={() => jumpToTopic(t.id)}
            className={`shrink-0 whitespace-nowrap rounded-full px-4 py-2 font-ui text-sm font-semibold transition-colors ${
              active === t.id ? 'bg-plum-800 text-white' : 'bg-plum-100 text-plum-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </nav>
  )
}
