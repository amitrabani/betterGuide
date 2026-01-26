import { useCallback, useRef, useState } from 'react'

interface LongPressOptions {
  threshold?: number // ms to wait before triggering
  onLongPress: () => void
  onProgress?: (progress: number) => void // 0-1
}

export function useLongPress({ threshold = 1500, onLongPress, onProgress }: LongPressOptions) {
  const [isPressed, setIsPressed] = useState(false)
  const [progress, setProgress] = useState(0)
  const startTimeRef = useRef<number>(0)
  const animationFrameRef = useRef<number>(0)

  const startPress = useCallback(() => {
    setIsPressed(true)
    startTimeRef.current = Date.now()

    const updateProgress = () => {
      const elapsed = Date.now() - startTimeRef.current
      const newProgress = Math.min(elapsed / threshold, 1)

      setProgress(newProgress)
      onProgress?.(newProgress)

      if (newProgress >= 1) {
        onLongPress()
        setIsPressed(false)
        setProgress(0)
      } else {
        animationFrameRef.current = requestAnimationFrame(updateProgress)
      }
    }

    animationFrameRef.current = requestAnimationFrame(updateProgress)
  }, [threshold, onLongPress, onProgress])

  const endPress = useCallback(() => {
    setIsPressed(false)
    setProgress(0)
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [])

  const handlers = {
    onMouseDown: startPress,
    onMouseUp: endPress,
    onMouseLeave: endPress,
    onTouchStart: startPress,
    onTouchEnd: endPress,
  }

  return {
    isPressed,
    progress,
    handlers,
  }
}
