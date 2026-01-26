import { MessageSquare, Music, Waves, Flag } from 'lucide-react'
import { Button } from '@/components/ui'
import { useBuilderStore } from '../../store/builderStore'
import { defaultVoiceConfig, defaultBinaural, ambientSounds } from '@/types'
import type { PromptItem, AmbientItem, BinauralConfig, SectionMarker } from '@/types/session'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export function AddItemPanel() {
  const session = useBuilderStore((s) => s.session)
  const timeline = useBuilderStore((s) => s.timeline)
  const addPrompt = useBuilderStore((s) => s.addPrompt)
  const addAmbient = useBuilderStore((s) => s.addAmbient)
  const setBinaural = useBuilderStore((s) => s.setBinaural)
  const addSection = useBuilderStore((s) => s.addSection)

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
  }

  const handleAddBinaural = () => {
    const binaural: BinauralConfig = {
      ...defaultBinaural,
      startTime: 0,
      endTime: session.duration,
    }
    setBinaural(binaural)
  }

  const handleAddSection = (type: 'opening' | 'main' | 'closing') => {
    const section: SectionMarker = {
      id: generateId(),
      type,
      startTime: timeline.playheadPosition,
      endTime: Math.min(timeline.playheadPosition + 60, session.duration),
    }
    addSection(section)
  }

  return (
    <div className="p-4">
      <h3 className="font-semibold mb-4">Add to Timeline</h3>

      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={handleAddPrompt}
        >
          <MessageSquare className="h-4 w-4 mr-2 text-primary" />
          Add Prompt
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={handleAddAmbient}
        >
          <Music className="h-4 w-4 mr-2 text-accent" />
          Add Ambient Sound
        </Button>

        {!session.binaural && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={handleAddBinaural}
          >
            <Waves className="h-4 w-4 mr-2 text-info" />
            Add Binaural Beats
          </Button>
        )}
      </div>

      <div className="divider my-4">Sections</div>

      <div className="space-y-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => handleAddSection('opening')}
        >
          <Flag className="h-4 w-4 mr-2 text-success" />
          Add Opening
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => handleAddSection('main')}
        >
          <Flag className="h-4 w-4 mr-2 text-warning" />
          Add Main Practice
        </Button>

        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start"
          onClick={() => handleAddSection('closing')}
        >
          <Flag className="h-4 w-4 mr-2 text-error" />
          Add Closing
        </Button>
      </div>

      <div className="mt-6 text-xs text-base-content/60">
        <p>Tip: Press + / - to zoom the timeline</p>
        <p>Drag items to reposition them</p>
      </div>
    </div>
  )
}
