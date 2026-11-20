import type { Pitch } from './songs'

const NOTE_INDEX: Record<string, number> = {
  C: 0,
  'C#': 1,
  Db: 1,
  D: 2,
  'D#': 3,
  Eb: 3,
  E: 4,
  F: 5,
  'F#': 6,
  Gb: 6,
  G: 7,
  'G#': 8,
  Ab: 8,
  A: 9,
  'A#': 10,
  Bb: 10,
  B: 11,
}

let audioCtx: AudioContext | null = null
let backingTimer: number | null = null
const backingOsc: OscillatorNode[] = []

export function getAudioContext(): AudioContext | null {
  if (audioCtx) return audioCtx
  const AC =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!AC) return null
  audioCtx = new AC()
  return audioCtx
}

export function freqOf(pitch: Pitch): number {
  const oct = Number(pitch.slice(-1))
  const name = pitch.slice(0, -1)
  const idx = NOTE_INDEX[name] ?? 0
  const midi = idx + (oct + 1) * 12
  return 440 * 2 ** ((midi - 69) / 12)
}

export function playTone(pitch: Pitch, ok: boolean) {
  const audio = getAudioContext()
  if (!audio) return
  void audio.resume()
  const osc = audio.createOscillator()
  const gain = audio.createGain()
  osc.type = 'triangle'
  osc.frequency.value = freqOf(pitch)
  gain.gain.value = ok ? 0.14 : 0.06
  osc.connect(gain)
  gain.connect(audio.destination)
  osc.start()
  gain.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + (ok ? 0.28 : 0.12))
  osc.stop(audio.currentTime + 0.3)
}

function strikeChord(pitches: Pitch[]) {
  const audio = getAudioContext()
  if (!audio) return
  void audio.resume()
  const now = audio.currentTime
  for (const pitch of pitches) {
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = 'sine'
    osc.frequency.value = freqOf(pitch)
    gain.gain.setValueAtTime(0.0001, now)
    gain.gain.exponentialRampToValueAtTime(0.035, now + 0.05)
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.55)
    osc.connect(gain)
    gain.connect(audio.destination)
    osc.start(now)
    osc.stop(now + 1.6)
    backingOsc.push(osc)
  }
}

export function stopBacking() {
  if (backingTimer != null) {
    window.clearInterval(backingTimer)
    backingTimer = null
  }
  while (backingOsc.length) {
    const osc = backingOsc.pop()
    try {
      osc?.stop()
    } catch {
      /* already stopped */
    }
  }
}

export function startBacking(chords: Pitch[][]) {
  stopBacking()
  if (!chords.length) return
  let i = 0
  strikeChord(chords[0])
  i = 1
  backingTimer = window.setInterval(() => {
    strikeChord(chords[i % chords.length])
    i += 1
  }, 1700)
}
