import { useEffect, useState, useCallback } from 'react'
import { AudioEngine } from '../engine/AudioEngine'
import type { TransportState, AudioEvent } from '@/types/audio'
import type { Session } from '@/types/session'

interface AudioEngineState {
  transportState: TransportState
  currentTime: number
  duration: number
  isReady: boolean
  isMuted: boolean
  masterVolume: number
}

export function useAudioEngine() {
  const [state, setState] = useState<AudioEngineState>(() => AudioEngine.getState())

  const [currentPromptId, setCurrentPromptId] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = AudioEngine.addEventListener((event: AudioEvent) => {
      switch (event.type) {
        case 'transport-change':
          setState((prev) => ({
            ...prev,
            transportState: (event.payload as { state: TransportState }).state,
          }))
          break

        case 'time-update':
          setState((prev) => ({
            ...prev,
            currentTime: (event.payload as { currentTime: number }).currentTime,
          }))
          break

        case 'prompt-start':
          setCurrentPromptId((event.payload as { promptId: string }).promptId)
          break

        case 'prompt-end':
          setCurrentPromptId(null)
          break
      }
    })

    return unsubscribe
  }, [])

  const loadSession = useCallback((session: Session) => {
    AudioEngine.loadSession(session)
    setState((prev) => ({
      ...prev,
      duration: session.duration,
      currentTime: 0,
    }))
  }, [])

  const play = useCallback(async () => {
    await AudioEngine.play()
  }, [])

  const pause = useCallback(() => {
    AudioEngine.pause()
  }, [])

  const stop = useCallback(() => {
    AudioEngine.stop()
  }, [])

  const seek = useCallback((time: number) => {
    AudioEngine.seek(time)
  }, [])

  const setVolume = useCallback((volume: number) => {
    AudioEngine.setMasterVolume(volume)
    setState((prev) => ({ ...prev, masterVolume: volume }))
  }, [])

  const setMuted = useCallback((muted: boolean) => {
    AudioEngine.setMuted(muted)
    setState((prev) => ({ ...prev, isMuted: muted }))
  }, [])

  const togglePlayPause = useCallback(async () => {
    if (state.transportState === 'playing') {
      pause()
    } else {
      await play()
    }
  }, [state.transportState, play, pause])

  return {
    ...state,
    currentPromptId,
    loadSession,
    play,
    pause,
    stop,
    seek,
    setVolume,
    setMuted,
    togglePlayPause,
  }
}
