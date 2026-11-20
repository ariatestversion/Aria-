import { useMemo, useState } from 'react'
import { birthRange } from './birth'

const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]

const WEEK = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

type View = 'years' | 'months' | 'days'

function parseIso(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null
  const [year, month, day] = value.split('-').map(Number)
  return { year, month, day }
}

function isoOf(year: number, month: number, day: number) {
  const last = new Date(year, month, 0).getDate()
  const safe = Math.min(day, last)
  return `${year}-${String(month).padStart(2, '0')}-${String(safe).padStart(2, '0')}`
}

export function BirthPicker({ value, onChange }: { value: string; onChange: (iso: string) => void }) {
  const range = birthRange()
  const minYear = Number(range.min.slice(0, 4))
  const maxYear = Number(range.max.slice(0, 4))
  const picked = parseIso(value)
  const [view, setView] = useState<View>(picked ? 'days' : 'years')
  const [year, setYear] = useState(picked?.year || maxYear)
  const [month, setMonth] = useState(picked?.month || 1)

  const years = useMemo(() => {
    const list: number[] = []
    for (let n = maxYear; n >= minYear; n -= 1) list.push(n)
    return list
  }, [maxYear, minYear])

  const days = useMemo(() => {
    const first = new Date(year, month - 1, 1)
    const start = (first.getDay() + 6) % 7
    const count = new Date(year, month, 0).getDate()
    const cells: (number | null)[] = Array.from({ length: start }, () => null)
    for (let d = 1; d <= count; d += 1) cells.push(d)
    while (cells.length % 7 !== 0) cells.push(null)
    return cells
  }, [year, month])

  const shiftMonth = (delta: number) => {
    const next = new Date(year, month - 1 + delta, 1)
    const nextYear = next.getFullYear()
    if (nextYear < minYear || nextYear > maxYear) return
    setYear(nextYear)
    setMonth(next.getMonth() + 1)
  }

  return (
    <div className="birth-picker">
      <div className="birth-picker-head">
        {view === 'days' ? (
          <>
            <button type="button" className="birth-picker-shift" aria-label="Mois précédent" onClick={() => shiftMonth(-1)}>
              ‹
            </button>
            <button type="button" className="birth-picker-nav" onClick={() => setView('months')}>
              {MONTHS[month - 1]}
            </button>
            <button type="button" className="birth-picker-nav" onClick={() => setView('months')}>
              {year}
            </button>
            <button type="button" className="birth-picker-shift" aria-label="Mois suivant" onClick={() => shiftMonth(1)}>
              ›
            </button>
          </>
        ) : view === 'months' ? (
          <button type="button" className="birth-picker-nav" onClick={() => setView('years')}>
            {year}
          </button>
        ) : (
          <span>Année</span>
        )}
      </div>

      {view === 'years' ? (
        <div className="birth-years" role="listbox" aria-label="Année de naissance">
          {years.map((item) => (
            <button
              key={item}
              type="button"
              className={item === year ? 'on' : ''}
              onClick={() => {
                setYear(item)
                setView('months')
              }}
            >
              {item}
            </button>
          ))}
        </div>
      ) : null}

      {view === 'months' ? (
        <div className="birth-months" role="listbox" aria-label="Mois de naissance">
          {MONTHS.map((label, index) => (
            <button
              key={label}
              type="button"
              className={index + 1 === month ? 'on' : ''}
              onClick={() => {
                setMonth(index + 1)
                setView('days')
              }}
            >
              {label}
            </button>
          ))}
        </div>
      ) : null}

      {view === 'days' ? (
        <div className="birth-days">
          <div className="birth-week">
            {WEEK.map((day, index) => (
              <span key={`${day}-${index}`}>{day}</span>
            ))}
          </div>
          <div className="birth-grid">
            {days.map((day, index) =>
              day ? (
                <button
                  key={`${year}-${month}-${day}`}
                  type="button"
                  className={picked && picked.year === year && picked.month === month && picked.day === day ? 'on' : ''}
                  onClick={() => onChange(isoOf(year, month, day))}
                >
                  {day}
                </button>
              ) : (
                <span key={`e-${index}`} />
              ),
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}
