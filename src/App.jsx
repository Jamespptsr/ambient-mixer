import { useEffect, useCallback } from 'react'
import { AudioProvider, useAudioState } from './context/AudioContext'
import SoundGrid from './components/SoundGrid'
import MasterControls from './components/MasterControls'

function AppContent() {
  const { state, dispatch, audioEngine } = useAudioState()

  const activeCount = Object.values(state.sounds).filter(s => s.isPlaying).length

  const handleVolumeChange = useCallback((id, volume) => {
    dispatch({ type: 'SET_VOLUME', id, volume })
  }, [dispatch])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore if typing in an input
      if (e.target.tagName === 'INPUT') return

      if (e.code === 'Space') {
        e.preventDefault()
        dispatch({ type: 'TOGGLE_PLAY' })
      }
      if (e.code === 'KeyM') {
        dispatch({ type: 'TOGGLE_MUTE' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [dispatch])

  return (
    <div className="min-h-screen bg-slate-950 pb-28">
      <header className="p-6 text-center">
        <h1 className="text-2xl font-bold text-white">Ambient Mixer</h1>
        <p className="text-slate-400 text-sm mt-1">Mix your perfect soundscape</p>
      </header>

      <SoundGrid
        soundStates={state.sounds}
        onVolumeChange={handleVolumeChange}
        masterVolume={state.masterVolume}
        isMuted={state.isMuted}
        isPlaying={state.isPlaying}
      />

      <MasterControls
        isPlaying={state.isPlaying}
        isMuted={state.isMuted}
        masterVolume={state.masterVolume}
        activeCount={activeCount}
        meanderActive={state.meanderActive}
        onPlayPause={() => dispatch({ type: 'TOGGLE_PLAY' })}
        onMute={() => dispatch({ type: 'TOGGLE_MUTE' })}
        onMasterVolume={(vol) => dispatch({ type: 'SET_MASTER_VOLUME', volume: vol })}
        onMeanderToggle={() => dispatch({ type: 'TOGGLE_MEANDER' })}
      />
    </div>
  )
}

export default function App() {
  return (
    <AudioProvider>
      <AppContent />
    </AudioProvider>
  )
}
