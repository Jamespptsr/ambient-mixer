import { useState, useRef, useCallback, useEffect } from 'react'

const FADE_DURATION = 30 // seconds for final fade-out

export function useSleepTimer({ onFadeUpdate, onTimerEnd }) {
  const [timerRemaining, setTimerRemaining] = useState(0)
  const [isActive, setIsActive] = useState(false)
  const intervalRef = useRef(null)
  const originalVolumeRef = useRef(null)
  const onFadeUpdateRef = useRef(onFadeUpdate)
  const onTimerEndRef = useRef(onTimerEnd)

  // Keep refs current
  onFadeUpdateRef.current = onFadeUpdate
  onTimerEndRef.current = onTimerEnd

  const clearTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
  }, [])

  const cancelTimer = useCallback(() => {
    clearTimer()
    // Restore original volume if we were fading
    if (originalVolumeRef.current !== null && onFadeUpdateRef.current) {
      onFadeUpdateRef.current(originalVolumeRef.current)
    }
    originalVolumeRef.current = null
    setTimerRemaining(0)
    setIsActive(false)
  }, [clearTimer])

  const startTimer = useCallback((minutes, currentMasterVolume) => {
    clearTimer()
    const totalSeconds = minutes * 60
    originalVolumeRef.current = currentMasterVolume
    setTimerRemaining(totalSeconds)
    setIsActive(true)

    intervalRef.current = setInterval(() => {
      setTimerRemaining(prev => {
        const next = prev - 1
        if (next <= 0) {
          // Timer done — pause playback, restore volume
          clearInterval(intervalRef.current)
          intervalRef.current = null
          setIsActive(false)
          onTimerEndRef.current()
          // Restore master volume for next session
          if (originalVolumeRef.current !== null && onFadeUpdateRef.current) {
            onFadeUpdateRef.current(originalVolumeRef.current)
          }
          originalVolumeRef.current = null
          return 0
        }
        // Fade out during last FADE_DURATION seconds
        if (next <= FADE_DURATION && originalVolumeRef.current !== null && onFadeUpdateRef.current) {
          const ratio = next / FADE_DURATION
          const fadedVolume = Math.round(originalVolumeRef.current * ratio)
          onFadeUpdateRef.current(fadedVolume)
        }
        return next
      })
    }, 1000)
  }, [clearTimer])

  // Cleanup on unmount
  useEffect(() => {
    return clearTimer
  }, [clearTimer])

  return { timerRemaining, isActive, startTimer, cancelTimer }
}
