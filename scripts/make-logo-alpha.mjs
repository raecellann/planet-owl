/**
 * Knocks the white plate out from behind the wordmark.
 *
 *   node scripts/make-logo-alpha.mjs
 *
 * `logo.png` was cropped out of the `Frame 21` navbar export, so it carries
 * that bar's opaque white background. That is invisible in the nav — which is
 * also white — but anywhere else it shows as a rectangle, and the footer's
 * `brightness-0 invert` turns the whole plate into a solid white block.
 *
 * A flood fill from the border rather than a global "white -> transparent"
 * threshold, so white *enclosed* by the mark (the owl's eyes, the counters in
 * the letterforms) is kept. Edge pixels are feathered by how close they are to
 * the threshold, which keeps the antialiasing instead of leaving a hard fringe.
 *
 * Source of record: `assets/homescreen/` is gone, so `public/assets/logo.png`
 * is the original. It is read, never written.
 */
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const OUT_DIR = join(ROOT, 'public', 'assets')
const FROM = join(OUT_DIR, 'logo.png')
const TO = join(OUT_DIR, 'logo-alpha.png')

/** Anything at or above this on all three channels counts as background. */
const HARD = 246
/** Below this is fully opaque; between the two, alpha ramps. */
const SOFT = 205

const { data, info } = await sharp(FROM).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
const { width: W, height: H, channels: C } = info

const isBg = (i) => data[i] >= HARD && data[i + 1] >= HARD && data[i + 2] >= HARD

// Flood fill inward from every border pixel.
const outside = new Uint8Array(W * H)
const stack = []
for (let x = 0; x < W; x++) {
  stack.push(x, (H - 1) * W + x)
}
for (let y = 0; y < H; y++) {
  stack.push(y * W, y * W + W - 1)
}

while (stack.length) {
  const p = stack.pop()
  if (outside[p] || !isBg(p * C)) continue
  outside[p] = 1
  const x = p % W
  const y = (p - x) / W
  if (x > 0) stack.push(p - 1)
  if (x < W - 1) stack.push(p + 1)
  if (y > 0) stack.push(p - W)
  if (y < H - 1) stack.push(p + W)
}

// Clear what the fill reached; feather the rim so the edges stay smooth.
let cleared = 0
for (let p = 0; p < W * H; p++) {
  const i = p * C
  if (outside[p]) {
    data[i + 3] = 0
    cleared++
    continue
  }
  const lum = Math.max(data[i], data[i + 1], data[i + 2])
  if (lum > SOFT) {
    // Only feather pixels that actually touch the cleared region, so white
    // enclosed by the mark keeps its full alpha.
    const x = p % W
    const y = (p - x) / W
    const touches =
      (x > 0 && outside[p - 1]) ||
      (x < W - 1 && outside[p + 1]) ||
      (y > 0 && outside[p - W]) ||
      (y < H - 1 && outside[p + W])
    if (touches) {
      data[i + 3] = Math.round(255 * (1 - Math.min(1, (lum - SOFT) / (HARD - SOFT))))
    }
  }
}

await sharp(data, { raw: { width: W, height: H, channels: C } })
  .png({ compressionLevel: 9 })
  .toFile(TO)

console.log(`logo-alpha.png  ${W}x${H}  ${cleared} of ${W * H} px cleared`)
