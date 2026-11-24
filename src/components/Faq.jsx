import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { useReducedMotion } from '../lib/motionPref'
import { A } from '../lib/assets'

/**
 * The FAQ: an owl and a title on the left, an accordion on the right — the
 * arrangement of the reference the client sent ("Before you come"), in this
 * site's own type and colours.
 *
 * The ANSWERS only say what the site itself already says. There was no FAQ
 * copy to work from, so each one is put together from what is on the page —
 * the crafts in What We Do, the Start a Project popup, the contact page, the
 * portfolio. Nothing here states a price, a turnaround or a guarantee, because
 * none has been given; add those answers when the studio has decided them.
 *
 * One panel open at a time. Each question is a real button with
 * `aria-expanded`, and its panel is a region labelled by it.
 */
export const FAQS = [
  {
    q: 'What does Planet Owl do?',
    a: 'We are a creative studio. We build identities, websites, apps, AI solutions and immersive experiences for brands that want to stand apart.',
  },
  {
    q: 'What kind of work can I ask for?',
    a: 'Four crafts under one roof. Design: logos and brand identity, packaging, video editing, 3D motion, websites and UI/UX. Develop: web and mobile apps, custom software, e-commerce, databases, cloud, CMS and APIs. Digital: content, social media ads, social listening, digital films and SEO. AI Tech: assistants, chatbots, automation, generative AI, analytics and integration.',
  },
  {
    q: 'How do I start a project?',
    a: 'Press “Start a Project” anywhere on the site and leave your email, or go to the contact page to send us the details and pick a time for a call. We reply by email.',
  },
  {
    q: 'Can I see your work first?',
    a: 'Yes. The Portfolio section on the home page has albums of our client work, grouped by project.',
  },
  {
    q: 'What is the free 2-week trial?',
    a: 'It is how new clients try the nest before committing. Leave your email in any “Get Free 2-Week Trial” form and we will get in touch with the details.',
  },
  {
    q: 'How do I reach the team?',
    a: 'Email hello@planetowl.studio, or use the contact page to send a message or book a call.',
  },
]

const TONES = {
  dark: {
    title: 'text-gold-500',
    lead: 'text-gold-500',
    // ONE gold for all the type — `gold-500`, the colour of the numbered
    // copy in Top Secrets just above ("01 Make Your Brand...") — by request,
    // so the FAQ reads as the same voice as the section it follows. It had
    // been white, then three different golds. The plus and cross stay teal.
    rule: 'border-gold-500/30',
    q: 'text-gold-500',
    a: 'text-gold-500',
    mark: 'text-teal-400',
  },
  light: {
    title: 'text-plum-700',
    lead: 'text-plum-700',
    rule: 'border-plum-900/15',
    q: 'text-plum-700',
    a: 'text-plum-700',
    mark: 'text-teal-600',
  },
}

/* `askHref`: the pages in the blog frame have no Start a Project listener,
   so there "ask the owls" is a link (to the contact page) instead. */
export default function Faq({ tone = 'light', className = '', askHref = null }) {
  const [open, setOpen] = useState(0)
  const reduce = useReducedMotion()
  const t = TONES[tone]

  return (
    <div className={`grid gap-10 text-left lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-20 ${className}`}>
      <div>
        <h2 className={`font-['Momo_Trust_Display'] text-[clamp(2.4rem,5vw,4.25rem)] font-normal leading-[1.05] ${t.title}`}>
          Before You
          <br /> Fly In
        </h2>
        <p className={`mt-5 max-w-md font-ui text-lg leading-relaxed ${t.lead}`}>
          Still curious?{' '}
          <a href={askHref ?? '/contact'} className="font-bold text-inherit no-underline">
            Ask the owls.
          </a>
        </p>
        <img
          src={A.owl.wizard}
          alt="An owl in a wizard's hat"
          loading="lazy"
          // Larger, by request — it was 15rem and read as a spot
          // illustration beside the title rather than as half of the layout.
          className="mt-8 w-[min(92%,27rem)] select-none"
        />
      </div>

      <ul className={`border-t ${t.rule}`}>
        {FAQS.map((f, i) => {
          const isOpen = open === i
          return (
            <li key={f.q} className={`border-b ${t.rule}`}>
              <button
                type="button"
                id={`faq-q-${i}`}
                aria-expanded={isOpen}
                aria-controls={`faq-a-${i}`}
                onClick={() => setOpen(isOpen ? -1 : i)}
                className={`flex w-full items-center justify-between gap-6 py-6 text-left font-ui text-[clamp(1.15rem,1.7vw,1.5rem)] font-bold ${t.q}`}
              >
                {f.q}
                <motion.svg
                  viewBox="0 0 24 24"
                  aria-hidden
                  className={`size-6 shrink-0 ${t.mark}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.4"
                  strokeLinecap="round"
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                >
                  <path d="M12 5v14M5 12h14" />
                </motion.svg>
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    id={`faq-a-${i}`}
                    role="region"
                    aria-labelledby={`faq-q-${i}`}
                    initial={reduce ? false : { height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={reduce ? undefined : { height: 0, opacity: 0 }}
                    transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
                    className="overflow-hidden"
                  >
                    <p className={`max-w-2xl pb-7 font-ui text-lg leading-relaxed ${t.a}`}>{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
