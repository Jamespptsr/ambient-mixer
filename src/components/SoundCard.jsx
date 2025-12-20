import { memo } from 'react'
import VolumeSlider from './VolumeSlider'

const SoundCard = memo(function SoundCard({ sound, volume, isPlaying, onVolumeChange }) {
  const IconComponent = sound.icon

  return (
    <div
      className={`
        relative bg-slate-800 rounded-xl p-4 border
        transition-all duration-300 ease-out
        ${isPlaying
          ? 'border-cyan-500/40 shadow-lg'
          : 'border-slate-700 hover:border-slate-600'}
      `}
      style={{
        boxShadow: isPlaying ? `0 0 30px -5px ${sound.color}30` : undefined
      }}
    >
      {/* Background glow effect when playing */}
      {isPlaying && (
        <div
          className="absolute inset-0 rounded-xl opacity-10 blur-xl -z-10 transition-opacity duration-500"
          style={{ backgroundColor: sound.color }}
        />
      )}

      <div className="flex flex-col items-center gap-3">
        {/* Icon */}
        <div
          className={`
            p-3 rounded-full transition-all duration-300
            ${isPlaying
              ? 'bg-slate-700/50'
              : 'bg-slate-700/30'}
          `}
        >
          <IconComponent
            size={28}
            className="transition-colors duration-300"
            style={{ color: isPlaying ? sound.color : '#94A3B8' }}
          />
        </div>

        {/* Name */}
        <span className={`
          text-sm font-medium transition-colors duration-300
          ${isPlaying ? 'text-white' : 'text-slate-300'}
        `}>
          {sound.name}
        </span>

        {/* Volume Slider */}
        <div className="w-full px-1">
          <VolumeSlider
            value={volume}
            onChange={onVolumeChange}
            color={sound.color}
          />
        </div>

        {/* Volume percentage */}
        <span className="text-xs text-slate-500 tabular-nums">
          {volume}%
        </span>
      </div>
    </div>
  )
})

export default SoundCard
