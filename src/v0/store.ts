import type { AriaAccount, MusicalProfile, Piece, SessionLog, Take } from './model'

const ACCOUNTS = 'aria.v0.accounts'
const SESSION = 'aria.v0.sessionEmail'
const PROFILES = 'aria.v0.profiles'
const PIECES = 'aria.v0.pieces'
const TAKES = 'aria.v0.takes'
const SESSIONS = 'aria.v0.sessionLogs'

/** Compte découverte local (sans mot de passe). */
export const GUEST_EMAIL = 'decouverte@aria.local'
const DB = 'aria-v0-db'
const DB_VERSION = 1
const BLOBS = 'blobs'

function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : fallback
  } catch {
    return fallback
  }
}

function writeJson(key: string, value: unknown) {
  localStorage.setItem(key, JSON.stringify(value))
}

export function listAccounts(): AriaAccount[] {
  return readJson<AriaAccount[]>(ACCOUNTS, [])
}

export function saveAccount(account: AriaAccount) {
  const list = listAccounts().filter((a) => a.email !== account.email)
  list.push(account)
  writeJson(ACCOUNTS, list)
}

export function findAccount(email: string) {
  const key = email.trim().toLowerCase()
  return listAccounts().find((a) => a.email === key) || null
}

export function getSessionEmail() {
  return localStorage.getItem(SESSION)
}

export function setSessionEmail(email: string | null) {
  if (!email) localStorage.removeItem(SESSION)
  else localStorage.setItem(SESSION, email.trim().toLowerCase())
}

export function getMusicalProfile(email: string): MusicalProfile | null {
  const map = readJson<Record<string, MusicalProfile>>(PROFILES, {})
  return map[email.trim().toLowerCase()] || null
}

export function saveMusicalProfile(profile: MusicalProfile) {
  const map = readJson<Record<string, MusicalProfile>>(PROFILES, {})
  map[profile.email.trim().toLowerCase()] = profile
  writeJson(PROFILES, map)
}

export function listPieces(email: string): Piece[] {
  const mail = email.trim().toLowerCase()
  return readJson<Piece[]>(PIECES, [])
    .filter((p) => p.email === mail)
    .sort((a, b) => (b.lastWorkedAt || b.updatedAt).localeCompare(a.lastWorkedAt || a.updatedAt))
}

export function getPiece(id: string) {
  return readJson<Piece[]>(PIECES, []).find((p) => p.id === id) || null
}

export function savePiece(piece: Piece) {
  const list = readJson<Piece[]>(PIECES, [])
  const next = list.filter((p) => p.id !== piece.id)
  next.unshift(piece)
  writeJson(PIECES, next)
}

export function deletePiece(id: string) {
  writeJson(
    PIECES,
    readJson<Piece[]>(PIECES, []).filter((p) => p.id !== id),
  )
}

export function listTakes(email: string, pieceId?: string): Take[] {
  return readJson<Take[]>(TAKES, [])
    .filter((t) => t.email === email.trim().toLowerCase() && (!pieceId || t.pieceId === pieceId))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

export function saveTakeMeta(take: Take) {
  const list = readJson<Take[]>(TAKES, [])
  writeJson(TAKES, [take, ...list.filter((t) => t.id !== take.id)])
}

export function deleteTakeMeta(id: string) {
  writeJson(
    TAKES,
    readJson<Take[]>(TAKES, []).filter((t) => t.id !== id),
  )
}

function normalizeSessionLog(log: SessionLog): SessionLog {
  if (log.status === 'draft' || log.status === 'completed') return log
  // Legacy logs (pre-Sprint 02): completed only if they had takes or real notes.
  const hasTakes = (log.takeIds || []).length > 0
  const hasNotes = Boolean((log.observationWorks || '').trim() || (log.observationImprove || '').trim())
  return { ...log, status: hasTakes || hasNotes ? 'completed' : 'draft' }
}

/**
 * Journaux antérieurs au correctif (sans `sessionStartedAt`) : on les rattache à la séance
 * en cours du morceau s’ils ont été créés après son début.
 */
function inferSessionKey(log: SessionLog, pieces: Piece[]): SessionLog {
  if (log.sessionStartedAt) return log
  const start = pieces.find((p) => p.id === log.pieceId)?.program?.startedAt
  return start && log.createdAt >= start ? { ...log, sessionStartedAt: start } : log
}

/**
 * Un brouillon disparaît dès que la même séance (même morceau, même début) est terminée.
 * Les autres brouillons restent.
 */
export function dedupeSessionLogs(logs: SessionLog[]): SessionLog[] {
  const completed = new Set(
    logs.filter((l) => l.status === 'completed' && l.sessionStartedAt).map((l) => `${l.pieceId}|${l.sessionStartedAt}`),
  )
  const seenDraft = new Set<string>()
  return logs.filter((l) => {
    if (l.status !== 'draft' || !l.sessionStartedAt) return true
    const key = `${l.pieceId}|${l.sessionStartedAt}`
    if (completed.has(key) || seenDraft.has(key)) return false
    seenDraft.add(key)
    return true
  })
}

export function listSessionLogs(email: string, pieceId?: string): SessionLog[] {
  const pieces = readJson<Piece[]>(PIECES, [])
  return dedupeSessionLogs(
    readJson<SessionLog[]>(SESSIONS, [])
      .filter((s) => s.email === email.trim().toLowerCase() && (!pieceId || s.pieceId === pieceId))
      .map(normalizeSessionLog)
      .map((l) => inferSessionKey(l, pieces))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
  )
}

/** Journal déjà enregistré pour cette séance (brouillon ou terminé), s’il existe. */
export function findSessionLog(email: string, pieceId: string, sessionStartedAt: string) {
  if (!sessionStartedAt) return null
  return listSessionLogs(email, pieceId).find((l) => l.sessionStartedAt === sessionStartedAt) || null
}

export function listCompletedSessionLogs(email: string, pieceId?: string): SessionLog[] {
  return listSessionLogs(email, pieceId).filter((s) => s.status === 'completed')
}

export function listDraftSessionLogs(email: string, pieceId?: string): SessionLog[] {
  return listSessionLogs(email, pieceId).filter((s) => s.status === 'draft')
}

/** A completed session needs at least one take or a non-empty user observation. */
export function canCompleteSession(input: {
  takeIds: string[]
  observationWorks: string
  observationImprove: string
}) {
  if ((input.takeIds || []).length > 0) return true
  if ((input.observationWorks || '').trim().length >= 2) return true
  if ((input.observationImprove || '').trim().length >= 2) return true
  return false
}

export function saveSessionLog(log: SessionLog) {
  const list = readJson<SessionLog[]>(SESSIONS, [])
  const next = normalizeSessionLog(log)
  writeJson(SESSIONS, [next, ...list.filter((s) => s.id !== log.id)].slice(0, 200))
}

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, DB_VERSION)
    req.onupgradeneeded = () => {
      const db = req.result
      if (!db.objectStoreNames.contains(BLOBS)) db.createObjectStore(BLOBS)
    }
    req.onsuccess = () => resolve(req.result)
    req.onerror = () => reject(req.error)
  })
}

export async function putBlob(id: string, blob: Blob) {
  const db = await openDb()
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(BLOBS, 'readwrite')
    tx.objectStore(BLOBS).put(blob, id)
    tx.oncomplete = () => resolve()
    tx.onerror = () => reject(tx.error)
  })
  db.close()
}

export async function getBlob(id: string): Promise<Blob | null> {
  try {
    const db = await openDb()
    const blob = await new Promise<Blob | null>((resolve, reject) => {
      const tx = db.transaction(BLOBS, 'readonly')
      const req = tx.objectStore(BLOBS).get(id)
      req.onsuccess = () => resolve((req.result as Blob) ?? null)
      req.onerror = () => reject(req.error)
    })
    db.close()
    return blob
  } catch {
    return null
  }
}

export async function deleteBlob(id: string) {
  try {
    const db = await openDb()
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(BLOBS, 'readwrite')
      tx.objectStore(BLOBS).delete(id)
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
    db.close()
  } catch {
    /* ignore */
  }
}

const PBKDF2_ITERS = 310_000
const PBKDF2_PREFIX = 'pbkdf2-sha256'

function toHex(bytes: ArrayBuffer) {
  return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('')
}

/** Legacy single-pass SHA-256 (pre-hardening). Kept only to verify old device accounts. */
async function hashPasswordLegacy(password: string, salt: string) {
  const data = new TextEncoder().encode(`${salt}:${password}`)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return toHex(digest)
}

/** Device-account password hash via PBKDF2-SHA-256 (Web Crypto). */
export async function hashPassword(password: string, salt: string) {
  const enc = new TextEncoder()
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: enc.encode(salt),
      iterations: PBKDF2_ITERS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  )
  return `${PBKDF2_PREFIX}$${PBKDF2_ITERS}$${toHex(bits)}`
}

export async function verifyPassword(password: string, salt: string, storedHash: string) {
  if (storedHash.startsWith(`${PBKDF2_PREFIX}$`)) {
    const next = await hashPassword(password, salt)
    return next === storedHash
  }
  const legacy = await hashPasswordLegacy(password, salt)
  return legacy === storedHash
}

export function needsPasswordRehash(storedHash: string) {
  return !storedHash.startsWith(`${PBKDF2_PREFIX}$`)
}

export function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

/**
 * Optional discovery catalog only. Never marks lastWorkedAt — demos must not look like user history.
 * Licences: Chopin / Debussy / Satie works are public-domain compositions; audio/image assets still need review.
 */
export function seedDemoPieces(email: string) {
  const existing = listPieces(email)
  if (existing.some((p) => p.demo)) return
  const now = new Date().toISOString()
  const mail = email.trim().toLowerCase()
  const demos: Piece[] = [
    {
      id: newId('demo'),
      email: mail,
      title: 'Nocturne Op. 9 n°2',
      artist: 'Chopin',
      instrument: 'piano',
      genre: 'Classique',
      objective: 'Fluidité et expression',
      passages: 'Mesures 1–8',
      notes: 'Exemple de démonstration — pas une séance utilisateur.',
      resources: [{ id: newId('res'), kind: 'note', label: 'Démonstration — composition domaine public (licence audio/image à vérifier)', demo: true }],
      program: null,
      demo: true,
      createdAt: now,
      updatedAt: now,
      lastWorkedAt: null,
    },
    {
      id: newId('demo'),
      email: mail,
      title: 'Clair de lune',
      artist: 'Debussy',
      instrument: 'piano',
      genre: 'Classique',
      objective: '',
      passages: '',
      notes: 'Exemple de démonstration — pas une séance utilisateur.',
      resources: [{ id: newId('res'), kind: 'note', label: 'Démonstration — composition domaine public (licence audio/image à vérifier)', demo: true }],
      program: null,
      demo: true,
      createdAt: now,
      updatedAt: now,
      lastWorkedAt: null,
    },
    {
      id: newId('demo'),
      email: mail,
      title: 'Gymnopédie n°1',
      artist: 'Satie',
      instrument: 'piano',
      genre: 'Classique',
      objective: '',
      passages: '',
      notes: 'Exemple de démonstration — pas une séance utilisateur.',
      resources: [{ id: newId('res'), kind: 'note', label: 'Démonstration — composition domaine public (licence audio/image à vérifier)', demo: true }],
      program: null,
      demo: true,
      createdAt: now,
      updatedAt: now,
      lastWorkedAt: null,
    },
  ]
  for (const piece of demos) savePiece(piece)
}
