import { A } from '../../lib/assets'

/**
 * The floating Planet Owl island.
 *
 * The source render is trimmed to its content box by `npm run assets`, so the
 * image edges are the island's edges — that lets the hero position it purely
 * with `object-bottom` and no magic offsets.
 */
export default function Island({ className = '' }) {
  return (
    <img
      src={A.island}
      alt="The floating Planet Owl island: the studio building, a winding road and a waterfall spilling into the clouds"
      className={className}
      fetchPriority="high"
      decoding="async"
      draggable="false"
    />
  )
}
