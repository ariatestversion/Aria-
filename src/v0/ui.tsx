import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Icon, INSTRUMENT_ICON, type IconName } from '../design/Icon'
import type { InstrumentId, Take } from './model'
import { getBlob } from './store'
import { useMetronome } from './metronome'

export function fmt(sec: number) {
  const s = Math.max(0, Math.round(Number.isFinite(sec) ? sec : 0))
  return `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`
}

/* —— Vignette de morceau (composant neutre, sans image externe) —— */

export function PieceThumb({ instrument }: { instrument?: InstrumentId }) {
  return (
    <span className="ds-thumb ds-thumb--icon" aria-hidden>
      <Icon name={INSTRUMENT_ICON[instrument || 'other']} size={26} />
    </span>
  )
}

/* —— Badges & sources —— */

export type Tone = 'success' | 'warning' | 'error' | 'record' | 'neutral' | 'accent'

export function Badge({ tone, icon, children }: { tone: Tone; icon?: IconName; children: ReactNode }) {
  return (
    <span className={`ds-badge ds-badge--${tone}`}>
      {icon ? <Icon name={icon} size={14} /> : null}
      {children}
    </span>
  )
}

const SOURCE_LABEL = {
  user: 'Ton observation',
  'self-check': 'Ton auto-évaluation',
  rules: 'Règle pédagogique ARIA',
  facts: 'Données de la prise',
} as const

export function SourceTag({ source }: { source: keyof typeof SOURCE_LABEL }) {
  return <span className={`ds-source ds-source--${source}`}>{SOURCE_LABEL[source]}</span>
}

export function Section({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="ds-section">
      <div className="ds-section-head">
        <h2 className="ds-section-title">{title}</h2>
        {aside}
      </div>
      {children}
    </section>
  )
}

/* —— Lecteur de prise —— */

const PLAY_EVENT = 'aria:audio-play'

export function TakePlayer({
  take,
  label,
  detail,
  onDelete,
  testId,
}: {
  take: Take
  label: string
  detail?: string
  onDelete?: (id: string) => void | Promise<void>
  testId?: string
}) {
  const [url, setUrl] = useState<string | null>(null)
  const [state, setState] = useState<'idle' | 'loading' | 'missing'>('idle')
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(take.seconds || 0)
  const [confirm, setConfirm] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const urlRef = useRef<string | null>(null)
  const pendingPlay = useRef(false)

  useEffect(() => {
    const onOther = (e: Event) => {
      const id = (e as CustomEvent<string>).detail
      if (id !== take.id) audioRef.current?.pause()
    }
    window.addEventListener(PLAY_EVENT, onOther)
    return () => {
      window.removeEventListener(PLAY_EVENT, onOther)
      if (urlRef.current) URL.revokeObjectURL(urlRef.current)
    }
  }, [take.id])

  async function ensureUrl() {
    if (urlRef.current) return urlRef.current
    setState('loading')
    const blob = await getBlob(take.id)
    if (!blob || blob.size === 0) {
      setState('missing')
      return null
    }
    const next = URL.createObjectURL(blob)
    urlRef.current = next
    setUrl(next)
    setState('idle')
    return next
  }

  async function toggle() {
    const el = audioRef.current
    if (playing && el) {
      el.pause()
      return
    }
    if (el && urlRef.current) {
      void startPlayback(el)
      return
    }
    pendingPlay.current = true
    const src = await ensureUrl()
    if (!src) pendingPlay.current = false
  }

  async function startPlayback(audio: HTMLAudioElement) {
    window.dispatchEvent(new CustomEvent(PLAY_EVENT, { detail: take.id }))
    try {
      await audio.play()
    } catch {
      setState('missing')
    }
  }

  // Première lecture : l’élément audio n’existe qu’une fois l’URL du blob chargée.
  useEffect(() => {
    if (url && pendingPlay.current && audioRef.current) {
      pendingPlay.current = false
      void startPlayback(audioRef.current)
    }
  }, [url])

  const total = Number.isFinite(duration) && duration > 0 ? duration : take.seconds || 0

  return (
    <div className={`ds-take${playing ? ' is-playing' : ''}`} data-testid={testId}>
      <div className="ds-take-head">
        <div className="ds-take-title">
          <b>{label}</b>
          <span>{detail || `${new Date(take.createdAt).toLocaleString('fr-FR')} · ${fmt(take.seconds)}`}</span>
        </div>
        {playing ? (
          <Badge tone="accent" icon="play">
            En lecture
          </Badge>
        ) : null}
      </div>
      {url ? (
        <audio
          ref={audioRef}
          src={url}
          preload="metadata"
          onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
          onDurationChange={(e) => setDuration(e.currentTarget.duration)}
          onTimeUpdate={(e) => setCurrent(e.currentTarget.currentTime)}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false)
            setCurrent(0)
          }}
        />
      ) : null}
      <div className="ds-take-controls">
        <button
          type="button"
          className={`ds-btn ds-btn--sm ${playing ? 'ds-btn--secondary' : 'ds-btn--primary'}`}
          onClick={() => void toggle()}
          disabled={state === 'loading' || state === 'missing'}
          aria-label={`${playing ? 'Pause' : 'Lecture'} — ${label}`}
        >
          <Icon name={playing ? 'pause' : 'play'} size={18} />
          {playing ? 'Pause' : state === 'loading' ? 'Chargement…' : 'Lecture'}
        </button>
        <input
          className="ds-range"
          type="range"
          min={0}
          max={Math.max(1, total)}
          step={0.1}
          value={Math.min(current, Math.max(1, total))}
          aria-label={`Position de lecture — ${label}`}
          disabled={!url}
          onChange={(e) => {
            const el = audioRef.current
            if (el) el.currentTime = Number(e.target.value)
            setCurrent(Number(e.target.value))
          }}
        />
        <span className="ds-take-time" aria-hidden>
          {fmt(current)} / {fmt(total)}
        </span>
      </div>
      {state === 'missing' ? (
        <p className="ds-alert ds-alert--error" role="alert">
          <Icon name="alert" size={18} />
          <span>
            <b>Audio introuvable.</b> Cette prise n’est plus disponible sur cet appareil (données du navigateur effacées ?).
          </span>
        </p>
      ) : null}
      {onDelete ? (
        confirm ? (
          <div className="ds-confirm" role="group" aria-label="Confirmer la suppression">
            <span>Supprimer définitivement cette prise ?</span>
            <div className="ds-row">
              <button type="button" className="ds-btn ds-btn--sm ds-btn--danger" onClick={() => void onDelete(take.id)}>
                <Icon name="trash" size={18} />
                Oui, supprimer
              </button>
              <button type="button" className="ds-btn ds-btn--sm ds-btn--secondary" onClick={() => setConfirm(false)}>
                Annuler
              </button>
            </div>
          </div>
        ) : (
          <button type="button" className="ds-btn ds-btn--sm ds-btn--quiet ds-take-delete" onClick={() => setConfirm(true)}>
            <Icon name="trash" size={18} />
            Supprimer
          </button>
        )
      ) : null}
    </div>
  )
}

/* —— Panneau d’enregistrement —— */

type RecorderLike = {
  status: 'idle' | 'recording' | 'denied' | 'unsupported' | 'error'
  seconds: number
  errorMessage: string | null
  start: () => Promise<boolean>
}

export function RecordPanel({
  recorder,
  onToggle,
  hint,
  context,
}: {
  recorder: RecorderLike
  onToggle: () => void
  hint?: string
  context?: string
}) {
  const recording = recorder.status === 'recording'
  return (
    <div className={`ds-recorder${recording ? ' is-recording' : ''}`}>
      <div className="ds-recorder-row">
        <div className="ds-recorder-status" aria-live="polite">
          {recording ? (
            <Badge tone="record" icon="record">
              REC · enregistrement en cours
            </Badge>
          ) : (
            <span className="ds-recorder-ready">
              <Icon name="mic" size={18} />
              Prêt à enregistrer
            </span>
          )}
          {context ? <span className="ds-recorder-context">{context}</span> : null}
          <span className="ds-recorder-clock">{fmt(recorder.seconds)}</span>
        </div>
        <button
          type="button"
          className={`ds-recbtn${recording ? ' is-on' : ''}`}
          onClick={onToggle}
          disabled={recorder.status === 'unsupported'}
          aria-label={recording ? 'Arrêter et sauvegarder la prise' : 'Démarrer l’enregistrement'}
        >
          <Icon name={recording ? 'stop' : 'record'} size={22} />
          <span>{recording ? 'Arrêter' : 'Enregistrer'}</span>
        </button>
      </div>
      {recorder.status === 'denied' ? (
        <div className="ds-alert ds-alert--error" role="alert">
          <Icon name="mic-off" size={18} />
          <div>
            <b>Micro refusé.</b>
            <p>
              Pour enregistrer, autorise le micro : touche l’icône du cadenas ou des réglages à gauche de l’adresse du
              site, choisis « Micro → Autoriser », puis réessaie.
            </p>
            <button type="button" className="ds-btn ds-btn--sm ds-btn--secondary" onClick={() => void recorder.start()}>
              <Icon name="retry" size={18} />
              Réessayer le micro
            </button>
          </div>
        </div>
      ) : null}
      {recorder.status === 'error' && recorder.errorMessage ? (
        <div className="ds-alert ds-alert--error" role="alert">
          <Icon name="alert" size={18} />
          <div>
            <b>Erreur d’enregistrement.</b>
            <p>{recorder.errorMessage}</p>
            <button type="button" className="ds-btn ds-btn--sm ds-btn--secondary" onClick={() => void recorder.start()}>
              <Icon name="retry" size={18} />
              Réessayer
            </button>
          </div>
        </div>
      ) : null}
      {recorder.status === 'unsupported' ? (
        <p className="ds-alert ds-alert--warning" role="status">
          <Icon name="info" size={18} />
          <span>{recorder.errorMessage || 'L’enregistrement audio n’est pas disponible sur ce navigateur.'}</span>
        </p>
      ) : null}
      {hint ? (
        <p className="ds-hint" role="status">
          {hint}
        </p>
      ) : null}
    </div>
  )
}

/* —— Métronome —— */

export function MetronomePanel({ initialBpm }: { initialBpm: number }) {
  const m = useMetronome(initialBpm)
  useEffect(() => {
    m.setBpm(initialBpm)
  }, [initialBpm])
  useEffect(() => m.stop, [m.stop])
  return (
    <div className="ds-metronome" data-testid="metronome">
      <div className="ds-metronome-beats" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <i key={i} className={m.beat === i ? (i === 0 ? 'is-on is-accent' : 'is-on') : ''} />
        ))}
      </div>
      <div className="ds-row ds-metronome-row">
        <button type="button" className="ds-iconbtn" aria-label="Ralentir de 4 BPM" onClick={() => m.setBpm(m.bpm - 4)}>
          <Icon name="minus" />
        </button>
        <span className="ds-metronome-bpm">
          <b>{m.bpm}</b> BPM
        </span>
        <button type="button" className="ds-iconbtn" aria-label="Accélérer de 4 BPM" onClick={() => m.setBpm(m.bpm + 4)}>
          <Icon name="plus" />
        </button>
        <button
          type="button"
          className={`ds-btn ds-btn--sm ${m.running ? 'ds-btn--secondary' : 'ds-btn--primary'}`}
          onClick={() => (m.running ? m.stop() : void m.start())}
        >
          <Icon name={m.running ? 'stop' : 'play'} size={18} />
          {m.running ? 'Arrêter' : 'Démarrer'}
        </button>
      </div>
      {m.error ? <p className="ds-hint">{m.error}</p> : null}
    </div>
  )
}

/* —— Minuteur d’étape —— */

export function StepTimer({ minutes, resetKey }: { minutes: number; resetKey: string }) {
  const total = Math.max(1, minutes) * 60
  const [left, setLeft] = useState(total)
  const [running, setRunning] = useState(false)
  useEffect(() => {
    setLeft(total)
    setRunning(false)
  }, [resetKey, total])
  useEffect(() => {
    if (!running) return
    const id = window.setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000)
    return () => window.clearInterval(id)
  }, [running])
  useEffect(() => {
    if (left === 0) setRunning(false)
  }, [left])
  return (
    <div className="ds-timer">
      <Icon name="timer" size={18} />
      <span className="ds-timer-clock" aria-live="off">
        {fmt(left)}
      </span>
      {left === 0 ? <Badge tone="neutral">Temps écoulé</Badge> : null}
      <button type="button" className="ds-btn ds-btn--sm ds-btn--quiet" onClick={() => (left === 0 ? setLeft(total) : setRunning((r) => !r))}>
        {left === 0 ? 'Relancer' : running ? 'Pause' : 'Démarrer le minuteur'}
      </button>
    </div>
  )
}
