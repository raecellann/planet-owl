import { useEffect, useRef, useState } from 'react'
import { A } from '../../lib/assets'
import { driveEmbed } from './work'

/**
 * A brand's whole album, opened from its tile in the gallery.
 *
 * A native `<dialog>` opened with `showModal()`, which is what gives it the
 * focus trap, Escape-to-close and an inert page behind it without any of that
 * being rebuilt here. The page's own scroll is locked while it is up, so the
 * wheel moves the album and not the site underneath.
 *
 * The pieces hang in a masonry, each at its own shape: a square post, a wide
 * site capture and an email several screens long all sit in the same wall
 * without any of them being cropped to match the others.
 */
export default function Album({ work, onClose }) {
  const ref = useRef(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog.open) dialog.showModal()
    const root = document.documentElement
    const before = root.style.overflow
    root.style.overflow = 'hidden'
    return () => {
      root.style.overflow = before
    }
  }, [])

  const n = work.items.length
  // One piece is a single centred column; an email that long set three-up
  // would be a ribbon. Otherwise two columns, three on a wide screen.
  const columns =
    n === 1 ? 'mx-auto max-w-2xl' : n === 2 ? 'columns-1 sm:columns-2' : 'columns-1 sm:columns-2 lg:columns-3'

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      aria-label={`${work.title}: ${work.kind}`}
      className="album-dialog m-0 h-dvh max-h-none w-screen max-w-none overflow-hidden bg-transparent p-0 backdrop:bg-plum-950/95"
    >
      {/* A press on the empty margin closes, the way a lightbox does. The
          check is for this exact element, so presses on the pieces do not. */}
      <div
        className="h-full overflow-y-auto overscroll-contain"
        onClick={(e) => {
          if (e.target === e.currentTarget) ref.current.close()
        }}
      >
        <div className="mx-auto max-w-[1400px] px-4 pb-16 sm:px-8">
          <header className="sticky top-0 z-10 -mx-4 flex items-center gap-4 bg-plum-950/85 px-4 py-4 backdrop-blur sm:-mx-8 sm:px-8 sm:py-5">
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-ui text-xl font-bold leading-tight text-white sm:text-2xl">
                {work.title}
              </h3>
              <p className="truncate text-sm text-plum-300">
                {work.kind}
                {n > 1 && ` · ${n} pieces`}
              </p>
            </div>
            {work.href && (
              <a
                href={work.href}
                target="_blank"
                rel="noreferrer"
                className="shrink-0 rounded-full bg-gold-500 px-4 py-2 text-sm font-semibold text-plum-900 transition-colors hover:bg-gold-400"
              >
                Visit site <span aria-hidden>↗</span>
                <span className="sr-only"> (opens in a new tab)</span>
              </a>
            )}
            <button
              type="button"
              onClick={() => ref.current.close()}
              aria-label="Close album"
              className="grid size-10 shrink-0 place-items-center rounded-full bg-white/10 text-xl leading-none text-white transition-colors hover:bg-white/20"
            >
              <span aria-hidden>✕</span>
            </button>
          </header>

          <div className={`mt-2 gap-5 ${columns}`}>
            {work.items.map((item, i) => (
              <Piece key={item.name} item={item} work={work} index={i} />
            ))}
          </div>
        </div>
      </div>
    </dialog>
  )
}

function Piece({ item, work, index }) {
  const [playing, setPlaying] = useState(false)
  const label = item.link?.label ?? `${work.title}, piece ${index + 1} of ${work.items.length}`
  const frame = 'mb-5 block break-inside-avoid overflow-hidden rounded-2xl bg-plum-900'

  if (item.video) {
    // The poster holds the film's own shape, so the player that replaces it
    // lands in a box of exactly the same size and nothing around it moves.
    return (
      <figure className={`${frame} relative m-0`} style={{ aspectRatio: `${item.w} / ${item.h}` }}>
        {playing ? (
          <iframe
            src={driveEmbed(item.video)}
            title={`${work.title} film`}
            allow="autoplay; fullscreen"
            allowFullScreen
            className="absolute inset-0 size-full border-0"
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play the ${work.title} film`}
            className="group absolute inset-0 block size-full"
          >
            <img src={item.src} alt="" width={item.w} height={item.h} loading="lazy" className="size-full object-cover" />
            <span className="absolute inset-0 grid place-items-center bg-plum-950/15 transition-colors group-hover:bg-plum-950/30">
              <img src={A.playBadge} alt="" className="size-16 drop-shadow-[0_8px_18px_rgba(36,5,31,0.6)] transition-transform group-hover:scale-110" />
            </span>
          </button>
        )}
      </figure>
    )
  }

  const img = (
    <img src={item.src} alt={label} width={item.w} height={item.h} loading="lazy" className="block h-auto w-full" />
  )

  // A store's capture opens the store; any other piece opens itself at full
  // size, which is the zoom.
  return item.link ? (
    <a href={item.link.href} target="_blank" rel="noreferrer" className={`${frame} group`}>
      {img}
      <span className="flex items-center justify-between gap-3 px-4 py-3 text-sm font-semibold text-white">
        <span className="truncate">{item.link.label}</span>
        <span aria-hidden className="text-gold-400 transition-transform group-hover:translate-x-0.5">↗</span>
      </span>
    </a>
  ) : (
    <a href={item.src} target="_blank" rel="noreferrer" className={frame}>
      {img}
    </a>
  )
}
