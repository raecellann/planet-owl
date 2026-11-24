import { useEffect, useState } from 'react'
import cloudImg from '../../assets/section 2/image 35 copy.png'
import BlogCover from './BlogCover'
import { TRAY, TRAY_ICON } from '../components/ChipTray'
import BlogLayout, { CategoryChip } from './BlogLayout'
import { BLOG_HOME, POSTS, postHref } from './posts'
import { MobileTopicBar, TOPIC_WATCH, jumpToTopic } from './TopicNav'

/**
 * One article: category and date, the title, its cover, then three columns —
 * the topics list, the article itself, and the share links.
 *
 * The topics list scrolls rather than links. The blog is on hash routes
 * (`#/blog/<slug>`), so the address bar's hash is already spoken for and a
 * plain `#section` anchor would navigate AWAY from the article. Each topic is
 * a button that scrolls its heading into view instead.
 */
export default function BlogPost({ post }) {
  const [copied, setCopied] = useState(false)
  const [active, setActive] = useState(post.sections[0]?.id)

  const topics = [
    ...post.sections.map((s) => ({ id: s.id, label: s.heading })),
    ...(post.faq?.length ? [{ id: 'faq', label: 'FAQ' }] : []),
  ]

  // Which topic is on screen, for the list's highlight.
  useEffect(() => {
    const els = topics.map((t) => document.getElementById(`topic-${t.id}`)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (seen[0]) setActive(seen[0].target.id.replace('topic-', ''))
      },
      { rootMargin: TOPIC_WATCH },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.slug])

  useEffect(() => {
    document.title = 'Planet Owl'
  }, [post.title])

  const url = typeof window !== 'undefined' ? window.location.href : ''
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard refused — the address bar still has the link */
    }
  }

  const more = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2)

  return (
    <BlogLayout>
      <article>
        {/* ------------------------------------------------------ header -- */}
        <header className="relative overflow-hidden bg-white px-5 pt-[clamp(10rem,15vw,13.5rem)] sm:px-8">
          <img src={cloudImg} alt="" aria-hidden className="pointer-events-none absolute -left-[24vw] top-[6%] w-[max(20rem,48vw)] max-w-none -scale-x-100 select-none opacity-50 max-md:-left-[62vw] [mask-image:linear-gradient(180deg,#000_68%,transparent_98%)]" />
          <img src={cloudImg} alt="" aria-hidden className="pointer-events-none absolute -right-[25vw] top-[14%] w-[max(20rem,48vw)] max-w-none select-none opacity-45 max-md:-right-[64vw] [mask-image:linear-gradient(180deg,#000_68%,transparent_98%)]" />
          <div className="relative mx-auto max-w-3xl text-center">
            <div className="flex items-center justify-center gap-4">
              <CategoryChip className="!bg-teal-500 !text-white">{post.category}</CategoryChip>
              <span className="font-ui text-sm text-plum-600">{post.readMinutes} min read</span>
            </div>
            <h1 className="mt-6 font-['Momo_Trust_Display'] text-[clamp(1.9rem,4.2vw,3.2rem)] font-normal leading-[1.12] text-plum-700">
              {post.title}
            </h1>
          </div>

          <BlogCover
            cover={post.cover}
            title={post.title}
            className="relative mx-auto mt-10 max-w-4xl rounded-[1.75rem] shadow-[0_30px_60px_-30px_rgba(54,14,57,0.55)]"
          />
        </header>

        {/* -------------------------------------------------------- body -- */}
        <div>
        <MobileTopicBar topics={topics} active={active} label="Topics" />
        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 pb-8 pt-14 sm:px-8 lg:grid-cols-[13rem_minmax(0,1fr)_9rem] lg:gap-12">
          <nav aria-label="Topics" className="hidden lg:block">
            <div className="sticky top-[calc(2.92vw+max(3.25rem,4.4vw)+2rem)]">
              <p className="font-ui text-xs font-bold uppercase tracking-wider text-plum-700">Topics</p>
              <ul className="mt-4 space-y-3 border-l-2 border-plum-100">
                {topics.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => jumpToTopic(t.id)}
                      className={`-ml-0.5 block w-full border-l-2 pl-4 text-left font-ui text-sm leading-snug transition-colors ${
                        active === t.id
                          ? 'border-gold-500 font-bold text-plum-700'
                          : 'border-transparent text-plum-600 hover:text-plum-800'
                      }`}
                    >
                      {t.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="min-w-0">
            <p className="font-ui text-[1.15rem] font-medium leading-relaxed text-plum-700">{post.excerpt}</p>

            {post.sections.map((s) => (
              <section key={s.id} id={`topic-${s.id}`} className="scroll-mt-[calc(2.92vw+max(3.25rem,4.4vw)+2rem)] pt-12">
                <h2 className="font-ui text-[clamp(1.4rem,2.4vw,1.9rem)] font-bold leading-tight text-plum-700">
                  {s.heading}
                </h2>
                {s.blocks.map((b, i) => (
                  <Block key={i} block={b} />
                ))}
              </section>
            ))}

            {post.faq?.length > 0 && (
              <section id="topic-faq" className="scroll-mt-[calc(2.92vw+max(3.25rem,4.4vw)+2rem)] pt-12">
                <h2 className="font-ui text-[clamp(1.4rem,2.4vw,1.9rem)] font-bold leading-tight text-plum-700">
                  FAQ
                </h2>
                <dl className="mt-5 space-y-4">
                  {post.faq.map((f) => (
                    <div key={f.q} className="rounded-2xl bg-plum-100/60 p-6">
                      <dt className="font-ui text-lg font-bold text-plum-700">{f.q}</dt>
                      <dd className="mt-2 font-ui leading-relaxed text-plum-700">{f.a}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {/* the ask, in the page's own gold */}
            <div className="mt-14 rounded-[1.75rem] bg-[#e7b248] p-8 sm:p-10">
              <p className="font-['Momo_Trust_Display'] text-[clamp(1.4rem,2.6vw,2rem)] leading-tight text-plum-700">
                Want this running for your brand?
              </p>
              <p className="mt-3 max-w-xl font-ui leading-relaxed text-plum-700/85">
                Tell us what you are building. We will show you how the nest would handle it, refined
                before it reaches you.
              </p>
              <a
                href="#start"
                className="btn-type mt-6 inline-flex h-12 items-center rounded-full bg-plum-800 px-6 font-semibold text-white no-underline shadow-[0_6px_0_-2px_var(--color-plum-950)] transition-colors hover:bg-plum-700"
              >
                Start a Project
              </a>
            </div>
          </div>

          <aside className="lg:block">
            <div className="sticky top-[calc(2.92vw+max(3.25rem,4.4vw)+2rem)]">
              <p className="font-ui text-xs font-bold uppercase tracking-wider text-plum-700">Share this article</p>
              <div className={`${TRAY} mt-4 !flex-nowrap !justify-start`}>
                <ShareLink
                  href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`}
                  label="Share on Facebook"
                >
                  <path d="M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.7 1.3-3.7 3.8v2.4H8.2v3h2.5V21h2.8Z" />
                </ShareLink>
                <ShareLink
                  href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`}
                  label="Share on LinkedIn"
                >
                  <path d="M6.9 9.3H4.2V20h2.7V9.3ZM5.6 4.5a1.6 1.6 0 1 0 0 3.2 1.6 1.6 0 0 0 0-3.2ZM20 13.9c0-3.2-1.7-4.8-4-4.8-1.8 0-2.6 1-3.1 1.7V9.3h-2.7V20h2.7v-5.9c0-1.2.6-2.4 2-2.4s2.4 1.2 2.4 2.5V20H20v-6.1Z" />
                </ShareLink>
                <button
                  type="button"
                  onClick={copy}
                  aria-label="Copy the link to this article"
                  className={TRAY_ICON}
                >
                  <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <rect x="9" y="9" width="11" height="11" rx="2.5" />
                    <path d="M5.5 15H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v.5" />
                  </svg>
                </button>
              </div>
              <p aria-live="polite" className="mt-2 h-5 font-ui text-xs font-semibold text-teal-600">
                {copied ? 'Link copied' : ''}
              </p>
            </div>
          </aside>
        </div>
        </div>
      </article>

      {/* ------------------------------------------------- keep reading -- */}
      <section className="px-5 pb-6 pt-10 sm:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="flex items-end justify-between gap-6">
            <h2 className="font-['Momo_Trust_Display'] text-[clamp(1.5rem,3vw,2.2rem)] font-normal leading-none text-plum-700">
              Keep Reading
            </h2>
            <a href={BLOG_HOME} className="font-ui text-sm font-bold text-teal-600 no-underline hover:text-teal-500">
              All articles →
            </a>
          </div>
          <ul className="mt-8 grid gap-7 sm:grid-cols-2">
            {more.map((p) => (
              <li key={p.slug}>
                <a href={postHref(p.slug)} className="group block no-underline">
                  <div className="relative overflow-hidden rounded-2xl ring-1 ring-plum-900/5 transition-transform duration-300 group-hover:-translate-y-1">
                    <BlogCover cover={p.cover} title={p.title} />
                    <CategoryChip className="absolute left-3 top-3">{p.category}</CategoryChip>
                  </div>
                  <h3 className="mt-5 font-ui text-xl font-bold leading-snug text-plum-700">{p.title}</h3>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </BlogLayout>
  )
}

function ShareLink({ href, label, children }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className={TRAY_ICON}
    >
      <svg viewBox="0 0 24 24" className="size-5" fill="currentColor" aria-hidden>
        {children}
      </svg>
    </a>
  )
}

function Block({ block }) {
  if (block.p) {
    return <p className="mt-5 font-ui text-[1.05rem] leading-[1.75] text-plum-700">{block.p}</p>
  }
  if (block.list) {
    return (
      <ul className="mt-5 space-y-3">
        {block.list.map((item) => (
          <li key={item} className="relative pl-7 font-ui text-[1.05rem] leading-[1.7] text-plum-700">
            <span aria-hidden className="absolute left-0 top-[0.62em] size-2.5 rounded-full bg-gold-500" />
            {item}
          </li>
        ))}
      </ul>
    )
  }
  if (block.steps) {
    return (
      <ol className="mt-6 grid gap-4 sm:grid-cols-2">
        {block.steps.map((s, i) => (
          <li key={s.title} className="rounded-2xl bg-plum-800 p-6 text-white">
            <span className="font-ui text-3xl font-bold leading-none text-gold-500">
              {String(i + 1).padStart(2, '0')}
            </span>
            <p className="mt-3 font-ui text-lg font-bold leading-snug text-white">{s.title}</p>
            <p className="mt-2 font-ui leading-relaxed text-plum-100/90">{s.copy}</p>
          </li>
        ))}
      </ol>
    )
  }
  if (block.quote) {
    return (
      <blockquote className="mt-8 border-l-4 border-gold-500 pl-6 font-['Momo_Trust_Display'] text-[clamp(1.25rem,2.1vw,1.6rem)] leading-snug text-plum-700">
        {block.quote}
      </blockquote>
    )
  }
  return null
}
