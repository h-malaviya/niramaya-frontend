import React from "react";
import { format } from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface CalendarHeaderProps {
  currentMonth: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}

export default function CalendarHeader({ 
  currentMonth, 
  onPrevMonth, 
  onNextMonth 
}: CalendarHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-slate-900">Appointments</h1>
        <p className="text-slate-500 text-sm mt-1 hidden lg:block">Select date to view availability</p>
      </div>
      <div className="flex items-center gap-2 lg:gap-4 bg-gray-50 p-1 rounded-xl border border-gray-200">
        <button 
          onClick={onPrevMonth}
          className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <span className="text-sm font-semibold w-28 lg:w-32 text-center">
          {format(currentMonth, "MMMM yyyy")}
        </span>
        <button 
          onClick={onNextMonth}
          className="p-2 hover:bg-white hover:shadow-sm rounded-lg transition-all text-slate-600"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}