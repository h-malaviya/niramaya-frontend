import React from "react";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DaysHeader() {
  return (
    <div className="grid grid-cols-7 mb-2 border-b border-gray-100 pb-2">
      {DAYS.map((day) => (
        <div 
          key={day} 
          className="text-center text-[10px] lg:text-xs font-semibold text-slate-400 uppercase tracking-wider"
        >
          {day}
        </div>
      ))}
    </div>
  );
}