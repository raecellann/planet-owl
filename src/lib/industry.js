/**
 * Guess a visitor's line of business from what they gave us (email, company,
 * website), so the auto-reply can speak to their pain points: Jasper's "most
 * important rule" for every email ("hvacproperty@gmail.com" means HVAC).
 *
 * Plain keyword matching, on purpose: no AI call, nothing stored, and when
 * nothing matches the email simply leaves the personal line out. The lines
 * are in Captain Hoot's voice (see the tone guide) and only name everyday
 * chores, not promises.
 *
 * Shared by the browser (src/lib/signup.js, Book.jsx) and the serverless
 * functions (api/book.js), so it must stay dependency-free.
 */
const INDUSTRIES = [
  {
    id: 'hvac',
    label: 'HVAC',
    words: ['hvac', 'heating', 'cooling', 'aircon', 'airco', 'aircond', 'refrigeration', 'furnace', 'ac-repair', 'acrepair'],
    pain: 'Sooo, juggling service calls, quotes and maintenance reminders while the techs are out in the field? That’s crazy work. We can take a bunch of that off your plate.',
  },
  {
    id: 'health',
    label: 'healthcare',
    words: ['dental', 'dentist', 'clinic', 'medical', 'health', 'derm', 'chiro', 'physio', 'ortho', 'pediatric', 'wellness', 'pharma', 'vet', 'therapy', 'doctor', 'medspa', 'veterinar'],
    pain: 'Sooo, still answering the same patient questions, chasing appointment follow-ups and retyping intake forms? That’s crazy work. We can take a bunch of that off your plate.',
  },
  {
    id: 'realestate',
    label: 'real estate',
    words: ['realty', 'realestate', 'real-estate', 'realtor', 'property', 'properties', 'homes', 'estate', 'listing', 'broker'],
    pain: 'Sooo, keeping up with new leads, listings and follow-ups that never stop coming in? That’s crazy work. We can take a bunch of that off your plate.',
  },
  {
    id: 'legal',
    label: 'legal',
    words: ['lawfirm', 'lawoffice', 'law.', 'legal', 'attorney', 'lawyer', 'counsel', 'notary'],
    pain: 'Sooo, buried in client intake, case updates and paperwork that eats the billable hours? That’s crazy work. We can take a bunch of that off your plate.',
  },
  {
    id: 'trades',
    label: 'trades',
    words: ['roof', 'plumb', 'electric', 'construct', 'builder', 'contractor', 'remodel', 'renovat', 'paint', 'landscap', 'pest', 'solar', 'clean'],
    pain: 'Sooo, quotes, job scheduling and customer follow-ups piling up while you’re on site? That’s crazy work. We can take a bunch of that off your plate.',
  },
  {
    id: 'beauty',
    label: 'beauty',
    words: ['salon', 'dayspa', 'spa.', 'beauty', 'barber', 'nails', 'skin', 'aesthetic', 'lash', 'brow', 'hair', 'makeup'],
    pain: 'Sooo, bookings, reminders and no-shows keeping you glued to the phone between clients? That’s crazy work. We can take a bunch of that off your plate.',
  },
  {
    id: 'food',
    label: 'food',
    words: ['restaurant', 'cafe', 'coffee', 'food', 'kitchen', 'bakery', 'bistro', 'grill', 'pizza', 'catering'],
    pain: 'Sooo, orders, reviews and keeping the socials fresh on top of running the kitchen? That’s crazy work. We can take a bunch of that off your plate.',
  },
  {
    id: 'retail',
    label: 'retail',
    words: ['shop', 'store', 'boutique', 'ecom', 'retail', 'merch', 'apparel', 'fashion', 'supply', 'supplies'],
    pain: 'Sooo, product photos, ads and customer messages stacking up faster than the orders ship? That’s crazy work. We can take a bunch of that off your plate.',
  },
  {
    id: 'fitness',
    label: 'fitness',
    words: ['fitness', 'gym', 'yoga', 'pilates', 'crossfit', 'trainer', 'coach', 'martial'],
    pain: 'Sooo, memberships, class bookings and member check-ins taking time away from the actual coaching? That’s crazy work. We can take a bunch of that off your plate.',
  },
  {
    id: 'auto',
    label: 'automotive',
    words: ['auto', 'motor', 'cars', 'carcare', 'carwash', 'garage', 'tire', 'tyre', 'detailing', 'mechanic'],
    pain: 'Sooo, service bookings, quotes and pickup reminders keeping the front desk swamped? That’s crazy work. We can take a bunch of that off your plate.',
  },
]

// Free mail providers say nothing about the business; only the part before
// the @ counts for these.
const FREE_MAIL = /@(gmail|googlemail|yahoo|ymail|outlook|hotmail|live|msn|icloud|me|aol|proton|protonmail|gmx|zoho|mail)\./i

/** `{ industry, painPoint }` for the fields given, or empty strings. */
export function personalize({ email = '', company = '', website = '' } = {}) {
  const mail = String(email).toLowerCase().trim()
  const fromMail = FREE_MAIL.test(mail) ? mail.split('@')[0] : mail
  const text = `${fromMail} ${String(company).toLowerCase()} ${String(website).toLowerCase()}`
  const hit = INDUSTRIES.find((i) => i.words.some((w) => text.includes(w)))
  return hit ? { industry: hit.label, painPoint: hit.pain } : { industry: '', painPoint: '' }
}
