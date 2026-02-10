import React from "react";
import { format, isSameMonth, isSameDay, isBefore, startOfDay } from "date-fns";
import { cn } from "@/app/lib/utils";
import DayStatus from "./Daystatus";
import { DoctorDayAvailability } from "./Types";

interface CalendarDayProps {
  day: Date;
  currentMonth: Date;
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  dayAvailability?: DoctorDayAvailability;
}

export default function CalendarDay({ 
  day, 
  currentMonth, 
  selectedDate, 
  onDateClick ,
  dayAvailability
}: CalendarDayProps) {
  const isToday = isSameDay(day, new Date());
  const isPast = isBefore(day, startOfDay(new Date()));
  const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
  const isCurrentMonth = isSameMonth(day, currentMonth);

  const totalAvailable = dayAvailability?.slots.filter(s => s.state === "available").length ?? 0
 
  return (
    <div
      onClick={() => !isPast && onDateClick(day)}
      className={cn(
        "relative border rounded-xl p-2 lg:p-3 flex flex-col justify-between transition-all duration-200 h-full overflow-hidden",
        !isCurrentMonth && "opacity-40 bg-gray-50/50",
        isPast && "opacity-50 cursor-not-allowed bg-gray-100/80 border-gray-100",
        !isPast && "cursor-pointer hover:border-blue-400 hover:shadow-md bg-white",
        isSelected && "ring-2 ring-blue-600 border-transparent z-10 shadow-sm",
        "border-gray-100"
      )}
    >
      <div className="flex justify-between items-start">
        <span className={cn(
          "text-sm font-semibold rounded-full w-7 h-7 flex items-center justify-center transition-colors",
          isToday ? "bg-blue-600 text-white shadow-sm" : "text-slate-700",
          isSelected && !isToday && "bg-blue-100 text-blue-700"
        )}>
          {format(day, "d")}
        </span>
      </div>
      
      {!isPast && (
  <DayStatus
    totalAvailable={totalAvailable}
    isActive={dayAvailability?.is_active ?? false}
  />
)}

    </div>
  );
}