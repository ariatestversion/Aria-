import { useEffect } from 'react'
import { playTone } from './audio'
import type { Pitch } from './songs'

const WHITE: Pitch[] = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4']
const BLACK: Pitch[] = ['C#4', 'D#4', 'F#4', 'G#4', 'A#4']

const KEYBOARD: Record<string, Pitch> = {
  '1': 'C4',
  '2': 'D4',
  '3': 'E4',
  '4': 'F4',
  '5': 'G4',
  '6': 'A4',
  '7': 'B4',
  q: 'C#4',
  w: 'D#4',
  e: 'F#4',
  r: 'G#4',
  t: 'A#4',
}

const LABEL: Record<string, string> = {
  C: 'do',
  D: 'ré',
  E: 'mi',
  F: 'fa',
  G: 'sol',
  A: 'la',
  B: 'si',
}

function sameClass(a: Pitch, b: Pitch) {
  return a.replace(/\d/, '') === b.replace(/\d/, '')
}

export function NumericPad({
  target,
  flash,
  onPlay,
}: {
  target: Pitch
  flash: 'ok' | 'miss' | null
  onPlay: (pitch: Pitch) => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey) return
      const pitch = KEYBOARD[e.key.toLowerCase()]
      if (!pitch) return
      e.preventDefault()
      playTone(pitch, sameClass(pitch, target))
      onPlay(pitch)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPlay, target])

  const strike = (pitch: Pitch) => {
    playTone(pitch, sameClass(pitch, target))
    onPlay(pitch)
  }

  return (
    <div className="npad" role="group" aria-label="Clavier numérique">
      <div className="npad-row npad-sharps">
        {BLACK.map((pitch) => {
          const active = sameClass(pitch, target)
          return (
            <button
              key={pitch}
              type="button"
              className={`npad-key npad-sharp ${active ? 'next' : ''} ${flash && active ? flash : ''}`}
              onClick={() => strike(pitch)}
            >
              {pitch.replace('4', '')}
            </button>
          )
        })}
      </div>
      <div className="npad-row">
        {WHITE.map((pitch, i) => {
          const active = sameClass(pitch, target)
          const letter = pitch[0]
          return (
            <button
              key={pitch}
              type="button"
              className={`npad-key ${active ? 'next' : ''} ${flash && active ? flash : ''}`}
              onClick={() => strike(pitch)}
            >
              <strong>{i + 1}</strong>
              <span>{LABEL[letter]}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
