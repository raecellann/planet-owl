import { A } from '../lib/assets'

/**
 * The blog's articles.
 *
 * Each post is plain data — the index, the article page and the cover art are
 * all rendered from this one list, so adding a post is adding an entry here.
 *
 * `cover` describes the composed cover (see `BlogCover.jsx`): a ground, one of
 * the studio's owls, and the floating labels around it. To use a finished
 * image instead — a designed export, a photograph — set `cover.image` to its
 * URL and the composed version steps aside.
 *
 * `sections[].id` is the anchor the article's "Topics" list jumps to.
 * Block types: `p` (paragraph), `list` (bullets), `steps` (numbered, each
 * with a title and a line of copy), `quote` (pull quote).
 */
export const POSTS = [
  {
    slug: 'what-always-on-marketing-asks-of-your-creative-pipeline',
    category: 'Always-On',
    date: '2026-11-16',
    readMinutes: 6,
    title: 'What “Always-On” Marketing Really Asks of Your Creative Pipeline',
    excerpt:
      'Feeds do not pause and campaigns no longer end. That changes what a creative team is for, from producing great moments to supplying a steady, on-brand stream. Here is what that asks of the pipeline behind it.',
    cover: {
      theme: 'gold',
      owl: A.owl.digital,
      card: { kicker: 'Always-On Article', title: 'More Output. Same Team.' },
      chips: [
        { label: 'Incoming Brief', tone: 'teal', x: 6, y: 10 },
        { label: 'Last Batch Revisions', tone: 'plum', x: 60, y: 16 },
        { label: 'Ready to Work', tone: 'white', x: 66, y: 46 },
        { label: 'Always-On Content', tone: 'white', x: 8, y: 80 },
      ],
      calendar: true,
    },
    sections: [
      {
        id: 'the-shift',
        heading: 'Campaigns Used to End. Now Nothing Does.',
        blocks: [
          {
            p: 'For a long time marketing ran in bursts. A launch, a season, a sale, each with a start date, a peak, and a quiet stretch afterwards where the team could breathe, review and plan the next one. Creative work was shaped around those bursts: a big brief, a big push, a big delivery.',
          },
          {
            p: 'Always-on marketing removes the quiet stretch. Social feeds want something new every day. Email sequences keep sending. Paid ads fatigue in weeks, not quarters, and need fresh variations to keep performing. Search content builds slowly and never stops needing to be fed. Every channel you add is another mouth, and none of them close on weekends.',
          },
          {
            p: 'None of this is a trend you can wait out. It is simply what being present looks like now. The uncomfortable part is what it does to the team making the work.',
          },
        ],
      },
      {
        id: 'what-breaks',
        heading: 'What Breaks First',
        blocks: [
          {
            p: 'A pipeline built for campaigns is very good at one thing: producing a small number of excellent pieces under a deadline. Ask it for a constant flow instead and it fails in predictable places.',
          },
          {
            list: [
              'Briefing becomes the bottleneck. A brief that took a week to write made sense for a three-month campaign. It makes no sense for thirty social posts due Friday.',
              'Consistency drifts. When work is rushed out by whoever is free, the tenth piece stops looking like the first. The brand slowly turns into several slightly different brands.',
              'Revisions pile up. Every unclear brief comes back as a round of changes, and the rounds stack on top of new work that is already late.',
              'The best people burn out. The designers who care most absorb the overflow, and they are exactly the ones you can least afford to lose.',
            ],
          },
          {
            quote:
              'Always-on does not need bursts of brilliant work. It needs brilliant work to be ordinary: repeatable, on time, and recognisably yours.',
          },
        ],
      },
      {
        id: 'what-it-needs',
        heading: 'What an Always-On Pipeline Actually Needs',
        blocks: [
          {
            p: 'The fix is rarely “more designers”. Adding hands to a pipeline that leaks just makes a bigger leak. What changes the outcome is structure: a few unglamorous things done every single time.',
          },
          {
            steps: [
              {
                title: 'A brief that fits on one screen',
                copy: 'Goal, audience, channel, format, deadline. If a request cannot be stated that plainly, it is not ready to be made yet.',
              },
              {
                title: 'A brand system, not a brand PDF',
                copy: 'Templates, components and rules that live where the work is made, so being on-brand is the easy path rather than a thing someone has to remember.',
              },
              {
                title: 'Review before delivery, not after',
                copy: 'Every piece is checked against the brief and the brand by someone other than its maker before you ever see it. Most revision rounds are caught right there.',
              },
              {
                title: 'A steady rhythm',
                copy: 'A known weekly capacity and a visible queue. Predictable beats heroic. You can plan a calendar around a rhythm, and you cannot plan around a rescue.',
              },
            ],
          },
        ],
      },
      {
        id: 'how-to-tell',
        heading: 'How to Tell If Yours Is Ready',
        blocks: [
          { p: 'You do not need an audit to know. Three honest questions will do it.' },
          {
            list: [
              'Could you double your output next month without anyone working late?',
              'If a new designer picked up a task tomorrow, would the result look like it came from the same brand?',
              'Do you know, today, what will ship two weeks from now?',
            ],
          },
          {
            p: 'If the answer to any of them is no, the problem is not effort. Your team is almost certainly working hard already. The problem is that the pipeline was designed for a kind of marketing that no longer exists, and that part can be rebuilt.',
          },
        ],
      },
    ],
    faq: [
      {
        q: 'Is always-on marketing only for big brands?',
        a: 'No. A small brand that posts, emails and advertises every week is always-on already. The scale is different; the need for a steady, consistent supply of creative is the same.',
      },
      {
        q: 'Does always-on mean lower quality?',
        a: 'It should not. It means quality has to come from the system: clear briefs, a real brand system and built-in review, rather than from last-minute effort on each individual piece.',
      },
    ],
  },
  {
    slug: 'how-to-scale-design-output-without-burning-out-your-team',
    category: 'Creative Ops',
    date: '2026-11-10',
    readMinutes: 5,
    title: 'How to Scale Design Output Without Burning Out Your Team',
    excerpt:
      'More requests, same people. Most teams answer that with longer hours, which works for about a month. There is a better order to do things in, and it starts with what you stop doing.',
    cover: {
      theme: 'plum',
      owl: A.owl.develop,
      card: { kicker: 'Creative Ops', title: 'Scale the System, Not the Hours.' },
      chips: [
        { label: 'New Brief in the Queue', tone: 'gold', x: 58, y: 12 },
        { label: 'Designer', tone: 'teal', x: 8, y: 22 },
        { label: 'In Review', tone: 'white', x: 70, y: 40 },
        { label: 'Delivered', tone: 'teal', x: 10, y: 78 },
      ],
      queue: ['Social Post #01', 'Social Post #02', 'Email Banner', 'Landing Hero'],
    },
    sections: [
      {
        id: 'the-trap',
        heading: 'The Trap: Solving Volume With Hours',
        blocks: [
          {
            p: 'When the request list outgrows the team, the first instinct is to push harder. Stay a bit later, skip the review, promise it for Monday. It feels responsible, and for a few weeks it even works.',
          },
          {
            p: 'Then the costs arrive together. Work goes out with small mistakes, so it comes back. Coming back means it is now competing with new work. People stop suggesting ideas because there is no room to try them. Somebody good resigns, and their workload lands on whoever is left.',
          },
          {
            p: 'Overtime is a loan against your team, and the interest is steep. Scaling properly means getting more out of the same hours, not adding more hours.',
          },
        ],
      },
      {
        id: 'where-time-goes',
        heading: 'First, Find Where the Time Actually Goes',
        blocks: [
          {
            p: 'Ask a designer how their week went and very little of the answer is “designing”. The hours leak out in other places:',
          },
          {
            list: [
              'Chasing missing information: the size, the copy, the logo file, the deadline.',
              'Rebuilding things that already exist, because nobody could find the last version.',
              'Revision rounds caused by a brief that was never clear in the first place.',
              'Switching between six half-finished tasks instead of finishing two.',
            ],
          },
          {
            quote:
              'Most teams do not have a capacity problem. They have a friction problem that looks like a capacity problem.',
          },
        ],
      },
      {
        id: 'five-moves',
        heading: 'Five Moves That Add Output Without Adding Hours',
        blocks: [
          {
            steps: [
              {
                title: 'Standardise the request',
                copy: 'One intake form, the same fields every time. A request that arrives complete can be started immediately instead of after three messages.',
              },
              {
                title: 'Templatise what repeats',
                copy: 'If you make it more than twice, it deserves a template. Social formats, email headers, ad sizes: design the system once and fill it in afterwards.',
              },
              {
                title: 'Limit work in progress',
                copy: 'Fewer things open at once means each one finishes sooner. A visible queue with a real limit protects focus better than any motivational talk.',
              },
              {
                title: 'Put a second pair of eyes on everything',
                copy: 'A short internal review catches the typo and the off-brand colour before the client does. It costs minutes and saves whole rounds.',
              },
              {
                title: 'Send the overflow somewhere built for it',
                copy: 'Keep your team on the work only they can do (the thinking, the brand, the big ideas) and hand the steady production stream to a partner whose whole system is designed for volume.',
              },
            ],
          },
        ],
      },
      {
        id: 'what-good-looks-like',
        heading: 'What Good Looks Like',
        blocks: [
          {
            p: 'You will know it is working when the week becomes boring in the right way. Requests go in complete. Work comes out on the day it was promised. Revisions are small and rare. Nobody is surprised on Friday afternoon.',
          },
          {
            p: 'And your designers start doing something you may not have seen for a while: proposing things. A team with room to think is the real output of scaling well. The extra assets are just the proof.',
          },
        ],
      },
    ],
    faq: [
      {
        q: 'Should we hire before we fix the process?',
        a: 'Fix the process first. A new hire joining a pipeline full of friction spends their first months absorbing the same friction. The same hire joining a clean system is productive in their first week.',
      },
      {
        q: 'How do we know when to bring in outside help?',
        a: 'When the steady, repeatable work is crowding out the work that needs your own team’s judgement. That is the signal that production and thinking need separate lanes.',
      },
    ],
  },
  {
    slug: 'refined-before-it-reaches-you',
    category: 'Inside the Nest',
    date: '2026-11-03',
    readMinutes: 4,
    title: 'Refined Before It Reaches You: Why Review Belongs Inside the Studio',
    excerpt:
      'The fastest way to cut revision rounds is to have them before the client ever sees the work. A look at how a second, third and fourth pair of eyes changes what lands in your inbox.',
    cover: {
      theme: 'sky',
      owl: A.owl.vr,
      card: { kicker: 'Inside the Nest', title: 'Cleaner Results. Zero Chaos.' },
      chips: [
        { label: 'First Draft', tone: 'white', x: 7, y: 14 },
        { label: 'Brand Check', tone: 'plum', x: 62, y: 14 },
        { label: 'Polish', tone: 'gold', x: 66, y: 50 },
        { label: 'Approved', tone: 'teal', x: 9, y: 78 },
      ],
    },
    sections: [
      {
        id: 'the-usual-way',
        heading: 'The Usual Way: You Are the Quality Check',
        blocks: [
          {
            p: 'In most creative relationships the client is the reviewer. Work arrives, you spot what is off (the wrong logo version, the headline that does not fit, the colour that is nearly but not quite yours), you write it up, and you wait for round two.',
          },
          {
            p: 'It is so common that it feels normal. But think about what it means: you are doing quality control on work you are paying someone else to get right. Every round is your time, your attention, and a day lost on the calendar.',
          },
        ],
      },
      {
        id: 'inside-the-nest',
        heading: 'What Changes When Review Happens First',
        blocks: [
          {
            p: 'At Planet Owl nothing leaves the nest on a single pair of eyes. A piece is made, then checked against the brief by someone who did not make it, then checked against your brand, then polished. Only then does it reach you.',
          },
          {
            list: [
              'Against the brief: does it do the job it was asked to do, in the format and size it was asked for?',
              'Against the brand: type, colour, tone, spacing, the small rules that make it recognisably yours.',
              'Against itself: is it actually good? Would we be proud to sign it?',
            ],
          },
          {
            quote: 'Your feedback should be about direction and taste, never about catching mistakes.',
          },
        ],
      },
      {
        id: 'what-you-get',
        heading: 'What You Get Out of It',
        blocks: [
          {
            steps: [
              {
                title: 'Faster output',
                copy: 'A round caught internally takes minutes. The same round caught by you takes a day, because it has to travel there and back.',
              },
              {
                title: 'Cleaner results',
                copy: 'The work you open has already survived the checks you would have run yourself.',
              },
              {
                title: 'Zero chaos',
                copy: 'No hunting through threads to see which version is current. What you receive is the version.',
              },
            ],
          },
          {
            p: 'It is not a glamorous idea. It is simply the difference between a studio that hands you a draft and a system that hands you finished work.',
          },
        ],
      },
    ],
    faq: [
      {
        q: 'Does internal review slow delivery down?',
        a: 'It shortens it. The review adds a small, fixed amount of time inside the studio and removes whole revision rounds that would otherwise run through your inbox.',
      },
    ],
  },
]

export const CATEGORIES = ['All', ...new Set(POSTS.map((p) => p.category))]

export const findPost = (slug) => POSTS.find((p) => p.slug === slug)

export const formatDate = (iso) =>
  new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

/** The blog lives behind hash routes so it works on any static host. */
export const BLOG_HOME = '#/blog'
export const postHref = (slug) => `#/blog/${slug}`
