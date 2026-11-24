import type {
  HabitId,
  InstrumentId,
  LevelId,
  Piece,
  ResourceMode,
  StepCheck,
  StepKind,
  WorkProgram,
  WorkProgramStep,
} from './model'
import { OBJECTIVES } from './model'
import { newId } from './store'

/**
 * Moteur pédagogique ARIA — règles explicites et testables.
 *
 * Aucune de ces règles n’écoute le son : elles combinent l’instrument, le niveau,
 * l’objectif, le temps disponible, le passage et le support déclarés par l’utilisateur.
 * Les critères de réussite sont formulés pour être observés par l’utilisateur lui-même.
 */

export const RULES_VERSION = 'sprint05-v1'

type Family = 'keys' | 'fretted' | 'voice' | 'drums' | 'other'
type Focus = 'rhythm' | 'accuracy' | 'tempo' | 'memory' | 'expression'

export function familyOf(instrument: InstrumentId): Family {
  if (instrument === 'piano') return 'keys'
  if (instrument === 'guitar' || instrument === 'bass') return 'fretted'
  if (instrument === 'voice') return 'voice'
  if (instrument === 'drums') return 'drums'
  return 'other'
}

/** Associe un libellé d’objectif (ou un texte libre) à un axe pédagogique. */
export function focusOf(text: string): Focus | null {
  const t = text.toLowerCase()
  if (/rythm|pulsation|régulier|regulier|décal|decal|temps fort|groove|strum|grattage/.test(t)) return 'rhythm'
  if (/tempo|vitesse|rapide|lent|bpm/.test(t)) return 'tempo'
  if (/juste|justesse|fausse|note|intonation|accordage|désaccord|desaccord|son sale|frise|grésil|gresil/.test(t)) return 'accuracy'
  if (/mémoire|memoire|par c(œ|oe)ur|oubli|perd/.test(t)) return 'memory'
  if (/fluid|express|nuance|phras|musical|enchaîn|enchain|changement/.test(t)) return 'expression'
  return null
}

const BPM: Record<LevelId, number> = { beginner: 60, practicing: 72, advanced: 84 }

const CELL: Record<LevelId, string> = {
  beginner: 'deux mesures',
  practicing: 'quatre mesures',
  advanced: 'une phrase complète',
}

type Ctx = {
  family: Family
  instrument: InstrumentId
  level: LevelId
  bpm: number
  cell: string
  passage: string
  resource: ResourceMode
}

type Draft = Omit<WorkProgramStep, 'id' | 'minutes' | 'kind'>

/** Comment s’appuyer sur le support choisi, en une phrase. */
function supportHint(ctx: Ctx): string {
  switch (ctx.resource) {
    case 'score':
      return 'Repère sur la partition le début et la fin du passage avant de jouer.'
    case 'tabs':
      return 'Garde la tablature sous les yeux et repère les cases du passage avant de jouer.'
    case 'chords':
      return 'Garde la grille d’accords sous les yeux et repère les deux premiers accords du passage.'
    case 'audio':
      return 'Écoute deux fois le passage dans ton enregistrement de référence avant de jouer.'
    case 'ear':
    default:
      return 'Sans support écrit : fredonne ou tape le passage de mémoire avant de jouer, tel que tu l’entends.'
  }
}

function warmup(focus: Focus, ctx: Ctx): Draft {
  const { family, bpm, instrument } = ctx
  if (focus === 'rhythm' || focus === 'tempo') {
    if (family === 'fretted' && instrument === 'guitar') {
      return {
        title: 'Main droite seule, cordes étouffées',
        what: `Gratte des allers-retours réguliers sur les cordes étouffées, métronome à ${bpm} BPM.`,
        how: 'Pose la main gauche à plat sur les cordes pour qu’elles ne sonnent pas. Coup vers le bas sur chaque clic, coup vers le haut entre deux clics, en comptant « 1 et 2 et 3 et 4 et ».',
        why: 'Le rythme vient de la main droite : on la stabilise avant d’ajouter les accords.',
        success: 'Tu tiens 8 mesures d’affilée sans t’arrêter, et chaque coup vers le bas tombe avec le clic.',
        bpm,
      }
    }
    if (family === 'fretted') {
      return {
        title: 'Pulsation sur corde à vide',
        what: `Joue une note par clic sur une corde à vide, métronome à ${bpm} BPM, puis deux notes par clic.`,
        how: 'Alterne index et majeur (ou le médiator vers le bas). Compte « 1 2 3 4 » à voix haute.',
        why: 'Une pulsation stable est la base de la ligne de basse.',
        success: '8 mesures sans t’arrêter, chaque note posée sur le clic.',
        bpm,
      }
    }
    if (family === 'drums') {
      return {
        title: 'Croches régulières',
        what: `Joue des croches régulières à la charleston, métronome à ${bpm} BPM.`,
        how: 'Main droite sur la charleston, compte « 1 et 2 et 3 et 4 et ». Ajoute la grosse caisse sur 1 et 3 quand c’est stable.',
        why: 'Le groove repose sur une subdivision régulière.',
        success: '8 mesures sans accélérer ni ralentir par rapport au clic.',
        bpm,
      }
    }
    if (family === 'voice') {
      return {
        title: 'Texte parlé en rythme',
        what: `Dis les paroles du passage en rythme sur le métronome à ${bpm} BPM, sans chanter.`,
        how: 'Tape la pulsation avec le pied ou la main pendant que tu parles.',
        why: 'Séparer le rythme de la mélodie rend les décalages faciles à entendre.',
        success: 'Le passage parlé deux fois de suite sans perdre la pulsation.',
        bpm,
      }
    }
    return {
      title: 'Pulsation dans le corps',
      what: `Tape la pulsation dans tes mains en comptant à voix haute, métronome à ${bpm} BPM.`,
      how: 'Compte « 1 2 3 4 », puis « 1 et 2 et » pour sentir la subdivision.',
      why: 'Sentir la pulsation avant de jouer évite de presser.',
      success: '8 mesures tapées sans décalage avec le clic.',
      bpm,
    }
  }
  if (focus === 'accuracy') {
    const tune =
      family === 'fretted'
        ? 'Accorde ton instrument avec un accordeur, puis joue lentement chaque note du passage en appuyant juste derrière la frette.'
        : family === 'voice'
          ? 'Prends la première note du passage sur un instrument ou une application de référence, et tiens-la 4 secondes.'
          : family === 'keys'
            ? 'Joue lentement les notes du passage main par main en les nommant à voix haute.'
            : 'Vérifie l’accord ou la préparation de ton instrument, puis joue lentement les notes du passage.'
    return {
      title: 'Mise au point des notes',
      what: 'Prépare ton instrument et repère les notes du passage.',
      how: tune,
      why: 'Une note juste au départ évite de répéter une erreur.',
      success: 'Tu peux nommer ou montrer chaque note du passage sans hésiter.',
    }
  }
  if (focus === 'memory') {
    return {
      title: 'Lecture active',
      what: `Découpe le passage en cellules de ${ctx.cell} et observe comment elles s’enchaînent.`,
      how: supportHint(ctx),
      why: 'On mémorise mieux ce qu’on a structuré.',
      success: 'Tu sais dire combien il y a de cellules et ce qui change entre elles.',
    }
  }
  return {
    title: 'Mise en place',
    what: 'Installe-toi et joue le passage lentement, sans chercher la vitesse.',
    how: `${supportHint(ctx)} Respire, relâche les épaules.`,
    why: 'Un départ calme laisse de la place pour écouter le son.',
    success: 'Le passage joué une fois sans t’arrêter, même lentement.',
  }
}

function focusStep(focus: Focus, ctx: Ctx): Draft {
  const { family, bpm, instrument, cell } = ctx
  switch (focus) {
    case 'rhythm':
      if (instrument === 'guitar') {
        return {
          title: 'Motif rythmique sur un seul accord',
          what: `Joue en boucle un motif rythmique sur un seul accord du passage, métronome à ${bpm} BPM.`,
          how:
            ctx.resource === 'ear' || ctx.resource === 'audio'
              ? 'Écoute ou fredonne le début du morceau, tape son rythme dans tes mains, puis reproduis-le à la main droite. Si tu ne le retrouves pas, prends le motif « bas – bas-haut – haut-bas-haut ».'
              : 'Prends le motif indiqué sur ton support, ou à défaut « bas – bas-haut – haut-bas-haut ». La main gauche tient un seul accord.',
          why: 'Isoler le rythme sur un accord facile libère l’attention pour la régularité.',
          success: '4 répétitions consécutives du motif sans t’arrêter ni te décaler du clic.',
          bpm,
        }
      }
      if (family === 'fretted') {
        return {
          title: 'Rythme de la ligne sur une note',
          what: `Joue le rythme de la ligne du passage sur une seule note, métronome à ${bpm} BPM.`,
          how: 'Garde le rythme exact mais remplace toutes les notes par la fondamentale du premier accord.',
          why: 'On règle le placement avant les déplacements de la main gauche.',
          success: '4 répétitions consécutives sans décalage avec le clic.',
          bpm,
        }
      }
      if (family === 'keys') {
        return {
          title: 'Main par main en comptant',
          what: `Joue ${cell} du passage main par main en comptant à voix haute, métronome à ${bpm} BPM.`,
          how: 'Main gauche seule, puis main droite seule. Compte les temps et les « et ».',
          why: 'Compter à voix haute rend audible chaque décalage.',
          success: 'Chaque main joue la cellule deux fois de suite alignée sur le clic.',
          bpm,
        }
      }
      if (family === 'drums') {
        return {
          title: 'Groove du passage',
          what: `Joue le groove du passage en boucle, métronome à ${bpm} BPM.`,
          how: 'Commence par charleston + grosse caisse, ajoute la caisse claire sur 2 et 4.',
          why: 'Les membres s’ajoutent un par un sur une base stable.',
          success: '4 mesures consécutives sans décalage entre les membres.',
          bpm,
        }
      }
      if (family === 'voice') {
        return {
          title: 'Mélodie sur « la »',
          what: `Chante la mélodie du passage sur la syllabe « la », métronome à ${bpm} BPM.`,
          how: 'Garde la pulsation au pied. Les attaques des notes tombent sur les temps prévus.',
          why: 'Sans les paroles, le placement rythmique est plus facile à contrôler.',
          success: 'Le passage chanté deux fois de suite sans perdre la pulsation.',
          bpm,
        }
      }
      return {
        title: 'Passage sur la pulsation',
        what: `Joue ${cell} du passage en suivant le métronome à ${bpm} BPM.`,
        how: 'Si ça décroche, baisse de 8 BPM plutôt que de t’arrêter.',
        why: 'La régularité passe avant la vitesse.',
        success: 'La cellule jouée deux fois de suite sans décalage.',
        bpm,
      }
    case 'tempo':
      return {
        title: 'Paliers de tempo',
        what: `Joue ${cell} du passage à ${bpm} BPM, puis monte de 4 BPM à chaque réussite.`,
        how: 'Deux passages propres de suite = palier validé. Si ça accroche, redescends d’un palier.',
        why: 'La vitesse se construit par petits paliers stables.',
        success: 'Deux paliers validés au-dessus du tempo de départ.',
        bpm,
      }
    case 'accuracy':
      return {
        title: 'Notes fragiles isolées',
        what: `Repère les notes qui accrochent dans ${cell} et rejoue-les seules.`,
        how:
          family === 'fretted'
            ? 'Joue chaque note fragile 3 fois : elle doit sonner claire, sans frisement. Puis ajoute la note d’avant et celle d’après.'
            : family === 'voice'
              ? 'Compare chaque note fragile à ta référence (instrument ou application), tiens-la, puis enchaîne avec la suivante.'
              : 'Joue chaque note fragile 3 fois lentement, puis ajoute la note d’avant et celle d’après.',
        why: 'Corriger à petite échelle évite de graver l’erreur.',
        success: 'Chaque note fragile jouée juste 3 fois de suite.',
      }
    case 'memory':
      return {
        title: 'Cellule sans support',
        what: `Joue la première cellule (${cell}) en regardant ton support, puis sans le regarder.`,
        how: 'Alterne : une fois avec, une fois sans. Passe à la cellule suivante quand c’est sûr.',
        why: 'Le rappel actif ancre la mémoire mieux que la répétition passive.',
        success: 'Deux cellules jouées sans regarder ton support.',
      }
    case 'expression':
    default:
      return {
        title: instrument === 'guitar' ? 'Enchaînement sans coupure' : 'Lien des phrases',
        what:
          instrument === 'guitar'
            ? 'Enchaîne deux accords ou deux phrases du passage sans couper le son.'
            : 'Relie la fin d’une phrase au début de la suivante sans rupture.',
        how: 'Joue lentement la jonction : les dernières notes d’une phrase et les premières de la suivante, 5 fois.',
        why: 'La continuité rend le passage musical.',
        success: 'Trois jonctions de suite sans silence involontaire.',
      }
  }
}

function applyStep(focus: Focus, ctx: Ctx): Draft {
  const { instrument, bpm, cell, family } = ctx
  if (focus === 'rhythm' && instrument === 'guitar') {
    return {
      title: 'Changer d’accord sans casser le rythme',
      what: 'Enchaîne deux accords du passage, deux mesures chacun, en gardant le motif.',
      how: 'La main droite ne s’arrête jamais. Si la main gauche n’est pas prête, gratte les cordes à vide sur le dernier « et » avant le changement.',
      why: 'C’est au changement d’accord que le rythme décroche le plus souvent.',
      success: '4 changements d’affilée sans arrêter la main droite.',
      bpm,
    }
  }
  if (focus === 'rhythm' || focus === 'tempo') {
    return {
      title: family === 'keys' ? 'Mains ensemble, tempo lent' : 'Passage complet au tempo de travail',
      what: `Joue tout le passage au tempo de travail (${bpm} BPM ou le palier atteint).`,
      how: 'Ne t’arrête pas sur une erreur : garde la pulsation et rattrape au temps suivant.',
      why: 'Tenir la pulsation malgré une erreur, c’est ce qui compte en situation réelle.',
      success: 'Le passage joué en entier sans t’arrêter.',
      bpm,
    }
  }
  if (focus === 'memory') {
    return {
      title: 'Enchaînement de mémoire',
      what: 'Enchaîne toutes les cellules travaillées sans regarder ton support.',
      how: 'Si tu bloques, regarde une seconde puis reprends au début de la cellule.',
      why: 'Relier les cellules construit la mémoire du passage entier.',
      success: 'Le passage joué de mémoire avec au plus un coup d’œil.',
    }
  }
  return {
    title: 'Remise en contexte',
    what: `Rejoue ${cell} en entier avec les corrections.`,
    how: 'Tempo confortable. Écoute si les notes travaillées sonnent comme dans l’exercice.',
    why: 'Une correction ne compte que si elle tient dans le passage.',
    success: 'Le passage joué deux fois avec les notes corrigées.',
  }
}

function recordStep(ctx: Ctx): Draft {
  return {
    title: 'Prise de contrôle',
    what: 'Enregistre le passage une fois, puis réécoute-le.',
    how:
      ctx.level === 'beginner'
        ? 'Une prise courte (30 à 60 s) au tempo confortable. Réécoute-la en entier avant de juger.'
        : 'Deux prises au maximum. Réécoute-les et garde la plus claire.',
    why: 'L’écoute révèle ce que tu ne perçois pas en jouant.',
    success: 'Une prise réécoutée et une observation notée dans le bilan.',
  }
}

/** Répartit `total` minutes selon des poids, en entiers, somme exacte, ≥ 2 min par étape. */
export function allocateMinutes(total: number, weights: number[]): number[] {
  const sum = weights.reduce((a, b) => a + b, 0)
  const raw = weights.map((w) => (w / sum) * total)
  const out = raw.map((r) => Math.max(2, Math.floor(r)))
  let diff = total - out.reduce((a, b) => a + b, 0)
  const order = raw
    .map((r, i) => ({ i, frac: r - Math.floor(r) }))
    .sort((a, b) => b.frac - a.frac)
  let k = 0
  while (diff > 0) {
    out[order[k % order.length].i] += 1
    diff -= 1
    k += 1
  }
  while (diff < 0) {
    const i = out.indexOf(Math.max(...out))
    out[i] -= 1
    diff += 1
  }
  return out
}

/**
 * Objectifs pré-sélectionnés à la préparation : l’objectif propre au morceau d’abord,
 * puis ceux choisis à l’onboarding / dans le profil (2 au maximum, le 1er est principal).
 */
export function prepGoalsFor(piece: Pick<Piece, 'objective'>, profileGoals: string[]): string[] {
  const out: string[] = []
  const pieceGoal = piece.objective.trim()
  if (pieceGoal && (OBJECTIVES as readonly string[]).includes(pieceGoal)) out.push(pieceGoal)
  for (const g of profileGoals) if (!out.includes(g)) out.push(g)
  return out.slice(0, 2)
}

const HABIT_TO_RESOURCE: Record<HabitId, ResourceMode> = {
  score: 'score',
  tabs: 'tabs',
  chords: 'chords',
  video: 'audio',
  ear: 'ear',
}

/** Un support n’est proposé par défaut que s’il existe réellement dans la fiche du morceau. */
export function resourceAvailable(piece: Pick<Piece, 'resources'>, mode: ResourceMode) {
  if (mode === 'ear') return true
  const kinds = new Set(piece.resources.filter((r) => !r.demo).map((r) => r.kind))
  if (mode === 'score') return kinds.has('pdf')
  if (mode === 'audio') return kinds.has('audio') || kinds.has('video')
  return kinds.has(mode)
}

/**
 * Support par défaut à la préparation : l’habitude du profil si ce support est présent dans la
 * fiche, sinon le premier support réellement importé, sinon « À l’oreille, sans support ».
 * Le choix reste modifiable.
 */
export function defaultResource(piece: Pick<Piece, 'resources'>, habits: HabitId[]): ResourceMode {
  for (const h of habits) if (resourceAvailable(piece, HABIT_TO_RESOURCE[h])) return HABIT_TO_RESOURCE[h]
  for (const mode of ['score', 'tabs', 'chords', 'audio'] as const) if (resourceAvailable(piece, mode)) return mode
  return 'ear'
}

/**
 * Libellé de passage d’une prise. Les prises antérieures à la correction pouvaient porter
 * l’objectif (« Justesse »…) ou « Passage » à la place du passage : on ne les affiche pas.
 */
export function passageLabel(passage: string | undefined) {
  const p = (passage || '').trim()
  if (!p || p === 'Passage' || (OBJECTIVES as readonly string[]).includes(p) || p === 'Pratique libre') return ''
  return p
}

export type ProgramInput = {
  piece: Piece
  instrument: InstrumentId
  level: LevelId
  minutes: number
  /** Objectifs par ordre de priorité ; le premier est l’objectif principal. */
  goals: string[]
  passage: string
  resource: ResourceMode
  difficulties: string
  /** Sprint 05 — dernière séance terminée sur ce morceau, pour enchaîner le travail. */
  previous?: PreviousSession | null
}

/**
 * Ce que la séance précédente laisse pour la suivante. Tout vient de l’utilisateur
 * (observations, auto-évaluations) ou du programme précédent ; rien n’est déduit du son.
 */
export type PreviousSession = {
  date: string
  objective: string
  improve: string
  retrySteps: string[]
  okSteps: string[]
  /** Tempo de travail de la séance précédente (programme), s’il y en avait un. */
  bpm?: number
}

/** Extrait la séance précédente d’un journal terminé et du programme qui l’a produit. */
export function previousSessionFrom(
  log: { createdAt: string; objective: string; observationImprove: string; stepChecks?: { title: string; check: StepCheck }[] } | null | undefined,
  program: WorkProgram | null | undefined,
): PreviousSession | null {
  if (!log) return null
  const checks = log.stepChecks || []
  const bpms = (program?.steps || []).map((s) => s.bpm).filter((b): b is number => typeof b === 'number')
  return {
    date: log.createdAt,
    objective: log.objective || program?.objective || '',
    improve: (log.observationImprove || '').trim(),
    retrySteps: checks.filter((c) => c.check === 'retry').map((c) => c.title),
    okSteps: checks.filter((c) => c.check === 'ok').map((c) => c.title),
    bpm: bpms.length ? Math.max(...bpms) : undefined,
  }
}

/**
 * Tempo de départ en tenant compte de la séance précédente (règle explicite, mêmes valeurs
 * que les conseils du bilan) : −8 BPM si une étape est à reprendre, +4 BPM si toutes les
 * étapes évaluées sont réussies, sinon le même tempo.
 */
export function continuedBpm(base: number, previous: PreviousSession | null | undefined): number {
  if (!previous?.bpm) return base
  if (previous.retrySteps.length) return Math.max(40, previous.bpm - 8)
  if (previous.okSteps.length) return Math.min(200, previous.bpm + 4)
  return previous.bpm
}

function shortDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })
  } catch {
    return ''
  }
}

export function buildProgram(input: ProgramInput): WorkProgram {
  const minutes = Math.max(10, Math.min(90, Math.round(input.minutes || 20)))
  const goals = input.goals.map((g) => g.trim()).filter(Boolean)
  const objective = goals[0] || 'Rythme'
  const primary: Focus = focusOf(objective) || focusOf(input.difficulties) || 'expression'
  const secondaryRaw = goals.slice(1).map(focusOf).find((f) => f && f !== primary) || focusOf(input.difficulties)
  const secondary: Focus | null = secondaryRaw && secondaryRaw !== primary ? secondaryRaw : null
  const family = familyOf(input.instrument)
  // La continuité ne s’applique que si l’on poursuit le même objectif principal.
  const previous = input.previous && input.previous.objective === objective ? input.previous : null
  const timed = primary === 'rhythm' || primary === 'tempo'
  const bpm = timed ? continuedBpm(BPM[input.level], previous) : BPM[input.level]
  const ctx: Ctx = {
    family,
    instrument: input.instrument,
    level: input.level,
    bpm,
    cell: CELL[input.level],
    passage: input.passage.trim() || 'le passage choisi',
    resource: input.resource,
  }

  const drafts: { kind: StepKind; draft: Draft; weight: number }[] = [
    { kind: 'warmup', draft: warmup(primary, ctx), weight: 0.2 },
    { kind: 'focus', draft: focusStep(primary, ctx), weight: 0.35 },
  ]
  // Ce qui restait à corriger la dernière fois passe en tête de la séance, juste après l’échauffement.
  const toFix = previous && (previous.improve || previous.retrySteps.length) ? previous : null
  if (toFix) {
    const corr = correctiveExercise({
      improve: toFix.improve,
      objective,
      instrument: input.instrument,
      level: input.level,
      retrySteps: toFix.retrySteps,
    })
    const reason = toFix.improve ? `Tu avais noté : « ${toFix.improve} ».` : `Tu avais jugé « ${toFix.retrySteps[0]} » à reprendre.`
    drafts.splice(1, 0, {
      kind: 'focus',
      weight: 0.2,
      draft: {
        title: `Reprise · ${corr.title}`,
        what: `${reason} ${corr.text}`,
        how: 'Tempo plus lent que d’habitude. Arrête-toi dès que le critère est atteint deux fois de suite.',
        why: 'Commencer par ce qui restait à corriger évite de répéter la même erreur une séance de plus.',
        success: corr.success,
        bpm: timed ? ctx.bpm : undefined,
      },
    })
  }
  if (secondary && minutes >= 30) {
    drafts.push({ kind: 'focus', draft: focusStep(secondary, ctx), weight: 0.22 })
  }
  drafts.push({ kind: 'apply', draft: applyStep(primary, ctx), weight: 0.25 })
  drafts.push({ kind: 'record', draft: recordStep(ctx), weight: 0.2 })

  const split = allocateMinutes(
    minutes,
    drafts.map((d) => d.weight),
  )
  const difficulty = input.difficulties.trim()
  const primaryIdx = drafts.findIndex((d) => d.kind === 'focus' && !d.draft.title.startsWith('Reprise ·'))
  const steps: WorkProgramStep[] = drafts.map((d, i) => ({
    id: newId('step'),
    kind: d.kind,
    minutes: split[i],
    ...d.draft,
    what:
      i === primaryIdx && difficulty
        ? `${d.draft.what} Garde en tête la difficulté que tu as notée : « ${difficulty} ».`
        : d.draft.what,
  }))

  const notes: string[] = []
  if (family === 'other') {
    notes.push('Instrument « Autre » : ARIA applique des règles générales, non spécifiques à ton instrument.')
  }
  if (previous) {
    const parts: string[] = []
    if (toFix) parts.push('une étape de reprise sur ce qui restait à corriger')
    if (timed && previous.bpm && bpm !== previous.bpm) {
      parts.push(bpm > previous.bpm ? `un tempo de départ monté à ${bpm} BPM (${previous.bpm} la dernière fois)` : `un tempo de départ redescendu à ${bpm} BPM (${previous.bpm} la dernière fois)`)
    }
    if (parts.length) notes.push(`Suite de ta séance du ${shortDate(previous.date)} : ${parts.join(' et ')}. Règle ARIA appliquée à tes observations.`)
  } else if (input.previous && input.previous.objective && input.previous.objective !== objective) {
    notes.push(`Nouvel objectif (« ${objective} » au lieu de « ${input.previous.objective} ») : la séance repart des réglages de base.`)
  }
  if (input.resource === 'score' && !input.piece.resources.some((r) => r.kind === 'pdf')) {
    notes.push('Aucune partition importée pour ce morceau : tu peux en ajouter une depuis sa fiche.')
  }

  const now = new Date().toISOString()
  return {
    steps,
    objective,
    minutes,
    difficulties: difficulty,
    updatedAt: now,
    startedAt: now,
    stepIndex: 0,
    instrument: input.instrument,
    level: input.level,
    goals: goals.length ? goals : [objective],
    passage: input.passage.trim(),
    resource: input.resource,
    notes,
    continuedFrom: previous ? previous.date : undefined,
  }
}

/** Exercice correctif (règle pédagogique) à partir de ce que l’utilisateur veut corriger. */
export function correctiveExercise(input: {
  improve: string
  objective: string
  instrument: InstrumentId
  level: LevelId
  retrySteps: string[]
}): { title: string; text: string; success: string; minutes: number } {
  const focus = focusOf(input.improve) || focusOf(input.retrySteps.join(' ')) || focusOf(input.objective) || 'expression'
  const ctx: Ctx = {
    family: familyOf(input.instrument),
    instrument: input.instrument,
    level: input.level,
    bpm: Math.max(50, BPM[input.level] - 8),
    cell: CELL.beginner,
    passage: 'le passage',
    resource: 'ear',
  }
  const draft = focusStep(focus, ctx)
  return {
    title: draft.title,
    text: `${draft.what} ${draft.how}`,
    success: draft.success,
    minutes: 5,
  }
}

export type ReviewSource = 'user' | 'self-check' | 'rules' | 'facts'

export type ReviewItem = { text: string; source: ReviewSource; empty?: boolean }

export type Review = {
  works: ReviewItem
  improve: ReviewItem
  corrective: ReviewItem & { title: string; success: string; minutes: number }
  next: ReviewItem
  facts: ReviewItem
  analysis: string
  limits: string | null
}

export function buildReview(input: {
  works: string
  improve: string
  programObjective: string
  instrument: InstrumentId
  level?: LevelId
  steps?: { title: string; check?: StepCheck }[]
  takes?: { seconds: number }[]
  /** Une prise de ce morceau existe déjà (cette séance ou une précédente). */
  hasReferenceTake?: boolean
}): Review {
  const works = input.works.trim()
  const improve = input.improve.trim()
  const steps = input.steps || []
  const okSteps = steps.filter((s) => s.check === 'ok').map((s) => s.title)
  const retrySteps = steps.filter((s) => s.check === 'retry').map((s) => s.title)
  const level = input.level || 'beginner'
  const objective = input.programObjective.trim() || 'ton objectif'

  const worksItem: ReviewItem = works
    ? { text: works, source: 'user' }
    : okSteps.length
      ? { text: `Critères atteints selon toi : ${okSteps.join(', ')}.`, source: 'self-check' }
      : { text: 'Non renseigné — note ce qui t’a semblé solide à la réécoute.', source: 'user', empty: true }

  const improveItem: ReviewItem = improve
    ? { text: improve, source: 'user' }
    : retrySteps.length
      ? { text: `À reprendre selon toi : ${retrySteps.join(', ')}.`, source: 'self-check' }
      : { text: 'Non renseigné — note ce que tu veux corriger en priorité.', source: 'user', empty: true }

  const corr = correctiveExercise({
    improve,
    objective,
    instrument: input.instrument,
    level,
    retrySteps,
  })

  // Sans prise de référence, on propose d’en enregistrer une première ; la comparaison n’est
  // suggérée que lorsqu’une prise existe déjà pour ce morceau.
  const hasReference = input.hasReferenceTake ?? (input.takes || []).length > 0
  const takeStep = hasReference
    ? 'refais une prise de 30 secondes et compare-la à la précédente'
    : 'enregistre une première prise de 30 secondes : elle servira de référence pour les prochaines comparaisons'
  // Le conseil suit l’axe de l’objectif : monter le tempo n’a de sens que pour le rythme ou le tempo.
  const focus = focusOf(objective) || 'expression'
  const slower = focus === 'rhythm' || focus === 'tempo' ? '8 BPM plus lentement' : 'plus lentement'
  const continueAdvice: Record<Focus, string> = {
    rhythm: 'monte le tempo de 4 BPM, ou élargis au passage suivant si tout était stable',
    tempo: 'monte le tempo de 4 BPM, ou élargis au passage suivant si tout était stable',
    accuracy: 'rejoue le passage lentement en vérifiant chaque note fragile, puis élargis au passage suivant si toutes sonnent juste',
    memory: 'rejoue le passage sans regarder ton support, puis ajoute la cellule suivante si tout tient de mémoire',
    expression: 'travaille les enchaînements entre les phrases sans coupure, puis élargis au passage suivant si tout reste fluide',
  }
  const next: ReviewItem = retrySteps.length
    ? {
        text: `Prochaine tentative : reprends « ${retrySteps[0]} » ${slower}, puis ${takeStep}.`,
        source: 'rules',
      }
    : improve
      ? {
          text: `Prochaine séance : commence par l’exercice correctif (5 min), puis ${takeStep}.`,
          source: 'rules',
        }
      : {
          text: hasReference
            ? (focus === 'rhythm' || focus === 'tempo') && !okSteps.length
              ? `Prochaine séance : garde l’objectif « ${objective} » au même tempo. Indique « Oui, réussi » sur les étapes réussies : ARIA montera alors le tempo de 4 BPM la séance suivante.`
              : `Prochaine séance : garde l’objectif « ${objective} » et ${continueAdvice[focus]}.`
            : `Prochaine séance : garde l’objectif « ${objective} » et enregistre une première prise de 30 secondes : elle servira de référence pour les prochaines comparaisons.`,
          source: 'rules',
        }

  const takes = input.takes || []
  const total = takes.reduce((a, t) => a + (t.seconds || 0), 0)
  const facts: ReviewItem = {
    text: takes.length
      ? `${takes.length} prise${takes.length > 1 ? 's' : ''} enregistrée${takes.length > 1 ? 's' : ''} · ${Math.round(total)} s au total.`
      : 'Aucune prise enregistrée pendant cette séance.',
    source: 'facts',
  }

  const limits =
    familyOf(input.instrument) === 'other'
      ? 'Instrument « Autre » : les recommandations sont générales.'
      : null

  return {
    works: worksItem,
    improve: improveItem,
    corrective: { ...corr, source: 'rules', text: corr.text },
    next,
    facts,
    analysis:
      'Analyse automatique : aucune. ARIA n’écoute pas encore le contenu de tes prises — aucune note, aucun score ni aucune erreur n’est détecté automatiquement.',
    limits,
  }
}
