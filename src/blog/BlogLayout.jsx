import { useEffect, useState } from 'react'
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
  const openProject = (e) => {
    e.preventDefault()
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
          <a href="#home" className="flex shrink-0 items-center" aria-label="Planet Owl — home">
            {/* `h-6` below `sm` is the one figure that is NOT the landing bar's.
                That bar has a burger on a phone; this one carries "Blog" and
                the CTA in the same 351px, and at the landing page's `h-8`
                the row was 25px wider than the pill — the CTA hung off the
                right-hand end. */}
            <img src={A.logo} alt="Planet Owl" className="h-6 w-auto sm:h-[max(1.5rem,2vw)]" />
          </a>

          <ul className="ml-auto hidden shrink-0 items-center gap-[max(1rem,2vw)] pl-6 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="font-ui text-[max(0.8rem,1.05vw)] font-bold text-plum-700 no-underline transition-colors hover:text-plum-900"
                >
                  {l.label}
                </a>
              </li>
            ))}
            {/* ONE slot, naming the page you are on. "Blog" used to stay here
                beside the current page's name on About, Pricing and the
                rest, which read as two places at once. Off the blog, the
                blog is still one click away in the footer. */}
            {(!here || hereIsBlog) && (
              <li>
              <a
                href={BLOG_HOME}
                aria-current={hereIsBlog ? 'page' : undefined}
                className={`font-ui text-[max(0.8rem,1.05vw)] font-bold no-underline ${hereIsBlog ? 'text-teal-600' : 'text-plum-700 transition-colors hover:text-plum-900'}`}
              >
                Blog
              </a>
            </li>
            )}
            {here && !hereIsBlog && (
              <li>
                <a
                  href={here.href}
                  aria-current="page"
                  className="font-ui text-[max(0.8rem,1.05vw)] font-bold text-teal-600 no-underline"
                >
                  {here.label}
                </a>
              </li>
            )}
          </ul>

          {/* Phones have room for one label: the page you are on. */}
          <a
            href={here ? here.href : BLOG_HOME}
            aria-current={here ? 'page' : undefined}
            className={`ml-auto font-ui text-sm font-bold no-underline lg:hidden ${here ? 'text-teal-600' : 'text-plum-700'}`}
          >
            {here ? here.label : 'Blog'}
          </a>

          <div className="ml-2 shrink-0 -translate-y-[3px] sm:ml-4 lg:ml-9">
            <GoldButton
              href="#start"
              withOwl
              iconSrc={A.buttonOwl}
              iconAsBadge
              whileHover={{}}
              onClick={openProject}
              className="h-10 whitespace-nowrap !px-3 text-[0.8rem] !shadow-[0_6px_0_-2px_var(--color-plum-900),0_16px_28px_-16px_rgba(20,12,10,0.55)] sm:h-[max(2.5rem,3.3vw)] sm:!px-6 sm:text-[max(0.8rem,1.05vw)]"
            >
              Start a Project
            </GoldButton>
          </div>
        </nav>
      </header>

      <main className="bg-white font-ui text-plum-900">{children}</main>

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
          <p className="mx-auto mt-4 max-w-xl font-ui leading-relaxed text-plum-800">
            New articles on brand, design and creative operations — sent when there is something
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

/** The pill label that names a post's category. */
export function CategoryChip({ children, className = '' }) {
  return (
    <span
      className={`inline-flex items-center rounded-full bg-white px-3 py-1.5 font-ui text-[0.7rem] font-bold uppercase leading-none tracking-wide text-plum-800 shadow-[0_6px_14px_-8px_rgba(54,14,57,0.6)] ${className}`}
    >
      {children}
    </span>
  )
}
