import { useRef, useState, useCallback, useEffect } from 'react'
import { DndContext, PointerSensor, useSensor, useSensors } from '@dnd-kit/core'
import type { DragEndEvent } from '@dnd-kit/core'
import { ZoomIn, ZoomOut } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBuilderStore } from '../../store/builderStore'
import { TimeRuler } from './TimeRuler'
import { Playhead } from './Playhead'
import { LayerHeader } from './LayerHeader'
import { PromptsLayer } from './PromptsLayer'
import { AmbientLayer } from './AmbientLayer'
import { BinauralLayer } from './BinauralLayer'
import { SectionsLayer } from './SectionsLayer'
import { Button } from '@/components/ui'
import { defaultLayers } from '@/types/timeline'
import type { TimelineLayer, LayerType } from '@/types/timeline'

interface TimelineProps {
  className?: string
}

export function Timeline({ className }: TimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [layers, setLayers] = useState<TimelineLayer[]>(defaultLayers)

  const session = useBuilderStore((s) => s.session)
  const timeline = useBuilderStore((s) => s.timeline)
  const setZoom = useBuilderStore((s) => s.setZoom)
  const setScrollX = useBuilderStore((s) => s.setScrollX)
  const selectItem = useBuilderStore((s) => s.selectItem)
  const movePrompt = useBuilderStore((s) => s.movePrompt)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  )

  const toggleLayer = useCallback((id: LayerType, field: 'visible' | 'locked' | 'expanded') => {
    setLayers((prev) =>
      prev.map((layer) =>
        layer.id === id ? { ...layer, [field]: !layer[field] } : layer
      )
    )
  }, [])

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, delta } = event
      const data = active.data.current

      if (data?.type === 'prompt' && session) {
        const deltaTime = delta.x / timeline.zoom
        const newStartTime = data.prompt.startTime + deltaTime
        movePrompt(active.id as string, Math.max(0, newStartTime))
      }
    },
    [session, timeline.zoom, movePrompt]
  )

  // Handle scroll
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      setScrollX((e.target as HTMLDivElement).scrollLeft)
    },
    [setScrollX]
  )

  // Handle zoom with keyboard
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '=' || e.key === '+') {
        e.preventDefault()
        setZoom(timeline.zoom * 1.2)
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault()
        setZoom(timeline.zoom / 1.2)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [timeline.zoom, setZoom])

  if (!session) {
    return (
      <div className={cn('flex items-center justify-center h-64', className)}>
        <p className="text-base-content/60">No session loaded</p>
      </div>
    )
  }

  const sectionsLayer = layers.find((l) => l.id === 'sections')!
  const promptsLayer = layers.find((l) => l.id === 'prompts')!
  const ambientLayer = layers.find((l) => l.id === 'ambient')!
  const binauralLayer = layers.find((l) => l.id === 'binaural')!

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div className={cn('flex flex-col bg-base-100 border border-base-300 rounded-lg overflow-hidden', className)}>
        {/* Toolbar */}
        <div className="flex items-center gap-2 px-3 py-2 bg-base-200 border-b border-base-300">
          <span className="text-sm font-medium mr-4">Timeline</span>
          <Button variant="ghost" size="xs" onClick={() => setZoom(timeline.zoom / 1.2)}>
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-xs text-base-content/60 w-12 text-center">
            {Math.round(timeline.zoom)}px/s
          </span>
          <Button variant="ghost" size="xs" onClick={() => setZoom(timeline.zoom * 1.2)}>
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Timeline content */}
        <div className="flex flex-1 min-h-0">
          {/* Layer headers (fixed left column) */}
          <div className="flex-shrink-0 w-[180px] border-r border-base-300">
            {/* Ruler spacer */}
            <div className="h-8 bg-base-200 border-b border-base-300" />

            {/* Layer headers */}
            <LayerHeader
              id="sections"
              label="Sections"
              visible={sectionsLayer.visible}
              locked={sectionsLayer.locked}
              expanded={sectionsLayer.expanded}
              onToggleVisible={() => toggleLayer('sections', 'visible')}
              onToggleLocked={() => toggleLayer('sections', 'locked')}
              onToggleExpanded={() => toggleLayer('sections', 'expanded')}
            />
            <LayerHeader
              id="prompts"
              label="Prompts"
              visible={promptsLayer.visible}
              locked={promptsLayer.locked}
              expanded={promptsLayer.expanded}
              onToggleVisible={() => toggleLayer('prompts', 'visible')}
              onToggleLocked={() => toggleLayer('prompts', 'locked')}
              onToggleExpanded={() => toggleLayer('prompts', 'expanded')}
            />
            <LayerHeader
              id="ambient"
              label="Ambient"
              visible={ambientLayer.visible}
              locked={ambientLayer.locked}
              expanded={ambientLayer.expanded}
              onToggleVisible={() => toggleLayer('ambient', 'visible')}
              onToggleLocked={() => toggleLayer('ambient', 'locked')}
              onToggleExpanded={() => toggleLayer('ambient', 'expanded')}
            />
            <LayerHeader
              id="binaural"
              label="Binaural"
              visible={binauralLayer.visible}
              locked={binauralLayer.locked}
              expanded={binauralLayer.expanded}
              onToggleVisible={() => toggleLayer('binaural', 'visible')}
              onToggleLocked={() => toggleLayer('binaural', 'locked')}
              onToggleExpanded={() => toggleLayer('binaural', 'expanded')}
            />
          </div>

          {/* Scrollable timeline area */}
          <div
            ref={containerRef}
            className="flex-1 overflow-x-auto relative"
            onScroll={handleScroll}
          >
            {/* Time ruler */}
            <TimeRuler
              duration={session.duration}
              zoom={timeline.zoom}
              scrollX={0} // Already scrolled by container
            />

            {/* Layers container */}
            <div className="relative">
              {/* Playhead */}
              <Playhead
                position={timeline.playheadPosition}
                zoom={timeline.zoom}
                scrollX={0}
                isPlaying={timeline.isPlaying}
              />

              {/* Sections layer */}
              <SectionsLayer
                sections={session.sections}
                duration={session.duration}
                zoom={timeline.zoom}
                scrollX={0}
                selectedId={timeline.selectedLayerType === 'sections' ? timeline.selectedItemId : null}
                visible={sectionsLayer.visible}
                locked={sectionsLayer.locked}
                onSelectSection={(id) => selectItem(id, 'sections')}
              />

              {/* Prompts layer */}
              <PromptsLayer
                prompts={session.prompts}
                duration={session.duration}
                zoom={timeline.zoom}
                scrollX={0}
                selectedId={timeline.selectedLayerType === 'prompts' ? timeline.selectedItemId : null}
                visible={promptsLayer.visible}
                locked={promptsLayer.locked}
                onSelectPrompt={(id) => selectItem(id, 'prompts')}
              />

              {/* Ambient layer */}
              <AmbientLayer
                ambients={session.ambients}
                duration={session.duration}
                zoom={timeline.zoom}
                scrollX={0}
                selectedId={timeline.selectedLayerType === 'ambient' ? timeline.selectedItemId : null}
                visible={ambientLayer.visible}
                locked={ambientLayer.locked}
                onSelectAmbient={(id) => selectItem(id, 'ambient')}
              />

              {/* Binaural layer */}
              <BinauralLayer
                binaural={session.binaural}
                duration={session.duration}
                zoom={timeline.zoom}
                scrollX={0}
                isSelected={timeline.selectedLayerType === 'binaural'}
                visible={binauralLayer.visible}
                locked={binauralLayer.locked}
                onSelect={() => selectItem('binaural', 'binaural')}
              />
            </div>

            {/* Scrollable width placeholder */}
            <div style={{ width: session.duration * timeline.zoom, height: 1 }} />
          </div>
        </div>
      </div>
    </DndContext>
  )
}
