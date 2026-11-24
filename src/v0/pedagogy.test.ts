import { describe, expect, it } from 'vitest'
import type { Piece, SessionLog } from './model'
import { allocateMinutes, buildProgram, buildReview, continuedBpm, planFollowup, defaultResource, focusOf, passageLabel, prepGoalsFor, previousSessionFrom, resourceAvailable } from './pedagogy'
import { canCompleteSession, dedupeSessionLogs } from './store'

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
    // Étapes sans contenu détaillé : la reprise suit l’axe de l’objectif, en citant l’étape jugée à reprendre.
    expect(r.followup?.reason).toMatch(/« B »/)
    expect(r.next.text).toContain(`« ${r.followup?.title} »`)
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

describe('non-régression Sprint 04 — recette indépendante', () => {
  it('morceau sans ressource : « À l’oreille, sans support » par défaut, même si le profil dit « Partition »', () => {
    expect(defaultResource(piece(), ['score'])).toBe('ear')
    expect(defaultResource(piece(), ['tabs', 'chords'])).toBe('ear')
  })

  it('le support par défaut suit ce qui est réellement importé', () => {
    const withPdf = piece({ resources: [{ id: 'r1', kind: 'pdf', label: 'partition.pdf' }] })
    const withChords = piece({ resources: [{ id: 'r2', kind: 'chords', label: 'Am F C G', text: 'Am F C G' }] })
    const demoOnly = piece({ resources: [{ id: 'r3', kind: 'pdf', label: 'démo', demo: true }] })
    expect(defaultResource(withPdf, ['score'])).toBe('score')
    expect(defaultResource(withChords, ['score'])).toBe('chords')
    expect(defaultResource(demoOnly, ['score'])).toBe('ear')
    expect(resourceAvailable(piece(), 'score')).toBe(false)
  })

  it('bilan sans prise de référence : proposer une première prise, sans inviter à comparer', () => {
    for (const input of [
      { improve: '' },
      { improve: 'le rythme décroche' },
      { improve: '', steps: [{ title: 'Motif', check: 'retry' as const }] },
    ]) {
      const r = buildReview({ works: '', programObjective: 'Rythme', instrument: 'guitar', takes: [], hasReferenceTake: false, ...input })
      expect(r.next.text).toMatch(/première prise/)
      expect(r.next.text).not.toMatch(/compare-la|précédente/)
    }
  })

  it('bilan avec une prise de référence : inviter à comparer', () => {
    const r = buildReview({ works: '', improve: 'le rythme décroche', programObjective: 'Rythme', instrument: 'guitar', takes: [], hasReferenceTake: true })
    expect(r.next.text).toMatch(/compare-la à la précédente/)
  })
})

describe('brouillon repris puis terminé', () => {
  const log = (patch: Partial<SessionLog>): SessionLog => ({
    id: 'l',
    email: 'test@aria.local',
    pieceId: 'p1',
    createdAt: '2026-11-20T10:00:00.000Z',
    minutes: 15,
    objective: 'Rythme',
    observationWorks: '',
    observationImprove: '',
    nextStep: '',
    takeIds: [],
    source: 'user',
    status: 'draft',
    ...patch,
  })

  it('le brouillon de la séance terminée disparaît, les autres brouillons restent', () => {
    const logs = dedupeSessionLogs([
      log({ id: 'done', status: 'completed', sessionStartedAt: 'S1', createdAt: '2026-11-20T10:30:00.000Z' }),
      log({ id: 'draft-same', status: 'draft', sessionStartedAt: 'S1' }),
      log({ id: 'draft-other-piece', pieceId: 'p2', status: 'draft', sessionStartedAt: 'S2' }),
      log({ id: 'draft-other-session', status: 'draft', sessionStartedAt: 'S0' }),
    ])
    expect(logs.map((l) => l.id)).toEqual(['done', 'draft-other-piece', 'draft-other-session'])
  })
})

describe('corrections pédagogiques de clôture (V0.4)', () => {
  const nextFor = (programObjective: string) =>
    buildReview({ works: '', improve: '', programObjective, instrument: 'guitar', takes: [], hasReferenceTake: true }).next.text

  it('le conseil par défaut suit l’objectif : pas de « monte le tempo » pour la justesse', () => {
    expect(nextFor('Justesse')).not.toMatch(/tempo|BPM/)
    expect(nextFor('Justesse')).toMatch(/note fragile/)
    expect(nextFor('Mémoire')).toMatch(/sans regarder ton support/)
    expect(nextFor('Fluidité et expression')).toMatch(/enchaînements/)
    // Sprint 05 : sans étape notée « réussie », le tempo ne monte pas (cohérent avec la séance suivante).
    expect(nextFor('Rythme')).toMatch(/même tempo/)
    expect(nextFor('Tempo')).toMatch(/même tempo/)
  })

  it('reprise d’une étape : pas de BPM imposé hors rythme / tempo', () => {
    const retry = (programObjective: string) =>
      buildReview({ works: '', improve: '', programObjective, instrument: 'guitar', steps: [{ title: 'X', check: 'retry' }], hasReferenceTake: true }).next.text
    expect(retry('Justesse')).not.toMatch(/BPM/)
    expect(retry('Rythme')).toMatch(/8 BPM plus lentement/)
  })

  it('le libellé de passage n’affiche jamais l’objectif à la place du passage', () => {
    expect(passageLabel('Justesse')).toBe('')
    expect(passageLabel('Passage')).toBe('')
    expect(passageLabel('')).toBe('')
    expect(passageLabel(undefined)).toBe('')
    expect(passageLabel('Refrain')).toBe('Refrain')
  })
})

describe('Sprint 05 — continuité entre séances', () => {
  const base = {
    piece: piece(),
    instrument: 'guitar' as const,
    level: 'beginner' as const,
    minutes: 20,
    goals: ['Rythme'],
    passage: 'Refrain',
    resource: 'ear' as const,
    difficulties: '',
  }
  const first = buildProgram(base)
  const firstBpm = Math.max(...first.steps.map((s) => s.bpm || 0))

  it('sans séance précédente, rien ne change', () => {
    const p = buildProgram({ ...base, previous: null })
    expect(p.steps.map((s) => s.title)).toEqual(first.steps.map((s) => s.title))
    expect(p.continuedFrom).toBeUndefined()
  })

  it('reprend en tête ce que l’utilisateur avait noté à corriger, avec sa note citée', () => {
    const previous = previousSessionFrom(
      { createdAt: '2026-11-23T18:00:00.000Z', objective: 'Rythme', observationImprove: 'je décroche au changement d’accord', stepChecks: [] },
      first,
    )
    const p = buildProgram({ ...base, previous })
    expect(p.steps[1].title.startsWith('Reprise ·')).toBe(true)
    expect(p.steps[1].what).toContain('je décroche au changement d’accord')
    expect(p.steps.reduce((a, s) => a + (s.minutes || 0), 0)).toBe(20)
    expect(p.continuedFrom).toBe('2026-11-23T18:00:00.000Z')
    expect(p.notes?.some((n) => n.startsWith('Suite de ta séance'))).toBe(true)
  })

  it('tempo : −8 BPM si une étape était à reprendre, +4 si tout était réussi', () => {
    const retry = previousSessionFrom(
      { createdAt: '2026-11-23T18:00:00.000Z', objective: 'Rythme', observationImprove: '', stepChecks: [{ title: first.steps[1].title, check: 'retry' }] },
      first,
    )
    const ok = previousSessionFrom(
      { createdAt: '2026-11-23T18:00:00.000Z', objective: 'Rythme', observationImprove: '', stepChecks: [{ title: first.steps[1].title, check: 'ok' }] },
      first,
    )
    expect(retry?.bpm).toBe(firstBpm)
    expect(continuedBpm(60, retry)).toBe(firstBpm - 8)
    expect(continuedBpm(60, ok)).toBe(firstBpm + 4)
    const pOk = buildProgram({ ...base, previous: ok })
    expect(pOk.steps[0].bpm).toBe(firstBpm + 4)
    expect(pOk.steps.some((s) => s.title.startsWith('Reprise ·'))).toBe(false)
  })

  it('ne touche pas au tempo hors Rythme / Tempo, et repart de zéro si l’objectif change', () => {
    const prev = previousSessionFrom(
      { createdAt: '2026-11-23T18:00:00.000Z', objective: 'Justesse', observationImprove: 'le si sonne mal', stepChecks: [{ title: 'x', check: 'ok' }] },
      null,
    )
    const same = buildProgram({ ...base, goals: ['Justesse'], previous: prev })
    expect(same.steps.every((s) => s.bpm === undefined)).toBe(true)
    expect(same.steps[1].what).toContain('le si sonne mal')
    const changed = buildProgram({ ...base, goals: ['Rythme'], previous: prev })
    expect(changed.steps.some((s) => s.title.startsWith('Reprise ·'))).toBe(false)
    expect(changed.notes?.some((n) => n.startsWith('Nouvel objectif'))).toBe(true)
  })

  it('la difficulté du jour reste attachée à l’étape principale, pas à la reprise', () => {
    const prev = previousSessionFrom(
      { createdAt: '2026-11-23T18:00:00.000Z', objective: 'Rythme', observationImprove: 'trop rapide', stepChecks: [] },
      first,
    )
    const p = buildProgram({ ...base, difficulties: 'main droite raide', previous: prev })
    expect(p.steps[1].what).not.toContain('main droite raide')
    expect(p.steps[2].what).toContain('main droite raide')
  })
})

describe('Sprint 05 — le conseil du bilan correspond à la séance suivante', () => {
  it('sans étape réussie, pas de « monte le tempo » (la séance suivante garde le même tempo)', () => {
    const r = buildReview({ works: '', improve: '', programObjective: 'Rythme', instrument: 'guitar', steps: [{ title: 'A' }], hasReferenceTake: true })
    expect(r.next.text).not.toMatch(/monte le tempo/)
    expect(r.next.text).toMatch(/même tempo/)
  })
  it('avec des étapes réussies, +4 BPM comme dans le programme suivant', () => {
    const r = buildReview({ works: '', improve: '', programObjective: 'Rythme', instrument: 'guitar', steps: [{ title: 'A', check: 'ok' }], hasReferenceTake: true })
    expect(r.next.text).toMatch(/monte le tempo de 4 BPM/)
  })
})

describe('Recette QA 24/11 — scénario Work : Blackbird, guitare, 15 min, rythme, intro, sans partition', () => {
  const blackbird = piece({ title: 'Blackbird', instrument: 'guitar' })
  const input = {
    piece: blackbird,
    instrument: 'guitar' as const,
    level: 'beginner' as const,
    minutes: 15,
    goals: ['Rythme'],
    passage: 'Intro',
    resource: 'ear' as const,
    difficulties: '',
  }
  const first = buildProgram(input)
  // « Main droite seule, cordes étouffées » marquée « Pas encore », séance terminée sans prise.
  const steps = first.steps.map((s, i) => (i === 0 ? { ...s, check: 'retry' as const } : s))
  const review = buildReview({ works: '', improve: '', programObjective: 'Rythme', instrument: 'guitar', level: 'beginner', steps, takes: [], hasReferenceTake: false })
  const log = {
    createdAt: '2026-11-24T18:00:00.000Z',
    objective: 'Rythme',
    observationImprove: '',
    stepChecks: [{ title: first.steps[0].title, check: 'retry' as const }],
    followup: review.followup,
  }
  const second = buildProgram({ ...input, previous: previousSessionFrom(log, first) })
  const base = (t: string) => t.replace(/^Reprise · /, '')

  it('le bilan reprend l’étape marquée « Pas encore », 8 BPM plus lentement', () => {
    expect(first.steps[0].title).toBe('Main droite seule, cordes étouffées')
    expect(review.followup?.title).toBe('Main droite seule, cordes étouffées')
    expect(review.followup?.bpm).toBe(52)
    expect(review.corrective.title).toBe('Main droite seule, cordes étouffées')
    expect(review.corrective.text).toContain('52 BPM')
    expect(review.next.text).toContain('« Main droite seule, cordes étouffées » à 52 BPM')
    // L’étape reprise est l’échauffement : la séance suivante commence par elle, et le bilan le dit.
    expect(review.next.text).toMatch(/^Prochaine séance : ARIA commence par/)
  })

  it('la séance suivante reprend exactement cet exercice (titre, consigne, critère, tempo)', () => {
    const reprise = second.steps.find((s) => s.title.startsWith('Reprise ·'))!
    expect(reprise.title).toBe('Reprise · Main droite seule, cordes étouffées')
    expect(reprise.what).toContain(review.followup!.what)
    expect(reprise.success).toBe(review.followup!.success)
    expect(reprise.bpm).toBe(review.followup!.bpm)
    expect(second.steps[0].title).toBe(reprise.title)
  })

  it('aucun exercice n’est répété dans la séance suivante', () => {
    const titles = second.steps.map((s) => base(s.title))
    expect(new Set(titles).size).toBe(titles.length)
    expect(titles.filter((t) => /Motif rythmique/.test(t)).length).toBe(1)
    expect(second.steps.reduce((a, s) => a + (s.minutes || 0), 0)).toBe(15)
  })

  it('point noté « à travailler » sur le même axe : l’étape est remplacée, pas dupliquée', () => {
    const r = buildReview({ works: '', improve: 'le rythme décroche', programObjective: 'Rythme', instrument: 'guitar', level: 'beginner', steps: first.steps, hasReferenceTake: true })
    expect(r.followup?.title).toBe('Motif rythmique sur un seul accord')
    const p = buildProgram({ ...input, previous: previousSessionFrom({ ...log, stepChecks: [], observationImprove: 'le rythme décroche', followup: r.followup }, first) })
    const titles = p.steps.map((s) => base(s.title))
    expect(new Set(titles).size).toBe(titles.length)
    expect(p.steps[1].title).toBe('Reprise · Motif rythmique sur un seul accord')
    expect(r.next.text).toContain('après l’échauffement, ARIA reprend « Motif rythmique sur un seul accord » à 52 BPM')
    expect(p.steps[1].bpm).toBe(52)
  })

  it('rien à reprendre : pas d’exercice correctif annoncé ni de reprise', () => {
    const r = buildReview({ works: 'ok', improve: '', programObjective: 'Rythme', instrument: 'guitar', steps: first.steps.map((s) => ({ ...s, check: 'ok' as const })), hasReferenceTake: true })
    expect(r.followup).toBeNull()
    expect(r.corrective.empty).toBe(true)
    expect(planFollowup({ improve: '', objective: 'Rythme', instrument: 'guitar', level: 'beginner', steps: [] })).toBeNull()
  })
})
