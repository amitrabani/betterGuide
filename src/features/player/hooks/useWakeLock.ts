import { useState, useCallback, useEffect, useRef } from 'react'

export function useWakeLock() {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)
  const [isSupported] = useState(() => 'wakeLock' in navigator)
  const wakeLockRef = useRef<WakeLockSentinel | null>(null)

  // Keep ref in sync
  wakeLockRef.current = wakeLock

  const requestWakeLock = useCallback(async () => {
    if (!isSupported) return

    try {
      const sentinel = await navigator.wakeLock.request('screen')
      wakeLockRef.current = sentinel
      setWakeLock(sentinel)

      sentinel.addEventListener('release', () => {
        wakeLockRef.current = null
        setWakeLock(null)
      })
    } catch (err) {
      console.error('Failed to acquire wake lock:', err)
    }
  }, [isSupported])

  const releaseWakeLock = useCallback(async () => {
    if (wakeLockRef.current) {
      await wakeLockRef.current.release()
      wakeLockRef.current = null
      setWakeLock(null)
    }
  }, [])

  // Re-acquire wake lock when document becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && wakeLockRef.current === null && isSupported) {
        requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [isSupported, requestWakeLock])

  return {
    isActive: !!wakeLock,
    isSupported,
    requestWakeLock,
    releaseWakeLock,
  }
}
