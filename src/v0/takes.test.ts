import { describe, expect, it } from 'vitest'
import type { Take } from './model'
import { DEFAULT_PASSAGE, comparability, comparableGroup, sessionReferenceBpm, sessionTakePassage, takeMeta, takeTempo, takesOfSession } from './takes'
import { buildProgram } from './pedagogy'

const t = (patch: Partial<Take>): Take => ({
  id: 'x',
  email: 'a@b',
  pieceId: 'p',
  passage: 'Intro',
  createdAt: '2026-11-25T10:00:00.000Z',
  seconds: 20,
  mime: 'audio/webm',
  sessionStartedAt: 'S1',
  bpm: 64,
  ...patch,
})
const fmt = (s: number) => `00:${String(s).padStart(2, '0')}`

describe('Sprint 07 · S7-07 — comparaison des prises (règles Phase 5)', () => {
  it('même séance, même passage, même tempo : comparables', () => {
    expect(comparability(t({ id: 'a' }), t({ id: 'b' })).ok).toBe(true)
  })
  it('même prise, tempo différent, passage différent : non comparables', () => {
    expect(comparability(t({ id: 'a' }), t({ id: 'a' }))).toEqual({ ok: false, reason: 'Il s’agit de la même prise.' })
    expect(comparability(t({ id: 'a' }), t({ id: 'b', bpm: 72 }))).toEqual({ ok: false, reason: 'Le tempo diffère.' })
    expect(comparability(t({ id: 'a' }), t({ id: 'b', passage: 'Refrain' }))).toEqual({ ok: false, reason: 'Le passage diffère.' })
  })
  it('métadonnées manquantes : écoute séparée, sans rien déduire (deux valeurs absentes ne suffisent pas)', () => {
    expect(comparability(t({ id: 'a', bpm: undefined }), t({ id: 'b', bpm: undefined })).ok).toBe(false)
    expect(comparability(t({ id: 'a', passage: '' }), t({ id: 'b', passage: '' })).ok).toBe(false)
    expect(comparability(t({ id: 'a', passage: 'Rythme' }), t({ id: 'b', passage: 'Rythme' })).ok).toBe(false)
    expect(comparability(t({ id: 'a', sessionStartedAt: undefined }), t({ id: 'b', sessionStartedAt: undefined })).ok).toBe(false)
  })
  it('séances différentes ou prise illisible : non comparables', () => {
    expect(comparability(t({ id: 'a' }), t({ id: 'b', sessionStartedAt: 'S2' })).ok).toBe(false)
    expect(comparability(t({ id: 'a' }), t({ id: 'b', unreadable: true })).ok).toBe(false)
  })
  it('groupe comparable : le plus grand groupe éligible, sinon aucun', () => {
    const g = comparableGroup([t({ id: 'a' }), t({ id: 'b' }), t({ id: 'c', bpm: 72 }), t({ id: 'd', bpm: undefined })])
    expect(g.map((x) => x.id)).toEqual(['a', 'b'])
    expect(comparableGroup([t({ id: 'a' }), t({ id: 'c', bpm: 72 })])).toEqual([])
  })
  it('métadonnées toujours dans l’ordre « passage · tempo · durée », valeurs inconnues explicites', () => {
    expect(takeMeta(t({}), fmt)).toBe('Intro · 64 BPM · 00:20')
    expect(takeMeta(t({ passage: '', bpm: undefined, seconds: 0 }), fmt)).toBe('passage non renseigné · tempo inconnu · durée inconnue')
  })
  it('séparation des prises entre deux séances d’un même morceau (anciennes prises rattachées par date)', () => {
    const takes = [
      t({ id: 'old1', sessionStartedAt: undefined, createdAt: '2026-11-20T10:05:00.000Z' }),
      t({ id: 'old2', sessionStartedAt: undefined, createdAt: '2026-11-21T10:05:00.000Z' }),
      t({ id: 'new', sessionStartedAt: 'S3' }),
    ]
    expect(takesOfSession(takes, '2026-11-20T10:00:00.000Z', '2026-11-21T10:00:00.000Z').map((x) => x.id)).toEqual(['old1'])
    expect(takesOfSession(takes, 'S3').map((x) => x.id)).toEqual(['new'])
  })
})

describe('Sprint 09 · S09-D-01 — passage par défaut « Morceau entier »', () => {
  it('prise de séance sans passage saisi : « Morceau entier » ; passage saisi conservé ; hors séance : rien', () => {
    expect(sessionTakePassage('', true)).toBe(DEFAULT_PASSAGE)
    expect(sessionTakePassage('   ', true)).toBe(DEFAULT_PASSAGE)
    expect(sessionTakePassage(undefined, true)).toBe(DEFAULT_PASSAGE)
    expect(sessionTakePassage('Refrain', true)).toBe('Refrain')
    expect(sessionTakePassage('', false)).toBe('')
  })
  it('deux prises « Morceau entier » de la même séance et du même tempo : comparables ; métadonnées explicites', () => {
    const a = t({ id: 'a', passage: DEFAULT_PASSAGE })
    const b = t({ id: 'b', passage: DEFAULT_PASSAGE })
    expect(comparability(a, b).ok).toBe(true)
    expect(comparableGroup([a, b]).length).toBe(2)
    expect(takeMeta(a, fmt)).toBe('Morceau entier · 64 BPM · 00:20')
  })
  it('« Morceau entier » et un passage saisi : non comparables ; anciennes prises sans passage : toujours non comparables', () => {
    expect(comparability(t({ id: 'a', passage: DEFAULT_PASSAGE }), t({ id: 'b', passage: 'Intro' }))).toEqual({ ok: false, reason: 'Le passage diffère.' })
    expect(comparability(t({ id: 'a', passage: '' }), t({ id: 'b', passage: '' })).ok).toBe(false)
  })
})

describe('Sprint 09 · S09-QA-02 — tempo de référence et tempo joué', () => {
  const program = buildProgram({ instrument: 'piano', level: 'beginner', minutes: 15, goals: ['Rythme'], passage: '', resource: 'ear', difficulties: '' } as Parameters<typeof buildProgram>[0])
  const record = program.steps.findIndex((s) => s.kind === 'record')
  const s = (patch: Partial<Take>) => t({ passage: DEFAULT_PASSAGE, bpm: undefined, ...patch })

  it('« Prise de contrôle » sans consigne de tempo : référence = tempo de travail de la séance', () => {
    expect(program.steps[record].bpm).toBeUndefined()
    expect(sessionReferenceBpm(program, record)).toBe(60)
    expect(sessionReferenceBpm(program, 0)).toBe(60)
    expect(sessionReferenceBpm({ steps: [{ ...program.steps[0], bpm: undefined }] }, 0)).toBeUndefined()
    expect(sessionReferenceBpm(null, 0)).toBeUndefined()
  })
  it('sans métronome, la prise garde le tempo de référence, jamais présenté comme tempo joué', () => {
    expect(takeTempo(undefined, 60, true)).toEqual({ bpm: undefined, refBpm: 60, tempoSource: 'reference' })
    expect(takeTempo(64, 60, true)).toEqual({ bpm: 64, refBpm: 60, tempoSource: 'metronome' })
    expect(takeTempo(undefined, undefined, true)).toEqual({ bpm: undefined, refBpm: undefined, tempoSource: 'free' })
    expect(takeTempo(undefined, undefined, false)).toEqual({ bpm: undefined, refBpm: undefined, tempoSource: undefined })
    expect(takeMeta(s({ ...takeTempo(undefined, 60, true), seconds: 5 }), fmt)).toBe('Morceau entier · réf. 60 BPM, sans métronome · 00:05')
    expect(takeMeta(s({ ...takeTempo(64, 60, true), seconds: 5 }), fmt)).toBe('Morceau entier · 64 BPM · 00:05')
    expect(takeMeta(s({ tempoSource: 'free', seconds: 5 }), fmt)).toBe('Morceau entier · tempo libre · 00:05')
  })
  it('deux prises à « Prise de contrôle » sans métronome : comparables', () => {
    const a = s({ id: 'a', ...takeTempo(undefined, 60, true) })
    const b = s({ id: 'b', ...takeTempo(undefined, 60, true) })
    expect(comparability(a, b)).toEqual({ ok: true })
    expect(comparableGroup([a, b]).map((x) => x.id)).toEqual(['a', 'b'])
  })
  it('séance sans tempo, sans métronome : deux prises « tempo libre » comparables', () => {
    expect(comparability(s({ id: 'a', tempoSource: 'free' }), s({ id: 'b', tempoSource: 'free' }))).toEqual({ ok: true })
  })
  it('règles préservées : origine ou valeur de tempo différente, autre séance, autre passage', () => {
    const ref = s({ id: 'a', ...takeTempo(undefined, 60, true) })
    expect(comparability(ref, s({ id: 'b', ...takeTempo(60, 60, true) }))).toEqual({ ok: false, reason: 'Une seule des deux prises a été faite avec le métronome.' })
    expect(comparability(s({ id: 'a', ...takeTempo(60, 60, true) }), s({ id: 'b', ...takeTempo(64, 60, true) }))).toEqual({ ok: false, reason: 'Le tempo diffère.' })
    expect(comparability(ref, s({ id: 'b', ...takeTempo(undefined, 64, true) }))).toEqual({ ok: false, reason: 'Le tempo diffère.' })
    expect(comparability(ref, s({ id: 'b', tempoSource: 'free' }))).toEqual({ ok: false, reason: 'Le tempo diffère.' })
    expect(comparability(ref, s({ id: 'b', ...takeTempo(undefined, 60, true), sessionStartedAt: 'S2' })).ok).toBe(false)
    expect(comparability(ref, s({ id: 'b', ...takeTempo(undefined, 60, true), passage: 'Refrain' })).ok).toBe(false)
    const g = comparableGroup([ref, s({ id: 'b', ...takeTempo(undefined, 60, true) }), s({ id: 'c', ...takeTempo(64, 60, true) })])
    expect(g.map((x) => x.id)).toEqual(['a', 'b'])
  })
  it('données historiques intactes : anciennes prises lues comme avant, sans tempo jamais comparées', () => {
    expect(comparability(t({ id: 'a', bpm: 64 }), t({ id: 'b', bpm: 64 }))).toEqual({ ok: true })
    expect(comparability(t({ id: 'a', bpm: undefined }), t({ id: 'b', bpm: undefined })).ok).toBe(false)
    expect(takeMeta(t({ bpm: 64 }), fmt)).toBe('Intro · 64 BPM · 00:20')
  })
})
