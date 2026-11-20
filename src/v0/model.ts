export type InstrumentId = 'piano' | 'guitar' | 'voice' | 'bass' | 'drums' | 'other'
export type LevelId = 'beginner' | 'practicing' | 'advanced'
export type HabitId = 'score' | 'tabs' | 'chords' | 'video' | 'ear'

export type AriaAccount = {
  id: string
  firstName: string
  email: string
  /** Local-only hashed password (device account). Empty when cloud auth is used. */
  passwordHash: string
  salt: string
  createdAt: string
}

export type MusicalProfile = {
  email: string
  instruments: InstrumentId[]
  level: LevelId
  habits: HabitId[]
  /** Objectifs musicaux choisis à l’onboarding (ex. Justesse, Rythme). */
  goals?: string[]
  /** Temps de pratique habituel (minutes). */
  preferredMinutes?: number
  onboardingDone: boolean
  updatedAt: string
}

export type PieceResource = {
  id: string
  kind: 'pdf' | 'audio' | 'video' | 'chords' | 'tabs' | 'note'
  label: string
  /** Object URL or text content; blobs live in IndexedDB by resource id */
  text?: string
  demo?: boolean
}

/** Support utilisé pour travailler le morceau (avec ou sans partition). */
export type ResourceMode = 'score' | 'tabs' | 'chords' | 'audio' | 'ear'

export type StepKind = 'warmup' | 'focus' | 'apply' | 'record' | 'free'

/** Auto-évaluation de l’utilisateur sur le critère de réussite d’une étape. */
export type StepCheck = 'ok' | 'retry'

export type WorkProgramStep = {
  id: string
  title: string
  /** Consigne concrète. */
  what: string
  how: string
  why: string
  /** Critère de réussite observable par l’utilisateur. */
  success: string
  /** Durée conseillée de l’étape (minutes). Absent sur les programmes antérieurs au Sprint 04. */
  minutes?: number
  kind?: StepKind
  /** Tempo de départ conseillé pour le métronome. */
  bpm?: number
  /** Auto-évaluation saisie par l’utilisateur (jamais calculée). */
  check?: StepCheck
  done?: boolean
}

export type WorkProgram = {
  steps: WorkProgramStep[]
  objective: string
  minutes: number
  difficulties: string
  updatedAt: string
  stepIndex: number
  /** Sprint 04 — contexte de préparation (absent sur les anciens programmes). */
  startedAt?: string
  instrument?: InstrumentId
  level?: LevelId
  goals?: string[]
  passage?: string
  resource?: ResourceMode
  /** Limites honnêtes des règles appliquées (ex. instrument peu couvert). */
  notes?: string[]
}

export type Piece = {
  id: string
  email: string
  title: string
  artist: string
  instrument: InstrumentId
  genre: string
  objective: string
  passages: string
  notes: string
  resources: PieceResource[]
  program: WorkProgram | null
  demo?: boolean
  createdAt: string
  updatedAt: string
  lastWorkedAt: string | null
}

export type Take = {
  id: string
  email: string
  pieceId: string
  passage: string
  createdAt: string
  seconds: number
  mime: string
  /** Étape de séance pendant laquelle la prise a été faite (Sprint 04). */
  stepTitle?: string
}

export type SessionLogStatus = 'draft' | 'completed'

export type SessionLog = {
  id: string
  email: string
  pieceId: string
  createdAt: string
  minutes: number
  objective: string
  observationWorks: string
  observationImprove: string
  nextStep: string
  takeIds: string[]
  source: 'user' | 'rules'
  /** Completed = réelle séance sauvegardée ; draft = brouillon non compté. */
  status: SessionLogStatus
  /** Sprint 04 — exercice correctif issu des règles pédagogiques. */
  corrective?: string
  /** Sprint 04 — auto-évaluation des étapes par l’utilisateur. */
  stepChecks?: { title: string; check: StepCheck }[]
  /** Sprint 04 — comparaison de prises écrite par l’utilisateur. */
  comparison?: string
}

export type AppScreen =
  | 'welcome'
  | 'auth'
  | 'onboarding'
  | 'home'
  | 'library'
  | 'piece'
  | 'prepare'
  | 'session'
  | 'record'
  | 'review'
  | 'follow'
  | 'profile'

export const INSTRUMENTS: { id: InstrumentId; label: string }[] = [
  { id: 'piano', label: 'Piano' },
  { id: 'guitar', label: 'Guitare' },
  { id: 'voice', label: 'Voix' },
  { id: 'bass', label: 'Basse' },
  { id: 'drums', label: 'Batterie' },
  { id: 'other', label: 'Autre' },
]

export const LEVELS: { id: LevelId; label: string; hint: string }[] = [
  { id: 'beginner', label: 'Je débute', hint: 'Je découvre l’instrument.' },
  { id: 'practicing', label: 'Je pratique', hint: 'Je veux progresser et structurer mon travail.' },
  { id: 'advanced', label: 'Je me perfectionne', hint: 'Je prépare une audition, un examen ou un projet.' },
]

export const HABITS: { id: HabitId; label: string }[] = [
  { id: 'score', label: 'Partition' },
  { id: 'tabs', label: 'Tablature' },
  { id: 'chords', label: 'Accords' },
  { id: 'video', label: 'Vidéo' },
  { id: 'ear', label: 'À l’oreille' },
]

/** Objectifs proposés à l’onboarding et à la préparation (libellés stockés tels quels). */
export const OBJECTIVES = ['Rythme', 'Justesse', 'Tempo', 'Mémoire', 'Fluidité et expression'] as const

export const DURATIONS = [15, 20, 30, 45, 60] as const

export const RESOURCE_MODES: { id: ResourceMode; label: string }[] = [
  { id: 'score', label: 'Partition' },
  { id: 'tabs', label: 'Tablature' },
  { id: 'chords', label: 'Grille d’accords' },
  { id: 'audio', label: 'Enregistrement de référence' },
  { id: 'ear', label: 'À l’oreille, sans support' },
]

export const DEMO_GENRES = ['Classique', 'Jazz', 'Pop', 'R&B', 'Folk', 'Étude'] as const
