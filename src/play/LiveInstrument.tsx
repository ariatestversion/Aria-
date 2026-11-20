import { useEffect, useRef } from 'react'
import { useHeardPitch } from '../lib/tuner'
import { playTone } from './audio'
import { frenchOf, letterOf, type Pitch } from './songs'

export type LiveKind = 'piano' | 'violin' | 'flute'

const COPY: Record<LiveKind, { title: string; hint: string }> = {
  piano: {
    title: 'Ton piano',
    hint: 'Joue la note guidée. Aria écoute. Tu peux aussi toucher le A.',
  },
  violin: {
    title: 'Ton violon',
    hint: 'Pose l’archet, ou touche la corde allumée.',
  },
  flute: {
    title: 'Ta flûte',
    hint: 'Souffle, ou touche le point blanc.',
  },
}

const VIOLIN_STRINGS: { id: Pitch; label: string }[] = [
  { id: 'G3', label: 'Sol' },
  { id: 'D4', label: 'Ré' },
  { id: 'A4', label: 'La' },
  { id: 'E5', label: 'Mi' },
]

const FLUTE_HOLES: Pitch[] = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']

function classOf(pitch: Pitch) {
  return pitch.replace(/\d/, '')
}

function sameClass(a: Pitch, b: Pitch) {
  return a.replace(/\d/g, '') === b.replace(/\d/g, '')
}

function nearestString(pitch: Pitch) {
  const letter = letterOf(pitch)
  if (letter === 'G') return 'G3'
  if (letter === 'D') return 'D4'
  if (letter === 'A') return 'A4'
  if (letter === 'E' || letter === 'F') return 'E5'
  if (letter === 'C' || letter === 'B') return 'G3'
  return 'A4'
}

export function LiveInstrument({
  kind,
  target,
  flash,
  onHeard,
}: {
  kind: LiveKind
  target: Pitch
  flash: 'ok' | 'miss' | null
  onHeard: (pitch: Pitch) => void
}) {
  const { energy, pitch, denied, ready } = useHeardPitch(true)
  const last = useRef('')
  const copy = COPY[kind]

  const strike = (next: Pitch) => {
    playTone(next, sameClass(next, target))
    onHeard(next)
  }

  useEffect(() => {
    if (!pitch) {
      last.current = ''
      return
    }
    if (last.current === pitch) return
    last.current = pitch
    onHeard(pitch)
  }, [onHeard, pitch])

  return (
    <div className={`live-instrument live-${kind}`}>
      <p className="live-kicker">{copy.title}</p>
      {kind === 'violin' ? (
        <div className="violin-board">
          {VIOLIN_STRINGS.map((s) => (
            <button
              key={s.id}
              type="button"
              className={`violin-string ${nearestString(target) === s.id ? 'next' : ''} ${flash && nearestString(target) === s.id ? flash : ''}`}
              onClick={() => strike(s.id)}
            >
              <i />
              {s.label}
            </button>
          ))}
        </div>
      ) : kind === 'flute' ? (
        <div className="flute-body">
          {FLUTE_HOLES.map((hole) => (
            <button
              key={hole}
              type="button"
              className={`flute-hole ${letterOf(target) === letterOf(hole) ? 'next' : ''}`}
              aria-label={frenchOf(hole)}
              onClick={() => strike(hole)}
            />
          ))}
        </div>
      ) : (
        <button type="button" className="piano-listen" onClick={() => strike(target)}>
          <span className="piano-listen-key">{letterOf(target)}</span>
        </button>
      )}
      <div className="ear-breath live-breath" aria-hidden>
        <span style={{ transform: `scaleY(${Math.max(0.08, Math.min(1, energy * 1.6))})` }} />
      </div>
      <p className={`ear-line ${denied ? 'warn' : flash === 'ok' ? 'ok' : ''}`}>
        {denied
          ? 'Le micro est fermé. Touche le guide, ou ouvre le micro.'
          : !ready
            ? 'Aria tend l’oreille…'
            : `${frenchOf(target)} · ${classOf(target)}`}
      </p>
      <p className="play-hint">{copy.hint}</p>
    </div>
  )
}
