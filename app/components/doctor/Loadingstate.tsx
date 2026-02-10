import React from "react";

export default function LoadingState() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-white border-2 border-slate-200 rounded-2xl overflow-hidden animate-pulse">
          {/* Header */}
          <div className="h-20 bg-slate-200"></div>
          
          {/* Content */}
          <div className="pt-16 px-6 pb-6">
            {/* Avatar placeholder */}
            <div className="absolute top-8 left-6 w-24 h-24 bg-slate-300 rounded-2xl"></div>
            
            {/* Text placeholders */}
            <div className="space-y-3">
              <div className="h-6 bg-slate-200 rounded w-3/4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
              <div className="flex gap-2">
                <div className="h-6 bg-slate-200 rounded-full w-16"></div>
                <div className="h-6 bg-slate-200 rounded-full w-16"></div>
              </div>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div className="h-16 bg-slate-100 rounded-xl"></div>
              <div className="h-16 bg-slate-100 rounded-xl"></div>
              <div className="h-16 bg-slate-100 rounded-xl col-span-2"></div>
            </div>
            
            {/* About */}
            <div className="mt-4 space-y-2">
              <div className="h-3 bg-slate-200 rounded w-full"></div>
              <div className="h-3 bg-slate-200 rounded w-5/6"></div>
            </div>
            
            {/* Buttons */}
            <div className="flex gap-3 mt-5">
              <div className="flex-1 h-12 bg-slate-100 rounded-xl"></div>
              <div className="flex-1 h-12 bg-slate-200 rounded-xl"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}