import { useState, useRef, useCallback } from 'react'
import { synthesizeSpeech } from './ttsService'
import { PREVIEW_TEXT } from './deepgramVoices'

interface TTSPreviewState {
  isLoading: boolean
  isPlaying: boolean
  error: string | null
  activeVoiceId: string | null
}

export function useTTSPreview() {
  const [state, setState] = useState<TTSPreviewState>({
    isLoading: false,
    isPlaying: false,
    error: null,
    activeVoiceId: null,
  })

  const audioContextRef = useRef<AudioContext | null>(null)
  const sourceRef = useRef<AudioBufferSourceNode | null>(null)

  const stop = useCallback(() => {
    if (sourceRef.current) {
      try { sourceRef.current.stop() } catch { /* already stopped */ }
      sourceRef.current.disconnect()
      sourceRef.current = null
    }
    setState((s) => ({ ...s, isPlaying: false, activeVoiceId: null }))
  }, [])

  const preview = useCallback(
    async (voiceId: string) => {
      // Stop any current playback
      stop()

      setState({ isLoading: true, isPlaying: false, error: null, activeVoiceId: voiceId })

      try {
        const buffer = await synthesizeSpeech(PREVIEW_TEXT, voiceId)

        // Create or reuse AudioContext
        if (!audioContextRef.current || audioContextRef.current.state === 'closed') {
          audioContextRef.current = new AudioContext()
        }
        const ctx = audioContextRef.current
        if (ctx.state === 'suspended') {
          await ctx.resume()
        }

        const audioBuffer = await ctx.decodeAudioData(buffer.slice(0))
        const source = ctx.createBufferSource()
        source.buffer = audioBuffer
        source.connect(ctx.destination)

        source.onended = () => {
          setState((s) => ({
            ...s,
            isPlaying: false,
            activeVoiceId: s.activeVoiceId === voiceId ? null : s.activeVoiceId,
          }))
        }

        sourceRef.current = source
        source.start()
        setState({ isLoading: false, isPlaying: true, error: null, activeVoiceId: voiceId })
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Preview failed'
        setState({ isLoading: false, isPlaying: false, error: message, activeVoiceId: null })
      }
    },
    [stop],
  )

  const cleanup = useCallback(() => {
    stop()
    if (audioContextRef.current) {
      audioContextRef.current.close()
      audioContextRef.current = null
    }
  }, [stop])

  return { ...state, preview, stop, cleanup }
}
