/**
 * Books the contact form's call straight into the studio's Calendly.
 *
 *   GET  /api/book?date=YYYY-MM-DD&tz=Area/City[&days=1-7]
 *        The open 30-minute slots from that day on (one day by default), from Calendly itself, so the
 *        time picker only offers times that can really be booked.
 *   POST /api/book  { start_time, firstName, lastName, email, timezone }
 *        Creates the booking (Calendly's Scheduling API, POST /invitees).
 *        Calendly then emails the visitor the invite with the meeting link,
 *        exactly as if they had booked on calendly.com.
 *
 * Needs `CALENDLY_TOKEN`, a personal access token from the studio's Calendly
 * account (Integrations > API & Webhooks), set in Vercel. Without it both
 * routes answer 503 and the contact form falls back to sending a call
 * REQUEST, as it did before.
 */
import { personalize } from '../src/lib/industry.js'

const API = 'https://api.calendly.com'
const SLUG = process.env.CALENDLY_EVENT_SLUG?.trim() || '30min'
/** Make.com "Planet Owl website forms" webhook (the auto-reply emails). */
const MAKE_WEBHOOK = process.env.MAKE_WEBHOOK?.trim() || 'https://hook.us2.make.com/bcxw8cpn0glfqlnfdzlwfmq7a8cq7k9s'
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } })

function token() {
  return process.env.CALENDLY_TOKEN?.trim()
}

async function calendly(path, init = {}) {
  const res = await fetch(API + path, {
    ...init,
    headers: { authorization: `Bearer ${token()}`, 'content-type': 'application/json', ...(init.headers || {}) },
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) {
    const err = new Error(body?.message || `Calendly ${res.status}`)
    err.status = res.status
    err.body = body
    throw err
  }
  return body
}

// The event type (its uri and locations), looked up once per instance.
let eventTypeCache = null
async function eventType() {
  if (eventTypeCache) return eventTypeCache
  const me = await calendly('/users/me')
  const user = me.resource.uri
  const list = await calendly(`/event_types?user=${encodeURIComponent(user)}&active=true&count=100`)
  const found = list.collection.find((e) => e.slug === SLUG) || list.collection[0]
  if (!found) throw new Error('No active event type on the Calendly account')
  eventTypeCache = found
  return found
}

/** Midnight-to-midnight of `date` in `tz`, as UTC instants. */
function dayBounds(date, tz) {
  // Offset of `tz` at noon that day, in minutes (good enough for a day window).
  const noon = new Date(`${date}T12:00:00Z`)
  const local = new Date(noon.toLocaleString('en-US', { timeZone: tz }))
  const utc = new Date(noon.toLocaleString('en-US', { timeZone: 'UTC' }))
  const offset = (local - utc) / 60000
  const start = new Date(Date.parse(`${date}T00:00:00Z`) - offset * 60000)
  return { start, end: new Date(start.getTime() + 24 * 3600 * 1000) }
}

export async function GET(request) {
  if (!token()) return json(503, { error: 'not-configured' })
  const url = new URL(request.url)
  const date = url.searchParams.get('date') || ''
  // `days` (1-7) returns a whole stretch at once, for the booking page's
  // week view. Calendly answers at most 7 days per request.
  const days = Math.min(7, Math.max(1, parseInt(url.searchParams.get('days') || '1', 10) || 1))
  let tz = url.searchParams.get('tz') || 'UTC'
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return json(400, { error: 'Pick a date first.' })
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz })
  } catch {
    tz = 'UTC'
  }

  let { start } = dayBounds(date, tz)
  const end = new Date(start.getTime() + days * 24 * 3600 * 1000)
  // Calendly only answers for the future.
  const soon = new Date(Date.now() + 60 * 1000)
  if (end <= soon) return json(200, { slots: [] })
  if (start < soon) start = soon

  try {
    const et = await eventType()
    const q = new URLSearchParams({ event_type: et.uri, start_time: start.toISOString(), end_time: end.toISOString() })
    const avail = await calendly(`/event_type_available_times?${q}`)
    const slots = avail.collection.filter((s) => s.status === 'available').map((s) => s.start_time)
    return json(200, { slots })
  } catch (err) {
    console.error('book: availability failed', err.status, err.body || err.message)
    return json(502, { error: 'Could not load the open times. Please try again.' })
  }
}

export async function POST(request) {
  if (!token()) return json(503, { error: 'not-configured' })
  let body
  try {
    body = await request.json()
  } catch {
    return json(400, { error: 'That did not come through. Please try again.' })
  }

  const email = String(body.email || '').trim().slice(0, 200)
  const firstName = String(body.firstName || '').trim().slice(0, 80)
  const lastName = String(body.lastName || '').trim().slice(0, 80)
  const startTime = String(body.start_time || '')
  let timezone = String(body.timezone || 'UTC')
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: timezone })
  } catch {
    timezone = 'UTC'
  }

  if (!EMAIL_RE.test(email)) return json(400, { error: 'That does not look like an email address.' })
  if (!firstName) return json(400, { error: 'Please add your first name.' })
  if (Number.isNaN(Date.parse(startTime))) return json(400, { error: 'Please pick a time for the call.' })

  try {
    const et = await eventType()
    const invitee = { email, first_name: firstName, timezone }
    if (lastName) invitee.last_name = lastName
    else invitee.name = firstName
    const payload = { event_type: et.uri, start_time: new Date(startTime).toISOString(), invitee }
    // The event's own meeting location (Google Meet on the studio's event),
    // so Calendly creates the link and puts it in the invite.
    const loc = et.locations?.[0]
    if (loc?.kind) payload.location = { kind: loc.kind, ...(loc.location ? { location: loc.location } : {}) }
    const made = await calendly('/invitees', { method: 'POST', body: JSON.stringify(payload) })
    // Our own "you're on the calendar" welcome, on top of Calendly's invite,
    // by request. Best effort: the booking already stands.
    const at = new Date(payload.start_time)
    const label = (o) => at.toLocaleString('en-US', { timeZone: timezone, ...o })
    if (MAKE_WEBHOOK !== 'off') try {
      await fetch(MAKE_WEBHOOK, {
        method: 'POST',
        body: new URLSearchParams({
          kind: 'booked',
          email,
          firstName,
          lastName,
          date: label({ weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }),
          time: label({ hour: 'numeric', minute: '2-digit' }),
          timezone,
          source: String(body.source || 'booking page').slice(0, 60),
          // The contact form books through here too; hello@'s copy keeps
          // whatever else the visitor typed.
          company: String(body.company || '').slice(0, 120),
          phone: String(body.phone || '').slice(0, 60),
          website: String(body.website || '').slice(0, 200),
          message: String(body.message || '').slice(0, 2000),
          ...personalize({ email, company: body.company, website: body.website }),
        }),
      })
    } catch (err) {
      console.error('book: welcome email hook failed', err)
    }
    return json(200, { ok: true, event: made.resource?.event || null })
  } catch (err) {
    console.error('book: booking failed', err.status, err.body || err.message)
    if (err.status === 400 || err.status === 409 || err.status === 422)
      return json(409, { error: 'That time was just taken. Please pick another one.' })
    return json(502, { error: 'We could not book the call just now. Please try again.' })
  }
}
