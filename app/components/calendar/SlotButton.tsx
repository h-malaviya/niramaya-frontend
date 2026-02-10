import React, { useState, useMemo } from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
 
} from "lucide-react";

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { DoctorSlot } from "./Types";
type TimeSlot = {
  status: "available" | "booked" | "blocked";
  time: string;
};
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export default function SlotButton({ slot, isSelected, onClick }: { slot: DoctorSlot, isSelected: boolean, onClick: () => void }) {
  const isAvailable = slot.state === "available";
  // const isBooked = slot.status === "booked";
  // const isBlocked = slot.status === "blocked";

  return (
    <button
      onClick={onClick}
      disabled={!isAvailable}
      className={cn(
        "relative py-3 px-4 rounded-xl border flex flex-col items-start transition-all duration-200",
        // Available State
        isAvailable && !isSelected && "bg-white border-gray-200 hover:border-blue-400 hover:shadow-md cursor-pointer",
        // Selected State
        isSelected && "bg-blue-600 border-blue-600 ring-2 ring-blue-200 z-10",
        // Disabled States
        (!isAvailable) && "bg-gray-50 border-transparent opacity-60 cursor-not-allowed"
      )}
    >
      <div className="flex justify-between w-full items-center mb-1">
        <Clock className={cn("w-4 h-4", isSelected ? "text-blue-200" : "text-slate-400")} />
        {!isAvailable && (
           <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
             
           </span>
        )}
      </div>
      <span className={cn(
        "text-sm font-bold",
        isSelected ? "text-white" : "text-slate-700",
        !isAvailable && "text-slate-400"
      )}>
         {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
      </span>
    </button>
  );
}