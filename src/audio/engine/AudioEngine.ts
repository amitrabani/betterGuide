import type { TransportState, AudioEventType, AudioEventListener, AudioEvent } from '@/types/audio'
import type { Session, PromptItem, AmbientItem } from '@/types/session'

interface ScheduledPrompt {
  prompt: PromptItem
  utterance: SpeechSynthesisUtterance | null
  triggered: boolean
}

interface ActiveAmbient {
  item: AmbientItem
  source: AudioBufferSourceNode | null
  gainNode: GainNode | null
  started: boolean
  stopped: boolean
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

  private ambientBuffers: Map<string, AudioBuffer> = new Map()
  private activeAmbients: ActiveAmbient[] = []

  private activeTTSSource: AudioBufferSourceNode | null = null
  private ttsBufferCache: Map<string, AudioBuffer> = new Map()

  private constructor() {}

  static getInstance(): AudioEngineClass {
    if (!AudioEngineClass.instance) {
      AudioEngineClass.instance = new AudioEngineClass()
    }
    return AudioEngineClass.instance
  }

  async initialize(): Promise<void> {
    if (this.audioContext) return

    try {
      this.audioContext = new AudioContext()
      this.masterGain = this.audioContext.createGain()
      this.masterGain.connect(this.audioContext.destination)
      this.masterGain.gain.value = this.masterVolume
    } catch (err) {
      console.error('AudioEngine: Failed to create AudioContext:', err)
      this.audioContext = null
      this.masterGain = null
      throw new Error('Audio is not supported in this browser')
    }
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
    this.ttsBufferCache.clear()
    this.scheduledPrompts = session.prompts.map((prompt) => ({
      prompt,
      utterance: null,
      triggered: false,
    }))
  }

  // Transport controls
  async play(): Promise<void> {
    // Don't play without a loaded session
    if (!this.session || this.duration === 0) {
      console.warn('AudioEngine: Cannot play - no session loaded')
      return
    }

    if (!this.audioContext) {
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

    // Prepare and start ambient sounds
    await this.prepareAmbients()

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

    // Stop ambient sounds
    this.stopAllAmbients()

    // Stop any ongoing speech
    speechSynthesis.cancel()
    this.stopActiveTTS()

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

    // Stop ambient sounds
    this.stopAllAmbients()

    // Stop speech
    speechSynthesis.cancel()
    this.stopActiveTTS()

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
    this.stopActiveTTS()

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

  // Ambient sounds
  private async loadAmbientBuffer(soundId: string): Promise<AudioBuffer | null> {
    if (this.ambientBuffers.has(soundId)) {
      return this.ambientBuffers.get(soundId)!
    }
    if (!this.audioContext) return null

    const { ambientSounds } = await import('@/types/audio')
    const sound = ambientSounds.find(s => s.id === soundId)
    if (!sound) return null

    try {
      const response = await fetch(`/sounds/${sound.filename}`)
      if (!response.ok) return null
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer)
      this.ambientBuffers.set(soundId, audioBuffer)
      this.emit('ambient-loaded', { soundId })
      return audioBuffer
    } catch (err) {
      console.warn('AudioEngine: Failed to load ambient sound:', soundId, err)
      this.emit('error', { message: `Failed to load ambient: ${soundId}` })
      return null
    }
  }

  private async prepareAmbients(): Promise<void> {
    if (!this.session || this.session.ambients.length === 0) return

    this.activeAmbients = this.session.ambients.map(item => ({
      item,
      source: null,
      gainNode: null,
      started: false,
      stopped: false,
    }))

    // Preload all needed buffers
    const uniqueSounds = [...new Set(this.session.ambients.map(a => a.soundId))]
    await Promise.all(uniqueSounds.map(id => this.loadAmbientBuffer(id)))
  }

  private checkAmbients(): void {
    if (!this.audioContext || !this.masterGain) return

    for (const aa of this.activeAmbients) {
      const { item } = aa

      // Start ambient if time has come
      if (!aa.started && this.currentTime >= item.startTime) {
        aa.started = true
        const buffer = this.ambientBuffers.get(item.soundId)
        if (!buffer) continue

        const source = this.audioContext.createBufferSource()
        source.buffer = buffer
        source.loop = true

        const gain = this.audioContext.createGain()
        // Start at 0 for fade-in
        gain.gain.value = 0
        source.connect(gain)
        gain.connect(this.masterGain)

        source.start()
        aa.source = source
        aa.gainNode = gain

        // Fade in
        const targetVol = item.volume
        if (item.fadeIn > 0) {
          gain.gain.linearRampToValueAtTime(targetVol, this.audioContext.currentTime + item.fadeIn)
        } else {
          gain.gain.value = targetVol
        }
      }

      // Fade out and stop ambient when approaching endTime
      if (aa.started && !aa.stopped && aa.gainNode && aa.source) {
        const fadeOutStart = item.endTime - item.fadeOut
        if (this.currentTime >= fadeOutStart) {
          aa.stopped = true
          const remaining = Math.max(0, item.endTime - this.currentTime)
          if (remaining > 0 && item.fadeOut > 0) {
            aa.gainNode.gain.linearRampToValueAtTime(0, this.audioContext.currentTime + remaining)
            setTimeout(() => {
              aa.source?.stop()
              aa.source?.disconnect()
              aa.gainNode?.disconnect()
            }, remaining * 1000 + 100)
          } else {
            aa.source.stop()
            aa.source.disconnect()
            aa.gainNode.disconnect()
          }
        }
      }
    }
  }

  private stopAllAmbients(): void {
    for (const aa of this.activeAmbients) {
      if (aa.source) {
        try { aa.source.stop() } catch { /* already stopped */ }
        aa.source.disconnect()
      }
      if (aa.gainNode) {
        aa.gainNode.disconnect()
      }
    }
    this.activeAmbients = []
  }

  // TTS for prompts
  private speakPrompt(prompt: PromptItem): void {
    // Route to Deepgram if session has a Deepgram voice configured
    if (this.session?.voice?.type === 'deepgram') {
      this.speakWithDeepgram(prompt, this.session.voice.voiceId)
      return
    }

    this.speakWithBrowser(prompt)
  }

  private speakWithBrowser(prompt: PromptItem): void {
    if (typeof speechSynthesis === 'undefined') {
      console.warn('AudioEngine: Speech synthesis not available')
      this.emit('prompt-start', { promptId: prompt.id, text: prompt.text })
      this.emit('prompt-end', { promptId: prompt.id })
      return
    }

    try {
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

      utterance.onerror = (event) => {
        if (event.error !== 'canceled') {
          console.warn('AudioEngine: Speech synthesis error:', event.error)
        }
        this.emit('prompt-end', { promptId: prompt.id })
      }

      speechSynthesis.speak(utterance)
    } catch (err) {
      console.warn('AudioEngine: Failed to speak prompt:', err)
      this.emit('prompt-start', { promptId: prompt.id, text: prompt.text })
      this.emit('prompt-end', { promptId: prompt.id })
    }
  }

  private async speakWithDeepgram(prompt: PromptItem, voiceId: string): Promise<void> {
    if (!this.audioContext || !this.masterGain) {
      this.emit('prompt-start', { promptId: prompt.id, text: prompt.text })
      this.emit('prompt-end', { promptId: prompt.id })
      return
    }

    const cacheKey = `dg:${voiceId}:${prompt.text}`

    try {
      this.emit('prompt-start', { promptId: prompt.id, text: prompt.text })

      // Check in-memory AudioBuffer cache
      let audioBuffer = this.ttsBufferCache.get(cacheKey)

      if (!audioBuffer) {
        // Fetch from IndexedDB cache or Cloud Function
        const { synthesizeSpeech } = await import('@/services/tts/ttsService')
        const arrayBuffer = await synthesizeSpeech(prompt.text, voiceId)
        audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer.slice(0))
        this.ttsBufferCache.set(cacheKey, audioBuffer)
      }

      // Don't play if transport state changed while we were loading
      if (this.transportState !== 'playing') {
        this.emit('prompt-end', { promptId: prompt.id })
        return
      }

      const source = this.audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(this.masterGain)

      source.onended = () => {
        if (this.activeTTSSource === source) {
          this.activeTTSSource = null
        }
        this.emit('prompt-end', { promptId: prompt.id })
      }

      this.stopActiveTTS()
      this.activeTTSSource = source
      source.start()
    } catch (err) {
      console.warn('AudioEngine: Deepgram TTS failed, falling back to browser:', err)
      this.emit('prompt-end', { promptId: prompt.id })
      // Fall back to browser TTS
      this.speakWithBrowser(prompt)
    }
  }

  private stopActiveTTS(): void {
    if (this.activeTTSSource) {
      try { this.activeTTSSource.stop() } catch { /* already stopped */ }
      this.activeTTSSource.disconnect()
      this.activeTTSSource = null
    }
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

      // Check ambient sounds
      this.checkAmbients()

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
