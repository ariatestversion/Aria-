import { useCallback, useEffect, useRef, useState } from 'react'

/** Métronome Web Audio (gratuit, local). Clic accentué sur le temps 1 d’une mesure à 4 temps. */
export function useMetronome(initialBpm = 60) {
  const [bpm, setBpmState] = useState(initialBpm)
  const [running, setRunning] = useState(false)
  const [beat, setBeat] = useState(-1)
  const [error, setError] = useState<string | null>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<number | null>(null)
  const nextRef = useRef(0)
  const countRef = useRef(0)
  const bpmRef = useRef(initialBpm)
  const uiTimers = useRef<number[]>([])

  const setBpm = useCallback((value: number) => {
    const v = Math.max(30, Math.min(220, Math.round(value)))
    bpmRef.current = v
    setBpmState(v)
  }, [])

  const stop = useCallback(() => {
    if (timerRef.current) window.clearInterval(timerRef.current)
    timerRef.current = null
    uiTimers.current.forEach((t) => window.clearTimeout(t))
    uiTimers.current = []
    setRunning(false)
    setBeat(-1)
  }, [])

  const start = useCallback(async () => {
    try {
      const Ctor =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
      if (!Ctor) {
        setError('Le métronome n’est pas disponible dans ce navigateur.')
        return
      }
      if (!ctxRef.current) ctxRef.current = new Ctor()
      const ctx = ctxRef.current
      if (ctx.state === 'suspended') await ctx.resume()
      setError(null)
      countRef.current = 0
      nextRef.current = ctx.currentTime + 0.08
      const tick = () => {
        while (nextRef.current < ctx.currentTime + 0.12) {
          const at = nextRef.current
          const n = countRef.current % 4
          const osc = ctx.createOscillator()
          const gain = ctx.createGain()
          osc.frequency.value = n === 0 ? 1320 : 880
          gain.gain.setValueAtTime(0.0001, at)
          gain.gain.exponentialRampToValueAtTime(n === 0 ? 0.5 : 0.3, at + 0.002)
          gain.gain.exponentialRampToValueAtTime(0.0001, at + 0.05)
          osc.connect(gain).connect(ctx.destination)
          osc.start(at)
          osc.stop(at + 0.06)
          const delay = Math.max(0, (at - ctx.currentTime) * 1000)
          uiTimers.current.push(window.setTimeout(() => setBeat(n), delay))
          if (uiTimers.current.length > 16) uiTimers.current.splice(0, 8)
          nextRef.current += 60 / bpmRef.current
          countRef.current += 1
        }
      }
      tick()
      if (timerRef.current) window.clearInterval(timerRef.current)
      timerRef.current = window.setInterval(tick, 25)
      setRunning(true)
    } catch {
      setError('Impossible de démarrer le métronome.')
      stop()
    }
  }, [stop])

  useEffect(
    () => () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
      uiTimers.current.forEach((t) => window.clearTimeout(t))
      void ctxRef.current?.close().catch(() => undefined)
    },
    [],
  )

  return { bpm, setBpm, running, beat, error, start, stop }
}
