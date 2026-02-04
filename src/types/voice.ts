export interface DeepgramVoice {
  id: string
  name: string
  gender: 'female' | 'male'
  accent: string
  traits: string
  recommended: boolean
}

export type SessionVoice =
  | { type: 'browser' }
  | { type: 'deepgram'; voiceId: string; modelName: string }
