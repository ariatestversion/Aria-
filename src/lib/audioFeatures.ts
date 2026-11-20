/** Lightweight client-side take analysis (Web Audio). */

export type AudioFeatures = {
  durationSec: number
  rmsMean: number
  rmsPeak: number
  silenceRatio: number
  attackCount: number
  dynamicRange: number
  /** Attacks per second while “playing” (non-silent frames). */
  attacksPerSec: number
  /** Mean energy in first / middle / last third of the take (0–1 relative). */
  openingEnergy: number
  middleEnergy: number
  endingEnergy: number
  /** How steady the energy envelope is (lower = more even). */
  energyVariance: number
  /** Mean |cents| from the nearest tempered pitch. Lower = cleaner intonation. */
  intonationCents: number
  /** Share of frames with a readable pitch. */
  voicedRatio: number
  /** Coefficient of variation of inter-onset intervals. Higher = unsteady pulse. */
  ioiCv: number
  /** Tessitura in semitones when pitch is heard. */
  tessituraSemitones: number
  /** True when decode failed or blob was empty. */
  weakSignal: boolean
}

const EMPTY: AudioFeatures = {
  durationSec: 0,
  rmsMean: 0,
  rmsPeak: 0,
  silenceRatio: 1,
  attackCount: 0,
  dynamicRange: 0,
  attacksPerSec: 0,
  openingEnergy: 0,
  middleEnergy: 0,
  endingEnergy: 0,
  energyVariance: 0,
  intonationCents: 0,
  voicedRatio: 0,
  ioiCv: 0,
  tessituraSemitones: 0,
  weakSignal: true,
}

function mean(xs: number[]): number {
  if (!xs.length) return 0
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

function variance(xs: number[]): number {
  if (xs.length < 2) return 0
  const m = mean(xs)
  return mean(xs.map((x) => (x - m) * (x - m)))
}

function estimateF0(channel: Float32Array, start: number, len: number, sr: number): number | null {
  const n = Math.min(len, channel.length - start)
  if (n < 320) return null
  let energy = 0
  for (let i = 0; i < n; i++) {
    const v = channel[start + i]
    energy += v * v
  }
  const rms2 = energy / n
  if (rms2 < 4e-6) return null
  const minLag = Math.floor(sr / 1400)
  const maxLag = Math.min(Math.floor(sr / 70), Math.floor(n / 2))
  let bestLag = 0
  let best = Number.NEGATIVE_INFINITY
  for (let lag = minLag; lag <= maxLag; lag++) {
    let corr = 0
    const lim = n - lag
    for (let i = 0; i < lim; i++) corr += channel[start + i] * channel[start + i + lag]
    corr /= lim
    if (corr > best) {
      best = corr
      bestLag = lag
    }
  }
  if (bestLag <= 0 || best < rms2 * 0.28) return null
  return sr / bestLag
}

function hzToMidi(hz: number): number {
  return 69 + 12 * Math.log2(hz / 440)
}

/**
 * Decode a recording / demo blob and extract coarse musical signals
 * used to personalize Aria’s report (tempo feel, density, silence).
 */
async function extractAudioFeaturesInner(blob: Blob): Promise<AudioFeatures> {
  const ctx = new AudioContext()
  try {
    const raw = await blob.arrayBuffer()
    const buffer = await ctx.decodeAudioData(raw.slice(0))

    const channel = buffer.getChannelData(0)
    const durationSec = buffer.duration
    if (!channel.length || durationSec <= 0) return EMPTY

    // Cap work so long takes never freeze the tab (analyze first ~90s)
    const maxSec = 90
    const sampleRate = buffer.sampleRate
    const maxSamples = Math.min(channel.length, Math.floor(sampleRate * maxSec))
    const hop = Math.max(1, Math.floor(sampleRate * 0.05)) // 50ms
    const frame = hop
    const energies: number[] = []

    for (let i = 0; i + frame < maxSamples; i += hop) {
      let sum = 0
      for (let j = 0; j < frame; j++) {
        const v = channel[i + j]
        sum += v * v
      }
      energies.push(Math.sqrt(sum / frame))
    }

    if (energies.length === 0) return { ...EMPTY, durationSec }

    const rmsMean = mean(energies)
    let rmsPeak = 0
    for (const e of energies) if (e > rmsPeak) rmsPeak = e
    const silenceThreshold = Math.max(0.008, rmsMean * 0.28)
    let silent = 0
    for (const e of energies) if (e < silenceThreshold) silent += 1
    const silenceRatio = silent / energies.length

    let attackCount = 0
    const attackTimes: number[] = []
    for (let i = 1; i < energies.length; i++) {
      if (energies[i] > silenceThreshold * 2.2 && energies[i - 1] < silenceThreshold * 1.2) {
        attackCount += 1
        attackTimes.push((i * hop) / sampleRate)
      }
    }

    const iois: number[] = []
    for (let i = 1; i < attackTimes.length; i++) iois.push(attackTimes[i] - attackTimes[i - 1])
    const ioiMean = mean(iois)
    const ioiCv = ioiMean > 0.05 && iois.length >= 3 ? Math.sqrt(variance(iois)) / ioiMean : 0

    const pitchWin = Math.min(2048, Math.floor(sampleRate * 0.046))
    const pitchHop = pitchWin * 3
    const centsDev: number[] = []
    const midis: number[] = []
    let voiced = 0
    let pitchFrames = 0
    for (let i = 0; i + pitchWin < maxSamples; i += pitchHop) {
      pitchFrames += 1
      const hz = estimateF0(channel, i, pitchWin, sampleRate)
      if (!hz) continue
      voiced += 1
      const midi = hzToMidi(hz)
      midis.push(midi)
      const nearest = Math.round(midi)
      centsDev.push(Math.abs(midi - nearest) * 100)
    }
    const voicedRatio = pitchFrames ? voiced / pitchFrames : 0
    const intonationCents = centsDev.length ? mean(centsDev) : 0
    const tessituraSemitones =
      midis.length >= 4 ? Math.max(...midis) - Math.min(...midis) : 0

    const sorted = energies.slice().sort((a, b) => a - b)
    const p10 = sorted[Math.floor(sorted.length * 0.1)] ?? 0
    const p90 = sorted[Math.floor(sorted.length * 0.9)] ?? 0
    const dynamicRange = Math.max(0, p90 - p10)

    const analyzedSec = Math.min(durationSec, maxSec)
    const activeSec = Math.max(0.25, analyzedSec * (1 - silenceRatio))
    const attacksPerSec = attackCount / activeSec

    const third = Math.max(1, Math.floor(energies.length / 3))
    const openingEnergy = mean(energies.slice(0, third))
    const middleEnergy = mean(energies.slice(third, third * 2))
    const endingEnergy = mean(energies.slice(third * 2))
    const energyVariance = variance(energies)

    const weakSignal = rmsPeak < 0.015 || durationSec < 1.2

    return {
      durationSec,
      rmsMean,
      rmsPeak,
      silenceRatio,
      attackCount,
      dynamicRange,
      attacksPerSec,
      openingEnergy,
      middleEnergy,
      endingEnergy,
      energyVariance,
      intonationCents,
      voicedRatio,
      ioiCv,
      tessituraSemitones,
      weakSignal,
    }
  } finally {
    await ctx.close().catch(() => undefined)
  }
}

/** Public API — never hangs the “Aria is listening…” screen. */
export async function extractAudioFeatures(blob: Blob | null): Promise<AudioFeatures> {
  if (!blob || blob.size < 64) return EMPTY
  try {
    return await Promise.race([
      extractAudioFeaturesInner(blob),
      new Promise<AudioFeatures>((resolve) => {
        window.setTimeout(() => resolve({ ...EMPTY, weakSignal: true }), 7000)
      }),
    ])
  } catch {
    return EMPTY
  }
}

export type ScrollKeyframe = { t: number; p: number }

/** Map normalized audio time (0–1) through easing keyframes → scroll progress 0–1. */
export function mapScrollProgress(
  tNorm: number,
  keyframes?: ScrollKeyframe[],
  /** Advance slightly so upcoming measures stay visible (anticipation). */
  lookahead = 0,
): number {
  const t = Math.min(1, Math.max(0, tNorm + Math.max(0, lookahead)))
  if (!keyframes || keyframes.length < 2) return t

  const kfs = [...keyframes].sort((a, b) => a.t - b.t)
  if (t <= kfs[0].t) return kfs[0].p
  if (t >= kfs[kfs.length - 1].t) return kfs[kfs.length - 1].p

  for (let i = 0; i < kfs.length - 1; i++) {
    const a = kfs[i]
    const b = kfs[i + 1]
    if (t >= a.t && t <= b.t) {
      const u = (t - a.t) / Math.max(1e-6, b.t - a.t)
      const s = u * u * u * (u * (u * 6 - 15) + 10)
      return a.p + (b.p - a.p) * s
    }
  }
  return t
}
