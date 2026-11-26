import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ErrorBoundary } from './ErrorBoundary'
import './styles.css'
import './design/tokens.css'
import './design/components.css'
import './v0/aria-v0.css'
import { AriaApp } from './v0/AriaApp'
import { BRAND_NAME } from './v0/brand'

const params = new URLSearchParams(window.location.search)
if (params.has('reset')) {
  try {
    const keys = Object.keys(localStorage)
    for (const key of keys) {
      if (key.startsWith('aria.') || key.startsWith('sonique.')) localStorage.removeItem(key)
    }
  } catch {
    /* ignore */
  }
  params.delete('reset')
  const next = `${window.location.pathname}${params.toString() ? `?${params}` : ''}${window.location.hash}`
  window.history.replaceState({}, '', next)
}

document.documentElement.lang = 'fr'
document.title = BRAND_NAME
document.documentElement.dataset.v0 = '1'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <AriaApp />
    </ErrorBoundary>
  </StrictMode>,
)
