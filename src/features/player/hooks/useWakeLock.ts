import { useState, useCallback, useEffect } from 'react'

export function useWakeLock() {
  const [wakeLock, setWakeLock] = useState<WakeLockSentinel | null>(null)
  const [isSupported] = useState(() => 'wakeLock' in navigator)

  const requestWakeLock = useCallback(async () => {
    if (!isSupported) return

    try {
      const sentinel = await navigator.wakeLock.request('screen')
      setWakeLock(sentinel)

      sentinel.addEventListener('release', () => {
        setWakeLock(null)
      })
    } catch (err) {
      console.error('Failed to acquire wake lock:', err)
    }
  }, [isSupported])

  const releaseWakeLock = useCallback(async () => {
    if (wakeLock) {
      await wakeLock.release()
      setWakeLock(null)
    }
  }, [wakeLock])

  // Re-acquire wake lock when document becomes visible
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && wakeLock === null && isSupported) {
        requestWakeLock()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [wakeLock, isSupported, requestWakeLock])

  return {
    isActive: !!wakeLock,
    isSupported,
    requestWakeLock,
    releaseWakeLock,
  }
}
