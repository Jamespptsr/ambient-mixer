import { useCallback } from 'react'
import SoundCard from './SoundCard'
import { SOUNDS } from '../data/sounds'

export default function SoundGrid({ soundStates, onVolumeChange }) {
  const handleVolumeChange = useCallback((id) => (volume) => {
    onVolumeChange(id, volume)
  }, [onVolumeChange])

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-4 max-w-6xl mx-auto">
      {SOUNDS.map(sound => (
        <SoundCard
          key={sound.id}
          sound={sound}
          volume={soundStates[sound.id]?.volume || 0}
          isPlaying={soundStates[sound.id]?.isPlaying || false}
          onVolumeChange={handleVolumeChange(sound.id)}
        />
      ))}
    </div>
  )
}
