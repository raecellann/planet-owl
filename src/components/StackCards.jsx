/**
 * Cards that pile up as the page scrolls.
 *
 * Each card pins mid-screen a step lower than the one before, and the step is
 * the height of a card's title row. So a card that has been covered still shows
 * its number and title: the stack reads as real cards lying on each other, and
 * no heading disappears. Nothing above this list may clip, or pinning stops.
 *
 * items: [{ title, body }], tones: one class string per card.
 */
export default function StackCards({ items, tones }) {
  return (
    <ul className="space-y-6 pb-[14svh] [--step:6rem] sm:[--step:4rem]">
      {items.map((it, i) => (
        <li
          key={it.title}
          style={{ top: `calc(max(6.5rem, 50svh - 13rem) + ${i} * var(--step))` }}
          className={`sticky min-h-[18rem] rounded-[1.75rem] border-2 border-plum-900/15 px-6 pb-8 pt-3 sm:px-10 ${tones[i]}`}
        >
          <div className="flex min-h-[calc(var(--step)-1rem)] items-center gap-4">
            <span className="font-['Momo_Trust_Display'] text-2xl leading-none opacity-80 sm:text-3xl">0{i + 1}</span>
            <h3 className="font-['Momo_Trust_Display'] text-[clamp(1.25rem,2.4vw,2rem)] font-normal leading-[1.1]">{it.title}</h3>
          </div>
          <div className="mt-5">{it.body}</div>
        </li>
      ))}
    </ul>
  )
}
