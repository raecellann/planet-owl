import { put } from '@vercel/blob'

/**
 * Join the Flock applications.
 *
 * The resume goes to the PRIVATE Blob store "planet-owl-resumes" (connected
 * to this project, so `BLOB_READ_WRITE_TOKEN` is set for us). Nothing in it
 * has a public URL: the studio opens the files from the Vercel dashboard,
 * Storage > planet-owl-resumes. Next to each resume sits a small JSON file
 * with what the applicant typed, and the studio inbox gets a note through the
 * same Formspree form the sign-ups use.
 *
 * A function body is capped at 4.5 MB on Vercel, so resumes are held to 4 MB.
 */
const MAX_BYTES = 4 * 1024 * 1024
const FORMSPREE = 'https://formspree.io/f/mgaaqbpv'
const ROLES = ['SEO Specialist', 'Motion Designer', 'Full-stack Engineer', 'AI Solutions Lead', 'Other']
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

/** What the file really is, from its first bytes, so a renamed file is refused. */
function sniff(bytes) {
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) return 'pdf'
  if (bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04) return 'docx'
  if (bytes[0] === 0xd0 && bytes[1] === 0xcf && bytes[2] === 0x11 && bytes[3] === 0xe0) return 'doc'
  return null
}

const TYPES = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  doc: 'application/msword',
}

const slug = (s) =>
  String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40) || 'applicant'

export async function POST(request) {
  let form
  try {
    form = await request.formData()
  } catch {
    return json(400, { error: 'That did not come through. Please try again.' })
  }

  // A hidden field people never see. Bots fill it in.
  if (String(form.get('company') || '').trim()) return json(200, { ok: true })

  const name = String(form.get('name') || '').trim().slice(0, 120)
  const email = String(form.get('email') || '').trim().slice(0, 200)
  const role = ROLES.includes(String(form.get('role'))) ? String(form.get('role')) : 'Other'
  const link = String(form.get('link') || '').trim().slice(0, 500)
  const note = String(form.get('note') || '').trim().slice(0, 2000)
  const file = form.get('resume')

  if (!name) return json(400, { error: 'Please add your name.' })
  if (!EMAIL_RE.test(email)) return json(400, { error: 'That does not look like an email address.' })
  if (!file || typeof file === 'string' || !file.size) return json(400, { error: 'Please attach your resume.' })
  if (file.size > MAX_BYTES) return json(400, { error: 'Please keep the resume under 4 MB.' })

  const bytes = new Uint8Array(await file.arrayBuffer())
  const kind = sniff(bytes)
  if (!kind) return json(400, { error: 'Please send the resume as a PDF or Word file.' })

  const day = new Date().toISOString().slice(0, 10)
  const base = `resumes/${day}/${slug(role)}/${slug(name)}`

  let resume
  try {
    resume = await put(`${base}.${kind}`, bytes, {
      access: 'private',
      addRandomSuffix: true,
      contentType: TYPES[kind],
    })
    await put(
      `${base}.json`,
      JSON.stringify({ name, email, role, link, note, resume: resume.pathname, receivedAt: new Date().toISOString() }, null, 2),
      { access: 'private', addRandomSuffix: true, contentType: 'application/json' },
    )
  } catch (err) {
    console.error('apply: blob upload failed', err)
    return json(500, { error: 'We could not save your resume just now. Please try again in a minute.' })
  }

  // A heads-up in the studio inbox. The application is already saved, so a
  // failure here is logged and not shown to the applicant.
  try {
    await fetch(FORMSPREE, {
      method: 'POST',
      headers: { 'content-type': 'application/json', accept: 'application/json' },
      body: JSON.stringify({
        email,
        name,
        source: 'join-the-flock',
        role,
        link,
        message: note,
        resume: `${resume.pathname} (Vercel > Storage > planet-owl-resumes)`,
        _subject: `Join the Flock: ${role} from ${name}`,
      }),
    })
  } catch (err) {
    console.error('apply: inbox notice failed', err)
  }

  return json(200, { ok: true })
}
