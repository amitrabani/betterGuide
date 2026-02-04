import { useEffect, useRef } from 'react'
import { Play, Pause, Square, SkipBack, Undo, Redo, Volume2, VolumeX } from 'lucide-react'
import { Button, Slider } from '@/components/ui'
import { useBuilderStore, selectCanUndo, selectCanRedo } from '../store/builderStore'
import { useAudioEngine } from '@/audio'

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function TransportControls() {
  const session = useBuilderStore((s) => s.session)
  const timeline = useBuilderStore((s) => s.timeline)
  const setPlayheadPosition = useBuilderStore((s) => s.setPlayheadPosition)
  const setIsPlaying = useBuilderStore((s) => s.setIsPlaying)
  const undo = useBuilderStore((s) => s.undo)
  const redo = useBuilderStore((s) => s.redo)
  const canUndo = useBuilderStore(selectCanUndo)
  const canRedo = useBuilderStore(selectCanRedo)

  const {
    transportState,
    currentTime,
    isMuted,
    masterVolume,
    currentPromptId,
    loadSession,
    togglePlayPause,
    stop: audioStop,
    seek: audioSeek,
    setVolume,
    setMuted,
  } = useAudioEngine()

  const sessionLoadedRef = useRef<string | null>(null)

  // Load session into audio engine when it changes (id or content via version/updatedAt)
  useEffect(() => {
    if (session) {
      const key = `${session.id}:${session.version}:${session.updatedAt ?? 0}`
      if (key !== sessionLoadedRef.current) {
        loadSession(session)
        sessionLoadedRef.current = key
      }
    }
  }, [session, loadSession])

  // Stop audio engine on unmount
  useEffect(() => {
    return () => {
      audioStop()
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sync audio engine time → builder playhead
  useEffect(() => {
    if (transportState === 'playing') {
      setPlayheadPosition(currentTime)
    }
  }, [currentTime, transportState, setPlayheadPosition])

  // Sync builder isPlaying with audio engine state
  useEffect(() => {
    const builderPlaying = timeline.isPlaying
    const enginePlaying = transportState === 'playing'
    if (builderPlaying !== enginePlaying) {
      setIsPlaying(enginePlaying)
    }
  }, [transportState, timeline.isPlaying, setIsPlaying])

  if (!session) return null

  const isPlaying = transportState === 'playing'

  const handlePlayPause = async () => {
    await togglePlayPause()
  }

  const handleStop = () => {
    audioStop()
    setPlayheadPosition(0)
  }

  const handleRewind = () => {
    audioSeek(0)
    setPlayheadPosition(0)
  }

  const handleSeek = (time: number) => {
    audioSeek(time)
    setPlayheadPosition(time)
  }

  // Get current prompt text for display
  const currentPrompt = session.prompts.find((p) => p.id === currentPromptId)

  return (
    <div className="bg-base-200 border-t border-base-300">
      {/* Current prompt display */}
      {currentPrompt && (
        <div className="px-4 py-2 text-center border-b border-base-300">
          <p className="text-sm text-base-content/70 italic">"{currentPrompt.text}"</p>
        </div>
      )}

      {/* Progress bar */}
      <div className="px-4 pt-3">
        <input
          type="range"
          min={0}
          max={session.duration}
          value={timeline.playheadPosition}
          onChange={(e) => handleSeek(Number(e.target.value))}
          className="range range-xs range-primary w-full"
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center justify-between px-4 py-3">
        {/* Undo/Redo */}
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={undo}
            disabled={!canUndo}
            title="Undo (Ctrl+Z)"
          >
            <Undo className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={redo}
            disabled={!canRedo}
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        {/* Transport */}
        <div className="flex items-center gap-4">
          <span className="text-sm font-mono w-14 text-right">
            {formatTime(timeline.playheadPosition)}
          </span>

          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleRewind}>
              <SkipBack className="h-4 w-4" />
            </Button>
            <Button
              variant={isPlaying ? 'secondary' : 'primary'}
              size="sm"
              onClick={handlePlayPause}
            >
              {isPlaying ? (
                <Pause className="h-4 w-4" />
              ) : (
                <Play className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleStop}>
              <Square className="h-4 w-4" />
            </Button>
          </div>

          <span className="text-sm font-mono w-14">
            {formatTime(session.duration)}
          </span>
        </div>

        {/* Volume */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMuted(!isMuted)}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? (
              <VolumeX className="h-4 w-4" />
            ) : (
              <Volume2 className="h-4 w-4" />
            )}
          </Button>
          <Slider
            min={0}
            max={1}
            step={0.05}
            value={masterVolume}
            onChange={(e) => setVolume(Number(e.target.value))}
            className="w-20"
          />
        </div>
      </div>
    </div>
  )
}
