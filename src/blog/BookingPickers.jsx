import { useEffect, useMemo, useRef, useState } from 'react'

const DAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']
const pad = (n) => String(n).padStart(2, '0')
const iso = (y, m, d) => `${y}-${pad(m + 1)}-${pad(d)}`
const parse = (v) => {
  const [y, m, d] = v.split('-').map(Number)
  return new Date(y, m - 1, d)
}

const TRIGGER =
  'mt-1.5 flex w-full cursor-pointer items-center justify-between gap-2 rounded-xl border-2 border-plum-900/15 bg-white px-4 py-3 text-left font-ui text-base font-normal transition-colors hover:border-plum-700/50 focus:border-plum-700 focus:outline-none'
const PANEL =
  'absolute left-0 top-full z-40 mt-2 rounded-2xl bg-white p-3 shadow-[0_24px_50px_-18px_rgba(54,14,57,0.5)] ring-1 ring-plum-900/10'

/** Shared open state: closes on an outside press or Escape. */
function usePopover() {
  const [open, setOpen] = useState(false)
  const root = useRef(null)
  useEffect(() => {
    if (!open) return undefined
    const away = (e) => {
      if (!root.current?.contains(e.target)) setOpen(false)
    }
    const esc = (e) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', esc)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', esc)
    }
  }, [open])
  return { open, setOpen, root }
}

// Both pickers sit inside a <label>. Without preventDefault, a press anywhere
// in the panel is forwarded to the trigger and closes it again.
const keepLabelOut = (e) => e.preventDefault()

export function DatePicker({ value, min, onChange }) {
  const { open, setOpen, root } = usePopover()
  const start = value ? parse(value) : parse(min)
  const [view, setView] = useState({ y: start.getFullYear(), m: start.getMonth() })
  const minDate = parse(min)
  const canGoBack = view.y > minDate.getFullYear() || (view.y === minDate.getFullYear() && view.m > minDate.getMonth())

  const cells = useMemo(() => {
    const lead = new Date(view.y, view.m, 1).getDay()
    const count = new Date(view.y, view.m + 1, 0).getDate()
    return [...Array(lead).fill(null), ...Array.from({ length: count }, (_, i) => i + 1)]
  }, [view])

  const step = (by) =>
    setView(({ y, m }) => {
      const next = new Date(y, m + by, 1)
      return { y: next.getFullYear(), m: next.getMonth() }
    })

  const label = value
    ? parse(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Choose a date'

  return (
    <div ref={root} className="relative" onClick={keepLabelOut}>
      <button type="button" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(!open)} className={`${TRIGGER} ${value ? 'text-plum-900' : 'text-plum-900/55'}`}>
        <span className="truncate">{label}</span>
        <svg viewBox="0 0 24 24" aria-hidden className="size-5 shrink-0 text-plum-700" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="5.5" width="16" height="15" rx="3" />
          <path d="M8 3.5v4M16 3.5v4M4 10.5h16" />
        </svg>
      </button>
      {open && (
        <div role="dialog" aria-label="Choose a date" className={`${PANEL} right-0 !p-2`}>
          <div className="flex items-center justify-between px-1 pb-2">
            <button type="button" aria-label="Previous month" disabled={!canGoBack} onClick={() => step(-1)} className="grid size-8 place-items-center rounded-full text-plum-800 transition-colors hover:bg-plum-100 disabled:opacity-25 disabled:hover:bg-transparent">‹</button>
            <span className="font-ui text-sm font-bold text-plum-900">
              {new Date(view.y, view.m, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </span>
            <button type="button" aria-label="Next month" onClick={() => step(1)} className="grid size-8 place-items-center rounded-full text-plum-800 transition-colors hover:bg-plum-100">›</button>
          </div>
          <div className="grid grid-cols-7 text-center font-ui text-xs font-semibold text-plum-600">
            {DAYS.map((d) => (
              <span key={d} className="py-1">{d}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-0.5">
            {cells.map((d, i) => {
              if (!d) return <span key={`gap-${i}`} />
              const day = iso(view.y, view.m, d)
              const past = day < min
              const on = day === value
              return (
                <button
                  key={day}
                  type="button"
                  disabled={past}
                  aria-pressed={on}
                  onClick={() => {
                    onChange(day)
                    setOpen(false)
                  }}
                  className={`mx-auto grid aspect-square w-full max-w-9 place-items-center rounded-full font-ui text-sm transition-colors ${
                    on ? 'bg-plum-800 font-bold text-gold-400' : past ? 'text-plum-900/25' : day === min ? 'font-bold text-teal-600 hover:bg-gold-200' : 'text-plum-900 hover:bg-gold-200'
                  }`}
                >
                  {d}
                </button>
              )
            })}
          </div>
          {value && (
            <button type="button" onClick={() => { onChange(''); setOpen(false) }} className="mt-2 w-full rounded-full py-1.5 font-ui text-sm font-semibold text-plum-700 transition-colors hover:bg-plum-100">
              Clear date
            </button>
          )}
        </div>
      )}
    </div>
  )
}

export function TimePicker({ value, options, required, onChange }) {
  const { open, setOpen, root } = usePopover()
  return (
    <div ref={root} className="relative" onClick={keepLabelOut}>
      {/* Keeps the browser's "required" check on the form. */}
      <input aria-hidden tabIndex={-1} required={required} value={value} onChange={() => {}} className="pointer-events-none absolute bottom-0 left-4 h-px w-px opacity-0" />
      <button type="button" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen(!open)} className={`${TRIGGER} ${value ? 'text-plum-900' : 'text-plum-900/55'}`}>
        <span className="truncate">{value || 'Choose a time'}</span>
        <svg viewBox="0 0 24 24" aria-hidden className={`size-5 shrink-0 text-plum-700 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {open && (
        <ul role="listbox" aria-label="Choose a time" className={`${PANEL} right-0 max-h-60 overflow-y-auto`}>
          {options.map((s) => (
            <li key={s}>
              <button
                type="button"
                role="option"
                aria-selected={s === value}
                onClick={() => {
                  onChange(s)
                  setOpen(false)
                }}
                className={`w-full rounded-lg px-3 py-2 text-left font-ui text-sm transition-colors ${s === value ? 'bg-plum-800 font-bold text-gold-400' : 'text-plum-900 hover:bg-gold-200'}`}
              >
                {s}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
