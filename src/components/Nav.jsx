import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { A, NAV_LINKS } from '../lib/assets'
import { GoldButton } from './ui/Button'

/**
 * Proportions follow the `Frame 21` export: a white pill roughly 85px tall on a
 * 1232px width, logo at ~47% of that height, gold CTA at ~69%, and the links
 * pushed toward the CTA rather than centred.
 */
export default function Nav({ entered = true }) {
  const [open, setOpen] = useState(false)

  // While the intro still gates the page there is nothing below to jump to, so
  // the links go inert rather than becoming a way around the button.
  const gate = entered ? '' : 'pointer-events-none'

  /**
   * On the landing screen the bar is the logo and NOTHING else, at every width
   * — no link row, no gold CTA, and no menu button either.
   *
   * The screen has exactly one instruction on it ("Hold the button"), and
   * everything else the bar could offer is inert until that is done: the links
   * have nowhere to go yet (see `gate` above), so a control that opens onto
   * them is a control that does nothing. The bar earns its full self the
   * moment the page does.
   *
   * Keyed on `entered`, the same flag the gating uses, so the two can never
   * disagree about which state they are in — nothing here watches scroll.
   */
  const collapsed = !entered

  // Shut the panel on the way through. Opening the menu on the landing screen
  // and then holding the button would otherwise leave it hanging open over the
  // hero — where, past `lg`, it is not even the right control any more.
  useEffect(() => {
    if (entered) setOpen(false)
  }, [entered])

  return (
    <motion.header
      initial={{ y: -110, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
      // Figma puts the bar at X 81, Y 56, W 1758 of a 1920 frame — 81 either
      // side, so 4.22vw of inset and 91.6vw wide.
      className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-[17.8vw] sm:pt-[2.92vw]"
    >
      <nav
        // `pr-3` and the taller padding are what stop the gold CTA colliding
        // with the pill: the button carries a 10px hard drop shadow, and at the
        // old `pr-2`/`py-2` that shadow punched straight through the white.
        //
        // One fixed size at every scroll position — this used to shrink
        // (padding, shadow, logo height) past 40px of scroll via a `stuck`
        // state, which read as the bar visibly resizing itself as you moved
        // through the page rather than just staying put.
        //
        // The `min-h` pair holds that same size across the LANDING screen too.
        //
        // Sized off the reference, and in the reference's own terms: the pill
        // there runs 18% to 82.4% across the frame - 64.4% of the window,
        // centred - and stands 4.40% of the window's WIDTH tall. Both are
        // shares of the width, so both are `vw` here: `sm:px-[17.8vw]` on the
        // wrapper is what leaves 64.4vw for the pill ((100 - 64.4) / 2), and
        // `4.4vw` is the height that goes with it.
        //
        // It was `sm:px-[4.22vw]` around a `min-h-[80px]` pill: 91.5% of the
        // window and 5.56% of its width at 1440 - wider and chunkier than the
        // design draws it, and the 80px could only be right at one width.
        //
        // `max()` so the 3.25rem is a floor for small screens and never a
        // ceiling that freezes it.
        //
        // The bar's CONTENTS are in `vw` too, and they have to be: the pill
        // went from 91.5% of the window to 64.4%, which at 1340 leaves 863px
        // for a 167px logo, five links and the CTA. At their old fixed sizes
        // (`text-[1.02rem]`, `gap-8`, `h-[52px]`) they did not fit, and "Start
        // a Project" wrapped onto two lines - which then set the bar's height
        // and undid the 4.4% figure as well. As shares of the window they
        // shrink with the pill instead of fighting it, and `whitespace-nowrap`
        // on the CTA makes a wrap impossible rather than merely unlikely.
        //
        // `sm:py-[0.4vw]` matters as much as the `min-h`. A `min-height` only
        // binds when the CONTENT is shorter, and `py-3.5` is 14px of fixed
        // padding around a 52px button - 80px of content, which overrode the
        // 63px the reference asks for at 1440 and left the bar reading 5.56%
        // of the window instead of 4.40%. In `vw` the padding shrinks with
        // the window, so the content stops fighting the figure: 63px at 1440,
        // and past about 1700 the `min-h` takes over and holds 4.4% on its
        // own.
        // This pill has no height of its own — it is `items-center` with 14px
        // of padding either side of whatever the tallest child is — so on the
        // landing screen, where the only child is a 36px logo, it stood 64px
        // tall, and gaining the 52px CTA on entry grew it to 80. The bar
        // visibly changed height on the hand-off. The two figures are the
        // ENTERED bar's own height at each breakpoint: below `sm` the tallest
        // child is the 44px menu button (44 + 28 = 72), from `sm` up it is the
        // 52px CTA (52 + 28 = 80).
        className="mx-auto flex min-h-[72px] max-w-[1758px] items-center rounded-full bg-white py-3.5 pl-4 pr-3 shadow-[0_12px_34px_-24px_rgba(54,14,57,0.45)] sm:min-h-[max(3.25rem,4.4vw)] sm:py-[0.4vw] sm:pl-7 sm:pr-4"
      >
        {/* On the landing screen the bar shows the MARK alone; the full
            lockup arrives with everything else on entry.
            `A.logo` is the owl and the wordmark as one 278x60 plate, and on
            the landing screen - where it is the only thing in the bar, with
            no links and no CTA beside it - that reads as a bar with a name
            badge sitting in a lot of empty white. `A.mark` is the owl on its
            own (58x70, the navbar crop), which is what the reference shows
            there.
            It is sized by HEIGHT so the swap does not change the bar's own
            height: the mark is taller than it is wide where the lockup is
            much wider than tall, so matching heights keeps the pill exactly
            as it was and only the width of this one child changes. */}
        <a href="#home" className="flex shrink-0 items-center" aria-label="Planet Owl — home">
          <img
            src={entered ? A.logo : A.mark}
            alt="Planet Owl"
            className="h-8 w-auto sm:h-[max(1.5rem,2vw)]"
          />
        </a>

        <ul
          className={`ml-auto hidden items-center gap-[max(1rem,2vw)] ${collapsed ? '' : 'lg:flex'} ${gate}`}
        >
          {NAV_LINKS.map((l) => (
            <li key={l.href}>
              {/* No gold underline any more. The hover tell is the same one
                  every button on the site uses — `btn-type`, which snaps the
                  face to Luckiest Guy while the pointer is on it.

                  The catch with that swap is width: Luckiest Guy is markedly
                  wider than Momo at the same size, and in a ROW of links a
                  label that grows shoves its neighbours sideways. So the box
                  is sized by an invisible copy of the label already set in
                  the wider face, and the real one is laid over it. The link
                  is therefore always as wide as its widest state, and
                  hovering changes the lettering without moving anything. */}
              <a
                href={l.href}
                tabIndex={entered ? undefined : -1}
                data-label={l.label}
                // The width reservation is a `::before` carrying the label via
                // `attr()`, not a second copy of the text in the markup. A
                // duplicated node is duplicated everywhere that reads the DOM
                // rather than the screen — it showed up as "PortfolioPortfolio"
                // — and `aria-hidden` only covers the accessibility tree, not
                // selection, translation or anything else walking the text.
                //
                // `active:!shadow-none` is what removes the bar under the
                // label. It was never a text-decoration - `no-underline` was
                // already here and doing its job. It is `.btn-type:active`'s
                // LEDGE: a hard `box-shadow` offset straight down, which under
                // a gold pill reads as the button travelling and under a bare
                // nav link, with no background and no rounding, renders as a
                // dark bar the width of the text. The links want the face
                // swap `btn-type` carries and nothing else it does, so the
                // ledge is switched off here rather than the class dropped.
                // `!` because `.btn-type:active` and the utility have equal
                // specificity, and source order between layers is not
                // something to rely on.
                //
                // `no-underline` because the visible label now sits in a child
                // rather than directly in the anchor: the browser's default
                // link underline was drawing on the anchor's own line box, so a
                // rule that had never been needed suddenly was.
                className="btn-type active:!shadow-none relative block text-[max(0.8rem,1.05vw)] font-bold text-plum-700 no-underline transition-colors before:invisible before:block before:font-[family-name:var(--font-pop)] before:font-normal before:content-[attr(data-label)] hover:text-plum-900"
              >
                <span className="absolute inset-0 flex items-center justify-center whitespace-nowrap">
                  {l.label}
                </span>
              </a>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2 lg:ml-9">
          {/* `translate-y-[-3px]`: the box itself sat dead centre (14px
              above, 14px below) with no offset, but the hard shadow paints
              only BELOW the box — so the shadow needs some of that bottom
              14px to land in before it reads as balanced against the
              untouched 14px up top. Moving the box itself up gives the
              shadow that room, rather than moving the box down into it
              (tried first, and wrong — that shrinks the shadow's own room
              instead of growing it).
              `translate`, not `margin-top`: a margin here would grow the
              row's own height to fit the taller margin box (this pill is
              `items-center` with no fixed height) rather than just
              repositioning the button within it — the same mistake the
              down-nudge made the first time. */}
          <div className={`hidden -translate-y-[3px] ${collapsed ? '' : 'sm:block'} ${gate}`}>
            {/* A shallower hard shadow than the page's buttons — the full 10px
                one needs more room below than a nav pill has to give. */}
            <GoldButton
              href="#start"
              withOwl
              className="h-[max(2.5rem,3.3vw)] whitespace-nowrap text-[max(0.8rem,1.05vw)] !shadow-[0_6px_0_-2px_var(--color-plum-900),0_16px_28px_-16px_rgba(20,12,10,0.55)]"
            >
              Start a Project
            </GoldButton>
          </div>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className={`grid size-11 place-items-center rounded-full bg-plum-700 text-white ${
              collapsed ? 'hidden' : 'lg:hidden'
            }`}
          >
            <span className="relative block h-3.5 w-5">
              <motion.span
                animate={open ? { rotate: 45, y: 6 } : { rotate: 0, y: 0 }}
                className="absolute inset-x-0 top-0 h-0.5 rounded bg-current"
              />
              <motion.span
                animate={open ? { opacity: 0 } : { opacity: 1 }}
                className="absolute inset-x-0 top-1.5 h-0.5 rounded bg-current"
              />
              <motion.span
                animate={open ? { rotate: -45, y: -6 } : { rotate: 0, y: 0 }}
                className="absolute inset-x-0 top-3 h-0.5 rounded bg-current"
              />
            </span>
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && !collapsed && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="mx-auto mt-2 max-w-6xl overflow-hidden rounded-3xl bg-white/97 p-4 shadow-[0_24px_50px_-26px_rgba(54,14,57,0.7)] backdrop-blur-md lg:hidden"
          >
            {/* Gated on the same terms as the desktop row. This panel used to
                be unreachable while the intro was up — the landing screen
                covered the whole bar — so the omission never showed. Now that
                the bar rides on top of the intro, this is the one way round
                the button on a phone. */}
            <ul className={`flex flex-col ${gate}`}>
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <a
                    href={l.href}
                    onClick={() => setOpen(false)}
                    tabIndex={entered ? undefined : -1}
                    className="block rounded-2xl px-4 py-3 font-ui text-lg font-bold text-plum-700 transition-colors hover:bg-plum-100"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className={`mt-2 sm:hidden ${gate}`}>
              <GoldButton href="#start" withOwl className="w-full justify-center">
                Start a Project
              </GoldButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
