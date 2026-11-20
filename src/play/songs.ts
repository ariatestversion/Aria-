export type Pitch = `${'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G'}${'b' | '#' | ''}${2 | 3 | 4 | 5 | 6}`

export type PlayTrack = {
  id: string
  title: string
  artist: string
  duration: string
  cover: string
}

/** Tes morceaux — ce qui apparaît une fois Spotify relié. */
export const LIBRARY: PlayTrack[] = [
  { id: 'sable', title: 'Sable', artist: 'Nuit', duration: '3:12', cover: '#2a2a2a' },
  { id: 'chambre', title: 'Chambre 12', artist: 'Sel', duration: '2:48', cover: '#3a3a3a' },
  { id: 'vertige', title: 'Vertige', artist: 'Lame', duration: '4:01', cover: '#1c1c1c' },
  { id: 'mer', title: 'La mer basse', artist: 'Cendre', duration: '3:36', cover: '#262626' },
  { id: 'minuit', title: 'Minuit', artist: 'Voile', duration: '2:55', cover: '#333' },
]

export const LETTER_FR: Record<string, string> = {
  C: 'do',
  D: 'ré',
  E: 'mi',
  F: 'fa',
  G: 'sol',
  A: 'la',
  B: 'si',
}

export function letterOf(pitch: Pitch): string {
  return pitch[0]
}

export function frenchOf(pitch: Pitch): string {
  return LETTER_FR[pitch[0]] || pitch[0]
}
