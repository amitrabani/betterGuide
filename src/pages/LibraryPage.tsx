import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Library, Clock, Play, Edit, Trash2, Plus, Search } from 'lucide-react'
import { Card, CardBody, Button, Modal, ModalActions } from '@/components/ui'
import { getUserSessions, deleteSession } from '@/services/persistence'
import type { Session, Lineage, Intent } from '@/types/session'

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  return `${mins} min`
}

function LibraryPage() {
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLineage, setFilterLineage] = useState<Lineage | ''>('')
  const [filterIntent, setFilterIntent] = useState<Intent | ''>('')
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    setLoading(true)
    try {
      const userSessions = await getUserSessions()
      setSessions(userSessions)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (sessionToDelete) {
      await deleteSession(sessionToDelete.id)
      await loadSessions()
      setDeleteModalOpen(false)
      setSessionToDelete(null)
    }
  }

  const confirmDelete = (session: Session) => {
    setSessionToDelete(session)
    setDeleteModalOpen(true)
  }

  // Filter sessions
  const filteredSessions = sessions.filter(session => {
    const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLineage = !filterLineage || session.lineage === filterLineage
    const matchesIntent = !filterIntent || session.intent === filterIntent
    return matchesSearch && matchesLineage && matchesIntent
  })

  // Sort by most recently updated
  const sortedSessions = [...filteredSessions].sort((a, b) => b.updatedAt - a.updatedAt)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <header className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Library className="text-primary" />
            Library
          </h1>
          <p className="text-base-content/70 mt-2">
            Your custom meditation sessions
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/builder')}>
          <Plus className="h-4 w-4 mr-1" />
          New Session
        </Button>
      </header>

      {/* Search and filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/40" />
          <input
            type="text"
            placeholder="Search sessions..."
            className="input input-bordered w-full pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <select
            className="select select-bordered"
            value={filterLineage}
            onChange={(e) => setFilterLineage(e.target.value as Lineage | '')}
          >
            <option value="">All Lineages</option>
            <option value="zazen">Zazen</option>
            <option value="raja-yoga">Raja Yoga</option>
            <option value="mindfulness">Mindfulness</option>
            <option value="vipassana">Vipassana</option>
          </select>
          <select
            className="select select-bordered"
            value={filterIntent}
            onChange={(e) => setFilterIntent(e.target.value as Intent | '')}
          >
            <option value="">All Intents</option>
            <option value="general">General</option>
            <option value="sleep">Sleep</option>
            <option value="anxiety">Anxiety</option>
            <option value="focus">Focus</option>
            <option value="energy">Energy</option>
          </select>
        </div>
      </div>

      {/* Session list */}
      {sortedSessions.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sortedSessions.map(session => (
            <Card key={session.id} className="hover:shadow-lg transition-shadow">
              <CardBody>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-lg">{session.name}</h3>
                    <p className="text-sm text-base-content/60 capitalize">
                      {session.lineage}
                    </p>
                  </div>
                  <span className="badge badge-ghost">
                    {session.intent}
                  </span>
                </div>

                <div className="flex items-center gap-2 mt-4 text-sm text-base-content/70">
                  <Clock className="h-4 w-4" />
                  {formatDuration(session.duration)}
                  <span className="text-base-content/40 mx-1">·</span>
                  <span>{session.prompts.length} prompts</span>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/player/${session.id}`)}
                  >
                    <Play className="h-4 w-4 mr-1" />
                    Start
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => navigate(`/builder/${session.id}`)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error"
                    onClick={() => confirmDelete(session)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <Library className="h-8 w-8 text-base-content/40" />
          </div>
          {searchQuery || filterLineage || filterIntent ? (
            <>
              <h2 className="text-lg font-semibold mb-2">No matching sessions</h2>
              <p className="text-base-content/60 mb-4">
                Try adjusting your filters
              </p>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('')
                  setFilterLineage('')
                  setFilterIntent('')
                }}
              >
                Clear filters
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-2">No sessions yet</h2>
              <p className="text-base-content/60 mb-4">
                Create your first custom meditation session or customize a canonical one
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="primary" onClick={() => navigate('/builder')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Session
                </Button>
                <Button variant="ghost" onClick={() => navigate('/')}>
                  Browse Explore
                </Button>
              </div>
            </>
          )}
        </div>
      )}

      {/* Delete confirmation modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Session"
      >
        <p className="text-base-content/80">
          Are you sure you want to delete "{sessionToDelete?.name}"? This action cannot be undone.
        </p>
        <ModalActions>
          <Button variant="ghost" onClick={() => setDeleteModalOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" className="bg-error" onClick={handleDelete}>
            Delete
          </Button>
        </ModalActions>
      </Modal>
    </div>
  )
}

export default LibraryPage
