import { useEffect, useMemo, useRef, useState } from 'react'
import { playTone } from './audio'
import type { Pitch } from './songs'

const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'] as const
const OCTAVES = [2, 3, 4, 5] as const
const HAS_SHARP = new Set(['C', 'D', 'F', 'G', 'A'])

const ALL_WHITE: Pitch[] = [
  ...OCTAVES.flatMap((oct) => LETTERS.map((letter) => `${letter}${oct}` as Pitch)),
  'C6',
]

function whitesBetween(from: Pitch, to: Pitch) {
  const a = ALL_WHITE.indexOf(from)
  const b = ALL_WHITE.indexOf(to)
  if (a < 0 || b < 0 || b < a) return ALL_WHITE
  return ALL_WHITE.slice(a, b + 1)
}

export function FullPiano({
  onPlay,
  lit = null,
  next = null,
  from = 'C2',
  to = 'C6',
  beams = false,
}: {
  onPlay: (pitch: Pitch) => void
  lit?: Pitch | null
  next?: Pitch | null
  from?: Pitch
  to?: Pitch
  beams?: boolean
}) {
  const WHITE = useMemo(() => whitesBetween(from, to), [from, to])
  const BLACK = useMemo(
    () =>
      WHITE.flatMap((pitch) => {
        const letter = pitch[0]
        if (!HAS_SHARP.has(letter) || pitch === to) return []
        const oct = pitch.slice(-1)
        return [{ pitch: `${letter}#${oct}` as Pitch, after: pitch }]
      }),
    [WHITE, to],
  )

  const [held, setHeld] = useState<Pitch | null>(null)
  const home = useRef<HTMLButtonElement>(null)
  const scroller = useRef<HTMLDivElement>(null)

  const strike = (pitch: Pitch) => {
    playTone(pitch, true)
    setHeld(pitch)
    window.setTimeout(() => setHeld((h) => (h === pitch ? null : h)), 180)
    onPlay(pitch)
  }

  useEffect(() => {
    home.current?.scrollIntoView({ inline: 'center', block: 'nearest' })
  }, [from, to])

  useEffect(() => {
    if (!lit || !scroller.current) return
    const key = scroller.current.querySelector(`[data-pitch="${lit}"]`)
    key?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [lit])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat || e.metaKey || e.ctrlKey) return
      const map: Record<string, Pitch> = {
        a: 'C4',
        s: 'D4',
        d: 'E4',
        f: 'F4',
        g: 'G4',
        h: 'A4',
        j: 'B4',
        k: 'C5',
        w: 'C#4',
        e: 'D#4',
        t: 'F#4',
        y: 'G#4',
        u: 'A#4',
      }
      const pitch = map[e.key.toLowerCase()]
      if (!pitch || !WHITE.includes(pitch)) return
      e.preventDefault()
      strike(pitch)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onPlay, WHITE])

  return (
    <div className={`full-piano ${beams ? 'has-beams' : ''}`} ref={scroller} role="group" aria-label="Clavier">
      <div className="full-piano-inner">
        {beams
          ? WHITE.map((pitch, i) => {
              const kind = pitch === lit ? 'now' : pitch === next ? 'soon' : ''
              if (!kind) return null
              return (
                <span
                  key={`beam-${pitch}`}
                  className={`light-beam is-${kind} note-${pitch[0]}`}
                  style={{
                    left: `calc(${i} * (var(--key-w) + var(--key-gap)) + var(--key-w) / 2)`,
                  }}
                />
              )
            })
          : null}
        <div className="full-piano-white">
          {WHITE.map((pitch) => {
            const letter = pitch[0]
            const oct = pitch.slice(-1)
            return (
              <button
                key={pitch}
                ref={pitch === 'C4' ? home : undefined}
                data-pitch={pitch}
                type="button"
                className={`fkey fkey-white note-${letter} ${held === pitch ? 'held' : ''} ${lit === pitch ? 'lit' : ''}`}
                aria-label={`${letter}${oct}`}
                onPointerDown={(e) => {
                  e.preventDefault()
                  strike(pitch)
                }}
              >
                {letter === 'C' ? <span className="fkey-oct">C{oct}</span> : null}
                {letter === 'A' ? <span className="fkey-la">A</span> : null}
              </button>
            )
          })}
        </div>
        <div className="full-piano-black">
          {BLACK.map(({ pitch, after }) => {
            const i = WHITE.indexOf(after)
            return (
              <button
                key={pitch}
                type="button"
                className={`fkey fkey-black ${held === pitch ? 'held' : ''} ${lit === pitch ? 'lit' : ''}`}
                aria-label={pitch}
                style={{
                  left: `calc(${i + 1} * (var(--key-w) + var(--key-gap)) - var(--sharp-w) / 2)`,
                }}
                onPointerDown={(e) => {
                  e.preventDefault()
                  strike(pitch)
                }}
              />
            )
          })}
        </div>
      </div>
    </div>
  )
}
