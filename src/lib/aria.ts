import { useEffect, useRef, useState } from 'react'
import type { AriaFeedback } from '../types'
import type { AudioFeatures } from './audioFeatures'
import {
  BY_EAR_CUES_FR,
  PIECE_CUES,
  PRACTICE_CUES_FR,
  RECORD_CUES_FR,
  type Cue,
} from './ariaCues'
import { t } from './presets'

export function useAriaCues(
  active: boolean,
  mode: 'practice' | 'record',
  pieceId?: string | null,
  byEar = false,
  heard = true,
  _pianoLevel: unknown = null,
) {
  const [cue, setCue] = useState<Cue | null>(null)
  const index = useRef(0)

  useEffect(() => {
    if (!active) {
      setCue(null)
      return
    }

    if (!heard) {
      setCue({
        text:
          mode === 'record'
            ? 'Je n’entends pas. Rapproche le micro, puis joue.'
            : 'Je t’écoute dès que tu joues. Là, c’est trop calme.',
        tone: 'warn',
      })
      return
    }

    const piecePool = pieceId && PIECE_CUES[pieceId] ? PIECE_CUES[pieceId].fr : []
    const base = byEar && !pieceId ? BY_EAR_CUES_FR : PRACTICE_CUES_FR
    const pool = mode === 'practice' ? [...piecePool, ...base] : RECORD_CUES_FR

    index.current = 0
    const tick = () => {
      const item = pool[index.current % pool.length]
      index.current += 1
      setCue(item)
    }

    tick()
    const id = window.setInterval(tick, mode === 'practice' ? 6000 : 5000)
    return () => window.clearInterval(id)
  }, [active, mode, pieceId, byEar, heard])

  return cue
}

export type PerformanceMeta = {
  playedSec: number
  totalSec: number | null
  demoSync: boolean
  pieceId: string | null
  features: AudioFeatures | null
}

type MusicalAxis = 'justesse' | 'pulsation' | 'phrasé' | 'articulation' | 'dynamique' | 'écoute'

type RankedIssue = {
  severity: number
  axis: MusicalAxis
  title: string
  weakness: string
  drill: string
  success: string
}

type SignalNotes = {
  strengths: string[]
  weaknesses: string[]
  improvements: string[]
  honesty: string[]
  ranked: RankedIssue[]
}

function uniquePush(list: string[], value: string | undefined, max = 6) {
  if (!value) return
  if (list.some((x) => x.toLowerCase() === value.toLowerCase())) return
  if (list.length >= max) return
  list.push(value)
}

/** Map take signals → ranked musical issues. No invented piece-flavor. */
function signalNotes(features: AudioFeatures | null, meta: PerformanceMeta | undefined): SignalNotes {
  const notes: SignalNotes = {
    strengths: [],
    weaknesses: [],
    improvements: [],
    honesty: [],
    ranked: [],
  }
  const f = features
  const played = meta?.playedSec ?? f?.durationSec ?? 0
  const total = meta?.totalSec ?? f?.durationSec ?? 0
  const completion = total > 0 ? played / total : 1

  const pushIssue = (
    severity: number,
    axis: MusicalAxis,
    title: string,
    weakness: string,
    drill: string,
    success: string,
  ) => {
    notes.ranked.push({ severity, axis, title, weakness, drill, success })
    uniquePush(notes.weaknesses, weakness)
    uniquePush(notes.improvements, drill)
  }

  if (!f || f.weakSignal || f.durationSec < 1.2) {
    pushIssue(
      100,
      'écoute',
      'Je n’ai pas assez entendu.',
      'Audio trop fin ou trop court pour juger justesse et pulsation.',
      'Micro plus près, 30–40 secondes stables, un seul passage court.',
      'Réussi si : Aria entend une ligne continue 30 s et plus.',
    )
    notes.honesty.push('Il me faut une prise plus claire avant d’être plus précise.')
    notes.ranked.sort((a, b) => b.severity - a.severity)
    return notes
  }

  const peakRatio = f.rmsMean > 0.0001 ? f.rmsPeak / f.rmsMean : 1

  if (f.voicedRatio > 0.22 && f.intonationCents > 32) {
    pushIssue(
      92,
      'justesse',
      'Justesse : le son ne se pose pas.',
      `La justesse flotte (~${Math.round(f.intonationCents)} cents hors centre). Le son cherche encore sa place ; il ne se pose pas.`,
      'Une phrase, lent. Écoute le relâchement de chaque attaque avant la suivante.',
      'Réussi si : la note sonne centrée, sans chercher.',
    )
  } else if (f.voicedRatio > 0.25 && f.intonationCents > 0 && f.intonationCents < 16) {
    uniquePush(notes.strengths, 'Justesse propre. Le son se pose au centre, comme posé du bout des doigts.')
  }

  if (f.ioiCv > 0.42 && f.attackCount >= 6) {
    pushIssue(
      91,
      'pulsation',
      'Pulsation irrégulière.',
      'Pulsation irrégulière. Le tempo respire trop — ou pas assez.',
      'Les mêmes 4 mesures, métronome sur 2 et 4 seulement, puis une fois sans.',
      'Réussi si : les attaques tombent sur une pulsation que tu pourrais taper.',
    )
  } else if (f.ioiCv > 0 && f.ioiCv < 0.22 && f.attackCount >= 6) {
    uniquePush(notes.strengths, 'Pulsation tenue. Le temps tient.')
  }

  if (f.tessituraSemitones >= 26 && f.voicedRatio > 0.2) {
    uniquePush(
      notes.strengths,
      `Tessiture large (~${Math.round(f.tessituraSemitones)} demi-tons). Tu prends le clavier.`,
    )
  }

  if (completion < 0.45 && total > 0) {
    pushIssue(
      90,
      'phrasé',
      'Phrasé coupé trop tôt.',
      `Tu as coupé tôt (~${Math.round(played)}s sur ~${Math.round(total)}s). Le phrasé n’a pas le temps de se poser.`,
      'Repars du même début et ajoute 8 mesures avant d’arrêter.',
      'Réussi si : tu dépasses le point d’arrêt précédent sans couper.',
    )
  } else if (f.durationSec >= 20) {
    uniquePush(notes.strengths, `Tu as tenu ${Math.round(f.durationSec)} s. L’endurance est utilisable.`)
  } else if (f.durationSec < 12) {
    pushIssue(
      85,
      'phrasé',
      'Phrasé trop court.',
      `Prise courte (${Math.round(f.durationSec)} s). Pas assez de mesures pour un phrasé.`,
      'Une phrase complète du début à la fin, sans reprendre au milieu.',
      'Réussi si : une phrase continue de plus de 15 s.',
    )
  }

  if (f.silenceRatio > 0.45) {
    pushIssue(
      80,
      'phrasé',
      'Phrasé : la ligne se casse.',
      `Respirations trop longues (~${Math.round(f.silenceRatio * 100)} % de silence). La ligne se casse.`,
      'Relie 2 phrases avec une note-pont douce. Pas d’arrêt total entre elles.',
      'Réussi si : deux phrases sonnent comme une seule idée.',
    )
  } else if (f.silenceRatio < 0.1 && f.attacksPerSec > 3.0) {
    pushIssue(
      88,
      'articulation',
      'Articulation trop dense.',
      `Articulation trop dense (${f.attacksPerSec.toFixed(1)} attaques/s). Presque aucune respiration.`,
      'Rejoue le même passage avec un silence volontaire toutes les 4 mesures. Compte le silence à voix haute une fois.',
      'Réussi si : tu peux montrer 2 silences choisis volontairement.',
    )
  } else if (f.silenceRatio >= 0.18 && f.silenceRatio <= 0.35) {
    uniquePush(notes.strengths, 'Les respirations entre les phrases sonnent naturelles.')
  }

  if (f.dynamicRange < 0.035) {
    pushIssue(
      78,
      'dynamique',
      'Dynamique trop plate.',
      'Dynamique trop plate. Piano et forte se ressemblent trop.',
      'Les mêmes 4 mesures deux fois. Passe 1 douce, passe 2 plus pleine. Puis assemble une fois.',
      'Réussi si : on entend clairement deux niveaux dynamiques.',
    )
  } else if (f.dynamicRange > 0.11) {
    uniquePush(notes.strengths, 'Beau contraste de nuances. Le piano et le forte se parlent, le toucher a du relief.')
  }

  if (f.endingEnergy < f.openingEnergy * 0.55 && f.durationSec > 10) {
    pushIssue(
      82,
      'phrasé',
      'Phrasé : la fin s’éteint.',
      'La fin perd du corps. Le phrasé s’éteint alors qu’il a encore besoin de poids.',
      'Boucle seulement les 8 dernières secondes jusqu’à 3 fois vivantes d’affilée.',
      'Réussi si : les 8 dernières secondes sont aussi présentes que le début.',
    )
  } else if (f.endingEnergy > f.openingEnergy * 1.35 && f.durationSec > 10) {
    uniquePush(notes.strengths, 'La fin est plus forte que le début. Tu construis.')
  }

  if (f.openingEnergy > f.middleEnergy * 1.4 && f.durationSec > 12) {
    pushIssue(
      76,
      'phrasé',
      'Phrasé : le milieu lâche.',
      'Début plus clair que le milieu. L’attention baisse après l’élan.',
      'Commence au creux du milieu. 5 reps lentes, puis une vraie prise de cette zone seulement.',
      'Réussi si : le milieu sonne aussi intentionnel que la mesure 1.',
    )
  }

  if (f.middleEnergy > f.openingEnergy * 1.45 && f.endingEnergy < f.middleEnergy * 0.6 && f.durationSec > 14) {
    pushIssue(
      74,
      'phrasé',
      'Phrasé : l’arc culmine trop tôt.',
      'Milieu fort, atterrissage faible. L’arc culmine trop tôt.',
      'Travaille le dernier tiers seul à −10 % tempo, puis raccroche-le au milieu une fois.',
      'Réussi si : l’énergie tient jusqu’à la phrase finale.',
    )
  }

  if (f.attacksPerSec > 0.4 && f.attacksPerSec < 1.15) {
    uniquePush(notes.strengths, 'Rythme d’attaques mesuré. Pas frénétique.')
  } else if (f.attacksPerSec >= 2.6) {
    pushIssue(
      86,
      'articulation',
      'Articulation trop serrée.',
      `Densité d’articulation élevée (${f.attacksPerSec.toFixed(1)} attaques/s). La pulsation pousse.`,
      'Même passage au métronome −15 % jusqu’à ennuyeusement stable, puis une prise à cette vitesse.',
      'Réussi si : tu finis sans accélérer dans les dernières mesures.',
    )
  }

  if (peakRatio > 4.5 && f.rmsMean > 0.01) {
    pushIssue(
      72,
      'articulation',
      'Articulation martelée.',
      'Le toucher durcit. Tu frappes plus que tu ne poses : l’attaque pique, le chant n’a pas le temps de naître.',
      'Une phrase tout mezzo. Chaque note même poids. Aucun accent pendant 8 mesures.',
      'Réussi si : la ligne te paraît égale sous les doigts.',
    )
  }

  if (f.energyVariance > 0.0025 && f.dynamicRange > 0.08) {
    uniquePush(notes.strengths, 'Le phrasé a une forme. On sent le chant, pas une ligne plate.')
  }

  notes.ranked.sort((a, b) => b.severity - a.severity)
  if (notes.ranked.length) {
    notes.weaknesses = notes.ranked.map((r) => r.weakness).slice(0, 2)
    notes.improvements = notes.ranked.map((r) => r.drill).slice(0, 2)
  }
  return notes
}

/**
 * Aria report: one musical diagnosis from this take.
 * Generic song templates never fill the gaps.
 */
export function analyzePerformance(input: {
  pieceName: string
  hasPartition: boolean
  firstName: string
  arrangement: 'arrangement' | 'original' | null
  takesUsed: number
  maxTakes: number
  meta?: PerformanceMeta
  pianoLevel?: unknown
}): AriaFeedback {
  const copy = t()
  const name = input.firstName.trim() || copy.you
  const piece = input.pieceName.trim() || 'ton morceau'
  const take = input.takesUsed
  const features = input.meta?.features ?? null
  const silent = !features || features.weakSignal || features.durationSec < 1.2
  const signals = signalNotes(features, input.meta)
  const top = signals.ranked[0]
  const dur = features?.durationSec

  if (silent) {
    return {
      headline: top?.title || 'Je n’ai pas assez entendu.',
      greeting: `${name}, je n’ai pas assez entendu « ${piece} ».`,
      overview: signals.honesty[0] || '',
      atmosphere: '',
      technique: '',
      rhythm: '',
      strengths: [],
      weaknesses: signals.weaknesses.slice(0, 1),
      improvements: signals.improvements.slice(0, 1),
      nextFocus: top ? `${top.drill} ${top.success}` : 'Micro près. Un passage, vingt secondes. Ensuite on corrige.',
      takesLeft: Math.max(0, input.maxTakes - take),
    }
  }

  const headline = top
    ? top.title
    : signals.strengths.length
      ? 'Le phrasé tient. On affine.'
      : 'Prise entendue. On continue.'

  const greeting = top
    ? `${name}, j’ai écouté « ${piece} »${dur ? ` (${Math.round(dur)} s)` : ''}. Un axe : ${top.axis}.`
    : `${name}, j’ai écouté « ${piece} »${dur ? ` (${Math.round(dur)} s)` : ''}. Rien de grave à corriger tout de suite.`

  const nextFocus = top
    ? `${top.drill} ${top.success}`
    : 'Garde le même passage. Une prise plus longue, même tempo.'

  return {
    headline,
    greeting,
    overview: '',
    atmosphere: '',
    technique: '',
    rhythm: '',
    strengths: signals.strengths.slice(0, 2),
    weaknesses: signals.weaknesses.slice(0, 2),
    improvements: signals.improvements.slice(0, 2),
    nextFocus,
    takesLeft: Math.max(0, input.maxTakes - take),
  }
}
