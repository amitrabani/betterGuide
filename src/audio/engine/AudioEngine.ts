import type { TransportState, AudioEventType, AudioEventListener, AudioEvent } from '@/types/audio'
import type { Session, PromptItem } from '@/types/session'

interface ScheduledPrompt {
  prompt: PromptItem
  utterance: SpeechSynthesisUtterance | null
  triggered: boolean
}

class AudioEngineClass {
  private static instance: AudioEngineClass | null = null

  private audioContext: AudioContext | null = null
  private masterGain: GainNode | null = null
  private binauralLeft: OscillatorNode | null = null
  private binauralRight: OscillatorNode | null = null
  private binauralGain: GainNode | null = null

  private transportState: TransportState = 'stopped'
  private currentTime: number = 0
  private duration: number = 0
  private startTimestamp: number = 0
  private pausedAt: number = 0

  private session: Session | null = null
  private scheduledPrompts: ScheduledPrompt[] = []
  private animationFrame: number | null = null

  private listeners: Set<AudioEventListener> = new Set()
  private masterVolume: number = 1
  private isMuted: boolean = false

  private constructor() {}

  static getInstance(): AudioEngineClass {
    if (!AudioEngineClass.instance) {
      AudioEngineClass.instance = new AudioEngineClass()
    }
    return AudioEngineClass.instance
  }

  async initialize(): Promise<void> {
    if (this.audioContext) return

    this.audioContext = new AudioContext()
    this.masterGain = this.audioContext.createGain()
    this.masterGain.connect(this.audioContext.destination)
    this.masterGain.gain.value = this.masterVolume
  }

  async resume(): Promise<void> {
    if (this.audioContext?.state === 'suspended') {
      await this.audioContext.resume()
    }
  }

  // Event handling
  addEventListener(listener: AudioEventListener): () => void {
    this.listeners.add(listener)
    return () => this.listeners.delete(listener)
  }

  private emit(type: AudioEventType, payload: unknown = null): void {
    const event: AudioEvent = {
      type,
      payload,
      timestamp: Date.now(),
    }
    this.listeners.forEach((listener) => listener(event))
  }

  // Session management
  loadSession(session: Session): void {
    this.stop()
    this.session = session
    this.duration = session.duration
    this.currentTime = 0
    this.scheduledPrompts = session.prompts.map((prompt) => ({
      prompt,
      utterance: null,
      triggered: false,
    }))
  }

  // Transport controls
  async play(): Promise<void> {
    if (!this.session || !this.audioContext) {
      await this.initialize()
    }

    await this.resume()

    if (this.transportState === 'playing') return

    this.transportState = 'playing'

    if (this.pausedAt > 0) {
      this.startTimestamp = Date.now() - this.pausedAt * 1000
      this.pausedAt = 0
    } else {
      this.startTimestamp = Date.now() - this.currentTime * 1000
    }

    // Start binaural beats if configured
    if (this.session?.binaural && this.audioContext && this.masterGain) {
      this.startBinaural()
    }

    // Start update loop
    this.startUpdateLoop()

    this.emit('transport-change', { state: 'playing' })
  }

  pause(): void {
    if (this.transportState !== 'playing') return

    this.transportState = 'paused'
    this.pausedAt = this.currentTime

    // Stop binaural
    this.stopBinaural()

    // Stop any ongoing speech
    speechSynthesis.cancel()

    // Stop update loop
    this.stopUpdateLoop()

    this.emit('transport-change', { state: 'paused' })
  }

  stop(): void {
    this.transportState = 'stopped'
    this.currentTime = 0
    this.pausedAt = 0

    // Stop binaural
    this.stopBinaural()

    // Stop speech
    speechSynthesis.cancel()

    // Reset prompts
    this.scheduledPrompts.forEach((sp) => {
      sp.triggered = false
      sp.utterance = null
    })

    // Stop update loop
    this.stopUpdateLoop()

    this.emit('transport-change', { state: 'stopped' })
    this.emit('time-update', { currentTime: 0 })
  }

  seek(time: number): void {
    const wasPlaying = this.transportState === 'playing'

    // Clamp time
    const clampedTime = Math.max(0, Math.min(this.duration, time))
    this.currentTime = clampedTime

    // Reset prompt triggers for prompts after seek position
    this.scheduledPrompts.forEach((sp) => {
      if (sp.prompt.startTime >= clampedTime) {
        sp.triggered = false
        sp.utterance = null
      }
    })

    // Cancel current speech
    speechSynthesis.cancel()

    if (wasPlaying) {
      this.startTimestamp = Date.now() - clampedTime * 1000
    } else {
      this.pausedAt = clampedTime
    }

    this.emit('time-update', { currentTime: clampedTime })
  }

  // Volume control
  setMasterVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume))
    if (this.masterGain) {
      this.masterGain.gain.value = this.isMuted ? 0 : this.masterVolume
    }
  }

  setMuted(muted: boolean): void {
    this.isMuted = muted
    if (this.masterGain) {
      this.masterGain.gain.value = muted ? 0 : this.masterVolume
    }
  }

  // Binaural beats
  private startBinaural(): void {
    if (!this.audioContext || !this.masterGain || !this.session?.binaural) return

    const { baseFrequency, beatFrequency, volume } = this.session.binaural

    // Create stereo panner for left channel
    const leftPanner = this.audioContext.createStereoPanner()
    leftPanner.pan.value = -1

    // Create stereo panner for right channel
    const rightPanner = this.audioContext.createStereoPanner()
    rightPanner.pan.value = 1

    // Create gain for binaural (separate from master for fades)
    this.binauralGain = this.audioContext.createGain()
    this.binauralGain.gain.value = volume
    this.binauralGain.connect(this.masterGain)

    // Left oscillator at base frequency
    this.binauralLeft = this.audioContext.createOscillator()
    this.binauralLeft.type = 'sine'
    this.binauralLeft.frequency.value = baseFrequency
    this.binauralLeft.connect(leftPanner)
    leftPanner.connect(this.binauralGain)
    this.binauralLeft.start()

    // Right oscillator at base + beat frequency
    this.binauralRight = this.audioContext.createOscillator()
    this.binauralRight.type = 'sine'
    this.binauralRight.frequency.value = baseFrequency + beatFrequency
    this.binauralRight.connect(rightPanner)
    rightPanner.connect(this.binauralGain)
    this.binauralRight.start()
  }

  private stopBinaural(): void {
    if (this.binauralLeft) {
      this.binauralLeft.stop()
      this.binauralLeft.disconnect()
      this.binauralLeft = null
    }
    if (this.binauralRight) {
      this.binauralRight.stop()
      this.binauralRight.disconnect()
      this.binauralRight = null
    }
    if (this.binauralGain) {
      this.binauralGain.disconnect()
      this.binauralGain = null
    }
  }

  // TTS for prompts
  private speakPrompt(prompt: PromptItem): void {
    const utterance = new SpeechSynthesisUtterance(prompt.text)
    utterance.rate = prompt.voice.rate
    utterance.pitch = prompt.voice.pitch

    // Find a matching voice if specified
    if (prompt.voice.voice !== 'default') {
      const voices = speechSynthesis.getVoices()
      const voice = voices.find((v) => v.name.includes(prompt.voice.voice))
      if (voice) {
        utterance.voice = voice
      }
    }

    utterance.onstart = () => {
      this.emit('prompt-start', { promptId: prompt.id, text: prompt.text })
    }

    utterance.onend = () => {
      this.emit('prompt-end', { promptId: prompt.id })
    }

    speechSynthesis.speak(utterance)
  }

  // Update loop
  private startUpdateLoop(): void {
    const update = () => {
      if (this.transportState !== 'playing') return

      // Calculate current time
      this.currentTime = (Date.now() - this.startTimestamp) / 1000

      // Check if we've reached the end
      if (this.currentTime >= this.duration) {
        this.currentTime = this.duration
        this.stop()
        return
      }

      // Check for prompts to trigger
      this.scheduledPrompts.forEach((sp) => {
        if (!sp.triggered && this.currentTime >= sp.prompt.startTime) {
          sp.triggered = true
          this.speakPrompt(sp.prompt)
        }
      })

      this.emit('time-update', { currentTime: this.currentTime })

      this.animationFrame = requestAnimationFrame(update)
    }

    this.animationFrame = requestAnimationFrame(update)
  }

  private stopUpdateLoop(): void {
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame)
      this.animationFrame = null
    }
  }

  // Getters
  getState() {
    return {
      transportState: this.transportState,
      currentTime: this.currentTime,
      duration: this.duration,
      isReady: !!this.audioContext,
      isMuted: this.isMuted,
      masterVolume: this.masterVolume,
    }
  }

  getCurrentTime(): number {
    return this.currentTime
  }

  getTransportState(): TransportState {
    return this.transportState
  }

  // Cleanup
  dispose(): void {
    this.stop()
    if (this.audioContext) {
      this.audioContext.close()
      this.audioContext = null
    }
    this.masterGain = null
    this.listeners.clear()
  }
}

// Export singleton
export const AudioEngine = AudioEngineClass.getInstance()
