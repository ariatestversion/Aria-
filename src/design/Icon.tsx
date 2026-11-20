import type { ReactNode } from 'react'

/**
 * Jeu d’icônes ARIA (Design System). Trait 1.7 px, grille 24 px, couleur héritée (currentColor).
 * Une icône est décorative (aria-hidden) : le libellé du bouton porte le sens.
 */
export type IconName =
  | 'play'
  | 'pause'
  | 'stop'
  | 'record'
  | 'trash'
  | 'check'
  | 'retry'
  | 'alert'
  | 'info'
  | 'back'
  | 'next'
  | 'chevron'
  | 'home'
  | 'library'
  | 'follow'
  | 'profile'
  | 'metronome'
  | 'score'
  | 'notes'
  | 'timer'
  | 'mic'
  | 'mic-off'
  | 'plus'
  | 'minus'
  | 'compare'
  | 'target'
  | 'spark'

const PATHS: Record<IconName, ReactNode> = {
  play: <path d="M8 5.5v13l11-6.5z" fill="currentColor" stroke="none" />,
  pause: (
    <>
      <rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
      <rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
    </>
  ),
  stop: <rect x="6.5" y="6.5" width="11" height="11" rx="2" fill="currentColor" stroke="none" />,
  record: <circle cx="12" cy="12" r="6.5" fill="currentColor" stroke="none" />,
  trash: (
    <>
      <path d="M4.5 7h15" />
      <path d="M9.5 7V4.8h5V7" />
      <path d="M6.5 7l.9 12.2h9.2L17.5 7" />
      <path d="M10.3 10.5v5.5M13.7 10.5v5.5" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  retry: (
    <>
      <path d="M5 12a7 7 0 1 0 2.1-5" />
      <path d="M5 4.5V9h4.5" />
    </>
  ),
  alert: (
    <>
      <path d="M12 4 2.8 19.5h18.4z" />
      <path d="M12 10v4.2M12 16.8v.2" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 11v5.5M12 7.8v.2" />
    </>
  ),
  back: <path d="M15 5 8 12l7 7" />,
  next: <path d="M9 5l7 7-7 7" />,
  chevron: <path d="M6 9l6 6 6-6" />,
  home: <path d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z" />,
  library: (
    <>
      <path d="M6 4h10v16H6zM16 7h2v13h-2" />
      <path d="M9 8h4M9 12h4" />
    </>
  ),
  follow: (
    <>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 8v4l3 2" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19.5c1.4-2.8 3.6-4.2 6.5-4.2s5.1 1.4 6.5 4.2" />
    </>
  ),
  metronome: (
    <>
      <path d="M9 3.5h6l3.5 17h-13z" />
      <path d="M12 15.5 16.5 7" />
      <path d="M7.5 15.5h9" />
    </>
  ),
  score: (
    <>
      <path d="M6 3.5h9l3 3v14H6z" />
      <path d="M9 10h6M9 13.5h6M9 17h4" />
    </>
  ),
  notes: (
    <>
      <path d="M5 5h14v14H5z" />
      <path d="M8 9h8M8 12.5h8M8 16h5" />
    </>
  ),
  timer: (
    <>
      <circle cx="12" cy="13" r="7.5" />
      <path d="M12 9v4l2.5 2M10 3h4" />
    </>
  ),
  mic: (
    <>
      <rect x="9" y="3.5" width="6" height="11" rx="3" />
      <path d="M6 11.5a6 6 0 0 0 12 0M12 17.5V21" />
    </>
  ),
  'mic-off': (
    <>
      <rect x="9" y="3.5" width="6" height="11" rx="3" />
      <path d="M6 11.5a6 6 0 0 0 12 0M12 17.5V21" />
      <path d="M4 4l16 16" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  compare: (
    <>
      <path d="M4 8h12M12 4l4 4-4 4" />
      <path d="M20 16H8M12 12l-4 4 4 4" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="12" cy="12" r="0.8" fill="currentColor" />
    </>
  ),
  spark: <path d="M12 3.5l1.8 5.2 5.2 1.8-5.2 1.8L12 17.5l-1.8-5.2L5 10.5l5.2-1.8z" />,
}

export function Icon({ name, size = 20, className }: { name: IconName; size?: number; className?: string }) {
  return (
    <svg
      className={className ? `ds-icon ${className}` : 'ds-icon'}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {PATHS[name]}
    </svg>
  )
}
