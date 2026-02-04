import { MessageSquare, Music, Waves, Trash2, Flag, X } from 'lucide-react'
import { Input, Button, Slider, Select } from '@/components/ui'
import { useBuilderStore, selectSelectedItem } from '../../store/builderStore'
import type { PromptItem, AmbientItem, BinauralConfig, SectionMarker, SectionType } from '@/types/session'
import { binauralPresets, ambientSounds } from '@/types'

const sectionTypes: { id: SectionType; name: string }[] = [
  { id: 'opening', name: 'Opening' },
  { id: 'main', name: 'Main Practice' },
  { id: 'closing', name: 'Closing' },
]

function PromptProperties({ prompt }: { prompt: PromptItem }) {
  const updatePrompt = useBuilderStore((s) => s.updatePrompt)
  const deletePrompt = useBuilderStore((s) => s.deletePrompt)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <MessageSquare className="h-4 w-4 text-primary" />
        <span className="font-semibold text-sm">Prompt</span>
      </div>

      <div className="flex gap-3 items-start">
        <textarea
          className="textarea textarea-bordered textarea-sm flex-1 h-16"
          value={prompt.text}
          placeholder="Enter prompt text..."
          onChange={(e) => updatePrompt(prompt.id, { text: e.target.value })}
        />

        <div className="flex gap-2">
          <Input
            label="Start"
            type="number"
            min={0}
            step={1}
            value={prompt.startTime}
            className="w-20"
            onChange={(e) => updatePrompt(prompt.id, { startTime: Number(e.target.value) })}
          />
          <Input
            label="Duration"
            type="number"
            min={1}
            step={1}
            value={prompt.duration}
            className="w-20"
            onChange={(e) => updatePrompt(prompt.id, { duration: Number(e.target.value) })}
          />
          <div className="w-28">
            <Slider
              label="Rate"
              min={0.5}
              max={2}
              step={0.1}
              value={prompt.voice.rate}
              showValue
              formatValue={(v) => `${v}x`}
              onChange={(e) =>
                updatePrompt(prompt.id, {
                  voice: { ...prompt.voice, rate: Number(e.target.value) },
                })
              }
            />
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="text-error"
          onClick={() => deletePrompt(prompt.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function AmbientProperties({ ambient }: { ambient: AmbientItem }) {
  const updateAmbient = useBuilderStore((s) => s.updateAmbient)
  const deleteAmbient = useBuilderStore((s) => s.deleteAmbient)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Music className="h-4 w-4 text-accent" />
        <span className="font-semibold text-sm">Ambient Sound</span>
      </div>

      <div className="flex gap-3 items-end flex-wrap">
        <Select
          label="Sound"
          value={ambient.soundId}
          className="w-36"
          onChange={(e) => {
            const sound = ambientSounds.find((s) => s.id === e.target.value)
            if (sound) {
              updateAmbient(ambient.id, { soundId: sound.id, name: sound.name })
            }
          }}
        >
          {ambientSounds.map((sound) => (
            <option key={sound.id} value={sound.id}>
              {sound.name}
            </option>
          ))}
        </Select>

        <Input
          label="Start"
          type="number"
          min={0}
          step={1}
          value={ambient.startTime}
          className="w-20"
          onChange={(e) => updateAmbient(ambient.id, { startTime: Number(e.target.value) })}
        />
        <Input
          label="End"
          type="number"
          min={0}
          step={1}
          value={ambient.endTime}
          className="w-20"
          onChange={(e) => updateAmbient(ambient.id, { endTime: Number(e.target.value) })}
        />

        <div className="w-28">
          <Slider
            label="Volume"
            min={0}
            max={1}
            step={0.05}
            value={ambient.volume}
            showValue
            formatValue={(v) => `${Math.round(v * 100)}%`}
            onChange={(e) => updateAmbient(ambient.id, { volume: Number(e.target.value) })}
          />
        </div>

        <Input
          label="Fade In"
          type="number"
          min={0}
          step={1}
          value={ambient.fadeIn}
          className="w-16"
          onChange={(e) => updateAmbient(ambient.id, { fadeIn: Number(e.target.value) })}
        />
        <Input
          label="Fade Out"
          type="number"
          min={0}
          step={1}
          value={ambient.fadeOut}
          className="w-16"
          onChange={(e) => updateAmbient(ambient.id, { fadeOut: Number(e.target.value) })}
        />

        <Button
          variant="ghost"
          size="sm"
          className="text-error"
          onClick={() => deleteAmbient(ambient.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function BinauralProperties({ binaural }: { binaural: BinauralConfig }) {
  const updateBinaural = useBuilderStore((s) => s.updateBinaural)
  const setBinaural = useBuilderStore((s) => s.setBinaural)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Waves className="h-4 w-4 text-info" />
        <span className="font-semibold text-sm">Binaural Beats</span>
      </div>

      <div className="flex gap-3 items-end flex-wrap">
        <Select
          label="Preset"
          value={binaural.preset}
          className="w-44"
          onChange={(e) => {
            const preset = e.target.value as BinauralConfig['preset']
            const presetData = binauralPresets[preset]
            updateBinaural({
              preset,
              baseFrequency: presetData.baseFrequency,
              beatFrequency: presetData.beatFrequency,
            })
          }}
        >
          {Object.entries(binauralPresets).map(([key, data]) => (
            <option key={key} value={key}>
              {key.charAt(0).toUpperCase() + key.slice(1)} ({data.beatFrequency}Hz)
            </option>
          ))}
        </Select>

        <Input
          label="Base Hz"
          type="number"
          min={50}
          max={500}
          step={10}
          value={binaural.baseFrequency}
          className="w-20"
          onChange={(e) => updateBinaural({ baseFrequency: Number(e.target.value), preset: 'custom' })}
        />

        <Input
          label="Beat Hz"
          type="number"
          min={0.5}
          max={40}
          step={0.5}
          value={binaural.beatFrequency}
          className="w-20"
          onChange={(e) => updateBinaural({ beatFrequency: Number(e.target.value), preset: 'custom' })}
        />

        <div className="w-28">
          <Slider
            label="Volume"
            min={0}
            max={1}
            step={0.05}
            value={binaural.volume}
            showValue
            formatValue={(v) => `${Math.round(v * 100)}%`}
            onChange={(e) => updateBinaural({ volume: Number(e.target.value) })}
          />
        </div>

        <Input
          label="Fade In"
          type="number"
          min={0}
          step={1}
          value={binaural.fadeIn}
          className="w-16"
          onChange={(e) => updateBinaural({ fadeIn: Number(e.target.value) })}
        />
        <Input
          label="Fade Out"
          type="number"
          min={0}
          step={1}
          value={binaural.fadeOut}
          className="w-16"
          onChange={(e) => updateBinaural({ fadeOut: Number(e.target.value) })}
        />

        <Button
          variant="ghost"
          size="sm"
          className="text-error"
          onClick={() => setBinaural(null)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

function SectionProperties({ section }: { section: SectionMarker }) {
  const updateSection = useBuilderStore((s) => s.updateSection)
  const deleteSection = useBuilderStore((s) => s.deleteSection)

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Flag className="h-4 w-4 text-success" />
        <span className="font-semibold text-sm">Section</span>
      </div>

      <div className="flex gap-3 items-end flex-wrap">
        <Select
          label="Type"
          value={section.type}
          className="w-36"
          onChange={(e) => updateSection(section.id, { type: e.target.value as SectionType })}
        >
          {sectionTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </Select>

        <Input
          label="Label"
          value={section.label || ''}
          className="w-32"
          onChange={(e) => updateSection(section.id, { label: e.target.value || undefined })}
          placeholder="Optional"
        />

        <Input
          label="Start"
          type="number"
          min={0}
          step={1}
          value={section.startTime}
          className="w-20"
          onChange={(e) => updateSection(section.id, { startTime: Number(e.target.value) })}
        />
        <Input
          label="End"
          type="number"
          min={0}
          step={1}
          value={section.endTime}
          className="w-20"
          onChange={(e) => updateSection(section.id, { endTime: Number(e.target.value) })}
        />

        <Button
          variant="ghost"
          size="sm"
          className="text-error"
          onClick={() => deleteSection(section.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}

export function PropertiesPanel() {
  const selectedItem = useBuilderStore(selectSelectedItem)
  const timeline = useBuilderStore((s) => s.timeline)
  const selectItem = useBuilderStore((s) => s.selectItem)

  if (!selectedItem) {
    return null
  }

  return (
    <div className="bg-base-200 border-t border-base-300 animate-slide-up">
      <div className="flex items-start justify-between p-3 max-h-64 overflow-y-auto">
        <div className="flex-1 overflow-y-auto pr-2">
          {timeline.selectedLayerType === 'prompts' && (
            <PromptProperties prompt={selectedItem as PromptItem} />
          )}
          {timeline.selectedLayerType === 'ambient' && (
            <AmbientProperties ambient={selectedItem as AmbientItem} />
          )}
          {timeline.selectedLayerType === 'binaural' && (
            <BinauralProperties binaural={selectedItem as BinauralConfig} />
          )}
          {timeline.selectedLayerType === 'sections' && (
            <SectionProperties section={selectedItem as SectionMarker} />
          )}
        </div>
        <button
          className="btn btn-ghost btn-sm btn-square"
          onClick={() => selectItem(null, null)}
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}
