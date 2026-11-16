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
export default function BlogLayout({ children }) {
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
      <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-[5vw] sm:pt-5">
        <nav className="mx-auto flex min-h-[64px] w-full max-w-[1180px] items-center gap-4 rounded-full bg-white py-2 pl-5 pr-3 shadow-[0_12px_34px_-24px_rgba(54,14,57,0.45)] sm:pl-7">
          <a href="#home" className="flex shrink-0 items-center" aria-label="Planet Owl — home">
            <img src={A.logo} alt="Planet Owl" className="h-7 w-auto sm:h-8" />
          </a>

          <ul className="ml-auto hidden items-center gap-7 lg:flex">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <a
                  href={l.href}
                  className="font-ui text-[0.95rem] font-bold text-plum-700 no-underline transition-colors hover:text-plum-900"
                >
                  {l.label}
                </a>
              </li>
            ))}
            <li>
              <a
                href={BLOG_HOME}
                aria-current="page"
                className="font-ui text-[0.95rem] font-bold text-teal-600 no-underline"
              >
                Blog
              </a>
            </li>
          </ul>

          <a
            href={BLOG_HOME}
            className="ml-auto font-ui text-sm font-bold text-teal-600 no-underline lg:hidden"
          >
            Blog
          </a>

          <div className="shrink-0 -translate-y-[3px] lg:ml-2">
            <GoldButton
              href="#start"
              withOwl
              iconSrc={A.buttonOwl}
              iconAsBadge
              whileHover={{}}
              onClick={openProject}
              className="h-11 whitespace-nowrap !px-4 text-sm sm:!px-6 sm:text-base"
            >
              Start a Project
            </GoldButton>
          </div>
        </nav>
      </header>

      <main className="bg-white font-ui text-plum-900">{children}</main>

      {/* The newsletter, on the footer's own night ground. The footer opens
          with a gold scalloped edge and a plane that stands 14vw ABOVE it —
          both drawn for a dark section to sit on — so the blog ends on that
          same dark rather than running white straight into them. The bottom
          padding is the room the plane needs. */}
      <section className="bg-[linear-gradient(180deg,#ffffff_0%,#24051f_22%)] px-5 pb-[18vw] pt-[clamp(8rem,16vw,14rem)] sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-['Momo_Trust_Display'] text-[clamp(1.8rem,4vw,3rem)] font-normal leading-[1.1] text-gold-500">
            Fresh Notes From the Nest
          </h2>
          <p className="mx-auto mt-4 max-w-xl font-ui leading-relaxed text-gold-400">
            New articles on brand, design and creative operations — sent when there is something
            worth reading, and never more often than that.
          </p>
          <div className="mt-8 text-left [&_p]:text-gold-200">
            <SignupForm source="blog newsletter" compact />
          </div>
        </div>
      </section>

      <Footer />

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
