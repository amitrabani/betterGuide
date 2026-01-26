import { Waves } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BinauralConfig } from '@/types/session'
import { binauralPresets } from '@/types/session'

interface BinauralLayerProps {
  binaural: BinauralConfig | null
  duration: number
  zoom: number
  scrollX: number
  isSelected: boolean
  visible: boolean
  locked: boolean
  onSelect: () => void
  className?: string
}

export function BinauralLayer({
  binaural,
  duration,
  zoom,
  scrollX,
  isSelected,
  visible,
  locked,
  onSelect,
  className,
}: BinauralLayerProps) {
  if (!visible) {
    return (
      <div className={cn('h-12 bg-base-100/50 opacity-50', className)} />
    )
  }

  const width = duration * zoom

  return (
    <div
      className={cn(
        'h-12 bg-base-100 border-b border-base-300 relative overflow-hidden',
        locked && 'pointer-events-none opacity-70',
        className
      )}
    >
      <div
        className="absolute inset-0"
        style={{
          width: `${width}px`,
          transform: `translateX(${-scrollX}px)`,
        }}
      >
        {binaural && (
          <div
            className={cn(
              'absolute top-1 h-10 rounded-lg cursor-pointer transition-colors',
              'flex items-center gap-1.5 px-2 overflow-hidden',
              'bg-info/80 text-info-content',
              'hover:bg-info',
              isSelected && 'ring-2 ring-info-content ring-offset-1'
            )}
            style={{
              left: `${binaural.startTime * zoom}px`,
              width: `${(binaural.endTime - binaural.startTime) * zoom}px`,
            }}
            onClick={onSelect}
          >
            <Waves className="h-4 w-4 flex-shrink-0" />
            <span className="text-xs font-medium truncate">
              {binauralPresets[binaural.preset]?.description || 'Custom'} ({binaural.beatFrequency} Hz)
            </span>

            {/* Fade indicators */}
            {binaural.fadeIn > 0 && (
              <div
                className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-info-content/20 to-transparent"
                style={{ width: `${binaural.fadeIn * zoom}px` }}
              />
            )}
            {binaural.fadeOut > 0 && (
              <div
                className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-info-content/20 to-transparent"
                style={{ width: `${binaural.fadeOut * zoom}px` }}
              />
            )}
          </div>
        )}

        {/* Empty state hint */}
        {!binaural && (
          <div className="absolute inset-0 flex items-center justify-center text-base-content/40 text-sm">
            No binaural beats
          </div>
        )}
      </div>
    </div>
  )
}
