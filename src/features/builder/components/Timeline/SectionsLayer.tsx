import { useDraggable } from '@dnd-kit/core'
import { Flag } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SectionMarker, SectionType } from '@/types/session'

const sectionColors: Record<SectionType, string> = {
  opening: 'bg-success/60 border-success',
  main: 'bg-warning/60 border-warning',
  closing: 'bg-error/60 border-error',
}

const sectionLabels: Record<SectionType, string> = {
  opening: 'Opening',
  main: 'Main Practice',
  closing: 'Closing',
}

interface SectionChipProps {
  section: SectionMarker
  zoom: number
  isSelected: boolean
  onClick: () => void
}

function SectionChip({ section, zoom, isSelected, onClick }: SectionChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: section.id,
    data: {
      type: 'section',
      section,
    },
  })

  const left = section.startTime * zoom
  const width = (section.endTime - section.startTime) * zoom

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
        'absolute top-1 h-6 rounded border-l-2 cursor-pointer',
        'flex items-center gap-1 px-2 overflow-hidden',
        'hover:brightness-110 transition-all',
        sectionColors[section.type],
        isSelected && 'ring-2 ring-base-content ring-offset-1',
        isDragging && 'shadow-lg'
      )}
      style={style}
      onClick={onClick}
      {...listeners}
      {...attributes}
    >
      <Flag className="h-3 w-3 flex-shrink-0" />
      <span className="text-xs font-medium truncate">
        {section.label || sectionLabels[section.type]}
      </span>
    </div>
  )
}

interface SectionsLayerProps {
  sections: SectionMarker[]
  duration: number
  zoom: number
  scrollX: number
  selectedId: string | null
  visible: boolean
  locked: boolean
  onSelectSection: (id: string) => void
  className?: string
}

export function SectionsLayer({
  sections,
  duration,
  zoom,
  scrollX,
  selectedId,
  visible,
  locked,
  onSelectSection,
  className,
}: SectionsLayerProps) {
  if (!visible) {
    return (
      <div className={cn('h-8 bg-base-100/50 opacity-50', className)} />
    )
  }

  const width = duration * zoom

  return (
    <div
      className={cn(
        'h-8 bg-base-100 border-b border-base-300 relative overflow-hidden',
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
        {sections.map((section) => (
          <SectionChip
            key={section.id}
            section={section}
            zoom={zoom}
            isSelected={section.id === selectedId}
            onClick={() => onSelectSection(section.id)}
          />
        ))}

        {/* Empty state */}
        {sections.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-base-content/40 text-xs">
            No sections defined
          </div>
        )}
      </div>
    </div>
  )
}
