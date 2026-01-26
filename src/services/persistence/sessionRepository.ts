import { getDB } from './db'
import type { Session, SessionVersion, Lineage, Intent } from '@/types/session'

// Generate unique ID
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

// Session CRUD operations
export async function getAllSessions(): Promise<Session[]> {
  const db = await getDB()
  return db.getAll('sessions')
}

export async function getSession(id: string): Promise<Session | undefined> {
  const db = await getDB()
  return db.get('sessions', id)
}

export async function saveSession(session: Session): Promise<string> {
  const db = await getDB()
  const now = Date.now()

  const sessionToSave: Session = {
    ...session,
    id: session.id || generateId(),
    updatedAt: now,
    createdAt: session.createdAt || now,
  }

  await db.put('sessions', sessionToSave)
  return sessionToSave.id
}

export async function deleteSession(id: string): Promise<void> {
  const db = await getDB()
  await db.delete('sessions', id)

  // Also delete related versions
  const versions = await getVersionsForSession(id)
  const tx = db.transaction('versions', 'readwrite')
  await Promise.all(versions.map(v => tx.store.delete(v.id)))
}

export async function getSessionsByLineage(lineage: Lineage): Promise<Session[]> {
  const db = await getDB()
  return db.getAllFromIndex('sessions', 'by-lineage', lineage)
}

export async function getSessionsByIntent(intent: Intent): Promise<Session[]> {
  const db = await getDB()
  return db.getAllFromIndex('sessions', 'by-intent', intent)
}

export async function getCanonicalSessions(): Promise<Session[]> {
  const db = await getDB()
  const sessions = await db.getAllFromIndex('sessions', 'by-canonical', 1)
  return sessions.filter(s => s.isCanonical)
}

export async function getUserSessions(): Promise<Session[]> {
  const sessions = await getAllSessions()
  return sessions.filter(s => !s.isCanonical)
}

// Version history
export async function getVersionsForSession(sessionId: string): Promise<SessionVersion[]> {
  const db = await getDB()
  return db.getAllFromIndex('versions', 'by-session', sessionId)
}

export async function saveVersion(session: Session, note?: string): Promise<string> {
  const db = await getDB()
  const id = generateId()

  const version: SessionVersion = {
    id,
    sessionId: session.id,
    version: session.version,
    snapshot: { ...session },
    createdAt: Date.now(),
    note,
  }

  await db.put('versions', version)
  return id
}

export async function restoreVersion(versionId: string): Promise<Session | undefined> {
  const db = await getDB()
  const version = await db.get('versions', versionId)

  if (!version) return undefined

  const restored: Session = {
    ...version.snapshot,
    version: version.snapshot.version + 1,
    updatedAt: Date.now(),
  }

  await saveSession(restored)
  return restored
}

// Create a new session with defaults
export function createNewSession(
  name: string,
  lineage: Lineage,
  duration: number = 300
): Session {
  const now = Date.now()

  return {
    id: generateId(),
    name,
    lineage,
    intent: 'general',
    duration,
    isCanonical: false,
    version: 1,
    prompts: [],
    ambients: [],
    binaural: null,
    sections: [],
    createdAt: now,
    updatedAt: now,
  }
}

// Duplicate a session (for creating variants)
export function duplicateSession(session: Session, newName?: string): Session {
  const now = Date.now()

  return {
    ...session,
    id: generateId(),
    name: newName || `${session.name} (Copy)`,
    isCanonical: false,
    parentId: session.id,
    version: 1,
    createdAt: now,
    updatedAt: now,
    prompts: session.prompts.map(p => ({ ...p, id: generateId() })),
    ambients: session.ambients.map(a => ({ ...a, id: generateId() })),
    sections: session.sections.map(s => ({ ...s, id: generateId() })),
  }
}
