const base = import.meta.env.BASE_URL

const asset = (file) => `${base}assets/${file}`

/**
 * Everything in `public/assets` is produced by `npm run assets` from the raw
 * exports in `assets/`. Cut-outs ship as WebP; flat UI bits stay PNG/JPG.
 */
export const A = {
  sky: asset('sky.jpg'),
  cloud: asset('cloud-wisp.webp'),
  /** Foreground cumulus cut-out for the landing screen. */
  cloudPuff: asset('cloud-puff.webp'),
  /** The same cloud uncropped, at the 1.5 ratio the Figma places them at. */
  cloudBig: asset('cloud-big.webp'),
  /**
   * Section 5 — the flight out through the tree, as four independent planes.
   * They are never composed into one picture: `NestView.jsx` stacks them and
   * moves each at its own rate, which is the only thing that reads as depth.
   *
   * `cave` carries the geometry. Its opening is a real transparent hole at
   * 10.0-93.9% across and 31.9-68.9% down its own file, so it masks the `city`
   * behind it natively — no CSS clip is involved, and none would register as
   * exactly against a ragged twig edge.
   */
  nest: {
    branch: asset('nest-branch.webp'),
    cave: asset('nest-cave.webp'),
    city: asset('nest-city.webp'),
    /**
     * The current backdrop for the flight out: the same boulevard, shot with
     * the motion blur baked into the plate rather than added in CSS. 2200x1360
     * (1.618), against `city`'s 1.336 — the crop maths in `NestView` is keyed
     * to this one's ratio, so the two are not interchangeable.
     */
    cityBlur: asset('nest-city-blur.webp'),
    owl: asset('nest-owl.webp'),
    /** The hanging vine canopy that frames Top Secrets. */
    vines: asset('nest-vines.webp'),
    /** The nest of brand work that closes Top Secrets. */
    brands: asset('nest-brands.webp'),
    /**
     * The two mid-dive stills the click-through-the-opening transition
     * crossfades across: a close, blurred pass of the city, then a blurred
     * pull-in on the vine frame with "Secrets" already lit gold — the second
     * one is what hands off to Top Secrets' own heading without a hard cut.
     */
    diveCity: asset('nest-dive-city.webp'),
    diveSecrets: asset('nest-dive-secrets.webp'),
  },
  /**
   * Section 6 — one render per secret, and the render IS the secret: the film
   * crew for attention, the headset and holograms for products, the robots and
   * consoles for the clever machinery.
   *
   * Painted on a near-black ground (#100600) rather than cut out, which is what
   * lets them sit straight on the section — that corner is within a few channel
   * steps of the nest brown running through the sections either side.
   */
  secrets: {
    attention: asset('secret-attention.webp'),
    products: asset('secret-products.webp'),
    tech: asset('secret-tech.webp'),
    /** "Top Secrets" already set in gold, hung off a short vine — the section's heading plate. */
    heading: asset('top-secrets-heading.webp'),
    /** The vine strung between consecutive secrets — a different export from the heading's own. */
    vine: asset('secrets-vine.webp'),
  },
  /**
   * The background-free wordmark, from `scripts/make-logo-alpha.mjs`. The
   * original `logo.png` still ships as the source of record but must not be
   * used in the page: it was cropped out of the white navbar export, so it
   * carries an opaque white plate that shows as a rectangle anywhere the
   * background is not white.
   */
  logo: asset('logo-alpha.png'),
  mark: asset('owl-mark.png'),
  /**
   * The owl already composed onto its plum disc, at the exact framing used
   * inside the "Start a Project" pill. Kept separate from `mark` because that
   * one is the bare navbar crop — dropped into `GoldButton`'s own plum badge
   * it read as an owl inset into a slightly-off ring; this asset IS the badge.
   */
  buttonOwl: asset('owl-button.png'),
  /** The brand owl at lockup size — `mark` is a navbar crop and far too small. */
  markLg: asset('owl-mark-lg.webp'),
  /** The full owl + ring + wordmark lockup, as one flat image, for the footer. */
  footerLockup: asset('footer-lockup.webp'),
  /** The gold play badge that follows the cursor across the portfolio lead tile. */
  playBadge: asset('play-badge.webp'),
  /** The Maserati testimonial card, composed — photo, quote and attribution in one. */
  nestTestimonial: asset('nest-testimonial.webp'),
  /**
   * The footer band's feathered top edge. Sits in normal flow over the night
   * sky so the dark shows through the scallops, with the flat gold body
   * butted underneath it.
   */
  footerEdge: asset('footer-edge.webp'),
  /** The band's own gold — deeper than `gold-500`, straight off the export. */
  footerGold: '#e7b248',
  island: asset('island.webp'),
  owl: {
    broom: asset('owl-broom.webp'),
    wizard: asset('owl-wizard.webp'),
    crown: asset('owl-crown.webp'),
    flower: asset('owl-flower.webp'),
    pumpkin: asset('owl-pumpkin.webp'),
    flame: asset('owl-flame.webp'),
    tophat: asset('owl-tophat.png'),
    astronaut: asset('owl-astronaut.webp'),
    float: asset('owl-float.webp'),
    pilot: asset('owl-pilot.webp'),
    /** Wider crop of the pilot — keeps the far wingtip, for the portfolio bleed. */
    plane: asset('owl-plane.webp'),
    /** The pilot in flight with his gear down — the nest view's own plane. */
    planeFly: asset('owl-plane-fly.webp'),
    /** The pilot standing beside the plane on the ground, for the footer band. */
    ground: asset('owl-plane-ground.webp'),
    /** Front-on, propeller toward the camera — the landing screen and the nest. */
    front: asset('owl-plane-front.webp'),
    /** One per craft in the What We Do carousel. */
    vr: asset('owl-vr.webp'),
    develop: asset('owl-develop.webp'),
    digital: asset('owl-digital.webp'),
    ai: asset('owl-ai.webp'),
    /** The large wizard that guards the entrance to the nest. */
    wizardLg: asset('owl-wizard-lg.webp'),
    /** The pose he swaps to while the pointer is over him. */
    wizardHover: asset('owl-wizard-hover.webp'),
    /** Cut out of the promise ribbon, still on its gold badge. */
    promise: asset('promise-owl.webp'),
  },
  work: {
    /** 1616x673. The play badge is painted in — do not overlay another. */
    lead: asset('work-lead.webp'),
    observatory: asset('work-observatory.webp'),
    street: asset('work-street.webp'),
  },
  flock: {
    wide: asset('flock-wide.webp'),
    candid: asset('flock-candid.webp'),
  },
  /** Full-width gold band with torn, feathered top and bottom edges. */
  goldPlate: asset('gold-plate.webp'),
  feathers: [
    asset('feather-1.webp'),
    asset('feather-2.webp'),
    asset('feather-3.webp'),
    asset('feather-4.webp'),
  ],
}

export const NAV_LINKS = [
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'What We Do', href: '#what-we-do' },
  { label: 'The Flock', href: '#the-flock' },
  { label: 'The Nest', href: '#the-nest' },
]

/** The footer's own row, per the section 9 export — not the same set as the nav. */
export const FOOTER_LINKS = [
  { label: 'Portfolio', href: '#portfolio' },
  { label: 'What We Do', href: '#what-we-do' },
  { label: 'The Nest', href: '#the-nest' },
  { label: 'Careers', href: '#the-flock' },
  { label: 'Blog', href: '#nest-view' },
  { label: 'Privacy', href: '#start' },
]
