import React, { useMemo } from "react";
import { 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays 
} from "date-fns";
import DaysHeader from "./Daysheader";
import CalendarWeek from "./Calendarweek";

interface CalendarGridProps {
  currentMonth: Date
  selectedDate: Date | null
  onDateClick: (date: Date) => void
  slotsByDate: Record<string, any>
}


export default function CalendarGrid({ 
  currentMonth, 
  selectedDate, 
  onDateClick,
  slotsByDate 
}: CalendarGridProps) {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
  
    const rows = [];
    let days = [];
    let day = startDate;

    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        days.push(day);
        day = addDays(day, 1);
      }
      rows.push(days);
      days = [];
    }
    return rows;
  }, [currentMonth]);

  return (
    <>
      <DaysHeader />
      <div className="flex-1 overflow-y-auto overflow-x-hidden pr-2">
        {calendarDays.map((week, i) => (
          <CalendarWeek
            key={i}
            week={week}
            currentMonth={currentMonth}
            selectedDate={selectedDate}
            onDateClick={onDateClick}
            slotsByDate={slotsByDate}
          />
        ))}
      </div>
    </>
  );
}