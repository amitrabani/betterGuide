// Analytics and insights types

export interface PracticeSession {
  id: string
  sessionId: string
  sessionName: string
  lineage: string
  intent: string
  duration: number // planned duration
  actualDuration: number // how long user actually practiced
  completedAt: number // timestamp
  completionRate: number // 0-1, actualDuration / duration
}

export interface DailyStats {
  date: string // YYYY-MM-DD
  totalMinutes: number
  sessionsCompleted: number
  averageCompletionRate: number
  lineageBreakdown: Record<string, number> // lineage -> minutes
  intentBreakdown: Record<string, number> // intent -> minutes
}

export interface WeeklyStats {
  weekStart: string // YYYY-MM-DD (Monday)
  totalMinutes: number
  sessionsCompleted: number
  averageCompletionRate: number
  dailyMinutes: number[] // 7 values, Mon-Sun
  streak: number
}

export interface InsightsData {
  totalSessions: number
  totalMinutes: number
  currentStreak: number
  longestStreak: number
  averageSessionLength: number
  favoriteLineage: string | null
  favoriteIntent: string | null
  efficiencyScore: number // 0-100, based on completion rates
  practiceHistory: PracticeSession[]
  dailyStats: DailyStats[]
  weeklyStats: WeeklyStats[]
}

export interface HeatmapData {
  date: string
  value: number // minutes practiced
  level: 0 | 1 | 2 | 3 | 4 // intensity level for coloring
}

// Helper to calculate heatmap level
export function getHeatmapLevel(minutes: number): 0 | 1 | 2 | 3 | 4 {
  if (minutes === 0) return 0
  if (minutes < 10) return 1
  if (minutes < 20) return 2
  if (minutes < 30) return 3
  return 4
}
