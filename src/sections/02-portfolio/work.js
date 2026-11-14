import manifest from './work-manifest.json'

/**
 * The studio's client work, one entry per BRAND.
 *
 * A brand is a folder in `assets/portfolio/`. `npm run assets` turns every
 * image in it into a web file and records what it found in
 * `work-manifest.json`, so nothing here lists pictures: an entry says what the
 * brand is called, which crafts it shows, and the few things a file cannot say
 * about itself (that a still is the poster of a film, or which store a
 * screenshot belongs to). Add a picture to a folder and it joins that brand's
 * album; add a folder and an entry and there is a new tile.
 *
 *   id     the folder name
 *   title  the client or project; `kind` is what was made for them
 *   tags   every craft in the album, which is what the chips filter on
 *   href   a live site, offered as "Visit site" in the album
 *   lead   the 1616x673 tile at the top (one)
 *   wide   the 787x466 row under it (two)
 *   videos file name -> Google Drive file id. The still of that name is the
 *          film's poster, and the album plays the film in its place.
 *   links  file name -> { label, href }, for an album of other people's sites
 */
const BRANDS = [
  {
    id: 'relevance-studio',
    title: 'Relevance Studio',
    kind: 'Website & brand guidelines',
    alt: 'The Relevance Studio homepage: a navy hero reading "The recruiting platform that runs your hiring process"',
    tags: ['website', 'graphic'],
    href: 'https://www.relevance.studio/en',
    lead: true,
  },
  {
    id: 'shopify-stores',
    title: 'Shopify Stores',
    kind: 'Storefront design & build',
    alt: 'Four Shopify storefronts side by side: AG1, Galifornia Undies, OsiOils and Lockhart\'s',
    tags: ['website'],
    wide: true,
    links: {
      papermoney: { label: 'Paper Money', href: 'https://papermoneybrand.com/' },
      patapal: { label: 'Pata Pal', href: 'https://patapal.com/' },
      fzklfit: { label: 'FZKL', href: 'https://fzklfit.com/' },
      slumbercloud: { label: 'Slumber Cloud', href: 'https://www.slumbercloud.com/' },
      rebalance: { label: 'Rebalance Health', href: 'https://rebalancehealth.com/' },
      plantwell: { label: 'Plantwell', href: 'https://www.plantwell.co/' },
      buzplants: { label: 'Buz Plants', href: 'https://www.buzplants.com/' },
      ag1: { label: 'AG1', href: 'https://drinkag1.com/' },
      omic: { label: 'Omic Skincare', href: 'https://omicskincare.com/' },
      '247studio': { label: '247 Studio', href: 'https://www.247studio.co/' },
      storyjewelry: { label: 'Story Jewelry Co.', href: 'https://www.storyjewelryco.shop/' },
      lockharts: { label: "Lockhart's Authentic", href: 'https://lockhartsauthentic.com/' },
      lifelab: { label: 'Life Lab MD', href: 'https://lifelabco.com/' },
      truebotanicals: { label: 'True Botanicals', href: 'https://truebotanicals.com/' },
      galifornia: { label: 'Galifornia Undies', href: 'https://www.galiforniaundies.com/' },
      mypelvicbra: { label: 'Pelvic Bra', href: 'https://www.mypelvicbra.shop/' },
      purelybella: { label: 'Purely Bella', href: 'https://purelybellabeauty.com/' },
      vetsak: {
        label: 'vetsak configurator',
        href: 'https://de.vetsak.com/pages/configurator?composition=set-01-m&material=suave&color=espresso',
      },
      amiquip: { label: 'Amiquip', href: 'https://amiquip.com/' },
      pupstrong: { label: 'PupStrong+', href: 'https://pupstrongplus.com/' },
      zalori: { label: 'Zalori', href: 'https://zalori.com/' },
      fullfat: { label: 'Full Fat Skin Co.', href: 'https://fullfatskinco.com/' },
      elevex: { label: 'Elevex Labs', href: 'https://elevexlabs.com/' },
      musway: { label: 'Musway', href: 'https://muswayusa.com/' },
      xyab: { label: 'xyab', href: 'https://xyab.com/' },
      alor: { label: 'ALOR', href: 'https://alor.com/' },
      osioils: { label: 'OsiOils', href: 'https://osioils.com/' },
    },
  },
  {
    id: 'rummage-rush',
    title: 'Rummage Rush',
    kind: '3D game art',
    alt: 'Voxel characters and recycling bins on a conveyor above the Rummage Rush logo',
    tags: ['3d', 'apps'],
    wide: true,
  },
  {
    id: 'twin-rams',
    title: 'Twin Rams',
    kind: 'Social campaign',
    alt: 'A faceted blue ram mounted on a racing car under the line "Official Regional Search Partner"',
    tags: ['graphic', '3d'],
  },
  {
    id: 'slothpilot',
    title: 'SlothPilot',
    kind: 'Web app',
    alt: 'The SlothPilot homepage: a sloth riding a rocket beside "Apply to hundreds of jobs while you sleep"',
    tags: ['apps', 'website'],
    href: 'https://slothpilot.app/',
  },
  {
    id: 'maybelline',
    title: 'Maybelline',
    kind: 'AI product film',
    alt: 'A hand holding a pink lip gloss above a pink lotus flower',
    tags: ['video', 'ai'],
    videos: { '01-film': '1QHI2Jr54QdozQl0Xx1g0n686S56Ewgj8' },
  },
  {
    id: 'lowell-herb-co',
    title: 'Lowell Herb Co.',
    kind: 'Packaging, 3D renders & film',
    alt: 'Two kraft Lowell Smokes cartons, one open to show its contents',
    tags: ['graphic', '3d', 'video'],
    videos: {
      '08-film-3d': '1b_qj_cPYIOhDewDN_9ghIOeZlhJr1FbX',
      '09-film-social': '1svXQAU2__oFDjPgrvAtqbYMDfuqr5_-d',
    },
  },
  {
    id: 'sgmd',
    title: 'SGMD',
    kind: 'AI-illustrated carousel',
    alt: 'A cartoon lion in scrubs at a desk beside the headline "Daily Actions to Make a Difference"',
    tags: ['graphic', 'ai'],
  },
  {
    id: 'solomon-ai',
    title: 'Solomon AI',
    kind: 'Web app',
    alt: 'The Solomon AI homepage: "Your all-in-one teaching co-pilot" on a deep purple ground',
    tags: ['apps', 'website'],
    href: 'https://usesolomon.ai/',
  },
  {
    id: 'jolly-sports',
    title: 'Jolly Sports',
    kind: 'Player graphics',
    alt: 'A basketball player celebrating over the words "MVP of the Game" and a 22-point stat',
    tags: ['graphic'],
  },
  {
    id: 'ayala-group',
    title: 'Ayala Group',
    kind: 'Real estate promo film',
    alt: 'An aerial view straight down onto a city district around a domed building',
    tags: ['video'],
    videos: { '01-film': '15maN1hXvuiR9DJXJQ23OtywWAmR1Qxw8' },
  },
  {
    id: 'samsill',
    title: 'Samsill',
    kind: 'E-commerce product imagery',
    alt: 'A man in a checked blazer carrying a brown leather padfolio, captioned "Perfect for on-the-go"',
    tags: ['graphic'],
  },
  {
    id: 'xpandr',
    title: 'xpandr',
    kind: 'Email design & motion graphics',
    alt: 'An xpandr email headed "Your Future in Music" over blue and coral shapes',
    tags: ['graphic', 'video'],
    videos: { '02-film': '1Fm_X67zd1lcsmjgeCy1jmLS6iCeyBdPB' },
  },
  {
    id: 'xyanter',
    title: 'Xyanter',
    kind: 'AI short films',
    alt: 'A silver-haired man in a dark coat pressing his gloved hand to a gallery wall',
    tags: ['video', 'ai'],
    videos: {
      '01-film-gallery': '1WVvZHmq1Us0kADvgw8ZL9DnxzflbNGTd',
      '02-film-forest': '1SnBRhL2Ybm9rYMiQpX3JIsyunN_fdY0l',
    },
  },
  {
    id: 'mystique-dining',
    title: 'Mystique Dining',
    kind: 'Email design',
    alt: 'Red velvet curtains opening on a gilded dining room, headed "Host Your Private Event at Mystique Dining"',
    tags: ['graphic'],
  },
  {
    id: 'short-form-podcast',
    title: 'Short-form Podcast',
    kind: 'Video edit',
    alt: 'A podcast host at a microphone in front of a wall of plants, with a bold caption on screen',
    tags: ['video'],
    videos: { '01-film': '1KEkjGgSgFPvA_9MBuNAQah87W_j3g7gv' },
  },
  {
    id: 'spacetalk',
    title: 'Spacetalk',
    kind: 'Email design',
    alt: 'A Spacetalk email: two students in uniform above "The Watch That\'s Got Their Back (to School)"',
    tags: ['graphic'],
  },
  {
    id: 'landing-page-showreel',
    title: 'Landing Page Showreel',
    kind: 'Promo film',
    alt: 'A sprinter crouched at the start in a dark industrial hall',
    tags: ['video', 'website'],
    videos: { '01-film': '1jGFKF89sZt1FXiPG_DjsJOsQCEDaol9u' },
  },
  {
    id: 'cpo',
    title: 'CPO',
    kind: 'Email design',
    alt: 'A CPO email: a yellow cordless ratchet under "Save up to $40 off on DeWalt bare tools"',
    tags: ['graphic'],
  },
  {
    id: 'equine-supply',
    title: 'Equine Supply Store',
    kind: 'Email design',
    alt: 'A chestnut horse beside "Final Hours to Save!" and a pink "Save $40 Off" ribbon',
    tags: ['graphic'],
  },
]

const base = import.meta.env.BASE_URL
const url = (brand, file) => `${base}assets/work/${brand}/${file}.webp`

const picture = (brand, f) => ({
  name: f.name,
  src: url(brand, f.name),
  thumb: url(brand, `${f.name}.thumb`),
  w: f.w,
  h: f.h,
  tw: f.tw,
  th: f.th,
})

export const WORK = BRANDS.map((b) => {
  const files = manifest[b.id] ?? []
  const album = files.filter((f) => f.name !== 'cover')
  const coverFile = files.find((f) => f.name === 'cover') ?? album[0]
  const items = album.map((f) => ({
    ...picture(b.id, f),
    video: b.videos?.[f.name],
    link: b.links?.[f.name],
  }))
  return {
    ...b,
    cover: coverFile && picture(b.id, coverFile),
    // A tile wears the play badge when what it shows is a film's poster.
    film: Boolean(coverFile && b.videos?.[coverFile.name]),
    items,
  }
}).filter((b) => b.cover)

/** A Drive file, playing in Drive's own embeddable player. */
export const driveEmbed = (id) => `https://drive.google.com/file/d/${id}/preview`
