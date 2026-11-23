import { useEffect } from 'react'
import BlogLayout from './BlogLayout'
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
const UPDATED = 'November 23, 2026'

const SECTIONS = [
  {
    title: 'What we collect',
    body: [
      'The only personal information this website asks for is your email address, and only when you choose to type it into one of our forms — the sign-up bar at the foot of the page, the “Start a Project” window, or the newsletter form on the blog.',
      'When you send one of those forms we also receive the address of the page you sent it from and which form you used, so we know what you were asking about.',
      'We do not ask you to create an account, and this website does not use advertising trackers or analytics cookies.',
    ],
  },
  {
    title: 'How we use it',
    body: [
      'We use your email address to reply to you about the project, trial or newsletter you asked about. We do not sell it, and we do not share it with anyone for their own marketing.',
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
      'We keep your email address for as long as we are in conversation with you or sending you the updates you asked for. Tell us to stop and we will remove it.',
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
      'If what we collect or how we use it changes, we will update this page and the date at the top of it.',
    ],
  },
]

export default function Privacy() {
  useEffect(() => {
    document.title = 'Privacy — Planet Owl'
  }, [])

  return (
    <BlogLayout onBlog={false}>
      <article>
        <header className="bg-[linear-gradient(180deg,#cdd8f4_0%,#dfe7fa_45%,#ffffff_100%)] px-5 pb-10 pt-[clamp(8rem,12vw,10.5rem)] sm:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <p className="font-ui text-sm text-plum-600">Last updated {UPDATED}</p>
            <h1 className="mt-4 font-['Momo_Trust_Display'] text-[clamp(1.9rem,4.2vw,3.2rem)] font-normal leading-[1.12] text-plum-700">
              Privacy Policy
            </h1>
            <p className="mx-auto mt-5 max-w-xl font-ui leading-relaxed text-plum-800">
              Planet Owl is a creative studio. This page explains, in plain words, what this website
              learns about you and what we do with it.
            </p>
          </div>
        </header>

        <div className="mx-auto max-w-3xl px-5 pb-8 pt-4 sm:px-8">
          {SECTIONS.map((s) => (
            <section key={s.title} className="mt-10 first:mt-0">
              <h2 className="font-ui text-xl font-bold text-plum-900 sm:text-2xl">{s.title}</h2>
              {s.body.map((p) => (
                <p key={p} className="mt-3 font-ui leading-relaxed text-plum-800">
                  {p}
                </p>
              ))}
            </section>
          ))}

          <section className="mt-10">
            <h2 className="font-ui text-xl font-bold text-plum-900 sm:text-2xl">Contact us</h2>
            <p className="mt-3 font-ui leading-relaxed text-plum-800">
              Questions about this page, or a request about your information, can be sent to{' '}
              <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-teal-600 underline">
                {CONTACT_EMAIL}
              </a>
              .
            </p>
          </section>
        </div>
      </article>
    </BlogLayout>
  )
}
