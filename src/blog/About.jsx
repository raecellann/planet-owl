import { useEffect } from 'react'
import BlogLayout from './BlogLayout'
import { A } from '../lib/assets'

/**
 * The About page, at `#/about`.
 *
 * Written from the site's own words, by request ("gawa ka na lang") — there
 * was no About copy to work from. So every claim here is one the landing page
 * already makes: the description in `index.html`, the four crafts in What We
 * Do, the three promises in Top Secrets, the ribbon's "No guesswork". It
 * deliberately carries NO numbers, dates, names or places — no founding year,
 * client count or team size — because none were supplied and an About page is
 * the last place to invent them. Add them here when the studio has them.
 *
 * Arranged after the reference the client sent: an opening statement, who we
 * are, what we do as a row of cards, how we work, and a closing ask.
 */
const CRAFTS = [
  {
    title: 'Design',
    owl: A.owl.vr,
    copy: 'Logos and brand identity, packaging, video editing, 3D motion, websites and UI/UX.',
  },
  {
    title: 'Develop',
    owl: A.owl.develop,
    copy: 'Web and mobile apps, custom software, e-commerce, databases, cloud, CMS and APIs.',
  },
  {
    title: 'Digital',
    owl: A.owl.digital,
    copy: 'Content, social media ads, social listening, digital films, e-commerce and SEO.',
  },
  {
    title: 'AI Tech',
    owl: A.owl.ai,
    copy: 'AI assistants, chatbots, automation, generative AI, analytics and integration.',
  },
]

const PROMISES = [
  {
    title: 'Make your brand impossible to ignore',
    copy: 'We blend bold design, storytelling, content and immersive experiences to turn attention into genuine connection — so people do not just notice your brand, they remember it.',
  },
  {
    title: 'Turn ambitious ideas into seamless products',
    copy: 'From websites and mobile apps to e-commerce platforms and custom software, we design and develop digital products that look exceptional, work beautifully and support real business goals.',
  },
  {
    title: 'Make technology work smarter',
    copy: 'We use AI, automation, analytics and intelligent systems to simplify complex work, improve customer experiences and help your business move faster.',
  },
]

export default function About() {
  useEffect(() => {
    document.title = 'About — Planet Owl'
  }, [])

  return (
    <BlogLayout onBlog={false} newsletter={false}>
      {/* ------------------------------------------------------ opening -- */}
      <header className="bg-[linear-gradient(180deg,#cdd8f4_0%,#dfe7fa_45%,#ffffff_100%)] px-5 pb-14 pt-[clamp(8rem,12vw,10.5rem)] sm:px-8">
        <div className="mx-auto max-w-[1180px]">
          <h1 className="max-w-4xl font-['Momo_Trust_Display'] text-[clamp(2rem,5vw,4rem)] font-normal leading-[1.08] text-plum-700">
            Creative Work, Handled by <span className="text-gold-600">a System of Geniuses</span>
          </h1>
        </div>
      </header>

      {/* --------------------------------------------------- who we are -- */}
      <section className="bg-white px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto grid max-w-[1180px] items-center gap-10 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:gap-16">
          <div>
            <h2 className="font-['Momo_Trust_Display'] text-[clamp(1.7rem,3.4vw,2.7rem)] font-normal leading-[1.1] text-plum-700">
              Who We Are
            </h2>
            <p className="mt-5 font-ui text-lg leading-relaxed text-plum-800">
              Planet Owl is a creative studio. We build identities, websites, apps, AI solutions and
              immersive experiences for brands that rise above the ordinary.
            </p>
            <p className="mt-4 font-ui text-lg leading-relaxed text-plum-800">
              We call the team the flock and the studio the nest. Design, development, digital and
              AI sit under one roof, so an idea does not have to be handed from one agency to the
              next to become real — it is shaped, built and refined in one place before it reaches
              you.
            </p>
          </div>
          <img
            src={A.flock.wide}
            alt="The Planet Owl flock at work"
            loading="lazy"
            className="w-full rounded-[1.75rem] object-cover shadow-[0_30px_60px_-30px_rgba(54,14,57,0.5)]"
          />
        </div>
      </section>

      {/* --------------------------------------------------- what we do -- */}
      <section className="bg-plum-800 px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="font-['Momo_Trust_Display'] text-[clamp(1.7rem,3.4vw,2.7rem)] font-normal leading-[1.1] text-gold-500">
            Four Crafts, One Nest
          </h2>
          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {CRAFTS.map((c) => (
              <li key={c.title} className="flex flex-col rounded-[1.5rem] bg-white p-6">
                <img src={c.owl} alt="" aria-hidden loading="lazy" className="h-36 w-auto self-start object-contain" />
                <h3 className="mt-5 font-ui text-xl font-bold text-plum-900">{c.title}</h3>
                <p className="mt-2 font-ui leading-relaxed text-plum-800">{c.copy}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* -------------------------------------------------- how we work -- */}
      <section className="bg-white px-5 py-14 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-[1180px]">
          <h2 className="font-['Momo_Trust_Display'] text-[clamp(1.7rem,3.4vw,2.7rem)] font-normal leading-[1.1] text-plum-700">
            What We Are Here to Do
          </h2>
          <ul className="mt-10 grid gap-8 lg:grid-cols-3">
            {PROMISES.map((p, i) => (
              <li key={p.title} className="border-t-4 border-gold-500 pt-6">
                <p className="font-ui text-sm font-bold text-teal-600">0{i + 1}</p>
                <h3 className="mt-2 font-ui text-xl font-bold leading-snug text-plum-900">{p.title}</h3>
                <p className="mt-3 font-ui leading-relaxed text-plum-800">{p.copy}</p>
              </li>
            ))}
          </ul>

          <p className="mt-14 font-['Momo_Trust_Display'] text-[clamp(1.5rem,3vw,2.3rem)] leading-tight text-plum-700">
            <span className="text-teal-600">No</span> guesswork. <span className="text-teal-600">No</span>{' '}
            revisions. <span className="text-teal-600">No</span> changes.
          </p>
        </div>
      </section>

      {/* ------------------------------------------------------ the ask -- */}
      <section className="bg-white px-5 pb-10 sm:px-8">
        <div className="mx-auto max-w-[1180px] rounded-[1.75rem] bg-[#e7b248] p-8 sm:p-12">
          <p className="font-['Momo_Trust_Display'] text-[clamp(1.6rem,3.2vw,2.5rem)] leading-tight text-plum-900">
            But enough about us. Let’s talk about your idea.
          </p>
          <p className="mt-3 max-w-xl font-ui leading-relaxed text-plum-900/85">
            Bring us the ambitious one — the complex one that still feels just out of reach.
          </p>
          <a
            href="#/contact"
            className="btn-type mt-7 inline-flex h-12 items-center rounded-full bg-plum-800 px-6 font-ui font-semibold text-white no-underline shadow-[0_6px_0_-2px_var(--color-plum-950)] transition-colors hover:bg-plum-700"
          >
            Contact Us
          </a>
        </div>
      </section>
    </BlogLayout>
  )
}
