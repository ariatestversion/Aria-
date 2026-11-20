/** Age bounds for the birthday calendar (7–120 years). */
export function birthRange() {
  const today = new Date()
  const max = new Date(today.getFullYear() - 7, today.getMonth(), today.getDate())
  const min = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate())
  const iso = (date: Date) => {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
  return { min: iso(min), max: iso(max) }
}
