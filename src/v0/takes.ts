import type { Take, WorkProgram } from './model'
import { passageLabel } from './pedagogy'

/**
 * Prises — règles du Sprint 07 (dossier Phase 5, S7-07).
 *
 * Deux prises ne sont comparables que si elles sont distinctes, lisibles, de la même séance,
 * du même passage identifié et du même tempo connu. Rien n’est déduit : une valeur absente
 * rend la comparaison impossible (écoute séparée). La durée est informative seulement.
 * Sprint 09 · S09-QA-02 : le tempo joué (métronome) et le tempo de référence (consigne) sont distingués ;
 * deux prises ne se comparent qu’avec un tempo de même origine et de même valeur.
 */

/**
 * Sprint 09 · S09-D-01 — passage retenu pour une prise de séance quand aucun passage n’est saisi.
 * C’est un choix explicite (le morceau entier est travaillé), pas une valeur déduite : les prises
 * d’une même séance sans passage saisi deviennent comparables entre elles. Les anciennes prises
 * sans passage restent non comparables.
 */
export const DEFAULT_PASSAGE = 'Morceau entier'

/** Passage enregistré avec une prise : celui saisi, sinon « Morceau entier » pour une prise de séance. */
export function sessionTakePassage(saisi: string | undefined, inSession: boolean) {
  const p = (saisi || '').trim()
  return p || (inSession ? DEFAULT_PASSAGE : '')
}

/**
 * Sprint 09 · S09-QA-02 — tempo de référence de la séance pour l’étape en cours : celui de sa consigne,
 * sinon le tempo de travail des étapes précédentes, sinon celui des étapes suivantes. Absent si la séance
 * ne travaille aucun tempo. C’est un tempo conseillé, jamais une mesure de ce qui a été joué.
 */
export function sessionReferenceBpm(program: Pick<WorkProgram, 'steps'> | null | undefined, stepIndex: number) {
  const steps = program?.steps || []
  if (!steps.length) return undefined
  const i = Math.max(0, Math.min(stepIndex, steps.length - 1))
  const ok = (b?: number) => typeof b === 'number' && b > 0
  if (ok(steps[i].bpm)) return steps[i].bpm
  for (let j = i - 1; j >= 0; j--) if (ok(steps[j].bpm)) return steps[j].bpm
  for (let j = i + 1; j < steps.length; j++) if (ok(steps[j].bpm)) return steps[j].bpm
  return undefined
}

/** Tempo enregistré avec une prise : tempo joué (métronome) ou, à défaut, tempo de référence ou libre. */
export function takeTempo(metronomeBpm: number | undefined, refBpm: number | undefined, inSession: boolean): Pick<Take, 'bpm' | 'refBpm' | 'tempoSource'> {
  if (typeof metronomeBpm === 'number' && metronomeBpm > 0) return { bpm: metronomeBpm, refBpm, tempoSource: 'metronome' }
  if (inSession && typeof refBpm === 'number' && refBpm > 0) return { bpm: undefined, refBpm, tempoSource: 'reference' }
  return { bpm: undefined, refBpm: undefined, tempoSource: inSession ? 'free' : undefined }
}

/**
 * Clé de tempo utilisée pour comparer : deux prises ne se comparent que si leur tempo a la même origine
 * et la même valeur (métronome à 60 avec métronome à 60, référence 60 avec référence 60, libre avec libre).
 * Prises antérieures au Sprint 09 : leur tempo enregistré, comme avant. Inconnu : `null`.
 */
export function tempoKey(t: Pick<Take, 'bpm' | 'refBpm' | 'tempoSource'>): string | null {
  const ok = (b?: number) => typeof b === 'number' && b > 0
  if (t.tempoSource === 'metronome') return ok(t.bpm) ? `metronome:${t.bpm}` : null
  if (t.tempoSource === 'reference') return ok(t.refBpm) ? `reference:${t.refBpm}` : null
  if (t.tempoSource === 'free') return 'free'
  return ok(t.bpm) ? `legacy:${t.bpm}` : null
}

/** Libellé du tempo d’une prise, qui distingue le tempo joué au métronome du tempo de référence. */
export function tempoLabel(t: Pick<Take, 'bpm' | 'refBpm' | 'tempoSource'>) {
  const key = tempoKey(t)
  if (!key) return 'tempo inconnu'
  if (t.tempoSource === 'reference') return `réf. ${t.refBpm} BPM, sans métronome`
  if (t.tempoSource === 'free') return 'tempo libre'
  return `${t.bpm} BPM`
}

export function takePassage(t: Pick<Take, 'passage'>) {
  return passageLabel(t.passage)
}

/** « passage · tempo · durée », toujours dans cet ordre, avec des valeurs inconnues explicites. */
export function takeMeta(t: Pick<Take, 'passage' | 'bpm' | 'refBpm' | 'tempoSource' | 'seconds'>, fmt: (s: number) => string) {
  const passage = takePassage(t) || 'passage non renseigné'
  const tempo = tempoLabel(t)
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
  const ka = tempoKey(a)
  const kb = tempoKey(b)
  if (!ka || !kb) return { ok: false, reason: 'Le tempo n’est pas connu.' }
  if (ka !== kb) {
    // Même valeur, origine différente : on le dit, plutôt que d’annoncer un tempo différent.
    const value = (t: Take) => (t.tempoSource === 'reference' ? t.refBpm : t.bpm)
    const oneMetronome = (a.tempoSource === 'metronome') !== (b.tempoSource === 'metronome')
    if (oneMetronome && value(a) === value(b)) return { ok: false, reason: 'Une seule des deux prises a été faite avec le métronome.' }
    return { ok: false, reason: 'Le tempo diffère.' }
  }
  return { ok: true }
}

/** Plus grand groupe de prises comparables entre elles (même séance, passage, tempo). */
export function comparableGroup(takes: Take[]): Take[] {
  const groups = new Map<string, Take[]>()
  for (const t of takes) {
    const p = takePassage(t)
    const k = tempoKey(t)
    if (t.unreadable || !t.sessionStartedAt || !p || !k) continue
    const key = `${t.sessionStartedAt}|${p}|${k}`
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
