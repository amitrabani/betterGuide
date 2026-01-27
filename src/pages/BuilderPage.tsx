import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { PenTool, Save, Play, AlertCircle } from 'lucide-react'
import { Button, Input, Select, Modal, ModalActions, useToast } from '@/components/ui'
import { Timeline, TransportControls, PropertiesPanel } from '@/features/builder'
import { useBuilderStore } from '@/features/builder'
import { getSession, saveSession } from '@/services/persistence'
import type { Lineage } from '@/types/session'

const lineages: { id: Lineage; name: string }[] = [
  { id: 'zazen', name: 'Zazen' },
  { id: 'raja-yoga', name: 'Raja Yoga' },
  { id: 'mindfulness', name: 'Mindfulness' },
  { id: 'vipassana', name: 'Vipassana' },
]

interface ValidationErrors {
  name?: string
  duration?: string
}

function NewSessionModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [name, setName] = useState('New Session')
  const [lineage, setLineage] = useState<Lineage>('mindfulness')
  const [duration, setDuration] = useState(300)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const createNewSession = useBuilderStore((s) => s.createNewSession)

  const validate = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!name.trim()) {
      newErrors.name = 'Session name is required'
    } else if (name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    } else if (name.trim().length > 100) {
      newErrors.name = 'Name must be less than 100 characters'
    }

    if (duration < 60) {
      newErrors.duration = 'Duration must be at least 60 seconds'
    } else if (duration > 3600) {
      newErrors.duration = 'Duration must be less than 60 minutes'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCreate = () => {
    if (!validate()) return
    createNewSession(name.trim(), lineage, duration)
    onClose()
  }

  const handleClose = () => {
    setErrors({})
    onClose()
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Create New Session">
      <div className="space-y-4">
        <Input
          label="Session Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value)
            if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }))
          }}
          error={errors.name}
          placeholder="e.g., Morning Calm"
          maxLength={100}
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
          onChange={(e) => {
            setDuration(Number(e.target.value))
            if (errors.duration) setErrors((prev) => ({ ...prev, duration: undefined }))
          }}
          error={errors.duration}
        />
        <p className="text-xs text-base-content/50 -mt-2">
          {Math.floor(duration / 60)} minutes
        </p>
      </div>

      <ModalActions>
        <Button variant="ghost" onClick={handleClose}>
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
  const [isLoading, setIsLoading] = useState(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const toast = useToast()

  const session = useBuilderStore((s) => s.session)
  const isDirty = useBuilderStore((s) => s.isDirty)
  const setSession = useBuilderStore((s) => s.setSession)

  // Load session if editing
  useEffect(() => {
    if (sessionId) {
      setIsLoading(true)
      setLoadError(null)
      getSession(sessionId)
        .then((loaded) => {
          if (loaded) {
            setSession(loaded)
          } else {
            setLoadError('Session not found')
            toast.error('Session not found')
          }
        })
        .catch((err) => {
          console.error('Failed to load session:', err)
          setLoadError('Failed to load session')
          toast.error('Failed to load session')
        })
        .finally(() => {
          setIsLoading(false)
        })
    } else if (!session) {
      // Show new session modal if no session is loaded
      setShowNewModal(true)
    }
  }, [sessionId, setSession, toast])

  const handleSave = async () => {
    if (!session) return

    setIsSaving(true)
    try {
      await saveSession(session)
      useBuilderStore.setState({ isDirty: false })
      toast.success('Session saved')
    } catch (err) {
      console.error('Failed to save session:', err)
      toast.error('Failed to save session. Please try again.')
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

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  // Show error state
  if (loadError && !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <p className="text-base-content/60 mb-4">{loadError}</p>
          <Button variant="primary" onClick={() => navigate('/library')}>
            Go to Library
          </Button>
        </div>
      </div>
    )
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
      </header>

      {/* Main builder area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {session ? (
          <>
            {/* Timeline area */}
            <div className="flex-1 p-4 overflow-auto">
              <Timeline className="h-full min-h-[280px]" />
            </div>

            {/* Properties panel - slides up when item selected */}
            <PropertiesPanel />

            {/* Mode toggle */}
            <div className="flex justify-center py-3 border-t border-base-200">
              <div className="inline-flex items-center gap-1 p-1 bg-base-300/50 rounded-full">
                <button
                  onClick={handlePreview}
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-base-content/60 hover:text-base-content hover:bg-base-200 transition-colors"
                >
                  <Play className="h-4 w-4" />
                  Play
                </button>
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium bg-primary text-primary-content shadow-sm"
                >
                  <PenTool className="h-4 w-4" />
                  Edit
                </button>
              </div>
            </div>

            {/* Transport controls */}
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
