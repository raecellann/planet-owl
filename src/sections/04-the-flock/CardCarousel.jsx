import { useCallback, useEffect, useRef, useState } from 'react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'

/** Past this much of a card's width, the release counts as a page turn. */
const THRESHOLD = 0.2
/** Flick velocity that turns the page regardless of distance travelled. */
const FLICK = 380
/** How far the off-centre cards shrink and dim. */
const MIN_SCALE = 0.7
const MIN_BRIGHTNESS = 0.55

/**
 * A grab-and-drag carousel with one featured card in the middle.
 *
 * Two things make it feel physical rather than stepped:
 *
 *  - the track is CENTRED, not left-aligned. `x` for card i is
 *    `(containerWidth - cardWidth) / 2 - i * step`, so the active card lands in
 *    the middle of the window with its neighbours peeking in from both sides.
 *  - every card derives its own scale and opacity from the live `x` value, not
 *    from which index is "current". They therefore grow and shrink CONTINUOUSLY
 *    under the finger, mid-drag, instead of snapping when the index changes.
 *
 * It loops by rendering the card list three times and parking the viewer on the
 * middle copy; dragging past either end walks into an identical neighbour, and
 * once the spring settles the index folds back to the middle set and `x` jumps
 * one set's width with no animation. The jump is invisible because the pixels
 * either side of it are the same cards.
 *
 * Everything is measured off the live DOM, so the same component works at
 * whatever width the breakpoint gives the cards.
 */
export default function CardCarousel({ items, renderItem, className = '', label }) {
  const n = items.length
  const trackRef = useRef(null)
  const windowRef = useRef(null)
  const x = useMotionValue(0)
  const [index, setIndex] = useState(n) // start on the middle copy
  const [metrics, setMetrics] = useState({ step: 0, cardW: 0, offset: 0 })
  const dragging = useRef(false)

  // `offsetWidth`/`offsetLeft`, never `getBoundingClientRect()`. The cards
  // carry a live scale transform, and the rect reports the SCALED box — so
  // measuring off it fed a shrunken neighbour's width back into the centring
  // maths and parked the active card ~75px off centre.
  const measure = useCallback(() => {
    const track = trackRef.current
    const win = windowRef.current
    if (!track || !win || track.children.length < 2) return null
    const a = track.children[0]
    const b = track.children[1]
    return {
      step: b.offsetLeft - a.offsetLeft,
      cardW: a.offsetWidth,
      offset: (win.clientWidth - a.offsetWidth) / 2,
    }
  }, [])

  useEffect(() => {
    const sync = () => {
      const m = measure()
      if (!m || !m.step) return
      setMetrics(m)
      if (!dragging.current) x.set(m.offset - index * m.step)
    }
    sync()
    // the cards are images; their width settles only once those have loaded
    const id = setTimeout(sync, 300)
    window.addEventListener('resize', sync)
    return () => {
      clearTimeout(id)
      window.removeEventListener('resize', sync)
    }
  }, [measure, index, x])

  const settle = useCallback(
    (next) => {
      const m = measure()
      if (!m || !m.step) return
      animate(x, m.offset - next * m.step, {
        type: 'spring',
        stiffness: 240,
        damping: 32,
        mass: 0.9,
      }).then(() => {
        const folded = (((next - n) % n) + n) % n + n
        if (folded !== next) {
          setIndex(folded)
          x.set(m.offset - folded * m.step)
        }
      })
      setIndex(next)
    },
    [measure, x, n],
  )

  const onDragEnd = useCallback(
    (_, info) => {
      dragging.current = false
      const m = measure()
      if (!m || !m.step) return
      const moved = (m.offset - x.get()) / m.step - index
      const flicked = Math.abs(info.velocity.x) > FLICK
      let delta = 0
      if (moved > THRESHOLD || (flicked && info.velocity.x < 0)) delta = 1
      else if (moved < -THRESHOLD || (flicked && info.velocity.x > 0)) delta = -1
      settle(index + delta)
    },
    [measure, x, index, settle],
  )

  const loop = [...items, ...items, ...items]
  const active = (((index - n) % n) + n) % n

  return (
    <div className={`relative ${className}`}>
      {/* The window clips; the track never does, or the neighbours could not
          peek past the edges. */}
      <div ref={windowRef} className="overflow-hidden">
        <motion.ul
          ref={trackRef}
          role="list"
          aria-label={label}
          drag="x"
          dragElastic={0.12}
          dragMomentum={false}
          onDragStart={() => {
            dragging.current = true
          }}
          onDragEnd={onDragEnd}
          style={{ x }}
          className="flex cursor-grab list-none touch-pan-y gap-6 active:cursor-grabbing"
        >
          {loop.map((item, k) => (
            <Card
              key={`${item.id}-${k}`}
              x={x}
              i={k}
              metrics={metrics}
              hidden={Math.floor(k / n) !== 1}
            >
              {renderItem(item, k)}
            </Card>
          ))}
        </motion.ul>
      </div>

      {/* No visible controls — the row is driven by dragging alone.
          `settle()` is still what the drag release calls, so the snapping and
          the wrap-around are unchanged; only the two nubs are gone.

          The buttons were the one keyboard route through this carousel, so
          the offscreen pair below keeps that route open without drawing
          anything: they sit in the tab order, move the row, and are reachable
          by screen readers, but are clipped out of view. Deleting them
          outright would have made the roles past the first unreachable for
          anyone not using a pointer. */}
      <div className="sr-only">
        <button type="button" onClick={() => settle(index - 1)}>
          Previous role
        </button>
        <button type="button" onClick={() => settle(index + 1)}>
          Next role
        </button>
      </div>
    </div>
  )
}

/**
 * One card. Its scale and opacity are a function of how far its own centre sits
 * from the window's centre, read straight off the shared `x` — which is why
 * they track the finger continuously instead of stepping when the index flips.
 */
function Card({ x, i, metrics, hidden, children }) {
  const { step, offset } = metrics

  const distance = useTransform(x, (v) => {
    if (!step) return 1
    // where this card's centre currently sits, relative to the resting centre
    const delta = v + i * step - offset
    return Math.min(Math.abs(delta) / step, 1)
  })

  const scale = useTransform(distance, [0, 1], [1, MIN_SCALE])
  // `filter: brightness()`, not `opacity` — opacity blends the card toward the
  // section's own white ground, which faded the caption's gradient scrim
  // toward invisible right along with the photo, so only the active card
  // (opacity 1) ever showed a readable gradient behind its text. Brightness
  // darkens every pixel by the same factor instead of blending any of them
  // away, so the scrim's contrast against the photo survives at any distance
  // from centre — dimmed, not washed out.
  const brightness = useTransform(distance, [0, 1], [1, MIN_BRIGHTNESS])
  const filter = useTransform(brightness, (b) => `brightness(${b})`)

  return (
    <motion.li
      style={{ scale, filter }}
      // Sized off the VIEWPORT, not the container, now that the row is
      // full-bleed — and larger than before, so the active card is properly
      // the feature. The remainder is what the neighbours show through.
      className="w-[80vw] shrink-0 select-none sm:w-[64vw] lg:w-[52vw] xl:w-[46vw]"
      aria-hidden={hidden}
    >
      {children}
    </motion.li>
  )
}

// `Nub` — the gold-on-plum arrow button this carousel used to sit under —
// went with the visible controls above. The offscreen buttons that replaced
// it need no styling of their own.
