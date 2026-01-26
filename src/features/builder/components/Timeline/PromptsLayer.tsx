import { cn } from '@/lib/utils'
import { PromptChip } from './PromptChip'
import type { PromptItem } from '@/types/session'

interface PromptsLayerProps {
  prompts: PromptItem[]
  duration: number
  zoom: number
  scrollX: number
  selectedId: string | null
  visible: boolean
  locked: boolean
  onSelectPrompt: (id: string) => void
  className?: string
}

export function PromptsLayer({
  prompts,
  duration,
  zoom,
  scrollX,
  selectedId,
  visible,
  locked,
  onSelectPrompt,
  className,
}: PromptsLayerProps) {
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
      {/* Background grid */}
      <div
        className="absolute inset-0"
        style={{
          width: `${width}px`,
          transform: `translateX(${-scrollX}px)`,
          backgroundImage: `repeating-linear-gradient(
            90deg,
            transparent,
            transparent ${zoom * 10 - 1}px,
            rgba(0,0,0,0.05) ${zoom * 10 - 1}px,
            rgba(0,0,0,0.05) ${zoom * 10}px
          )`,
        }}
      />

      {/* Prompt chips */}
      <div
        className="absolute inset-0"
        style={{
          width: `${width}px`,
          transform: `translateX(${-scrollX}px)`,
        }}
      >
        {prompts.map((prompt) => (
          <PromptChip
            key={prompt.id}
            prompt={prompt}
            zoom={zoom}
            scrollX={0} // Already handled by parent transform
            isSelected={prompt.id === selectedId}
            onClick={() => onSelectPrompt(prompt.id)}
          />
        ))}
      </div>
    </div>
  )
}
