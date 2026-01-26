import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Compass, Clock, Play, Copy } from 'lucide-react'
import { Card, CardBody, Button } from '@/components/ui'
import { canonicalSessions } from '@/data'
import { saveSession, duplicateSession } from '@/services/persistence'
import type { Lineage, Session } from '@/types'

const lineages: { id: Lineage; name: string; description: string }[] = [
  { id: 'zazen', name: 'Zazen', description: 'Zen sitting meditation focusing on posture and breath' },
  { id: 'raja-yoga', name: 'Raja Yoga', description: 'Classical yoga meditation with systematic approach' },
  { id: 'mindfulness', name: 'Mindfulness', description: 'Present-moment awareness practice' },
  { id: 'vipassana', name: 'Vipassana', description: 'Insight meditation observing sensations' },
]

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  return `${mins} min`
}

function ExplorePage() {
  const navigate = useNavigate()
  const [selectedLineage, setSelectedLineage] = useState<Lineage | null>(null)

  const filteredSessions = selectedLineage
    ? canonicalSessions.filter(s => s.lineage === selectedLineage)
    : canonicalSessions

  const handleCustomize = async (session: Session) => {
    // Create a user copy of the canonical session
    const userCopy = duplicateSession(session, `${session.name} (My Version)`)
    await saveSession(userCopy)
    navigate(`/builder/${userCopy.id}`)
  }

  return (
    <div className="min-h-screen p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Compass className="text-primary" />
          Explore
        </h1>
        <p className="text-base-content/70 mt-2">
          Discover meditation practices from different traditions
        </p>
      </header>

      {/* Lineage tabs */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <Button
          variant={selectedLineage === null ? 'primary' : 'ghost'}
          size="sm"
          onClick={() => setSelectedLineage(null)}
        >
          All
        </Button>
        {lineages.map(lineage => (
          <Button
            key={lineage.id}
            variant={selectedLineage === lineage.id ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedLineage(lineage.id)}
          >
            {lineage.name}
          </Button>
        ))}
      </div>

      {/* Session cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSessions.map(session => (
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

              {session.description && (
                <p className="text-sm text-base-content/70 mt-2 line-clamp-2">
                  {session.description}
                </p>
              )}

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
                  onClick={() => handleCustomize(session)}
                  title="Create your own version"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredSessions.length === 0 && (
        <div className="text-center py-12">
          <p className="text-base-content/60">No sessions found for this lineage</p>
        </div>
      )}
    </div>
  )
}

export default ExplorePage
