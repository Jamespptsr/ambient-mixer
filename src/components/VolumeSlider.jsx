import { memo } from 'react'

const VolumeSlider = memo(function VolumeSlider({ value, onChange, color = '#22D3EE' }) {
  const gradientStyle = {
    background: `linear-gradient(to right, ${color} ${value}%, #334155 ${value}%)`
  }

  return (
    <input
      type="range"
      min="0"
      max="100"
      value={value}
      onChange={(e) => onChange(parseInt(e.target.value, 10))}
      className="w-full h-2 rounded-full cursor-pointer slider-thumb"
      style={gradientStyle}
    />
  )
})

export default VolumeSlider
