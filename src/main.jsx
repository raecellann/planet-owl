import { StrictMode, Suspense, lazy, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
// The other pages load only when visited, so the home page downloads less on
// a phone (SEO: "fast mobile pages").
const BlogIndex = lazy(() => import('./blog/BlogIndex.jsx'))
const BlogPost = lazy(() => import('./blog/BlogPost.jsx'))
const Privacy = lazy(() => import('./blog/Privacy.jsx'))
const Contact = lazy(() => import('./blog/Contact.jsx'))
const Book = lazy(() => import('./blog/Book.jsx'))
const About = lazy(() => import('./blog/About.jsx'))
const Pricing = lazy(() => import('./blog/Pricing.jsx'))
import { findPost } from './blog/posts.js'
import { watchOrphans } from './lib/noOrphans'
import './index.css'

/**
 * Does this browser's scrollbar take up width, or float over the content?
 *
 * A classic scrollbar makes an `overflow: scroll` box's client area narrower
 * than its border box; an overlay one leaves them equal. The probe is off
 * screen and removed straight away, and it runs BEFORE render so no frame is
 * ever painted at the wrong width.
 *
 * See `.has-classic-scrollbars` in `index.css` for why the gutter has to be
 * conditional: reserving it unconditionally puts the whole page 7.5px off
 * centre wherever the scrollbar is an overlay one, which is the Windows 11
 * default. This is measured rather than sniffed because it is a per-OS, per-
 * setting, per-device-type property that no user-agent string reports.
 */
const probe = document.createElement('div')
probe.style.cssText = 'position:absolute;top:-9999px;width:100px;height:100px;overflow:scroll'
document.body.appendChild(probe)
if (probe.offsetWidth - probe.clientWidth > 0) {
  document.documentElement.classList.add('has-classic-scrollbars')
}
probe.remove()

/**
 * The site's one piece of routing: the blog, on HASH routes.
 *
 *   #/blog          the index
 *   #/blog/<slug>   one article
 *   #/pricing       the plans and prices (same arrangement)
 *   #/about         the about page (same arrangement)
 *   #/contact       the contact / book-a-call page (same arrangement)
 *   #/privacy       the privacy page (same frame as the blog, so it rides the
 *                   `blog` branch below and gets the same scroll-to-top)
 *   anything else   the landing page
 *
 * Hash routes rather than `/blog` paths because they need nothing from the
 * host — a path route only works where the server has been told to answer
 * every URL with `index.html`, and this build is a plain static bundle that
 * may be dropped anywhere. A `#/…` address is resolved entirely in the
 * browser, so it survives a refresh and a shared link on any host.
 *
 * The landing page's own anchors (`#portfolio`, `#the-nest`…) never start
 * with `#/`, so the two cannot collide.
 */
// Pages live at real paths now (/pricing, /blog/slug), by request: the
// address bar used to read planetowl.studio/#/pricing. Old #/ links still
// work: they are turned into the path the moment the site opens.
if (typeof window !== 'undefined' && window.location.hash.startsWith('#/')) {
  window.history.replaceState(null, '', window.location.hash.slice(1) + window.location.search)
}

const parseRoute = () => {
  const path = window.location.pathname.replace(/\/+$/, '') || '/'
  if (path === '/privacy') return { blog: true, slug: null, privacy: true }
  if (path === '/contact') return { blog: true, slug: null, contact: true }
  if (path === '/book') return { blog: true, slug: null, book: true }
  if (path === '/about') return { blog: true, slug: null, about: true }
  if (path === '/pricing') return { blog: true, slug: null, pricing: true }
  const m = path.match(/^\/blog(?:\/([^/?#]+))?$/)
  return m ? { blog: true, slug: m[1] ? decodeURIComponent(m[1]) : null } : { blog: false }
}

/** Moves to another page of the site without a reload. */
const ROUTE_EVENT = 'planetowl:route'
export function goTo(url) {
  window.history.pushState(null, '', url)
  window.dispatchEvent(new Event(ROUTE_EVENT))
}

// One listener for every link on the site, so the anchors stay plain hrefs:
//   /pricing, /blog/...   a page of the site, opened without a reload
//   #portfolio            a home-page section; from another page this goes
//                         home first, and App scrolls to it on arrival
if (typeof document !== 'undefined') {
  document.addEventListener('click', (e) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const a = e.target instanceof Element ? e.target.closest('a[href]') : null
    if (!a || (a.target && a.target !== '_self') || a.hasAttribute('download')) return
    const href = a.getAttribute('href')
    if (href.startsWith('/') && !href.startsWith('//') && !href.startsWith('/api/') && !/\.[a-z0-9]+$/i.test(href.split(/[?#]/)[0])) {
      e.preventDefault()
      goTo(href)
    } else if (href.startsWith('#') && href.length > 1 && window.location.pathname !== '/') {
      e.preventDefault()
      goTo('/' + href)
    }
  })
}

// No "save image" menu on the site's art, by request (feathers, owls, the
// wizard). A deterrent only; it does not stop a screenshot.
if (typeof document !== 'undefined') {
  document.addEventListener('contextmenu', (e) => {
    if (e.target instanceof HTMLImageElement) e.preventDefault()
  })
  document.addEventListener('dragstart', (e) => {
    if (e.target instanceof HTMLImageElement) e.preventDefault()
  })
}

function Root() {
  const [route, setRoute] = useState(parseRoute)
  // Once the blog has been open, coming back to the landing page skips its
  // hold-to-enter screen: that gate is an arrival, and someone following
  // "Portfolio" out of an article has already arrived.
  const seenBlog = useRef(route.blog)

  useEffect(() => {
    const onHash = () => {
      // An old #/ link followed inside the site: turn it into its path.
      if (window.location.hash.startsWith('#/')) {
        window.history.replaceState(null, '', window.location.hash.slice(1))
        setRoute(parseRoute())
        return
      }
      setRoute(parseRoute())
      // A section link (#portfolio, #what-we-do) jumps to its section and
      // then leaves the address bar clean, by request.
      const h = window.location.hash
      if (h) {
        setTimeout(() => {
          if (window.location.hash === h) window.history.replaceState(null, '', window.location.pathname + window.location.search)
        }, 900)
      }
    }
    const onRoute = () => setRoute(parseRoute())
    window.addEventListener('hashchange', onHash)
    window.addEventListener('popstate', onRoute)
    window.addEventListener(ROUTE_EVENT, onRoute)
    return () => {
      window.removeEventListener('hashchange', onHash)
      window.removeEventListener('popstate', onRoute)
      window.removeEventListener(ROUTE_EVENT, onRoute)
    }
  }, [])

  // Every blog page opens at its top. Instant, not smooth — `html` carries
  // `scroll-behavior: smooth`, and a new page should not glide in from
  // wherever the last one was left.
  useEffect(() => {
    if (!route.blog) return
    seenBlog.current = true
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    if (!route.slug && !route.privacy && !route.contact && !route.book && !route.about && !route.pricing) document.title = 'Planet Owl'
  }, [route.blog, route.slug, route.privacy, route.contact, route.book, route.about, route.pricing])

  if (route.privacy) return <Privacy />
  if (route.contact) return <Contact />
  if (route.book) return <Book />
  if (route.about) return <About />
  if (route.pricing) return <Pricing />
  if (route.blog) {
    const post = route.slug ? findPost(route.slug) : null
    // An unknown slug falls back to the index rather than to an empty page.
    return post ? <BlogPost key={post.slug} post={post} /> : <BlogIndex />
  }
  return <App skipIntro={seenBlog.current} />
}

watchOrphans()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Suspense fallback={<div className="min-h-svh bg-white" />}>
      <Root />
    </Suspense>
  </StrictMode>,
)
