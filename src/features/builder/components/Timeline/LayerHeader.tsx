import { Eye, EyeOff, Lock, Unlock, ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LayerType } from '@/types/timeline'

interface LayerHeaderProps {
  id: LayerType
  label: string
  visible: boolean
  locked: boolean
  expanded: boolean
  onToggleVisible: () => void
  onToggleLocked: () => void
  onToggleExpanded: () => void
  className?: string
}

export function LayerHeader({
  label,
  visible,
  locked,
  expanded,
  onToggleVisible,
  onToggleLocked,
  onToggleExpanded,
  className,
}: LayerHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2 px-3 py-2 bg-base-200 border-b border-base-300',
        'h-12 min-w-[180px]',
        className
      )}
    >
      <button
        className="btn btn-ghost btn-xs btn-square"
        onClick={onToggleExpanded}
        title={expanded ? 'Collapse' : 'Expand'}
      >
        {expanded ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
      </button>

      <span className="flex-1 font-medium text-sm truncate">{label}</span>

      <button
        className={cn(
          'btn btn-ghost btn-xs btn-square',
          !visible && 'opacity-50'
        )}
        onClick={onToggleVisible}
        title={visible ? 'Hide' : 'Show'}
      >
        {visible ? (
          <Eye className="h-3.5 w-3.5" />
        ) : (
          <EyeOff className="h-3.5 w-3.5" />
        )}
      </button>

      <button
        className={cn(
          'btn btn-ghost btn-xs btn-square',
          locked && 'text-warning'
        )}
        onClick={onToggleLocked}
        title={locked ? 'Unlock' : 'Lock'}
      >
        {locked ? (
          <Lock className="h-3.5 w-3.5" />
        ) : (
          <Unlock className="h-3.5 w-3.5" />
        )}
      </button>
    </div>
  )
}
