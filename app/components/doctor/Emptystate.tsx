"use client";

import { Search, FilterX } from "lucide-react";

interface EmptyStateProps {
  hasFilters: boolean;
  onReset: () => void;
}

export default function EmptyState({ hasFilters, onReset }: EmptyStateProps) {
  return (
    <div className="col-span-full flex flex-col items-center justify-center py-20 px-4">
      <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6">
        {hasFilters ? (
          <FilterX className="w-12 h-12 text-slate-400" />
        ) : (
          <Search className="w-12 h-12 text-slate-400" />
        )}
      </div>
      
      <h3 className="text-2xl font-bold text-slate-800 mb-2">
        {"Not found" }
      </h3>
      
     
      
      {hasFilters && (
        <button
          onClick={onReset}
          className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:from-cyan-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
        >
          Clear All Filters
        </button>
      )}
    </div>
  );
}