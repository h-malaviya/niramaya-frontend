import React from "react";
import CalendarDay from "./CalenderDay";
import { format } from "date-fns";


interface CalendarWeekProps {
  week: Date[];
  currentMonth: Date;
  selectedDate: Date | null;
  onDateClick: (date: Date) => void;
  slotsByDate: Record<string, any>;
}

export default function CalendarWeek({ 
  week, 
  currentMonth, 
  selectedDate, 
  onDateClick ,
  slotsByDate
}: CalendarWeekProps) {
  return (
    <div className="grid grid-cols-7 grid-rows-1 h-36 mt-2 gap-2">
      {week.map((day, j) => (
        <CalendarDay
          key={j}
          day={day}
          currentMonth={currentMonth}
          selectedDate={selectedDate}
          onDateClick={onDateClick}
          dayAvailability={slotsByDate[format(day, "yyyy-MM-dd")]}
        />
      ))}
    </div>
  );
}