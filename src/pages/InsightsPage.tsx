import { useState, useEffect } from 'react'
import { BarChart2, Flame, Clock, TrendingUp, Calendar, AlertCircle, RefreshCw } from 'lucide-react'
import { Card, CardBody, Button } from '@/components/ui'
import { getAllPractice, calculateStreak, getDailyStats } from '@/services/persistence'
import { format, subDays, startOfWeek, eachDayOfInterval } from 'date-fns'

interface Stats {
  currentStreak: number
  longestStreak: number
  totalMinutes: number
  sessionsCompleted: number
  averageLength: number
}

function InsightsPage() {
  const [stats, setStats] = useState<Stats>({
    currentStreak: 0,
    longestStreak: 0,
    totalMinutes: 0,
    sessionsCompleted: 0,
    averageLength: 0,
  })
  const [weeklyMinutes, setWeeklyMinutes] = useState<number[]>([0, 0, 0, 0, 0, 0, 0])
  const [heatmapData, setHeatmapData] = useState<Map<string, number>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    setLoading(true)
    setError(null)
    try {
      const [practice, streakData, dailyStatsMap] = await Promise.all([
        getAllPractice(),
        calculateStreak(),
        getDailyStats(365),
      ])

      // Calculate totals
      const totalMinutes = practice.reduce((sum, p) => sum + Math.round(p.actualDuration / 60), 0)
      const sessionsCompleted = practice.length
      const averageLength = sessionsCompleted > 0 ? Math.round(totalMinutes / sessionsCompleted) : 0

      setStats({
        currentStreak: streakData.current,
        longestStreak: streakData.longest,
        totalMinutes,
        sessionsCompleted,
        averageLength,
      })

      // Calculate weekly minutes (current week)
      const today = new Date()
      const weekStart = startOfWeek(today, { weekStartsOn: 1 })
      const daysOfWeek = eachDayOfInterval({ start: weekStart, end: today })

      const weekMins = [0, 0, 0, 0, 0, 0, 0]
      daysOfWeek.forEach((day, index) => {
        const dateKey = format(day, 'yyyy-MM-dd')
        weekMins[index] = dailyStatsMap.get(dateKey) || 0
      })
      setWeeklyMinutes(weekMins)

      // Set heatmap data
      setHeatmapData(dailyStatsMap)
    } catch (err) {
      console.error('Failed to load insights:', err)
      setError('Failed to load practice data')
    } finally {
      setLoading(false)
    }
  }

  const maxMinutes = Math.max(...weeklyMinutes, 1)

  // Generate heatmap grid (last 52 weeks x 7 days)
  const generateHeatmap = () => {
    const cells: { date: string; value: number; level: number }[] = []
    const today = new Date()

    for (let i = 364; i >= 0; i--) {
      const date = subDays(today, i)
      const dateKey = format(date, 'yyyy-MM-dd')
      const value = heatmapData.get(dateKey) || 0

      let level = 0
      if (value > 0) level = 1
      if (value >= 10) level = 2
      if (value >= 20) level = 3
      if (value >= 30) level = 4

      cells.push({ date: dateKey, value, level })
    }

    return cells
  }

  const heatmapCells = generateHeatmap()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-error mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">Failed to load insights</h2>
          <p className="text-base-content/60 mb-4">{error}</p>
          <Button variant="primary" onClick={loadStats}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <BarChart2 className="text-primary" />
          Insights
        </h1>
        <p className="text-base-content/70 mt-2">
          Track your meditation practice
        </p>
      </header>

      {/* Stats overview */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-warning/20 flex items-center justify-center">
              <Flame className="h-6 w-6 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.currentStreak}</p>
              <p className="text-sm text-base-content/60">Day Streak</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
              <Clock className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.totalMinutes}</p>
              <p className="text-sm text-base-content/60">Total Minutes</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-success/20 flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.sessionsCompleted}</p>
              <p className="text-sm text-base-content/60">Sessions</p>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent/20 flex items-center justify-center">
              <BarChart2 className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-2xl font-bold">{stats.averageLength}</p>
              <p className="text-sm text-base-content/60">Avg. Minutes</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Weekly chart */}
      <Card className="mb-8">
        <CardBody>
          <h2 className="font-semibold mb-4">This Week</h2>
          <div className="flex items-end justify-between h-32 gap-2">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
              <div key={day} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex flex-col justify-end h-24">
                  <div
                    className="w-full bg-primary rounded-t transition-all duration-300"
                    style={{
                      height: weeklyMinutes[i] > 0 ? `${Math.max((weeklyMinutes[i] / maxMinutes) * 100, 5)}%` : '0%',
                    }}
                  />
                </div>
                <span className="text-xs text-base-content/60">{day}</span>
                {weeklyMinutes[i] > 0 && (
                  <span className="text-xs text-primary font-medium">{weeklyMinutes[i]}m</span>
                )}
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Heatmap */}
      <Card>
        <CardBody>
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Practice History
          </h2>

          {stats.sessionsCompleted === 0 ? (
            <div className="text-center py-8 text-base-content/60">
              <p>No practice sessions recorded yet.</p>
              <p className="text-sm mt-1">Start a meditation to track your progress!</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto pb-2">
                <div
                  className="grid gap-[3px]"
                  style={{
                    gridTemplateRows: 'repeat(7, 1fr)',
                    gridAutoFlow: 'column',
                    gridAutoColumns: 'minmax(10px, 14px)',
                    width: 'fit-content',
                    minWidth: '100%',
                  }}
                >
                  {heatmapCells.map((cell, i) => {
                    const levelClasses = [
                      'bg-base-300',
                      'bg-primary/30',
                      'bg-primary/50',
                      'bg-primary/70',
                      'bg-primary',
                    ]

                    return (
                      <div
                        key={i}
                        className={`aspect-square rounded-sm ${levelClasses[cell.level]} cursor-default min-w-[10px] max-w-[14px]`}
                        title={`${cell.date}: ${cell.value} minutes`}
                      />
                    )
                  })}
                </div>
              </div>
              <div className="flex items-center justify-end gap-2 mt-4 text-xs text-base-content/60">
                <span>Less</span>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-sm bg-base-300" />
                  <div className="w-3 h-3 rounded-sm bg-primary/30" />
                  <div className="w-3 h-3 rounded-sm bg-primary/50" />
                  <div className="w-3 h-3 rounded-sm bg-primary/70" />
                  <div className="w-3 h-3 rounded-sm bg-primary" />
                </div>
                <span>More</span>
              </div>
            </>
          )}
        </CardBody>
      </Card>

      {/* Best streak */}
      {stats.longestStreak > 0 && (
        <div className="mt-4 text-center text-base-content/60 text-sm">
          Your longest streak: {stats.longestStreak} days
        </div>
      )}
    </div>
  )
}

export default InsightsPage
