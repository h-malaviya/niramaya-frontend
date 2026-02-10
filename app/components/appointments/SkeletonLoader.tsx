import React from "react";

export default function SkeletonLoader() {
  return (
    <div className="space-y-6 w-full">
      {/* Header Controls Skeleton */}
      <div className="h-20 w-full bg-white rounded-2xl border border-slate-100 animate-pulse" />

      {/* Grid of Appointment Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div 
            key={i} 
            className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse"
          >
            {/* Top Row: Avatar and Name */}
            <div className="flex justify-between items-start mb-6">
              <div className="flex gap-3">
                <div className="w-12 h-12 bg-slate-200 rounded-full" />
                <div className="space-y-2">
                  <div className="h-4 w-24 bg-slate-200 rounded" />
                  <div className="h-3 w-16 bg-slate-100 rounded" />
                </div>
              </div>
              <div className="space-y-2 flex flex-col items-end">
                <div className="h-3 w-20 bg-cyan-100 rounded" />
                <div className="h-2 w-12 bg-slate-100 rounded" />
              </div>
            </div>

            {/* Description Placeholder */}
            <div className="space-y-2 mb-6">
              <div className="h-3 w-full bg-slate-100 rounded" />
              <div className="h-3 w-5/6 bg-slate-100 rounded" />
            </div>

            {/* Tags/Reports Placeholder */}
            <div className="flex gap-2">
              <div className="h-6 w-16 bg-slate-50 rounded-md" />
              <div className="h-6 w-16 bg-slate-50 rounded-md" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}