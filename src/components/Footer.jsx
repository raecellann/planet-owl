import { A, FOOTER_LINKS } from '../lib/assets'
import Reveal from './ui/Reveal'
import SignupForm from './SignupForm'

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
            <SignupForm source="footer" className="mt-12 sm:mt-16" />
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
              {/* Facebook, as an icon at the end of the same row, in the
                  links' own plum so it reads as part of the set. */}
              <a
                href="https://www.facebook.com/profile.php?id=61592183553087"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Planet Owl on Facebook"
                className="text-plum-800 transition-colors hover:text-plum-950"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden className="size-5 sm:size-6">
                  <path d="M24 12.073C24 5.405 18.627 0 12 0S0 5.405 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.413c0-3.025 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.513c-1.491 0-1.956.93-1.956 1.886v2.265h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" />
                </svg>
              </a>
            </nav>
          </Reveal>
        </div>
      </div>
    </footer>
  )
}
