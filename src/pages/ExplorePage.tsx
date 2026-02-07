import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Clock, Plus, Compass } from 'lucide-react'
import { Card, CardBody, Button } from '@/components/ui'
import { canonicalSessions } from '@/data'
import type { Lineage } from '@/types'

const lineages: { id: Lineage; name: string }[] = [
  { id: 'zazen', name: 'Zazen' },
  { id: 'raja-yoga', name: 'Raja Yoga' },
  { id: 'mindfulness', name: 'Mindfulness' },
  { id: 'vipassana', name: 'Vipassana' },
]

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  return `${mins} min`
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}

function ExplorePage() {
  const navigate = useNavigate()
  const [selectedLineage, setSelectedLineage] = useState<Lineage | null>(null)

  const filteredSessions = selectedLineage
    ? canonicalSessions.filter(s => s.lineage === selectedLineage)
    : canonicalSessions

  const featuredSession = filteredSessions[0]
  const remainingSessions = filteredSessions.slice(1)

  const handleCreate = () => {
    navigate('/builder')
  }

  return (
    <div className="min-h-screen p-6 lg:p-8 animate-page-enter">
      {/* Greeting header */}
      <header className="mb-10 flex items-start justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-bold text-base-content tracking-tight">
            {getGreeting()}
          </h1>
          <p className="text-base-content/50 mt-2 text-lg">
            Find your practice
          </p>
        </div>
        <Button variant="primary" onClick={handleCreate} className="rounded-xl">
          <Plus className="h-4 w-4 mr-1" />
          Create
        </Button>
      </header>

      {/* Pill-style filter buttons */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedLineage(null)}
          className={`pill-interactive px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
            selectedLineage === null
              ? 'bg-primary text-primary-content shadow-glow-primary'
              : 'bg-base-200 text-base-content/50 hover:text-base-content/70 hover:bg-base-300'
          }`}
        >
          All
        </button>
        {lineages.map(lineage => (
          <button
            key={lineage.id}
            onClick={() => setSelectedLineage(lineage.id)}
            className={`pill-interactive px-5 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
              selectedLineage === lineage.id
                ? 'bg-primary text-primary-content shadow-glow-primary'
                : 'bg-base-200 text-base-content/50 hover:text-base-content/70 hover:bg-base-300'
            }`}
          >
            {lineage.name}
          </button>
        ))}
      </div>

      {/* Featured hero card */}
      {featuredSession && (
        <Card
          variant="featured"
          lineage={featuredSession.lineage}
          intent={featuredSession.intent}
          className="mb-8 cursor-pointer animate-fade-scale-in"
          onClick={() => navigate(`/player/${featuredSession.id}`)}
        >
          <CardBody className="p-8">
            <span className="text-xs font-semibold uppercase tracking-wider text-white/60 mb-2 block">
              Featured
            </span>
            <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2">
              {featuredSession.name}
            </h2>
            <p className="text-white/60 capitalize mb-1">
              {featuredSession.lineage}
            </p>
            {featuredSession.description && (
              <p className="text-white/50 text-sm mt-3 line-clamp-2 max-w-lg">
                {featuredSession.description}
              </p>
            )}
            <div className="flex items-center gap-2 mt-6 text-sm text-white/50">
              <Clock className="h-4 w-4" />
              {formatDuration(featuredSession.duration)}
              <span className="text-white/30 mx-1">&middot;</span>
              <span>{featuredSession.prompts.length} prompts</span>
            </div>
          </CardBody>
        </Card>
      )}

      {/* Session cards grid with staggered entrance */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 stagger-children">
        {remainingSessions.map((session) => (
          <Card
            key={session.id}
            variant="gradient"
            lineage={session.lineage}
            intent={session.intent}
            className="cursor-pointer animate-fade-scale-in"
            onClick={() => navigate(`/player/${session.id}`)}
          >
            <CardBody>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg text-white">{session.name}</h3>
                  <p className="text-sm text-white/50 capitalize">
                    {session.lineage}
                  </p>
                </div>
                <span className="badge bg-white/10 text-white/70 border-white/10 text-xs">
                  {session.intent}
                </span>
              </div>

              {session.description && (
                <p className="text-sm text-white/40 mt-2 line-clamp-2">
                  {session.description}
                </p>
              )}

              <div className="flex items-center gap-2 mt-4 text-sm text-white/40">
                <Clock className="h-4 w-4" />
                {formatDuration(session.duration)}
                <span className="text-white/20 mx-1">&middot;</span>
                <span>{session.prompts.length} prompts</span>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Empty state */}
      {filteredSessions.length === 0 && (
        <div className="text-center py-16">
          <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
            <Compass className="h-8 w-8 text-base-content/30" />
          </div>
          <h2 className="text-lg font-semibold mb-2">No sessions found</h2>
          <p className="text-base-content/40">Try a different lineage or create your own</p>
        </div>
      )}
    </div>
  )
}

export default ExplorePage
