import { useEffect, useRef, useState } from 'react'

/**
 * A heading and cards that pile up under it as the page scrolls.
 *
 * The heading pins, then each card pins a title-row lower than the one before,
 * so a covered card still shows its number and title.
 *
 * The margins are what keep the finished pile together. A sticky element is
 * released when its own margin box reaches the end of its container, so without
 * them the LAST card leaves first and slides up over the titles above it. Each
 * element reserves the distance to the bottom of the pile, and the next one
 * takes that distance back with a negative margin, so the layout is unchanged
 * and the whole pile scrolls away as one.
 *
 * Nothing above this may clip, or pinning stops.
 */
export default function StackCards({ heading, headingClass = '', items, tones }) {
  const n = items.length
  // The last card's real height, so the heading is released on the same pixel
  // as the pile. Off by even a little, it slides toward the cards at the end.
  const list = useRef(null)
  const [lastH, setLastH] = useState(288)
  // Every card takes the height of the tallest. The pile only leaves as one
  // when they match: a shorter first card was released early, and slid up
  // over the heading.
  useEffect(() => {
    const measure = () => {
      const cards = [...(list.current?.querySelectorAll(':scope > li[data-card]') ?? [])]
      if (!cards.length) return
      cards.forEach((c) => (c.style.minHeight = ''))
      const tallest = Math.max(...cards.map((c) => c.offsetHeight))
      cards.forEach((c) => (c.style.minHeight = `${tallest}px`))
      setLastH(tallest)
    }
    measure()
    document.fonts?.ready.then(measure)
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [items])
  const pile = `(${n - 1} * var(--step) + ${lastH}px)`
  return (
    <div
      className="[--step:4.75rem] sm:[--step:4rem]"
      style={{ '--base': 'max(max(5.25rem, 2.92vw + max(3.25rem, 4.4vw)) + 5.75rem, 50svh - 11rem)' }}
    >
      <h2
        style={{ top: 'calc(var(--base) - 4.75rem)', marginBottom: `calc(${pile})` }}
        className={`sticky flex h-[4.75rem] items-start ${headingClass}`}
      >
        {heading}
      </h2>
      <ul ref={list} style={{ marginTop: `calc(-1 * ${pile})` }}>
        {items.map((it, i) => (
          <li
            key={it.title}
            data-card
            style={{
              top: `calc(var(--base) + ${i} * var(--step))`,
              marginBottom: `calc(${n - 1 - i} * var(--step))`,
              marginTop: i ? `calc(1.5rem - ${n - i} * var(--step))` : undefined,
            }}
            className={`sticky min-h-[18rem] rounded-[1.75rem] border-2 border-plum-900/15 px-6 pb-8 pt-3 sm:px-10 ${tones[i]}`}
          >
            <div className="flex min-h-[calc(var(--step)-1rem)] items-center gap-4">
              <span className="font-['Momo_Trust_Display'] text-2xl leading-none opacity-80 sm:text-3xl">0{i + 1}</span>
              <h3 className="font-['Momo_Trust_Display'] text-[clamp(1.05rem,2.4vw,2rem)] font-normal leading-[1.12]">{it.title}</h3>
            </div>
            <div className="mt-5">{it.body}</div>
          </li>
        ))}
        {/* Holds the finished pile on screen for a moment before it leaves. */}
        <li aria-hidden className="h-[18svh]" />
      </ul>
    </div>
  )
}
