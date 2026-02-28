import { Shuffle } from 'lucide-react'

export default function MeanderButton({ active, onClick }) {
  return (
    <button
      onClick={onClick}
      title="Meander: Random volume fluctuations"
      className="relative p-2.5 sm:p-3 rounded-xl transition-all duration-200 hover:scale-105 active:scale-95"
      style={active ? {
        backgroundColor: `color-mix(in srgb, var(--accent) 20%, transparent)`,
        color: 'var(--accent)',
      } : {
        backgroundColor: 'var(--bg-card-light)',
        color: 'var(--text-tertiary)',
      }}
    >
      {/* Pulsing ring when active */}
      {active && (
        <span
          className="absolute inset-0 rounded-xl animate-meander-pulse"
          style={{ backgroundColor: `color-mix(in srgb, var(--accent) 30%, transparent)` }}
        />
      )}
      <Shuffle size={20} className="relative z-10" />
    </button>
  )
}
