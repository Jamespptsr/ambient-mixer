import { Play, Pause, VolumeX, RotateCcw } from 'lucide-react'
import MeanderButton from './MeanderButton'
import VolumeSlider from './VolumeSlider'
import { THEMES } from '../hooks/useTheme'

export default function MasterControls({
  isPlaying,
  isMuted,
  masterVolume,
  activeCount,
  meanderActive,
  theme,
  onPlayPause,
  onMute,
  onMasterVolume,
  onMeanderToggle,
  onThemeChange,
  onThemeToggle
}) {
  return (
    <div className="px-2 sm:px-4 pt-3 sm:pt-5 pb-2 sm:pb-4 max-w-6xl mx-auto safe-bottom">
      {/* Row 1: Play/Pause + Master Volume */}
      <div className="flex items-center gap-3 sm:gap-4">
        <button
          onClick={onPlayPause}
          className="p-3 sm:p-3.5 rounded-full transition-all duration-200 flex-shrink-0 hover:scale-105 active:scale-95 shadow-lg"
          style={isPlaying ? {
            backgroundColor: 'var(--accent)',
            color: 'var(--bg-main)',
            boxShadow: `0 4px 14px color-mix(in srgb, var(--accent) 30%, transparent)`,
          } : {
            backgroundColor: 'var(--bg-card-light)',
            color: 'var(--text-primary)',
            boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
          }}
          title={isPlaying ? 'Pause all (Space)' : 'Play all (Space)'}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
        </button>

        <div className="flex-1">
          <VolumeSlider
            value={isMuted ? 0 : masterVolume}
            onChange={onMasterVolume}
          />
        </div>

        <span className="text-xs w-8 text-right tabular-nums flex-shrink-0" style={{ color: 'var(--text-quaternary)' }}>
          {isMuted ? '0' : masterVolume}%
        </span>
      </div>

      {/* Row 2: Mute / Reset / Meander + Theme dots */}
      <div className="flex items-center pt-3 sm:pt-4">
        <div className="flex gap-1 sm:gap-2 flex-1 justify-evenly">
          <button
            onClick={onMute}
            title="Mute all (M)"
            className="p-2.5 sm:p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            style={isMuted ? {
              backgroundColor: `color-mix(in srgb, var(--accent) 20%, transparent)`,
              color: 'var(--accent)',
            } : {
              backgroundColor: 'var(--bg-card-light)',
              color: 'var(--text-tertiary)',
            }}
          >
            <VolumeX size={20} />
          </button>

          <button
            onClick={() => window.location.reload()}
            title="Reset all"
            className="p-2.5 sm:p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
            style={{
              backgroundColor: 'var(--bg-card-light)',
              color: 'var(--text-tertiary)',
            }}
          >
            <RotateCcw size={20} />
          </button>

          <MeanderButton active={meanderActive} onClick={onMeanderToggle} />
        </div>

        {/* Theme color dots */}
        <div className="flex items-center gap-1.5 sm:gap-2 ml-3 sm:ml-4 pl-3 sm:pl-4" style={{ borderLeft: '1px solid var(--border-track)' }}>
          {THEMES.map(t => (
            <button
              key={t.id}
              onClick={() => onThemeChange(t.id)}
              title={t.label}
              className="rounded-full transition-all duration-200 hover:scale-125 active:scale-95 flex-shrink-0"
              style={{
                width: theme === t.id ? 20 : 16,
                height: theme === t.id ? 20 : 16,
                backgroundColor: t.color,
                boxShadow: theme === t.id
                  ? `0 0 8px ${t.color}, 0 0 2px ${t.color}`
                  : '0 1px 3px rgba(0,0,0,0.3)',
                opacity: theme === t.id ? 1 : 0.5,
                border: theme === t.id ? '2px solid rgba(255,255,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
