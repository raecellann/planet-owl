/**
 * Runs after `vite build` (see package.json). Turns the single-page build into
 * something search engines and AI crawlers can read without running JS:
 *
 *   - one HTML file per route (dist/pricing.html, dist/blog/<slug>.html ...)
 *     with that page's own description, canonical URL, structured data, and a
 *     <noscript> text version of what the page says. `cleanUrls` in
 *     vercel.json serves dist/pricing.html at /pricing; the React app still
 *     boots on every one of them exactly as before.
 *   - dist/sitemap.xml listing every route and article.
 *
 * The tab title stays "Planet Owl" on every page, by the client's request.
 * Every fact here comes from the site's own copy (posts.js, the FAQ, the
 * pricing plans, the contact page). Add a route to ROUTES when a page is added.
 */
import { readFile, writeFile, mkdir } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = resolve(ROOT, 'dist')
const SITE = 'https://planetowl.studio'

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')

// Load the site's own data through Vite, so image imports resolve.
const vite = await createServer({ root: ROOT, logLevel: 'error', server: { middlewareMode: true }, appType: 'custom' })
const { POSTS } = await vite.ssrLoadModule('/src/blog/posts.js')
const { FAQS } = await vite.ssrLoadModule('/src/components/Faq.jsx')
await vite.close()

const ORG = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${SITE}/#studio`,
  name: 'Planet Owl Studio',
  alternateName: 'Planet Owl',
  url: `${SITE}/`,
  logo: `${SITE}/apple-touch-icon.png`,
  image: `${SITE}/og-image.jpg`,
  description:
    'Planet Owl, the creative studio building identities, websites, apps, AI solutions and immersive experiences for brands that rise above the ordinary.',
  email: 'hello@planetowl.studio',
  telephone: '+63 967 981 2402',
  address: {
    '@type': 'PostalAddress',
    streetAddress: 'Purok Sampaguita 131B, Tangob',
    addressLocality: 'Padre Garcia',
    addressRegion: 'Batangas',
    addressCountry: 'PH',
  },
  knowsAbout: ['Brand identity', 'Web design', 'UI/UX', 'App development', 'E-commerce', 'Social media ads', 'SEO', 'AI assistants', 'Chatbots', 'Automation', 'Generative AI'],
}
const WEBSITE = { '@context': 'https://schema.org', '@type': 'WebSite', '@id': `${SITE}/#website`, name: 'Planet Owl', url: `${SITE}/`, publisher: { '@id': `${SITE}/#studio` } }
const FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.filter((f) => typeof f.a === 'string' && f.q && !f.q.startsWith('text-')).map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
}
const crumbs = (items) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: `${SITE}${path}` })),
})

const faqHtml = `<h2>Questions</h2>${FAQ_LD.mainEntity.map((q) => `<h3>${esc(q.name)}</h3><p>${esc(q.acceptedAnswer.text)}</p>`).join('')}`
const contactHtml = `<h2>Contact</h2><p>Email <a href="mailto:hello@planetowl.studio">hello@planetowl.studio</a>, WhatsApp +63 967 981 2402, or <a href="${SITE}/contact">send a message or book a call</a>. Purok Sampaguita 131B, Tangob, Padre Garcia, Batangas, Philippines.</p>`

const PLANS = [
  ['Hatchling', '$895 a month', 'A design team for the brand you are getting off the ground.'],
  ['Flock', '$1,695 a month', 'Design, plus the content and campaigns that put it to work.'],
  ['Nest', '$2,995 a month', 'Add the builders: websites, apps and stores, designed and shipped.'],
  ['Parliament', 'from $4,495 a month', 'The whole nest, with AI and custom software, scoped to you.'],
]

const ROUTES = [
  {
    path: '/',
    file: 'index.html',
    description: ORG.description,
    ld: [ORG, WEBSITE, FAQ_LD],
    body: `<h1>Planet Owl: creative studio for design, development, digital and AI</h1><p>${esc(ORG.description)}</p><h2>What we do</h2><p>Four crafts under one roof. Design: logos and brand identity, packaging, video editing, 3D motion, websites and UI/UX. Develop: web and mobile apps, custom software, e-commerce, databases, cloud, CMS and APIs. Digital: content, social media ads, social listening, digital films and SEO. AI Tech: assistants, chatbots, automation, generative AI, analytics and integration.</p><p>New clients can start with a free 2-week trial. <a href="${SITE}/pricing">See pricing</a> or <a href="${SITE}/contact">start a project</a>.</p>${faqHtml}${contactHtml}`,
  },
  {
    path: '/pricing',
    file: 'pricing.html',
    description: 'Planet Owl pricing: one flat monthly price per plan. Hatchling $895, Flock $1,695, Nest $2,995 and Parliament from $4,495 a month, with a free 2-week trial for new clients.',
    ld: [crumbs([['Home', '/'], ['Pricing', '/pricing']]), FAQ_LD],
    body: `<h1>Planet Owl pricing</h1><p>One flat monthly price on your plan, billed month by month. New clients can start with a free 2-week trial.</p><ul>${PLANS.map(([n, p, l]) => `<li><strong>${n}</strong>, ${p}: ${esc(l)}</li>`).join('')}</ul>${faqHtml}${contactHtml}`,
  },
  {
    path: '/about',
    file: 'about.html',
    description: 'Meet the owls behind Planet Owl, the creative studio for design, development, digital and AI work.',
    ld: [crumbs([['Home', '/'], ['About', '/about']]), ORG],
    body: `<h1>Meet the owls behind the work</h1><p>${esc(ORG.description)}</p>${contactHtml}`,
  },
  {
    path: '/contact',
    file: 'contact.html',
    description: 'Contact Planet Owl: email hello@planetowl.studio, WhatsApp +63 967 981 2402, send a message, or book a 30-minute call.',
    ld: [crumbs([['Home', '/'], ['Contact', '/contact']]), ORG],
    body: `<h1>Contact Planet Owl</h1><p>Tell us what you are building, or pick a time and book a 30-minute call.</p>${contactHtml}`,
  },
  {
    path: '/book',
    file: 'book.html',
    description: 'Book a 30-minute call with Planet Owl. Pick a time on the calendar and the invite with the call link lands in your inbox.',
    ld: [crumbs([['Home', '/'], ['Book a Call', '/book']])],
    body: `<h1>Book a 30-minute call with Planet Owl</h1><p>Pick a day and time, and the invite with the call link lands in your inbox. Or book directly on <a href="https://calendly.com/planetowlstudio/30min">Calendly</a>.</p>${contactHtml}`,
  },
  {
    path: '/blog',
    file: 'blog.html',
    description: 'The Planet Owl blog: notes on creative operations, always-on marketing and scaling design output.',
    ld: [crumbs([['Home', '/'], ['Blog', '/blog']])],
    body: `<h1>Planet Owl blog</h1><ul>${POSTS.map((p) => `<li><a href="${SITE}/blog/${p.slug}">${esc(p.title)}</a>: ${esc(p.excerpt)}</li>`).join('')}</ul>`,
  },
  {
    path: '/privacy',
    file: 'privacy.html',
    description: 'How Planet Owl handles the details you send through its forms.',
    ld: [crumbs([['Home', '/'], ['Privacy', '/privacy']])],
    body: `<h1>Privacy at Planet Owl</h1>${contactHtml}`,
  },
  ...POSTS.map((p) => ({
    path: `/blog/${p.slug}`,
    file: `blog/${p.slug}.html`,
    description: p.excerpt,
    type: 'article',
    ld: [
      crumbs([['Home', '/'], ['Blog', '/blog'], [p.title, `/blog/${p.slug}`]]),
      {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: p.title,
        description: p.excerpt,
        datePublished: p.date,
        url: `${SITE}/blog/${p.slug}`,
        author: { '@id': `${SITE}/#studio` },
        publisher: { '@id': `${SITE}/#studio` },
        image: `${SITE}/og-image.jpg`,
      },
    ],
    body: `<article><h1>${esc(p.title)}</h1><p>${esc(p.excerpt)}</p>${(p.sections || [])
      .map(
        (s) =>
          `<h2>${esc(s.heading)}</h2>${(s.blocks || [])
            .map((b) =>
              b.p
                ? `<p>${esc(b.p)}</p>`
                : b.list
                  ? `<ul>${b.list.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`
                  : b.steps
                    ? `<ol>${b.steps.map((x) => `<li><strong>${esc(x.title)}</strong>: ${esc(x.text ?? x.copy ?? x.line ?? '')}</li>`).join('')}</ol>`
                    : b.quote
                      ? `<blockquote>${esc(b.quote)}</blockquote>`
                      : '',
            )
            .join('')}`,
      )
      .join('')}</article>`,
  })),
]

const template = await readFile(resolve(DIST, 'index.html'), 'utf8')

const pageHtml = (r) => {
  const url = `${SITE}${r.path === '/' ? '/' : r.path}`
  let html = template
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${esc(r.description)}$2`)
    .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(r.description)}$2`)
    .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(r.description)}$2`)
    .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
  if (r.type) html = html.replace(/(<meta property="og:type" content=")[^"]*(")/, `$1${r.type}$2`)
  const head = [
    `<link rel="canonical" href="${url}" />`,
    ...r.ld.map((d) => `<script type="application/ld+json">${JSON.stringify(d).replace(/</g, '\\u003c')}</script>`),
  ].join('\n    ')
  html = html.replace('</head>', `    ${head}\n  </head>`)
  html = html.replace('<div id="root"></div>', `<div id="root"></div>\n    <noscript>${r.body}</noscript>`)
  return html
}

for (const r of ROUTES) {
  const out = resolve(DIST, r.file)
  await mkdir(dirname(out), { recursive: true })
  await writeFile(out, pageHtml(r))
}

const today = new Date().toISOString().slice(0, 10)
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${ROUTES.map((r) => `  <url><loc>${SITE}${r.path === '/' ? '/' : r.path}</loc><lastmod>${r.type ? POSTS.find((p) => `/blog/${p.slug}` === r.path)?.date || today : today}</lastmod></url>`).join('\n')}
</urlset>
`
await writeFile(resolve(DIST, 'sitemap.xml'), sitemap)
console.log(`seo-pages: ${ROUTES.length} pages + sitemap.xml`)
