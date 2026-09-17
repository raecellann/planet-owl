import { useState } from 'react'
import { motion } from 'motion/react'
import { A, FOOTER_LINKS } from '../lib/assets'
import Reveal from './ui/Reveal'

/**
 * The gold footer band, per the section 9 exports.
 *
 * Built in three stacked pieces rather than one background:
 *
 *   1. the night sky carries on as this element's own background,
 *   2. `footer-edge.webp` sits in NORMAL FLOW at the top, so the dark shows
 *      through its scallops and it sets its own height from its aspect,
 *   3. the flat `#e7b248` body butts underneath and runs to the page's end.
 *
 * `Vector.png` is feathered on its bottom edge as well as its top, so shipping
 * the whole 1920x863 plate would have left the band unable to run solid to the
 * bottom of the page. Only the top 230px is used — see the asset script.
 */
export default function Footer() {
  return (
    <footer className="relative bg-[#24051f]">
      {/* the feathered edge — in flow, transparent above the scallops */}
      <img src={A.footerEdge} alt="" aria-hidden className="block w-full select-none" />

      {/* -mt-px closes the hairline the edge image's own bottom row leaves */}
      {/* `relative` and a `pt` because the pilot is positioned OUT of this
          band's flow now - see its own note. The padding is what the plane
          used to reserve by being in the flow; without it the heading would
          slide up underneath the plane.

          It tracks the plane's own box: at `-14.2vw` with a 58vw-wide plane
          (33vw tall at 1.757:1) the bottom lands 18.8vw into the band, and
          23.2vw leaves the 4.4vw gap to the heading that the reference shows.
          Change the plane's width and this has to move with it. */}
      <div className="relative -mt-px bg-[#e7b248] px-3 pb-14 pt-[23.2vw] sm:px-[4.22vw] sm:pb-16">
        {/* It no longer matches the navbar, and that is deliberate rather than
            drift.

            This used to be the header's own inset exactly (`max-w-[1758px]`
            with `px-3 sm:px-[4.22vw]`) so the footer's content lined up on
            the same left/right edges as the bar above it. The navbar has
            since been narrowed to the reference's 64.4% of the window, and
            following it down here would leave the footer's heading, its
            signup bar and the lockup all inside a column two thirds of the
            page wide, which is a pill's proportion rather than a footer's.

            So the two are independent now: the bar reads as a floating pill,
            the footer band as full-bleed. Anything here that still says it
            matches the nav is out of date. */}
        <div className="mx-auto max-w-[1758px]">
          {/* ----------------------------------------------- the pilot ----
              Read off the reference rather than the 1920 frame's own layer
              box. That layer measured X 223 W 1572 — 11.6% across at 81.9%
              wide — and drawn at those figures the plane fills the band
              almost edge to edge, closer to a backdrop than to something
              standing on it.

              In the reference it is a smaller object sitting high in the
              band, centred a little right of the middle: propeller tip to
              tail spans 44% of the column at a centre of 56%, which puts its
              left edge at 34%. A 59% version, tried first, filled the band
              wall to wall and pushed the heading under it — the plane is
              something standing ON the band, not the band's contents.

              The negative top margin has to grow as the plane shrinks, which
              is not obvious: it exists to push the plane back UP over the
              scalloped edge so it breaks the band's outline, and that is a
              fixed distance up the page — but the plane's own height fell by a
              quarter when its width did, so the same `-2%` left it sitting
              well clear of the edge with a bank of empty gold above it.
              `-12%` (`-10%` from `sm`) puts it back on the scallops.

              Everything here is a percentage of the column, so the whole
              arrangement holds its proportions at any width; nothing is
              pinned in pixels.

              The negative top margin comes down with the width. It exists to
              break the plane back up over the scalloped edge, and that is a
              fixed visual overlap — but stated as a percentage of the
              CONTAINER it scaled with the column instead of with the plane,
              so at 59% wide the old -9% would have lifted the whole thing
              clear of the band it is meant to be standing on. */}
          {/* ABSOLUTE, not a negative margin - and that is the fix, not a
              refactor.

              A negative top margin cannot lift a child above its parent's own
              top: it drags the parent's top up with it. So `-mt-[17vw]` moved
              the plane and the band's edge together, and the plane's top
              measured exactly ON the band's top at 1361 AND at 1920
              (`aboveBand: 0` both times) no matter what the figure was. It
              could never have straddled the edge that way.

              Out of flow, the band's top stays where it is and the plane
              crosses it.

              58vw wide, up from 40. The reference draws this plane at about
              85% of the frame and it was reading as a small object dropped
              into a lot of gold; 58 is most of the way there without letting
              it run the full width. `left-[21vw]` re-centres it - (100 - 58)
              / 2 - since widening from a fixed left edge would have pushed it
              off to the right instead of growing it in place.

              `-top-[14.2vw]` is UNCHANGED by that, and deliberately: the
              straddle is measured against the scalloped strip, not against
              the plane's own height, so the overlap holds whatever size the
              plane is. Only the band's `pt` has to follow it.

              And the figure has to clear the SCALLOPED EDGE, not
              just the band. That torn strip is its own image sitting above
              the yellow - measured, 11.98vw tall at both 1300 and 1920 - so
              a `-5.7vw` that cleared the band still landed the plane's nose
              81px down inside the scallops, which is why it read as sitting
              below them rather than crossing. 14.2 puts its top 2.2vw clear
              of the strip entirely, into the dark section above, which is
              where the reference has it.

              The wrapper takes the position and `Reveal` sits INSIDE it,
              because `Reveal` animates `y`, and a transform would make it the
              containing block for anything absolute within it. */}
          <div className="pointer-events-none absolute -top-[14.2vw] left-[21vw] w-[58vw]">
            <Reveal y={40}>
              {/* `width`/`height` are the file's own 1564x890. Without them
                  this image measured 0 tall until it loaded, so the footer
                  collapsed and then jumped ~890px - the largest layout shift
                  on the page, landing on the last thing a visitor scrolls
                  to. */}
              <img
                src={A.owl.ground}
                alt="A pilot owl standing beside a green propeller plane"
                loading="lazy"
                width={1564}
                height={890}
                className="block h-auto w-full max-w-none select-none"
              />
            </Reveal>
          </div>

          <Reveal y={32} delay={0.06}>
            {/* Indented to the placeholder's own left edge, not the pill's.
                The heading used to start at the container edge while "Enter
                your email here!" started well inside it, so the two read as
                misaligned even though their boxes lined up. The inset is the
                sum of what holds that text off the edge: the pill's border,
                its padding, and the input's own — 3px + `p-2` + `px-5`, and
                3px + `p-2.5` + `px-7` from `sm` up. Stated as a `calc` of
                those same figures so it tracks them if the pill changes —
                restated again here to match the pill's current (nav-sized)
                padding rather than the taller pair it shipped with. */}
            <h2 className="mt-2 pl-[calc(3px_+_0.5rem_+_1.25rem)] font-ui text-[clamp(1.75rem,5.5vw,5rem)] font-bold leading-[1.12] text-plum-900 sm:pl-[calc(3px_+_0.625rem_+_1.75rem)]">
              Let’s Make Something
              <br /> Brilliantly Strange!
            </h2>
          </Reveal>

          <Reveal y={28} delay={0.12}>
            <Signup />
          </Reveal>

          {/* ---------------------------------------------- the lockup ----
              One flat image now — owl, ring and wordmark as composed in
              `Frame 2087325539.png` — replacing what used to be live type
              (`Planet`/`Owl` set in the display face) plus a separate owl
              crop. The composed export carries its own colour and the teal
              ring, which live type couldn't reproduce.

              Centred — equal padding both sides, half the pill/heading's own
              left inset — rather than lined up on the pill's left edge like
              the heading above it. It used to match that left edge, but the
              lockup's own export is nearly as wide as the whole content
              column (1640x312, against the column's 1640 max-width), so a
              left-anchored `w-full` read as hugging the left side with a
              lopsided gap on the right, out of step with the footer nav row
              below it, which centres independently of the heading's column. */}
          <Reveal y={30} delay={0.18}>
            <div className="px-[calc((3px_+_0.5rem_+_1.25rem)/2)] sm:px-[calc((3px_+_0.625rem_+_1.75rem)/2)]">
              {/* 79% of this column, not `w-full`.

                  Measured against the reference, the lockup stands about 72%
                  of the WINDOW's width there; at `w-full` it was drawing 88%.
                  This box is already inset from the window by the band's own
                  padding, so 79% of it lands on roughly 72% of the window -
                  and being a share of the column rather than a pixel width, it
                  holds there at every size.

                  `mx-auto` because the shrink has to come off BOTH sides: the
                  export is centred in its own column (see the note above), so
                  narrowing a left-anchored block would have pulled the lockup
                  off-centre instead of scaling it in place. */}
              <a href="#home" className="mx-auto mt-10 block w-[79%] sm:mt-14">
                <img
                  src={A.footerLockup}
                  alt="Planet Owl"
                  loading="lazy"
                  className="w-full select-none"
                />
              </a>
            </div>
          </Reveal>

          {/* `Reveal`'s default viewport insets the trigger 12% up from the
              bottom, which nothing in the page's last 12% can ever satisfy —
              scrolled fully down these links sit at 858 of a 900 viewport, past
              the 792 line, and stayed at opacity 0 forever. The last row on the
              page needs a margin with no bottom inset. */}
          <Reveal y={22} delay={0.24} viewport={{ once: true, margin: '0px' }}>
            <nav
              aria-label="Footer"
              className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 sm:mt-10"
            >
              {FOOTER_LINKS.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  className="font-display text-sm font-semibold text-plum-800 transition-colors hover:text-plum-950 sm:text-base"
                >
                  {l.label}
                </a>
              ))}
            </nav>
          </Reveal>
        </div>
      </div>
    </footer>
  )
}

/**
 * The sign-up pill. Front-end only — there is no endpoint behind it.
 *
 * The button lives INSIDE the input's pill in the design, so the outer element
 * is the bordered pill and the field inside it is borderless.
 */
function Signup() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  return (
    <div className="mt-12 sm:mt-16">
      <form
        onSubmit={(e) => {
          e.preventDefault()
          setSent(true)
        }}
        // Sized to match the navbar's own pill (`Nav.jsx`'s `py-3.5` bar) rather
        // than the taller ~12%-of-column figure the Figma layer gave — the two
        // pills sit far enough apart on the page that "12% tall to the design"
        // read as inconsistent against the one at the top of the same site.
        //
        // Sized by its ASPECT against the reference, in `vw`, so the shape
        // holds at every width instead of only at the one it was checked at.
        //
        // The reference draws this pill at 12.5:1. The bar's width is set by
        // the band's own `4.22vw` inset, so it is always about 91.6% of the
        // window - which makes the height that holds 12.5:1 a fixed 7.3vw,
        // whatever the window is. A pixel height could only be right at one
        // size: 88px was 14.1:1 at 1266 and would have been 20:1 at 1920.
        //
        // `max()` not `min()`, so the 4.5rem is a FLOOR for phones (7.3vw of
        // 390px is 28px, too short to set a label in) and can never cap the
        // bar the way a ceiling would.
        //
        // For scale: this started at 216/240px, which was 5:1 - a pill mostly
        // full of empty white. It was floored at the navbar's own 72/80 after being cut
        // down from 216/240, and at 80px against a 1240px-wide bar that is
        // 17.5:1 - the reference draws it at 14.5:1, which is why it read as
        // too thin. 88px puts it at 14.1:1. (The original 240px was 5:1, a
        // pill mostly full of empty white.)
        //
        // It was floored at 216 and 240 - three times the navbar - and that is
        // what made the footer read as oversized: a 240px-tall pill holding one
        // line of text and a 52px button is mostly empty white, and it pushed
        // everything below it down by the surplus. In the reference this is a
        // single-line input bar, about the same height as the bar at the top of
        // the page. It stays a `min-h` rather than a fixed height so it can
        // still grow if its contents ever need more (it wraps to two rows below
        // `sm`), and `justify-center` keeps the input and the button on the
        // middle line.
        //
        // The two children still measure 52px each — the input from `sm:py-3`
        // around a `text-xl` line box (24 + 28), the button from its own
        // padding and badge — so neither can quietly set the height between
        // them. Width needs no work: this sits inside the footer band, which
        // already carries the header's own `max-w-[1758px]` and `4.22vw`
        // inset.
        className="flex min-h-[76px] flex-col justify-center gap-4 rounded-[2.5rem] border-[3px] border-plum-900 bg-white p-2 shadow-[0_7px_0_0_var(--color-plum-900)] sm:min-h-[max(4.5rem,7.3vw)] sm:flex-row sm:items-center sm:rounded-full sm:p-[max(0.5rem,0.85vw)]"
      >
        <label className="sr-only" htmlFor="signup-email">
          Email address
        </label>
        <input
          id="signup-email"
          type="email"
          required
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            setSent(false)
          }}
          placeholder="Enter your email here!"
          className="min-w-0 flex-1 bg-transparent px-5 py-2.5 font-display text-base font-semibold text-plum-900 placeholder:text-plum-900/70 focus:outline-none sm:px-7 sm:py-3 sm:text-xl"
        />
        <motion.button
          type="submit"
          whileHover={{ y: -3 }}
          whileTap={{ y: 2 }}
          transition={{ type: 'spring', stiffness: 420, damping: 24 }}
          // `sm:py-2` and a `size-9` badge at every width, not `py-2.5` and
          // `size-10`. This button is the tallest thing in the pill, so it is
          // what sets the pill's height, and at 60px (20 of padding around a
          // 40px badge) it pushed the bar to 86 against the navbar's 80 —
          // enough to read as a different, chunkier component at the other
          // end of the same page. 16 + 36 = 52 matches `GoldButton`'s own
          // `h-[52px]`, which is what the nav's CTA stands at, and brings the
          // pill to 78: 3px of border either side, 10 of padding, 52 of
          // button.
          // Sized OFF THE PILL, not off its own contents.
          //
          // It was content-height - `py-2` around a `text-lg` line and a
          // `size-9` badge, about 52px - which was fine while the bar was
          // 80px, and stopped being fine the moment the bar went to 7.3vw:
          // at 1920 that is a 140px pill with a 52px button floating in the
          // middle of it and white space above and below. The reference has
          // the button nearly filling the bar.
          //
          // 5.6vw against the pill's 7.3vw, with the pill's own 0.85vw
          // padding on each side, adds back to exactly 7.3 - so the button
          // fills the bar at every width by construction rather than by a
          // figure that happens to fit at one size. The label, the badge and
          // its arrow all follow in the same unit; left in `rem` they would
          // have stayed small inside a growing button, which is the same bug
          // one level down.
          //
          // Every `max()` here is a FLOOR for phones, never a ceiling.
          className="btn-type group inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-teal-500 py-2 pl-6 pr-1.5 text-base font-semibold text-white shadow-[0_6px_0_-2px_var(--color-plum-900)] transition-colors hover:bg-teal-400 sm:h-[max(3rem,5.6vw)] sm:py-0 sm:pl-[max(1.5rem,2.2vw)] sm:pr-[max(0.375rem,0.5vw)] sm:text-[max(0.95rem,1.3vw)]"
        >
          Get Free 2-Week Trial
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-gold-500 text-plum-900 shadow-[0_3px_0_0_var(--color-plum-900)] transition-transform duration-300 group-hover:translate-x-0.5 sm:size-[max(2.25rem,4.2vw)]">
            <svg viewBox="0 0 24 24" className="size-5 sm:size-[max(1.25rem,2.2vw)]" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 12h15M13 6l6 6-6 6" />
            </svg>
          </span>
        </motion.button>
      </form>

      <p
        role="status"
        aria-live="polite"
        className={`mt-3 px-2 font-display text-sm font-semibold text-plum-900 transition-opacity duration-300 ${
          sent ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {sent ? `Thanks — we will be in touch at ${email}.` : ' '}
      </p>
    </div>
  )
}
