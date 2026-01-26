import { cn } from '@/lib/utils'

interface TimeRulerProps {
  duration: number
  zoom: number
  scrollX: number
  className?: string
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function TimeRuler({ duration, zoom, scrollX, className }: TimeRulerProps) {
  const width = duration * zoom

  // Calculate interval based on zoom level
  const getInterval = () => {
    if (zoom > 50) return 5 // 5 second marks when zoomed in
    if (zoom > 20) return 10 // 10 second marks
    if (zoom > 10) return 30 // 30 second marks
    return 60 // 1 minute marks when zoomed out
  }

  const interval = getInterval()
  const marks: number[] = []

  for (let t = 0; t <= duration; t += interval) {
    marks.push(t)
  }

  // Ensure end mark is included
  if (marks[marks.length - 1] !== duration) {
    marks.push(duration)
  }

  return (
    <div
      className={cn(
        'h-8 bg-base-200 border-b border-base-300 relative overflow-hidden',
        className
      )}
    >
      <div
        className="absolute top-0 h-full"
        style={{
          width: `${width}px`,
          transform: `translateX(${-scrollX}px)`,
        }}
      >
        {marks.map((time) => (
          <div
            key={time}
            className="absolute top-0 h-full flex flex-col items-center"
            style={{ left: `${time * zoom}px` }}
          >
            <div className="h-3 w-px bg-base-content/30" />
            <span className="text-xs text-base-content/60 mt-0.5">
              {formatTime(time)}
            </span>
          </div>
        ))}

        {/* Minor tick marks */}
        {zoom > 30 &&
          Array.from({ length: Math.floor(duration) }).map((_, i) => {
            if (i % interval === 0) return null
            return (
              <div
                key={`minor-${i}`}
                className="absolute top-0 h-2 w-px bg-base-content/15"
                style={{ left: `${i * zoom}px` }}
              />
            )
          })}
      </div>
    </div>
  )
}
