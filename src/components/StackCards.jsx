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
  const pile = `(${n - 1} * var(--step) + 18rem)`
  return (
    <div
      className="[--step:6rem] sm:[--step:4rem]"
      style={{ '--base': 'max(11.5rem, 50svh - 11rem)' }}
    >
      <h2
        style={{ top: 'calc(var(--base) - 4.75rem)', marginBottom: `calc(${pile})` }}
        className={`sticky ${headingClass}`}
      >
        {heading}
      </h2>
      <ul style={{ marginTop: `calc(2.5rem - ${pile})` }}>
        {items.map((it, i) => (
          <li
            key={it.title}
            style={{
              top: `calc(var(--base) + ${i} * var(--step))`,
              marginBottom: `calc(${n - 1 - i} * var(--step))`,
              marginTop: i ? `calc(1.5rem - ${n - i} * var(--step))` : undefined,
            }}
            className={`sticky min-h-[18rem] rounded-[1.75rem] border-2 border-plum-900/15 px-6 pb-8 pt-3 sm:px-10 ${tones[i]}`}
          >
            <div className="flex min-h-[calc(var(--step)-1rem)] items-center gap-4">
              <span className="font-['Momo_Trust_Display'] text-2xl leading-none opacity-80 sm:text-3xl">0{i + 1}</span>
              <h3 className="font-['Momo_Trust_Display'] text-[clamp(1.25rem,2.4vw,2rem)] font-normal leading-[1.1]">{it.title}</h3>
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
