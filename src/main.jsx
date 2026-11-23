import { StrictMode, useEffect, useRef, useState } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import BlogIndex from './blog/BlogIndex.jsx'
import BlogPost from './blog/BlogPost.jsx'
import Privacy from './blog/Privacy.jsx'
import { findPost } from './blog/posts.js'
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
const parseRoute = () => {
  if (/^#\/privacy\/?$/.test(window.location.hash)) return { blog: true, slug: null, privacy: true }
  const m = window.location.hash.match(/^#\/blog(?:\/([^/?#]+))?\/?$/)
  return m ? { blog: true, slug: m[1] ? decodeURIComponent(m[1]) : null } : { blog: false }
}

function Root() {
  const [route, setRoute] = useState(parseRoute)
  // Once the blog has been open, coming back to the landing page skips its
  // hold-to-enter screen: that gate is an arrival, and someone following
  // "Portfolio" out of an article has already arrived.
  const seenBlog = useRef(route.blog)

  useEffect(() => {
    const onHash = () => setRoute(parseRoute())
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  // Every blog page opens at its top. Instant, not smooth — `html` carries
  // `scroll-behavior: smooth`, and a new page should not glide in from
  // wherever the last one was left.
  useEffect(() => {
    if (!route.blog) return
    seenBlog.current = true
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
    if (!route.slug && !route.privacy) document.title = 'Blog — Planet Owl'
  }, [route.blog, route.slug, route.privacy])

  if (route.privacy) return <Privacy />
  if (route.blog) {
    const post = route.slug ? findPost(route.slug) : null
    // An unknown slug falls back to the index rather than to an empty page.
    return post ? <BlogPost key={post.slug} post={post} /> : <BlogIndex />
  }
  return <App skipIntro={seenBlog.current} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
