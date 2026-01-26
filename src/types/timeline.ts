// Timeline and builder-specific types

export type LayerType = 'prompts' | 'ambient' | 'binaural' | 'sections'

export interface TimelineLayer {
  id: LayerType
  label: string
  visible: boolean
  locked: boolean
  expanded: boolean
}

export interface TimelineState {
  zoom: number // pixels per second
  scrollX: number // horizontal scroll position in pixels
  scrollY: number // vertical scroll position in pixels
  playheadPosition: number // current position in seconds
  isPlaying: boolean
  selectedItemId: string | null
  selectedLayerType: LayerType | null
}

export interface DragState {
  isDragging: boolean
  dragType: 'move' | 'resize-start' | 'resize-end' | null
  itemId: string | null
  layerType: LayerType | null
  startX: number
  startTime: number
  originalStartTime: number
  originalEndTime: number
}

export interface SnapConfig {
  enabled: boolean
  interval: number // seconds to snap to
  snapToItems: boolean // snap to other item edges
}

export interface TimelineConfig {
  minZoom: number
  maxZoom: number
  defaultZoom: number
  snapConfig: SnapConfig
  gridInterval: number // seconds between grid lines
}

export const defaultTimelineConfig: TimelineConfig = {
  minZoom: 5, // 5 pixels per second (zoomed out)
  maxZoom: 100, // 100 pixels per second (zoomed in)
  defaultZoom: 20, // 20 pixels per second
  snapConfig: {
    enabled: true,
    interval: 1, // snap to 1-second intervals
    snapToItems: true,
  },
  gridInterval: 10, // grid line every 10 seconds
}

export const defaultLayers: TimelineLayer[] = [
  { id: 'sections', label: 'Sections', visible: true, locked: false, expanded: true },
  { id: 'prompts', label: 'Prompts', visible: true, locked: false, expanded: true },
  { id: 'ambient', label: 'Ambient', visible: true, locked: false, expanded: true },
  { id: 'binaural', label: 'Binaural', visible: true, locked: false, expanded: true },
]

// Undo/Redo history
export interface HistoryEntry {
  id: string
  timestamp: number
  description: string
  snapshot: unknown // Session snapshot
}

export interface HistoryState {
  past: HistoryEntry[]
  future: HistoryEntry[]
  maxHistorySize: number
}
