import { A } from '../lib/assets'

/**
 * A post's cover, composed in the browser rather than shipped as an export.
 *
 * The pattern is the one the reference blog uses for its own covers — a
 * subject in the middle with product-style labels floating round it — rebuilt
 * from Planet Owl's own parts: one of the studio's owls on the gold, plum or
 * sky ground, a caption card, and the pill labels.
 *
 * Every size inside is in `cqw` (a share of the cover's own width, via the
 * `@container` on the wrapper), so the same composition holds whether it is
 * drawn as a small card in the grid or as the full-width image on an article.
 *
 * Set `cover.image` on a post to replace all of this with a finished picture.
 *
 * `ratio` is the box the cover draws itself in — 16:10 unless the caller has a
 * frame of its own to fill (the featured card on the index does, see there).
 */
const GROUNDS = {
  gold: 'bg-[radial-gradient(ellipse_at_50%_35%,#f4cb6b_0%,#e7b248_62%,#d99f33_100%)]',
  plum: 'bg-[radial-gradient(ellipse_at_50%_30%,#6b3f69_0%,#451647_58%,#24051f_100%)]',
  sky: 'bg-[linear-gradient(180deg,#cdd8f4_0%,#eef3fb_70%,#ffffff_100%)]',
}

const TONES = {
  teal: 'bg-teal-500 text-white',
  gold: 'bg-gold-500 text-plum-700',
  plum: 'bg-plum-800 text-white',
  white: 'bg-white text-plum-700',
}

const DOTS = {
  teal: 'bg-white/90',
  gold: 'bg-plum-900/80',
  plum: 'bg-gold-500',
  white: 'bg-teal-500',
}

/**
 * Feathers the cloud plate's own rectangle away. The plate is not fully
 * transparent out to its edges, so on a flat ground its box showed as a
 * faintly lighter rectangle with a hard vertical edge through the cover.
 */
const CLOUD_EDGE =
  '[mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_55%,transparent_100%)]'

export default function BlogCover({ cover, title, className = '', ratio = 'aspect-[16/10]' }) {
  if (cover.image) {
    return (
      <div className={`${ratio} overflow-hidden ${className}`}>
        <img src={cover.image} alt={title} loading="lazy" className="size-full object-cover" />
      </div>
    )
  }

  const { theme = 'gold', owl, chips = [], card, calendar, queue } = cover

  return (
    <div
      role="img"
      aria-label={title}
      className={`@container relative ${ratio} overflow-hidden ${GROUNDS[theme]} ${className}`}
    >
      {/* soft weather behind the owl, so the ground is not a flat fill */}
      <img
        src={A.cloud}
        alt=""
        aria-hidden
        className={`pointer-events-none absolute -left-[12%] bottom-[-18%] w-[70%] select-none ${CLOUD_EDGE} ${theme === 'plum' ? 'opacity-15' : 'opacity-60'}`}
      />
      <img
        src={A.cloud}
        alt=""
        aria-hidden
        className={`pointer-events-none absolute -right-[16%] top-[-10%] w-[62%] -scale-x-100 select-none ${CLOUD_EDGE} ${theme === 'plum' ? 'opacity-10' : 'opacity-45'}`}
      />

      {/* the caption card the owl stands in front of */}
      {card && (
        <div className="absolute left-1/2 top-[13%] w-[44%] -translate-x-1/2 rounded-[2.2cqw] bg-white/92 p-[1.6cqw] pb-[2.2cqw] shadow-[0_3cqw_5cqw_-3cqw_rgba(36,5,31,0.55)]">
          <div
            className={`aspect-[16/11] rounded-[1.4cqw] ${theme === 'plum' ? 'bg-[linear-gradient(160deg,#f4cb6b,#e7b248)]' : 'bg-[linear-gradient(160deg,#6b3f69,#451647)]'}`}
          />
          <p className="mt-[1.4cqw] font-ui text-[1.5cqw] leading-none text-plum-500">{card.kicker}</p>
          <p className="mt-[0.7cqw] font-ui text-[2.5cqw] font-bold leading-[1.1] text-plum-700">{card.title}</p>
        </div>
      )}

      {owl && (
        <img
          src={owl}
          alt=""
          aria-hidden
          loading="lazy"
          className="pointer-events-none absolute left-1/2 top-[10%] h-[50%] w-auto -translate-x-1/2 select-none drop-shadow-[0_2cqw_2.5cqw_rgba(36,5,31,0.35)]"
        />
      )}

      {calendar && <Calendar />}
      {queue && <Queue items={queue} />}

      {chips.map((c) => (
        <span
          key={c.label}
          style={{ left: `${c.x}%`, top: `${c.y}%` }}
          className={`absolute inline-flex items-center gap-[1cqw] whitespace-nowrap rounded-full px-[2cqw] py-[1.1cqw] font-ui text-[1.9cqw] font-semibold leading-none shadow-[0_1.6cqw_3cqw_-1.6cqw_rgba(36,5,31,0.6)] ${TONES[c.tone]}`}
        >
          <span className={`size-[1.5cqw] rounded-full ${DOTS[c.tone]}`} />
          {c.label}
        </span>
      ))}
    </div>
  )
}

/** A month grid with the publishing days marked — the "always-on" calendar. */
function Calendar() {
  const marked = new Set([2, 4, 7, 9, 11, 14, 16, 18, 21, 23, 25, 28, 30])
  return (
    <div className="absolute bottom-[24%] left-[7%] w-[23%] rounded-[1.8cqw] bg-teal-500 p-[1.6cqw] shadow-[0_2cqw_4cqw_-2cqw_rgba(36,5,31,0.6)]">
      <p className="font-ui text-[1.7cqw] font-bold leading-none text-white">November 2026</p>
      <div className="mt-[1.2cqw] grid grid-cols-7 gap-[0.5cqw]">
        {Array.from({ length: 30 }, (_, i) => i + 1).map((d) => (
          <span
            key={d}
            className={`grid aspect-square place-items-center rounded-full font-ui text-[1.05cqw] leading-none ${
              marked.has(d) ? 'bg-white font-bold text-teal-600' : 'text-white/80'
            }`}
          >
            {d}
          </span>
        ))}
      </div>
    </div>
  )
}

/** A short stack of tickets — the production queue. */
function Queue({ items }) {
  return (
    <div className="absolute bottom-[8%] right-[6%] flex w-[25%] flex-col gap-[0.9cqw]">
      {items.map((label, i) => (
        <div
          key={label}
          className="rounded-[1.2cqw] bg-white/95 px-[1.5cqw] py-[1.1cqw] shadow-[0_1.4cqw_2.6cqw_-1.6cqw_rgba(36,5,31,0.7)]"
        >
          <p className="font-ui text-[1.05cqw] leading-none text-plum-500">Queue · {String(i + 1).padStart(2, '0')}</p>
          <p className="mt-[0.5cqw] font-ui text-[1.7cqw] font-bold leading-none text-plum-700">{label}</p>
        </div>
      ))}
    </div>
  )
}
