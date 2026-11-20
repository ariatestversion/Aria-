import { useEffect, useState } from 'react'

type Slide = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8
type Instrument = 'piano' | 'violon' | 'cordes' | 'autre'
type Level = 'amateur' | 'pro'
type Capture = 'audio' | 'video'

const INSTRUMENTS: { id: Instrument; label: string }[] = [
  { id: 'piano', label: 'Piano' },
  { id: 'violon', label: 'Violon' },
  { id: 'cordes', label: 'Guitare / basse' },
  { id: 'autre', label: 'Autre' },
]

const LEVELS: { id: Level; label: string }[] = [
  { id: 'amateur', label: 'Amateur' },
  { id: 'pro', label: 'Professionnel' },
]

function instrumentLabel(id: Instrument) {
  return INSTRUMENTS.find((item) => item.id === id)?.label ?? id
}

function SlideDots({ n }: { n: Slide }) {
  return (
    <ol className="journey-dots" aria-label={`Slide ${n} sur 8`}>
      {([1, 2, 3, 4, 5, 6, 7, 8] as Slide[]).map((i) => (
        <li key={i} className={i === n ? 'now' : i < n ? 'done' : ''} />
      ))}
    </ol>
  )
}

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" className="journey-google" aria-hidden>
      <path
        fill="#4285F4"
        d="M22 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h5.6c-.2 1.3-1 2.4-2.1 3.1v2.6h3.4C20.8 18.4 22 15.6 22 12.3z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.9 0 5.3-1 7.1-2.6l-3.4-2.6c-1 .7-2.2 1.1-3.7 1.1-2.8 0-5.2-1.9-6.1-4.4H2.3v2.8C4 20.7 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.9 14.5c-.2-.6-.4-1.3-.4-2s.1-1.4.4-2V7.7H2.3C1.5 9 1 10.5 1 12s.5 3 1.3 4.3l3.6-2.8z"
      />
      <path
        fill="#EA4335"
        d="M12 4.8c1.6 0 3 .5 4.1 1.6L18.9 4C17 2.2 14.7 1.2 12 1.2 7.7 1.2 4 3.5 2.3 7.7l3.6 2.8C6.8 6.7 9.2 4.8 12 4.8z"
      />
    </svg>
  )
}

export function AriaPlay() {
  const [slide, setSlide] = useState<Slide>(1)
  const [firstName, setFirstName] = useState('')
  const [email, setEmail] = useState('')
  const [viaGoogle, setViaGoogle] = useState(false)
  const [instrument, setInstrument] = useState<Instrument | null>(null)
  const [level, setLevel] = useState<Level | null>(null)
  const [piece, setPiece] = useState('')
  const [scoreName, setScoreName] = useState('')
  const [capture, setCapture] = useState<Capture>('audio')
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)

  useEffect(() => {
    document.documentElement.dataset.journey = '1'
    return () => {
      delete document.documentElement.dataset.journey
    }
  }, [])

  useEffect(() => {
    if (!recording) return
    const id = window.setInterval(() => setSeconds((value) => value + 1), 1000)
    return () => window.clearInterval(id)
  }, [recording])

  const pieceTitle = piece.trim() || 'ce morceau'
  const who = firstName.trim() || (viaGoogle ? 'toi' : '')
  const clock = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`

  const go = (next: Slide) => {
    setRecording(false)
    setSlide(next)
  }

  const back = () => {
    if (slide === 1) return
    go((slide - 1) as Slide)
  }

  const canJoin = firstName.trim().length > 0 && email.trim().includes('@')
  const canPiece = Boolean(instrument && level && piece.trim())

  return (
    <div className="journey">
      <section className={`journey-slide ${slide === 1 ? 'is-home' : ''}`}>
        {slide > 1 ? (
          <button type="button" className="journey-back" onClick={back}>
            Retour
          </button>
        ) : null}
        {slide > 1 ? <SlideDots n={slide} /> : null}

        {slide === 1 ? (
          <div className="journey-home">
            <h1 className="journey-word">ARIA</h1>
            <button type="button" className="journey-cta" onClick={() => go(2)}>
              Commencer
            </button>
          </div>
        ) : null}

        {slide === 2 ? (
          <div className="journey-stack">
            <h1>Première connexion</h1>
            <p className="journey-lead">Le prénom et l’e-mail suffisent. Google aussi.</p>
            <form
              className="journey-form"
              onSubmit={(event) => {
                event.preventDefault()
                if (!canJoin) return
                setViaGoogle(false)
                go(3)
              }}
            >
              <label>
                Prénom
                <input
                  value={firstName}
                  onChange={(event) => setFirstName(event.target.value)}
                  autoComplete="given-name"
                  placeholder="Ton prénom"
                />
              </label>
              <label>
                E-mail
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="toi@mail.com"
                />
              </label>
              <button type="submit" className="journey-cta" disabled={!canJoin}>
                Continuer
              </button>
            </form>
            <p className="journey-or">ou</p>
            <button
              type="button"
              className="journey-google-btn"
              onClick={() => {
                setViaGoogle(true)
                if (!firstName.trim()) setFirstName('Toi')
                go(3)
              }}
            >
              <GoogleMark />
              Continuer avec Google
            </button>
          </div>
        ) : null}

        {slide === 3 ? (
          <div className="journey-stack">
            <h1>Ton morceau</h1>
            <p className="journey-lead">
              L’instrument et le niveau placent Aria. La partition reste facultative.
            </p>
            <fieldset className="journey-choice">
              <legend>Instrument</legend>
              <div className="journey-chips">
                {INSTRUMENTS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={instrument === item.id ? 'is-on' : ''}
                    onClick={() => setInstrument(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <fieldset className="journey-choice">
              <legend>Niveau</legend>
              <div className="journey-chips">
                {LEVELS.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    className={level === item.id ? 'is-on' : ''}
                    onClick={() => setLevel(item.id)}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </fieldset>
            <label className="journey-form">
              Morceau
              <input
                value={piece}
                onChange={(event) => setPiece(event.target.value)}
                placeholder="Le titre que tu travailles"
              />
            </label>
            <label className="journey-file">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={(event) => setScoreName(event.target.files?.[0]?.name ?? '')}
              />
              <span>{scoreName || 'Ajouter une partition — facultatif'}</span>
            </label>
            <button type="button" className="journey-cta" disabled={!canPiece} onClick={() => go(4)}>
              Continuer
            </button>
          </div>
        ) : null}

        {slide === 4 && instrument && level ? (
          <div className="journey-stack">
            <h1>Ton programme</h1>
            <p className="journey-lead">Aria le calcule à partir de ce que tu viens de donner.</p>
            <ul className="journey-plan">
              <li>
                <span>Morceau</span>
                {pieceTitle}
              </li>
              <li>
                <span>Instrument</span>
                {instrumentLabel(instrument)}
              </li>
              <li>
                <span>Niveau</span>
                {level === 'pro' ? 'Professionnel' : 'Amateur'}
              </li>
              <li>
                <span>Partition</span>
                {scoreName || 'À l’oreille'}
              </li>
            </ul>
            <button type="button" className="journey-cta" onClick={() => go(5)}>
              Commencer l’entraînement
            </button>
          </div>
        ) : null}

        {slide === 5 && level ? (
          <div className="journey-stack">
            <h1>Entraînement</h1>
            <p className="journey-lead">
              {who ? `${who}, ` : ''}
              {pieceTitle} — {level === 'pro' ? 'comme en répétition.' : 'sans te presser.'}
            </p>
            <ol className="journey-steps">
              {(level === 'pro'
                ? [
                    'Place le groove avant les notes.',
                    'Serre l’attaque et les silences.',
                    'Rejoue le passage comme avec le groupe.',
                  ]
                : [
                    'Écoute le début, puis joue-le lentement.',
                    'Une phrase à la fois, jusqu’à ce qu’elle tienne.',
                    'Rejoue le passage entier, sans forcer.',
                  ]
              ).map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ol>
            <button type="button" className="journey-cta" onClick={() => go(6)}>
              Passer à la prise
            </button>
          </div>
        ) : null}

        {slide === 6 ? (
          <div className="journey-stack">
            <h1>Ta prise</h1>
            <p className="journey-lead">Audio ou vidéo. Un passage suffit.</p>
            <div className="journey-chips" role="group" aria-label="Type de prise">
              <button
                type="button"
                className={capture === 'audio' ? 'is-on' : ''}
                onClick={() => setCapture('audio')}
              >
                Audio
              </button>
              <button
                type="button"
                className={capture === 'video' ? 'is-on' : ''}
                onClick={() => setCapture('video')}
              >
                Vidéo
              </button>
            </div>
            <button
              type="button"
              className={`journey-rec ${recording ? 'is-on' : ''}`}
              onClick={() => {
                if (recording) {
                  setRecording(false)
                  go(7)
                  return
                }
                setSeconds(0)
                setRecording(true)
              }}
              aria-pressed={recording}
            >
              <span />
              {recording ? clock : capture === 'video' ? 'Filmer' : 'Enregistrer'}
            </button>
            <p className="journey-hint">
              {recording ? 'Rejoue pour arrêter la prise.' : 'Aria n’écoute qu’après ta prise.'}
            </p>
          </div>
        ) : null}

        {slide === 7 ? (
          <div className="journey-stack">
            <h1>Aria écoute</h1>
            <p className="journey-lead">Elle sépare ce qui tient de ce qui peut encore se placer.</p>
            <div className="journey-pulse" aria-hidden>
              <span />
              <span />
              <span />
            </div>
            <button type="button" className="journey-cta" onClick={() => go(8)}>
              Voir le retour
            </button>
          </div>
        ) : null}

        {slide === 8 && level ? (
          <div className="journey-stack">
            <h1>Ton retour</h1>
            <p className="journey-lead">
              {pieceTitle}
              {instrument ? ` · ${instrumentLabel(instrument)}` : ''}
            </p>
            <article className="journey-note is-good">
              <h2>Ce qui tient</h2>
              <p>
                {level === 'pro'
                  ? 'L’intention est claire et le tempo tient.'
                  : 'Le contour du morceau est là. Le début tient.'}
              </p>
            </article>
            <article className="journey-note">
              <h2>À retravailler</h2>
              <p>
                {level === 'pro'
                  ? 'L’attaque du refrain arrive un peu en avant. Pose-la avec la basse, pas devant.'
                  : 'Les deux dernières mesures se précipitent. Ralentis et laisse la phrase retomber.'}
              </p>
            </article>
            <button type="button" className="journey-cta" onClick={() => go(5)}>
              Retravailler
            </button>
            <button type="button" className="journey-text" onClick={() => go(3)}>
              Changer de morceau
            </button>
          </div>
        ) : null}
      </section>
    </div>
  )
}
