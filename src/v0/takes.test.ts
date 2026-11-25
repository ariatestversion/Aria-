import { describe, expect, it } from 'vitest'
import type { Take } from './model'
import { comparability, comparableGroup, takeMeta, takesOfSession } from './takes'

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
