import { Play, Pause, VolumeX, Volume2 } from 'lucide-react'
import MeanderButton from './MeanderButton'
import VolumeSlider from './VolumeSlider'

export default function MasterControls({
  isPlaying,
  isMuted,
  masterVolume,
  activeCount,
  meanderActive,
  onPlayPause,
  onMute,
  onMasterVolume,
  onMeanderToggle
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 px-4 py-4 z-50">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
        {/* Play/Pause Button */}
        <button
          onClick={onPlayPause}
          className={`
            p-3 rounded-full transition-all duration-200
            ${isPlaying
              ? 'bg-cyan-500 hover:bg-cyan-400 text-slate-900'
              : 'bg-slate-700 hover:bg-slate-600 text-white'}
          `}
          title={isPlaying ? 'Pause all (Space)' : 'Play all (Space)'}
        >
          {isPlaying ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
        </button>

        {/* Active sounds count */}
        <div className="text-slate-400 text-sm min-w-[80px] text-center">
          <span className="text-cyan-400 font-medium">{activeCount}</span>
          <span className="ml-1">sound{activeCount !== 1 ? 's' : ''}</span>
        </div>

        {/* Master Volume */}
        <div className="flex items-center gap-3 flex-1 max-w-xs">
          <Volume2
            size={20}
            className={`flex-shrink-0 transition-colors ${
              isMuted ? 'text-slate-600' : 'text-slate-400'
            }`}
          />
          <VolumeSlider
            value={isMuted ? 0 : masterVolume}
            onChange={onMasterVolume}
            color="#22D3EE"
          />
          <span className="text-xs text-slate-500 w-8 text-right tabular-nums">
            {isMuted ? '0' : masterVolume}%
          </span>
        </div>

        {/* Mute Button */}
        <button
          onClick={onMute}
          title="Mute all (M)"
          className={`
            p-3 rounded-lg transition-all duration-200
            ${isMuted
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'}
          `}
        >
          <VolumeX size={20} />
        </button>

        {/* Meander Button */}
        <MeanderButton active={meanderActive} onClick={onMeanderToggle} />
      </div>

      {/* Keyboard shortcuts hint */}
      <div className="max-w-4xl mx-auto mt-2 flex justify-center gap-4 text-xs text-slate-600">
        <span><kbd className="px-1 py-0.5 bg-slate-800 rounded">Space</kbd> Play/Pause</span>
        <span><kbd className="px-1 py-0.5 bg-slate-800 rounded">M</kbd> Mute</span>
      </div>
    </div>
  )
}
