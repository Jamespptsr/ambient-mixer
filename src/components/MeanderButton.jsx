import { Shuffle } from 'lucide-react'

export default function MeanderButton({ active, onClick }) {
  return (
    <button
      onClick={onClick}
      title="Meander: Random volume fluctuations"
      className={`
        relative p-3 rounded-lg transition-all duration-200
        ${active
          ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30'
          : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-300'}
      `}
    >
      {/* Pulsing ring when active */}
      {active && (
        <span className="absolute inset-0 rounded-lg bg-cyan-500/30 animate-meander-pulse" />
      )}
      <Shuffle size={20} className="relative z-10" />
    </button>
  )
}
