import type { Take } from './model'
import { passageLabel } from './pedagogy'

/**
 * Prises — règles du Sprint 07 (dossier Phase 5, S7-07).
 *
 * Deux prises ne sont comparables que si elles sont distinctes, lisibles, de la même séance,
 * du même passage identifié et du même tempo connu. Rien n’est déduit : une valeur absente
 * rend la comparaison impossible (écoute séparée). La durée est informative seulement.
 */

export function takePassage(t: Pick<Take, 'passage'>) {
  return passageLabel(t.passage)
}

/** « passage · tempo · durée », toujours dans cet ordre, avec des valeurs inconnues explicites. */
export function takeMeta(t: Pick<Take, 'passage' | 'bpm' | 'seconds'>, fmt: (s: number) => string) {
  const passage = takePassage(t) || 'passage non renseigné'
  const tempo = typeof t.bpm === 'number' && t.bpm > 0 ? `${t.bpm} BPM` : 'tempo inconnu'
  const duration = t.seconds > 0 ? fmt(t.seconds) : 'durée inconnue'
  return `${passage} · ${tempo} · ${duration}`
}

export type Comparability = { ok: true } | { ok: false; reason: string }

export function comparability(a: Take, b: Take): Comparability {
  if (a.id === b.id) return { ok: false, reason: 'Il s’agit de la même prise.' }
  if (a.unreadable || b.unreadable) return { ok: false, reason: 'Une des prises est illisible.' }
  if (!a.sessionStartedAt || !b.sessionStartedAt || a.sessionStartedAt !== b.sessionStartedAt)
    return { ok: false, reason: 'Les prises n’appartiennent pas à la même séance.' }
  const pa = takePassage(a)
  const pb = takePassage(b)
  if (!pa || !pb) return { ok: false, reason: 'Le passage n’est pas renseigné.' }
  if (pa !== pb) return { ok: false, reason: 'Le passage diffère.' }
  if (!(typeof a.bpm === 'number' && a.bpm > 0) || !(typeof b.bpm === 'number' && b.bpm > 0))
    return { ok: false, reason: 'Le tempo n’est pas connu.' }
  if (a.bpm !== b.bpm) return { ok: false, reason: 'Le tempo diffère.' }
  return { ok: true }
}

/** Plus grand groupe de prises comparables entre elles (même séance, passage, tempo). */
export function comparableGroup(takes: Take[]): Take[] {
  const groups = new Map<string, Take[]>()
  for (const t of takes) {
    const p = takePassage(t)
    if (t.unreadable || !t.sessionStartedAt || !p || !(typeof t.bpm === 'number' && t.bpm > 0)) continue
    const key = `${t.sessionStartedAt}|${p}|${t.bpm}`
    groups.set(key, [...(groups.get(key) || []), t])
  }
  let best: Take[] = []
  for (const g of groups.values()) if (g.length > best.length) best = g
  return best.length >= 2 ? best : []
}

/** Raison affichée quand plusieurs prises ne sont pas comparables. */
export function nonComparableReason(takes: Take[]): string {
  if (takes.length < 2) return ''
  const r = comparability(takes[0], takes[1])
  return r.ok ? '' : r.reason
}

/**
 * Prises d’une séance. Les prises récentes portent l’identifiant de séance ; les anciennes
 * sont rattachées par leur date, entre le début de la séance et le début de la séance suivante.
 */
export function takesOfSession(takes: Take[], sessionStartedAt: string, nextSessionStartedAt?: string) {
  if (!sessionStartedAt) return []
  return takes.filter((t) =>
    t.sessionStartedAt
      ? t.sessionStartedAt === sessionStartedAt
      : t.createdAt >= sessionStartedAt && (!nextSessionStartedAt || t.createdAt < nextSessionStartedAt),
  )
}
