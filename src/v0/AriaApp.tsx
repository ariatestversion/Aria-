import { useEffect, useMemo, useRef, useState } from 'react'
import { AuthGate } from '../components/AuthGate'
import { useMediaRecorder } from '../lib/recorder'
import { isGuestEmail, probeAuthMode, restoreSession, signOutV0, type AuthMode } from './auth'
import type { UserProfile } from '../types'
import { buildProgram, buildReview } from './pedagogy'
import {
  DEMO_GENRES,
  INSTRUMENTS,
  LEVELS,
  type AppScreen,
  type HabitId,
  type InstrumentId,
  type LevelId,
  type Piece,
  type SessionLog,
  type Take,
} from './model'
import {
  canCompleteSession,
  deleteBlob,
  deleteTakeMeta,
  getBlob,
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
type Tab = 'home' | 'library' | 'follow' | 'profile'

const OBJECTIVES = ['Fluidité et expression', 'Justesse', 'Rythme', 'Mémoire', 'Tempo'] as const
const DURATIONS = [15, 20, 30, 45, 60] as const

const asset = (path: string) => `${import.meta.env.BASE_URL}${path.replace(/^\//, '')}`

const INST_ICON: Record<InstrumentId, string | null> = {
  piano: asset('instruments/piano-dessin.png'),
  guitar: asset('instruments/guitare-dessin.png'),
  bass: asset('instruments/basse-dessin.png'),
  voice: null,
  drums: null,
  other: null,
}

const PIECE_THUMB: Record<string, string> = {
  'Nocturne Op. 9 n°2': asset('presets/the-entertainer.jpg'),
  'Clair de lune': asset('presets/clair-de-lune.jpg'),
  'Gymnopédie n°1': asset('presets/lettre-a-elise.png'),
}

function pieceThumb(title: string) {
  return PIECE_THUMB[title] || asset('presets/clair-de-lune.jpg')
}

function Wave({ live }: { live?: boolean }) {
  const heights = [18, 34, 52, 28, 46, 62, 30, 54, 40, 22, 48, 36, 58, 26, 44]
  return (
    <div className={`v0-wave${live ? ' is-live' : ''}`} aria-hidden>
      {heights.map((h, i) => (
        <span key={i} style={{ ['--h' as string]: `${h}px`, ['--d' as string]: `${(i % 6) * 0.08}s` }} />
      ))}
    </div>
  )
}

const playIcon = (
  <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M8 5.5v13l11-6.5z" />
  </svg>
)
const pauseIcon = (
  <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M6 5h4v14H6zm8 0h4v14h-4z" />
  </svg>
)

function fmt(sec: number) {
  const s = Math.max(0, Math.round(sec) || 0)
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

function Back({ onClick }: { onClick: () => void }) {
  return (
    <button className="v0-back" type="button" aria-label="Retour" onClick={onClick}>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M15 5 8 12l7 7" />
      </svg>
    </button>
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
  const [instruments, setInstruments] = useState<InstrumentId[]>(['piano'])
  const [level, setLevel] = useState<LevelId>('beginner')
  const [habits, setHabits] = useState<HabitId[]>(['score'])
  const [goals, setGoals] = useState<string[]>([OBJECTIVES[0]])
  const [preferredMinutes, setPreferredMinutes] = useState(30)
  const [pieces, setPieces] = useState<Piece[]>([])
  const [followTakeId, setFollowTakeId] = useState<string | null>(null)
  const [followAudioUrl, setFollowAudioUrl] = useState<string | null>(null)
  const [followPlaying, setFollowPlaying] = useState(false)
  const followAudioRef = useRef<HTMLAudioElement | null>(null)
  const [pieceId, setPieceId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [genre, setGenre] = useState('')
  const [prepMinutes, setPrepMinutes] = useState(30)
  const [prepObjective, setPrepObjective] = useState<string>(OBJECTIVES[0])
  const [prepDifficulties, setPrepDifficulties] = useState('')
  const [prepMode, setPrepMode] = useState<'guided' | 'free'>('guided')
  const [worksObs, setWorksObs] = useState('')
  const [improveObs, setImproveObs] = useState('')
  const [takes, setTakes] = useState<Take[]>([])
  const [activeTakeId, setActiveTakeId] = useState<string | null>(null)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [newPiece, setNewPiece] = useState({ title: '', artist: '', genre: 'Pop', instrument: 'piano' as InstrumentId })
  const [showAddPiece, setShowAddPiece] = useState(false)
  const [resourceNote, setResourceNote] = useState('')
  const [saveHint, setSaveHint] = useState('')
  const [takeHint, setTakeHint] = useState('')
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const recorder = useMediaRecorder()

  const piece = pieceId ? getPiece(pieceId) : null
  const completedLogs = email ? listCompletedSessionLogs(email) : []
  const draftLogs = email ? listDraftSessionLogs(email) : []

  const refreshPieces = (mail = email) => {
    if (!mail) return
    setPieces(listPieces(mail))
  }

  /** Discovery only — never auto-seed for comptes réels / nouveaux utilisateurs. */
  const loadDiscoveryExamples = (mail = email) => {
    if (!mail) return
    seedDemoPieces(mail)
    setPieces(listPieces(mail))
  }

  const refreshTakes = (mail = email, id = pieceId) => {
    if (!mail) return
    setTakes(listTakes(mail, id || undefined))
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
        if (musical) {
          setInstruments(musical.instruments.length ? musical.instruments : ['piano'])
          setLevel(musical.level)
          setHabits(musical.habits.length ? musical.habits : ['score'])
          if (musical.goals?.length) setGoals(musical.goals)
          if (musical.preferredMinutes) setPreferredMinutes(musical.preferredMinutes)
        }
        refreshPieces(mail)
        refreshTakes(mail)
        if (musical?.onboardingDone) {
          setScreen('home')
          setTab('home')
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

  useEffect(() => {
    return () => {
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    }
  }, [audioUrl])

  const goTab = (next: Tab) => {
    setTab(next)
    setShowAddPiece(false)
    if (next === 'home') setScreen('home')
    if (next === 'library') setScreen('library')
    if (next === 'follow') setScreen('follow')
    if (next === 'profile') setScreen('profile')
  }

  const hydratePrepFromPiece = (target: Piece) => {
    const program = target.program
    setPrepObjective(target.objective || program?.objective || goals[0] || OBJECTIVES[0])
    setPrepDifficulties(program?.difficulties || '')
    setPrepMinutes(program?.minutes || preferredMinutes || 30)
    const free =
      program?.steps?.length === 1 && program.steps[0]?.title === 'Pratique libre'
    setPrepMode(free ? 'free' : 'guided')
  }

  /** Reprend la séance en cours (durée / étape / passage) si un programme existe. */
  const resumePracticeFor = (id: string) => {
    const target = getPiece(id)
    if (!target) return
    setPieceId(id)
    refreshTakes(email, id)
    hydratePrepFromPiece(target)
    if (target.program?.steps?.length) {
      setScreen(target.program.steps[0]?.title === 'Pratique libre' ? 'record' : 'session')
      return
    }
    setScreen('prepare')
  }

  const startPracticeFor = (id: string) => {
    const target = getPiece(id)
    if (!target) return
    setPieceId(id)
    refreshTakes(email, id)
    hydratePrepFromPiece(target)
    setScreen('prepare')
  }

  const startPracticeFromHome = () => {
    if (inProgressPiece) resumePracticeFor(inProgressPiece.id)
    else if (lastCompletedPiece) startPracticeFor(lastCompletedPiece.id)
    else if (lastPiece) startPracticeFor(lastPiece.id)
    else goTab('library')
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

  /** Dernier morceau réellement travaillé (jamais une démo non travaillée). */
  const lastPiece =
    pieces.find((p) => p.lastWorkedAt && !p.demo) ||
    pieces.find((p) => p.lastWorkedAt) ||
    pieces.find((p) => !p.demo) ||
    null

  const isPieceInProgress = (p: Piece | null) => {
    if (!p?.program || !email) return false
    const done = listCompletedSessionLogs(email, p.id)[0]
    if (!done) return true
    return (p.program.updatedAt || p.updatedAt) > done.createdAt
  }

  const inProgressPiece =
    pieces.find((p) => isPieceInProgress(p) && !p.demo) ||
    pieces.find((p) => isPieceInProgress(p)) ||
    null

  const lastCompletedLog = completedLogs[0] || null
  const lastCompletedPiece = lastCompletedLog ? getPiece(lastCompletedLog.pieceId) : null

  const activeGenres = useMemo(() => {
    const present = new Set(pieces.map((p) => p.genre).filter(Boolean))
    return DEMO_GENRES.filter((g) => present.has(g))
  }, [pieces])

  function enterAfterAuth(profile: UserProfile) {
    setGuest(false)
    setEmail(profile.email)
    setFirstName((profile.firstName || '').trim())
    refreshPieces(profile.email)
    const musical = getMusicalProfile(profile.email)
    if (musical?.onboardingDone) {
      setInstruments(musical.instruments)
      setLevel(musical.level)
      setHabits(musical.habits)
      setScreen('home')
      setTab('home')
      return
    }
    if (musical) {
      setInstruments(musical.instruments)
      setLevel(musical.level)
      setHabits(musical.habits)
    }
    setScreen('onboarding')
    setOnboardStep(1)
  }

  function ensureGuestShell() {
    const mail = GUEST_EMAIL
    setGuest(true)
    setEmail(mail)
    setSessionEmail(mail)
    // Ne jamais inventer de prénom non renseigné
    setFirstName((firstName || '').trim())
    refreshPieces(mail)
    return mail
  }

  /** Commencer : onboarding, bibliothèque vide (pas de données fictives). */
  function startJourney() {
    const mail = ensureGuestShell()
    const musical = getMusicalProfile(mail)
    if (musical?.onboardingDone) {
      setInstruments(musical.instruments)
      setLevel(musical.level)
      setHabits(musical.habits)
      setScreen('home')
      setTab('home')
      return
    }
    setOnboardStep(1)
    setScreen('onboarding')
  }

  /** Découvrir : catalogue d’exemples clairement marqués « démonstration ». */
  function enterDiscovery() {
    const mail = ensureGuestShell()
    saveMusicalProfile({
      email: mail,
      instruments: instruments.length ? instruments : ['piano'],
      level,
      habits: habits.length ? habits : ['score'],
      goals: goals.length ? goals : [OBJECTIVES[0]],
      preferredMinutes,
      onboardingDone: true,
      updatedAt: new Date().toISOString(),
    })
    loadDiscoveryExamples(mail)
    setScreen('home')
    setTab('home')
  }

  function finishOnboarding(nextHabits = habits) {
    if (!email) return
    if (!instruments.length) return
    const resolvedHabits = nextHabits.length ? nextHabits : (['score'] as HabitId[])
    const resolvedGoals = goals.length ? goals : [OBJECTIVES[0]]
    setHabits(resolvedHabits)
    setGoals(resolvedGoals)
    saveMusicalProfile({
      email,
      instruments,
      level,
      habits: resolvedHabits,
      goals: resolvedGoals,
      preferredMinutes,
      onboardingDone: true,
      updatedAt: new Date().toISOString(),
    })
    setPrepMinutes(preferredMinutes)
    setPrepObjective(resolvedGoals[0] || OBJECTIVES[0])
    refreshPieces()
    setScreen('home')
    setTab('home')
  }

  function saveProfileEdits() {
    if (!email) return
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
    const accountPieces = listPieces(email)
    setPieces(accountPieces)
  }

  async function playFollowTake(id: string) {
    const blob = await getBlob(id)
    if (!blob) {
      setTakeHint('Impossible de charger cette prise après rechargement.')
      return
    }
    if (followAudioUrl) URL.revokeObjectURL(followAudioUrl)
    const url = URL.createObjectURL(blob)
    setFollowAudioUrl(url)
    setFollowTakeId(id)
    setFollowPlaying(false)
    setTimeout(() => {
      const el = followAudioRef.current
      if (el) void el.play()
    }, 50)
  }

  function createPiece() {
    if (!email || !newPiece.title.trim()) return
    const now = new Date().toISOString()
    const piece: Piece = {
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
    savePiece(piece)
    setShowAddPiece(false)
    setNewPiece({ title: '', artist: '', genre: 'Pop', instrument: instruments[0] || 'piano' })
    refreshPieces()
    openPiece(piece.id)
  }

  async function importPdf(file: File | null) {
    if (!file || !piece || !email) return
    const id = newId('pdf')
    await putBlob(id, file)
    const next: Piece = {
      ...piece,
      resources: [
        ...piece.resources,
        { id, kind: 'pdf', label: file.name, demo: false },
      ],
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
      resources: [
        ...piece.resources,
        { id: newId('res'), kind, label: resourceNote.trim(), text: resourceNote.trim() },
      ],
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

  function startPrepare() {
    if (!piece) return
    hydratePrepFromPiece(piece)
    setScreen('prepare')
  }

  function confirmProgram() {
    if (!piece || !email) return
    const musical = getMusicalProfile(email)
    if (prepMode === 'free') {
      const next = {
        ...piece,
        objective: prepObjective.trim(),
        program: {
          steps: [
            {
              id: newId('step'),
              title: 'Pratique libre',
              what: 'Travaille le passage à ton rythme.',
              how: 'Enregistre quand tu es prêt·e.',
              why: 'Garder une trace honnête de la séance.',
              success: 'Une prise sauvegardée.',
            },
          ],
          objective: prepObjective.trim() || 'Pratique libre',
          minutes: prepMinutes,
          difficulties: prepDifficulties,
          updatedAt: new Date().toISOString(),
          stepIndex: 0,
        },
        updatedAt: new Date().toISOString(),
        lastWorkedAt: new Date().toISOString(),
      }
      savePiece(next)
      refreshPieces()
      setPieceId(next.id)
      refreshTakes(email, next.id)
      setScreen('record')
      return
    }
    const program = buildProgram({
      piece: {
        ...piece,
        objective: prepObjective,
        passages: piece.passages,
      },
      level: musical?.level || level,
      minutes: prepMinutes,
      objective: prepObjective,
      difficulties: prepDifficulties,
      instrument: piece.instrument,
    })
    const next = {
      ...piece,
      objective: prepObjective.trim(),
      program: {
        ...program,
        stepIndex: piece.program?.stepIndex ?? 0,
      },
      updatedAt: new Date().toISOString(),
      lastWorkedAt: new Date().toISOString(),
    }
    savePiece(next)
    refreshPieces()
    setPieceId(next.id)
    refreshTakes(email, next.id)
    setScreen('session')
  }

  function markWorked() {
    if (!piece) return
    updatePieceFields({ lastWorkedAt: new Date().toISOString() })
  }

  async function stopAndSaveTake() {
    if (!piece || !email) return
    setTakeHint('')
    const blob = await recorder.stop()
    if (!blob || blob.size < 100) {
      setTakeHint('Aucune prise utilisable n’a été capturée. Réessaie l’enregistrement.')
      return
    }
    const takeId = newId('take')
    await putBlob(takeId, blob)
    const take: Take = {
      id: takeId,
      email,
      pieceId: piece.id,
      passage: piece.passages || piece.program?.objective || 'Passage',
      createdAt: new Date().toISOString(),
      seconds: recorder.seconds || 1,
      mime: blob.type || 'audio/webm',
    }
    saveTakeMeta(take)
    markWorked()
    refreshTakes(email, piece.id)
    setActiveTakeId(takeId)
    const url = URL.createObjectURL(blob)
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(url)
    setTakeHint('Prise sauvegardée sur cet appareil.')
  }

  async function loadTake(id: string) {
    const blob = await getBlob(id)
    if (!blob) return
    if (audioUrl) URL.revokeObjectURL(audioUrl)
    setAudioUrl(URL.createObjectURL(blob))
    setActiveTakeId(id)
    setPlaying(false)
    setProgress(0)
  }

  async function removeTake(id: string) {
    await deleteBlob(id)
    deleteTakeMeta(id)
    if (activeTakeId === id) {
      setActiveTakeId(null)
      if (audioUrl) URL.revokeObjectURL(audioUrl)
      setAudioUrl(null)
    }
    refreshTakes()
  }

  function persistSession(status: 'draft' | 'completed') {
    if (!piece || !email) return false
    const takeIds = listTakes(email, piece.id).map((t) => t.id)
    const review = buildReview({
      works: worksObs,
      improve: improveObs,
      programObjective: piece.objective || piece.program?.objective || '',
      instrument: piece.instrument,
    })
    if (status === 'completed' && !canCompleteSession({ takeIds, observationWorks: worksObs, observationImprove: improveObs })) {
      setSaveHint('Pour terminer une séance, enregistre au moins une prise ou note une observation.')
      return false
    }
    const log: SessionLog = {
      id: newId('log'),
      email,
      pieceId: piece.id,
      createdAt: new Date().toISOString(),
      minutes: piece.program?.minutes || prepMinutes,
      objective: piece.objective || piece.program?.objective || '',
      observationWorks: status === 'completed' ? review.works : worksObs.trim(),
      observationImprove: status === 'completed' ? review.improve : improveObs.trim(),
      nextStep: status === 'completed' ? review.next : 'Brouillon — séance non terminée.',
      takeIds,
      source: 'user',
      status,
    }
    saveSessionLog(log)
    if (status === 'completed') markWorked()
    setSaveHint('')
    return true
  }

  function saveReview() {
    if (!persistSession('completed')) return
    setScreen('home')
    setTab('home')
  }

  function saveDraftReview() {
    if (!persistSession('draft')) return
    setScreen('home')
    setTab('home')
  }

  async function logout() {
    await signOutV0()
    setGuest(false)
    setEmail('')
    setFirstName('')
    setPieces([])
    setPieceId(null)
    setTakes([])
    setActiveTakeId(null)
    setScreen('welcome')
  }

  if (boot) {
    return (
      <div className="v0-app nodock">
        <div className="v0-main">
          <p className="v0-ask">Chargement d’Aria…</p>
        </div>
      </div>
    )
  }

  const docked = ['home', 'library', 'follow', 'profile', 'piece', 'prepare', 'session', 'record', 'review'].includes(screen)

  return (
    <div className={`v0-app${docked ? '' : ' nodock'}`}>
      {authMode !== 'cloud' ? (
        <div className="v0-banner" style={{ margin: 0, borderRadius: 0 }} role="status">
          {authMode === 'down'
            ? 'La connexion cloud est temporairement indisponible. Tes comptes créés maintenant restent sur cet appareil.'
            : 'Mode compte local : tes données restent sur cet appareil.'}
        </div>
      ) : null}

      {screen === 'welcome' ? (
        <section className="v0-welcome">
          <div
            className="v0-welcome-bg"
            aria-hidden
            style={{ ['--welcome-photo' as string]: `url(${asset('presets/clair-de-lune.jpg')})` }}
          />
          <div className="v0-welcome-copy">
            <p className="v0-brand">ARIA</p>
            <p className="v0-slogan">Just Play Something.</p>
            <p className="v0-tag">Travaille et joue tes morceaux, sans professeur.</p>
            <div className="v0-air">
              <button className="v0-btn ghost" type="button" onClick={startJourney}>
                Commencer
              </button>
              <button className="v0-textbtn" type="button" onClick={() => setScreen('auth')}>
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
          <div className="v0-onboard-progress" aria-hidden>
            <i style={{ ['--p' as string]: `${Math.round((onboardStep / 4) * 100)}%` }} />
          </div>
          {onboardStep === 1 ? (
            <>
              <h1>Quels instruments joues-tu ?</h1>
              <p className="v0-ask">Étape 1/4 — tu peux en choisir plusieurs.</p>
              <div className="v0-inst-grid">
                {INSTRUMENTS.map((item) => {
                  const on = instruments.includes(item.id)
                  const icon = INST_ICON[item.id]
                  return (
                    <button
                      key={item.id}
                      type="button"
                      className={`v0-inst${on ? ' on' : ''}`}
                      onClick={() =>
                        setInstruments((prev) =>
                          prev.includes(item.id) ? prev.filter((x) => x !== item.id) : [...prev, item.id],
                        )
                      }
                    >
                      {icon ? <img src={icon} alt="" /> : <span aria-hidden>♪</span>}
                      {item.label}
                    </button>
                  )
                })}
              </div>
              <div className="v0-air">
                <button className="v0-btn" type="button" disabled={!instruments.length} onClick={() => setOnboardStep(2)}>
                  Continuer
                </button>
              </div>
            </>
          ) : null}
          {onboardStep === 2 ? (
            <>
              <h1>Quel est ton niveau ?</h1>
              <p className="v0-ask">Étape 2/4 — Aria adapte le cadre de travail.</p>
              <div className="v0-list">
                {LEVELS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={`v0-level${level === item.id ? ' on' : ''}`}
                    onClick={() => setLevel(item.id)}
                  >
                    <b>{item.label}</b>
                    <span>{item.hint}</span>
                  </button>
                ))}
              </div>
              <div className="v0-air">
                <button className="v0-btn secondary" type="button" onClick={() => setOnboardStep(1)}>
                  Retour
                </button>
                <button className="v0-btn" type="button" onClick={() => setOnboardStep(3)}>
                  Continuer
                </button>
              </div>
            </>
          ) : null}
          {onboardStep === 3 ? (
            <>
              <h1>Quels sont tes objectifs ?</h1>
              <p className="v0-ask">Étape 3/4 — un ou plusieurs axes de travail.</p>
              <div className="v0-chips">
                {OBJECTIVES.map((o) => (
                  <button
                    key={o}
                    type="button"
                    className={goals.includes(o) ? 'on' : ''}
                    onClick={() =>
                      setGoals((prev) => (prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]))
                    }
                  >
                    {o}
                  </button>
                ))}
              </div>
              <div className="v0-air">
                <button className="v0-btn secondary" type="button" onClick={() => setOnboardStep(2)}>
                  Retour
                </button>
                <button className="v0-btn" type="button" disabled={!goals.length} onClick={() => setOnboardStep(4)}>
                  Continuer
                </button>
              </div>
            </>
          ) : null}
          {onboardStep === 4 ? (
            <>
              <h1>Combien de temps as-tu ?</h1>
              <p className="v0-ask">Étape 4/4 — durée habituelle d’une séance.</p>
              <div className="v0-chips">
                {DURATIONS.map((d) => (
                  <button
                    key={d}
                    type="button"
                    className={preferredMinutes === d ? 'on' : ''}
                    onClick={() => setPreferredMinutes(d)}
                  >
                    {d} min
                  </button>
                ))}
              </div>
              <div className="v0-air">
                <button className="v0-btn secondary" type="button" onClick={() => setOnboardStep(3)}>
                  Retour
                </button>
                <button className="v0-btn" type="button" onClick={() => finishOnboarding(habits.length ? habits : ['score'])}>
                  Entrer dans Aria
                </button>
              </div>
            </>
          ) : null}
        </section>
      ) : null}

      {screen === 'home' ? (
        <section className="v0-main">
          <div className="v0-home-head">
            <p className="v0-home-brand">ARIA</p>
            <div className="v0-home-tools">
              <span className="v0-iconbtn" aria-hidden>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                  <path d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2a2 2 0 0 1-.6 1.4L4 17h5" />
                  <path d="M10 17a2 2 0 0 0 4 0" />
                </svg>
              </span>
              <button className="v0-avatar" type="button" aria-label="Profil" onClick={() => goTab('profile')}>
                {(firstName || 'A').slice(0, 1).toUpperCase()}
              </button>
            </div>
          </div>
          <h1 className="v0-hello">
            {firstName ? (
              <>
                Bonjour {firstName},
                <br />
                Envie de jouer ?
              </>
            ) : (
              <>Envie de jouer ?</>
            )}
          </h1>
          {inProgressPiece ? (
            <button
              className="v0-resume"
              type="button"
              style={{ ['--resume-photo' as string]: `url(${pieceThumb(inProgressPiece.title)})` }}
              onClick={() => resumePracticeFor(inProgressPiece.id)}
            >
              <small>
                Reprendre ma séance
                {inProgressPiece.program?.minutes ? ` · ${inProgressPiece.program.minutes} min` : ''}
              </small>
              <b>{inProgressPiece.title}</b>
              <span className="v0-resume-play" aria-hidden>
                {playIcon}
              </span>
            </button>
          ) : lastCompletedPiece ? (
            <div className="v0-home-actions">
              <button
                className="v0-resume"
                type="button"
                style={{ ['--resume-photo' as string]: `url(${pieceThumb(lastCompletedPiece.title)})` }}
                onClick={() => openPiece(lastCompletedPiece.id)}
              >
                <small>Dernière séance terminée</small>
                <b>{lastCompletedPiece.title}</b>
              </button>
              <div className="v0-air" style={{ marginTop: 10 }}>
                <button className="v0-btn" type="button" onClick={() => startPracticeFor(lastCompletedPiece.id)}>
                  Nouvelle séance
                </button>
                <button
                  className="v0-btn secondary"
                  type="button"
                  onClick={() => {
                    openPiece(lastCompletedPiece.id)
                  }}
                >
                  Voir le bilan
                </button>
              </div>
            </div>
          ) : (
            <button
              className="v0-resume"
              type="button"
              style={{ ['--resume-photo' as string]: `url(${asset('presets/the-entertainer.jpg')})` }}
              onClick={() => goTab('library')}
            >
              <small>Commencer</small>
              <b>Ajouter ou choisir un morceau</b>
            </button>
          )}
          <p className="v0-kicker">Mes accès rapides</p>
          <div className="v0-quick">
            <button type="button" onClick={startPracticeFromHome}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M8 5.5v13l11-6.5z" /></svg>
              Pratiquer
            </button>
            <button type="button" onClick={() => goTab('library')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M6 4h10v16H6zM16 7h2v13h-2" /></svg>
              Bibliothèque
            </button>
            <button type="button" onClick={() => goTab('follow')}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" /></svg>
              Suivi
            </button>
          </div>
          <p className="v0-kicker">Séances terminées</p>
          <div className="v0-list">
            {completedLogs.length ? (
              completedLogs.slice(0, 4).map((log) => {
                const p = getPiece(log.pieceId)
                return (
                  <button key={log.id} className="v0-piece-row" type="button" onClick={() => openPiece(log.pieceId)}>
                    <img className="v0-piece-thumb" src={pieceThumb(p?.title || '')} alt="" />
                    <span>
                      <b>{p?.title || 'Morceau'}</b>
                      <span>
                        {new Date(log.createdAt).toLocaleDateString('fr-FR')}
                        {log.minutes ? ` · ${log.minutes} min` : ''}
                      </span>
                    </span>
                    <span className="v0-meta">›</span>
                  </button>
                )
              })
            ) : (
              <div className="v0-empty">
                <p className="v0-note">Pas encore de séance terminée.</p>
                <button className="v0-btn secondary" type="button" onClick={() => goTab('library')}>
                  Ouvrir la bibliothèque
                </button>
              </div>
            )}
          </div>
        </section>
      ) : null}

      {screen === 'library' ? (
        <section className="v0-main">
          <h1>Bibliothèque</h1>
          <div className="v0-search">
            <input
              className="v0-field"
              style={{ marginTop: 0 }}
              placeholder="Rechercher un morceau…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          {pieces.length ? (
            <div className="v0-chips">
              <button type="button" className={!genre ? 'on' : ''} onClick={() => setGenre('')}>
                Tout
              </button>
              {activeGenres.map((g) => (
                <button key={g} type="button" className={genre === g ? 'on' : ''} onClick={() => setGenre(g)}>
                  {g}
                </button>
              ))}
            </div>
          ) : null}
          <div className="v0-list" style={{ marginTop: 14 }}>
            {filtered.map((p) => (
              <button key={p.id} className="v0-piece-row" type="button" onClick={() => openPiece(p.id)}>
                <img className="v0-piece-thumb" src={pieceThumb(p.title)} alt="" />
                <span>
                  <b>
                    {p.title}
                    {p.demo ? <em className="v0-demo-tag"> Démo</em> : null}
                  </b>
                  <span>{p.artist || 'Sans artiste'}</span>
                </span>
                <span className="v0-meta">›</span>
              </button>
            ))}
            {!filtered.length && pieces.length ? (
              <div className="v0-empty">
                <p className="v0-note">Aucun morceau ne correspond à cette recherche.</p>
                <button
                  className="v0-btn secondary"
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
              <div className="v0-empty">
                <p className="v0-note">Ta bibliothèque est vide. Ajoute un morceau pour commencer.</p>
                {guest ? (
                  <button className="v0-textbtn" type="button" onClick={() => loadDiscoveryExamples()}>
                    Charger des exemples de démonstration
                  </button>
                ) : null}
              </div>
            ) : null}
          </div>
          <div className="v0-air">
            <button className="v0-btn secondary" type="button" onClick={() => setShowAddPiece((v) => !v)}>
              {showAddPiece ? 'Fermer' : 'Ajouter un morceau'}
            </button>
          </div>
          {showAddPiece ? (
            <div className="v0-list">
              <input className="v0-field" placeholder="Titre" value={newPiece.title} onChange={(e) => setNewPiece({ ...newPiece, title: e.target.value })} />
              <input className="v0-field" placeholder="Artiste ou compositeur" value={newPiece.artist} onChange={(e) => setNewPiece({ ...newPiece, artist: e.target.value })} />
              <select className="v0-field" value={newPiece.genre} onChange={(e) => setNewPiece({ ...newPiece, genre: e.target.value })}>
                {DEMO_GENRES.map((g) => (
                  <option key={g}>{g}</option>
                ))}
              </select>
              <select className="v0-field" value={newPiece.instrument} onChange={(e) => setNewPiece({ ...newPiece, instrument: e.target.value as InstrumentId })}>
                {INSTRUMENTS.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.label}
                  </option>
                ))}
              </select>
              <button className="v0-btn" type="button" onClick={createPiece}>
                Enregistrer le morceau
              </button>
            </div>
          ) : null}
        </section>
      ) : null}

      {screen === 'piece' && piece ? (
        <section className="v0-main">
          <div className="v0-top"><Back onClick={() => goTab('library')} /></div>
          <h1>
            {piece.title}
            {piece.demo ? <em className="v0-demo-tag"> Démo</em> : null}
          </h1>
          <p className="v0-note">{piece.artist || 'Artiste non renseigné'} · {INSTRUMENTS.find((i) => i.id === piece.instrument)?.label}</p>
          {piece.demo ? (
            <p className="v0-banner">Exemple de démonstration — ce n’est pas une donnée de ton historique.</p>
          ) : null}
          <p className="v0-kicker">Objectif</p>
          <input className="v0-field" value={piece.objective} placeholder="Objectif musical" onChange={(e) => updatePieceFields({ objective: e.target.value })} />
          <p className="v0-kicker">Passages</p>
          <textarea className="v0-field" value={piece.passages} placeholder="Passage à travailler" onChange={(e) => updatePieceFields({ passages: e.target.value })} />
          <p className="v0-kicker">Notes</p>
          <textarea className="v0-field" value={piece.notes} placeholder="Notes personnelles" onChange={(e) => updatePieceFields({ notes: e.target.value })} />
          <p className="v0-kicker">Ressources</p>
          <div className="v0-list">
            {piece.resources.map((r) => (
              <div key={r.id} className="v0-card">
                <b>{r.label}</b>
                <span>{r.kind}{r.demo ? ' · démonstration' : ''}</span>
              </div>
            ))}
          </div>
          <input className="v0-field" placeholder="Accords, tablature, lien audio/vidéo…" value={resourceNote} onChange={(e) => setResourceNote(e.target.value)} />
          <div className="v0-chips">
            <button type="button" onClick={() => addTextResource('chords')}>Accords</button>
            <button type="button" onClick={() => addTextResource('tabs')}>Tablature</button>
            <button type="button" onClick={() => addTextResource('video')}>Réf. vidéo</button>
            <button type="button" onClick={() => addTextResource('audio')}>Réf. audio</button>
          </div>
          <label className="v0-textbtn" style={{ display: 'inline-block' }}>
            Importer une partition PDF
            <input hidden type="file" accept="application/pdf" onChange={(e) => void importPdf(e.target.files?.[0] || null)} />
          </label>
          {piece.program ? (
            <>
              <p className="v0-kicker">Programme</p>
              <div className="v0-card">
                <b>{piece.program.objective}</b>
                <span>{piece.program.steps.length} étapes · index {piece.program.stepIndex + 1}</span>
              </div>
            </>
          ) : null}
          <p className="v0-kicker">Prises</p>
          <div className="v0-list">
            {listTakes(email, piece.id).map((t) => (
              <div key={t.id} className="v0-card">
                <b>{new Date(t.createdAt).toLocaleString('fr-FR')}</b>
                <span>{fmt(t.seconds)} · {t.passage || 'Passage'}</span>
              </div>
            ))}
            {!listTakes(email, piece.id).length ? <p className="v0-note">Aucune prise pour ce morceau.</p> : null}
          </div>
          <div className="v0-air">
            <button
              className="v0-btn"
              type="button"
              onClick={() => (piece.program ? resumePracticeFor(piece.id) : startPrepare())}
            >
              {piece.program ? 'Reprendre le travail' : 'Commencer à travailler'}
            </button>
            <button
              className="v0-btn secondary"
              type="button"
              onClick={() => {
                refreshTakes(email, piece.id)
                setScreen('record')
              }}
            >
              S’enregistrer
            </button>
          </div>
        </section>
      ) : null}

      {screen === 'prepare' && piece ? (
        <section className="v0-main">
          <div className="v0-top">
            <Back onClick={() => setScreen('piece')} />
          </div>
          <h1>Préparer ma séance</h1>
          <p className="v0-ask">
            {piece.title}
            {piece.artist ? ` — ${piece.artist}` : ''}
          </p>
          <p className="v0-kicker">Objectif</p>
          <select className="v0-field" value={prepObjective} onChange={(e) => setPrepObjective(e.target.value)}>
            {OBJECTIVES.map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
          <p className="v0-kicker">Durée disponible</p>
          <select className="v0-field" value={prepMinutes} onChange={(e) => setPrepMinutes(Number(e.target.value) || 30)}>
            {DURATIONS.map((d) => (
              <option key={d} value={d}>
                {d} minutes
              </option>
            ))}
          </select>
          <p className="v0-kicker">Type de séance</p>
          <div className="v0-seg" role="group" aria-label="Type de séance">
            <button type="button" className={prepMode === 'guided' ? 'on' : ''} onClick={() => setPrepMode('guided')}>
              Guidée
            </button>
            <button type="button" className={prepMode === 'free' ? 'on' : ''} onClick={() => setPrepMode('free')}>
              Libre
            </button>
          </div>
          <textarea
            className="v0-field"
            placeholder="Difficultés (rythme, justesse…)"
            value={prepDifficulties}
            onChange={(e) => setPrepDifficulties(e.target.value)}
          />
          <div className="v0-air">
            <button className="v0-btn" type="button" onClick={confirmProgram}>
              Créer ma séance
            </button>
          </div>
        </section>
      ) : null}

      {screen === 'session' && piece?.program ? (
        <section className="v0-main v0-session">
          <div className="v0-top">
            <Back onClick={() => setScreen('piece')} />
          </div>
          {(() => {
            const idx = Math.min(piece.program!.stepIndex, piece.program!.steps.length - 1)
            const step = piece.program!.steps[idx]
            const total = piece.program!.steps.length
            return (
              <>
                <p className="v0-meta">
                  {idx + 1}/{total}
                </p>
                <div className="v0-session-bar" aria-hidden>
                  <i style={{ ['--p' as string]: `${Math.round(((idx + 1) / total) * 100)}%` }} />
                </div>
                <h1>Ma séance</h1>
                <p className="v0-ask">{step.what}</p>
                <Wave />
                <div className="v0-card" style={{ textAlign: 'left' }}>
                  <b>{step.title}</b>
                  <span>Comment : {step.how}</span>
                  <span>Réussite : {step.success}</span>
                </div>
                <div className="v0-air">
                  <button className="v0-btn" type="button" onClick={() => { refreshTakes(); setScreen('record') }}>
                    Enregistrer
                  </button>
                  <button
                    className="v0-btn secondary"
                    type="button"
                    onClick={() => {
                      if (idx >= total - 1) {
                        setWorksObs('')
                        setImproveObs('')
                        setScreen('review')
                      } else {
                        updatePieceFields({ program: { ...piece.program!, stepIndex: idx + 1 } })
                      }
                    }}
                  >
                    {idx >= total - 1 ? 'Passer au feedback' : 'Étape suivante'}
                  </button>
                </div>
                <div className="v0-tools">
                  <button type="button" onClick={() => setScreen('piece')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M7 4h10v16H7z" /><path d="M10 8h4" /></svg>
                    Partition
                  </button>
                  <button type="button" disabled>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><circle cx="12" cy="12" r="8" /><path d="M12 8v4l2.5 1.5" /></svg>
                    Métronome
                  </button>
                  <button type="button" onClick={() => setScreen('piece')}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6"><path d="M5 5h14v14H5z" /><path d="M8 9h8M8 13h6" /></svg>
                    Notes
                  </button>
                </div>
              </>
            )
          })()}
        </section>
      ) : null}

      {screen === 'record' && piece ? (
        <section className="v0-main v0-session">
          <div className="v0-top">
            <Back onClick={() => setScreen(piece.program ? 'session' : 'piece')} />
          </div>
          <h1>Ma séance</h1>
          <p className="v0-ask">Écoute le passage, puis joue-le à ton rythme.</p>
          <Wave live={recorder.status === 'recording'} />
          <p className="v0-clock">{fmt(recorder.seconds)}</p>
          {recorder.errorMessage ? (
            <p className="v0-alert" role="alert">
              {recorder.errorMessage}
            </p>
          ) : null}
          {takeHint ? <p className="v0-note">{takeHint}</p> : null}
          {recorder.status === 'denied' ? (
            <div className="v0-empty">
              <p className="v0-note">
                Autorise le micro dans les réglages du navigateur, puis réessaie.
              </p>
              <button className="v0-btn secondary" type="button" onClick={() => void recorder.start()}>
                Réessayer le micro
              </button>
            </div>
          ) : null}
          {recorder.status === 'unsupported' ? (
            <p className="v0-note">L’enregistrement audio n’est pas disponible sur cet appareil ou ce navigateur.</p>
          ) : null}
          <p className="v0-meta" aria-live="polite">
            {recorder.status === 'recording' ? 'Enregistrement en cours…' : 'Prêt à enregistrer'}
          </p>
          <button
            className={`v0-rec${recorder.status === 'recording' ? ' is-on' : ''}`}
            type="button"
            aria-label={recorder.status === 'recording' ? 'Arrêter' : 'Enregistrer'}
            disabled={recorder.status === 'unsupported'}
            onClick={() => {
              setTakeHint('')
              if (recorder.status === 'recording') void stopAndSaveTake()
              else void recorder.start()
            }}
          >
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
              {recorder.status === 'recording' ? <rect x="7" y="7" width="10" height="10" rx="1.5" /> : <circle cx="12" cy="12" r="7" />}
            </svg>
          </button>
          <div className="v0-tools">
            <button type="button" onClick={() => setScreen('piece')}>
              Partition
            </button>
            <button type="button" disabled>
              Métronome
            </button>
            <button type="button" onClick={() => setScreen('piece')}>
              Notes
            </button>
          </div>
          <p className="v0-kicker">Prises</p>
          <div className="v0-take-tabs">
            {takes.map((t, i) => (
              <button key={t.id} type="button" className={activeTakeId === t.id ? 'on' : ''} onClick={() => void loadTake(t.id)}>
                Prise {i + 1}
              </button>
            ))}
          </div>
          {audioUrl ? (
            <div className="v0-player">
              <audio
                ref={audioRef}
                src={audioUrl}
                onTimeUpdate={(e) => {
                  const el = e.currentTarget
                  setProgress(el.duration ? el.currentTime / el.duration : 0)
                }}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
              />
              <div
                className="v0-track"
                onClick={(e) => {
                  const el = audioRef.current
                  if (!el || !el.duration) return
                  const rect = e.currentTarget.getBoundingClientRect()
                  el.currentTime = ((e.clientX - rect.left) / rect.width) * el.duration
                }}
              >
                <i style={{ ['--p' as string]: `${Math.round(progress * 100)}%` }} />
              </div>
              <button
                className="v0-play"
                type="button"
                aria-label={playing ? 'Pause' : 'Lecture'}
                onClick={() => {
                  const el = audioRef.current
                  if (!el) return
                  if (el.paused) void el.play()
                  else el.pause()
                }}
              >
                {playing ? pauseIcon : playIcon}
              </button>
              {activeTakeId ? (
                <button className="v0-textbtn" type="button" onClick={() => void removeTake(activeTakeId)}>
                  Supprimer la prise
                </button>
              ) : null}
            </div>
          ) : null}
          <div className="v0-air">
            <button
              className="v0-btn secondary"
              type="button"
              onClick={() => {
                setWorksObs('')
                setImproveObs('')
                setScreen('review')
              }}
            >
              Voir le feedback
            </button>
          </div>
        </section>
      ) : null}

      {screen === 'review' && piece ? (
        <section className="v0-main">
          <div className="v0-top">
            <Back onClick={() => setScreen('record')} />
          </div>
          <h1>Feedback</h1>
          <div className="v0-take-tabs" style={{ marginBottom: 12 }}>
            {takes.map((t, i) => (
              <button key={t.id} type="button" className={activeTakeId === t.id ? 'on' : ''} onClick={() => void loadTake(t.id)}>
                Prise {i + 1}
              </button>
            ))}
            {!takes.length ? <span className="v0-note">Aucune prise pour l’instant</span> : null}
          </div>
          <p className="v0-banner">
            {buildReview({
              works: worksObs,
              improve: improveObs,
              programObjective: piece.objective || '',
              instrument: piece.instrument,
            }).disclaimer}
          </p>
          <div className="v0-list">
            <div className="v0-feed">
              <div className="v0-feed-title">
                <span className="dot ok" /> Ce qui fonctionne
              </div>
              <textarea className="v0-field" placeholder="Tes observations…" value={worksObs} onChange={(e) => setWorksObs(e.target.value)} />
            </div>
            <div className="v0-feed">
              <div className="v0-feed-title">
                <span className="dot warn" /> À travailler
              </div>
              <textarea className="v0-field" placeholder="Ce qui doit progresser…" value={improveObs} onChange={(e) => setImproveObs(e.target.value)} />
            </div>
            <div className="v0-feed">
              <div className="v0-feed-title">
                <span className="dot next" /> Prochaine étape
              </div>
              <span>
                {
                  buildReview({
                    works: worksObs,
                    improve: improveObs,
                    programObjective: piece.objective || '',
                    instrument: piece.instrument,
                  }).next
                }
              </span>
            </div>
          </div>
          {saveHint ? (
            <p className="v0-alert" role="alert">
              {saveHint}
            </p>
          ) : null}
          <div className="v0-air">
            <button className="v0-btn secondary" type="button" onClick={() => setScreen('record')}>
              Nouvelle tentative
            </button>
            <button className="v0-btn" type="button" onClick={saveReview}>
              Terminer la séance
            </button>
            <button className="v0-textbtn" type="button" onClick={saveDraftReview}>
              Enregistrer comme brouillon
            </button>
          </div>
        </section>
      ) : null}

      {screen === 'follow' ? (
        <section className="v0-main">
          <h1>Suivi</h1>
          <p className="v0-ask">Séances terminées et prises réellement enregistrées — les brouillons restent à part.</p>
          <p className="v0-kicker">Séances terminées</p>
          <div className="v0-list">
            {completedLogs.map((log) => {
              const p = getPiece(log.pieceId)
              return (
                <button key={log.id} className="v0-card" type="button" onClick={() => openPiece(log.pieceId)}>
                  <b>{p?.title || 'Morceau'}</b>
                  <span>
                    Terminée · {new Date(log.createdAt).toLocaleString('fr-FR')}
                    {log.minutes ? ` · ${log.minutes} min` : ''}
                    {log.objective ? ` · ${log.objective}` : ''}
                  </span>
                  {log.nextStep ? <span>{log.nextStep}</span> : null}
                </button>
              )
            })}
            {!completedLogs.length ? (
              <div className="v0-empty">
                <p className="v0-note">Aucune séance terminée pour l’instant.</p>
                <button className="v0-btn secondary" type="button" onClick={startPracticeFromHome}>
                  Lancer une pratique
                </button>
              </div>
            ) : null}
          </div>
          {draftLogs.length ? (
            <>
              <p className="v0-kicker">Brouillons</p>
              <div className="v0-list">
                {draftLogs.map((log) => {
                  const p = getPiece(log.pieceId)
                  return (
                    <button key={log.id} className="v0-card" type="button" onClick={() => openPiece(log.pieceId)}>
                      <b>{p?.title || 'Morceau'}</b>
                      <span>Brouillon · {new Date(log.createdAt).toLocaleString('fr-FR')} — non compté comme terminé</span>
                    </button>
                  )
                })}
              </div>
            </>
          ) : null}
          <p className="v0-kicker">Prises audio</p>
          {followAudioUrl ? (
            <div className="v0-player v0-player-follow">
              <audio
                ref={followAudioRef}
                src={followAudioUrl}
                onPlay={() => setFollowPlaying(true)}
                onPause={() => setFollowPlaying(false)}
                onEnded={() => setFollowPlaying(false)}
              />
              <button
                className="v0-play"
                type="button"
                aria-label={followPlaying ? 'Pause' : 'Lecture'}
                onClick={() => {
                  const el = followAudioRef.current
                  if (!el) return
                  if (el.paused) void el.play()
                  else el.pause()
                }}
              >
                {followPlaying ? pauseIcon : playIcon}
              </button>
              <p className="v0-note">
                {followTakeId
                  ? `Lecture · ${getPiece(listTakes(email).find((t) => t.id === followTakeId)?.pieceId || '')?.title || 'prise'}`
                  : 'Lecteur'}
              </p>
            </div>
          ) : null}
          <div className="v0-list">
            {listTakes(email).map((t) => {
              const p = getPiece(t.pieceId)
              return (
                <div key={t.id} className="v0-card v0-take-card">
                  <b>
                    {p?.title || 'Morceau'}
                    {p?.demo ? <em className="v0-demo-tag"> Démo</em> : null}
                  </b>
                  <span>
                    {new Date(t.createdAt).toLocaleString('fr-FR')} · {fmt(t.seconds)}
                  </span>
                  <div className="v0-take-actions">
                    <button className="v0-btn secondary" type="button" onClick={() => void playFollowTake(t.id)}>
                      {followTakeId === t.id && followPlaying ? 'En écoute…' : 'Réécouter'}
                    </button>
                    <button
                      className="v0-textbtn"
                      type="button"
                      onClick={() => {
                        openPiece(t.pieceId)
                        setScreen('record')
                        void loadTake(t.id)
                      }}
                    >
                      Ouvrir
                    </button>
                  </div>
                </div>
              )
            })}
            {!listTakes(email).length ? (
              <p className="v0-note">Aucune prise audio enregistrée.</p>
            ) : null}
          </div>
        </section>
      ) : null}

      {screen === 'profile' ? (
        <section className="v0-main">
          <h1>Profil</h1>
          <p className="v0-note">
            {firstName ? `${firstName} · ` : ''}
            {guest ? 'Mode découverte (sans compte)' : email}
          </p>
          <p className="v0-banner" role="status">
            {authMode === 'cloud'
              ? 'Connexion cloud active (compte synchronisable).'
              : authMode === 'down'
                ? 'Cloud temporairement indisponible — comptes locaux sur cet appareil uniquement.'
                : 'Mode local — données sur cet appareil (cloud non configuré ou indisponible).'}
          </p>
          <p className="v0-kicker">Objectifs</p>
          <div className="v0-chips">
            {OBJECTIVES.map((o) => (
              <button
                key={o}
                type="button"
                className={goals.includes(o) ? 'on' : ''}
                onClick={() =>
                  setGoals((prev) => (prev.includes(o) ? prev.filter((x) => x !== o) : [...prev, o]))
                }
              >
                {o}
              </button>
            ))}
          </div>
          <p className="v0-kicker">Durée habituelle</p>
          <div className="v0-chips">
            {DURATIONS.map((d) => (
              <button
                key={d}
                type="button"
                className={preferredMinutes === d ? 'on' : ''}
                onClick={() => setPreferredMinutes(d)}
              >
                {d} min
              </button>
            ))}
          </div>
          <p className="v0-kicker">Instruments</p>
          <div className="v0-chips">
            {INSTRUMENTS.map((item) => (
              <button
                key={item.id}
                type="button"
                className={instruments.includes(item.id) ? 'on' : ''}
                onClick={() =>
                  setInstruments((prev) => (prev.includes(item.id) ? prev.filter((x) => x !== item.id) : [...prev, item.id]))
                }
              >
                {item.label}
              </button>
            ))}
          </div>
          <p className="v0-kicker">Niveau</p>
          <div className="v0-list">
            {LEVELS.map((item) => (
              <button key={item.id} type="button" className={`v0-level${level === item.id ? ' on' : ''}`} onClick={() => setLevel(item.id)}>
                <b>{item.label}</b>
                <span>{item.hint}</span>
              </button>
            ))}
          </div>
          <div className="v0-air">
            <button className="v0-btn" type="button" onClick={saveProfileEdits}>
              Enregistrer
            </button>
            {guest ? <p className="v0-note">Mode découverte. « Se connecter » depuis l’accueil pour un compte.</p> : null}
            {!guest ? (
              <button className="v0-btn secondary" type="button" onClick={() => setScreen('auth')}>
                Gérer la connexion
              </button>
            ) : (
              <button className="v0-btn secondary" type="button" onClick={() => setScreen('auth')}>
                Se connecter
              </button>
            )}
            <button className="v0-textbtn" type="button" onClick={() => void logout()}>
              {guest ? 'Quitter la découverte' : 'Se déconnecter'}
            </button>
          </div>
        </section>
      ) : null}

      {docked ? (
        <nav className="v0-dock" aria-label="Navigation">
          <button type="button" className={tab === 'home' ? 'on' : ''} onClick={() => goTab('home')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z" />
            </svg>
            <span>Accueil</span>
          </button>
          <button type="button" className={tab === 'library' ? 'on' : ''} onClick={() => goTab('library')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <path d="M6 4h10v16H6zM16 7h2v13h-2" />
              <path d="M9 8h4M9 12h4" />
            </svg>
            <span>Bibliothèque</span>
          </button>
          <button type="button" className={tab === 'follow' ? 'on' : ''} onClick={() => goTab('follow')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="12" r="8" />
              <path d="M12 8v4l3 2" />
            </svg>
            <span>Suivi</span>
          </button>
          <button type="button" className={tab === 'profile' ? 'on' : ''} onClick={() => goTab('profile')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <circle cx="12" cy="8" r="3" />
              <path d="M5.5 19c1.4-2.8 3.6-4 6.5-4s5.1 1.2 6.5 4" />
            </svg>
            <span>Profil</span>
          </button>
        </nav>
      ) : null}
    </div>
  )
}
