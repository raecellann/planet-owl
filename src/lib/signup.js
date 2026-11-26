/**
 * Where the sign-up pills send their email.
 *
 * Two routes, picked at build time from `.env`:
 *
 *   1. `VITE_FORM_ENDPOINT` set — the email is POSTed there as JSON. Any
 *      form backend that accepts a JSON body works; it was written against
 *      Formspree (`https://formspree.io/f/<id>`), which emails each submission
 *      to the inbox the form was created with and needs no server of our own.
 *      `VITE_FORM_ACCESS_KEY` is optional and is sent along as `access_key`,
 *      which is what Web3Forms expects if that is used instead.
 *
 *   2. Set to the empty string? No — unset falls back to the studio's own
 *      Formspree form below. Only an endpoint that fails leaves the pill
 *      reporting an error. (The mailto path remains for a build that sets
 *      `VITE_FORM_ENDPOINT=mailto`.)
 *
 *      With `mailto` — the browser's mail client opens with a message to
 *      `VITE_CONTACT_EMAIL` (falling back to the studio address) with the
 *      visitor's email in the body. Nothing is lost if the endpoint has not
 *      been configured yet, it is just one more step for the visitor.
 *
 * See `.env.example` and the README's "Email sign-ups" section.
 */
/**
 * The studio's own Formspree form ("Planet Owl sign-ups", delivering to the
 * studio inbox). Baked in as the default so the live site needs no host
 * configuration; a Formspree id is public by design — it is in the HTML of
 * every site that uses one — so there is nothing to keep out of the repo.
 * `VITE_FORM_ENDPOINT` still overrides it, e.g. for a staging form.
 */
const DEFAULT_ENDPOINT = 'https://formspree.io/f/mgaaqbpv'
const ENDPOINT = import.meta.env.VITE_FORM_ENDPOINT?.trim() || DEFAULT_ENDPOINT
const ACCESS_KEY = import.meta.env.VITE_FORM_ACCESS_KEY?.trim()
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL?.trim() || 'hello@planetowl.studio'

/**
 * Make.com webhook ("Planet Owl website forms" scenario) that emails the
 * visitor an automatic reply: a "we got your call request" email when the
 * contact form has a date, a "thanks for starting a project" email otherwise.
 * Formspree still notifies the studio; this only drives the auto-reply.
 * Sent as form-encoded (a CORS "simple" request, so no preflight) and never
 * allowed to fail the visitor's submission. `VITE_MAKE_WEBHOOK` overrides it;
 * set it to `off` to disable.
 */
const DEFAULT_MAKE_WEBHOOK = 'https://hook.us2.make.com/bcxw8cpn0glfqlnfdzlwfmq7a8cq7k9s'
const MAKE_WEBHOOK = import.meta.env.VITE_MAKE_WEBHOOK?.trim() || DEFAULT_MAKE_WEBHOOK

function notifyMake(fields) {
  if (!MAKE_WEBHOOK || MAKE_WEBHOOK === 'off') return
  try {
    const body = new URLSearchParams()
    for (const [k, v] of Object.entries(fields)) if (v != null && !k.startsWith('_') && k !== 'access_key') body.append(k, String(v))
    fetch(MAKE_WEBHOOK, { method: 'POST', body, keepalive: true }).catch(() => {})
  } catch {
    /* auto-reply is best effort */
  }
}

/** True when submissions go to a real endpoint rather than a mailto. */
export const hasEndpoint = Boolean(ENDPOINT)

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value) {
  return EMAIL_RE.test(String(value || '').trim())
}

/**
 * Send one sign-up. Resolves to `{ via: 'endpoint' | 'mailto' }`; rejects
 * with an Error carrying a visitor-readable message when the endpoint says no.
 */
export async function submitSignup({ email, source = 'site' }) {
  const address = String(email || '').trim()
  if (!isValidEmail(address)) throw new Error('That does not look like an email address.')

  if (ENDPOINT === 'mailto') {
    const subject = encodeURIComponent('Free 2-week trial request | Planet Owl')
    const body = encodeURIComponent(
      `Hi Planet Owl,\n\nI'd like to start a project / claim the free 2-week trial.\n\nMy email: ${address}\nSent from: ${source}\n`,
    )
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
    return { via: 'mailto' }
  }

  const payload = {
    email: address,
    source,
    page: typeof window !== 'undefined' ? window.location.href : '',
    _subject: 'New 2-week trial request | Planet Owl',
  }
  if (ACCESS_KEY) payload.access_key = ACCESS_KEY

  let res
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.')
  }

  if (!res.ok) {
    let message = 'Something went wrong on our end. Please try again in a moment.'
    try {
      const data = await res.json()
      if (data?.errors?.length) message = data.errors.map((e) => e.message).join(' ')
      else if (typeof data?.message === 'string') message = data.message
    } catch {
      /* non-JSON error body — keep the generic message */
    }
    throw new Error(message)
  }

  notifyMake({ kind: payload.date ? 'meeting' : 'project', ...payload })
  return { via: 'endpoint' }
}

/**
 * Send the contact page's form: a message, and optionally a call to book.
 *
 * Same endpoint as the sign-up pills, with the whole form as the JSON body, so
 * a booking request lands in the studio inbox as one email with every field
 * on its own line. `fields` is passed through as given; only the email is
 * checked here, because it is the one thing a reply cannot do without.
 *
 * Nothing here HOLDS a slot. The date and time are a request, which the studio
 * confirms by replying — the page says so. Holding real slots needs a
 * calendar behind it (Calendly, Cal.com, Google Calendar), and none is
 * connected.
 */
export async function submitContact(fields, { autoReply = true } = {}) {
  const email = String(fields.email || '').trim()
  if (!isValidEmail(email)) throw new Error('That does not look like an email address.')

  const wantsCall = Boolean(fields.date)
  const subject = wantsCall
    ? `Call request for ${fields.date}${fields.time ? ` at ${fields.time}` : ''} | Planet Owl`
    : 'New contact message | Planet Owl'

  if (ENDPOINT === 'mailto') {
    const lines = Object.entries(fields)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n')
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`
    return { via: 'mailto' }
  }

  const payload = {
    ...fields,
    email,
    source: 'contact page',
    page: typeof window !== 'undefined' ? window.location.href : '',
    _subject: subject,
  }
  if (ACCESS_KEY) payload.access_key = ACCESS_KEY

  let res
  try {
    res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.')
  }

  if (!res.ok) {
    let message = 'Something went wrong on our end. Please try again in a moment.'
    try {
      const data = await res.json()
      if (data?.errors?.length) message = data.errors.map((e) => e.message).join(' ')
      else if (typeof data?.message === 'string') message = data.message
    } catch {
      /* non-JSON error body — keep the generic message */
    }
    throw new Error(message)
  }

  // A call booked straight into Calendly gets Calendly's own confirmation,
  // so the Make auto-reply ("we'll confirm your slot") is skipped.
  if (autoReply) notifyMake({ kind: payload.date ? 'meeting' : 'project', ...payload })
  return { via: 'endpoint' }
}
