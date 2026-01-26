import { MessageSquare, Music, Waves, Trash2, Flag } from 'lucide-react'
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
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-base-300">
        <MessageSquare className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Prompt</h3>
      </div>

      <div className="form-control">
        <label className="label">
          <span className="label-text">Text</span>
        </label>
        <textarea
          className="textarea textarea-bordered h-24"
          value={prompt.text}
          onChange={(e) => updatePrompt(prompt.id, { text: e.target.value })}
        />
      </div>

      <Input
        label="Start Time"
        type="number"
        min={0}
        step={1}
        value={prompt.startTime}
        onChange={(e) => updatePrompt(prompt.id, { startTime: Number(e.target.value) })}
      />

      <Input
        label="Duration (seconds)"
        type="number"
        min={1}
        step={1}
        value={prompt.duration}
        onChange={(e) => updatePrompt(prompt.id, { duration: Number(e.target.value) })}
      />

      <Slider
        label="Speech Rate"
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

      <Button
        variant="outline"
        size="sm"
        className="w-full text-error"
        onClick={() => deletePrompt(prompt.id)}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete Prompt
      </Button>
    </div>
  )
}

function AmbientProperties({ ambient }: { ambient: AmbientItem }) {
  const updateAmbient = useBuilderStore((s) => s.updateAmbient)
  const deleteAmbient = useBuilderStore((s) => s.deleteAmbient)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-base-300">
        <Music className="h-5 w-5 text-accent" />
        <h3 className="font-semibold">Ambient Sound</h3>
      </div>

      <Select
        label="Sound"
        value={ambient.soundId}
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

      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Start"
          type="number"
          min={0}
          step={1}
          value={ambient.startTime}
          onChange={(e) => updateAmbient(ambient.id, { startTime: Number(e.target.value) })}
        />
        <Input
          label="End"
          type="number"
          min={0}
          step={1}
          value={ambient.endTime}
          onChange={(e) => updateAmbient(ambient.id, { endTime: Number(e.target.value) })}
        />
      </div>

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

      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Fade In (s)"
          type="number"
          min={0}
          step={1}
          value={ambient.fadeIn}
          onChange={(e) => updateAmbient(ambient.id, { fadeIn: Number(e.target.value) })}
        />
        <Input
          label="Fade Out (s)"
          type="number"
          min={0}
          step={1}
          value={ambient.fadeOut}
          onChange={(e) => updateAmbient(ambient.id, { fadeOut: Number(e.target.value) })}
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full text-error"
        onClick={() => deleteAmbient(ambient.id)}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete Ambient
      </Button>
    </div>
  )
}

function BinauralProperties({ binaural }: { binaural: BinauralConfig }) {
  const updateBinaural = useBuilderStore((s) => s.updateBinaural)
  const setBinaural = useBuilderStore((s) => s.setBinaural)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-base-300">
        <Waves className="h-5 w-5 text-info" />
        <h3 className="font-semibold">Binaural Beats</h3>
      </div>

      <Select
        label="Preset"
        value={binaural.preset}
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
            {key.charAt(0).toUpperCase() + key.slice(1)} - {data.description}
          </option>
        ))}
      </Select>

      <Input
        label="Base Frequency (Hz)"
        type="number"
        min={50}
        max={500}
        step={10}
        value={binaural.baseFrequency}
        onChange={(e) => updateBinaural({ baseFrequency: Number(e.target.value), preset: 'custom' })}
      />

      <Input
        label="Beat Frequency (Hz)"
        type="number"
        min={0.5}
        max={40}
        step={0.5}
        value={binaural.beatFrequency}
        onChange={(e) => updateBinaural({ beatFrequency: Number(e.target.value), preset: 'custom' })}
      />

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

      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Fade In (s)"
          type="number"
          min={0}
          step={1}
          value={binaural.fadeIn}
          onChange={(e) => updateBinaural({ fadeIn: Number(e.target.value) })}
        />
        <Input
          label="Fade Out (s)"
          type="number"
          min={0}
          step={1}
          value={binaural.fadeOut}
          onChange={(e) => updateBinaural({ fadeOut: Number(e.target.value) })}
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full text-error"
        onClick={() => setBinaural(null)}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Remove Binaural
      </Button>
    </div>
  )
}

function SectionProperties({ section }: { section: SectionMarker }) {
  const updateSection = useBuilderStore((s) => s.updateSection)
  const deleteSection = useBuilderStore((s) => s.deleteSection)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 pb-2 border-b border-base-300">
        <Flag className="h-5 w-5 text-success" />
        <h3 className="font-semibold">Section</h3>
      </div>

      <Select
        label="Section Type"
        value={section.type}
        onChange={(e) => updateSection(section.id, { type: e.target.value as SectionType })}
      >
        {sectionTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {type.name}
          </option>
        ))}
      </Select>

      <Input
        label="Custom Label (optional)"
        value={section.label || ''}
        onChange={(e) => updateSection(section.id, { label: e.target.value || undefined })}
        placeholder="e.g., Body Scan"
      />

      <div className="grid grid-cols-2 gap-2">
        <Input
          label="Start Time"
          type="number"
          min={0}
          step={1}
          value={section.startTime}
          onChange={(e) => updateSection(section.id, { startTime: Number(e.target.value) })}
        />
        <Input
          label="End Time"
          type="number"
          min={0}
          step={1}
          value={section.endTime}
          onChange={(e) => updateSection(section.id, { endTime: Number(e.target.value) })}
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full text-error"
        onClick={() => deleteSection(section.id)}
      >
        <Trash2 className="h-4 w-4 mr-1" />
        Delete Section
      </Button>
    </div>
  )
}

export function PropertiesPanel() {
  const selectedItem = useBuilderStore(selectSelectedItem)
  const timeline = useBuilderStore((s) => s.timeline)

  if (!selectedItem) {
    return (
      <div className="p-4 text-center text-base-content/60">
        <p className="text-sm">Select an item on the timeline to edit its properties.</p>
      </div>
    )
  }

  return (
    <div className="p-4 overflow-y-auto">
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
  )
}
