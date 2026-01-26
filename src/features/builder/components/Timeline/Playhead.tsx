import { cn } from '@/lib/utils'

interface PlayheadProps {
  position: number
  zoom: number
  scrollX: number
  isPlaying: boolean
  className?: string
}

export function Playhead({ position, zoom, scrollX, isPlaying, className }: PlayheadProps) {
  const left = position * zoom - scrollX

  // Don't render if off-screen
  if (left < -10 || left > 2000) return null

  return (
    <div
      className={cn(
        'absolute top-0 bottom-0 z-20 pointer-events-none',
        className
      )}
      style={{ left: `${left}px` }}
    >
      {/* Playhead marker (triangle) */}
      <div className="relative">
        <div
          className={cn(
            'w-0 h-0 border-l-[6px] border-r-[6px] border-t-[8px]',
            'border-l-transparent border-r-transparent',
            isPlaying ? 'border-t-success' : 'border-t-primary',
            '-translate-x-1/2'
          )}
        />
      </div>

      {/* Playhead line */}
      <div
        className={cn(
          'absolute top-0 bottom-0 w-0.5 -translate-x-1/2',
          isPlaying ? 'bg-success' : 'bg-primary'
        )}
      />
    </div>
  )
}
