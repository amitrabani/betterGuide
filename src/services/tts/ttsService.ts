import { getDB } from '@/services/persistence/db'

const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY

function cacheKey(voiceModel: string, text: string): string {
  return `dg:${voiceModel}:${text}`
}

async function getCached(key: string): Promise<ArrayBuffer | null> {
  try {
    const db = await getDB()
    const entry = await db.get('audioCache', key)
    return entry?.buffer ?? null
  } catch {
    return null
  }
}

async function setCache(key: string, buffer: ArrayBuffer): Promise<void> {
  try {
    const db = await getDB()
    await db.put('audioCache', {
      id: key,
      buffer,
      createdAt: Date.now(),
    })
  } catch {
    // Cache write failure is non-critical
  }
}

export async function synthesizeSpeech(
  text: string,
  voiceModel: string,
): Promise<ArrayBuffer> {
  const key = cacheKey(voiceModel, text)

  // Check IndexedDB cache first
  const cached = await getCached(key)
  if (cached) return cached

  if (!DEEPGRAM_API_KEY) {
    throw new Error('Deepgram API key not configured')
  }

  // Call Deepgram Aura-2 API directly
  const url = `https://api.deepgram.com/v1/speak?model=${encodeURIComponent(voiceModel)}&encoding=mp3&speed=0.8`

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Token ${DEEPGRAM_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ text }),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Deepgram TTS failed (${response.status}): ${errorBody}`)
  }

  const buffer = await response.arrayBuffer()

  // Cache the result
  await setCache(key, buffer)

  return buffer
}
