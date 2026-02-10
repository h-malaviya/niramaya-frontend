'use client'


export default function CalendarSkeleton() {
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-50 p-4 lg:p-6 gap-6 overflow-hidden animate-pulse">

      {/* Calendar Section Skeleton */}
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 p-4 lg:p-6 flex flex-col h-full overflow-hidden">

        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-4">
          <div className="h-6 w-40 bg-slate-200 rounded" />
          <div className="flex gap-2">
            <div className="h-9 w-9 bg-slate-200 rounded-lg" />
            <div className="h-9 w-9 bg-slate-200 rounded-lg" />
          </div>
        </div>

        {/* Days Header Skeleton */}
        <div className="grid grid-cols-7 mb-2 border-b border-gray-100 pb-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-3 bg-slate-200 rounded mx-auto w-8" />
          ))}
        </div>

        {/* Calendar Grid Skeleton */}
        <div className="flex-1 overflow-y-auto pr-2 space-y-2">
          {Array.from({ length: 5 }).map((_, week) => (
            <div key={week} className="grid grid-cols-7 h-36 gap-2">
              {Array.from({ length: 7 }).map((_, day) => (
                <div
                  key={day}
                  className="rounded-xl border border-slate-100 bg-slate-100"
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Sidebar Skeleton */}
      <div className="w-full lg:w-[400px] bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">

        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="h-5 w-40 bg-slate-200 rounded mb-2" />
          <div className="h-3 w-24 bg-slate-100 rounded" />
        </div>

        {/* Sidebar Content */}
        <div className="flex-1 p-5 space-y-4 overflow-y-auto">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-14 bg-slate-100 rounded-xl" />
          ))}
          <div className="h-28 bg-slate-100 rounded-xl" />
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="h-10 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </div>
  )
}
