import { useDraggable } from '@dnd-kit/core'
import { MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PromptItem } from '@/types/session'

interface PromptChipProps {
  prompt: PromptItem
  zoom: number
  scrollX: number
  isSelected: boolean
  onClick: () => void
}

export function PromptChip({ prompt, zoom, scrollX, isSelected, onClick }: PromptChipProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: prompt.id,
    data: {
      type: 'prompt',
      prompt,
    },
  })

  const left = prompt.startTime * zoom - scrollX
  const width = Math.max(prompt.duration * zoom, 60) // Minimum width of 60px

  // Don't render if completely off-screen
  if (left + width < 0 || left > 2000) return null

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

  // Truncate text to fit
  const maxChars = Math.floor(width / 8) - 4 // Rough estimate
  const displayText =
    prompt.text.length > maxChars
      ? prompt.text.substring(0, maxChars) + '...'
      : prompt.text

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'absolute top-1 h-10 rounded-lg cursor-pointer transition-colors',
        'flex items-center gap-1.5 px-2 overflow-hidden',
        'bg-primary/80 text-primary-content',
        'hover:bg-primary',
        isSelected && 'ring-2 ring-primary-content ring-offset-1',
        isDragging && 'shadow-lg'
      )}
      style={style}
      onClick={onClick}
      {...listeners}
      {...attributes}
    >
      <MessageSquare className="h-4 w-4 flex-shrink-0" />
      <span className="text-xs font-medium truncate">{displayText}</span>

      {/* Resize handles */}
      {isSelected && (
        <>
          <div className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary-content/30" />
          <div className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary-content/30" />
        </>
      )}
    </div>
  )
}
