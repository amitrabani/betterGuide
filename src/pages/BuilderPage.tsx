import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PenTool, Save, Play, Settings } from 'lucide-react'
import { Button, Input, Select, Modal, ModalActions } from '@/components/ui'
import { Timeline, TransportControls, PropertiesPanel, AddItemPanel } from '@/features/builder'
import { useBuilderStore } from '@/features/builder'
import { getSession, saveSession } from '@/services/persistence'
import type { Lineage } from '@/types/session'

const lineages: { id: Lineage; name: string }[] = [
  { id: 'zazen', name: 'Zazen' },
  { id: 'raja-yoga', name: 'Raja Yoga' },
  { id: 'mindfulness', name: 'Mindfulness' },
  { id: 'vipassana', name: 'Vipassana' },
]

function NewSessionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState('New Session')
  const [lineage, setLineage] = useState<Lineage>('mindfulness')
  const [duration, setDuration] = useState(300)
  const createNewSession = useBuilderStore((s) => s.createNewSession)

  const handleCreate = () => {
    createNewSession(name, lineage, duration)
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Session">
      <div className="space-y-4">
        <Input
          label="Session Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Select
          label="Meditation Lineage"
          value={lineage}
          onChange={(e) => setLineage(e.target.value as Lineage)}
        >
          {lineages.map((l) => (
            <option key={l.id} value={l.id}>
              {l.name}
            </option>
          ))}
        </Select>

        <Input
          label="Duration (seconds)"
          type="number"
          min={60}
          max={3600}
          step={60}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />
      </div>

      <ModalActions>
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleCreate}>
          Create
        </Button>
      </ModalActions>
    </Modal>
  )
}

function BuilderPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const [showNewModal, setShowNewModal] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const session = useBuilderStore((s) => s.session)
  const isDirty = useBuilderStore((s) => s.isDirty)
  const setSession = useBuilderStore((s) => s.setSession)

  // Load session if editing
  useEffect(() => {
    if (sessionId) {
      getSession(sessionId).then((loaded) => {
        if (loaded) {
          setSession(loaded)
        }
      })
    } else if (!session) {
      // Show new session modal if no session is loaded
      setShowNewModal(true)
    }
  }, [sessionId, setSession])

  const handleSave = async () => {
    if (!session) return

    setIsSaving(true)
    try {
      await saveSession(session)
      useBuilderStore.setState({ isDirty: false })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePreview = () => {
    if (session) {
      // Save first, then navigate to player
      handleSave().then(() => {
        navigate(`/player/${session.id}`)
      })
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-base-200 border-b border-base-300 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <PenTool className="text-primary h-5 w-5" />
            <div>
              <h1 className="text-lg font-bold">
                {session?.name || 'Session Builder'}
              </h1>
              {session && (
                <p className="text-xs text-base-content/60 capitalize">
                  {session.lineage} · {Math.floor(session.duration / 60)} min
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePreview}
              disabled={!session}
            >
              <Play className="h-4 w-4 mr-1" />
              Preview
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSave}
              loading={isSaving}
              disabled={!session || !isDirty}
            >
              <Save className="h-4 w-4 mr-1" />
              Save
            </Button>
          </div>
        </div>
      </header>

      {/* Main builder area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left panel - Add items */}
        <aside className="w-56 bg-base-200 border-r border-base-300 overflow-y-auto hidden md:block">
          <AddItemPanel />
        </aside>

        {/* Timeline area */}
        <main className="flex-1 flex flex-col min-w-0 bg-base-100">
          {session ? (
            <>
              <div className="flex-1 p-4 overflow-auto">
                <Timeline className="h-full min-h-[300px]" />
              </div>
              <TransportControls />
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <PenTool className="h-12 w-12 text-base-content/30 mx-auto mb-4" />
                <p className="text-base-content/60 mb-4">No session loaded</p>
                <Button variant="primary" onClick={() => setShowNewModal(true)}>
                  Create New Session
                </Button>
              </div>
            </div>
          )}
        </main>

        {/* Right panel - Properties */}
        <aside className="w-80 bg-base-200 border-l border-base-300 overflow-y-auto hidden lg:block">
          <div className="p-3 border-b border-base-300">
            <h2 className="font-semibold flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Properties
            </h2>
          </div>
          <PropertiesPanel />
        </aside>
      </div>

      {/* New session modal */}
      <NewSessionModal
        isOpen={showNewModal}
        onClose={() => setShowNewModal(false)}
      />
    </div>
  )
}

export default BuilderPage
