import { Play, Square, Loader2, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DeepgramVoice } from '@/types/voice'

interface VoiceCardProps {
  voice: DeepgramVoice
  isSelected: boolean
  isPlaying: boolean
  isLoading: boolean
  onSelect: () => void
  onPreview: () => void
  onStopPreview: () => void
}

export function VoiceCard({
  voice,
  isSelected,
  isPlaying,
  isLoading,
  onSelect,
  onPreview,
  onStopPreview,
}: VoiceCardProps) {
  return (
    <div
      onClick={onSelect}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-all',
        isSelected
          ? 'bg-primary/10 ring-1 ring-primary'
          : 'hover:bg-base-200',
      )}
    >
      <button
        onClick={(e) => {
          e.stopPropagation()
          if (isPlaying) {
            onStopPreview()
          } else {
            onPreview()
          }
        }}
        className={cn(
          'btn btn-circle btn-sm flex-shrink-0',
          isPlaying ? 'btn-primary' : 'btn-ghost',
        )}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isPlaying ? (
          <Square className="h-3 w-3 fill-current" />
        ) : (
          <Play className="h-4 w-4 fill-current" />
        )}
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-sm truncate">{voice.name}</span>
          {voice.recommended && (
            <Star className="h-3 w-3 text-warning fill-warning flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-base-content/50 truncate">{voice.traits}</p>
      </div>

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="badge badge-xs badge-ghost capitalize">{voice.gender}</span>
        <span className="badge badge-xs badge-ghost">{voice.accent}</span>
      </div>
    </div>
  )
}
