import { useState, useMemo, useEffect, useCallback } from 'react'
import { Search } from 'lucide-react'
import { Modal, ModalActions, Button } from '@/components/ui'
import { VoiceCard } from './VoiceCard'
import { deepgramVoices } from '@/services/tts/deepgramVoices'
import { useTTSPreview } from '@/services/tts/useTTSPreview'
import type { SessionVoice } from '@/types/voice'

type GenderFilter = 'all' | 'female' | 'male'

interface VoicePickerModalProps {
  isOpen: boolean
  onClose: () => void
  currentVoice?: SessionVoice
  onSelect: (voice: SessionVoice) => void
}

function VoicePickerContent({
  currentVoice,
  onClose,
  onSelect,
}: Omit<VoicePickerModalProps, 'isOpen'>) {
  const initialId = currentVoice?.type === 'deepgram' ? currentVoice.voiceId : null
  const [gender, setGender] = useState<GenderFilter>('all')
  const [recommendedOnly, setRecommendedOnly] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(initialId)

  const { isLoading, isPlaying, activeVoiceId, preview, stop, cleanup } =
    useTTSPreview()

  // Cleanup preview audio on unmount
  useEffect(() => cleanup, [cleanup])

  const filtered = useMemo(() => {
    return deepgramVoices.filter((v) => {
      if (gender !== 'all' && v.gender !== gender) return false
      if (recommendedOnly && !v.recommended) return false
      if (search) {
        const q = search.toLowerCase()
        return (
          v.name.toLowerCase().includes(q) ||
          v.traits.toLowerCase().includes(q)
        )
      }
      return true
    })
  }, [gender, recommendedOnly, search])

  const handleSelect = useCallback(() => {
    if (!selectedId) return
    const voice = deepgramVoices.find((v) => v.id === selectedId)
    if (!voice) return
    onSelect({ type: 'deepgram', voiceId: voice.id, modelName: voice.id })
    onClose()
  }, [selectedId, onSelect, onClose])

  const handleUseBrowser = useCallback(() => {
    onSelect({ type: 'browser' })
    onClose()
  }, [onSelect, onClose])

  return (
    <div className="modal-box max-w-4xl w-full !max-h-[80vh]">
      <h3 className="font-bold text-lg mb-4">Choose Voice</h3>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        {/* Gender tabs */}
        <div className="tabs tabs-box tabs-sm">
          {(['all', 'female', 'male'] as const).map((g) => (
            <button
              key={g}
              className={`tab ${gender === g ? 'tab-active' : ''}`}
              onClick={() => setGender(g)}
            >
              {g === 'all' ? 'All' : g === 'female' ? 'Female' : 'Male'}
            </button>
          ))}
        </div>

        {/* Recommended toggle */}
        <label className="label cursor-pointer gap-2">
          <span className="label-text text-sm">Recommended</span>
          <input
            type="checkbox"
            className="toggle toggle-primary toggle-sm"
            checked={recommendedOnly}
            onChange={(e) => setRecommendedOnly(e.target.checked)}
          />
        </label>

        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Search voices..."
            className="input input-sm input-bordered w-full pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Voice grid */}
      <div className="overflow-y-auto max-h-[45vh] pr-1">
        {filtered.length === 0 ? (
          <p className="text-center text-base-content/50 py-8">
            No voices match your filters.
          </p>
        ) : (
          <div className="flex flex-col gap-1">
            {filtered.map((voice) => (
              <VoiceCard
                key={voice.id}
                voice={voice}
                isSelected={selectedId === voice.id}
                isPlaying={isPlaying && activeVoiceId === voice.id}
                isLoading={isLoading && activeVoiceId === voice.id}
                onSelect={() => setSelectedId(voice.id)}
                onPreview={() => preview(voice.id)}
                onStopPreview={stop}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <ModalActions>
        <Button variant="ghost" size="sm" onClick={handleUseBrowser}>
          Use Browser Voice
        </Button>
        <div className="flex-1" />
        <Button variant="ghost" size="sm" onClick={onClose}>
          Cancel
        </Button>
        <Button
          variant="primary"
          size="sm"
          onClick={handleSelect}
          disabled={!selectedId}
        >
          Select Voice
        </Button>
      </ModalActions>
    </div>
  )
}

export function VoicePickerModal({
  isOpen,
  onClose,
  currentVoice,
  onSelect,
}: VoicePickerModalProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="modal-bottom sm:modal-middle">
      {isOpen && (
        <VoicePickerContent
          currentVoice={currentVoice}
          onClose={onClose}
          onSelect={onSelect}
        />
      )}
    </Modal>
  )
}
