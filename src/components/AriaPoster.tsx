type AriaPosterProps = {
  onListen?: () => void
  onEnter?: () => void
  mark?: 'a' | 'name'
}

export function AriaPoster({ onListen, onEnter, mark = 'a' }: AriaPosterProps) {
  if (mark === 'name') {
    return (
      <div className="aria-poster aria-poster-splash" aria-label="Aria">
        <button type="button" className="aria-poster-name" onClick={onEnter} aria-label="Aria">
          ARIA
        </button>
      </div>
    )
  }

  return (
    <div className="aria-poster" aria-label="Aria">
      <button
        type="button"
        className="aria-poster-a"
        onClick={onListen}
        aria-label="A, le la"
      >
        <span className="aria-point" aria-hidden />
        A
      </button>

      <button
        type="button"
        className="aria-poster-mid"
        onClick={onEnter}
        aria-label="Aria"
      >
        <svg className="aria-arigato" viewBox="0 0 200 220" role="img" aria-hidden>
          <title>Aria</title>
          <path
            d="M100 18 L24 198"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M100 18 L176 198"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <path
            d="M58 122 H142"
            fill="none"
            stroke="currentColor"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <circle cx="100" cy="160" r="12" fill="#ffffff" />
        </svg>
      </button>

      <span className="aria-poster-ria">RIA</span>
    </div>
  )
}
