import { useEffect } from 'react'
import { playTone } from './audio'
import type { Pitch } from './songs'

const WHITE: Pitch[] = ['C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5', 'D5', 'E5']
const BLACK: { pitch: Pitch; after: Pitch }[] = [
  { pitch: 'C#4', after: 'C4' },
  { pitch: 'D#4', after: 'D4' },
  { pitch: 'F#4', after: 'F4' },
  { pitch: 'G#4', after: 'G4' },
  { pitch: 'A#4', after: 'A4' },
  { pitch: 'C#5', after: 'C5' },
  { pitch: 'D#5', after: 'D5' },
]

const KEYBOARD: Record<string, Pitch> = {
  a: 'C4',
  s: 'D4',
  d: 'E4',
  f: 'F4',
  g: 'G4',
  h: 'A4',
  j: 'B4',
  k: 'C5',
  l: 'D5',
  ';': 'E5',
  w: 'C#4',
  e: 'D#4',
  t: 'F#4',
  y: 'G#4',
  u: 'A#4',
  o: 'C#5',
  p: 'D#5',
}

export function VirtualPiano({
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
      playTone(pitch, pitch === target)
      onPlay(pitch)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPlay, target])

  return (
    <div className="vpiano" role="group" aria-label="Clavier">
      <div className="vpiano-white">
        {WHITE.map((pitch) => {
          const active = target === pitch
          return (
            <button
              key={pitch}
              type="button"
              className={`vkey vkey-white ${active ? 'next' : ''} ${flash && active ? flash : ''}`}
              onClick={() => {
                playTone(pitch, pitch === target)
                onPlay(pitch)
              }}
            >
              <span className="vkey-letter">{pitch[0]}</span>
            </button>
          )
        })}
      </div>
      <div className="vpiano-black">
        {BLACK.map(({ pitch, after }) => {
          const i = WHITE.indexOf(after)
          const active = target === pitch
          return (
            <button
              key={pitch}
              type="button"
              className={`vkey vkey-black ${active ? 'next' : ''} ${flash && active ? flash : ''}`}
              style={{ left: `calc(${(i + 1) * (100 / WHITE.length)}% - 0.75rem)` }}
              onClick={() => {
                playTone(pitch, pitch === target)
                onPlay(pitch)
              }}
            />
          )
        })}
      </div>
    </div>
  )
}
