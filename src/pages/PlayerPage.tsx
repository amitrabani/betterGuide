import { useEffect, useState, useRef, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Play, Pause, SkipBack, Volume2, VolumeX, Maximize, Minimize, X, PenTool, AlertCircle } from 'lucide-react'
import { Button, Slider, useToast } from '@/components/ui'
import { useAudioEngine } from '@/audio'
import { getSession, savePracticeSession } from '@/services/persistence'
import { canonicalSessions } from '@/data'
import { useFullscreen, useWakeLock, useLongPress, BreathOrb, ExitOverlay } from '@/features/player'
import type { Session } from '@/types/session'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function PlayerPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const containerRef = useRef<HTMLDivElement>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showVolume, setShowVolume] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const controlsTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const playStartTimeRef = useRef<number | null>(null)
  const hasRecordedRef = useRef(false)

  const {
    transportState,
    currentTime,
    duration,
    isMuted,
    masterVolume,
    currentPromptId,
    loadSession,
    togglePlayPause,
    stop,
    seek,
    setVolume,
    setMuted,
  } = useAudioEngine()

  const { isFullscreen, toggleFullscreen } = useFullscreen(containerRef)
  const { requestWakeLock, releaseWakeLock } = useWakeLock()

  // Record practice session
  const recordPractice = useCallback(async () => {
    if (!session || !playStartTimeRef.current || hasRecordedRef.current) return
    if (currentTime < 30) return // Don't record if less than 30 seconds

    hasRecordedRef.current = true
    const actualDuration = currentTime

    const completionRate = Math.min(1, actualDuration / session.duration)

    await savePracticeSession({
      sessionId: session.id,
      sessionName: session.name,
      completedAt: Date.now(),
      duration: session.duration,
      actualDuration: Math.round(actualDuration),
      completionRate,
      lineage: session.lineage,
      intent: session.intent,
    })
  }, [session, currentTime])

  // Long press to exit
  const handleExit = async () => {
    await recordPractice()
    stop()
    releaseWakeLock()
    if (isFullscreen) {
      document.exitFullscreen()
    }
    navigate(-1)
  }

  const { isPressed: isExitPressed, progress: exitProgress, handlers: exitHandlers } = useLongPress({
    threshold: 1500,
    onLongPress: handleExit,
  })

  // Load session - check IndexedDB first, then canonical sessions
  useEffect(() => {
    const loadSessionData = async () => {
      if (!sessionId) {
        setLoadError('No session ID provided')
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setLoadError(null)

      try {
        // Try to load from IndexedDB first
        let sessionData = await getSession(sessionId)

        // If not found, check canonical sessions
        if (!sessionData) {
          sessionData = canonicalSessions.find(s => s.id === sessionId)
        }

        if (sessionData) {
          setSession(sessionData)
          loadSession(sessionData)
        } else {
          setLoadError('Session not found')
        }
      } catch (err) {
        console.error('Failed to load session:', err)
        setLoadError('Failed to load session')
        toast.error('Failed to load session')
      } finally {
        setIsLoading(false)
      }
    }

    loadSessionData()

    return () => {
      stop()
      releaseWakeLock()
    }
  }, [sessionId, loadSession, stop, releaseWakeLock, toast])

  // Manage wake lock based on playback
  useEffect(() => {
    if (transportState === 'playing') {
      requestWakeLock()
      // Track when playback starts
      if (!playStartTimeRef.current) {
        playStartTimeRef.current = Date.now()
      }
    } else {
      releaseWakeLock()
    }
  }, [transportState, requestWakeLock, releaseWakeLock])

  // Record practice when session completes
  useEffect(() => {
    if (transportState === 'stopped' && currentTime >= duration - 1 && duration > 0) {
      recordPractice()
    }
  }, [transportState, currentTime, duration, recordPractice])

  // Auto-hide controls
  useEffect(() => {
    const showControlsTemporarily = () => {
      setShowControls(true)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
      if (transportState === 'playing' && isFullscreen) {
        controlsTimeoutRef.current = setTimeout(() => {
          setShowControls(false)
        }, 3000)
      }
    }

    showControlsTemporarily()

    const handleInteraction = () => showControlsTemporarily()
    window.addEventListener('mousemove', handleInteraction)
    window.addEventListener('touchstart', handleInteraction)

    return () => {
      window.removeEventListener('mousemove', handleInteraction)
      window.removeEventListener('touchstart', handleInteraction)
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current)
      }
    }
  }, [transportState, isFullscreen])

  const progress = duration > 0 ? currentTime / duration : 0
  const isPlaying = transportState === 'playing'

  // Get current prompt text
  const currentPrompt = session?.prompts.find((p) => p.id === currentPromptId)

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (loadError || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Unable to load session</h2>
          <p className="text-base-content/60 mb-4">{loadError || 'Session not found'}</p>
          <div className="flex gap-3 justify-center">
            <Button variant="primary" onClick={() => navigate('/')}>
              Browse Sessions
            </Button>
            <Button variant="ghost" onClick={() => navigate(-1)}>
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-gradient-to-b from-base-200 to-base-300 flex flex-col relative"
    >
      {/* Exit overlay for long press */}
      <ExitOverlay isVisible={isExitPressed} progress={exitProgress} />

      {/* Header - hidden when controls are hidden */}
      <header
        className={`p-4 flex items-center justify-between transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        <Button variant="ghost" size="sm" onClick={handleExit}>
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <div className="flex gap-2">
          <div className="relative">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowVolume(!showVolume)}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>

            {/* Volume popup */}
            {showVolume && (
              <div className="absolute right-0 top-full mt-2 p-4 bg-base-100 rounded-lg shadow-lg w-48 z-50">
                <div className="flex items-center gap-2">
                  <button
                    className="btn btn-ghost btn-xs"
                    onClick={() => setMuted(!isMuted)}
                  >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                  </button>
                  <Slider
                    min={0}
                    max={1}
                    step={0.05}
                    value={masterVolume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                  />
                </div>
              </div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={toggleFullscreen}>
            {isFullscreen ? (
              <Minimize className="h-4 w-4" />
            ) : (
              <Maximize className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      {/* Main content - Breath Orb */}
      <main className="flex-1 flex flex-col items-center justify-center px-8">
        <BreathOrb isPlaying={isPlaying} progress={progress} />

        {/* Session info */}
        <h1 className="text-2xl font-bold mb-2 mt-8">{session.name}</h1>
        <p className="text-base-content/60 capitalize mb-8">{session.lineage}</p>

        {/* Current prompt display */}
        <div className="max-w-md text-center mb-8 min-h-[60px]">
          {currentPrompt ? (
            <p className="text-lg text-base-content/80 italic animate-fade-in">
              "{currentPrompt.text}"
            </p>
          ) : (
            <p className="text-base-content/40 text-sm">
              {isPlaying ? 'Breathe deeply...' : 'Press play to begin'}
            </p>
          )}
        </div>

        {/* Exit hint */}
        {isFullscreen && (
          <div
            className={`absolute bottom-32 text-center transition-opacity ${
              showControls ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <button
              {...exitHandlers}
              className="flex flex-col items-center gap-2 text-base-content/40 hover:text-base-content/60"
            >
              <X className="h-6 w-6" />
              <span className="text-xs">Hold to exit</span>
            </button>
          </div>
        )}
      </main>

      {/* Playback controls */}
      <footer
        className={`p-8 transition-opacity duration-300 ${
          showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Mode toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex items-center gap-1 p-1 bg-base-300/50 rounded-full">
            <button
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-content shadow-sm"
            >
              <Play className="h-4 w-4" />
              Play
            </button>
            <button
              onClick={() => navigate(`/builder/${sessionId}`)}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
            >
              <PenTool className="h-4 w-4" />
              Edit
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-md mx-auto mb-6">
          <input
            type="range"
            min={0}
            max={duration}
            value={currentTime}
            onChange={(e) => seek(Number(e.target.value))}
            className="range range-sm range-primary w-full"
          />
        </div>

        <div className="flex items-center justify-center gap-6">
          <Button variant="ghost" size="lg" onClick={() => seek(0)}>
            <SkipBack className="h-6 w-6" />
          </Button>
          <Button
            variant="primary"
            className="w-16 h-16 rounded-full"
            onClick={togglePlayPause}
            disabled={duration === 0}
          >
            {isPlaying ? (
              <Pause className="h-8 w-8" />
            ) : (
              <Play className="h-8 w-8 ml-1" />
            )}
          </Button>
          <div className="w-10" /> {/* Spacer for symmetry */}
        </div>

        {/* Time display */}
        <div className="flex justify-between text-sm text-base-content/60 mt-4 max-w-md mx-auto">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </footer>

      {/* Global styles */}
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
      `}</style>
    </div>
  )
}

export default PlayerPage
