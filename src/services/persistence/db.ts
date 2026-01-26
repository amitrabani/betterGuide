import { openDB } from 'idb'
import type { DBSchema, IDBPDatabase } from 'idb'
import type { Session, SessionVersion } from '@/types/session'
import type { PracticeSession } from '@/types/analytics'

interface MeditationDB extends DBSchema {
  sessions: {
    key: string
    value: Session
    indexes: {
      'by-lineage': string
      'by-intent': string
      'by-updated': number
      'by-canonical': number
    }
  }
  versions: {
    key: string
    value: SessionVersion
    indexes: {
      'by-session': string
    }
  }
  practice: {
    key: string
    value: PracticeSession
    indexes: {
      'by-date': number
      'by-session': string
    }
  }
  audioCache: {
    key: string
    value: {
      id: string
      buffer: ArrayBuffer
      createdAt: number
    }
  }
}

const DB_NAME = 'meditation-builder'
const DB_VERSION = 1

let dbInstance: IDBPDatabase<MeditationDB> | null = null

export async function getDB(): Promise<IDBPDatabase<MeditationDB>> {
  if (dbInstance) return dbInstance

  dbInstance = await openDB<MeditationDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Sessions store
      if (!db.objectStoreNames.contains('sessions')) {
        const sessionStore = db.createObjectStore('sessions', { keyPath: 'id' })
        sessionStore.createIndex('by-lineage', 'lineage')
        sessionStore.createIndex('by-intent', 'intent')
        sessionStore.createIndex('by-updated', 'updatedAt')
        sessionStore.createIndex('by-canonical', 'isCanonical')
      }

      // Version history store
      if (!db.objectStoreNames.contains('versions')) {
        const versionStore = db.createObjectStore('versions', { keyPath: 'id' })
        versionStore.createIndex('by-session', 'sessionId')
      }

      // Practice history store
      if (!db.objectStoreNames.contains('practice')) {
        const practiceStore = db.createObjectStore('practice', { keyPath: 'id' })
        practiceStore.createIndex('by-date', 'completedAt')
        practiceStore.createIndex('by-session', 'sessionId')
      }

      // Audio buffer cache store
      if (!db.objectStoreNames.contains('audioCache')) {
        db.createObjectStore('audioCache', { keyPath: 'id' })
      }
    },
  })

  return dbInstance
}

export async function clearDB(): Promise<void> {
  const db = await getDB()
  const tx = db.transaction(['sessions', 'versions', 'practice', 'audioCache'], 'readwrite')
  await Promise.all([
    tx.objectStore('sessions').clear(),
    tx.objectStore('versions').clear(),
    tx.objectStore('practice').clear(),
    tx.objectStore('audioCache').clear(),
  ])
}
