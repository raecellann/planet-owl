/**
 * Where the site's forms go: the studio's Make.com scenario ("Planet Owl –
 * form auto-reply"), and nowhere else.
 *
 * Make does both jobs in one run: it emails the visitor the Captain Hoot
 * auto-reply (a different one for a call request, a booking, an application
 * or a plain message), and it emails hello@planetowl.studio a copy with every
 * field. Formspree used to do the second job; it was dropped by request
 * because its free plan stops at 50 submissions a month (Make's free plan
 * covers about 300 at three credits each).
 *
 * Fields are sent form-encoded. The webhook answers CORS for any origin, so
 * the visitor is told if Make did not take the submission.
 *
 * `VITE_MAKE_WEBHOOK` overrides the webhook (e.g. for a test scenario);
 * `VITE_FORM_ENDPOINT=mailto` opens the visitor's mail client instead.
 */
import { personalize } from './industry.js'

const DEFAULT_MAKE_WEBHOOK = 'https://hook.us2.make.com/bcxw8cpn0glfqlnfdzlwfmq7a8cq7k9s'
const MAKE_WEBHOOK = import.meta.env.VITE_MAKE_WEBHOOK?.trim() || DEFAULT_MAKE_WEBHOOK
const MAILTO = import.meta.env.VITE_FORM_ENDPOINT?.trim() === 'mailto'
export const CONTACT_EMAIL = import.meta.env.VITE_CONTACT_EMAIL?.trim() || 'hello@planetowl.studio'

/** True when submissions go to a real endpoint rather than a mailto. */
export const hasEndpoint = !MAILTO

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function isValidEmail(value) {
  return EMAIL_RE.test(String(value || '').trim())
}

/** POST the fields to Make. Rejects with a visitor-readable message. */
async function sendToMake(fields) {
  const body = new URLSearchParams()
  for (const [k, v] of Object.entries(fields)) if (v != null && v !== '') body.append(k, String(v))
  let res
  try {
    res = await fetch(MAKE_WEBHOOK, { method: 'POST', body })
  } catch {
    throw new Error('Could not reach the server. Check your connection and try again.')
  }
  if (!res.ok) throw new Error('Something went wrong on our end. Please try again in a moment.')
}

const page = () => (typeof window !== 'undefined' ? window.location.href : '')

/**
 * Send one sign-up (the email pills and the "Start a Project" popup).
 * Resolves to `{ via: 'endpoint' | 'mailto' }`.
 */
export async function submitSignup({ email, source = 'site' }) {
  const address = String(email || '').trim()
  if (!isValidEmail(address)) throw new Error('That does not look like an email address.')

  if (MAILTO) {
    const subject = encodeURIComponent('Free 2-week trial request | Planet Owl')
    const body = encodeURIComponent(
      `Hi Planet Owl,\n\nI'd like to start a project / claim the free 2-week trial.\n\nMy email: ${address}\nSent from: ${source}\n`,
    )
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
    return { via: 'mailto' }
  }

  await sendToMake({ kind: 'project', email: address, source, page: page(), ...personalize({ email: address }) })
  return { via: 'endpoint' }
}

/**
 * Send the contact page's form: a message, and optionally a call request.
 *
 * `kind` is 'meeting' when a date was picked (Make sends the "we got your
 * call request" email, with the one-click Calendly link in `calendlyLink`),
 * 'project' otherwise. A call already booked straight into Calendly passes
 * `{ autoReply: false }`: api/book.js has told Make about the booking (with
 * the message and details), so nothing more is sent here.
 */
export async function submitContact(fields, { autoReply = true } = {}) {
  const email = String(fields.email || '').trim()
  if (!isValidEmail(email)) throw new Error('That does not look like an email address.')
  if (!autoReply) return { via: 'endpoint' }

  if (MAILTO) {
    const subject = fields.date ? `Call request for ${fields.date} | Planet Owl` : 'New contact message | Planet Owl'
    const lines = Object.entries(fields)
      .filter(([, v]) => v)
      .map(([k, v]) => `${k}: ${v}`)
      .join('\n')
    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines)}`
    return { via: 'mailto' }
  }

  await sendToMake({ ...fields, email, kind: fields.date ? 'meeting' : 'project', source: 'contact page', page: page(), ...personalize({ email, company: fields.company, website: fields.website }) })
  return { via: 'endpoint' }
}
