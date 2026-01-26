import { useDraggable } from '@dnd-kit/core'
import { Music } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AmbientItem } from '@/types/session'

interface AmbientChipProps {
  ambient: AmbientItem
  zoom: number
  isSelected: boolean
  onClick: () => void
}

function AmbientChip({ ambient, zoom, isSelected, onClick }: AmbientChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: ambient.id,
    data: {
      type: 'ambient',
      ambient,
    },
  })

  const left = ambient.startTime * zoom
  const width = (ambient.endTime - ambient.startTime) * zoom

  const style = transform
    ? {
        left: `${left + transform.x}px`,
        width: `${width}px`,
        opacity: isDragging ? 0.8 : 1,
        zIndex: isDragging ? 50 : 10,
      }
    : {
        left: `${left}px`,
        width: `${width}px`,
      }

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'absolute top-1 h-10 rounded-lg cursor-pointer transition-colors',
        'flex items-center gap-1.5 px-2 overflow-hidden',
        'bg-accent/80 text-accent-content',
        'hover:bg-accent',
        isSelected && 'ring-2 ring-accent-content ring-offset-1',
        isDragging && 'shadow-lg'
      )}
      style={style}
      onClick={onClick}
      {...listeners}
      {...attributes}
    >
      <Music className="h-4 w-4 flex-shrink-0" />
      <span className="text-xs font-medium truncate">{ambient.name}</span>

      {/* Fade indicators */}
      {ambient.fadeIn > 0 && (
        <div
          className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-accent-content/20 to-transparent"
          style={{ width: `${ambient.fadeIn * zoom}px` }}
        />
      )}
      {ambient.fadeOut > 0 && (
        <div
          className="absolute right-0 top-0 bottom-0 bg-gradient-to-l from-accent-content/20 to-transparent"
          style={{ width: `${ambient.fadeOut * zoom}px` }}
        />
      )}
    </div>
  )
}

interface AmbientLayerProps {
  ambients: AmbientItem[]
  duration: number
  zoom: number
  scrollX: number
  selectedId: string | null
  visible: boolean
  locked: boolean
  onSelectAmbient: (id: string) => void
  className?: string
}

export function AmbientLayer({
  ambients,
  duration,
  zoom,
  scrollX,
  selectedId,
  visible,
  locked,
  onSelectAmbient,
  className,
}: AmbientLayerProps) {
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
        {ambients.map((ambient) => (
          <AmbientChip
            key={ambient.id}
            ambient={ambient}
            zoom={zoom}
            isSelected={ambient.id === selectedId}
            onClick={() => onSelectAmbient(ambient.id)}
          />
        ))}
      </div>
    </div>
  )
}
