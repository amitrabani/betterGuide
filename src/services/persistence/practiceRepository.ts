import { getDB } from './db'
import { auth } from '@/services/firebase'
import { pushPractice } from '@/services/firestore/firestoreSync'
import type { PracticeSession } from '@/types/analytics'
import { format, startOfDay, startOfWeek, subDays } from 'date-fns'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

export async function savePracticeSession(practice: Omit<PracticeSession, 'id'>): Promise<string> {
  const db = await getDB()
  const id = generateId()

  const session: PracticeSession = {
    ...practice,
    id,
  }

  await db.put('practice', session)

  // Sync to Firestore if user is authenticated
  if (auth.currentUser) {
    pushPractice(auth.currentUser.uid, session).catch(console.error)
  }

  return id
}

export async function getAllPractice(): Promise<PracticeSession[]> {
  const db = await getDB()
  return db.getAll('practice')
}

export async function getPracticeByDateRange(
  startDate: Date,
  endDate: Date
): Promise<PracticeSession[]> {
  const db = await getDB()
  const all = await db.getAll('practice')

  const start = startDate.getTime()
  const end = endDate.getTime()

  return all.filter(p => p.completedAt >= start && p.completedAt <= end)
}

export async function getPracticeForSession(sessionId: string): Promise<PracticeSession[]> {
  const db = await getDB()
  return db.getAllFromIndex('practice', 'by-session', sessionId)
}

export async function getDailyStats(days: number = 30): Promise<Map<string, number>> {
  const endDate = new Date()
  const startDate = subDays(endDate, days)

  const practice = await getPracticeByDateRange(startDate, endDate)
  const stats = new Map<string, number>()

  for (const p of practice) {
    const dateKey = format(new Date(p.completedAt), 'yyyy-MM-dd')
    const current = stats.get(dateKey) || 0
    stats.set(dateKey, current + Math.round(p.actualDuration / 60))
  }

  return stats
}

export async function calculateStreak(): Promise<{ current: number; longest: number }> {
  const practice = await getAllPractice()

  if (practice.length === 0) {
    return { current: 0, longest: 0 }
  }

  // Group by day
  const daySet = new Set<string>()
  for (const p of practice) {
    const day = format(startOfDay(new Date(p.completedAt)), 'yyyy-MM-dd')
    daySet.add(day)
  }

  const days = Array.from(daySet).sort().reverse()

  // Calculate current streak
  let current = 0
  const today = format(startOfDay(new Date()), 'yyyy-MM-dd')
  const yesterday = format(startOfDay(subDays(new Date(), 1)), 'yyyy-MM-dd')

  // Check if practiced today or yesterday
  if (days[0] === today || days[0] === yesterday) {
    current = 1
    for (let i = 1; i < days.length; i++) {
      const prevDay = format(subDays(new Date(days[i - 1]), 1), 'yyyy-MM-dd')
      if (days[i] === prevDay) {
        current++
      } else {
        break
      }
    }
  }

  // Calculate longest streak
  let longest = 0
  let streak = 1

  for (let i = 1; i < days.length; i++) {
    const prevDay = format(subDays(new Date(days[i - 1]), 1), 'yyyy-MM-dd')
    if (days[i] === prevDay) {
      streak++
    } else {
      longest = Math.max(longest, streak)
      streak = 1
    }
  }
  longest = Math.max(longest, streak, current)

  return { current, longest }
}

export async function getWeeklyMinutes(weeks: number = 12): Promise<number[]> {
  const endDate = new Date()
  const startDate = subDays(endDate, weeks * 7)

  const practice = await getPracticeByDateRange(startDate, endDate)
  const weeklyMinutes: number[] = new Array(weeks).fill(0)

  for (const p of practice) {
    const practiceDate = new Date(p.completedAt)
    const weekStart = startOfWeek(practiceDate, { weekStartsOn: 1 })
    const weeksAgo = Math.floor((endDate.getTime() - weekStart.getTime()) / (7 * 24 * 60 * 60 * 1000))

    if (weeksAgo >= 0 && weeksAgo < weeks) {
      weeklyMinutes[weeks - 1 - weeksAgo] += Math.round(p.actualDuration / 60)
    }
  }

  return weeklyMinutes
}
