export function openSpotify(query?: string) {
  const q = (query || '').trim()
  const url = q
    ? `https://open.spotify.com/search/${encodeURIComponent(q)}`
    : 'https://open.spotify.com/'
  window.open(url, '_blank', 'noopener,noreferrer')
}

export function openSpotifySignup() {
  window.open('https://www.spotify.com/signup/', '_blank', 'noopener,noreferrer')
}
