// Audio engine types

export type TransportState = 'stopped' | 'playing' | 'paused'

export interface AudioEngineState {
  transportState: TransportState
  currentTime: number
  duration: number
  isReady: boolean
  isMuted: boolean
  masterVolume: number
}

export interface AudioNodeState {
  id: string
  isLoaded: boolean
  isPlaying: boolean
  volume: number
  error: string | null
}

export interface TTSQueueItem {
  id: string
  text: string
  startTime: number
  voice: string
  rate: number
  pitch: number
}

export interface AmbientSound {
  id: string
  name: string
  category: 'nature' | 'music' | 'tones' | 'noise'
  filename: string
  duration?: number // some sounds are loopable
  loopable: boolean
}

// Available ambient sounds (bundled with app)
export const ambientSounds: AmbientSound[] = [
  { id: 'rain', name: 'Rain', category: 'nature', filename: 'rain.mp3', loopable: true },
  { id: 'forest', name: 'Forest', category: 'nature', filename: 'forest.mp3', loopable: true },
  { id: 'ocean', name: 'Ocean Waves', category: 'nature', filename: 'ocean.mp3', loopable: true },
  { id: 'wind', name: 'Gentle Wind', category: 'nature', filename: 'wind.mp3', loopable: true },
  { id: 'stream', name: 'Stream', category: 'nature', filename: 'stream.mp3', loopable: true },
  { id: 'bowl', name: 'Singing Bowl', category: 'tones', filename: 'bowl.mp3', loopable: false },
  { id: 'chimes', name: 'Wind Chimes', category: 'tones', filename: 'chimes.mp3', loopable: true },
  { id: 'drone', name: 'Om Drone', category: 'tones', filename: 'drone.mp3', loopable: true },
  { id: 'pink-noise', name: 'Pink Noise', category: 'noise', filename: 'pink-noise.mp3', loopable: true },
  { id: 'brown-noise', name: 'Brown Noise', category: 'noise', filename: 'brown-noise.mp3', loopable: true },
]

// Audio event types for event-driven React integration
export type AudioEventType =
  | 'transport-change'
  | 'time-update'
  | 'prompt-start'
  | 'prompt-end'
  | 'ambient-loaded'
  | 'error'

export interface AudioEvent {
  type: AudioEventType
  payload: unknown
  timestamp: number
}

export type AudioEventListener = (event: AudioEvent) => void
