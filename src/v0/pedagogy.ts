import type { InstrumentId, LevelId, Piece, WorkProgram, WorkProgramStep } from './model'
import { newId } from './store'

function step(partial: Omit<WorkProgramStep, 'id'>): WorkProgramStep {
  return { id: newId('step'), ...partial }
}

/** Explicit, testable rules. Piano is fully specified; other instruments get honest limited support. */
export function buildProgram(input: {
  piece: Piece
  level: LevelId
  minutes: number
  objective: string
  difficulties: string
  instrument: InstrumentId
}): WorkProgram {
  const minutes = Math.max(10, Math.min(90, input.minutes || 25))
  const objective = input.objective.trim() || 'Travailler avec précision et régularité'
  const hard = input.difficulties.trim().toLowerCase()
  const passage = input.piece.passages.trim() || 'le passage choisi'
  const steps: WorkProgramStep[] = []

  if (input.instrument === 'piano') {
    steps.push(
      step({
        title: 'Mise en place',
        what: `Installer la posture et lire ${passage} sans tempo forcé.`,
        how: 'Assis stable, mains détendues, jouer les notes à vitesse lente, une main après l’autre si besoin.',
        why: 'Une base claire évite de graver les tensions.',
        success: 'Tu joues le passage une fois sans t’arrêter, même très lentement.',
      }),
    )
    if (hard.includes('rythme') || hard.includes('tempo')) {
      steps.push(
        step({
          title: 'Rythme isolé',
          what: 'Fixer le rythme du passage avant la vitesse.',
          how: 'Compter à voix haute ou taper la pulsation, puis jouer sur cette pulsation uniquement.',
          why: 'Le rythme stable porte ensuite la justesse et le phrasé.',
          success: 'Deux passages d’affilée restent alignés sur la pulsation choisie.',
        }),
      )
    } else if (hard.includes('justesse') || hard.includes('fausse') || hard.includes('note')) {
      steps.push(
        step({
          title: 'Notes cibles',
          what: 'Sécuriser les notes fragiles du passage.',
          how: 'Jouer seulement les mesures concernées, nommer les notes, répéter trois fois juste.',
          why: 'Corriger tôt empêche de répéter l’erreur dans la prise.',
          success: 'Les notes ciblées sont justes trois fois de suite.',
        }),
      )
    } else {
      steps.push(
        step({
          title: 'Lien des phrases',
          what: `Relier ${passage} sans rupture.`,
          how: 'Chevaucher la fin d’une cellule et le début de la suivante à tempo réduit.',
          why: 'La continuité rend le morceau jouable en prise complète.',
          success: 'Une enchaînement complet sans pause involontaire.',
        }),
      )
    }
    if (input.level === 'beginner') {
      steps.push(
        step({
          title: 'Petite prise',
          what: 'Enregistrer une prise courte du passage travaillé.',
          how: 'Une seule prise, tempo confortable, puis écoute immédiate.',
          why: 'L’écoute révèle ce que les mains ne sentent pas encore.',
          success: 'Tu as une prise réécoutée et une observation écrite.',
        }),
      )
    } else {
      steps.push(
        step({
          title: 'Prise utile',
          what: 'Enregistrer le passage dans les conditions de jeu visées.',
          how: 'Deux prises max. Garder la plus claire.',
          why: 'Comparer deux prises oriente la prochaine séance.',
          success: 'Une prise sauvegardée et une prochaine étape précise.',
        }),
      )
    }
  } else {
    steps.push(
      step({
        title: 'Cadre de séance',
        what: `Travailler ${passage} avec l’objectif : ${objective}.`,
        how: 'Découper en cellules courtes, répéter lentement, puis assembler.',
        why: 'Règle générale Aria V0 — les consignes détaillées piano ne s’appliquent pas encore à cet instrument.',
        success: 'Tu as joué le passage au moins deux fois sans perdre le fil.',
      }),
      step({
        title: 'Observation',
        what: 'Noter ce qui fonctionne et ce qui bloque.',
        how: 'Après une prise, écrire une phrase pour chaque point.',
        why: 'Sans analyse audio automatique, ton observation guide la suite.',
        success: 'Deux observations écrites et une prochaine étape.',
      }),
    )
  }

  if (minutes >= 40 && input.instrument === 'piano') {
    steps.splice(
      2,
      0,
      step({
        title: 'Tempo progressif',
        what: 'Monter le tempo par paliers.',
        how: 'Trois passages à tempo A, puis +5–10 % si c’est stable.',
        why: 'La vitesse vient après la clarté.',
        success: 'Le tempo cible reste propre sur un passage entier.',
      }),
    )
  }

  return {
    steps,
    objective,
    minutes,
    difficulties: input.difficulties.trim(),
    updatedAt: new Date().toISOString(),
    stepIndex: input.piece.program?.stepIndex ?? 0,
  }
}

export function buildReview(input: {
  works: string
  improve: string
  programObjective: string
  instrument: InstrumentId
}) {
  const works = input.works.trim()
  const improve = input.improve.trim()
  const next =
    improve
      ? `Prochaine séance : reprendre « ${improve} » avant d’élargir le passage.`
      : `Prochaine séance : consolider l’objectif « ${input.programObjective} » sur une prise courte.`

  return {
    works: works || 'Non renseigné — ajoute ce qui t’a semblé solide à l’écoute.',
    improve: improve || 'Non renseigné — ajoute ce que tu veux corriger en priorité.',
    next,
    disclaimer:
      input.instrument === 'piano'
        ? 'Recommandations pédagogiques à partir de tes observations et des règles piano V0. Ce n’est pas une analyse audio.'
        : 'Recommandations générales V0. Cet instrument n’a pas encore de règles pédagogiques détaillées. Ce n’est pas une analyse audio.',
  }
}
