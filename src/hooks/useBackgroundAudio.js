import { useEffect, useRef } from 'react'

function isTauriAndroid() {
  return !!window.__TAURI_INTERNALS__ && /android/i.test(navigator.userAgent)
}

export function useBackgroundAudio(sounds) {
  const serviceRunning = useRef(false)

  useEffect(() => {
    if (!isTauriAndroid()) return

    const hasActiveSounds = Object.values(sounds).some(s => s.isPlaying)

    if (hasActiveSounds && !serviceRunning.current) {
      serviceRunning.current = true
      window.__TAURI_INTERNALS__
        .invoke('plugin:background-audio|start_background_audio')
        .catch(err => console.warn('Failed to start background audio service:', err))
    } else if (!hasActiveSounds && serviceRunning.current) {
      serviceRunning.current = false
      window.__TAURI_INTERNALS__
        .invoke('plugin:background-audio|stop_background_audio')
        .catch(err => console.warn('Failed to stop background audio service:', err))
    }
  }, [sounds])
}
