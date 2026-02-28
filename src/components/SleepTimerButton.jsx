import { useState, useRef, useEffect } from 'react'
import { Clock } from 'lucide-react'

const PRESETS = [15, 30, 45, 60]

function formatTime(seconds) {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

export default function SleepTimerButton({ isActive, timerRemaining, onStart, onCancel }) {
  const [showPopup, setShowPopup] = useState(false)
  const popupRef = useRef(null)
  const buttonRef = useRef(null)

  // Close popup on outside click
  useEffect(() => {
    if (!showPopup) return
    const handleClick = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target) &&
          buttonRef.current && !buttonRef.current.contains(e.target)) {
        setShowPopup(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showPopup])

  const handleButtonClick = () => {
    if (isActive) {
      onCancel()
    } else {
      setShowPopup(v => !v)
    }
  }

  const handlePreset = (minutes) => {
    setShowPopup(false)
    onStart(minutes)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        onClick={handleButtonClick}
        title={isActive ? `Sleep timer: ${formatTime(timerRemaining)} — click to cancel` : 'Sleep timer'}
        className="p-2.5 sm:p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center gap-1.5"
        style={isActive ? {
          backgroundColor: `color-mix(in srgb, var(--accent) 20%, transparent)`,
          color: 'var(--accent)',
        } : {
          backgroundColor: 'var(--bg-card-light)',
          color: 'var(--text-tertiary)',
        }}
      >
        <Clock size={20} />
        {isActive && (
          <span className="text-xs font-medium tabular-nums">
            {formatTime(timerRemaining)}
          </span>
        )}
      </button>

      {/* Preset popup */}
      {showPopup && (
        <div
          ref={popupRef}
          className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 rounded-xl p-2 flex gap-1.5 shadow-lg z-50"
          style={{
            backgroundColor: 'var(--bg-card)',
            border: '1px solid var(--border-track)',
          }}
        >
          {PRESETS.map(min => (
            <button
              key={min}
              onClick={() => handlePreset(min)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 hover:scale-105 active:scale-95 whitespace-nowrap"
              style={{
                backgroundColor: 'var(--bg-card-light)',
                color: 'var(--text-secondary)',
              }}
            >
              {min}m
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
