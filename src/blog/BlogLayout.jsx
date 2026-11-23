import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { A, NAV_LINKS } from '../lib/assets'
import { GoldButton } from '../components/ui/Button'
import StartProjectModal from '../components/StartProjectModal'
import SignupForm from '../components/SignupForm'
import Footer from '../components/Footer'
import { BLOG_HOME } from './posts'

/**
 * The frame every blog page sits in: the white nav pill, the page itself, the
 * newsletter band and the site's own footer.
 *
 * The bar is its own small component rather than the landing page's `Nav`.
 * That one is built round the landing page — it collapses to a logo over the
 * hero, expands on scroll, and is gated behind the intro — none of which
 * means anything here. This one is always open and always the same size.
 *
 * Its section links are the landing page's own anchors (`#portfolio` and so
 * on). Anything that is not a `#/blog` route renders the landing page, so
 * following one leaves the blog and lands on that section.
 */
/* `page` is the page this frame is wrapped round, as { label, href }. The bar
   names it in teal, by request: on the blog it says Blog, on the privacy page
   Privacy, and so on, so the bar always says where you are. Left out, it is
   the blog. `onBlog` is kept for the callers that only say "not the blog". */
export default function BlogLayout({ children, onBlog = true, newsletter = true, page = null }) {
  const here = page || (onBlog ? { label: 'Blog', href: BLOG_HOME } : null)
  const hereIsBlog = here?.href === BLOG_HOME
  const [projectOpen, setProjectOpen] = useState(false)
  // The phone menu — the same drawer the landing page's bar opens.
  const [menuOpen, setMenuOpen] = useState(false)
  const openProject = (e) => {
    e.preventDefault()
    setMenuOpen(false)
    setProjectOpen(true)
  }

  // The landing page's body is plum (it ends on night). The blog is a light
  // page top to bottom, so the body goes white while it is mounted — otherwise
  // an overscroll bounce shows a plum flash above the sky.
  useEffect(() => {
    const prev = document.body.style.background
    document.body.style.background = '#ffffff'
    return () => {
      document.body.style.background = prev
    }
  }, [])

  return (
    <>
      {/* The SAME box as the landing page's bar, figure for figure — insets,
          width, height, padding, logo, link size and CTA are all `Nav.jsx`'s
          own classes. It had its own (a 1180px cap, 64px tall, fixed `rem`
          type), so following "Blog" from the landing page made the bar jump
          to a narrower, shorter pill with smaller lettering. Anything changed
          there has to be changed here. */}
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-[5vw] sm:pt-[2.92vw] min-[90rem]:px-[17.8vw]">
        <nav className="mx-auto flex min-h-[72px] w-full max-w-[1758px] items-center rounded-full bg-white py-3.5 pl-4 pr-3 shadow-[0_12px_34px_-24px_rgba(54,14,57,0.45)] sm:min-h-[max(3.25rem,4.4vw)] sm:py-[0.4vw] sm:pl-7 sm:pr-4">
          <a href="#home" className="flex shrink-0 items-center" aria-label="Planet Owl home">
            {/* `h-6` below `sm` is the one figure that is NOT the landing bar's.
                That bar has a burger on a phone; this one carries "Blog" and
                the CTA in the same 351px, and at the landing page's `h-8`
                the row was 25px wider than the pill — the CTA hung off the
                right-hand end. */}
            <img src={A.logo} alt="Planet Owl" className="h-8 w-auto sm:h-[max(1.5rem,2vw)]" />
          </a>

          <ul className="ml-auto hidden shrink-0 items-center gap-[max(1rem,2vw)] pl-6 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <BarLink href={l.href} label={l.label} />
              </li>
            ))}
            {/* ONE slot, naming the page you are on. */}
            <li>
              {here ? (
                <BarLink href={here.href} label={here.label} current />
              ) : (
                <BarLink href={BLOG_HOME} label="Blog" />
              )}
            </li>
          </ul>

          {/* Below `lg` the bar is the LANDING page's own: the logo and the
              burger, with the links in a drawer underneath — by request. It
              used to swap to a different bar here (a text label and a small
              CTA, no menu), so tapping Privacy or Blog on a phone changed
              how the navigation looked and took the section links away. The
              drawer is that same list with the page you are on added after
              The Nest. From `sm` the CTA sits in the bar as well, as it does
              on the landing page. */}
          <div className="ml-auto flex shrink-0 items-center gap-2 lg:ml-9">
            <div className="hidden -translate-y-[3px] sm:block">
              <GoldButton
                href="#start"
                withOwl
                iconSrc={A.buttonOwl}
                iconAsBadge
                whileHover={{}}
                reserveHoverWidth
                onClick={openProject}
                className="h-[max(2.5rem,3.3vw)] whitespace-nowrap text-[max(0.8rem,1.05vw)] !shadow-[0_6px_0_-2px_var(--color-plum-900),0_16px_28px_-16px_rgba(20,12,10,0.55)]"
              >
                Start a Project
              </GoldButton>
            </div>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              className="grid size-11 place-items-center rounded-full bg-plum-700 text-white lg:hidden"
            >
              <span className="relative block h-3.5 w-5">
                <motion.span
                  animate={menuOpen ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                  className="absolute inset-x-0 top-0 h-0.5 rounded bg-current"
                />
                <motion.span
                  animate={menuOpen ? { opacity: 0 } : { opacity: 1 }}
                  className="absolute inset-x-0 top-1.5 h-0.5 rounded bg-current"
                />
                <motion.span
                  animate={menuOpen ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                  className="absolute inset-x-0 top-3 h-0.5 rounded bg-current"
                />
              </span>
            </button>
          </div>
        </nav>

        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: 'easeOut' }}
              className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-3xl bg-white/97 p-4 shadow-[0_24px_50px_-26px_rgba(54,14,57,0.7)] backdrop-blur-md lg:hidden"
            >
              <ul className="flex flex-col">
                {NAV_LINKS.map((l) => (
                  <li key={l.href}>
                    <a
                      href={l.href}
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-2xl px-4 py-3 font-ui text-lg font-bold text-plum-700 no-underline transition-colors hover:bg-plum-100"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
                {here && (
                  <li>
                    <a
                      href={here.href}
                      aria-current="page"
                      onClick={() => setMenuOpen(false)}
                      className="block rounded-2xl px-4 py-3 font-ui text-lg font-bold text-teal-600 no-underline"
                    >
                      {here.label}
                    </a>
                  </li>
                )}
              </ul>
              <div className="mt-2 sm:hidden">
                <GoldButton
                  href="#start"
                  withOwl
                  iconSrc={A.buttonOwl}
                  iconAsBadge
                  onClick={openProject}
                  className="w-full justify-center"
                >
                  Start a Project
                </GoldButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="bg-white font-ui text-plum-700">{children}</main>

      {/* The newsletter, on WHITE like the rest of the blog.

          It sat on the footer's night ground — white fading to deep plum, gold
          type on top — on the theory that the footer's scalloped edge and
          plane were drawn for a dark section. By request that band is gone:
          a violet block at the foot of an otherwise white page read as off
          brand. The footer is told its ground is white (`ground`, below), so
          the gold scallops rise straight out of the page. The bottom padding
          is still the room the plane needs. */}
      {/* `newsletter={false}` (the contact page, which is already a form)
          keeps only the room the footer's plane needs. */}
      {!newsletter && <div className="bg-white pb-[5vw]" />}
      {newsletter && (
      /* `pb-[7vw]`, down from 18. The 18 was called "the room the plane
          needs", but the plane only stands 2.2vw clear of the footer's
          scalloped strip — the rest of it is INSIDE the footer — so most of
          that padding was simply empty white under the form. */
      <section className="bg-white px-5 pb-[7vw] pt-[clamp(4rem,8vw,7rem)] sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-['Momo_Trust_Display'] text-[clamp(1.8rem,4vw,3rem)] font-normal leading-[1.1] text-plum-700">
            Fresh Notes From the Nest
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-ui leading-relaxed text-plum-700">
            New articles on brand, design and creative operations, sent when there is something
            worth reading, and never more often than that.
          </p>
          <div className="mt-8 text-left [&_p]:text-plum-700">
            <SignupForm source="blog newsletter" compact />
          </div>
        </div>
      </section>
      )}

      <Footer ground="white" />

      <StartProjectModal open={projectOpen} onClose={() => setProjectOpen(false)} />
    </>
  )
}

/**
 * One link in the bar, with the landing page's hover: the label swaps to
 * Luckiest Guy. An invisible copy in that wider face reserves the width, so
 * the swap does not push the neighbouring links sideways.
 */
function BarLink({ href, label, current = false }) {
  return (
    <a
      href={href}
      data-label={label}
      aria-current={current ? 'page' : undefined}
      className={`btn-type active:!shadow-none relative block text-[max(0.8rem,1.05vw)] font-bold no-underline transition-colors before:invisible before:block before:font-[family-name:var(--font-pop)] before:font-normal before:content-[attr(data-label)] ${
        current ? 'text-teal-600' : 'text-plum-700 hover:text-plum-800'
      }`}
    >
      <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap">{label}</span>
    </a>
  )
}

/** The pill label that names a post's category. */
export function CategoryChip({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-white px-3 py-1.5 font-ui text-[0.7rem] font-bold uppercase leading-none tracking-wide text-plum-700 shadow-[0_6px_14px_-8px_rgba(54,14,57,0.6)] ${className}`}
    >
      {children}
    </span>
  )
}
