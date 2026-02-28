import { memo } from 'react'

const VolumeSlider = memo(function VolumeSlider({ value, onChange, color = 'var(--accent)' }) {
  // Create a gradient with smooth transition at the value point
  const gradientStyle = {
    background: `linear-gradient(to right,
      ${color} 0%,
      ${color} ${value}%,
      var(--slider-track) ${value}%,
      var(--slider-track) 100%)`
  }

  return (
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="w-full h-2 rounded-full cursor-pointer slider-thumb touch-pan-y"
      style={gradientStyle}
    />
  )
})

export default VolumeSlider
