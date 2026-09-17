import { useEffect, useState } from 'react'
import Nav from './components/Nav'
import Footer from './components/Footer'

import Intro from './sections/00-intro/Intro'
import Hero from './sections/01-hero/Hero'
import Portfolio from './sections/02-portfolio/Portfolio'
import WhatWeDo from './sections/03-what-we-do/WhatWeDo'
import TheFlock from './sections/04-the-flock/TheFlock'
import NestTeaser from './sections/05-nest-teaser/NestTeaser'
import NestView from './sections/06-nest-view/NestView'
import TopSecrets from './sections/07-top-secrets/TopSecrets'
import FinalCTA from './sections/09-final-cta/FinalCTA'

/**
 * Put the viewport on section 1 — the hero, and the only place the landing
 * screen is ever allowed to hand over to.
 *
 * Measured off the element rather than assumed to be 0. The landing screen is
 * `position: fixed`, so the hero does currently sit at the top of the document
 * and this resolves to 0; reading it keeps that an observation rather than an
 * assumption, so the hand-off survives the intro going back into the flow.
 *
 * Instant, never smooth: `html` carries `scroll-behavior: smooth`, and letting
 * this animate would show the page sliding to the hero AFTER the fade has
 * already handed over to it.
 */
const landOnHero = () => {
  const hero = document.getElementById('home')
  const top = hero ? hero.getBoundingClientRect().top + window.scrollY : 0
  window.scrollTo({ top, left: 0, behavior: 'instant' })
}

/**
 * One continuous vertical scroll, told in seven sections behind a landing
 * screen. Each section owns a folder under `src/sections/`; anything shared by
 * more than one of them lives in `src/components/`.
 *
 * The order follows the site flow: the work first, then the crafts behind it,
 * then the flock, then the door into the nest — teaser, then the view out
 * through it. Top Secrets is not part of that flow: it only mounts once
 * `NestView`'s owl has been clicked, so the ask (`FinalCTA`) sits directly
 * after the nest view until then. The background walks from bright morning
 * sky at the top to night at the bottom, so the whole page reads as a single
 * flight rather than a stack of slides.
 */
export default function App() {
  // The intro gates the page: nothing below it is reachable until the button
  // has been held. The lock is a class on <html> rather than inline styles so
  // it cannot be half-applied, and it is released the moment `entered` flips.
  const [entered, setEntered] = useState(false)
  // Removed once the flight has landed, so the finished page is sections 1-9
  // and nothing else — you cannot scroll back up into the landing screen.
  const [introGone, setIntroGone] = useState(false)
  // Top Secrets is a secret: it is not in the page at all until `NestView`'s
  // owl is clicked, so it cannot be found by scrolling past it. Once true it
  // stays true — a secret you have unlocked does not lock itself again just
  // because you scrolled away from it.
  const [secretsRevealed, setSecretsRevealed] = useState(false)

  /**
   * Top Secrets mounts in place, directly after the nest view, and the visitor
   * simply carries on scrolling into it.
   *
   * There used to be a jump-scroll here: the reveal fired from a click, behind
   * an opaque veil, and the page was moved to the new section while nothing
   * was visible. The reveal is scroll-driven now — it fires part way down the
   * nest view, while the visitor is mid-gesture — and moving the page under
   * someone who is actively scrolling is the one thing that cannot be done
   * quietly. The section appearing below the fold needs no scroll of its own.
   */

  /**
   * Unmount the intro, landing on section 1.
   *
   * There is no height to compensate for: the landing screen is `fixed`, so it
   * holds no space in the flow and removing it moves nothing. (It used to sit
   * in the flow, and this subtracted its height from the scroll position to
   * cancel the jump — against a fixed element that arithmetic drags the page a
   * full viewport in the wrong direction.)
   *
   * What DOES need asserting is where the page is left. `onEnter` releases the
   * gate at the moment of launch, roughly 1.2s before this runs, so a stray
   * wheel event any time during the fade would otherwise decide the landing
   * point — and the fade reveals whatever the page happens to be scrolled to.
   * Section 1 is the only correct answer, so it is stated at both ends of the
   * fade rather than left to chance in the middle.
   */
  const dropIntro = () => {
    // Idempotent: the intro calls this from the fade's `onComplete` AND from a
    // fallback timer, and whichever loses the race must be a no-op.
    if (!document.getElementById('top')) return
    setIntroGone(true)
    requestAnimationFrame(landOnHero)
  }

  /**
   * The launch: reveal the site and pin it to section 1 before the veil starts
   * lifting, rather than correcting the position after it has already gone.
   */
  const enter = () => {
    setEntered(true)
    landOnHero()
  }

  useEffect(() => {
    const root = document.documentElement
    if (entered) {
      root.classList.remove('is-gated')
      return undefined
    }
    root.classList.add('is-gated')
    // a refresh part-way down the page would otherwise strand the visitor
    // below a screen they can no longer scroll away from
    window.scrollTo(0, 0)
    return () => root.classList.remove('is-gated')
  }, [entered])

  return (
    <>
      <a
        href={entered ? '#portfolio' : '#top'}
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-plum-700 focus:px-5 focus:py-3 focus:font-display focus:text-white"
      >
        {entered ? 'Skip to content' : 'Skip to the entry button'}
      </a>

      <Nav entered={entered} />

      <main>
        {!introGone && <Intro onEnter={enter} onDone={dropIntro} />}
        <Hero />
        <Portfolio />
        <WhatWeDo />
        <TheFlock />
        <NestTeaser />
        <NestView onReveal={() => setSecretsRevealed(true)} />
        {/* Pulled up a full viewport so its first screen sits BEHIND the nest
            view's pinned frame rather than after it.

            That overlap is what lets the dive dissolve into this section
            instead of cutting to it: the frame is transparent, the shot fades
            its own opacity to nothing, and the heading underneath is revealed
            in place at full size. Faded to black and then scrolled to — which
            is what every previous version did — the visitor spends the last
            of the scroll looking at an empty dark screen waiting for
            something to arrive.

            `z-[1]`, not `-z-10`. A negative layer puts the section behind
            everything, its own ancestors included — and the section BELOW
            this one (`FinalCTA`) pulls itself up 22svh over its bottom edge,
            which is exactly where the brands plate and its hotspots sit. At
            `-z-10` that overlap swallowed every click meant for the nest. One
            above the final CTA (which sits at `z-0`) and well below the nest
            view's own `z-10` keeps all three in the right order. */}
        {secretsRevealed && (
          <div className="relative z-[1] -mt-[100svh]">
            <TopSecrets />
          </div>
        )}
        <FinalCTA />
      </main>

      <Footer />
    </>
  )
}
