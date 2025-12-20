import { useEffect, useRef, useCallback } from 'react'
import { animateValue, randomInRange } from '../utils/easing'

/**
 * Hook for Meander feature - smooth random volume fluctuations
 * @param {boolean} isActive - Whether meander is enabled
 * @param {Object} sounds - Sound states { id: { volume, isPlaying } }
 * @param {function} setVolume - Function to set volume for a sound id
 */
export function useMeander(isActive, sounds, setVolume) {
  const timeoutsRef = useRef(new Map())
  const cancelAnimationsRef = useRef(new Map())
  const baseVolumesRef = useRef(new Map())

  // Use refs to avoid effect re-runs when callbacks change
  const setVolumeRef = useRef(setVolume)
  const soundsRef = useRef(sounds)

  // Keep refs updated
  useEffect(() => {
    setVolumeRef.current = setVolume
    soundsRef.current = sounds
  })

  // Store base volumes when meander starts
  useEffect(() => {
    if (isActive) {
      // Capture current volumes as base
      Object.entries(sounds).forEach(([id, state]) => {
        if (state.isPlaying && state.volume > 0) {
          baseVolumesRef.current.set(id, state.volume)
        }
      })
    } else {
      // Restore base volumes when meander stops
      baseVolumesRef.current.forEach((baseVolume, id) => {
        if (sounds[id]?.isPlaying) {
          setVolume(id, baseVolume)
        }
      })
      baseVolumesRef.current.clear()
    }
  }, [isActive])

  // Update base volume when user changes it during meander
  const updateBaseVolume = useCallback((id, volume) => {
    if (isActive && volume > 0) {
      baseVolumesRef.current.set(id, volume)
    } else if (volume === 0) {
      baseVolumesRef.current.delete(id)
    }
  }, [isActive])

  // Main meander effect - only depends on isActive to avoid constant restarts
  useEffect(() => {
    if (!isActive) {
      // Cleanup when disabled
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current.clear()
      cancelAnimationsRef.current.forEach(cancel => cancel())
      cancelAnimationsRef.current.clear()
      return
    }

    const fluctuate = (id) => {
      const baseVolume = baseVolumesRef.current.get(id)
      const currentSounds = soundsRef.current
      if (!baseVolume || !currentSounds[id]?.isPlaying) {
        timeoutsRef.current.delete(id)
        return
      }

      // Calculate fluctuation: ±20% of base volume
      const fluctuationRange = baseVolume * 0.2
      const targetVolume = Math.max(
        1, // Minimum 1 to keep sound audible
        Math.min(
          100,
          baseVolume + randomInRange(-fluctuationRange, fluctuationRange)
        )
      )

      const currentVolume = currentSounds[id]?.volume || baseVolume

      // Animate to target volume over 2 seconds
      const cancelFn = animateValue(
        currentVolume,
        targetVolume,
        2000,
        (value) => setVolumeRef.current(id, Math.round(value)),
        () => {
          cancelAnimationsRef.current.delete(id)
        }
      )
      // Wrap cancel to also clean up the ref entry
      const cancelAnimation = () => {
        cancelFn()
        cancelAnimationsRef.current.delete(id)
      }
      cancelAnimationsRef.current.set(id, cancelAnimation)

      // Schedule next fluctuation (5-15 seconds)
      const nextDelay = randomInRange(5000, 15000)
      const timeout = setTimeout(() => fluctuate(id), nextDelay)
      timeoutsRef.current.set(id, timeout)
    }

    // Start fluctuation for all playing sounds
    const currentSounds = soundsRef.current
    Object.entries(currentSounds).forEach(([id, state]) => {
      if (state.isPlaying && state.volume > 0 && !timeoutsRef.current.has(id)) {
        // Start with random delay to desynchronize
        const initialDelay = randomInRange(0, 3000)
        const timeout = setTimeout(() => fluctuate(id), initialDelay)
        timeoutsRef.current.set(id, timeout)
      }
    })

    // Cleanup function
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current.clear()
      cancelAnimationsRef.current.forEach(cancel => cancel())
      cancelAnimationsRef.current.clear()
    }
  }, [isActive])

  return { updateBaseVolume }
}
