import { useRef, useCallback, useMemo } from 'react'

// LRU cache config: only keep N most recently used buffers in memory
// Each 30s mono 22kHz buffer ≈ 2.6MB decoded
const MAX_CACHED_BUFFERS = 3

/**
 * Hook for managing Web Audio API audio playback with seamless looping
 */
export function useAudioEngine() {
  const audioContextRef = useRef(null)
  const masterGainRef = useRef(null)
  const soundsRef = useRef(new Map()) // id -> { source, gainNode, buffer }
  const buffersRef = useRef(new Map()) // id -> AudioBuffer (cached)
  const bufferAccessOrderRef = useRef([]) // LRU order tracking: most recent at end
  const stopTimeoutsRef = useRef(new Map()) // id -> timeout ID for stopSound fade-out
  const masterVolumeRef = useRef(1) // Store master volume separately
  const isMutedRef = useRef(false) // Store mute state separately

  /**
   * Update LRU order and evict old buffers if needed
   */
  const touchBuffer = useCallback((id) => {
    const order = bufferAccessOrderRef.current
    const idx = order.indexOf(id)
    if (idx !== -1) {
      order.splice(idx, 1)
    }
    order.push(id)

    // Evict oldest buffers if over limit (but keep playing ones)
    while (order.length > MAX_CACHED_BUFFERS) {
      const oldestId = order[0]
      // Don't evict if currently playing
      if (!soundsRef.current.has(oldestId)) {
        order.shift()
        buffersRef.current.delete(oldestId)
      } else {
        // Move playing sound to end and try next
        order.shift()
        order.push(oldestId)
        // If all remaining are playing, stop evicting
        if (order.every(id => soundsRef.current.has(id))) {
          break
        }
      }
    }
  }, [])

  /**
   * Initialize AudioContext (must be called after user interaction)
   */
  const initializeContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)()
      masterGainRef.current = audioContextRef.current.createGain()
      masterGainRef.current.connect(audioContextRef.current.destination)
      // Apply stored master volume and mute state
      const effectiveVolume = isMutedRef.current ? 0 : masterVolumeRef.current
      masterGainRef.current.gain.value = effectiveVolume
    }
    // Resume if suspended (autoplay policy)
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume()
    }
    return audioContextRef.current
  }, [])

  /**
   * Load and decode audio file into AudioBuffer
   */
  const loadSound = useCallback(async (id, url) => {
    // Return cached buffer if available
    if (buffersRef.current.has(id)) {
      touchBuffer(id) // Update LRU order
      return buffersRef.current.get(id)
    }

    initializeContext()

    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`Failed to fetch ${url}: ${response.status}`)
      }
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer)
      buffersRef.current.set(id, audioBuffer)
      touchBuffer(id) // Add to LRU and potentially evict old buffers
      return audioBuffer
    } catch (error) {
      console.error(`Error loading sound ${id}:`, error)
      throw error
    }
  }, [initializeContext, touchBuffer])

  /**
   * Start playing a sound with seamless loop
   */
  const playSound = useCallback((id, buffer) => {
    initializeContext()

    // Stop existing instance if any
    const existing = soundsRef.current.get(id)
    if (existing) {
      try {
        existing.source.stop()
      } catch (e) {
        // Ignore if already stopped
      }
    }

    const source = audioContextRef.current.createBufferSource()
    source.buffer = buffer
    source.loop = true // Seamless looping

    const gainNode = audioContextRef.current.createGain()
    gainNode.gain.value = 0 // Start at 0, will be set by setVolume

    source.connect(gainNode)
    gainNode.connect(masterGainRef.current)

    source.start(0)
    soundsRef.current.set(id, { source, gainNode, buffer })
  }, [initializeContext])

  /**
   * Stop a playing sound
   */
  const stopSound = useCallback((id) => {
    const sound = soundsRef.current.get(id)
    if (sound) {
      // Cancel any pending stop timeout for this sound
      const existingTimeout = stopTimeoutsRef.current.get(id)
      if (existingTimeout) {
        clearTimeout(existingTimeout)
        stopTimeoutsRef.current.delete(id)
      }

      // Fade out to avoid click
      const now = audioContextRef.current.currentTime
      sound.gainNode.gain.setValueAtTime(sound.gainNode.gain.value, now)
      sound.gainNode.gain.linearRampToValueAtTime(0, now + 0.1)

      // Stop after fade out
      const timeoutId = setTimeout(() => {
        try {
          sound.source.stop()
        } catch (e) {
          // Ignore if already stopped
        }
        soundsRef.current.delete(id)
        stopTimeoutsRef.current.delete(id)
      }, 100)
      stopTimeoutsRef.current.set(id, timeoutId)
    }
  }, [])

  /**
   * Set volume for a specific sound with smooth transition
   */
  const setVolume = useCallback((id, volume, transitionTime = 0.1) => {
    const sound = soundsRef.current.get(id)
    if (sound && audioContextRef.current) {
      const now = audioContextRef.current.currentTime
      sound.gainNode.gain.cancelScheduledValues(now)
      sound.gainNode.gain.setValueAtTime(sound.gainNode.gain.value, now)
      sound.gainNode.gain.linearRampToValueAtTime(
        Math.max(0, Math.min(1, volume)),
        now + transitionTime
      )
    }
  }, [])

  /**
   * Get current volume for a sound
   */
  const getVolume = useCallback((id) => {
    const sound = soundsRef.current.get(id)
    return sound ? sound.gainNode.gain.value : 0
  }, [])

  /**
   * Set master volume
   */
  const setMasterVolume = useCallback((volume) => {
    masterVolumeRef.current = Math.max(0, Math.min(1, volume))
    if (masterGainRef.current && audioContextRef.current && !isMutedRef.current) {
      const now = audioContextRef.current.currentTime
      masterGainRef.current.gain.cancelScheduledValues(now)
      masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now)
      masterGainRef.current.gain.linearRampToValueAtTime(masterVolumeRef.current, now + 0.1)
    }
  }, [])

  /**
   * Mute/unmute master output
   */
  const setMuted = useCallback((muted) => {
    isMutedRef.current = muted
    if (masterGainRef.current && audioContextRef.current) {
      const now = audioContextRef.current.currentTime
      const targetVolume = muted ? 0 : masterVolumeRef.current
      masterGainRef.current.gain.cancelScheduledValues(now)
      masterGainRef.current.gain.setValueAtTime(masterGainRef.current.gain.value, now)
      masterGainRef.current.gain.linearRampToValueAtTime(targetVolume, now + 0.1)
    }
  }, [])

  /**
   * Pause/resume all sounds (suspend AudioContext)
   */
  const setPaused = useCallback((paused) => {
    if (audioContextRef.current) {
      if (paused) {
        audioContextRef.current.suspend()
      } else {
        audioContextRef.current.resume()
      }
    }
  }, [])

  /**
   * Check if a sound is currently playing
   */
  const isPlaying = useCallback((id) => {
    return soundsRef.current.has(id)
  }, [])

  /**
   * Cleanup all audio resources
   */
  const cleanup = useCallback(() => {
    // Cancel all pending stop timeouts
    stopTimeoutsRef.current.forEach(clearTimeout)
    stopTimeoutsRef.current.clear()

    // Stop all playing sounds
    soundsRef.current.forEach(({ source }) => {
      try {
        source.stop()
      } catch (e) {
        // Ignore
      }
    })
    soundsRef.current.clear()

    // Clear cached audio buffers and LRU order to free memory
    buffersRef.current.clear()
    bufferAccessOrderRef.current = []

    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close()
    }
  }, [])

  return useMemo(() => ({
    initializeContext,
    loadSound,
    playSound,
    stopSound,
    setVolume,
    getVolume,
    setMasterVolume,
    setMuted,
    setPaused,
    isPlaying,
    cleanup
  }), [
    initializeContext,
    loadSound,
    playSound,
    stopSound,
    setVolume,
    getVolume,
    setMasterVolume,
    setMuted,
    setPaused,
    isPlaying,
    cleanup
  ])
}
