import { useEffect, useCallback } from 'react'
import { AudioProvider, useAudioState } from './context/AudioContext'
import SoundGrid from './components/SoundGrid'
import MasterControls from './components/MasterControls'
import useTheme from './hooks/useTheme'
import { useSleepTimer } from './hooks/useSleepTimer'

function AppContent() {
  const { state, dispatch, audioEngine } = useAudioState()
  const { theme, setTheme, toggleTheme } = useTheme()

  const activeCount = Object.values(state.sounds).filter(s => s.isPlaying).length

  // Sleep timer
  const { timerRemaining, isActive: timerActive, startTimer, cancelTimer } = useSleepTimer({
    onFadeUpdate: (volume) => dispatch({ type: 'SET_MASTER_VOLUME', volume }),
    onTimerEnd: () => {
      if (state.isPlaying) dispatch({ type: 'TOGGLE_PLAY' })
    },
  })

  const handleTimerStart = useCallback((minutes) => {
    startTimer(minutes, state.masterVolume)
  }, [startTimer, state.masterVolume])

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
    <div className="min-h-screen pb-4 sm:pb-6" style={{ backgroundColor: 'var(--bg-main)' }}>
      <header className="px-4 py-3 sm:p-6 text-center">
        <h1 className="text-lg sm:text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>Take It Easy</h1>
        <p className="text-xs sm:text-sm mt-0.5 sm:mt-1" style={{ color: 'var(--text-tertiary)' }}>We are all imperfectly beautiful.</p>
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
        theme={theme}
        timerActive={timerActive}
        timerRemaining={timerRemaining}
        onPlayPause={() => dispatch({ type: 'TOGGLE_PLAY' })}
        onMute={() => dispatch({ type: 'TOGGLE_MUTE' })}
        onMasterVolume={(vol) => dispatch({ type: 'SET_MASTER_VOLUME', volume: vol })}
        onMeanderToggle={() => dispatch({ type: 'TOGGLE_MEANDER' })}
        onTimerStart={handleTimerStart}
        onTimerCancel={cancelTimer}
        onThemeChange={setTheme}
        onThemeToggle={toggleTheme}
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
