import { describe, expect, it } from 'vitest'
import type { Piece } from './model'
import { allocateMinutes, buildProgram, buildReview, focusOf, prepGoalsFor } from './pedagogy'
import { canCompleteSession } from './store'

const piece = (patch: Partial<Piece> = {}): Piece => ({
  id: 'p1',
  email: 'test@aria.local',
  title: 'Ma chanson',
  artist: '',
  instrument: 'guitar',
  genre: 'Pop',
  objective: '',
  passages: '',
  notes: '',
  resources: [],
  program: null,
  createdAt: '2026-11-20T00:00:00.000Z',
  updatedAt: '2026-11-20T00:00:00.000Z',
  lastWorkedAt: null,
  ...patch,
})

describe('scénario de référence : guitariste autodidacte, 15 min, rythme, sans partition', () => {
  const program = buildProgram({
    piece: piece(),
    instrument: 'guitar',
    level: 'beginner',
    minutes: 15,
    goals: ['Rythme'],
    passage: 'Couplet',
    resource: 'ear',
    difficulties: '',
  })

  it('tient exactement dans les 15 minutes', () => {
    expect(program.steps.reduce((a, s) => a + (s.minutes || 0), 0)).toBe(15)
  })

  it('propose 4 étapes concrètes avec consigne, durée et critère observable', () => {
    expect(program.steps).toHaveLength(4)
    for (const s of program.steps) {
      expect(s.what.length).toBeGreaterThan(20)
      expect(s.success.length).toBeGreaterThan(15)
      expect(s.minutes).toBeGreaterThanOrEqual(2)
    }
  })

  it('travaille réellement le rythme à la guitare, sans supposer de partition', () => {
    const text = program.steps.map((s) => `${s.title} ${s.what} ${s.how}`).join(' ')
    expect(text).toMatch(/main droite/i)
    expect(text).toMatch(/métronome à 60 BPM/)
    expect(text).toMatch(/accord/)
    expect(text).not.toMatch(/partition/i)
    expect(program.steps.at(-1)?.kind).toBe('record')
  })

  it('conserve le contexte de préparation', () => {
    expect(program).toMatchObject({ instrument: 'guitar', level: 'beginner', resource: 'ear', passage: 'Couplet', stepIndex: 0 })
    expect(program.goals).toEqual(['Rythme'])
  })
})

describe('personnalisation', () => {
  it('reprend les objectifs de l’onboarding à la préparation (correctif Sprint 04)', () => {
    expect(prepGoalsFor(piece(), ['Justesse', 'Tempo'])).toEqual(['Justesse', 'Tempo'])
    expect(prepGoalsFor(piece({ objective: 'Mémoire' }), ['Justesse', 'Tempo'])).toEqual(['Mémoire', 'Justesse'])
    expect(prepGoalsFor(piece({ objective: 'texte libre' }), ['Rythme'])).toEqual(['Rythme'])
  })

  it('adapte le tempo de départ au niveau', () => {
    const bpm = (level: 'beginner' | 'practicing' | 'advanced') =>
      buildProgram({ piece: piece(), instrument: 'guitar', level, minutes: 20, goals: ['Rythme'], passage: '', resource: 'ear', difficulties: '' }).steps[0].bpm
    expect(bpm('beginner')).toBe(60)
    expect(bpm('practicing')).toBe(72)
    expect(bpm('advanced')).toBe(84)
  })

  it('ajoute une étape pour l’objectif secondaire quand le temps le permet', () => {
    const p = buildProgram({ piece: piece({ instrument: 'piano' }), instrument: 'piano', level: 'practicing', minutes: 45, goals: ['Justesse', 'Tempo'], passage: '', resource: 'score', difficulties: '' })
    expect(p.steps).toHaveLength(5)
    expect(p.steps.reduce((a, s) => a + (s.minutes || 0), 0)).toBe(45)
    expect(p.steps.map((s) => s.title)).toContain('Paliers de tempo')
  })

  it('ne se limite pas au piano : chaque instrument reçoit un programme', () => {
    for (const instrument of ['piano', 'guitar', 'bass', 'voice', 'drums', 'other'] as const) {
      const p = buildProgram({ piece: piece({ instrument }), instrument, level: 'beginner', minutes: 20, goals: ['Rythme'], passage: '', resource: 'ear', difficulties: '' })
      expect(p.steps.length).toBeGreaterThanOrEqual(4)
    }
  })

  it('signale honnêtement une partition choisie mais absente', () => {
    const p = buildProgram({ piece: piece(), instrument: 'guitar', level: 'beginner', minutes: 20, goals: ['Rythme'], passage: '', resource: 'score', difficulties: '' })
    expect(p.notes?.join(' ')).toMatch(/Aucune partition importée/)
  })

  it('reconnaît les axes à partir du texte libre', () => {
    expect(focusOf('Le rythme décroche')).toBe('rhythm')
    expect(focusOf('des notes fausses')).toBe('accuracy')
    expect(focusOf('je l’oublie par cœur')).toBe('memory')
    expect(focusOf('changement d’accord pas fluide')).toBe('expression')
  })
})

describe('allocateMinutes', () => {
  it('répartit des minutes entières dont la somme est exacte', () => {
    for (const total of [10, 15, 20, 30, 45, 60, 90]) {
      const out = allocateMinutes(total, [0.2, 0.35, 0.25, 0.2])
      expect(out.reduce((a, b) => a + b, 0)).toBe(total)
      expect(Math.min(...out)).toBeGreaterThanOrEqual(2)
    }
  })
})

describe('bilan', () => {
  it('n’invente rien : sans observation, les rubriques restent « non renseigné »', () => {
    const r = buildReview({ works: '', improve: '', programObjective: 'Rythme', instrument: 'guitar' })
    expect(r.works.empty).toBe(true)
    expect(r.improve.empty).toBe(true)
    expect(r.analysis).toMatch(/Analyse automatique : aucune/)
    const { analysis: _disclaimer, ...content } = r
    void _disclaimer
    expect(JSON.stringify(content)).not.toMatch(/score|%|\/10|erreur détectée/i)
  })

  it('distingue les sources : observation, auto-évaluation, règles, données', () => {
    const r = buildReview({
      works: 'Main droite régulière',
      improve: '',
      programObjective: 'Rythme',
      instrument: 'guitar',
      steps: [
        { title: 'A', check: 'ok' },
        { title: 'B', check: 'retry' },
      ],
      takes: [{ seconds: 12 }, { seconds: 8 }],
    })
    expect(r.works.source).toBe('user')
    expect(r.improve.source).toBe('self-check')
    expect(r.corrective.source).toBe('rules')
    expect(r.next.source).toBe('rules')
    expect(r.next.text).toMatch(/« B »/)
    expect(r.facts.text).toBe('2 prises enregistrées · 20 s au total.')
  })

  it('propose un exercice correctif lié à la difficulté notée', () => {
    const r = buildReview({ works: '', improve: 'le rythme décroche au changement d’accord', programObjective: 'Justesse', instrument: 'guitar', level: 'beginner' })
    expect(r.corrective.title).toMatch(/Motif rythmique/)
    expect(r.corrective.text).toMatch(/52 BPM/)
  })
})

describe('séances terminées / brouillons', () => {
  it('une séance vide ne peut pas être terminée', () => {
    expect(canCompleteSession({ takeIds: [], observationWorks: '', observationImprove: ' ' })).toBe(false)
    expect(canCompleteSession({ takeIds: ['t1'], observationWorks: '', observationImprove: '' })).toBe(true)
    expect(canCompleteSession({ takeIds: [], observationWorks: 'ok', observationImprove: '' })).toBe(true)
  })
})
