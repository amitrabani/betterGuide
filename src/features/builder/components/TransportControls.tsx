import { Play, Pause, Square, SkipBack, Undo, Redo } from 'lucide-react'
import { Button } from '@/components/ui'
import { useBuilderStore, selectCanUndo, selectCanRedo } from '../store/builderStore'

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

  if (!session) return null

  const handlePlayPause = () => {
    setIsPlaying(!timeline.isPlaying)
  }

  const handleStop = () => {
    setIsPlaying(false)
    setPlayheadPosition(0)
  }

  const handleRewind = () => {
    setPlayheadPosition(0)
  }

  return (
    <div className="flex items-center justify-between px-4 py-3 bg-base-200 border-t border-base-300">
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
            variant={timeline.isPlaying ? 'secondary' : 'primary'}
            size="sm"
            onClick={handlePlayPause}
          >
            {timeline.isPlaying ? (
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

      {/* Spacer to balance layout */}
      <div className="w-20" />
    </div>
  )
}
