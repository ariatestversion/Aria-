const POINTS_KEY = 'aria.play.points'
const UNLOCKED_KEY = 'aria.play.unlocked'
const PROVIDER_KEY = 'aria.play.provider'

export type StreamProvider = 'spotify'

export function readPoints(): number {
  try {
    return Math.max(0, Number(localStorage.getItem(POINTS_KEY) || 0))
  } catch {
    return 0
  }
}

export function writePoints(n: number) {
  try {
    localStorage.setItem(POINTS_KEY, String(Math.max(0, n)))
  } catch {
    /* ignore */
  }
}

export function readUnlocked(): string[] {
  try {
    const raw = localStorage.getItem(UNLOCKED_KEY)
    if (!raw) return ['joy']
    const list = JSON.parse(raw) as string[]
    return list.includes('joy') ? list : ['joy', ...list]
  } catch {
    return ['joy']
  }
}

export function unlockSong(id: string) {
  const next = Array.from(new Set([...readUnlocked(), id]))
  try {
    localStorage.setItem(UNLOCKED_KEY, JSON.stringify(next))
  } catch {
    /* ignore */
  }
  return next
}

export function readProvider(): StreamProvider | null {
  try {
    if (localStorage.getItem(PROVIDER_KEY) === 'spotify') return 'spotify'
  } catch {
    /* ignore */
  }
  return null
}

export function writeProvider(p: StreamProvider) {
  try {
    localStorage.setItem(PROVIDER_KEY, p)
  } catch {
    /* ignore */
  }
}
