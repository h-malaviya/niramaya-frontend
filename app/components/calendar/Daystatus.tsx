import React from "react";


interface DayStatusProps {
  totalAvailable: number
  isActive: boolean
}

export default function DayStatus({ totalAvailable, isActive  }: DayStatusProps) {
  
  if (!isActive) {
    return <div className="text-xs text-gray-400">Unavailable</div>
  }

  if (totalAvailable === 0) {
    return <div className="text-xs text-rose-600">Full</div>
  }
  return (
    <div className="space-y-1 mt-2">
      {!isActive ? (
        <div className="text-[10px] text-slate-400 font-medium bg-slate-50 p-1 rounded-md text-center border border-slate-100 truncate">
          Unavailable
        </div>
      ) : (
        totalAvailable && totalAvailable > 0 ? (
          <div className="bg-emerald-50 border-l-2 border-emerald-500 text-emerald-700 p-1.5 rounded-r-md text-[10px] font-bold leading-tight shadow-sm">
            {totalAvailable} Slots Available
          </div>
        ) : (
          <div className="bg-rose-50 border border-rose-100 text-rose-600 p-1 rounded-md text-[10px] font-medium text-center">
            Full
          </div>
        )
      )}
    </div>
  );
}