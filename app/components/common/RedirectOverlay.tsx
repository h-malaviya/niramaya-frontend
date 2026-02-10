'use client'

import { Loader2, ArrowRight } from 'lucide-react'

interface RedirectOverlayProps {
  title?: string
  subtitle?: string
}

export default function RedirectOverlay({
  title = 'Redirecting...',
  subtitle = 'Taking you to the next step',
}: RedirectOverlayProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gradient-to-br from-white/80 via-cyan-50/60 to-blue-50/60 backdrop-blur-md">
      <div className="relative bg-white rounded-3xl p-10 shadow-2xl border border-slate-200 text-center max-w-sm w-full animate-scale-in">
        
        {/* Glow ring */}
        <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-cyan-500 to-blue-600 blur opacity-20" />

        {/* Loader */}
        <div className="relative mb-6 flex justify-center">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-xl">
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          </div>
        </div>

        {/* Text */}
        <h2 className="relative text-xl font-bold text-slate-900">{title}</h2>
        <p className="relative text-sm text-slate-500 mt-1">{subtitle}</p>

        {/* Progress dots */}
        <div className="relative mt-4 flex items-center justify-center gap-2">
          <span className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" />
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-100" />
          <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce delay-200" />
        </div>
      </div>

      <style jsx>{`
        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        .animate-scale-in {
          animation: scale-in 0.25s ease-out;
        }
      `}</style>
    </div>
  )
}
