import { useEffect, useState } from 'react'
import { FullPiano } from './FullPiano'
import type { Pitch } from './songs'
import type { SpotifyItem } from './spotifyAuth'

function SlideDots({ n }: { n: 5 }) {
  return (
    <ol className="slide-dots" aria-label={`Slide ${n} sur 6`}>
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <li key={i} className={i === n ? 'now' : i < n ? 'done' : ''} />
      ))}
    </ol>
  )
}

/** Lent volontairement — on n’attrape pas la lumière. */
const PHRASE: Pitch[] = ['C4', 'E4', 'G4', 'A4', 'G4', 'E4', 'D4', 'C4']
const STEP_MS = 2400

export function useSlowLights() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const tick = window.setInterval(() => {
      setIndex((i) => (i + 1) % PHRASE.length)
    }, STEP_MS)
    return () => window.clearInterval(tick)
  }, [])

  return {
    lit: PHRASE[index],
    next: PHRASE[(index + 1) % PHRASE.length],
  }
}

export function GuidePlay({
  track,
  framed,
  onDone,
  onBack,
}: {
  track: SpotifyItem | null
  framed: boolean
  onDone: () => void
  onBack: () => void
}) {
  const { lit, next } = useSlowLights()

  return (
    <div className={`app-shell play-shell-keys play-guide ${framed ? 'is-framed' : ''}`}>
      <SlideDots n={5} />
      <header className="keys-bar">
        <button type="button" className="keys-pearl" onClick={onBack} aria-label="Retour">
          <span />
        </button>
        <p className="keys-now">{track?.title ?? 'Morceau'}</p>
        <button type="button" className="keys-done" onClick={onDone} aria-label="Terminer le morceau">
          C’est joué
        </button>
      </header>
      {framed ? (
        <p className="guide-frame">
          Sans partition.
          <span>Tes morceaux. On te montre.</span>
        </p>
      ) : null}
      <FullPiano
        onPlay={() => undefined}
        lit={lit}
        next={framed ? next : null}
        from="C3"
        to="C6"
        beams
      />
    </div>
  )
}
