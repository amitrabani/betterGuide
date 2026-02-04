import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import { getDB } from '@/services/persistence/db'
import type { Session } from '@/types/session'
import type { PracticeSession } from '@/types/analytics'

function userSessionsRef(uid: string) {
  return collection(db, 'users', uid, 'sessions')
}

function userPracticeRef(uid: string) {
  return collection(db, 'users', uid, 'practice')
}

// Push a single session to Firestore
export async function pushSession(uid: string, session: Session) {
  const ref = doc(userSessionsRef(uid), session.id)
  await setDoc(ref, session)
}

// Delete a session from Firestore
export async function removeSession(uid: string, sessionId: string) {
  const ref = doc(userSessionsRef(uid), sessionId)
  await deleteDoc(ref)
}

// Push a single practice record to Firestore
export async function pushPractice(uid: string, practice: PracticeSession) {
  const ref = doc(userPracticeRef(uid), practice.id)
  await setDoc(ref, practice)
}

// Full sync on sign-in: merge local IndexedDB ↔ Firestore
export async function syncOnSignIn(uid: string) {
  const localDb = await getDB()

  // --- Sessions sync ---
  const [localSessions, remoteSessionSnap] = await Promise.all([
    localDb.getAll('sessions'),
    getDocs(userSessionsRef(uid)),
  ])

  const remoteSessions = new Map<string, Session>()
  remoteSessionSnap.forEach((doc) => {
    remoteSessions.set(doc.id, doc.data() as Session)
  })

  const localMap = new Map(localSessions.map((s) => [s.id, s]))
  const batch = writeBatch(db)

  // Push local sessions that are newer or missing remotely
  for (const local of localSessions) {
    const remote = remoteSessions.get(local.id)
    if (!remote || local.updatedAt > remote.updatedAt) {
      batch.set(doc(userSessionsRef(uid), local.id), local)
    }
  }

  // Pull remote sessions that are newer or missing locally
  for (const [id, remote] of remoteSessions) {
    const local = localMap.get(id)
    if (!local || remote.updatedAt > local.updatedAt) {
      await localDb.put('sessions', remote)
    }
  }

  // --- Practice sync ---
  const [localPractice, remotePracticeSnap] = await Promise.all([
    localDb.getAll('practice'),
    getDocs(userPracticeRef(uid)),
  ])

  const remotePracticeIds = new Set<string>()
  remotePracticeSnap.forEach((doc) => {
    remotePracticeIds.add(doc.id)
  })

  // Push local practice records missing remotely
  for (const practice of localPractice) {
    if (!remotePracticeIds.has(practice.id)) {
      batch.set(doc(userPracticeRef(uid), practice.id), practice)
    }
  }

  // Pull remote practice records missing locally
  const localPracticeIds = new Set(localPractice.map((p) => p.id))
  remotePracticeSnap.forEach(async (docSnap) => {
    if (!localPracticeIds.has(docSnap.id)) {
      await localDb.put('practice', docSnap.data() as PracticeSession)
    }
  })

  await batch.commit()
}
