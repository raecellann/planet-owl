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
/* `onBlog` is false for the pages that borrow this frame without being the
   blog (the privacy page), so "Blog" is not marked as the current page there. */
export default function BlogLayout({ children, onBlog = true, newsletter = true }) {
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
            <li>
              <a
                href={BLOG_HOME}
                aria-current={onBlog ? 'page' : undefined}
                className={`font-ui text-[max(0.8rem,1.05vw)] font-bold no-underline ${onBlog ? 'text-teal-600' : 'text-plum-700 transition-colors hover:text-plum-900'}`}
              >
                Blog
              </a>
            </li>
          </ul>

          <a
            href={BLOG_HOME}
            className={`ml-auto font-ui text-sm font-bold no-underline lg:hidden ${onBlog ? 'text-teal-600' : 'text-plum-700'}`}
          >
            Blog
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
      {!newsletter && <div className="bg-white pb-[18vw]" />}
      {newsletter && (
      <section className="bg-white px-5 pb-[18vw] pt-[clamp(4rem,8vw,7rem)] sm:px-8">
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
