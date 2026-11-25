import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { AuthGate } from '../components/AuthGate'
import { Icon, INSTRUMENT_ICON } from '../design/Icon'
import { useMediaRecorder } from '../lib/recorder'
import { isGuestEmail, probeAuthMode, restoreSession, signOutV0, type AuthMode } from './auth'
import type { UserProfile } from '../types'
import { playableDuration } from './media'
import { comparability, comparableGroup, nonComparableReason, takeMeta, takesOfSession } from './takes'
import { buildProgram, buildReview, defaultResource, prepGoalsFor, previousSessionFrom, resourceAvailable } from './pedagogy'
import {
  DEMO_GENRES,
  DURATIONS,
  INSTRUMENTS,
  LEVELS,
  OBJECTIVES,
  RESOURCE_MODES,
  type AppScreen,
  type HabitId,
  type InstrumentId,
  type LevelId,
  type MusicalProfile,
  type Piece,
  type ResourceMode,
  type SessionLog,
  type StepCheck,
  type Take,
} from './model'
import {
  canCompleteSession,
  deleteBlob,
  findSessionLog,
  deleteTakeMeta,
  getMusicalProfile,
  getPiece,
  GUEST_EMAIL,
  listCompletedSessionLogs,
  listDraftSessionLogs,
  listPieces,
  listTakes,
  newId,
  putBlob,
  saveMusicalProfile,
  savePiece,
  saveSessionLog,
  saveTakeMeta,
  seedDemoPieces,
  setSessionEmail,
} from './store'
import { Badge, fmt, MetronomePanel, PieceThumb, RecordPanel, ResourceList, Section, SourceTag, StepTimer, TakePlayer } from './ui'

type Tab = 'home' | 'library' | 'follow' | 'profile'
type Tool = 'none' | 'metronome' | 'resources' | 'notes'

/** Thèmes comparables sur la branche de prévisualisation de la direction visuelle. */
type Theme = 'marine' | 'electrique' | 'espresso' | 'ivoire' | 'blanc'
const THEME_KEY = 'aria.v0.theme'
const WHERE_KEY = 'aria.v0.where'

/**
 * Une séance est en cours tant qu’elle n’a pas été terminée. Les séances terminées depuis le
 * Sprint 05 portent l’identifiant de leur séance ; les plus anciennes sont comparées par date.
 */
function pieceInProgressFor(email: string, p: Piece | null) {
  if (!p?.program || !email) return false
  const key = p.program.startedAt || p.program.updatedAt || p.updatedAt
  const done = listCompletedSessionLogs(email, p.id)
  if (done.some((l) => l.sessionStartedAt === key)) return false
  return !done.some((l) => !l.sessionStartedAt && l.createdAt > key)
}
const isTheme = (v: string | null): v is Theme => v === 'marine' || v === 'electrique' || v === 'espresso' || v === 'ivoire' || v === 'blanc'

const instLabel = (id: InstrumentId) => INSTRUMENTS.find((i) => i.id === id)?.label || id
const levelLabel = (id: LevelId) => LEVELS.find((l) => l.id === id)?.label || id
const resourceLabel = (id: ResourceMode) => RESOURCE_MODES.find((r) => r.id === id)?.label || id

/** Numérotation chronologique des prises d’un morceau (Prise 1 = la plus ancienne). */
function takeNumbers(all: Take[]) {
  const map = new Map<string, number>()
  const byPiece = new Map<string, Take[]>()
  for (const t of all) byPiece.set(t.pieceId, [...(byPiece.get(t.pieceId) || []), t])
  for (const list of byPiece.values()) {
    list
      .slice()
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .forEach((t, i) => map.set(t.id, i + 1))
  }
  return map
}

function Back({ onClick, label = 'Retour', locked = false }: { onClick: () => void; label?: string; locked?: boolean }) {
  return (
    <button
      className="ds-iconbtn"
      type="button"
      aria-label={label}
      aria-disabled={locked || undefined}
      aria-describedby={locked ? 'nav-lock' : undefined}
      onClick={() => {
        if (!locked) onClick()
      }}
    >
      <Icon name="back" size={22} />
    </button>
  )
}

function TopBar({ onBack, title, right, locked = false }: { onBack?: () => void; title?: string; right?: ReactNode; locked?: boolean }) {
  return (
    <div className="ds-topbar">
      {onBack ? <Back onClick={onBack} locked={locked} /> : <span />}
      {title ? <span className="ds-topbar-title">{title}</span> : <span />}
      {right || <span className="ds-topbar-spacer" />}
    </div>
  )
}

export function AriaApp() {
  const [boot, setBoot] = useState(true)
  const [authMode, setAuthMode] = useState<AuthMode>('down')
  const [screen, setScreen] = useState<AppScreen>('welcome')
  const [tab, setTab] = useState<Tab>('home')
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [guest, setGuest] = useState(false)
  const [onboardStep, setOnboardStep] = useState(1)
  const [instruments, setInstruments] = useState<InstrumentId[]>([])
  const [level, setLevel] = useState<LevelId>('beginner')
  const [habits, setHabits] = useState<HabitId[]>(['score'])
  const [goals, setGoals] = useState<string[]>([])
  const [preferredMinutes, setPreferredMinutes] = useState(20)
  const [pieces, setPieces] = useState<Piece[]>([])
  const [pieceId, setPieceId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('')
  const [prepMinutes, setPrepMinutes] = useState(20)
  const [prepGoals, setPrepGoals] = useState<string[]>([])
  const [prepInstrument, setPrepInstrument] = useState<InstrumentId>('piano')
  const [prepLevel, setPrepLevel] = useState<LevelId>('beginner')
  const [prepPassage, setPrepPassage] = useState('')
  const [prepResource, setPrepResource] = useState<ResourceMode>('ear')
  const [prepDifficulties, setPrepDifficulties] = useState('')
  const [prepUsePrevious, setPrepUsePrevious] = useState(true)
  const [worksObs, setWorksObs] = useState('')
  const [improveObs, setImproveObs] = useState('')
  const [comparison, setComparison] = useState('')
  const [compareA, setCompareA] = useState<string>('')
  const [compareB, setCompareB] = useState<string>('')
  const [takes, setTakes] = useState<Take[]>([])
  const [allTakes, setAllTakes] = useState<Take[]>([])
  const [newPiece, setNewPiece] = useState({ title: '', artist: '', genre: 'Pop', instrument: 'piano' as InstrumentId })
  const [showAddPiece, setShowAddPiece] = useState(false)
  const [resourceNote, setResourceNote] = useState('')
  const [saveHint, setSaveHint] = useState('')
  const [takeHint, setTakeHint] = useState('')
  const [profileHint, setProfileHint] = useState('')
  const [tool, setTool] = useState<Tool>('none')
  const [showPlan, setShowPlan] = useState(false)
  // Sprint 05 — DA 4 « Ivoire & marine » appliquée par défaut. Les autres thèmes restent
  // consultables pour comparaison avec ?theme=… dans l’adresse, sans être mémorisés.
  const [switchReq, setSwitchReq] = useState<{ targetId: string; intent: 'prepare' | 'resume'; activeId: string; from: AppScreen } | null>(null)
  const [switchError, setSwitchError] = useState('')
  const [metro, setMetro] = useState<{ bpm: number; running: boolean }>({ bpm: 0, running: false })
  // S7-01 — séance immersive marine par défaut ; le clair est un témoin QA (?seance=clair), sans sélecteur.
  const [seanceClaire] = useState(() => {
    try {
      return new URLSearchParams(window.location.search).get('seance') === 'clair'
    } catch {
      return false
    }
  })
  const [brand] = useState<Theme>(() => {
    try {
      const params = new URLSearchParams(window.location.search)
      const fromUrl = params.get('theme') || params.get('brand')
      const chosen = isTheme(fromUrl) ? fromUrl : 'blanc'
      document.documentElement.dataset.brand = chosen
      return chosen
    } catch {
      return 'blanc'
    }
  })
  const recorder = useMediaRecorder({
    onInterrupted: (blob, seconds) => {
      void saveTakeBlob(blob, seconds, 'interrupted')
    },
  })
  const persistAsked = useRef(false)
  const savingRef = useRef(false)

  const piece = pieceId ? getPiece(pieceId) : null
  const completedLogs = email ? listCompletedSessionLogs(email) : []
  const draftLogs = email ? listDraftSessionLogs(email) : []
  const numbers = useMemo(() => takeNumbers(allTakes), [allTakes])

  useEffect(() => {
    document.documentElement.dataset.brand = brand
    try {
      localStorage.removeItem(THEME_KEY)
    } catch {
      /* ignore */
    }
  }, [brand])

  const refreshPieces = (mail = email) => {
    if (!mail) return
    setPieces(listPieces(mail))
  }

  const loadDiscoveryExamples = (mail = email) => {
    if (!mail) return
    seedDemoPieces(mail)
    setPieces(listPieces(mail))
  }

  const refreshTakes = (mail = email, id = pieceId) => {
    if (!mail) return
    setTakes(id ? listTakes(mail, id) : [])
    setAllTakes(listTakes(mail))
  }

  /** Recharge les préférences musicales sauvegardées (y compris objectifs et durée). */
  function applyMusical(musical: MusicalProfile | null) {
    if (!musical) return
    setInstruments(musical.instruments.length ? musical.instruments : ['piano'])
    setLevel(musical.level)
    setHabits(musical.habits.length ? musical.habits : ['score'])
    setGoals(musical.goals?.length ? musical.goals : [])
    if (musical.preferredMinutes) setPreferredMinutes(musical.preferredMinutes)
  }

  useEffect(() => {
    let alive = true
    ;(async () => {
      const mode = await probeAuthMode()
      if (!alive) return
      setAuthMode(mode)
      const session = await restoreSession()
      if (!alive) return
      if (session?.email) {
        const mail = session.email
        setEmail(mail)
        setFirstName((session.firstName || '').trim())
        setGuest(isGuestEmail(mail))
        const musical = getMusicalProfile(mail)
        applyMusical(musical)
        refreshPieces(mail)
        refreshTakes(mail, null)
        if (musical?.onboardingDone) {
          setScreen('home')
          setTab('home')
          // Rechargement de la page pendant une séance ou un bilan : on revient exactement au même endroit.
          try {
            const where = JSON.parse(sessionStorage.getItem(WHERE_KEY) || 'null') as { pieceId: string; screen: string } | null
            const target = where ? getPiece(where.pieceId) : null
            if (target?.program?.steps?.length && target.email === mail && pieceInProgressFor(mail, target)) {
              setPieceId(target.id)
              refreshTakes(mail, target.id)
              if (where!.screen === 'review') openReview(target, mail)
              else setScreen('session')
            }
          } catch {
            /* ignore */
          }
        } else {
          setOnboardStep(1)
          setScreen('onboarding')
        }
      } else {
        setScreen('welcome')
      }
      setBoot(false)
    })()
    return () => {
      alive = false
    }
  }, [])

  useEffect(() => {
    const id = window.setInterval(() => {
      void probeAuthMode().then(setAuthMode)
    }, 20000)
    return () => window.clearInterval(id)
  }, [])

  // Quitter l’écran de travail pendant un enregistrement : la prise est arrêtée et sauvegardée.
  useEffect(() => {
    if (recorder.status === 'recording' && screen !== 'session' && screen !== 'record') {
      void stopAndSaveTake()
    }
    setTool('none')
    window.scrollTo?.(0, 0)
  }, [screen])

  // Où en est la séance en cours : persisté dans le programme (reprise depuis l’accueil, même après
  // fermeture) et, pour le rechargement de la page, dans la session du navigateur.
  useEffect(() => {
    // Pendant le chargement, l’écran initial ne doit pas effacer la position à restaurer.
    if (boot) return
    const working = (screen === 'session' || screen === 'review') && piece?.program && email && pieceInProgressFor(email, piece)
    try {
      if (working) sessionStorage.setItem(WHERE_KEY, JSON.stringify({ pieceId: piece!.id, screen }))
      else if (screen !== 'record') sessionStorage.removeItem(WHERE_KEY)
    } catch {
      /* ignore */
    }
    if (working && piece!.program!.phase !== screen) {
      savePiece({ ...piece!, program: { ...piece!.program!, phase: screen as 'session' | 'review' } })
      refreshPieces()
    }
  }, [screen, pieceId, boot])

  const goTab = (next: Tab) => {
    setTab(next)
    setShowAddPiece(false)
    if (next === 'follow') refreshTakes(email, pieceId)
    setScreen(next)
  }

  function hydratePrep(target: Piece) {
    const musical = email ? getMusicalProfile(email) : null
    const profileGoals = musical?.goals?.length ? musical.goals : goals
    setPrepGoals(prepGoalsFor(target, profileGoals))
    setPrepMinutes(musical?.preferredMinutes || preferredMinutes || 20)
    setPrepLevel(musical?.level || level)
    setPrepInstrument(target.instrument)
    setPrepPassage(target.passages || '')
    const previous = target.program?.resource
    setPrepResource(previous && resourceAvailable(target, previous) ? previous : defaultResource(target, musical?.habits || habits))
    setPrepDifficulties('')
    setPrepUsePrevious(true)
  }

  /** Dernière séance terminée du morceau, avec le programme qui l’a produite (si c’est bien le même). */
  function previousFor(target: Piece | null) {
    if (!target || !email) return null
    const log = listCompletedSessionLogs(email, target.id)[0]
    if (!log) return null
    const program =
      target.program && (target.program.startedAt || target.program.updatedAt) === log.sessionStartedAt ? target.program : null
    return previousSessionFrom(log, program, { instrument: target.instrument, level: target.program?.level || level })
  }

  const sessionStart = (p: Piece | null) => p?.program?.startedAt || p?.program?.updatedAt || ''

  // Prises de la séance ouverte uniquement (S7-07) : identifiant de séance, ou date pour les anciennes.
  const sessionTakes = useMemo(() => {
    if (!piece?.program) return []
    return takesOfSession(takes, sessionStart(piece))
  }, [takes, piece?.program?.startedAt, piece?.program?.updatedAt])

  const resumePracticeFor = (id: string) => {
    const target = getPiece(id)
    if (!target) return
    setPieceId(id)
    refreshTakes(email, id)
    if (target.program?.steps?.length) {
      // Bilan commencé : on y revient directement, observations comprises.
      if (target.program.phase === 'review') openReview(target)
      else setScreen('session')
      return
    }
    hydratePrep(target)
    setScreen('prepare')
  }

  const startPracticeFor = (id: string) => {
    const target = getPiece(id)
    if (!target) return
    setPieceId(id)
    refreshTakes(email, id)
    hydratePrep(target)
    setScreen('prepare')
  }

  const startPracticeFromHome = () => {
    if (inProgressPiece) resumePracticeFor(inProgressPiece.id)
    else if (lastCompletedPiece) requestPractice(lastCompletedPiece.id, 'prepare')
    else if (lastPiece) requestPractice(lastPiece.id, 'prepare')
    else goTab('library')
  }

  /**
   * S7-06 — avant de changer de morceau (ou de recommencer le même), la séance active est
   * présentée avec son étape et ses prises : la reprendre, ou la garder en brouillon et changer.
   */
  function requestPractice(targetId: string, intent: 'prepare' | 'resume') {
    const target = getPiece(targetId)
    if (!target) return
    setSwitchError('')
    if (intent === 'prepare' && isPieceInProgress(target)) {
      setSwitchReq({ targetId, intent, activeId: targetId, from: screen })
      setPieceId(targetId)
      setScreen('switch')
      return
    }
    const active = inProgressPiece
    if (active && active.id !== targetId) {
      setSwitchReq({ targetId, intent, activeId: active.id, from: screen })
      setScreen('switch')
      return
    }
    if (intent === 'resume') resumePracticeFor(targetId)
    else startPracticeFor(targetId)
  }

  /** Enregistre la séance d’un morceau comme brouillon (exception si le stockage échoue). */
  function saveDraftOf(p: Piece, archive: boolean) {
    if (!p.program || !email) return
    const key = sessionStart(p)
    const existing = findSessionLog(email, p.id, key)
    if (existing?.status === 'completed') return
    const log: SessionLog = {
      id: existing?.id || newId('log'),
      sessionStartedAt: key || undefined,
      email,
      pieceId: p.id,
      createdAt: new Date().toISOString(),
      minutes: p.program.minutes,
      objective: p.program.objective || p.objective || '',
      observationWorks: existing?.observationWorks || '',
      observationImprove: existing?.observationImprove || '',
      nextStep: 'Brouillon — séance non terminée.',
      takeIds: takesOfSession(listTakes(email, p.id), key).map((t) => t.id),
      source: 'user',
      status: 'draft',
      stepChecks: p.program.steps.filter((s) => s.check).map((s) => ({ title: s.title, check: s.check as StepCheck })),
      comparison: existing?.comparison,
      programSnapshot: archive ? p.program : existing?.programSnapshot,
    }
    saveSessionLog(log)
  }

  function keepAndSwitch() {
    if (!switchReq) return
    const active = getPiece(switchReq.activeId)
    try {
      if (active) saveDraftOf(active, switchReq.activeId === switchReq.targetId)
    } catch {
      // Échec de sauvegarde : rien ne change, la séance active reste accessible.
      setSwitchError('Le brouillon n’a pas pu être enregistré sur cet appareil (stockage plein ou indisponible). Rien n’a été changé : réessaie, ou reprends la séance en cours.')
      return
    }
    const { targetId, intent } = switchReq
    setSwitchReq(null)
    setSwitchError('')
    if (intent === 'resume') resumePracticeFor(targetId)
    else startPracticeFor(targetId)
  }

  /** Reprend un brouillon mis de côté depuis le Suivi (sa séance redevient la séance du morceau). */
  function resumeArchivedDraft(log: SessionLog) {
    const p = getPiece(log.pieceId)
    if (!p || !log.programSnapshot) return
    try {
      if (p.program && isPieceInProgress(p) && sessionStart(p) !== log.sessionStartedAt) saveDraftOf(p, true)
      const now = new Date().toISOString()
      savePiece({ ...p, program: { ...log.programSnapshot }, updatedAt: now, lastWorkedAt: now })
    } catch {
      setSaveHint('Le brouillon n’a pas pu être repris (stockage indisponible). Rien n’a été changé.')
      return
    }
    refreshPieces()
    resumePracticeFor(p.id)
  }

  const openPiece = (id: string) => {
    setPieceId(id)
    refreshTakes(email, id)
    setScreen('piece')
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return pieces.filter((p) => {
      if (genre && p.genre !== genre) return false
      if (!q) return true
      return `${p.title} ${p.artist} ${p.genre}`.toLowerCase().includes(q)
    })
  }, [pieces, query, genre])

  const lastPiece =
    pieces.find((p) => p.lastWorkedAt && !p.demo) ||
    pieces.find((p) => p.lastWorkedAt) ||
    pieces.find((p) => !p.demo) ||
    null

  const isPieceInProgress = (p: Piece | null) => (email ? pieceInProgressFor(email, p) : false)

  // Séance active : la séance en cours travaillée le plus récemment (S7-06).
  const inProgressPiece =
    [...pieces]
      .filter((p) => isPieceInProgress(p))
      .sort((a, b) => (b.lastWorkedAt || b.updatedAt).localeCompare(a.lastWorkedAt || a.updatedAt))[0] || null

  const lastCompletedLog = completedLogs[0] || null
  const lastCompletedPiece = lastCompletedLog ? getPiece(lastCompletedLog.pieceId) : null

  const activeGenres = useMemo(() => {
    const present = new Set(pieces.map((p) => p.genre).filter(Boolean))
    return DEMO_GENRES.filter((g) => present.has(g))
  }, [pieces])

  /** Préférences musicales et saisies en cours remises à zéro : rien ne passe d’un compte à l’autre. */
  function resetUserState() {
    setInstruments([])
    setLevel('beginner')
    setHabits(['score'])
    setGoals([])
    setPreferredMinutes(20)
    setOnboardStep(1)
    setNewPiece({ title: '', artist: '', genre: 'Pop', instrument: 'piano' })
    setShowAddPiece(false)
    setQuery('')
    setGenre('')
    setWorksObs('')
    setImproveObs('')
    setComparison('')
    setCompareA('')
    setCompareB('')
    setSaveHint('')
    setTakeHint('')
    setProfileHint('')
    setResourceNote('')
    try {
      sessionStorage.removeItem(WHERE_KEY)
    } catch {
      /* ignore */
    }
  }

  function enterAfterAuth(profile: UserProfile) {
    resetUserState()
    setGuest(false)
    setEmail(profile.email)
    setFirstName((profile.firstName || '').trim())
    refreshPieces(profile.email)
    refreshTakes(profile.email, null)
    const musical = getMusicalProfile(profile.email)
    applyMusical(musical)
    if (musical?.onboardingDone) {
      setScreen('home')
      setTab('home')
      return
    }
    setScreen('onboarding')
    setOnboardStep(1)
  }

  function ensureGuestShell() {
    const mail = GUEST_EMAIL
    setGuest(true)
    setEmail(mail)
    setSessionEmail(mail)
    setFirstName((firstName || '').trim())
    refreshPieces(mail)
    refreshTakes(mail, null)
    return mail
  }

  function startJourney() {
    const mail = ensureGuestShell()
    const musical = getMusicalProfile(mail)
    applyMusical(musical)
    if (musical?.onboardingDone) {
      setScreen('home')
      setTab('home')
      return
    }
    setOnboardStep(1)
    setScreen('onboarding')
  }

  function enterDiscovery() {
    const mail = ensureGuestShell()
    const existing = getMusicalProfile(mail)
    saveMusicalProfile({
      email: mail,
      instruments: existing?.instruments?.length ? existing.instruments : instruments.length ? instruments : ['piano'],
      level: existing?.level || level,
      habits: existing?.habits?.length ? existing.habits : habits.length ? habits : ['score'],
      goals: existing?.goals?.length ? existing.goals : goals.length ? goals : [OBJECTIVES[0]],
      preferredMinutes: existing?.preferredMinutes || preferredMinutes,
      onboardingDone: true,
      updatedAt: new Date().toISOString(),
    })
    applyMusical(getMusicalProfile(mail))
    loadDiscoveryExamples(mail)
    setScreen('home')
    setTab('home')
  }

  function finishOnboarding() {
    if (!email || !instruments.length || !goals.length) return
    const resolvedHabits = habits.length ? habits : (['score'] as HabitId[])
    setHabits(resolvedHabits)
    saveMusicalProfile({
      email,
      instruments,
      level,
      habits: resolvedHabits,
      goals,
      preferredMinutes,
      onboardingDone: true,
      updatedAt: new Date().toISOString(),
    })
    setNewPiece((p) => ({ ...p, instrument: instruments[0] }))
    refreshPieces()
    setScreen('home')
    setTab('home')
  }

  function saveProfileEdits() {
    if (!email) return
    if (!instruments.length || !goals.length) {
      setProfileHint('Choisis au moins un instrument et un objectif.')
      return
    }
    saveMusicalProfile({
      email,
      instruments,
      level,
      habits,
      goals,
      preferredMinutes,
      onboardingDone: true,
      updatedAt: new Date().toISOString(),
    })
    setPieces(listPieces(email))
    setProfileHint('Profil enregistré. Tes prochaines préparations de séance en tiendront compte.')
  }

  function createPiece() {
    if (!email || !newPiece.title.trim()) return
    const now = new Date().toISOString()
    const created: Piece = {
      id: newId('piece'),
      email,
      title: newPiece.title.trim(),
      artist: newPiece.artist.trim(),
      instrument: newPiece.instrument,
      genre: newPiece.genre,
      objective: '',
      passages: '',
      notes: '',
      resources: [],
      program: null,
      createdAt: now,
      updatedAt: now,
      lastWorkedAt: null,
    }
    savePiece(created)
    setShowAddPiece(false)
    setNewPiece({ title: '', artist: '', genre: 'Pop', instrument: instruments[0] || 'piano' })
    refreshPieces()
    openPiece(created.id)
  }

  async function importPdf(file: File | null) {
    if (!file || !piece || !email) return
    const id = newId('pdf')
    await putBlob(id, file)
    const next: Piece = {
      ...piece,
      resources: [...piece.resources, { id, kind: 'pdf', label: file.name, demo: false }],
      updatedAt: new Date().toISOString(),
    }
    savePiece(next)
    refreshPieces()
    setPieceId(next.id)
  }

  function addTextResource(kind: 'chords' | 'tabs' | 'video' | 'audio' | 'note') {
    if (!piece || !resourceNote.trim()) return
    const next: Piece = {
      ...piece,
      resources: [...piece.resources, { id: newId('res'), kind, label: resourceNote.trim(), text: resourceNote.trim() }],
      updatedAt: new Date().toISOString(),
    }
    savePiece(next)
    setResourceNote('')
    refreshPieces()
    setPieceId(next.id)
  }

  function updatePieceFields(patch: Partial<Piece>) {
    if (!piece) return
    const next = { ...piece, ...patch, updatedAt: new Date().toISOString() }
    savePiece(next)
    refreshPieces()
    setPieceId(next.id)
  }


  const prepPrevious = useMemo(() => (screen === 'prepare' ? previousFor(piece) : null), [piece?.id, piece?.program?.startedAt, screen, email])

  const prepPreview = useMemo(() => {
    if (!piece || screen !== 'prepare') return null
    return buildProgram({
      piece,
      instrument: prepInstrument,
      level: prepLevel,
      minutes: prepMinutes,
      goals: prepGoals,
      passage: prepPassage,
      resource: prepResource,
      difficulties: prepDifficulties,
      previous: prepUsePrevious ? prepPrevious : null,
    })
  }, [piece?.id, screen, prepInstrument, prepLevel, prepMinutes, prepGoals, prepPassage, prepResource, prepDifficulties, prepUsePrevious, prepPrevious])

  function confirmProgram() {
    if (!piece || !email || !prepGoals.length) return
    const program = buildProgram({
      piece,
      instrument: prepInstrument,
      level: prepLevel,
      minutes: prepMinutes,
      goals: prepGoals,
      passage: prepPassage,
      resource: prepResource,
      difficulties: prepDifficulties,
      previous: prepUsePrevious ? previousFor(piece) : null,
    })
    const now = new Date().toISOString()
    const next: Piece = {
      ...piece,
      instrument: prepInstrument,
      passages: prepPassage.trim(),
      objective: prepGoals[0],
      program,
      updatedAt: now,
      lastWorkedAt: now,
    }
    savePiece(next)
    refreshPieces()
    setPieceId(next.id)
    refreshTakes(email, next.id)
    setWorksObs('')
    setImproveObs('')
    setComparison('')
    setSaveHint('')
    setTakeHint('')
    setScreen('session')
  }

  // S7-04 / T07 — à la dernière étape, « Faire le bilan » devient l’action principale et reçoit le focus.
  const reviewBtnRef = useRef<HTMLButtonElement | null>(null)
  const stepPos = piece?.program ? `${piece.id}:${piece.program.stepIndex}:${piece.program.steps.length}` : ''
  useEffect(() => {
    if (screen !== 'session' || !piece?.program) return
    if (piece.program.stepIndex >= piece.program.steps.length - 1) reviewBtnRef.current?.focus()
  }, [stepPos, screen])

  /** S7-06 — temps restant de l’étape sauvegardé à chaque seconde (sans recharger l’écran). */
  function saveTimer(stepId: string, left: number) {
    const cur = pieceId ? getPiece(pieceId) : null
    if (!cur?.program) return
    try {
      savePiece({ ...cur, program: { ...cur.program, timer: { stepId, left } } })
    } catch {
      /* le minuteur reste affiché ; la sauvegarde sera retentée à la seconde suivante */
    }
  }

  function setStepIndex(index: number) {
    if (!piece?.program) return
    const max = piece.program.steps.length - 1
    updatePieceFields({ program: { ...piece.program, stepIndex: Math.max(0, Math.min(max, index)) } })
  }

  function setStepCheck(stepId: string, check: StepCheck) {
    if (!piece?.program) return
    const steps = piece.program.steps.map((s) =>
      s.id === stepId ? { ...s, check: s.check === check ? undefined : check } : s,
    )
    updatePieceFields({ program: { ...piece.program, steps } })
  }

  async function stopAndSaveTake(cause: 'user' | 'hidden' = 'user') {
    if (savingRef.current) return
    savingRef.current = true
    try {
      setTakeHint('')
      const seconds = recorder.seconds
      const blob = await recorder.stop()
      await saveTakeBlob(blob, seconds, cause)
    } finally {
      savingRef.current = false
    }
  }

  /** Sauvegarde une prise capturée (arrêt demandé ou interruption par le système). */
  async function saveTakeBlob(blob: Blob | null, seconds: number, cause: 'user' | 'interrupted' | 'hidden') {
    const current = pieceId ? getPiece(pieceId) : null
    if (!current || !email) return
    {
      if (!blob || blob.size === 0) {
        setTakeHint(
          cause === 'interrupted'
            ? 'L’enregistrement a été interrompu par l’appareil (appel, écran verrouillé, micro coupé) avant d’avoir capté du son. Rien n’a été sauvegardé : relance la prise.'
            : 'Aucun son n’a été capté : rien n’a été sauvegardé. Réessaie l’enregistrement.',
        )
        return
      }
      // S7-07 — la prise n’est annoncée sauvegardée que si elle est lisible.
      const duration = await playableDuration(blob)
      const unreadable = duration === null
      const takeId = newId('take')
      try {
        await putBlob(takeId, blob)
      } catch {
        setTakeHint('La prise n’a pas pu être sauvegardée sur cet appareil (espace de stockage plein ou navigation privée ?). Libère de l’espace puis réessaie.')
        return
      }
      if (!persistAsked.current) {
        persistAsked.current = true
        // Demande au navigateur de ne pas effacer les prises en cas de manque d’espace.
        void navigator.storage?.persist?.().catch(() => false)
      }
      const step = current.program?.steps[Math.min(current.program.stepIndex, current.program.steps.length - 1)]
      const inSession = screen === 'session' && Boolean(current.program)
      // Tempo réellement utilisé : métronome en marche, sinon tempo de la consigne ; sinon inconnu.
      const bpm = metro.running && metro.bpm > 0 ? metro.bpm : inSession && step?.bpm ? step.bpm : undefined
      const take: Take = {
        id: takeId,
        email,
        pieceId: current.id,
        // Seul un passage réellement saisi est enregistré (jamais l’objectif à sa place).
        passage: current.passages || current.program?.passage || '',
        createdAt: new Date().toISOString(),
        seconds: duration && duration > 0 ? Math.max(1, Math.round(duration)) : Math.max(0, seconds),
        mime: blob.type || 'audio/webm',
        stepTitle: inSession ? step?.title : undefined,
        sessionStartedAt: inSession ? sessionStart(current) || undefined : undefined,
        bpm,
        unreadable: unreadable || undefined,
      }
      saveTakeMeta(take)
      savePiece({ ...current, lastWorkedAt: new Date().toISOString(), updatedAt: new Date().toISOString() })
      refreshPieces()
      refreshTakes(email, current.id)
      if (unreadable) {
        setTakeHint('Le son capté n’est pas lisible sur cet appareil. La prise est conservée dans le Suivi, mais elle ne sera ni réécoutée ni comparée : réessaie l’enregistrement.')
        return
      }
      setTakeHint(
        cause === 'interrupted'
          ? `Enregistrement interrompu par l’appareil (appel, écran verrouillé ou micro coupé). La partie captée est sauvegardée (${fmt(take.seconds)}).`
          : cause === 'hidden'
            ? `L’application est passée en arrière-plan : la prise a été arrêtée et sauvegardée (${fmt(take.seconds)}).`
            : `Prise sauvegardée sur cet appareil (${fmt(take.seconds)}).`,
      )
    }
  }

  // Application mise en arrière-plan pendant une prise (changement d’app, écran verrouillé) :
  // la prise est arrêtée et sauvegardée tout de suite, avant que le système ne coupe le micro.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden' && recorder.status === 'recording') void stopAndSaveTake('hidden')
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('pagehide', onHide)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('pagehide', onHide)
    }
  })

  function toggleRecording() {
    setTakeHint('')
    if (recorder.status === 'recording') void stopAndSaveTake()
    else void recorder.start()
  }

  async function removeTake(id: string) {
    await deleteBlob(id)
    deleteTakeMeta(id)
    if (compareA === id) setCompareA('')
    if (compareB === id) setCompareB('')
    refreshTakes()
  }

  function openReview(target: Piece | null = piece, mail = email) {
    if (!target) return
    const pieceTakes = listTakes(mail, target.id)
    setCompareA(pieceTakes[1]?.id || '')
    setCompareB(pieceTakes[0]?.id || '')
    // Reprise d’un brouillon : ses observations reviennent dans le bilan.
    const draft = findSessionLog(mail, target.id, sessionStart(target))
    if (draft?.status === 'draft') {
      if (!worksObs.trim()) setWorksObs(draft.observationWorks || '')
      if (!improveObs.trim()) setImproveObs(draft.observationImprove || '')
      if (!comparison.trim()) setComparison(draft.comparison || '')
    }
    setSaveHint('')
    setScreen('review')
  }

  const review = piece
    ? buildReview({
        works: worksObs,
        improve: improveObs,
        programObjective: piece.program?.objective || piece.objective || '',
        instrument: piece.program?.instrument || piece.instrument,
        level: piece.program?.level || level,
        steps: piece.program?.steps,
        takes: sessionTakes,
        hasReferenceTake: takes.length > 0,
      })
    : null

  // S7-08 — bilan anticipé sans aucun travail évalué : pas de bilan, reprise ou brouillon.
  const reviewNoWork =
    Boolean(piece) &&
    !sessionTakes.some((t) => !t.unreadable) &&
    !(piece?.program?.steps || []).some((s) => s.check) &&
    !worksObs.trim() &&
    !improveObs.trim()

  function persistSession(status: 'draft' | 'completed') {
    if (!piece || !email || !review) return false
    const takeIds = sessionTakes.map((t) => t.id)
    if (status === 'completed' && !canCompleteSession({ takeIds, observationWorks: worksObs, observationImprove: improveObs, stepChecks: (piece.program?.steps || []).filter((s) => s.check).length })) {
      setSaveHint('Pour terminer la séance, enregistre au moins une prise, note une observation ou évalue une étape.')
      return false
    }
    const sessionKey = sessionStart(piece)
    const existing = findSessionLog(email, piece.id, sessionKey)
    if (existing?.status === 'completed' && status === 'draft') {
      setSaveHint('Cette séance est déjà terminée : elle reste comptée comme terminée.')
      return false
    }
    const stepChecks = (piece.program?.steps || [])
      .filter((s) => s.check)
      .map((s) => ({ title: s.title, check: s.check as StepCheck }))
    const log: SessionLog = {
      // Même séance = même journal : terminer un brouillon le remplace au lieu de le dupliquer.
      id: existing?.id || newId('log'),
      sessionStartedAt: sessionKey || undefined,
      email,
      pieceId: piece.id,
      createdAt: new Date().toISOString(),
      minutes: piece.program?.minutes || prepMinutes,
      objective: piece.program?.objective || piece.objective || '',
      observationWorks: worksObs.trim(),
      observationImprove: improveObs.trim(),
      nextStep: status === 'completed' ? review.next.text : 'Brouillon — séance non terminée.',
      takeIds,
      source: 'user',
      status,
      corrective: status === 'completed' && review.followup ? `${review.corrective.title} — ${review.corrective.text}` : undefined,
      followup: status === 'completed' ? review.followup : undefined,
      stepChecks,
      comparison: comparison.trim() || undefined,
    }
    saveSessionLog(log)
    if (status === 'completed') {
      savePiece({ ...piece, lastWorkedAt: log.createdAt, updatedAt: log.createdAt })
      refreshPieces()
    }
    setSaveHint('')
    return true
  }

  // Sprint 05 — les observations du bilan sont gardées en brouillon pendant la saisie :
  // fermer l’application ne les perd plus. Une séance déjà terminée n’est jamais repassée en brouillon.
  useEffect(() => {
    if (screen !== 'review' || !piece || !email) return
    if (!worksObs.trim() && !improveObs.trim() && !comparison.trim()) return
    const id = window.setTimeout(() => {
      const existing = findSessionLog(email, piece.id, sessionStart(piece))
      if (existing?.status === 'completed') return
      persistSession('draft')
    }, 600)
    return () => window.clearTimeout(id)
  }, [worksObs, improveObs, comparison, screen])

  function saveReview() {
    if (!persistSession('completed')) return
    setScreen('follow')
    setTab('follow')
  }

  function saveDraftReview() {
    if (!persistSession('draft')) return
    setScreen('home')
    setTab('home')
  }

  async function logout() {
    if (recorder.status === 'recording') await recorder.stop()
    await signOutV0()
    resetUserState()
    setGuest(false)
    setEmail('')
    setFirstName('')
    setPieces([])
    setPieceId(null)
    setTakes([])
    setAllTakes([])
    setScreen('welcome')
  }

  if (boot) {
    return (
      <div className="v0-app nodock">
        <div className="v0-main">
          <p className="ds-lead">Chargement d’Aria…</p>
        </div>
      </div>
    )
  }

  // L’onglet actif découle de l’écran affiché, jamais du chemin suivi pour y arriver :
  // fiche morceau, préparation, séance, enregistrement et bilan appartiennent à la Bibliothèque.
  const activeTab: Tab =
    screen === 'home' || screen === 'follow' || screen === 'profile' ? screen : 'library'
  void tab

  // S7-05 — pendant une prise, navigation et changement d’étape ou de bilan sont indisponibles.
  const capturing = recorder.status === 'recording'

  const docked = ['home', 'library', 'follow', 'profile', 'piece', 'prepare', 'session', 'record', 'review', 'switch'].includes(screen)

  const toggleIn = <T,>(list: T[], value: T, max = 99) =>
    list.includes(value) ? list.filter((x) => x !== value) : list.length >= max ? [...list.slice(1), value] : [...list, value]

  const takeLabel = (t: Take) => `Prise ${numbers.get(t.id) || ''}`.trim()
  // S7-07 — « passage · tempo · durée » dans un ordre stable, puis la date et l’étape.
  const takeDetail = (t: Take) =>
    `${takeMeta(t, fmt)} · ${new Date(t.createdAt).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}${
      t.stepTitle ? ` · ${t.stepTitle}` : ''
    }${t.unreadable ? ' · illisible' : ''}`

  const resourcesPanel = piece ? (
    <div className="ds-panel">
      {piece.resources.length ? (
        <ResourceList resources={piece.resources} />
      ) : (
        <p className="ds-hint">Aucune ressource pour ce morceau. Tu peux en ajouter depuis sa fiche (partition, accords, tablature…).</p>
      )}
    </div>
  ) : null

  const notesPanel = piece ? (
    <div className="ds-panel">
      <label className="ds-label" htmlFor="session-notes">
        Notes personnelles
      </label>
      <textarea
        id="session-notes"
        className="ds-field"
        value={piece.notes}
        placeholder="Ce que tu veux retenir pendant la séance…"
        onChange={(e) => updatePieceFields({ notes: e.target.value })}
      />
    </div>
  ) : null

  const currentStep =
    piece?.program?.steps[Math.min(piece.program.stepIndex, piece.program.steps.length - 1)] || null

  return (
    <div className={`v0-app${docked ? '' : ' nodock'}${capturing ? ' is-capturing' : ''}${screen === 'session' && !seanceClaire ? ' is-immersive' : ''}`}>
      {authMode !== 'cloud' && screen !== 'welcome' ? (
        <div className="ds-statusbar" role="status">
          <Icon name="info" size={16} />
          {authMode === 'down'
            ? 'Cloud indisponible : tes données restent sur cet appareil.'
            : 'Mode local : tes données restent sur cet appareil.'}
        </div>
      ) : null}

      {screen === 'welcome' ? (
        <section className="v0-welcome">
          <div className="v0-welcome-bg" aria-hidden />
          <div className="v0-welcome-copy">
            <p className="v0-brand">ARIA</p>
            <p className="v0-slogan">Just Play Something.</p>
            <p className="v0-tag">Travaille et joue tes morceaux, sans professeur.</p>
            <div className="ds-stack">
              <button className="ds-btn ds-btn--light" type="button" onClick={startJourney}>
                Commencer
              </button>
              <button className="ds-btn ds-btn--link-light" type="button" onClick={() => setScreen('auth')}>
                Se connecter
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {screen === 'auth' ? (
        <div className="v0-auth-legacy">
          <AuthGate
            profile={{ firstName, lastName: '', email, phone: '' }}
            onProfileLoaded={enterAfterAuth}
            onNext={() => {
              /* enterAfterAuth already navigates */
            }}
            onCancel={() => setScreen('welcome')}
            onSkip={enterDiscovery}
          />
        </div>
      ) : null}

      {screen === 'onboarding' ? (
        <section className="v0-main">
          <div className="ds-progress" aria-hidden>
            <i style={{ ['--p' as string]: `${Math.round((onboardStep / 4) * 100)}%` }} />
          </div>
          <p className="ds-overline">Étape {onboardStep} sur 4</p>
          {onboardStep === 1 ? (
            <>
              <h1 className="ds-h1">Quels instruments joues-tu ?</h1>
              <p className="ds-lead">Tu peux en choisir plusieurs.</p>
              <div className="v0-inst-grid">
                {INSTRUMENTS.map((item) => {
                  const on = instruments.includes(item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      aria-pressed={on}
                      className={`v0-inst${on ? ' on' : ''}`}
                      onClick={() => setInstruments((prev) => toggleIn(prev, item.id))}
                    >
                      <Icon name={INSTRUMENT_ICON[item.id]} size={40} className="v0-inst-icon" />
                      {item.label}
                      {on ? <Icon name="check" size={16} className="v0-inst-check" /> : null}
                    </button>
                  )
                })}
              </div>
              <div className="ds-actions">
                <button className="ds-btn ds-btn--primary" type="button" disabled={!instruments.length} onClick={() => setOnboardStep(2)}>
                  Continuer
                </button>
              </div>
            </>
          ) : null}
          {onboardStep === 2 ? (
            <>
              <h1 className="ds-h1">Quel est ton niveau ?</h1>
              <p className="ds-lead">ARIA adapte le tempo de départ et la taille des passages.</p>
              <div className="ds-stack">
                {LEVELS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={level === item.id}
                    className={`ds-option${level === item.id ? ' is-on' : ''}`}
                    onClick={() => setLevel(item.id)}
                  >
                    <b>{item.label}</b>
                    <span>{item.hint}</span>
                  </button>
                ))}
              </div>
              <div className="ds-actions ds-actions--split">
                <button className="ds-btn ds-btn--secondary" type="button" onClick={() => setOnboardStep(1)}>
                  Retour
                </button>
                <button className="ds-btn ds-btn--primary" type="button" onClick={() => setOnboardStep(3)}>
                  Continuer
                </button>
              </div>
            </>
          ) : null}
          {onboardStep === 3 ? (
            <>
              <h1 className="ds-h1">Sur quoi veux-tu progresser ?</h1>
              <p className="ds-lead">Un ou plusieurs objectifs. Le premier choisi sera ton objectif principal.</p>
              <div className="ds-chips">
                {OBJECTIVES.map((o) => {
                  const idx = goals.indexOf(o)
                  return (
                    <button
                      key={o}
                      type="button"
                      aria-pressed={idx >= 0}
                      className={`ds-chip${idx >= 0 ? ' is-on' : ''}`}
                      onClick={() => setGoals((prev) => toggleIn(prev, o))}
                    >
                      {idx >= 0 ? <Icon name="check" size={16} /> : null}
                      {o}
                      {idx === 0 ? <small>principal</small> : null}
                    </button>
                  )
                })}
              </div>
              <div className="ds-actions ds-actions--split">
                <button className="ds-btn ds-btn--secondary" type="button" onClick={() => setOnboardStep(2)}>
                  Retour
                </button>
                <button className="ds-btn ds-btn--primary" type="button" disabled={!goals.length} onClick={() => setOnboardStep(4)}>
                  Continuer
                </button>
              </div>
            </>
          ) : null}
          {onboardStep === 4 ? (
            <>
              <h1 className="ds-h1">Combien de temps as-tu ?</h1>
              <p className="ds-lead">Durée habituelle d’une séance. Tu pourras l’ajuster à chaque fois.</p>
              <div className="ds-chips">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={preferredMinutes === d}
                    className={`ds-chip${preferredMinutes === d ? ' is-on' : ''}`}
                    onClick={() => setPreferredMinutes(d)}
                  >
                    {d} min
                  </button>
                ))}
              </div>
              <div className="ds-actions ds-actions--split">
                <button className="ds-btn ds-btn--secondary" type="button" onClick={() => setOnboardStep(3)}>
                  Retour
                </button>
                <button className="ds-btn ds-btn--primary" type="button" onClick={finishOnboarding}>
                  Entrer dans Aria
                </button>
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      {screen === 'home' ? (
        <section className="v0-main">
          <div className="ds-topbar">
            <p className="v0-home-brand">ARIA</p>
            <span />
            <button className="v0-avatar" type="button" aria-label="Ouvrir le profil" onClick={() => goTab('profile')}>
              {(firstName || 'A').slice(0, 1).toUpperCase()}
            </button>
          </div>
          {/* « Bonjour, » seulement si le prénom est connu (correction Sprint 03). */}
          {firstName ? <p className="ds-greeting">Bonjour {firstName},</p> : null}
          <h1 className="ds-h1 ds-h1--home">Envie de jouer ?</h1>
          <p className="ds-lead v0-slogan">Just Play Something.</p>
          {inProgressPiece ? (
            <div className="ds-stack">
            <button className="v0-resume" type="button" onClick={() => resumePracticeFor(inProgressPiece.id)}>
              <span className="v0-resume-visual" aria-hidden />
              <span className="v0-resume-body">
                <small>
                  {inProgressPiece.program?.phase === 'review' ? 'Bilan commencé' : 'Séance en cours'}
                  {inProgressPiece.program && inProgressPiece.program.phase !== 'review'
                    ? ` · étape ${Math.min(inProgressPiece.program.stepIndex + 1, inProgressPiece.program.steps.length)}/${inProgressPiece.program.steps.length} · ${inProgressPiece.program.minutes} min`
                    : ''}
                </small>
                <b>{inProgressPiece.title}</b>
                {inProgressPiece.program?.passage ? <span className="v0-resume-meta">{inProgressPiece.program.passage}</span> : null}
                <span className="v0-resume-cta">
                  <Icon name="play" size={18} />
                  <span>{inProgressPiece.program?.phase === 'review' ? 'Reprendre mon bilan' : 'Reprendre ma séance'}</span>
                  <span />
                </span>
              </span>
            </button>
            <button className="ds-btn ds-btn--secondary" type="button" onClick={() => goTab('library')}>
              Choisir un morceau
            </button>
            </div>
          ) : lastCompletedPiece ? (
            <div className="ds-stack">
              <button className="v0-resume" type="button" onClick={() => requestPractice(lastCompletedPiece.id, 'prepare')}>
                <span className="v0-resume-visual" aria-hidden />
                <span className="v0-resume-body">
                  <small>Prochaine séance</small>
                  <b>{lastCompletedPiece.title}</b>
                  <span className="v0-resume-cta">
                    <Icon name="play" size={18} />
                    <span>Nouvelle séance</span>
                    <span />
                  </span>
                </span>
              </button>
              {lastCompletedLog?.nextStep ? (
                <div className="ds-card ds-card--accent">
                  <span className="ds-overline">Conseil pour la prochaine séance</span>
                  <p className="ds-body">{lastCompletedLog.nextStep}</p>
                </div>
              ) : null}
              <button className="ds-btn ds-btn--secondary" type="button" onClick={() => openPiece(lastCompletedPiece.id)}>
                Voir le bilan
              </button>
            </div>
          ) : (
            <button className="v0-resume" type="button" onClick={() => goTab('library')}>
              <span className="v0-resume-visual" aria-hidden />
              <span className="v0-resume-body">
                <small>Commencer</small>
                <b>Ajouter ou choisir un morceau</b>
                <span className="v0-resume-cta">
                  <Icon name="library" size={18} />
                  <span>Ouvrir la bibliothèque</span>
                  <span />
                </span>
              </span>
            </button>
          )}
          <Section title="Mes accès rapides">
            <div className="v0-quick">
              <button type="button" onClick={startPracticeFromHome}>
                <Icon name="play" />
                Pratiquer
              </button>
              <button type="button" onClick={() => goTab('library')}>
                <Icon name="library" />
                Bibliothèque
              </button>
              <button type="button" onClick={() => goTab('follow')}>
                <Icon name="follow" />
                Suivi
              </button>
            </div>
          </Section>
          <Section title="Séances terminées">
            <div className="ds-stack">
              {completedLogs.length ? (
                completedLogs.slice(0, 4).map((log) => {
                  const p = getPiece(log.pieceId)
                  return (
                    <button key={log.id} className="ds-row-card" type="button" onClick={() => openPiece(log.pieceId)}>
                      <PieceThumb instrument={p?.instrument} seed={p?.id || log.pieceId} />
                      <span className="ds-row-card-text">
                        <b>{p?.title || 'Morceau'}</b>
                        <span>
                          {new Date(log.createdAt).toLocaleDateString('fr-FR')}
                          {log.minutes ? ` · ${log.minutes} min` : ''}
                          {log.objective ? ` · ${log.objective}` : ''}
                        </span>
                      </span>
                      <Icon name="next" size={18} />
                    </button>
                  )
                })
              ) : (
                <div className="ds-empty">
                  <p className="ds-hint">Pas encore de séance terminée.</p>
                  <button className="ds-btn ds-btn--secondary ds-btn--fit" type="button" onClick={() => goTab('library')}>
                    Ouvrir la bibliothèque
                  </button>
                </div>
              )}
            </div>
          </Section>
        </section>
      ) : null}

      {screen === 'library' ? (
        <section className="v0-main">
          <h1 className="ds-h1">Bibliothèque</h1>
          <label className="ds-label" htmlFor="lib-search">
            Rechercher un morceau
          </label>
          <input
            id="lib-search"
            className="ds-field"
            placeholder="Rechercher un morceau…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          {pieces.length && activeGenres.length ? (
            <div className="ds-chips ds-chips--scroll">
              <button type="button" className={`ds-chip${!genre ? ' is-on' : ''}`} aria-pressed={!genre} onClick={() => setGenre('')}>
                Tout
              </button>
              {activeGenres.map((g) => (
                <button key={g} type="button" aria-pressed={genre === g} className={`ds-chip${genre === g ? ' is-on' : ''}`} onClick={() => setGenre(g)}>
                  {g}
                </button>
              ))}
            </div>
          ) : null}
          <div className="ds-stack ds-mt">
            {filtered.map((p) => (
              <button key={p.id} className="ds-row-card" type="button" onClick={() => openPiece(p.id)}>
                <PieceThumb instrument={p.instrument} seed={p.id} />
                <span className="ds-row-card-text">
                  <b>
                    {p.title} {p.demo ? <Badge tone="accent">Démo</Badge> : null}
                  </b>
                  <span>
                    {p.artist || 'Sans artiste'} · {instLabel(p.instrument)}
                  </span>
                </span>
                <Icon name="next" size={18} />
              </button>
            ))}
            {!filtered.length && pieces.length ? (
              <div className="ds-empty">
                <p className="ds-hint">Aucun morceau ne correspond à cette recherche.</p>
                <button
                  className="ds-btn ds-btn--secondary ds-btn--fit"
                  type="button"
                  onClick={() => {
                    setQuery('')
                    setGenre('')
                  }}
                >
                  Réinitialiser les filtres
                </button>
              </div>
            ) : null}
            {!pieces.length ? (
              <div className="ds-empty">
                <p className="ds-hint">Ta bibliothèque est vide. Ajoute un morceau pour commencer.</p>
                {guest ? (
                  <button className="ds-btn ds-btn--quiet ds-btn--fit" type="button" onClick={() => loadDiscoveryExamples()}>
                    Charger des exemples de démonstration
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="ds-actions">
            <button
              className={`ds-btn ${showAddPiece ? 'ds-btn--quiet' : 'ds-btn--secondary'}`}
              type="button"
              onClick={() => {
                setShowAddPiece((v) => !v)
                setNewPiece((n) => ({ ...n, instrument: n.instrument || instruments[0] || 'piano' }))
              }}
            >
              <Icon name={showAddPiece ? 'minus' : 'plus'} size={18} />
              {showAddPiece ? 'Fermer' : 'Ajouter un morceau'}
            </button>
          </div>
          {showAddPiece ? (
            <div className="ds-card ds-stack">
              <label className="ds-label" htmlFor="np-title">
                Titre
              </label>
              <input id="np-title" className="ds-field" value={newPiece.title} onChange={(e) => setNewPiece({ ...newPiece, title: e.target.value })} />
              <label className="ds-label" htmlFor="np-artist">
                Artiste ou compositeur
              </label>
              <input id="np-artist" className="ds-field" value={newPiece.artist} onChange={(e) => setNewPiece({ ...newPiece, artist: e.target.value })} />
              <label className="ds-label" htmlFor="np-genre">
                Genre
              </label>
              <select id="np-genre" className="ds-field" value={newPiece.genre} onChange={(e) => setNewPiece({ ...newPiece, genre: e.target.value })}>
                {DEMO_GENRES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
              <label className="ds-label" htmlFor="np-inst">
                Instrument
              </label>
              <select
                id="np-inst"
                className="ds-field"
                value={newPiece.instrument}
                onChange={(e) => setNewPiece({ ...newPiece, instrument: e.target.value as InstrumentId })}
              >
                {INSTRUMENTS.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.label}
                  </option>
                ))}
              </select>
              <button className="ds-btn ds-btn--primary" type="button" disabled={!newPiece.title.trim()} onClick={createPiece}>
                Enregistrer le morceau
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {screen === 'switch' && switchReq ? (
        <section className="v0-main" data-testid="switch">
          {(() => {
            const active = getPiece(switchReq.activeId)
            const target = getPiece(switchReq.targetId)
            if (!active || !target) return null
            const same = active.id === target.id
            const prog = active.program
            const stepNo = prog ? Math.min(prog.stepIndex + 1, prog.steps.length) : 0
            const count = prog && email ? takesOfSession(listTakes(email, active.id), sessionStart(active)).length : 0
            return (
              <>
                <TopBar
                  onBack={() => {
                    setSwitchReq(null)
                    setScreen(switchReq.from === 'switch' ? 'home' : switchReq.from)
                  }}
                />
                <h1 className="ds-h1">Une séance est en cours</h1>
                <div className="ds-card ds-stack-sm" data-testid="switch-active">
                  <span className="ds-overline">{prog?.phase === 'review' ? 'Bilan commencé' : 'Séance en cours'}</span>
                  <b className="ds-h2">{active.title}</b>
                  <span className="ds-body">
                    {prog?.phase === 'review' ? 'Bilan en cours' : `Étape ${stepNo} sur ${prog?.steps.length || 0}`} · {count} prise{count > 1 ? 's' : ''}
                    {prog?.passage ? ` · ${prog.passage}` : ''}
                  </span>
                </div>
                <p className="ds-lead">
                  {same
                    ? 'Tu veux préparer une nouvelle séance sur ce morceau. La séance en cours peut être reprise, ou gardée en brouillon dans le Suivi.'
                    : `Tu veux ${switchReq.intent === 'resume' ? 'reprendre' : 'travailler'} « ${target.title} ». La séance en cours peut être reprise, ou gardée en brouillon dans le Suivi.`}
                </p>
                {switchError ? (
                  <p className="ds-alert ds-alert--error" role="alert">
                    <Icon name="alert" size={18} />
                    <span>{switchError}</span>
                  </p>
                ) : null}
                <div className="ds-actions">
                  <button
                    className="ds-btn ds-btn--primary"
                    type="button"
                    onClick={() => {
                      setSwitchReq(null)
                      resumePracticeFor(active.id)
                    }}
                  >
                    <Icon name="play" size={18} />
                    Reprendre « {active.title} »
                  </button>
                  <button className="ds-btn ds-btn--secondary" type="button" onClick={keepAndSwitch}>
                    {same
                      ? 'Garder le brouillon et préparer une nouvelle séance'
                      : `Garder le brouillon et ${switchReq.intent === 'resume' ? 'reprendre' : 'préparer'} « ${target.title} »`}
                  </button>
                </div>
              </>
            )
          })()}
        </section>
      ) : null}

      {screen === 'piece' && piece ? (
        <section className="v0-main">
          <TopBar onBack={() => goTab('library')} />
          <h1 className="ds-h1">
            {piece.title} {piece.demo ? <Badge tone="accent">Démo</Badge> : null}
          </h1>
          <p className="ds-lead">
            {piece.artist || 'Artiste non renseigné'} · {instLabel(piece.instrument)}
          </p>
          {piece.demo ? (
            <p className="ds-alert ds-alert--info">
              <Icon name="info" size={18} />
              <span>Exemple de démonstration — ce n’est pas une donnée de ton historique.</span>
            </p>
          ) : null}
          <div className="ds-actions ds-actions--split">
            <button className="ds-btn ds-btn--primary" type="button" onClick={() => requestPractice(piece.id, isPieceInProgress(piece) ? 'resume' : 'prepare')}>
              <Icon name="play" size={18} />
              {isPieceInProgress(piece) ? (piece.program?.phase === 'review' ? 'Reprendre le bilan' : 'Reprendre la séance') : 'Préparer une séance'}
            </button>
            <button
              className="ds-btn ds-btn--secondary"
              type="button"
              onClick={() => {
                refreshTakes(email, piece.id)
                setScreen('record')
              }}
            >
              <Icon name="mic" size={18} />
              S’enregistrer
            </button>
          </div>
          {isPieceInProgress(piece) ? (
            <button className="ds-btn ds-btn--quiet ds-btn--fit" type="button" onClick={() => requestPractice(piece.id, 'prepare')}>
              Préparer une nouvelle séance
            </button>
          ) : null}
          {(() => {
            const last = listCompletedSessionLogs(email, piece.id)[0]
            if (!last) return null
            return (
              <Section title="Dernier bilan">
                <div className="ds-card ds-stack-sm">
                  <span className="ds-caption">
                    {new Date(last.createdAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                    {last.objective ? ` · ${last.objective}` : ''}
                  </span>
                  {last.observationWorks ? (
                    <p className="ds-body">
                      <Badge tone="success" icon="check">
                        Fonctionne
                      </Badge>{' '}
                      {last.observationWorks}
                    </p>
                  ) : null}
                  {last.observationImprove ? (
                    <p className="ds-body">
                      <Badge tone="warning" icon="target">
                        À travailler
                      </Badge>{' '}
                      {last.observationImprove}
                    </p>
                  ) : null}
                  {last.nextStep ? <p className="ds-body"><b>Suite :</b> {last.nextStep}</p> : null}
                </div>
              </Section>
            )
          })()}
          <Section title="Travail">
            <label className="ds-label" htmlFor="pc-obj">
              Objectif du morceau
            </label>
            <select id="pc-obj" className="ds-field" value={(OBJECTIVES as readonly string[]).includes(piece.objective) ? piece.objective : ''} onChange={(e) => updatePieceFields({ objective: e.target.value })}>
              <option value="">Selon mon profil</option>
              {OBJECTIVES.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            <label className="ds-label" htmlFor="pc-pass">
              Passage à travailler
            </label>
            <input
              id="pc-pass"
              className="ds-field"
              value={piece.passages}
              placeholder="ex. Intro, refrain, mesures 1–8…"
              onChange={(e) => updatePieceFields({ passages: e.target.value })}
            />
            <label className="ds-label" htmlFor="pc-notes">
              Notes
            </label>
            <textarea id="pc-notes" className="ds-field" value={piece.notes} placeholder="Notes personnelles" onChange={(e) => updatePieceFields({ notes: e.target.value })} />
          </Section>
          <Section title="Ressources">
            {piece.resources.length ? (
              <ResourceList resources={piece.resources} />
            ) : (
              <p className="ds-hint">Aucune ressource. Tu peux travailler sans partition : ARIA adapte la séance.</p>
            )}
            <label className="ds-label" htmlFor="pc-res">
              Ajouter une ressource (texte ou lien)
            </label>
            <input id="pc-res" className="ds-field" placeholder="Accords, tablature, lien audio/vidéo…" value={resourceNote} onChange={(e) => setResourceNote(e.target.value)} />
            <div className="ds-chips">
              <button className="ds-chip" type="button" disabled={!resourceNote.trim()} onClick={() => addTextResource('chords')}>
                + Accords
              </button>
              <button className="ds-chip" type="button" disabled={!resourceNote.trim()} onClick={() => addTextResource('tabs')}>
                + Tablature
              </button>
              <button className="ds-chip" type="button" disabled={!resourceNote.trim()} onClick={() => addTextResource('audio')}>
                + Réf. audio
              </button>
              <button className="ds-chip" type="button" disabled={!resourceNote.trim()} onClick={() => addTextResource('video')}>
                + Réf. vidéo
              </button>
            </div>
            <label className="ds-btn ds-btn--quiet ds-btn--fit">
              <Icon name="score" size={18} />
              Importer une partition PDF
              <input hidden type="file" accept="application/pdf" onChange={(e) => void importPdf(e.target.files?.[0] || null)} />
            </label>
          </Section>
          <Section title={`Prises (${takes.length})`}>
            <div className="ds-stack">
              {takes.map((t) => (
                <TakePlayer key={t.id} take={t} label={takeLabel(t)} detail={takeDetail(t)} onDelete={removeTake} />
              ))}
              {!takes.length ? <p className="ds-hint">Aucune prise pour ce morceau.</p> : null}
            </div>
          </Section>
        </section>
      ) : null}

      {screen === 'prepare' && piece ? (
        <section className="v0-main">
          <TopBar onBack={() => setScreen('piece')} title="Préparer ma séance" />
          <h1 className="ds-h1">{piece.title}</h1>
          <p className="ds-lead">Ta séance est construite à partir de ces réglages. Ils viennent de ton profil : ajuste-les pour aujourd’hui.</p>

          {prepPrevious ? (
            <Section title="Ta dernière séance">
              <div className="ds-card ds-stack-sm" data-testid="prep-previous">
                <span className="ds-caption">
                  {new Date(prepPrevious.date).toLocaleDateString('fr-FR', { dateStyle: 'medium' })}
                  {prepPrevious.objective ? ` · ${prepPrevious.objective}` : ''}
                  {prepPrevious.bpm ? ` · ${prepPrevious.bpm} BPM` : ''}
                </span>
                {prepPrevious.improve ? (
                  <p className="ds-body">
                    <b>À travailler (ta note) :</b> {prepPrevious.improve}
                  </p>
                ) : null}
                {prepPrevious.retrySteps.length ? (
                  <p className="ds-body">
                    <b>À reprendre (ton avis) :</b> {prepPrevious.retrySteps.join(', ')}
                  </p>
                ) : null}
                {prepPrevious.okSteps.length && !prepPrevious.retrySteps.length ? (
                  <p className="ds-body">
                    <b>Réussi (ton avis) :</b> {prepPrevious.okSteps.join(', ')}
                  </p>
                ) : null}
                {!prepPrevious.improve && !prepPrevious.retrySteps.length && !prepPrevious.okSteps.length ? (
                  <p className="ds-hint">Aucune observation ni auto-évaluation notée lors de cette séance.</p>
                ) : null}
                <label className="ds-check">
                  <input type="checkbox" checked={prepUsePrevious} onChange={(e) => setPrepUsePrevious(e.target.checked)} />
                  <span>Construire la séance à partir de la dernière</span>
                </label>
              </div>
            </Section>
          ) : null}

          <Section title="Passage travaillé">
            <label className="ds-sr" htmlFor="prep-passage">
              Passage travaillé
            </label>
            <input id="prep-passage" className="ds-field" value={prepPassage} placeholder="ex. Intro, refrain, mesures 1–8…" onChange={(e) => setPrepPassage(e.target.value)} />
          </Section>
          <Section title="Objectif" aside={<span className="ds-caption">2 max · le 1er est principal</span>}>
            <div className="ds-chips" data-testid="prep-goals">
              {OBJECTIVES.map((o) => {
                const idx = prepGoals.indexOf(o)
                return (
                  <button key={o} type="button" aria-pressed={idx >= 0} className={`ds-chip${idx >= 0 ? ' is-on' : ''}`} onClick={() => setPrepGoals((prev) => toggleIn(prev, o, 2))}>
                    {idx >= 0 ? <Icon name="check" size={16} /> : null}
                    {o}
                    {idx === 0 ? <small>principal</small> : null}
                    {goals.includes(o) ? <small className="ds-chip-src">profil</small> : null}
                  </button>
                )
              })}
            </div>
            {!prepGoals.length ? <p className="ds-hint">Choisis au moins un objectif.</p> : null}
          </Section>
          <Section title="Temps disponible">
            <div className="ds-chips">
              {DURATIONS.map((d) => (
                <button key={d} type="button" aria-pressed={prepMinutes === d} className={`ds-chip${prepMinutes === d ? ' is-on' : ''}`} onClick={() => setPrepMinutes(d)}>
                  {d} min
                </button>
              ))}
            </div>
          </Section>
          {prepPreview && prepGoals.length ? (
            <Section title="Ta séance" aside={<span className="ds-caption">{prepPreview.steps.length} étapes · {prepPreview.minutes} min</span>}>
              <ol className="ds-plan" data-testid="prep-plan">
                {prepPreview.steps.map((s) => (
                  <li key={s.id}>
                    <span className="ds-plan-min">{s.minutes} min</span>
                    <span className="ds-plan-title">{s.title}</span>
                  </li>
                ))}
              </ol>
              <p className="ds-hint">
                {instLabel(prepInstrument)} · {levelLabel(prepLevel)} · {resourceLabel(prepResource)}. Tu peux enregistrer à tout moment et passer une
                étape si elle ne te sert pas.
              </p>
              {prepPreview.notes?.map((n) => (
                <p key={n} className={`ds-alert ${/^(Suite de ta séance|Nouvel objectif)/.test(n) ? 'ds-alert--info' : 'ds-alert--warning'}`}>
                  <Icon name="info" size={18} />
                  <span>{n}</span>
                </p>
              ))}
            </Section>
          ) : null}
          <div className="ds-actions">
            <button className="ds-btn ds-btn--primary" type="button" disabled={!prepGoals.length} onClick={confirmProgram}>
              <Icon name="play" size={18} />
              Commencer la séance
            </button>
          </div>
          <h2 className="ds-h2 v0-settings-title">Réglages de la séance</h2>
          <p className="ds-hint">Repris de ton profil et de ce morceau. Tu peux les ajuster pour aujourd’hui : le plan ci-dessus se met à jour.</p>
          <Section title="Instrument">
            <div className="ds-chips">
              {INSTRUMENTS.filter((i) => instruments.includes(i.id) || i.id === piece.instrument || i.id === prepInstrument).map((i) => (
                <button key={i.id} type="button" aria-pressed={prepInstrument === i.id} className={`ds-chip${prepInstrument === i.id ? ' is-on' : ''}`} onClick={() => setPrepInstrument(i.id)}>
                  {i.label}
                </button>
              ))}
            </div>
          </Section>
          <Section title="Niveau">
            <div className="ds-seg" role="group" aria-label="Niveau">
              {LEVELS.map((l) => (
                <button key={l.id} type="button" aria-pressed={prepLevel === l.id} className={prepLevel === l.id ? 'is-on' : ''} onClick={() => setPrepLevel(l.id)}>
                  {l.label}
                </button>
              ))}
            </div>
          </Section>
          <Section title="Avec quoi travailles-tu ?">
            <div className="ds-chips">
              {RESOURCE_MODES.map((r) => (
                <button key={r.id} type="button" aria-pressed={prepResource === r.id} className={`ds-chip${prepResource === r.id ? ' is-on' : ''}`} onClick={() => setPrepResource(r.id)}>
                  {r.label}
                </button>
              ))}
            </div>
          </Section>
          <Section title="Difficulté particulière (facultatif)">
            <label className="ds-sr" htmlFor="prep-diff">
              Difficulté particulière
            </label>
            <textarea
              id="prep-diff"
              className="ds-field"
              placeholder="ex. je perds le rythme au changement d’accord"
              value={prepDifficulties}
              onChange={(e) => setPrepDifficulties(e.target.value)}
            />
          </Section>
        </section>
      ) : null}

      {screen === 'session' && piece?.program && currentStep ? (
        <section className="v0-main v0-session">
          {(() => {
            const program = piece.program!
            const idx = Math.min(program.stepIndex, program.steps.length - 1)
            const total = program.steps.length
            const step = currentStep
            const last = idx >= total - 1
            return (
              <>
                <TopBar onBack={() => setScreen('piece')} locked={capturing} />
                <p className="ds-overline v0-session-over">
                  {piece.title}
                  {program.passage ? ` · ${program.passage}` : ''}
                </p>
                <h1 className="ds-h1">Ma séance</h1>
                <div className="ds-cues" data-testid="step-cues">
                  <Badge tone="accent">
                    Étape {idx + 1} sur {total}
                  </Badge>
                  {step.bpm ? (
                    <button
                      type="button"
                      className="ds-chipbtn"
                      aria-pressed={tool === 'metronome'}
                      onClick={() => setTool(tool === 'metronome' ? 'none' : 'metronome')}
                    >
                      <Icon name="metronome" size={16} />
                      Métronome · {step.bpm} BPM
                    </button>
                  ) : null}
                  {program.objective ? <Badge tone="neutral">{program.objective}</Badge> : null}
                </div>
                {step.minutes ? (
                  <StepTimer
                    minutes={step.minutes}
                    resetKey={step.id}
                    initialLeft={program.timer?.stepId === step.id ? program.timer.left : undefined}
                    onChange={(left) => saveTimer(step.id, left)}
                  />
                ) : null}
                <div className="ds-steps" aria-label={`Étape ${idx + 1} sur ${total}`}>
                  {program.steps.map((s, i) => (
                    <button
                      key={s.id}
                      type="button"
                      className={`ds-steps-seg${i === idx ? ' is-current' : ''}${i < idx ? ' is-past' : ''}${s.check === 'ok' ? ' is-ok' : ''}${s.check === 'retry' ? ' is-retry' : ''}`}
                      aria-label={`Aller à l’étape ${i + 1} : ${s.title}`}
                      aria-disabled={capturing || undefined}
                      aria-describedby={capturing ? 'capture-hint' : undefined}
                      onClick={() => {
                        if (!capturing) setStepIndex(i)
                      }}
                    />
                  ))}
                </div>

                <article className="ds-stepblock" data-testid="step-card">
                  <span className="ds-stepblock-label">À travailler · {step.minutes ? `${step.minutes} min` : 'durée libre'}</span>
                  <h2 className="ds-h2">{step.title}</h2>
                  <p className="ds-body-lg">{step.what}</p>
                  <div className="ds-criterion">
                    <Icon name="target" size={20} />
                    <div>
                      <span className="ds-stepblock-label">Repère de réussite</span>
                      <p className="ds-body">{step.success}</p>
                    </div>
                  </div>
                </article>
                <details className="ds-why ds-how">
                  <summary>Comment jouer ce passage</summary>
                  <p className="ds-body">{step.how}</p>
                  <p className="ds-body">
                    <b>Pourquoi : </b>
                    {step.why}
                  </p>
                </details>

                <RecordPanel recorder={recorder} onToggle={toggleRecording} hint={takeHint} context={step.title} />

                {sessionTakes.length ? (
                  <Section title={`Prises de la séance (${sessionTakes.length})`}>
                    <div className="ds-stack">
                      {sessionTakes.map((t) => (
                        <TakePlayer key={t.id} take={t} label={takeLabel(t)} detail={takeDetail(t)} onDelete={removeTake} />
                      ))}
                    </div>
                  </Section>
                ) : null}

                <div className="ds-selfcheck" role="group" aria-label="As-tu atteint le repère ?">
                  <span className="ds-caption">As-tu atteint le repère ? (ton avis)</span>
                  <div className="ds-row">
                    <button
                      type="button"
                      aria-pressed={step.check === 'ok'}
                      className={`ds-btn ds-btn--sm ds-btn--success-outline${step.check === 'ok' ? ' is-on' : ''}`}
                      onClick={() => setStepCheck(step.id, 'ok')}
                    >
                      <Icon name="check" size={18} />
                      Oui, réussi
                    </button>
                    <button
                      type="button"
                      aria-pressed={step.check === 'retry'}
                      className={`ds-btn ds-btn--sm ds-btn--warning-outline${step.check === 'retry' ? ' is-on' : ''}`}
                      onClick={() => setStepCheck(step.id, 'retry')}
                    >
                      <Icon name="retry" size={18} />
                      Pas encore
                    </button>
                  </div>
                </div>

                <div className="ds-toolbar" role="group" aria-label="Outils">
                  <button type="button" aria-pressed={tool === 'metronome'} className={tool === 'metronome' ? 'is-on' : ''} onClick={() => setTool(tool === 'metronome' ? 'none' : 'metronome')}>
                    <Icon name="metronome" />
                    Métronome
                  </button>
                  <button type="button" aria-pressed={tool === 'resources'} className={tool === 'resources' ? 'is-on' : ''} onClick={() => setTool(tool === 'resources' ? 'none' : 'resources')}>
                    <Icon name="score" />
                    Ressources
                  </button>
                  <button type="button" aria-pressed={tool === 'notes'} className={tool === 'notes' ? 'is-on' : ''} onClick={() => setTool(tool === 'notes' ? 'none' : 'notes')}>
                    <Icon name="notes" />
                    Notes
                  </button>
                </div>
                {tool === 'metronome' ? <MetronomePanel key={step.id} initialBpm={step.bpm || 60} onState={setMetro} /> : null}
                {tool === 'resources' ? resourcesPanel : null}
                {tool === 'notes' ? notesPanel : null}


                {capturing ? (
                  <p id="capture-hint" className="ds-hint" role="status">
                    {last ? 'Arrête la prise avant de faire le bilan.' : 'Arrête la prise pour passer à l’étape suivante.'}
                  </p>
                ) : null}
                <div className="ds-actions">
                  {last ? (
                    <button
                      ref={reviewBtnRef}
                      className="ds-btn ds-btn--primary"
                      type="button"
                      aria-disabled={capturing || undefined}
                      aria-describedby={capturing ? 'capture-hint' : undefined}
                      onClick={() => {
                        if (!capturing) openReview()
                      }}
                    >
                      Faire le bilan
                      <Icon name="next" size={18} />
                    </button>
                  ) : (
                    <button
                      className="ds-btn ds-btn--primary"
                      type="button"
                      aria-disabled={capturing || undefined}
                      aria-describedby={capturing ? 'capture-hint' : undefined}
                      onClick={() => {
                        if (!capturing) setStepIndex(idx + 1)
                      }}
                    >
                      Étape suivante
                      <Icon name="next" size={18} />
                    </button>
                  )}
                  {!last && !capturing ? (
                    <button className="ds-btn ds-btn--secondary" type="button" onClick={() => openReview()}>
                      Faire le bilan maintenant
                    </button>
                  ) : null}
                  {idx > 0 ? (
                    <button
                      className="ds-btn ds-btn--quiet ds-btn--fit ds-center"
                      type="button"
                      aria-disabled={capturing || undefined}
                      aria-describedby={capturing ? 'capture-hint' : undefined}
                      onClick={() => {
                        if (!capturing) setStepIndex(idx - 1)
                      }}
                    >
                      <Icon name="back" size={18} />
                      Étape précédente
                    </button>
                  ) : null}
                </div>

                <button className="ds-disclosure" type="button" aria-expanded={showPlan} onClick={() => setShowPlan((v) => !v)}>
                  Programme complet ({program.minutes} min)
                  <Icon name="chevron" size={18} />
                </button>
                {showPlan ? (
                  <ol className="ds-plan">
                    {program.steps.map((s, i) => (
                      <li key={s.id} className={i === idx ? 'is-current' : ''}>
                        <span className="ds-plan-min">{s.minutes ? `${s.minutes} min` : '—'}</span>
                        <span className="ds-plan-title">{s.title}</span>
                        {s.check === 'ok' ? <Badge tone="success" icon="check">Réussi</Badge> : null}
                        {s.check === 'retry' ? <Badge tone="warning" icon="retry">À reprendre</Badge> : null}
                      </li>
                    ))}
                  </ol>
                ) : null}
              </>
            )
          })()}
        </section>
      ) : null}

      {screen === 'record' && piece ? (
        <section className="v0-main v0-session">
          <TopBar onBack={() => setScreen(piece.program && isPieceInProgress(piece) ? 'session' : 'piece')} title={piece.title} locked={capturing} />
          <h1 className="ds-h2">S’enregistrer</h1>
          <p className="ds-lead">Joue le passage à ton rythme. Chaque prise est sauvegardée sur cet appareil ; tu peux en faire plusieurs.</p>
          <RecordPanel recorder={recorder} onToggle={toggleRecording} hint={takeHint} context={piece.passages || undefined} />
          <div className="ds-toolbar" role="group" aria-label="Outils">
            <button type="button" aria-pressed={tool === 'metronome'} className={tool === 'metronome' ? 'is-on' : ''} onClick={() => setTool(tool === 'metronome' ? 'none' : 'metronome')}>
              <Icon name="metronome" />
              Métronome
            </button>
            <button type="button" aria-pressed={tool === 'resources'} className={tool === 'resources' ? 'is-on' : ''} onClick={() => setTool(tool === 'resources' ? 'none' : 'resources')}>
              <Icon name="score" />
              Ressources
            </button>
            <button type="button" aria-pressed={tool === 'notes'} className={tool === 'notes' ? 'is-on' : ''} onClick={() => setTool(tool === 'notes' ? 'none' : 'notes')}>
              <Icon name="notes" />
              Notes
            </button>
          </div>
          {tool === 'metronome' ? <MetronomePanel initialBpm={60} onState={setMetro} /> : null}
          {tool === 'resources' ? resourcesPanel : null}
          {tool === 'notes' ? notesPanel : null}
          <Section title={`Prises (${takes.length})`}>
            <div className="ds-stack">
              {takes.map((t) => (
                <TakePlayer key={t.id} take={t} label={takeLabel(t)} detail={takeDetail(t)} onDelete={removeTake} />
              ))}
              {!takes.length ? <p className="ds-hint">Aucune prise pour l’instant.</p> : null}
            </div>
          </Section>
          {piece.program && isPieceInProgress(piece) ? (
            <div className="ds-actions">
              <button
                className="ds-btn ds-btn--secondary"
                type="button"
                aria-disabled={capturing || undefined}
                aria-describedby={capturing ? 'nav-lock' : undefined}
                onClick={() => {
                  if (!capturing) openReview()
                }}
              >
                Faire le bilan de la séance
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {screen === 'review' && piece && review ? (
        <section className="v0-main v0-review">
          <TopBar onBack={() => setScreen(piece.program ? 'session' : 'record')} title="Bilan de séance" />
          <h1 className="ds-h1">{piece.title}</h1>
          <p className="ds-lead">
            {piece.program?.objective ? `Objectif : ${piece.program.objective}` : 'Séance'}
            {piece.program?.minutes ? ` · ${piece.program.minutes} min` : ''}
          </p>

          <div className="ds-legend" aria-label="Origine des informations">
            <SourceTag source="user" />
            <SourceTag source="rules" />
            <span className="ds-source ds-source--none">Analyse automatique de la prise : aucune</span>
          </div>

          {(() => {
            const prev = listCompletedSessionLogs(email, piece.id).find((l) => l.sessionStartedAt !== sessionStart(piece))
            if (!prev || (!prev.observationImprove && !prev.nextStep)) return null
            return (
              <div className="ds-card ds-stack-sm" data-testid="review-previous">
                <span className="ds-overline">Séance précédente · {new Date(prev.createdAt).toLocaleDateString('fr-FR', { dateStyle: 'medium' })}</span>
                {prev.observationImprove ? (
                  <p className="ds-body">
                    Tu voulais travailler : « {prev.observationImprove} ». Réécoute ta prise : est-ce mieux aujourd’hui ?
                  </p>
                ) : (
                  <p className="ds-body">{prev.nextStep}</p>
                )}
              </div>
            )
          })()}

          {(() => {
            const readable = sessionTakes.filter((t) => !t.unreadable)
            const group = comparableGroup(sessionTakes)
            const earlier = takes.filter((t) => !sessionTakes.some((x) => x.id === t.id))
            const player = (t: Take, prefix = '') => (
              <TakePlayer key={`${prefix}${t.id}`} take={t} label={`${prefix}${takeLabel(t)}`} detail={takeDetail(t)} testId="review-take" />
            )
            const back = () => setScreen(piece.program ? 'session' : 'record')
            let block: ReactNode
            if (!sessionTakes.length) {
              block = (
                <Section title="Réécouter">
                  <div className="ds-stack" data-testid="takes-zero">
                    <p className="ds-hint">Aucune prise pendant cette séance. Une première prise servira de référence pour les prochaines écoutes.</p>
                    <button className="ds-btn ds-btn--secondary ds-btn--fit" type="button" onClick={back}>
                      <Icon name="mic" size={18} />
                      Enregistrer une prise de référence
                    </button>
                  </div>
                </Section>
              )
            } else if (sessionTakes.length === 1) {
              block = (
                <Section title="Réécouter">
                  <div className="ds-stack" data-testid="takes-one">
                    {player(sessionTakes[0])}
                    {sessionTakes[0].unreadable ? <p className="ds-hint">Cette prise est illisible sur cet appareil : réessaie l’enregistrement.</p> : null}
                  </div>
                </Section>
              )
            } else if (group.length >= 2) {
              const a = group.find((t) => t.id === compareA) || group[1]
              const b = group.find((t) => t.id === compareB && t.id !== a.id) || group.find((t) => t.id !== a.id)!
              const others = sessionTakes.filter((t) => !group.some((g) => g.id === t.id))
              block = (
                <Section title="Comparer les prises">
                  <div className="ds-stack" data-testid="takes-compare">
                    <p className="ds-hint">Prises comparables · même séance, même passage, même tempo. La durée est indiquée à titre d’information.</p>
                    {group.length > 2 ? (
                      <div className="ds-compare-pick">
                        <label className="ds-label" htmlFor="cmp-a">
                          Prise A
                        </label>
                        <select id="cmp-a" className="ds-field" value={a.id} onChange={(e) => setCompareA(e.target.value)}>
                          {group.map((t) => (
                            <option key={t.id} value={t.id} disabled={t.id === b.id}>
                              {takeLabel(t)} · {takeDetail(t)}
                            </option>
                          ))}
                        </select>
                        <label className="ds-label" htmlFor="cmp-b">
                          Prise B
                        </label>
                        <select id="cmp-b" className="ds-field" value={b.id} onChange={(e) => setCompareB(e.target.value)}>
                          {group.map((t) => (
                            <option key={t.id} value={t.id} disabled={t.id === a.id}>
                              {takeLabel(t)} · {takeDetail(t)}
                            </option>
                          ))}
                        </select>
                      </div>
                    ) : null}
                    <div className="ds-compare" data-testid="compare">
                      {player(a, 'A · ')}
                      {player(b, 'B · ')}
                    </div>
                    <label className="ds-label" htmlFor="cmp-note">
                      Ta comparaison (facultatif)
                    </label>
                    <textarea
                      id="cmp-note"
                      className="ds-field"
                      placeholder="ex. La prise B est plus régulière au changement d’accord."
                      value={comparison}
                      onChange={(e) => setComparison(e.target.value)}
                    />
                    {others.length ? (
                      <>
                        <p className="ds-hint">Autres prises de cette séance · écoute séparée ({comparability(others[0], group[0]).ok ? '' : (comparability(others[0], group[0]) as { reason: string }).reason})</p>
                        {others.map((t) => player(t))}
                      </>
                    ) : null}
                  </div>
                </Section>
              )
            } else {
              block = (
                <Section title="Écouter les prises séparément">
                  <div className="ds-stack" data-testid="takes-separate">
                    <p className="ds-hint">Prises non comparables · {nonComparableReason(sessionTakes) || 'Les métadonnées ne permettent pas de les comparer.'} Écoute-les séparément.</p>
                    {sessionTakes.map((t) => player(t))}
                  </div>
                </Section>
              )
            }
            return (
              <>
                <p className="ds-hint">{review.facts.text}{readable.length !== sessionTakes.length ? ` Dont ${sessionTakes.length - readable.length} illisible.` : ''}</p>
                {block}
                {earlier.length ? (
                  <details className="ds-why">
                    <summary>Prises des séances précédentes ({earlier.length}) · écoute seule</summary>
                    <div className="ds-stack">{earlier.map((t) => player(t))}</div>
                  </details>
                ) : null}
              </>
            )
          })()}

          <div className="ds-stack ds-mt">
            <article className="ds-feed ds-feed--success">
              <header>
                <Badge tone="success" icon="check">
                  Ce qui fonctionne
                </Badge>
                <SourceTag source={worksObs.trim() ? 'user' : review.works.source === 'self-check' ? 'self-check' : 'user'} />
              </header>
              <label className="ds-sr" htmlFor="rv-works">
                Ce qui fonctionne
              </label>
              <textarea id="rv-works" className="ds-field" placeholder="À la réécoute, qu’est-ce qui t’a semblé solide ?" value={worksObs} onChange={(e) => setWorksObs(e.target.value)} />
              {!worksObs.trim() && review.works.source === 'self-check' ? <p className="ds-hint">{review.works.text}</p> : null}
            </article>

            <article className="ds-feed ds-feed--warning">
              <header>
                <Badge tone="warning" icon="target">
                  Ce qui mérite d’être travaillé
                </Badge>
                <SourceTag source={improveObs.trim() ? 'user' : review.improve.source === 'self-check' ? 'self-check' : 'user'} />
              </header>
              <label className="ds-sr" htmlFor="rv-improve">
                Ce qui mérite d’être travaillé
              </label>
              <textarea
                id="rv-improve"
                className="ds-field"
                placeholder="ex. le rythme décroche au changement d’accord"
                value={improveObs}
                onChange={(e) => setImproveObs(e.target.value)}
              />
              {!improveObs.trim() && review.improve.source === 'self-check' ? <p className="ds-hint">{review.improve.text}</p> : null}
            </article>

            {reviewNoWork ? null : (
            <article className="ds-feed ds-feed--rules" data-testid="corrective">
              <header>
                <Badge tone="neutral" icon="spark">
                  {review.corrective.empty
                    ? 'Exercice correctif'
                    : `Exercice correctif · ${review.corrective.minutes} min${review.corrective.bpm ? ` · ${review.corrective.bpm} BPM` : ''}`}
                </Badge>
                <SourceTag source="rules" />
              </header>
              <b className="ds-body">{review.corrective.title}</b>
              <p className="ds-body">{review.corrective.text}</p>
              {review.corrective.empty ? null : (
                <>
                  <p className="ds-criterion ds-criterion--inline">
                    <Icon name="target" size={18} />
                    <span>
                      <b>Critère :</b> {review.corrective.success}
                    </span>
                  </p>
                  <p className="ds-hint">Repris tel quel en tête de ta prochaine séance sur ce morceau.</p>
                </>
              )}
            </article>

            )}
            {reviewNoWork ? null : (
            <article className="ds-feed ds-feed--rules">
              <header>
                <Badge tone="accent" icon="next">
                  Prochaine tentative
                </Badge>
                <SourceTag source="rules" />
              </header>
              <p className="ds-body">{review.next.text}</p>
            </article>
            )}

            <p className="ds-alert ds-alert--info">
              <Icon name="info" size={18} />
              <span>
                {review.analysis}
                {review.limits ? ` ${review.limits}` : ''}
              </span>
            </p>
          </div>

          {reviewNoWork ? (
            <p className="ds-alert ds-alert--info" role="status" data-testid="review-nowork">
              <Icon name="info" size={18} />
              <span>
                Aucun travail évalué pour l’instant : il n’y a pas de bilan à établir. Reprends la séance, ou garde-la en brouillon pour plus tard.
              </span>
            </p>
          ) : null}
          {saveHint ? (
            <p className="ds-alert ds-alert--error" role="alert">
              <Icon name="alert" size={18} />
              <span>{saveHint}</span>
            </p>
          ) : null}
          <div className="ds-actions">
            {reviewNoWork ? (
              <button className="ds-btn ds-btn--primary" type="button" onClick={() => setScreen(piece.program ? 'session' : 'record')}>
                <Icon name="play" size={18} />
                Reprendre la séance
              </button>
            ) : (
              <button className="ds-btn ds-btn--primary" type="button" onClick={saveReview}>
                <Icon name="check" size={18} />
                Terminer la séance
              </button>
            )}
            <div className="ds-actions ds-actions--split ds-actions--flush">
              <button className="ds-btn ds-btn--secondary" type="button" onClick={() => setScreen(piece.program ? 'session' : 'record')}>
                <Icon name="mic" size={18} />
                Nouvelle tentative
              </button>
              <button className="ds-btn ds-btn--quiet" type="button" onClick={saveDraftReview}>
                Garder en brouillon
              </button>
            </div>
          </div>
        </section>
      ) : null}

      {screen === 'follow' ? (
        <section className="v0-main">
          <h1 className="ds-h1">Suivi</h1>
          <p className="ds-lead">Tes séances terminées, tes brouillons et toutes tes prises, conservés sur cet appareil.</p>
          <Section title={`Séances terminées (${completedLogs.length})`}>
            <div className="ds-stack">
              {completedLogs.map((log) => {
                const p = getPiece(log.pieceId)
                return (
                  <button key={log.id} className="ds-card ds-card--button" type="button" onClick={() => openPiece(log.pieceId)}>
                    <span className="ds-row ds-row--between">
                      <b>{p?.title || 'Morceau'}</b>
                      <Badge tone="success" icon="check">
                        Terminée
                      </Badge>
                    </span>
                    <span className="ds-caption">
                      {new Date(log.createdAt).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })}
                      {log.minutes ? ` · ${log.minutes} min` : ''}
                      {log.objective ? ` · ${log.objective}` : ''}
                      {(() => {
                        const kept = (log.takeIds || []).filter((id) => allTakes.some((t) => t.id === id)).length
                        return kept ? ` · ${kept} prise${kept > 1 ? 's' : ''}` : ''
                      })()}
                    </span>
                    {log.nextStep ? <span className="ds-body">{log.nextStep}</span> : null}
                  </button>
                )
              })}
              {!completedLogs.length ? (
                <div className="ds-empty">
                  <p className="ds-hint">Aucune séance terminée pour l’instant.</p>
                  <button className="ds-btn ds-btn--secondary ds-btn--fit" type="button" onClick={startPracticeFromHome}>
                    Lancer une pratique
                  </button>
                </div>
              ) : null}
            </div>
          </Section>
          {(() => {
            // S7-09 — brouillons : séances en cours (pratique ou bilan) et séances mises de côté.
            type Entry = { key: string; title: string; kind: string; detail: string; date: string; onOpen: () => void }
            const entries: Entry[] = []
            for (const p of pieces) {
              if (!p.program || !isPieceInProgress(p)) continue
              const key = sessionStart(p)
              const log = findSessionLog(email, p.id, key)
              const n = takesOfSession(allTakes.filter((t) => t.pieceId === p.id), key).length
              const review = p.program.phase === 'review'
              entries.push({
                key: `cur-${p.id}`,
                title: p.title,
                kind: review ? 'Brouillon de bilan' : 'Brouillon de pratique',
                detail: `${review ? 'Bilan commencé' : `Étape ${Math.min(p.program.stepIndex + 1, p.program.steps.length)} sur ${p.program.steps.length}`} · ${n} prise${n > 1 ? 's' : ''}`,
                date: log?.createdAt || p.program.updatedAt,
                onOpen: () => resumePracticeFor(p.id),
              })
            }
            for (const log of draftLogs) {
              const p = getPiece(log.pieceId)
              if (p && isPieceInProgress(p) && sessionStart(p) === log.sessionStartedAt) continue
              const n = (log.takeIds || []).filter((id) => allTakes.some((t) => t.id === id)).length
              entries.push({
                key: log.id,
                title: p?.title || 'Morceau',
                kind: 'Brouillon mis de côté',
                detail: `${log.programSnapshot ? `Étape ${Math.min(log.programSnapshot.stepIndex + 1, log.programSnapshot.steps.length)} sur ${log.programSnapshot.steps.length}` : 'Séance'} · ${n} prise${n > 1 ? 's' : ''}`,
                date: log.createdAt,
                onOpen: () => (log.programSnapshot ? resumeArchivedDraft(log) : openPiece(log.pieceId)),
              })
            }
            if (!entries.length) return null
            entries.sort((a, b) => b.date.localeCompare(a.date))
            return (
              <Section title={`Brouillons (${entries.length})`}>
                <div className="ds-stack" data-testid="drafts">
                  {entries.map((e) => (
                    <button key={e.key} className="ds-card ds-card--button ds-card--muted" type="button" onClick={e.onOpen}>
                      <span className="ds-row ds-row--between">
                        <b>{e.title}</b>
                        <Badge tone="neutral">{e.kind}</Badge>
                      </span>
                      <span className="ds-caption">
                        {e.detail} · {new Date(e.date).toLocaleString('fr-FR', { dateStyle: 'medium', timeStyle: 'short' })} — non comptée comme terminée
                      </span>
                    </button>
                  ))}
                </div>
              </Section>
            )
          })()}
          <Section title={`Prises audio (${allTakes.length})`}>
            <div className="ds-stack" data-testid="follow-takes">
              {(() => {
                const groups = new Map<string, Take[]>()
                for (const t of allTakes) groups.set(t.pieceId, [...(groups.get(t.pieceId) || []), t])
                return [...groups.entries()].map(([pid, list]) => {
                  const p = getPiece(pid)
                  return (
                    <div key={pid} className="ds-group">
                      <div className="ds-row ds-row--between">
                        <b className="ds-group-title">
                          {p?.title || 'Morceau supprimé'} {p?.demo ? <Badge tone="accent">Démo</Badge> : null}
                        </b>
                        {p ? (
                          <button className="ds-btn ds-btn--sm ds-btn--quiet" type="button" onClick={() => openPiece(pid)}>
                            Ouvrir
                          </button>
                        ) : null}
                      </div>
                      {list.map((t) => (
                        <TakePlayer
                          key={t.id}
                          take={t}
                          label={takeLabel(t)}
                          detail={takeDetail(t)}
                          onDelete={removeTake}
                          testId="follow-take"
                        />
                      ))}
                    </div>
                  )
                })
              })()}
              {!allTakes.length ? <p className="ds-hint">Aucune prise audio enregistrée.</p> : null}
            </div>
          </Section>
        </section>
      ) : null}

      {screen === 'profile' ? (
        <section className="v0-main">
          <h1 className="ds-h1">Profil</h1>
          <p className="ds-lead">
            {firstName ? `${firstName} · ` : ''}
            {guest ? 'Mode découverte (sans compte)' : email}
          </p>
          <p className="ds-alert ds-alert--info" role="status">
            <Icon name="info" size={18} />
            <span>
              {authMode === 'cloud'
                ? 'Connexion cloud active (compte synchronisable).'
                : authMode === 'down'
                  ? 'Cloud temporairement indisponible — comptes locaux sur cet appareil uniquement.'
                  : 'Mode local — données sur cet appareil (cloud non configuré ou indisponible).'}
            </span>
          </p>
          <Section title="Objectifs" aside={<span className="ds-caption">le 1er est principal</span>}>
            <div className="ds-chips">
              {OBJECTIVES.map((o) => {
                const idx = goals.indexOf(o)
                return (
                  <button key={o} type="button" aria-pressed={idx >= 0} className={`ds-chip${idx >= 0 ? ' is-on' : ''}`} onClick={() => setGoals((prev) => toggleIn(prev, o))}>
                    {idx >= 0 ? <Icon name="check" size={16} /> : null}
                    {o}
                    {idx === 0 ? <small>principal</small> : null}
                  </button>
                )
              })}
            </div>
          </Section>
          <Section title="Durée habituelle">
            <div className="ds-chips">
              {DURATIONS.map((d) => (
                <button key={d} type="button" aria-pressed={preferredMinutes === d} className={`ds-chip${preferredMinutes === d ? ' is-on' : ''}`} onClick={() => setPreferredMinutes(d)}>
                  {d} min
                </button>
              ))}
            </div>
          </Section>
          <Section title="Instruments">
            <div className="ds-chips">
              {INSTRUMENTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={instruments.includes(item.id)}
                  className={`ds-chip${instruments.includes(item.id) ? ' is-on' : ''}`}
                  onClick={() => setInstruments((prev) => toggleIn(prev, item.id))}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </Section>
          <Section title="Niveau">
            <div className="ds-stack">
              {LEVELS.map((item) => (
                <button key={item.id} type="button" aria-pressed={level === item.id} className={`ds-option${level === item.id ? ' is-on' : ''}`} onClick={() => setLevel(item.id)}>
                  <b>{item.label}</b>
                  <span>{item.hint}</span>
                </button>
              ))}
            </div>
          </Section>
          {profileHint ? (
            <p className={`ds-alert ${profileHint.startsWith('Profil') ? 'ds-alert--success' : 'ds-alert--warning'}`} role="status">
              <Icon name={profileHint.startsWith('Profil') ? 'check' : 'info'} size={18} />
              <span>{profileHint}</span>
            </p>
          ) : null}
          <div className="ds-actions">
            <button className="ds-btn ds-btn--primary" type="button" onClick={saveProfileEdits}>
              Enregistrer le profil
            </button>
          </div>
          <Section title="Tes données">
            <p className="ds-alert ds-alert--info" data-testid="storage-warning">
              <Icon name="info" size={18} />
              <span>
                Tes morceaux, prises et séances sont enregistrés <b>sur cet appareil uniquement</b>, dans ce navigateur. Ils ne sont pas synchronisés
                entre appareils et sont perdus si les données du navigateur sont effacées.
              </span>
            </p>
          </Section>
          <Section title="Compte">
            <div className="ds-stack">
              {guest ? <p className="ds-hint">Mode découverte. Connecte-toi pour créer un compte.</p> : null}
              <button className="ds-btn ds-btn--secondary" type="button" onClick={() => setScreen('auth')}>
                {guest ? 'Se connecter' : 'Gérer la connexion'}
              </button>
              <button className="ds-btn ds-btn--quiet" type="button" onClick={() => void logout()}>
                {guest ? 'Quitter la découverte' : 'Se déconnecter'}
              </button>
            </div>
          </Section>
        </section>
      ) : null}

      {docked && capturing ? (
        <p id="nav-lock" className="v0-navlock" role="status">
          Navigation indisponible. Arrête la prise pour changer d’écran.
        </p>
      ) : null}
      {docked ? (
        <nav className="v0-dock" aria-label="Navigation principale">
          {(
            [
              ['home', 'home', 'Accueil'],
              ['library', 'library', 'Bibliothèque'],
              ['follow', 'follow', 'Suivi'],
              ['profile', 'profile', 'Profil'],
            ] as const
          ).map(([id, icon, label]) => (
            <button
              key={id}
              type="button"
              className={activeTab === id ? 'on' : ''}
              aria-current={activeTab === id ? 'page' : undefined}
              aria-disabled={capturing || undefined}
              aria-describedby={capturing ? 'nav-lock' : undefined}
              onClick={() => {
                if (!capturing) goTab(id)
              }}
            >
              <span className="v0-dock-icon">
                <Icon name={icon} size={22} />
              </span>
              <span>{label}</span>
            </button>
          ))}
          {recorder.status === 'recording' ? (
            <span className="v0-dock-rec" role="status">
              <Badge tone="record" icon="record">
                REC
              </Badge>
            </span>
          ) : null}
        </nav>
      ) : null}
    </div>
  )
}
