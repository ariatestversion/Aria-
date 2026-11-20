import { isPasswordStrong } from '../lib/passwordPolicy'
import {
  getSessionProfile,
  isSupabaseConfigured,
  requestPasswordReset,
  signInWithPassword,
  signOut as supabaseSignOut,
  signUpWithPassword,
  supabase,
} from '../lib/supabaseAuth'
import type { UserProfile } from '../types'
import {
  findAccount,
  getMusicalProfile,
  getSessionEmail,
  GUEST_EMAIL,
  hashPassword,
  needsPasswordRehash,
  newId,
  saveAccount,
  setSessionEmail,
  verifyPassword,
} from './store'
import type { AriaAccount } from './model'

export type AuthMode = 'cloud' | 'local' | 'down'

export async function probeAuthMode(): Promise<AuthMode> {
  if (!isSupabaseConfigured || !supabase) return 'local'
  try {
    const url = (import.meta.env.VITE_SUPABASE_URL as string).replace(/\/$/, '')
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string
    const ctrl = new AbortController()
    const timer = window.setTimeout(() => ctrl.abort(), 4000)
    const res = await fetch(`${url}/auth/v1/health`, {
      headers: { apikey: key, Authorization: `Bearer ${key}` },
      signal: ctrl.signal,
    })
    window.clearTimeout(timer)
    if (res.ok) return 'cloud'
    return 'down'
  } catch {
    return 'down'
  }
}

export async function restoreSession(): Promise<UserProfile | null> {
  const mode = await probeAuthMode()
  if (mode === 'cloud') {
    const profile = await getSessionProfile()
    if (profile?.email) {
      setSessionEmail(profile.email)
      return profile
    }
  }
  const email = getSessionEmail()
  if (!email) return null
  const account = findAccount(email)
  if (account) {
    return {
      firstName: account.firstName,
      lastName: '',
      email: account.email,
      phone: '',
    }
  }
  // Guest / shell sans mot de passe : conserver le contexte si profil musical ou e-mail découverte.
  const musical = getMusicalProfile(email)
  if (musical || email === GUEST_EMAIL) {
    return {
      firstName: '',
      lastName: '',
      email,
      phone: '',
    }
  }
  return null
}

export function isGuestEmail(email: string) {
  return email.trim().toLowerCase() === GUEST_EMAIL
}

export async function signUpV0(input: {
  firstName: string
  lastName?: string
  email: string
  password: string
  mode: AuthMode
}): Promise<{ ok: boolean; profile?: UserProfile; error?: string; needsEmailConfirm?: boolean; local?: boolean }> {
  const firstName = input.firstName.trim()
  const lastName = (input.lastName || '').trim()
  const email = input.email.trim().toLowerCase()
  if (!email) return { ok: false, error: 'Indique ton e-mail.' }
  if (!isPasswordStrong(input.password)) {
    return { ok: false, error: 'Le mot de passe doit avoir 8 caractères, majuscule, minuscule, et un chiffre ou . / !' }
  }

  if (input.mode === 'cloud') {
    const result = await signUpWithPassword({
      profile: { firstName, lastName, email, phone: '' },
      password: input.password,
    })
    if (!result.ok) {
      const map: Record<string, string> = {
        already_registered: 'Un compte existe déjà avec cet e-mail.',
        password_weak: 'Mot de passe trop faible.',
        rate_limited: 'Trop de tentatives. Réessaie plus tard.',
        missing_profile: 'Indique ton prénom, ton nom et ton e-mail.',
      }
      return { ok: false, error: map[result.error || ''] || result.error || 'Inscription impossible.' }
    }
    if (result.profile) setSessionEmail(result.profile.email)
    return {
      ok: true,
      profile: result.profile,
      needsEmailConfirm: result.needsEmailConfirm,
    }
  }

  if (findAccount(email)) return { ok: false, error: 'Un compte local existe déjà avec cet e-mail sur cet appareil.' }
  const salt = newId('salt')
  const passwordHash = await hashPassword(input.password, salt)
  const account: AriaAccount = {
    id: newId('acc'),
    firstName,
    email,
    passwordHash,
    salt,
    createdAt: new Date().toISOString(),
  }
  saveAccount(account)
  setSessionEmail(email)
  return {
    ok: true,
    local: true,
    profile: { firstName, lastName, email, phone: '' },
  }
}

export async function signInV0(input: {
  email: string
  password: string
  mode: AuthMode
}): Promise<{ ok: boolean; profile?: UserProfile; error?: string; local?: boolean }> {
  const email = input.email.trim().toLowerCase()
  if (!email || !input.password) return { ok: false, error: 'Indique e-mail et mot de passe.' }

  if (input.mode === 'cloud') {
    const result = await signInWithPassword({ email, password: input.password })
    if (!result.ok) {
      const map: Record<string, string> = {
        invalid_credentials: 'E-mail ou mot de passe incorrect.',
        email_not_confirmed: 'Confirme ton e-mail avant de te connecter.',
        not_found: 'Aucun compte trouvé.',
        rate_limited: 'Trop de tentatives. Réessaie plus tard.',
      }
      return { ok: false, error: map[result.error || ''] || result.error || 'Connexion impossible.' }
    }
    if (result.profile) setSessionEmail(result.profile.email)
    return { ok: true, profile: result.profile }
  }

  const account = findAccount(email)
  if (!account) return { ok: false, error: 'Aucun compte local sur cet appareil pour cet e-mail.' }
  const ok = await verifyPassword(input.password, account.salt, account.passwordHash)
  if (!ok) return { ok: false, error: 'Mot de passe incorrect.' }
  if (needsPasswordRehash(account.passwordHash)) {
    account.passwordHash = await hashPassword(input.password, account.salt)
    saveAccount(account)
  }
  setSessionEmail(email)
  return {
    ok: true,
    local: true,
    profile: { firstName: account.firstName, lastName: '', email, phone: '' },
  }
}

export async function resetPasswordV0(email: string, mode: AuthMode) {
  if (mode !== 'cloud') {
    return { ok: false as const, error: 'La récupération de mot de passe cloud sera disponible quand la connexion cloud sera rétablie. Sur un compte local, elle n’existe pas.' }
  }
  const result = await requestPasswordReset(email)
  if (!result.ok) return { ok: false as const, error: result.error || 'Envoi impossible.' }
  return { ok: true as const }
}

export async function signOutV0() {
  setSessionEmail(null)
  try {
    await supabaseSignOut()
  } catch {
    /* ignore */
  }
}
