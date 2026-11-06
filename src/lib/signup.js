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
    const subject = encodeURIComponent('Free 2-week trial request — Planet Owl')
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
    _subject: 'New 2-week trial request — Planet Owl',
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

  return { via: 'endpoint' }
}
