import { useEffect, useState, type FormEvent } from 'react'
import { isPasswordStrong, passwordRules } from '../lib/passwordPolicy'
import { t } from '../lib/presets'
import { resendSignupEmail, signInWithGoogle } from '../lib/supabaseAuth'
import { BirthPicker } from '../play/BirthPicker'
import {
  probeAuthMode,
  resetPasswordV0,
  signInV0,
  signUpV0,
  type AuthMode as CloudMode,
} from '../v0/auth'
import type { AppState, UserProfile } from '../types'

function GoogleMark() {
  return (
    <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
      <path
        fill="currentColor"
        d="M22 12.3c0-.8-.1-1.6-.2-2.3H12v4.4h5.6c-.2 1.3-1 2.4-2.1 3.1v2.6h3.4C20.8 18.4 22 15.6 22 12.3zM12 23c2.9 0 5.3-1 7.1-2.6l-3.4-2.6c-1 .7-2.2 1.1-3.7 1.1-2.8 0-5.2-1.9-6.1-4.4H2.3v2.8C4 20.7 7.7 23 12 23zM5.9 14.5c-.2-.6-.4-1.3-.4-2s.1-1.4.4-2V7.7H2.3C1.5 9 1 10.5 1 12s.5 3 1.3 4.3l3.6-2.8zM12 4.8c1.6 0 3 .5 4.1 1.6L18.9 4C17 2.2 14.7 1.2 12 1.2 7.7 1.2 4 3.5 2.3 7.7l3.6 2.8C6.8 6.7 9.2 4.8 12 4.8z"
      />
    </svg>
  )
}

type AuthMode = 'login' | 'signup' | 'reset'

const LAST_AUTH_KEY = 'sonique.lastAuthMethod'

function writeLastAuth() {
  try {
    localStorage.setItem(LAST_AUTH_KEY, 'email')
  } catch {
    /* ignore */
  }
}

export function AuthGate({
  profile,
  onProfileLoaded,
  onNext,
  onCancel,
  onSkip,
  initialMode = 'login',
}: {
  profile: AppState['profile']
  onProfileLoaded: (profile: UserProfile) => void
  onNext: () => void
  onCancel?: () => void
  onSkip?: () => void
  initialMode?: AuthMode
}) {
  const copy = t()
  const [mode, setMode] = useState<AuthMode>(initialMode)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [signupFirstName, setSignupFirstName] = useState('')
  const [signupLastName, setSignupLastName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [signupPassword, setSignupPassword] = useState('')
  const [signupPassword2, setSignupPassword2] = useState('')
  const [signupBirth, setSignupBirth] = useState('')
  const [authError, setAuthError] = useState('')
  const [authInfo, setAuthInfo] = useState('')
  const [awaitingConfirm, setAwaitingConfirm] = useState(false)
  const [busy, setBusy] = useState(false)
  const [legal, setLegal] = useState<'terms' | 'privacy' | null>(null)
  const [cloudMode, setCloudMode] = useState<CloudMode>('local')

  useEffect(() => {
    void probeAuthMode().then(setCloudMode)
    try {
      if (sessionStorage.getItem('sonique.authFlash') === 'link_expired') {
        sessionStorage.removeItem('sonique.authFlash')
        setMode('login')
        setAuthError(copy.emailLinkExpired)
      }
    } catch {
      /* ignore */
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-shot flash on mount
  }, [])

  const rules = passwordRules(signupPassword)
  const passwordOk = isPasswordStrong(signupPassword)
  const passwordsMatch = signupPassword.length > 0 && signupPassword === signupPassword2

  const friendlyAuthError = (code?: string) => {
    if (!code) return copy.loginFailed
    if (code === 'rate_limited') return copy.emailRateLimited
    if (code === 'email_not_confirmed') return copy.emailNotConfirmed
    if (code === 'link_expired') return copy.emailLinkExpired
    if (code === 'invalid_credentials') return copy.loginFailed
    if (code === 'already_registered') return copy.alreadyRegistered
    if (code === 'password_weak') return copy.passwordTooWeak
    if (code === 'missing_profile') return copy.missingProfile
    if (code === 'google_unavailable') return copy.googleUnavailable
    if (code === 'facebook_unavailable') return copy.facebookUnavailable
    if (code === 'instagram_unavailable') return copy.instagramUnavailable
    if (code === 'oauth_unavailable') return copy.googleUnavailable
    if (code === 'not_found') return copy.loginNotFound
    return code
  }

  const enterApp = (next: UserProfile) => {
    writeLastAuth()
    onProfileLoaded(next)
    onNext()
  }

  const sendLogin = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthInfo('')
    if (!loginEmail.trim() || !loginPassword) {
      setAuthError(copy.loginFailed)
      return
    }
    setBusy(true)
    try {
      const mode = cloudMode === 'cloud' ? 'cloud' : 'local'
      let result = await signInV0({
        email: loginEmail.trim().toLowerCase(),
        password: loginPassword,
        mode,
      })
      if (!result.ok && mode === 'cloud') {
        result = await signInV0({
          email: loginEmail.trim().toLowerCase(),
          password: loginPassword,
          mode: 'local',
        })
      }
      if (!result.ok || !result.profile) {
        setAuthError(friendlyAuthError(result.error) || result.error || copy.loginFailed)
        return
      }
      if (result.local) setAuthInfo('Compte local sur cet appareil.')
      enterApp(result.profile)
    } finally {
      setBusy(false)
    }
  }

  const sendGoogle = async () => {
    setAuthError('')
    setAuthInfo('')
    setBusy(true)
    try {
      const result = await signInWithGoogle()
      if (!result.ok) {
        setAuthError(friendlyAuthError(result.error))
        return
      }
      // OAuth redirects away; if it returns without redirect, treat as unavailable.
    } finally {
      setBusy(false)
    }
  }

  const sendSignup = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthInfo('')
    if (!signupEmail.trim()) {
      setAuthError('Indique ton e-mail.')
      return
    }
    if (!passwordOk) {
      setAuthError(copy.passwordTooWeak)
      return
    }
    if (signupPassword !== signupPassword2) {
      setAuthError(copy.passwordMismatch)
      return
    }
    setBusy(true)
    try {
      const email = signupEmail.trim().toLowerCase()
      const mode = cloudMode === 'cloud' ? 'cloud' : 'local'
      let result = await signUpV0({
        firstName: signupFirstName.trim(),
        lastName: signupLastName.trim(),
        email,
        password: signupPassword,
        mode,
      })
      if (
        mode === 'cloud' &&
        !result.ok &&
        /trop de tentatives|rate|injoignable|failed|fetch|network|invalid/i.test(result.error || '')
      ) {
        result = await signUpV0({
          firstName: signupFirstName.trim(),
          lastName: signupLastName.trim(),
          email,
          password: signupPassword,
          mode: 'local',
        })
        if (result.ok) setAuthInfo('Connexion cloud indisponible : compte local créé sur cet appareil.')
      }
      if (!result.ok) {
        setAuthError(friendlyAuthError(result.error) || result.error || copy.loginFailed)
        return
      }
      try {
        localStorage.setItem(`aria.birth.${email}`, signupBirth)
      } catch {
        /* ignore */
      }
      writeLastAuth()
      setLoginEmail(email)
      if (result.needsEmailConfirm) {
        setAwaitingConfirm(true)
        setMode('login')
        setAuthInfo(copy.checkEmailConfirm.replace('{email}', email))
        return
      }
      if (result.profile) enterApp(result.profile)
    } finally {
      setBusy(false)
    }
  }

  const sendReset = async (e: FormEvent) => {
    e.preventDefault()
    setAuthError('')
    setAuthInfo('')
    if (!loginEmail.trim()) {
      setAuthError(copy.loginFailed)
      return
    }
    setBusy(true)
    try {
      const result = await resetPasswordV0(loginEmail.trim().toLowerCase(), cloudMode)
      if (!result.ok) {
        setAuthError(friendlyAuthError(result.error) || result.error || copy.loginFailed)
        return
      }
      setAuthInfo(copy.resetSent)
      setMode('login')
    } finally {
      setBusy(false)
    }
  }

  const returning = Boolean(profile.firstName.trim() || profile.email.trim())
  const title = awaitingConfirm
    ? copy.checkEmailTitle
    : mode === 'reset'
      ? copy.forgotPassword
      : mode === 'login' && returning && profile.firstName.trim()
        ? `${copy.accessReturning}, ${profile.firstName.trim()}`
        : copy.welcomeToSonique
  const lead = awaitingConfirm
    ? copy.checkEmailLead
    : mode === 'signup'
      ? cloudMode === 'cloud'
        ? copy.signupLead
        : 'Mode local : ton compte est créé sur cet appareil, sans e-mail de confirmation. Tes morceaux et tes prises restent sur cet appareil.'
      : mode === 'reset'
        ? copy.resetSent
        : copy.authGateLead

  const dotsStep = mode === 'signup' ? 3 : mode === 'reset' ? 4 : 2

  return (
    <section className="slide auth-gate">
      {onCancel ? (
        <button type="button" className="account-back-link auth-gate-back" onClick={onCancel}>
          ← {copy.accountBack}
        </button>
      ) : null}

      <ul className="slide-dots" aria-hidden>
        {[1, 2, 3, 4, 5].map((n) => (
          <li key={n} className={n < dotsStep ? 'done' : n === dotsStep ? 'now' : undefined} />
        ))}
      </ul>

      <div className="auth-gate-core">
        <h1>{title}</h1>
        {mode !== 'reset' || awaitingConfirm ? <p className="auth-gate-tagline">{lead}</p> : null}

        {authInfo ? <p className="auth-banner">{authInfo}</p> : null}
        {authError ? (
          <p className="auth-banner auth-banner-error" role="alert">
            {authError}
          </p>
        ) : null}

        {mode === 'login' && !awaitingConfirm ? (
          <form className="auth-gate-form" autoComplete="off" onSubmit={(e) => void sendLogin(e)}>
            <button
              type="button"
              className="btn-auth-alt"
              disabled={busy}
              onClick={() => void sendGoogle()}
              style={{ width: '100%', justifyContent: 'center', marginBottom: '0.35rem' }}
            >
              <GoogleMark />
              {copy.googleContinue}
            </button>
            <p className="auth-or" style={{ textAlign: 'center', margin: '0.35rem 0 0.75rem' }}>
              {copy.authOr}
            </p>
            <label className="field">
              <span>{copy.emailLabel}</span>
              <input
                type="email"
                name="sonique-login-email"
                autoComplete="username"
                placeholder={copy.emailPlaceholder}
                value={loginEmail}
                onChange={(e) => {
                  setLoginEmail(e.target.value)
                  setAuthError('')
                }}
                required
              />
            </label>
            <label className="field">
              <span>{copy.password}</span>
              <input
                type="password"
                name="sonique-login-password"
                autoComplete="current-password"
                value={loginPassword}
                onChange={(e) => {
                  setLoginPassword(e.target.value)
                  setAuthError('')
                }}
                required
              />
            </label>
            <button
              type="submit"
              className="btn auth-continue"
              disabled={busy || !loginEmail.trim() || !loginPassword}
            >
              {busy ? copy.authBusy : copy.continue}
            </button>
            <button
              type="button"
              className="linkish"
              onClick={() => {
                setMode('reset')
                setAuthError('')
                setAuthInfo('')
              }}
            >
              {copy.forgotPassword}
            </button>
          </form>
        ) : null}

        {mode === 'login' && awaitingConfirm ? (
          <button
            type="button"
            className="btn auth-continue"
            disabled={busy || !loginEmail.trim()}
            onClick={() => {
              void (async () => {
                setBusy(true)
                setAuthError('')
                const result = await resendSignupEmail(loginEmail.trim().toLowerCase())
                setBusy(false)
                if (!result.ok) setAuthError(friendlyAuthError(result.error))
                else setAuthInfo(copy.resendConfirmSent)
              })()
            }}
          >
            {copy.resendConfirmEmail}
          </button>
        ) : null}

        {mode === 'signup' ? (
          <form className="auth-gate-form" autoComplete="off" onSubmit={(e) => void sendSignup(e)}>
            <label className="field">
              <span>{copy.firstName} (facultatif)</span>
              <input
                type="text"
                name="sonique-signup-firstname"
                autoComplete="given-name"
                placeholder={copy.firstName}
                value={signupFirstName}
                onChange={(e) => setSignupFirstName(e.target.value)}
              />
            </label>
            <label className="field">
              <span>{copy.lastName} (facultatif)</span>
              <input
                type="text"
                name="sonique-signup-lastname"
                autoComplete="family-name"
                placeholder={copy.lastName}
                value={signupLastName}
                onChange={(e) => setSignupLastName(e.target.value)}
              />
            </label>
            <label className="field">
              <span>{copy.emailLabel}</span>
              <input
                type="email"
                name="sonique-signup-email"
                autoComplete="email"
                placeholder={copy.emailLabel}
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                required
              />
            </label>
            <label className="field">
              <span>{copy.password}</span>
              <input
                type="password"
                name="sonique-signup-password"
                autoComplete="new-password"
                value={signupPassword}
                onChange={(e) => {
                  setSignupPassword(e.target.value)
                  setAuthError('')
                }}
                required
                minLength={8}
              />
              <ul className="password-rules" aria-live="polite">
                <li className={rules.length ? 'ok' : ''}>{copy.passwordRuleLength}</li>
                <li className={rules.lower && rules.upper ? 'ok' : ''}>
                  Une majuscule et une minuscule
                </li>
                <li className={rules.digit || rules.punct ? 'ok' : ''}>
                  Un chiffre ou un caractère spécial
                </li>
              </ul>
            </label>
            <label className="field">
              <span>{copy.passwordConfirm}</span>
              <input
                type="password"
                name="sonique-signup-password2"
                autoComplete="new-password"
                value={signupPassword2}
                onChange={(e) => {
                  setSignupPassword2(e.target.value)
                  setAuthError('')
                }}
                required
                minLength={8}
              />
              {signupPassword2 && !passwordsMatch ? (
                <small className="field-hint field-hint-error">{copy.passwordMismatch}</small>
              ) : null}
            </label>
            <label className="field">
              <span>Date de naissance (facultatif)</span>
              <BirthPicker value={signupBirth} onChange={setSignupBirth} />
            </label>
            <button
              type="submit"
              className="btn auth-continue"
              disabled={busy || !signupEmail.trim() || !passwordOk || !passwordsMatch}
            >
              {busy ? copy.authBusy : 'S’inscrire'}
            </button>
          </form>
        ) : null}

        {mode === 'reset' ? (
          <form className="auth-gate-form" autoComplete="off" onSubmit={(e) => void sendReset(e)}>
            <label className="field">
              <span>{copy.emailLabel}</span>
              <input
                type="email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                required
              />
            </label>
            <button type="submit" className="btn auth-continue" disabled={busy || !loginEmail.trim()}>
              {busy ? copy.authBusy : copy.continue}
            </button>
            <button
              type="button"
              className="linkish"
              onClick={() => {
                setMode('login')
                setAuthError('')
                setAuthInfo('')
              }}
            >
              {copy.back}
            </button>
          </form>
        ) : null}

        {mode === 'login' ? (
          <p className="auth-switch">
            {copy.noAccountSignup}{' '}
            <button
              type="button"
              className="auth-switch-link"
              onClick={() => {
                setMode('signup')
                setAwaitingConfirm(false)
                setAuthError('')
                setAuthInfo('')
              }}
            >
              {copy.signupNow}
            </button>
          </p>
        ) : mode === 'signup' ? (
          <p className="auth-switch">
            {copy.haveAccountSignin}{' '}
            <button
              type="button"
              className="auth-switch-link"
              onClick={() => {
                setMode('login')
                setAwaitingConfirm(false)
                setAuthError('')
                setAuthInfo('')
              }}
            >
              {copy.signinNow}
            </button>
          </p>
        ) : null}

        {onSkip ? (
          <button type="button" className="linkish" style={{ marginTop: '1.1rem' }} onClick={onSkip}>
            {copy.skipAccount}
          </button>
        ) : null}
      </div>

      <p className="auth-legal">
        <button type="button" onClick={() => setLegal('terms')}>
          {copy.authTerms}
        </button>
        {' et '}
        <button type="button" onClick={() => setLegal('privacy')}>
          {copy.authPrivacy}
        </button>
      </p>

      {legal ? (
        <div className="auth-legal-overlay" role="dialog" aria-modal>
          <div className="auth-legal-card">
            <h2>{legal === 'terms' ? copy.authTerms : copy.authPrivacy}</h2>
            <p>{legal === 'terms' ? copy.authTermsBody : copy.authPrivacyBody}</p>
            <button type="button" className="btn btn-primary" onClick={() => setLegal(null)}>
              {copy.accountBack}
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
