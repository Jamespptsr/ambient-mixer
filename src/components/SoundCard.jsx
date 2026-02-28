import { memo } from 'react'
import VolumeSlider from './VolumeSlider'

const SoundCard = memo(function SoundCard({ sound, volume, isPlaying, onVolumeChange, index = 0 }) {
  const IconComponent = sound.icon

  return (
    <div
      className={`
        relative rounded-xl sm:rounded-2xl p-2 sm:p-5 border
        transition-all duration-300 ease-out
        animate-card-enter stagger-${Math.min(index + 1, 10)}
        ${isPlaying
          ? 'shadow-xl card-glow'
          : 'hover:shadow-lg'}
      `}
      style={{
        background: `linear-gradient(to bottom right, var(--bg-card-light), var(--bg-card-dark))`,
        borderColor: isPlaying
          ? `color-mix(in srgb, var(--accent) 50%, transparent)`
          : `color-mix(in srgb, var(--border-track) 50%, transparent)`,
        boxShadow: isPlaying
          ? `0 0 40px -10px ${sound.color}40, 0 20px 40px -20px rgba(0,0,0,0.5)`
          : undefined,
        '--hover-border': 'var(--border-hover)',
      }}
      onMouseEnter={(e) => { if (!isPlaying) e.currentTarget.style.borderColor = 'var(--border-hover)' }}
      onMouseLeave={(e) => { if (!isPlaying) e.currentTarget.style.borderColor = `color-mix(in srgb, var(--border-track) 50%, transparent)` }}
    >
      {/* Background glow effect when playing */}
      {isPlaying && (
        <div
          className="absolute inset-0 rounded-xl sm:rounded-2xl opacity-15 blur-2xl -z-10 transition-opacity duration-500"
          style={{ backgroundColor: sound.color }}
        />
      )}

      <div className="flex flex-col items-center gap-1 sm:gap-4">
        {/* Icon with enhanced styling */}
        <div
          className="p-1.5 sm:p-4 rounded-full transition-all duration-300"
          style={{
            backgroundColor: isPlaying
              ? `color-mix(in srgb, var(--border-track) 60%, transparent)`
              : `color-mix(in srgb, var(--border-track) 30%, transparent)`,
            boxShadow: isPlaying ? `0 0 20px ${sound.color}30 inset` : undefined
          }}
        >
          <IconComponent
            size={20}
            className="transition-all duration-300 sm:w-8 sm:h-8"
            style={{
              color: isPlaying ? sound.color : 'var(--text-tertiary)',
              filter: isPlaying ? `drop-shadow(0 0 8px ${sound.color}60)` : undefined
            }}
          />
        </div>

        {/* Name with better typography */}
        <span
          className="text-xs sm:text-base font-medium transition-colors duration-300 text-center leading-tight"
          style={{ color: isPlaying ? 'var(--text-primary)' : 'var(--text-secondary)' }}
        >
          {sound.name}
        </span>

        {/* Volume Slider with larger touch area */}
        <div className="w-full px-0.5 sm:px-1 py-0 sm:py-1">
          <VolumeSlider
            value={volume}
            onChange={onVolumeChange}
            color={sound.color}
          />
        </div>

        {/* Volume percentage with min-width to prevent layout shift */}
        <span className="text-[10px] sm:text-sm tabular-nums min-w-[2.5rem] text-center" style={{ color: 'var(--text-quaternary)' }}>
          {volume}%
        </span>
      </div>
    </div>
  )
})

export default SoundCard
