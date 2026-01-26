// Core meditation session types

export type Lineage = 'zazen' | 'raja-yoga' | 'mindfulness' | 'vipassana'
export type Intent = 'sleep' | 'anxiety' | 'focus' | 'energy' | 'general'

export interface VoiceConfig {
  voice: string // Browser voice name or Deepgram voice ID
  rate: number // 0.5 - 2.0
  pitch: number // 0.5 - 2.0
}

export interface RepeatConfig {
  count: number
  interval: number // seconds between repeats
}

export interface GlideConfig {
  targetFrequency: number
  duration: number // seconds to glide
  startTime: number // when to start glide (seconds from binaural start)
}

export interface PromptItem {
  id: string
  startTime: number // seconds from session start
  duration: number // estimated TTS duration in seconds
  text: string
  voice: VoiceConfig
  repeat?: RepeatConfig
  variables?: Record<string, string> // for dynamic content like {breathDuration}
}

export interface AmbientItem {
  id: string
  soundId: string // reference to ambient sound file
  name: string
  startTime: number
  endTime: number
  volume: number // 0 - 1
  fadeIn: number // seconds
  fadeOut: number // seconds
}

export type BinauralPreset = 'delta' | 'theta' | 'alpha' | 'beta' | 'custom'

export interface BinauralConfig {
  preset: BinauralPreset
  baseFrequency: number // Hz, typically 100-500
  beatFrequency: number // Hz, the difference frequency (1-40)
  volume: number // 0 - 1
  startTime: number
  endTime: number
  fadeIn: number
  fadeOut: number
  glide?: GlideConfig
}

export type SectionType = 'opening' | 'main' | 'closing'

export interface SectionMarker {
  id: string
  type: SectionType
  startTime: number
  endTime: number
  label?: string
}

export interface Session {
  id: string
  name: string
  description?: string
  lineage: Lineage
  intent: Intent
  duration: number // total session duration in seconds
  isCanonical: boolean // true = read-only seed data
  parentId?: string // for variants, reference to parent session
  version: number
  prompts: PromptItem[]
  ambients: AmbientItem[]
  binaural: BinauralConfig | null
  sections: SectionMarker[]
  createdAt: number // timestamp
  updatedAt: number // timestamp
}

export interface SessionVersion {
  id: string
  sessionId: string
  version: number
  snapshot: Session
  createdAt: number
  note?: string
}

// Default values for new items
export const defaultVoiceConfig: VoiceConfig = {
  voice: 'default',
  rate: 1.0,
  pitch: 1.0,
}

export const defaultPrompt: Omit<PromptItem, 'id'> = {
  startTime: 0,
  duration: 5,
  text: 'New prompt...',
  voice: defaultVoiceConfig,
}

export const defaultAmbient: Omit<AmbientItem, 'id'> = {
  soundId: 'rain',
  name: 'Rain',
  startTime: 0,
  endTime: 300,
  volume: 0.5,
  fadeIn: 3,
  fadeOut: 3,
}

export const binauralPresets: Record<BinauralPreset, { baseFrequency: number; beatFrequency: number; description: string }> = {
  delta: { baseFrequency: 200, beatFrequency: 2, description: 'Deep sleep (0.5-4 Hz)' },
  theta: { baseFrequency: 200, beatFrequency: 6, description: 'Meditation, creativity (4-8 Hz)' },
  alpha: { baseFrequency: 200, beatFrequency: 10, description: 'Relaxation, calm (8-13 Hz)' },
  beta: { baseFrequency: 200, beatFrequency: 20, description: 'Focus, alertness (13-30 Hz)' },
  custom: { baseFrequency: 200, beatFrequency: 10, description: 'Custom frequencies' },
}

export const defaultBinaural: Omit<BinauralConfig, 'startTime' | 'endTime'> = {
  preset: 'alpha',
  baseFrequency: 200,
  beatFrequency: 10,
  volume: 0.3,
  fadeIn: 5,
  fadeOut: 5,
}
