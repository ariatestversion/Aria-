const CLIENT_ID = (import.meta.env.VITE_SPOTIFY_CLIENT_ID as string | undefined)?.trim() || ''
const NAME_KEY = 'aria.spotify.name'
const TOKEN_KEY = 'aria.spotify.token'
const VERIFIER_KEY = 'aria.spotify.verifier'

export type SpotifyItem = {
  id: string
  title: string
  artist: string
  duration: string
  cover: string
}

export function isSpotifyOAuthReady() {
  return CLIENT_ID.length > 0
}

export function readSpotifyName() {
  try {
    return localStorage.getItem(NAME_KEY) || ''
  } catch {
    return ''
  }
}

export function writeSpotifyName(name: string) {
  try {
    localStorage.setItem(NAME_KEY, name.trim())
  } catch {
    /* ignore */
  }
}

export function firstNameOf(name: string) {
  return name.trim().split(/\s+/)[0] || ''
}

function redirectUri() {
  const { origin, pathname } = window.location
  const raw = pathname === '/app' || pathname.startsWith('/app/') ? `${origin}/app/` : `${origin}/`
  return raw.replace(/([^:]\/)\/+/g, '$1')
}

function b64url(bytes: ArrayBuffer | Uint8Array) {
  const raw = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes)
  let bin = ''
  raw.forEach((b) => {
    bin += String.fromCharCode(b)
  })
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

async function challengeOf(verifier: string) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return b64url(hash)
}

function newVerifier() {
  return b64url(crypto.getRandomValues(new Uint8Array(32)))
}

export async function beginSpotifyLogin() {
  if (!CLIENT_ID) {
    return 'local' as const
  }
  const verifier = newVerifier()
  try {
    sessionStorage.setItem(VERIFIER_KEY, verifier)
  } catch {
    /* ignore */
  }
  const params = new URLSearchParams({
    client_id: CLIENT_ID,
    response_type: 'code',
    redirect_uri: redirectUri(),
    scope: 'user-read-private user-read-email playlist-read-private',
    code_challenge_method: 'S256',
    code_challenge: await challengeOf(verifier),
    show_dialog: 'true',
  })
  window.location.assign(`https://accounts.spotify.com/authorize?${params}`)
  return 'oauth' as const
}

export async function finishSpotifyReturn() {
  const url = new URL(window.location.href)
  const code = url.searchParams.get('code')
  if (!code || !CLIENT_ID) return null
  let verifier = ''
  try {
    verifier = sessionStorage.getItem(VERIFIER_KEY) || ''
  } catch {
    /* ignore */
  }
  const body = new URLSearchParams({
    client_id: CLIENT_ID,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri(),
    code_verifier: verifier,
  })
  const tokenRes = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })
  url.searchParams.delete('code')
  url.searchParams.delete('state')
  window.history.replaceState({}, '', `${url.pathname}${url.search}${url.hash}`)
  if (!tokenRes.ok) return null
  const tokenJson = (await tokenRes.json()) as { access_token?: string }
  const token = tokenJson.access_token
  if (!token) return null
  try {
    sessionStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* ignore */
  }
  const meRes = await fetch('https://api.spotify.com/v1/me', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!meRes.ok) return null
  const me = (await meRes.json()) as { display_name?: string }
  const name = (me.display_name || '').trim()
  if (name) writeSpotifyName(name)
  return name
}

export async function loadSpotifyItems(fallback: SpotifyItem[]): Promise<SpotifyItem[]> {
  let token = ''
  try {
    token = sessionStorage.getItem(TOKEN_KEY) || ''
  } catch {
    /* ignore */
  }
  if (!token) return fallback
  const res = await fetch('https://api.spotify.com/v1/me/playlists?limit=8', {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!res.ok) return fallback
  const data = (await res.json()) as {
    items?: { id: string; name: string; images?: { url: string }[]; owner?: { display_name?: string } }[]
  }
  const rows = (data.items || [])
    .filter((item) => item?.id && item?.name)
    .map((item) => ({
      id: item.id,
      title: item.name,
      artist: item.owner?.display_name || 'Spotify',
      duration: '',
      cover: item.images?.[0]?.url || '',
    }))
  return rows.length ? rows : fallback
}
