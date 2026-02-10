'use client'
import { Loader2} from "lucide-react"

export default function CalendarOverlayLoader({ label = "Loading slots..." }: { label?: string }) {
  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm">
      <div className="bg-white rounded-2xl p-8 shadow-xl border text-center">
        <div className="mb-4 flex justify-center">
          <div className="w-14 h-14 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Loader2 className="w-7 h-7 text-white animate-spin" />
          </div>
        </div>
        <h2 className="text-lg font-bold text-slate-900">{label}</h2>
        <p className="text-sm text-slate-500 mt-1">
          Please wait a moment
        </p>
      </div>
    </div>
  )
}
