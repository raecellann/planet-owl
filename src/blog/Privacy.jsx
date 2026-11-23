import { useEffect, useState } from 'react'
import cloudImg from '../../assets/section 2/image 35 copy.png'
import BlogLayout from './BlogLayout'
import { MobileTopicBar, TOPIC_WATCH, jumpToTopic } from './TopicNav'
import { CONTACT_EMAIL } from '../lib/signup'

/**
 * The privacy page, at `#/privacy`.
 *
 * It lives beside the blog because it is the same kind of page: a light,
 * text-first document inside `BlogLayout`'s frame (the nav pill, the footer),
 * not a section of the landing page.
 *
 * Everything it says is a description of what this build actually does — the
 * sign-up pill in `SignupForm`, the POST in `src/lib/signup.js`, the fonts in
 * `index.html`. If any of those change (an analytics script, a new form
 * field, a different form backend), this page has to change with them.
 */

const SECTIONS = [
  {
    title: 'What we collect',
    body: [
      'This website only learns what you choose to type into one of our forms. The sign-up bar at the foot of the page, the “Start a Project” window and the newsletter form on the blog ask for your email address.',
      'The contact page asks for more, so that we can reply properly or book a call: your name and email address and, if you choose to give them, your company, website, phone number, a preferred date and time for a call (with your time zone), and your message.',
      'When you send any of these forms we also receive the address of the page you sent it from and which form you used, so we know what you were asking about.',
      'We do not ask you to create an account, and this website does not use advertising trackers or analytics cookies.',
    ],
  },
  {
    title: 'How we use it',
    body: [
      'We use what you send us to reply to you about the project, call, trial or newsletter you asked about. We do not sell it, and we do not share it with anyone for their own marketing.',
    ],
  },
  {
    title: 'Who handles it for us',
    body: [
      'Form submissions are delivered to our inbox by Formspree, a form-handling service. The website itself is hosted on Vercel, which, like any web host, keeps standard server logs such as IP addresses and browser type in order to deliver the site and keep it secure. Our typefaces are loaded from Google Fonts, so your browser contacts Google’s servers to fetch them.',
      'Each of these providers handles that information under its own privacy policy.',
    ],
  },
  {
    title: 'How long we keep it',
    body: [
      'We keep what you send us for as long as we are in conversation with you or sending you the updates you asked for. Tell us to stop and we will remove it.',
    ],
  },
  {
    title: 'Your choices',
    body: [
      'You can ask us what we hold about you, ask us to correct it, or ask us to delete it, at any time. Every newsletter we send can be unsubscribed from by replying to it.',
    ],
  },
  {
    title: 'Links to other sites',
    body: [
      'Our pages link to social networks and to our clients’ own websites. We are not responsible for how those sites handle your information.',
    ],
  },
  {
    title: 'Changes to this page',
    body: [
      'If what we collect or how we use it changes, we will update this page.',
    ],
  },
]

const slug = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
const TOPICS = [...SECTIONS.map((s) => s.title), 'Contact us'].map((label) => ({ id: slug(label), label }))

export default function Privacy() {
  const [active, setActive] = useState(TOPICS[0].id)

  useEffect(() => {
    document.title = 'Planet Owl'
  }, [])

  // Which section is on screen, for the list's highlight — the same reading
  // the blog articles use for their own Topics list.
  useEffect(() => {
    const els = TOPICS.map((t) => document.getElementById(`topic-${t.id}`)).filter(Boolean)
    const io = new IntersectionObserver(
      (entries) => {
        const seen = entries.filter((e) => e.isIntersecting).sort((x, y) => x.boundingClientRect.top - y.boundingClientRect.top)
        if (seen[0]) setActive(seen[0].target.id.replace('topic-', ''))
      },
      { rootMargin: TOPIC_WATCH },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])

  return (
    <BlogLayout onBlog={false} newsletter={false} page={{ label: 'Privacy', href: '#/privacy' }}>
      {/* The clouds belong to the whole article, behind everything, so the
          short header can no longer slice them along its bottom edge. */}
      <article className="relative isolate overflow-x-clip bg-white">
        <img src={cloudImg} alt="" aria-hidden className="pointer-events-none absolute -left-[25vw] top-[5rem] -z-10 w-[max(20rem,46vw)] max-w-none -scale-x-100 select-none opacity-45 max-md:-left-[42vw] max-md:top-[4.75rem] max-md:w-[62vw] max-md:[mask-image:linear-gradient(90deg,#000_45%,transparent_78%)]" />
        <img src={cloudImg} alt="" aria-hidden className="pointer-events-none absolute -right-[26vw] top-[8rem] -z-10 w-[max(20rem,46vw)] max-w-none select-none opacity-40 max-md:-right-[42vw] max-md:top-[4.75rem] max-md:w-[62vw] max-md:[mask-image:linear-gradient(270deg,#000_45%,transparent_78%)]" />
        <header className="relative px-5 pb-10 pt-[clamp(10rem,15vw,13.5rem)] sm:px-8">
          <div className="relative mx-auto max-w-3xl text-center">
            <h1 className="font-['Momo_Trust_Display'] text-[clamp(1.9rem,4.2vw,3.2rem)] font-normal leading-[1.12] text-plum-700">
              Privacy Policy
            </h1>
            <p className="mx-auto mt-5 max-w-xl font-ui leading-relaxed text-plum-700">
              Planet Owl is a creative studio. This page explains, in plain words, what this website
              learns about you and what we do with it.
            </p>
          </div>
        </header>

        {/* The article layout, by request: the sections listed down the left,
            staying put while the text scrolls, with the one being read marked
            in gold. Same grid and same list as `BlogPost`, less its share
            column. Below `lg` the list is hidden and the page is one column. */}
        <div>
        <MobileTopicBar topics={TOPICS} active={active} label="On this page" />
        <div className="mx-auto grid max-w-[1180px] gap-10 px-5 pb-8 pt-4 sm:px-8 lg:grid-cols-[13rem_minmax(0,1fr)] lg:gap-16">
          <nav aria-label="On this page" className="hidden lg:block">
            <div className="sticky top-[calc(2.92vw+max(3.25rem,4.4vw)+2rem)]">
              <p className="font-ui text-xs font-bold uppercase tracking-wider text-plum-700">On this page</p>
              <ul className="mt-4 space-y-3 border-l-2 border-plum-100">
                {TOPICS.map((t) => (
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

          <div className="min-w-0 max-w-3xl">
            {SECTIONS.map((s) => (
              <section key={s.title} id={`topic-${slug(s.title)}`} className="mt-10 scroll-mt-[calc(2.92vw+max(3.25rem,4.4vw)+2rem)] first:mt-0">
                <h2 className="font-ui text-xl font-bold text-plum-700 sm:text-2xl">{s.title}</h2>
                {s.body.map((p) => (
                  <p key={p} className="mt-3 font-ui leading-relaxed text-plum-700">
                    {p}
                  </p>
                ))}
              </section>
            ))}

            <section id="topic-contact-us" className="mt-10 scroll-mt-[calc(2.92vw+max(3.25rem,4.4vw)+2rem)]">
              <h2 className="font-ui text-xl font-bold text-plum-700 sm:text-2xl">Contact us</h2>
              <p className="mt-3 font-ui leading-relaxed text-plum-700">
                Questions about this page, or a request about your information, can be sent to{' '}
                <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-teal-600 underline">
                  {CONTACT_EMAIL}
                </a>
                .
              </p>
            </section>
          </div>
        </div>
        </div>
      </article>
    </BlogLayout>
  )
}
