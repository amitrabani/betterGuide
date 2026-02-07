import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Library, Clock, Trash2, Plus, Search, X, AlertCircle, RefreshCw } from 'lucide-react'
import { Card, CardBody, Button, Modal, ModalActions, useToast, Skeleton, CardSkeleton } from '@/components/ui'
import { getUserSessions, deleteSession } from '@/services/persistence'
import type { Session, Lineage, Intent } from '@/types/session'

const lineageLabels: Record<Lineage, string> = {
  'zazen': 'Zazen',
  'raja-yoga': 'Raja Yoga',
  'mindfulness': 'Mindfulness',
  'vipassana': 'Vipassana',
}

const intentLabels: Record<Intent, string> = {
  'general': 'General',
  'sleep': 'Sleep',
  'anxiety': 'Anxiety',
  'focus': 'Focus',
  'energy': 'Energy',
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  return `${mins} min`
}

function FilterChip({
  label,
  onRemove,
}: {
  label: string
  onRemove: () => void
}) {
  return (
    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/15 text-primary text-sm">
      {label}
      <button
        onClick={onRemove}
        className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
      >
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}

function SessionCard({
  session,
  onClick,
  onDelete,
}: {
  session: Session
  onClick: () => void
  onDelete: () => void
}) {
  return (
    <Card
      variant="gradient"
      lineage={session.lineage}
      intent={session.intent}
      className="cursor-pointer"
      onClick={onClick}
    >
      <CardBody>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg text-white">{session.name}</h3>
            <p className="text-sm text-white/50 capitalize">
              {lineageLabels[session.lineage]}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="badge bg-white/10 text-white/70 border-white/10 text-xs">
              {intentLabels[session.intent]}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="text-white/40 hover:text-error"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 text-sm text-white/40">
          <Clock className="h-4 w-4" />
          {formatDuration(session.duration)}
          <span className="text-white/20 mx-1">&middot;</span>
          <span>{session.prompts.length} prompts</span>
        </div>
      </CardBody>
    </Card>
  )
}

function LibraryPage() {
  const navigate = useNavigate()
  const toast = useToast()
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterLineage, setFilterLineage] = useState<Lineage | null>(null)
  const [filterIntent, setFilterIntent] = useState<Intent | null>(null)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [sessionToDelete, setSessionToDelete] = useState<Session | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  useEffect(() => {
    loadSessions()
  }, [])

  const loadSessions = async () => {
    setLoading(true)
    setError(null)
    try {
      const userSessions = await getUserSessions()
      setSessions(userSessions)
    } catch (err) {
      console.error('Failed to load sessions:', err)
      setError('Failed to load your sessions')
      toast.error('Failed to load sessions')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!sessionToDelete) return

    setIsDeleting(true)
    try {
      await deleteSession(sessionToDelete.id)
      await loadSessions()
      toast.success('Session deleted')
      setDeleteModalOpen(false)
      setSessionToDelete(null)
    } catch (err) {
      console.error('Failed to delete session:', err)
      toast.error('Failed to delete session')
    } finally {
      setIsDeleting(false)
    }
  }

  const confirmDelete = (session: Session) => {
    setSessionToDelete(session)
    setDeleteModalOpen(true)
  }

  // Filter sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter(session => {
      const matchesSearch = session.name.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesLineage = !filterLineage || session.lineage === filterLineage
      const matchesIntent = !filterIntent || session.intent === filterIntent
      return matchesSearch && matchesLineage && matchesIntent
    })
  }, [sessions, searchQuery, filterLineage, filterIntent])

  // Group sessions by lineage
  const sessionsByLineage = useMemo(() => {
    const sorted = [...filteredSessions].sort((a, b) => b.updatedAt - a.updatedAt)
    const grouped: Record<string, Session[]> = {}

    for (const session of sorted) {
      const lineage = session.lineage
      if (!grouped[lineage]) {
        grouped[lineage] = []
      }
      grouped[lineage].push(session)
    }

    return grouped
  }, [filteredSessions])

  // Get unique lineages and intents from user's sessions for filter options
  const availableLineages = useMemo(() => {
    const lineages = new Set(sessions.map(s => s.lineage))
    return Array.from(lineages) as Lineage[]
  }, [sessions])

  const availableIntents = useMemo(() => {
    const intents = new Set(sessions.map(s => s.intent))
    return Array.from(intents) as Intent[]
  }, [sessions])

  const hasActiveFilters = filterLineage || filterIntent || searchQuery

  if (loading) {
    return (
      <div className="min-h-screen p-6 lg:p-8 animate-page-enter">
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Skeleton className="h-9 w-36 mb-3" />
            <Skeleton className="h-5 w-52" />
          </div>
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
        <Skeleton className="h-10 w-full max-w-md mb-4 rounded-lg" />
        <div className="flex gap-2 mb-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-8 w-24 rounded-full" />
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Failed to load sessions</h2>
          <p className="text-base-content/60 mb-4">{error}</p>
          <Button variant="primary" onClick={loadSessions}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6 lg:p-8 animate-page-enter">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2 tracking-tight">
            <Library className="text-primary" />
            Library
          </h1>
          <p className="text-base-content/50 mt-2">
            Your custom meditation sessions
          </p>
        </div>
        <Button variant="primary" onClick={() => navigate('/builder')} className="rounded-xl">
          <Plus className="h-4 w-4 mr-1" />
          New Guide
        </Button>
      </header>

      {/* Search */}
      <div className="mb-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-base-content/30" />
          <input
            type="text"
            placeholder="Search sessions..."
            className="input w-full pl-10 bg-base-300/30 border-white/10 focus:border-primary/50 placeholder:text-base-content/30"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter buttons — pill style */}
      {sessions.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-6">
          {/* Lineage filters */}
          {availableLineages.map(lineage => (
            <button
              key={lineage}
              onClick={() => setFilterLineage(filterLineage === lineage ? null : lineage)}
              className={`pill-interactive px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filterLineage === lineage
                  ? 'bg-primary text-primary-content shadow-glow-primary'
                  : 'bg-base-200 text-base-content/50 hover:text-base-content/70 hover:bg-base-300'
              }`}
            >
              {lineageLabels[lineage]}
              {filterLineage === lineage && (
                <X className="inline-block h-3 w-3 ml-1.5 -mr-0.5" />
              )}
            </button>
          ))}

          {availableLineages.length > 0 && availableIntents.length > 0 && (
            <div className="w-px h-6 bg-white/10 self-center mx-1" />
          )}

          {/* Intent filters */}
          {availableIntents.map(intent => (
            <button
              key={intent}
              onClick={() => setFilterIntent(filterIntent === intent ? null : intent)}
              className={`pill-interactive px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                filterIntent === intent
                  ? 'bg-primary text-primary-content shadow-glow-primary'
                  : 'bg-base-200 text-base-content/50 hover:text-base-content/70 hover:bg-base-300'
              }`}
            >
              {intentLabels[intent]}
              {filterIntent === intent && (
                <X className="inline-block h-3 w-3 ml-1.5 -mr-0.5" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Active filters display */}
      {hasActiveFilters && (
        <div className="flex items-center gap-2 mb-6">
          <span className="text-sm text-base-content/40">Filtering by:</span>
          {searchQuery && (
            <FilterChip
              label={`"${searchQuery}"`}
              onRemove={() => setSearchQuery('')}
            />
          )}
          {filterLineage && (
            <FilterChip
              label={lineageLabels[filterLineage]}
              onRemove={() => setFilterLineage(null)}
            />
          )}
          {filterIntent && (
            <FilterChip
              label={intentLabels[filterIntent]}
              onRemove={() => setFilterIntent(null)}
            />
          )}
          <button
            onClick={() => {
              setSearchQuery('')
              setFilterLineage(null)
              setFilterIntent(null)
            }}
            className="text-sm text-base-content/40 hover:text-base-content underline ml-2"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Session list grouped by lineage */}
      {filteredSessions.length > 0 ? (
        <div className="space-y-8">
          {Object.entries(sessionsByLineage).map(([lineage, lineageSessions]) => (
            <section key={lineage}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 tracking-tight">
                <span className="capitalize">{lineageLabels[lineage as Lineage]}</span>
                <span className="text-sm font-normal text-base-content/30">
                  ({lineageSessions.length})
                </span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
                {lineageSessions.map(session => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    onClick={() => navigate(`/player/${session.id}`)}
                    onDelete={() => confirmDelete(session)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
            <Library className="h-8 w-8 text-base-content/30" />
          </div>
          {hasActiveFilters ? (
            <>
              <h2 className="text-lg font-semibold mb-2">No matching sessions</h2>
              <p className="text-base-content/40 mb-4">
                Try adjusting your filters
              </p>
              <Button
                variant="ghost"
                onClick={() => {
                  setSearchQuery('')
                  setFilterLineage(null)
                  setFilterIntent(null)
                }}
              >
                Clear filters
              </Button>
            </>
          ) : (
            <>
              <h2 className="text-lg font-semibold mb-2">No sessions yet</h2>
              <p className="text-base-content/40 mb-4">
                Create your first custom meditation session or customize a canonical one
              </p>
              <div className="flex gap-2 justify-center">
                <Button variant="primary" onClick={() => navigate('/builder')}>
                  <Plus className="h-4 w-4 mr-1" />
                  Create Guide
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
        onClose={() => !isDeleting && setDeleteModalOpen(false)}
        title="Delete Session"
      >
        <p className="text-base-content/70">
          Are you sure you want to delete "{sessionToDelete?.name}"? This action cannot be undone.
        </p>
        <ModalActions>
          <Button
            variant="ghost"
            onClick={() => setDeleteModalOpen(false)}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            className="bg-error"
            onClick={handleDelete}
            loading={isDeleting}
            disabled={isDeleting}
          >
            Delete
          </Button>
        </ModalActions>
      </Modal>
    </div>
  )
}

export default LibraryPage
