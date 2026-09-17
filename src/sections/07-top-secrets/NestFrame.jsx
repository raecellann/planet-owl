import { A } from '../../lib/assets'

/**
 * The vine canopy hanging over the top of the nest.
 *
 * This used to be a band with no art behind it at all: there was no flat export
 * of the transition, so it reused the alpha of section 3's gold plate as a MASK
 * and painted the torn edge in the previous section's colour, which made the
 * dusk above appear to tear open onto the dark below. A good trick, and only
 * ever a stand-in for the real plate.
 *
 * `assets/section 6` has that plate — `nest-vines`, a full-width run of hanging
 * vines and tendrils — so the tear is the actual canopy now rather than a shape
 * borrowed off another section's export.
 *
 * Cropped to a BAND rather than drawn at its natural height. The plate is
 * 1600x889, so at full width it stands 800px tall on a 1440 window — nearly the
 * whole first screen, which buried the heading in leaves. The design runs it as
 * a strip across the very top, so the box is given the strip's height and
 * `object-cover object-top` keeps the sharp near vines and their tendrils while
 * the blurred depth-of-field row further down the file falls outside the crop.
 *
 * Faded at BOTH ends, and the top one matters more than it sounds. Cropping to
 * a band means the box begins on whatever row of the plate the crop starts on,
 * and the mask used to be flat `#000` there — so the canopy switched on along a
 * dead-straight full-width line with lit leaves immediately under it, right
 * where this section meets the nest above. Fading the first quarter lets it
 * emerge out of the dark instead of starting on an edge.
 *
 * The bottom fade is the same idea at the other end: the tendrils dissolve
 * rather than stopping on the crop's own lower edge.
 *
 * No `z-index`. It carries one briefly and that was enough to paint the canopy
 * over the "Top Secrets" title — both this and the content column are
 * positioned, so with neither of them stacked the later one in the DOM wins,
 * and the content is the later one. The section states `z-10` on that column
 * anyway, so the order is now written down rather than inferred.
 */
export default function NestFrame({ className = '' }) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-x-0 top-0 h-[clamp(7rem,14vw,13rem)] select-none ${className}`}
    >
      <img
        src={A.nest.vines}
        alt=""
        loading="lazy"
        decoding="async"
        className="size-full object-cover object-top [mask-image:linear-gradient(180deg,transparent_0%,#000_26%,#000_62%,transparent_96%)]"
      />
    </div>
  )
}
