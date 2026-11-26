/**
 * Builds public/email/hero.gif, the animated header of the auto-reply emails:
 * the owl bobbing over drifting clouds, from the site's own art.
 *   node scripts/make-email-art.mjs <project dir> <frames dir> [owl file] [owl height]
 * Swoop (owl-broom) heads the booking email; Flora (owl-flower) and Regina
 * (owl-crown) head the others, by request.
 *   ffmpeg -framerate 12 -i <frames dir>/f%02d.png -vf "split[a][b];[a]palettegen=max_colors=128[p];[b][p]paletteuse=dither=bayer:bayer_scale=4" -loop 0 public/email/hero.gif
 */
import sharp from 'sharp'
const root = process.argv[2], out = process.argv[3]
// Which owl flies in the header (default Swoop), and how tall it is drawn.
const OWL = process.argv[4] || 'owl-broom.webp'
const OWL_H = Number(process.argv[5] || 190)
const W = 600, H = 260, N = 30
const bg = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#d9eafa"/><stop offset="0.7" stop-color="#ffffff"/><stop offset="1" stop-color="#ffffff"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#g)"/></svg>`)
const owl = await sharp(`${root}/public/assets/${OWL}`).resize({ height: OWL_H }).png().toBuffer()
const owlMeta = await sharp(owl).metadata()
const cl = async (f, w, op) => { const b = await sharp(`${root}/public/assets/${f}`).resize({ width: w }).modulate({ brightness: 1.18 }).ensureAlpha().png().toBuffer(); const m = await sharp(b).metadata(); const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${m.width}" height="${m.height}"><defs><linearGradient id="f" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${op}"/><stop offset="0.45" stop-color="#fff" stop-opacity="${op}"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#f)"/></svg>`); const faded = await sharp(b).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer(); return { b: faded, w: m.width, h: m.height } }
const clouds = [
  { ...(await cl('cloud-puff.webp', 230, 0.9)), y: 175, x0: 10, dx: 45 },
  { ...(await cl('cloud-puff.webp', 170, 0.85)), y: 20, x0: 420, dx: -50 },
  { ...(await cl('cloud-a.webp', 200, 0.8)), y: 185, x0: 390, dx: 40 },
  { ...(await cl('cloud-b.webp', 170, 0.75)), y: 30, x0: 30, dx: 30 },
]
for (let i = 0; i < N; i++) {
  const t = i / N, s = Math.sin(t * Math.PI * 2)
  const layers = clouds.map((c) => ({ input: c.b, left: Math.round(c.x0 + c.dx * s), top: c.y }))
  const ox = Math.round((W - owlMeta.width) / 2 + 14 * Math.cos(t * Math.PI * 2)), oy = Math.round(32 + 10 * s)
  layers.splice(2, 0, { input: owl, left: ox, top: oy })
  await sharp(bg).composite(layers.map(l=>({...l, left: Math.max(-2000,l.left)}))).png().toFile(`${out}/f${String(i).padStart(2,'0')}.png`)
}
console.log('frames', N, owlMeta.width)
