import { useState, useRef, useEffect } from 'react'
import { Plus, MessageSquare, Music, Waves, Flag, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useBuilderStore } from '../store/builderStore'
import { defaultVoiceConfig, defaultBinaural, ambientSounds } from '@/types'
import type { PromptItem, AmbientItem, BinauralConfig, SectionMarker } from '@/types/session'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

interface AddItemDropdownProps {
  className?: string
}

export function AddItemDropdown({ className }: AddItemDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const session = useBuilderStore((s) => s.session)
  const timeline = useBuilderStore((s) => s.timeline)
  const addPrompt = useBuilderStore((s) => s.addPrompt)
  const addAmbient = useBuilderStore((s) => s.addAmbient)
  const setBinaural = useBuilderStore((s) => s.setBinaural)
  const addSection = useBuilderStore((s) => s.addSection)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (!session) return null

  const handleAddPrompt = () => {
    const prompt: PromptItem = {
      id: generateId(),
      startTime: timeline.playheadPosition,
      duration: 5,
      text: 'New prompt...',
      voice: defaultVoiceConfig,
    }
    addPrompt(prompt)
    setIsOpen(false)
  }

  const handleAddAmbient = () => {
    const sound = ambientSounds[0]
    const ambient: AmbientItem = {
      id: generateId(),
      soundId: sound.id,
      name: sound.name,
      startTime: timeline.playheadPosition,
      endTime: Math.min(timeline.playheadPosition + 60, session.duration),
      volume: 0.5,
      fadeIn: 3,
      fadeOut: 3,
    }
    addAmbient(ambient)
    setIsOpen(false)
  }

  const handleAddBinaural = () => {
    const binaural: BinauralConfig = {
      ...defaultBinaural,
      startTime: 0,
      endTime: session.duration,
    }
    setBinaural(binaural)
    setIsOpen(false)
  }

  const handleAddSection = (type: 'opening' | 'main' | 'closing') => {
    const section: SectionMarker = {
      id: generateId(),
      type,
      startTime: timeline.playheadPosition,
      endTime: Math.min(timeline.playheadPosition + 60, session.duration),
    }
    addSection(section)
    setIsOpen(false)
  }

  return (
    <div ref={dropdownRef} className={cn('relative', className)}>
      <button
        className="btn btn-primary btn-sm gap-1"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Plus className="h-4 w-4" />
        Add
        <ChevronDown className={cn('h-3 w-3 transition-transform', isOpen && 'rotate-180')} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-56 bg-base-100 rounded-lg shadow-xl border border-base-300 z-50 overflow-hidden animate-slide-up">
          <div className="p-1">
            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-base-200 transition-colors text-left"
              onClick={handleAddPrompt}
            >
              <MessageSquare className="h-4 w-4 text-primary" />
              <div>
                <div className="font-medium text-sm">Voice Prompt</div>
                <div className="text-xs text-base-content/60">Spoken instruction</div>
              </div>
            </button>

            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-base-200 transition-colors text-left"
              onClick={handleAddAmbient}
            >
              <Music className="h-4 w-4 text-accent" />
              <div>
                <div className="font-medium text-sm">Ambient Sound</div>
                <div className="text-xs text-base-content/60">Background audio</div>
              </div>
            </button>

            {!session.binaural && (
              <button
                className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-base-200 transition-colors text-left"
                onClick={handleAddBinaural}
              >
                <Waves className="h-4 w-4 text-info" />
                <div>
                  <div className="font-medium text-sm">Binaural Beats</div>
                  <div className="text-xs text-base-content/60">Brainwave entrainment</div>
                </div>
              </button>
            )}
          </div>

          <div className="border-t border-base-300 p-1">
            <div className="px-3 py-1 text-xs font-medium text-base-content/50 uppercase">
              Sections
            </div>
            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-base-200 transition-colors text-left"
              onClick={() => handleAddSection('opening')}
            >
              <Flag className="h-4 w-4 text-success" />
              <span className="text-sm">Opening</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-base-200 transition-colors text-left"
              onClick={() => handleAddSection('main')}
            >
              <Flag className="h-4 w-4 text-warning" />
              <span className="text-sm">Main Practice</span>
            </button>
            <button
              className="w-full flex items-center gap-3 px-3 py-2 rounded-md hover:bg-base-200 transition-colors text-left"
              onClick={() => handleAddSection('closing')}
            >
              <Flag className="h-4 w-4 text-error" />
              <span className="text-sm">Closing</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
