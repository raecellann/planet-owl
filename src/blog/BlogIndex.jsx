import { useMemo, useState } from 'react'
import { motion } from 'motion/react'
import { A } from '../lib/assets'
import BlogCover from './BlogCover'
import BlogLayout, { CategoryChip } from './BlogLayout'
import { CATEGORIES, POSTS, formatDate, postHref } from './posts'

/**
 * The blog's front page: a sky hero with the search, the newest post featured
 * as one wide card, then every article in a filterable grid.
 *
 * Search and the category chips both narrow the same grid. The featured card
 * steps aside as soon as either is in use — a "featured" post sitting above a
 * set of results it may not belong to reads as the filter not working.
 */
export default function BlogIndex() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState('All')

  const filtering = query.trim() !== '' || category !== 'All'
  const featured = POSTS[0]

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    return POSTS.filter((p) => {
      if (category !== 'All' && p.category !== category) return false
      if (!q) return true
      return `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(q)
    })
  }, [query, category])

  return (
    <BlogLayout>
      {/* ------------------------------------------------------- the hero -- */}
      <section className="relative overflow-hidden bg-[linear-gradient(180deg,#cdd8f4_0%,#dfe7fa_55%,#ffffff_100%)] px-5 pb-[clamp(9rem,18vw,15rem)] pt-[clamp(8rem,13vw,11rem)] sm:px-8">
        <img
          src={A.cloud}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -left-[10%] top-[18%] w-[38%] -scale-x-100 select-none opacity-70 [mask-image:linear-gradient(180deg,#000_45%,transparent_92%)]"
        />
        <img
          src={A.cloud}
          alt=""
          aria-hidden
          className="pointer-events-none absolute -right-[12%] top-[26%] w-[42%] select-none opacity-70 [mask-image:linear-gradient(180deg,#000_45%,transparent_92%)]"
        />

        <div className="relative mx-auto max-w-4xl text-center">
          <h1 className="font-['Momo_Trust_Display'] text-[clamp(2rem,4.8vw,3.6rem)] font-normal leading-[1.08] text-plum-700">
            Notes From the Nest: Bright Ideas, Hatched Weekly
          </h1>
          <p className="mx-auto mt-5 max-w-2xl font-ui text-[clamp(0.95rem,1.25vw,1.15rem)] leading-relaxed text-plum-600">
            Straight talk on brand, design and the creative operations behind them: what works,
            what breaks, and how to get more good work out of the team you already have.
          </p>

          <label className="relative mx-auto mt-8 block max-w-md">
            <span className="sr-only">Search the blog</span>
            <svg
              viewBox="0 0 24 24"
              aria-hidden
              className="pointer-events-none absolute left-5 top-1/2 size-5 -translate-y-1/2 text-plum-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5" />
            </svg>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the blog"
              className="h-14 w-full rounded-full border-[3px] border-plum-900 bg-white pl-13 pr-6 font-ui text-base font-semibold text-plum-900 placeholder:text-plum-900/55 focus:outline-none focus-visible:ring-4 focus-visible:ring-gold-500/60"
            />
          </label>
        </div>
      </section>

      {/* --------------------------------------------------- the featured -- */}
      {!filtering && (
        <section className="relative z-10 -mt-[clamp(6rem,13vw,11rem)] px-5 sm:px-8">
          <motion.a
            href={postHref(featured.slug)}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="group mx-auto grid max-w-[1180px] overflow-hidden rounded-[1.75rem] bg-white no-underline shadow-[0_30px_60px_-30px_rgba(54,14,57,0.5)] ring-1 ring-plum-900/5 md:grid-cols-[1.05fr_1fr]"
          >
            {/* The cover FILLS its half of the card, edge to edge.

                It used to keep its own 16:10 and sit centred on a flat gold
                ground, because stretching it with `h-full` made its WIDTH
                follow from the height (it still had an aspect ratio) and
                pushed it over the text. But the text column is taller than
                16:10 of this one, so the cover ended short of the card's top
                and bottom, and its own gradient against the flat fill showed
                as a picture floating inside a gold frame.

                From `md` up, where the two sit side by side, the cover drops
                its ratio and is pinned to this box's four sides instead: no
                ratio means no width to derive, so it cannot leave its column.
                The `min-h` is the 16:10 it would have had, so a short text
                column cannot squash it. Stacked (below `md`) it is a plain
                16:10 block the full width of the card, as before. */}
            <div className="relative bg-[#e7b248] md:min-h-[min(31vw,23rem)]">
              <BlogCover
                cover={featured.cover}
                title={featured.title}
                ratio="aspect-[16/10] md:aspect-auto"
                className="w-full md:absolute md:inset-0 md:h-full"
              />
              <CategoryChip className="absolute left-4 top-4">{featured.category}</CategoryChip>
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-10">
              <div className="flex items-center justify-between gap-4">
                <span className="rounded-full bg-teal-500 px-3.5 py-1.5 font-ui text-xs font-bold leading-none text-white">
                  Featured
                </span>
                <time dateTime={featured.date} className="font-ui text-sm text-plum-600">
                  {formatDate(featured.date)}
                </time>
              </div>
              <h2 className="mt-5 font-ui text-[clamp(1.4rem,2.3vw,2rem)] font-bold leading-[1.18] text-plum-900">
                {featured.title}
              </h2>
              <p className="mt-4 font-ui leading-relaxed text-plum-700">{featured.excerpt}</p>
              <span className="btn-type mt-7 inline-flex h-12 w-fit items-center rounded-full bg-gold-500 px-6 font-semibold text-plum-900 shadow-[0_6px_0_-2px_var(--color-plum-900)] transition-colors group-hover:bg-gold-400">
                Read More
              </span>
            </div>
          </motion.a>
        </section>
      )}

      {/* --------------------------------------------------- all articles -- */}
      <section className={`px-5 pb-10 sm:px-8 ${filtering ? 'relative z-10 -mt-[clamp(3rem,7vw,6rem)]' : 'pt-[clamp(4rem,8vw,7rem)]'}`}>
        <div className="mx-auto max-w-[1180px]">
          <h2 className="text-center font-['Momo_Trust_Display'] text-[clamp(1.9rem,4.2vw,3.2rem)] font-normal leading-none text-plum-700">
            All Articles
          </h2>

          <div className="mt-8 flex flex-wrap justify-center gap-2.5">
            {CATEGORIES.map((c) => {
              const on = c === category
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCategory(c)}
                  aria-pressed={on}
                  className={`rounded-full px-4 py-2 font-ui text-sm font-semibold transition-colors ${
                    on ? 'bg-plum-800 text-white' : 'bg-plum-100 text-plum-700 hover:bg-plum-300/60'
                  }`}
                >
                  {c}
                </button>
              )
            })}
          </div>

          {results.length === 0 ? (
            <p className="mt-16 text-center font-ui text-lg text-plum-600">
              Nothing matches that yet. Try a different word, or clear the filter.
            </p>
          ) : (
            <ul className="mt-12 grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
              {results.map((p, i) => (
                <motion.li
                  key={p.slug}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-8% 0px' }}
                  transition={{ duration: 0.7, delay: (i % 3) * 0.08, ease: [0.16, 1, 0.3, 1] }}
                >
                  <a href={postHref(p.slug)} className="group block no-underline">
                    <div className="relative overflow-hidden rounded-2xl ring-1 ring-plum-900/5 transition-transform duration-300 group-hover:-translate-y-1">
                      <BlogCover cover={p.cover} title={p.title} />
                      <CategoryChip className="absolute left-3 top-3">{p.category}</CategoryChip>
                    </div>
                    <h3 className="mt-5 font-ui text-xl font-bold leading-snug text-plum-900 transition-colors group-hover:text-plum-700">
                      {p.title}
                    </h3>
                    <time dateTime={p.date} className="mt-2 block font-ui text-sm text-plum-600">
                      {formatDate(p.date)}
                    </time>
                  </a>
                </motion.li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </BlogLayout>
  )
}
