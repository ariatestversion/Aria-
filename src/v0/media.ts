/**
 * Sprint 07 — vérifie qu’une prise est réellement lisible avant d’annoncer sa sauvegarde.
 * Retourne la durée en secondes (> 0), 0 si le média est lisible mais sa durée inconnue,
 * ou null s’il est vide ou illisible. Aucune durée minimale arbitraire.
 */
export async function playableDuration(blob: Blob | null, timeoutMs = 6000): Promise<number | null> {
  if (!blob || blob.size === 0) return null
  const decoded = await decodeDuration(blob, timeoutMs)
  if (decoded !== null) return decoded
  return elementDuration(blob, timeoutMs)
}

function withTimeout<T>(p: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = window.setTimeout(() => reject(new Error('timeout')), ms)
    p.then(
      (v) => {
        window.clearTimeout(id)
        resolve(v)
      },
      (e) => {
        window.clearTimeout(id)
        reject(e)
      },
    )
  })
}

async function decodeDuration(blob: Blob, ms: number): Promise<number | null> {
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctx) return null
  let ctx: AudioContext | null = null
  try {
    ctx = new Ctx()
    const buf = await withTimeout(ctx.decodeAudioData(await blob.arrayBuffer()), ms)
    return buf.duration > 0 ? buf.duration : null
  } catch {
    return null
  } finally {
    void ctx?.close?.().catch(() => undefined)
  }
}

function elementDuration(blob: Blob, ms: number): Promise<number | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(blob)
    const audio = new Audio()
    const done = (v: number | null) => {
      window.clearTimeout(timer)
      audio.removeAttribute('src')
      URL.revokeObjectURL(url)
      resolve(v)
    }
    const timer = window.setTimeout(() => done(null), ms)
    audio.preload = 'metadata'
    audio.onloadedmetadata = () => done(Number.isFinite(audio.duration) && audio.duration > 0 ? audio.duration : 0)
    audio.onerror = () => done(null)
    audio.src = url
  })
}
