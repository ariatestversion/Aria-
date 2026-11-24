import { useCallback, useEffect, useRef, useState } from 'react'
function recMsg(fr: string, en?: string) {
  void en
  return fr
}

type RecorderStatus = 'idle' | 'recording' | 'denied' | 'unsupported' | 'error'

const PREFERRED_MIME_TYPES = [
  'audio/webm;codecs=opus',
  'audio/webm',
  'audio/mp4',
  'audio/ogg;codecs=opus',
  'audio/ogg',
]

function pickMimeType(): string | undefined {
  if (typeof MediaRecorder === 'undefined' || !MediaRecorder.isTypeSupported) {
    return undefined
  }
  return PREFERRED_MIME_TYPES.find((t) => MediaRecorder.isTypeSupported(t))
}

type WakeLockLike = { release: () => Promise<void> }

export type RecorderOptions = {
  /**
   * Appelé quand l’enregistrement s’arrête sans qu’on l’ait demandé (appel entrant, écran
   * verrouillé, micro retiré…). Reçoit ce qui a été capté, pour que rien ne soit perdu.
   */
  onInterrupted?: (blob: Blob | null, seconds: number) => void
}

export function useMediaRecorder(options: RecorderOptions = {}) {
  const interruptedRef = useRef(options.onInterrupted)
  interruptedRef.current = options.onInterrupted
  const secondsRef = useRef(0)
  const wakeLock = useRef<WakeLockLike | null>(null)
  const [status, setStatus] = useState<RecorderStatus>('idle')
  const [seconds, setSeconds] = useState(0)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const mediaRecorder = useRef<MediaRecorder | null>(null)
  const chunks = useRef<Blob[]>([])
  const timer = useRef<number | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const stopResolver = useRef<((blob: Blob | null) => void) | null>(null)
  const mimeTypeRef = useRef<string | undefined>(undefined)

  const clearTimer = () => {
    if (timer.current) {
      window.clearInterval(timer.current)
      timer.current = null
    }
  }

  const releaseWakeLock = () => {
    const lock = wakeLock.current
    wakeLock.current = null
    void lock?.release().catch(() => undefined)
  }

  const stopStream = () => {
    streamRef.current?.getTracks().forEach((t) => {
      t.onended = null
      t.stop()
    })
    streamRef.current = null
    releaseWakeLock()
  }

  const start = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
      setStatus('unsupported')
      setErrorMessage(
        recMsg(
          'Ce navigateur ne permet pas d’enregistrer le micro.',
          'This browser can’t record from the microphone.',
        ),
      )
      return false
    }

    // Secure context required (HTTPS or localhost)
    if (typeof window.isSecureContext === 'boolean' && !window.isSecureContext) {
      setStatus('unsupported')
      setErrorMessage(
        recMsg(
          'L’enregistrement nécessite une connexion sécurisée (HTTPS).',
          'Recording needs a secure connection (HTTPS).',
        ),
      )
      return false
    }

    try {
      setErrorMessage(null)
      // Stop any previous stream cleanly
      if (mediaRecorder.current && mediaRecorder.current.state !== 'inactive') {
        mediaRecorder.current.stop()
      }
      stopStream()

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          // Music / instrument: browser “voice” processing often causes crackle
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false,
          channelCount: 1,
        },
      })
      streamRef.current = stream
      chunks.current = []
      // Micro coupé par le système (appel, autre application, casque débranché) : on arrête
      // proprement pour récupérer ce qui a été capté.
      stream.getAudioTracks().forEach((track) => {
        track.onended = () => {
          const rec = mediaRecorder.current
          if (rec && rec.state !== 'inactive') {
            try {
              rec.stop()
            } catch {
              /* ignore */
            }
          }
        }
      })

      const mimeType = pickMimeType()
      mimeTypeRef.current = mimeType
      const recorderOptions: MediaRecorderOptions = {
        audioBitsPerSecond: 192_000,
      }
      if (mimeType) recorderOptions.mimeType = mimeType
      let recorder: MediaRecorder
      try {
        recorder = new MediaRecorder(stream, recorderOptions)
      } catch {
        recorder = mimeType
          ? new MediaRecorder(stream, { mimeType })
          : new MediaRecorder(stream)
      }
      mediaRecorder.current = recorder

      recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) chunks.current.push(event.data)
      }

      recorder.onerror = () => {
        setStatus('error')
        setErrorMessage(
          recMsg('L’enregistrement s’est interrompu. Réessaie.', 'Recording stopped unexpectedly. Try again.'),
        )
        stopStream()
      }

      recorder.onstop = () => {
        const type = mimeTypeRef.current || chunks.current[0]?.type || 'audio/webm'
        const blob =
          chunks.current.length > 0 ? new Blob(chunks.current, { type }) : null
        if (blob) {
          const url = URL.createObjectURL(blob)
          setAudioUrl((prev) => {
            if (prev) URL.revokeObjectURL(prev)
            return url
          })
        }
        stopStream()
        mediaRecorder.current = null
        const resolver = stopResolver.current
        stopResolver.current = null
        if (resolver) {
          resolver(blob)
          return
        }
        // Arrêt non demandé : l’interface ne doit pas rester sur « enregistrement en cours ».
        clearTimer()
        setStatus((prev) => (prev === 'error' ? 'error' : 'idle'))
        interruptedRef.current?.(blob, secondsRef.current)
      }

      // Larger timeslice = fewer joins = less crackle than 250ms chunks
      recorder.start(1000)
      setSeconds(0)
      secondsRef.current = 0
      setStatus('recording')
      clearTimer()
      timer.current = window.setInterval(() => {
        secondsRef.current += 1
        setSeconds(secondsRef.current)
      }, 1000)
      // Empêche la mise en veille de l’écran pendant la prise (si le navigateur le permet).
      try {
        const nav = navigator as Navigator & { wakeLock?: { request: (type: 'screen') => Promise<WakeLockLike> } }
        if (nav.wakeLock) {
          void nav.wakeLock
            .request('screen')
            .then((lock) => {
              if (streamRef.current) wakeLock.current = lock
              else void lock.release().catch(() => undefined)
            })
            .catch(() => undefined)
        }
      } catch {
        /* ignore */
      }
      return true
    } catch (err) {
      stopStream()
      const name = err instanceof DOMException ? err.name : ''
      let permissionDenied = false
      try {
        const perm = await navigator.permissions?.query({ name: 'microphone' as PermissionName })
        permissionDenied = perm?.state === 'denied'
      } catch {
        /* API Permissions indisponible (Safari ancien, Firefox) */
      }
      if (name === 'NotAllowedError' || name === 'PermissionDeniedError' || name === 'SecurityError' || permissionDenied) {
        setStatus('denied')
        setErrorMessage(
          recMsg(
            'Micro refusé. Autorise le micro dans ton navigateur, puis réessaie.',
            'Microphone denied. Allow the mic in your browser, then try again.',
          ),
        )
      } else if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
        setStatus('error')
        setErrorMessage(
          recMsg('Aucun micro détecté sur cet appareil.', 'No microphone found on this device.'),
        )
      } else {
        setStatus('error')
        setErrorMessage(
          recMsg(
            'Impossible de démarrer l’enregistrement. Réessaie.',
            'Couldn’t start recording. Try again.',
          ),
        )
      }
      return false
    }
  }, [])

  const stop = useCallback(() => {
    clearTimer()
    return new Promise<Blob | null>((resolve) => {
      const recorder = mediaRecorder.current
      if (!recorder || recorder.state === 'inactive') {
        setStatus('idle')
        resolve(null)
        return
      }
      stopResolver.current = (blob) => {
        setStatus('idle')
        resolve(blob)
      }
      try {
        // Flush remaining data before stop on browsers that support it
        if (recorder.state === 'recording') {
          try {
            recorder.requestData()
          } catch {
            // ignore
          }
        }
        recorder.stop()
      } catch {
        setStatus('idle')
        stopStream()
        resolve(null)
      }
    })
  }, [])

  useEffect(
    () => () => {
      clearTimer()
      stopStream()
      if (audioUrl) URL.revokeObjectURL(audioUrl)
    },
    [audioUrl],
  )

  return { status, seconds, audioUrl, errorMessage, start, stop }
}

export function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, '0')
  const s = (totalSeconds % 60).toString().padStart(2, '0')
  return `${m}:${s}`
}
