import { useCallback, useState } from 'react'
import { AriaPoster } from '../components/AriaPoster'
import { FullPiano } from './FullPiano'
import { readProvider, writeProvider } from './progress'
import { LIBRARY, type Pitch, type PlayTrack } from './songs'

type Screen = 'sync' | 'play' | 'clear'

function SlideDots({ n }: { n: 1 | 2 }) {
  return (
    <ol className="slide-dots" aria-label={`Atelier ${n} sur 2`}>
      {[1, 2].map((i) => (
        <li key={i} className={i === n ? 'now' : i < n ? 'done' : ''} />
      ))}
    </ol>
  )
}

/** Spotify + clavier — hors du parcours public, à reprendre plus tard. */
export function AriaAtelier() {
  const [screen, setScreen] = useState<Screen>('sync')
  const [busy, setBusy] = useState(false)
  const [linked, setLinked] = useState(() => readProvider() === 'spotify')
  const [played, setPlayed] = useState(0)
  const [track, setTrack] = useState<PlayTrack | null>(null)

  const connectSpotify = () => {
    if (busy) return
    setBusy(true)
    window.setTimeout(() => {
      writeProvider('spotify')
      setBusy(false)
      setLinked(true)
    }, 800)
  }

  const pickTrack = (item: PlayTrack) => {
    setPlayed(0)
    setTrack(item)
    setScreen('play')
  }

  const onPlay = useCallback((_: Pitch) => {
    setPlayed((n) => n + 1)
  }, [])

  if (screen === 'clear') {
    return (
      <div className="app-shell play-shell">
        <section className="slide slide-encore">
          <p className="atelier-mark">Atelier</p>
          <AriaPoster onEnter={() => setScreen('sync')} />
          <p className="encore-line">Encore un.</p>
          <button type="button" className="btn-recommencer" onClick={() => setScreen('sync')}>
            Recommencer
          </button>
        </section>
      </div>
    )
  }

  if (screen === 'play') {
    return (
      <div className="app-shell play-shell-keys">
        <header className="keys-bar">
          <button
            type="button"
            className="keys-pearl"
            onClick={() => setScreen('sync')}
            aria-label="Retour à la playlist"
          >
            <span />
          </button>
          <p className="keys-now">{track?.title ?? 'Atelier'}</p>
          <button
            type="button"
            className={`keys-done ${played > 0 ? 'is-ready' : ''}`}
            onClick={() => setScreen('clear')}
            aria-label="Terminer le morceau"
          >
            C’est joué
          </button>
        </header>
        <FullPiano onPlay={onPlay} />
      </div>
    )
  }

  return (
    <div className="app-shell play-shell">
      <section className="slide play-sync">
        <p className="atelier-mark">Atelier</p>
        <SlideDots n={1} />
        <h1 className="aria-screen-title">Spotify</h1>
        <p className="play-lead">
          Relie ton compte. Tes musiques apparaissent. Tu choisis un morceau, tu le joues.
        </p>
        <div className="play-providers">
          <button
            type="button"
            className="play-provider play-provider-spotify is-primary"
            disabled={busy}
            onClick={connectSpotify}
          >
            <span className="spotify-mark" aria-hidden>
              <svg viewBox="0 0 24 24" className="oauth-svg">
                <circle cx="12" cy="12" r="12" fill="#fff" />
                <path
                  d="M16.8 16.4c-.2.4-.7.5-1 .2-2.8-1.7-6.3-2.1-10.4-1.1-.5.1-.9-.2-1-.6-.1-.5.2-.9.6-1 4.5-1 8.4-.6 11.6 1.3.4.2.4.7.2 1.2zm1.4-3.1c-.3.4-.8.6-1.2.3-3.2-2-8-2.6-11.7-1.4-.5.1-1-.2-1.1-.7-.2-.5.1-1 .7-1.1 4.2-1.3 9.5-.6 13.1 1.6.4.3.5.8.2 1.3zm.1-3.2C14.4 8 8.2 7.8 5 8.8c-.6.2-1.2-.2-1.3-.8-.2-.6.2-1.2.8-1.3 3.7-1.1 10.5-.9 14.6 1.6.5.3.7 1 .3 1.5-.3.6-1 .7-1.5.4z"
                  fill="#111"
                />
              </svg>
            </span>
            <strong>{busy ? 'Liaison…' : linked ? 'Spotify relié' : 'Continuer avec Spotify'}</strong>
            <span>{linked ? 'Tes morceaux sont là.' : 'Ta playlist. Tes titres.'}</span>
          </button>
        </div>
        {linked ? (
          <ul className="play-tracks play-tracks-in">
            {LIBRARY.map((item) => (
              <li key={item.id}>
                <button type="button" className="play-track play-track-row" onClick={() => pickTrack(item)}>
                  <span className="play-cover" style={{ background: item.cover }} aria-hidden />
                  <span className="play-track-copy">
                    <span className="play-track-title">{item.title}</span>
                    <span className="play-track-meta">{item.artist}</span>
                  </span>
                  <span className="play-track-dur">{item.duration}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <button type="button" className="play-text-back" onClick={() => window.location.assign('/')}>
          Sortie
        </button>
      </section>
    </div>
  )
}
