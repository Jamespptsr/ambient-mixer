import { createContext, useContext, useReducer, useRef, useEffect, useCallback } from 'react'
import { SOUNDS } from '../data/sounds'
import { useAudioEngine } from '../hooks/useAudioEngine'
import { useMeander } from '../hooks/useMeander'
import { useBackgroundAudio } from '../hooks/useBackgroundAudio'
import { loadPreferences, savePreferences } from '../hooks/usePreferences'

const AudioStateContext = createContext(null)

// Build initial state, merging saved preferences
function buildInitialState() {
  const defaults = {
    sounds: SOUNDS.reduce((acc, sound) => ({
      ...acc,
      [sound.id]: { volume: 0, isPlaying: false, isLoaded: false }
    }), {}),
    masterVolume: 80,
    isMuted: false,
    isPlaying: false,
    meanderActive: false
  }

  const prefs = loadPreferences()
  if (!prefs) return defaults

  // Restore saved volumes but keep isPlaying false (user must press Play)
  const sounds = { ...defaults.sounds }
  for (const [id, volume] of Object.entries(prefs.soundVolumes)) {
    if (sounds[id]) {
      sounds[id] = { ...sounds[id], volume, isPlaying: false }
    }
  }

  return {
    ...defaults,
    sounds,
    masterVolume: prefs.masterVolume,
    meanderActive: prefs.meanderActive,
  }
}

const initialState = buildInitialState()

// Reducer
function audioReducer(state, action) {
  switch (action.type) {
    case 'SET_VOLUME':
      return {
        ...state,
        sounds: {
          ...state.sounds,
          [action.id]: {
            ...state.sounds[action.id],
            volume: action.volume,
            isPlaying: action.volume > 0
          }
        }
      }

    case 'SET_MASTER_VOLUME':
      return { ...state, masterVolume: action.volume }

    case 'TOGGLE_MUTE':
      return { ...state, isMuted: !state.isMuted }

    case 'TOGGLE_PLAY':
      return { ...state, isPlaying: !state.isPlaying }

    case 'TOGGLE_MEANDER':
      return { ...state, meanderActive: !state.meanderActive }

    case 'SET_LOADED':
      return {
        ...state,
        sounds: {
          ...state.sounds,
          [action.id]: { ...state.sounds[action.id], isLoaded: true }
        }
      }

    default:
      return state
  }
}

export function AudioProvider({ children }) {
  const [state, dispatch] = useReducer(audioReducer, initialState)
  const audioEngine = useAudioEngine()
  useBackgroundAudio(state.sounds)
  const loadingRef = useRef(new Set())
  const stateRef = useRef(state)
  stateRef.current = state

  // Handle volume changes for individual sounds
  const handleVolumeChange = useCallback(async (id, volume) => {
    const soundConfig = SOUNDS.find(s => s.id === id)
    if (!soundConfig) return

    // Load sound if not loaded yet
    if (!state.sounds[id]?.isLoaded && !loadingRef.current.has(id)) {
      loadingRef.current.add(id)
      try {
        const buffer = await audioEngine.loadSound(id, soundConfig.src)
        dispatch({ type: 'SET_LOADED', id })
        loadingRef.current.delete(id)

        if (volume > 0) {
          await audioEngine.playSound(id, buffer)
          audioEngine.setVolume(id, volume / 100)
        }
      } catch (error) {
        console.error(`Failed to load ${id}:`, error)
        loadingRef.current.delete(id)
        return
      }
    } else if (state.sounds[id]?.isLoaded) {
      // Sound is loaded
      if (volume > 0 && !audioEngine.isPlaying(id)) {
        // Start playing
        const buffer = await audioEngine.loadSound(id, soundConfig.src)
        await audioEngine.playSound(id, buffer)
        audioEngine.setVolume(id, volume / 100)
      } else if (volume === 0 && audioEngine.isPlaying(id)) {
        // Stop playing
        audioEngine.stopSound(id)
      } else if (audioEngine.isPlaying(id)) {
        // Just update volume
        audioEngine.setVolume(id, volume / 100)
      }
    }

    dispatch({ type: 'SET_VOLUME', id, volume })
  }, [state.sounds, audioEngine])

  // Use meander hook
  const { updateBaseVolume } = useMeander(
    state.meanderActive,
    state.sounds,
    handleVolumeChange
  )

  // Sync master volume
  useEffect(() => {
    audioEngine.setMasterVolume(state.masterVolume / 100)
  }, [state.masterVolume, audioEngine])

  // Sync mute state
  useEffect(() => {
    audioEngine.setMuted(state.isMuted)
  }, [state.isMuted, audioEngine])

  // Sync play/pause state
  useEffect(() => {
    audioEngine.setPaused(!state.isPlaying)
  }, [state.isPlaying, audioEngine])

  // Save preferences on state changes (debounced)
  const saveTimeoutRef = useRef(null)
  useEffect(() => {
    clearTimeout(saveTimeoutRef.current)
    saveTimeoutRef.current = setTimeout(() => {
      savePreferences(state)
    }, 500)
    return () => clearTimeout(saveTimeoutRef.current)
  }, [state])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      audioEngine.cleanup()
    }
  }, [audioEngine])

  // Custom dispatch that handles volume changes
  // For TOGGLE_MUTE and TOGGLE_PLAY, call initializeContext() directly here
  // to ensure AudioContext.resume() runs in the user gesture context.
  // Some browsers silently reject resume() called from useEffect (outside gesture).
  const enhancedDispatch = useCallback((action) => {
    if (action.type === 'SET_VOLUME') {
      handleVolumeChange(action.id, action.volume)
      updateBaseVolume(action.id, action.volume)
    } else if (action.type === 'TOGGLE_MUTE') {
      if (stateRef.current.isMuted) {
        audioEngine.initializeContext()
      }
      dispatch(action)
    } else if (action.type === 'TOGGLE_PLAY') {
      if (!stateRef.current.isPlaying) {
        audioEngine.initializeContext()
      }
      dispatch(action)
    } else {
      dispatch(action)
    }
  }, [handleVolumeChange, updateBaseVolume, audioEngine])

  return (
    <AudioStateContext.Provider value={{
      state,
      dispatch: enhancedDispatch,
      audioEngine
    }}>
      {children}
    </AudioStateContext.Provider>
  )
}

export function useAudioState() {
  const context = useContext(AudioStateContext)
  if (!context) {
    throw new Error('useAudioState must be used within an AudioProvider')
  }
  return context
}
